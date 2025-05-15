
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Radio, User, Play, Headphones } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useApp } from "@/contexts/AppContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type AudioMessage = {
  id: string;
  sender: string;
  timestamp: Date;
  duration: string;
  audioUrl: string;
  type: string;
  chatId: string;
};

// Updated Group type to match GroupData from AppContext
type Group = {
  id: string;
  name: string;
  createdBy: string;
  members: string[];
  type: string;
};

const PushToTalk = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioMessages, setAudioMessages] = useState<AudioMessage[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const recordingTimeout = useRef<number | null>(null);
  const recordingInterval = useRef<number | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { currentUser, sendAudioMessage, listenToGroups } = useApp();
  const { toast } = useToast();
  
  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.onended = () => {
      setIsPlaying(null);
    };
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);
  
  // Load groups
  useEffect(() => {
    console.log("Carregando grupos...");
    
    const unsubscribe = listenToGroups((fetchedGroups) => {
      console.log("Grupos recebidos no componente:", fetchedGroups);
      
      // Verificar a estrutura dos grupos
      if (fetchedGroups.length > 0) {
        console.log("Estrutura do primeiro grupo:", JSON.stringify(fetchedGroups[0], null, 2));
      }
      
      setGroups(fetchedGroups);
      
      // Set first group as default if we don't have a selection yet
      if (fetchedGroups.length > 0 && !selectedGroup) {
        console.log("Selecionando grupo padrão:", fetchedGroups[0].id);
        setSelectedGroup(fetchedGroups[0].id);
      } else if (fetchedGroups.length === 0) {
        console.log("Nenhum grupo disponível");
        // Cria um grupo padrão temporário para evitar que o botão fique desabilitado
        setSelectedGroup("default");
      }
      
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, [listenToGroups, selectedGroup]);

  // Listen for new audio messages in the selected group
  useEffect(() => {
    if (!currentUser || !selectedGroup) return;
    
    setIsLoading(true);
    
    const chatId = selectedGroup;
    
    // Since we don't have Firebase anymore, we'll use a simplified approach
    // In a real implementation with Supabase, this would fetch messages from Supabase
    setAudioMessages([]);
    setIsLoading(false);
    
    // Return a dummy unsubscribe function
    return () => {};
  }, [selectedGroup, currentUser]);

  // Format time as mm:ss
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Clean up intervals and timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (recordingInterval.current) clearInterval(recordingInterval.current);
      if (recordingTimeout.current) clearTimeout(recordingTimeout.current);
    };
  }, []);

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return stream;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Erro de permissão",
        description: "Não foi possível acessar seu microfone. Verifique as permissões do navegador.",
        variant: "destructive"
      });
      return null;
    }
  };

  const startRecording = async () => {
    console.log("Iniciando gravação. Grupo selecionado:", selectedGroup);
    
    if (!selectedGroup || selectedGroup === "default") {
      console.log("Nenhum grupo selecionado ou usando grupo padrão temporário");
      toast({
        description: "Você está gravando sem um grupo selecionado. Sua mensagem será salva localmente.",
        variant: "default"
      });
    }
    
    // Sempre tenta acessar o microfone mesmo sem grupo selecionado
    const stream = await requestMicrophonePermission();
    if (!stream) {
      console.error("Permissão de microfone negada");
      return;
    }
    
    try {
      console.log("Permissão de microfone concedida, iniciando gravação");
      // Initialize MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      // Set up event handlers
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Start recording
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Start the recording timer
      setRecordingTime(0);
      recordingInterval.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000) as unknown as number;
  
      // Set a maximum recording time (30 seconds)
      recordingTimeout.current = window.setTimeout(() => {
        stopRecording();
      }, 30000) as unknown as number;
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Erro ao gravar",
        description: "Não foi possível iniciar a gravação de áudio.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = async () => {
    console.log("Parando gravação. Grupo selecionado:", selectedGroup);
    
    if (!mediaRecorderRef.current) {
      console.error("MediaRecorder não inicializado");
      return;
    }
    
    // Clear the recording interval
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
      recordingInterval.current = null;
    }

    // Clear the maximum recording timeout
    if (recordingTimeout.current) {
      clearTimeout(recordingTimeout.current);
      recordingTimeout.current = null;
    }

    try {
      // Create a promise that resolves when recording stops
      const recordingStoppedPromise = new Promise<Blob>((resolve) => {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            resolve(audioBlob);
          };
          mediaRecorderRef.current.stop();
        }
      });
      
      // Set recording state to false
      setIsRecording(false);
      
      // Don't add a message if recording time is too short
      if (recordingTime < 1) {
        console.log("Gravação muito curta, ignorando");
        return;
      }
      
      const audioBlob = await recordingStoppedPromise;
      const duration = formatTime(recordingTime);
      
      // Se não temos um grupo válido selecionado ou é o grupo padrão temporário, 
      // apenas reproduz o áudio localmente
      if (!selectedGroup || selectedGroup === "default" || groups.length === 0) {
        console.log("Sem grupo válido, reproduzindo áudio localmente");
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play();
        }
        
        toast({
          description: "Áudio gravado localmente. Crie um grupo para enviar mensagens de áudio.",
        });
        
        // Reset recording time
        setRecordingTime(0);
        
        // Stop all tracks of the stream
        const stream = mediaRecorderRef.current.stream;
        stream.getTracks().forEach(track => track.stop());
        
        return;
      }
      
      // Create a URL for the audio blob
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Use the selected group as the chat ID
      const chatId = selectedGroup;
      
      // Send the audio message
      await sendAudioMessage(chatId, audioUrl, duration);
      
      // Reset recording time
      setRecordingTime(0);
      
      // Stop all tracks of the stream
      const stream = mediaRecorderRef.current.stream;
      stream.getTracks().forEach(track => track.stop());
      
      toast({
        description: "Áudio gravado com sucesso e enviado para o grupo.",
      });
    } catch (error) {
      console.error("Error sending audio message:", error);
      toast({
        title: "Erro ao enviar áudio",
        description: "Não foi possível enviar sua mensagem de áudio.",
        variant: "destructive"
      });
    }
  };

  const playAudio = (audioUrl: string, messageId: string) => {
    if (isPlaying === messageId) {
      // Stop playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(null);
    } else {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      // Play new audio
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play().catch(error => {
          console.error("Error playing audio:", error);
          toast({
            description: "Não foi possível reproduzir o áudio.",
            variant: "destructive"
          });
        });
        setIsPlaying(messageId);
      }
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[600px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Push-to-Talk</h2>
        
        {isLoading ? (
          <div className="w-48 h-10 bg-secondary/30 rounded-md animate-pulse"></div>
        ) : groups.length > 0 ? (
          <Select 
            value={selectedGroup || ""}
            onValueChange={(value) => {
              console.log("Grupo selecionado:", value);
              setSelectedGroup(value);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecione um grupo" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name || `Grupo ${group.id.substring(0, 4)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="text-sm text-muted-foreground bg-secondary/30 px-3 py-2 rounded-md">
            Nenhum grupo disponível
          </div>
        )}
      </div>

      <div className="bg-secondary/30 p-2 rounded-lg mb-4">
        <p className="text-sm text-muted-foreground">
          {groups.length > 0 
            ? "Selecione um grupo e clique no botão abaixo para enviar mensagens de áudio para todo o grupo."
            : "Você não tem grupos disponíveis. Crie um grupo na tela inicial para usar o Push-to-Talk com outras pessoas."}
        </p>
        {groups.length === 0 && !isLoading && (
          <div className="mt-2 p-2 bg-blue-500/10 text-blue-600 rounded-md text-sm">
            Dica: Volte para a tela inicial e clique em "Criar Grupo" nas Ações Rápidas.
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 mb-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Carregando mensagens...</p>
          </div>
        ) : audioMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Nenhuma mensagem de áudio encontrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {audioMessages.map((message) => (
              <div 
                key={message.id} 
                className="flex items-center gap-2 p-3 rounded-lg bg-secondary"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-comtalk-500 text-white text-xs">
                    {message.sender.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-sm">{message.sender}</p>
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Headphones className="h-3 w-3 mr-1" />
                    <span>Áudio ({message.duration})</span>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-8 p-0"
                  title={isPlaying === message.id ? "Parar" : "Reproduzir áudio"}
                  onClick={() => playAudio(message.audioUrl, message.id)}
                >
                  <span className="sr-only">{isPlaying === message.id ? "Parar" : "Reproduzir"}</span>
                  {isPlaying === message.id ? (
                    <div className="w-4 h-4 rounded-sm bg-current"></div>
                  ) : (
                    <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-current border-b-[5px] border-b-transparent ml-0.5"></div>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="flex flex-col items-center">
        {isRecording && (
          <div className="text-center mb-2 text-comtalk-500 animate-pulse">
            Gravando: {formatTime(recordingTime)}
          </div>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={`w-20 h-20 mb-2 rounded-full flex items-center justify-center transition-colors ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-comtalk-500 hover:bg-comtalk-600'
                }`}
                onClick={() => isRecording ? stopRecording() : startRecording()}
                disabled={isLoading}
              >
                {isRecording ? (
                  <MicOff className="h-10 w-10 text-white" />
                ) : (
                  <Mic className="h-10 w-10 text-white" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isRecording ? "Clique para parar" : "Clique para iniciar gravação"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <p className="text-xs text-center text-muted-foreground">
          {isRecording ? "Clique para parar" : "Clique para iniciar gravação"}
        </p>
      </div>
    </div>
  );
};

export default PushToTalk;
