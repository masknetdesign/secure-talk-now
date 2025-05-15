import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, MoreVertical, User, Radio, Mic } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Skeleton } from "@/components/ui/skeleton";

type Chat = {
  id: string;
  name: string;
  type: 'direct' | 'group';
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount?: number;
};

type Message = {
  id: string;
  sender: string;
  senderId: string;
  content?: string;
  audioUrl?: string;
  duration?: string;
  timestamp: Date;
  isMine: boolean;
  type: 'text' | 'audio';
};

const ChatView = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatType, setChatType] = useState<'groups' | 'direct'>('groups');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChatName, setActiveChatName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Push-to-talk states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);
  
  const { 
    currentUser, 
    listenToMessages, 
    sendMessage,
    sendAudioMessage,
    getGroups, 
    getContacts, 
    listenToGroups, 
    listenToContacts,
    createChat
  } = useApp();
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Load chats (groups or direct) when component mounts or when chatType changes
  useEffect(() => {
    setLoading(true);
    
    let unsubscribe: (() => void) | undefined;
    
    const fetchChats = async () => {
      try {
        if (chatType === 'groups') {
          // Get groups and subscribe to real-time updates
          unsubscribe = listenToGroups((groups) => {
            const formattedGroups = groups.map(group => ({
              id: group.id,
              name: group.name,
              type: 'group' as const,
              lastMessage: 'Sem mensagens recentes',
              lastMessageTime: new Date()
            }));
            setChats(formattedGroups);
            setLoading(false);
          });
        } else {
          // Get contacts and subscribe to real-time updates
          unsubscribe = listenToContacts((contacts) => {
            const formattedContacts = contacts.map(contact => ({
              id: contact.userId || contact.id,
              name: contact.name,
              type: 'direct' as const,
              lastMessage: 'Sem mensagens recentes',
              lastMessageTime: new Date(),
            }));
            setChats(formattedContacts);
            setLoading(false);
          });
        }
      } catch (error) {
        console.error(`Error fetching ${chatType}:`, error);
        setLoading(false);
      }
    };
    
    fetchChats();
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [chatType, listenToGroups, listenToContacts]);
  
  // Subscribe to messages when active chat changes
  useEffect(() => {
    if (!activeChatId) return;
    
    setLoading(true);
    
    const unsubscribe = listenToMessages(activeChatId, (newMessages) => {
      setMessages(newMessages);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [activeChatId, listenToMessages]);
  
  // Function to format recording time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  useEffect(() => {
    // Check microphone permissions when component mounts
    const checkMicrophonePermission = async () => {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        console.log("Status de permissão do microfone:", permissionStatus.state);
      } catch (error) {
        console.error("Erro ao verificar permissão do microfone:", error);
      }
    };
    
    checkMicrophonePermission();
  }, []);
  
  // Start recording function
  const startRecording = async () => {
    try {
      console.log("Tentando iniciar gravação...");
      
      // Force permission prompt if needed
      await navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          console.log("Permissão de áudio concedida");
          
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];
          
          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
            }
          };
          
          mediaRecorder.onstop = async () => {
            console.log("Gravação finalizada");
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            setAudioURL(audioUrl);
            
            if (activeChatId) {
              await uploadAndSendAudio(audioBlob);
            }
            
            // Stop all tracks to release microphone
            stream.getTracks().forEach(track => track.stop());
          };
          
          // Start recording
          mediaRecorder.start();
          setIsRecording(true);
          console.log("Gravação iniciada");
          
          // Start timer
          let seconds = 0;
          recordingTimerRef.current = window.setInterval(() => {
            seconds++;
            setRecordingTime(seconds);
          }, 1000);
        })
        .catch(error => {
          console.error("Erro ao acessar microfone:", error);
          alert("Não foi possível acessar o microfone. Por favor, verifique as permissões do navegador.");
        });
    } catch (error) {
      console.error("Erro ao acessar microfone:", error);
      alert("Erro ao iniciar gravação. Verifique as permissões do seu navegador.");
    }
  };
  
  // Stop recording function
  const stopRecording = () => {
    console.log("Tentando parar gravação...");
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log("Gravação parada");
      
      // Clear timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };
  
  // Toggle recording for click events
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  // Upload audio to storage and send message
  const uploadAndSendAudio = async (audioBlob: Blob) => {
    if (!activeChatId || !currentUser) return;
    
    try {
      const durationStr = formatTime(recordingTime);
      
      // Create a URL to represent the audio blob
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Send audio message with local URL
      await sendAudioMessage(activeChatId, audioUrl, durationStr);
      
      // Reset recording time
      setRecordingTime(0);
      
    } catch (error) {
      console.error("Error uploading audio:", error);
    }
  };
  
  // Cleanup function
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);
  
  const handleChatSelect = async (chat: Chat) => {
    setActiveChatId(chat.id);
    setActiveChatName(chat.name);
    
    if (chat.type === 'direct') {
      // Para contatos, verificamos se já existe um chat ou criamos um novo
      try {
        // Obtém ou cria um chat com este contato
        const chatId = await createChat(chat.id, chat.name);
        setActiveChatId(chatId);
      } catch (error) {
        console.error("Error creating/finding chat:", error);
      }
    }
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !activeChatId) return;
    
    try {
      await sendMessage(activeChatId, newMessage);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  const renderMessage = (message: Message) => {
    return (
      <div 
        key={message.id} 
        className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}
      >
        <div className={`flex ${message.isMine ? 'flex-row-reverse' : 'flex-row'} max-w-[80%] gap-2`}>
          {!message.isMine && (
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-comtalk-500 text-white text-xs">
                {message.sender.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          
          <div>
            <div 
              className={`rounded-lg py-2 px-3 ${
                message.isMine 
                  ? 'bg-comtalk-500 text-white' 
                  : 'bg-secondary text-foreground'
              }`}
            >
              {!message.isMine && (
                <div className="font-medium text-xs mb-1">{message.sender}</div>
              )}
              
              {message.type === 'text' && (
                <p className="text-sm">{message.content}</p>
              )}
              
              {message.type === 'audio' && (
                <div className="flex items-center gap-2">
                  <audio 
                    src={message.audioUrl} 
                    controls 
                    className="max-w-full h-8 text-comtalk-500" 
                    controlsList="nodownload" 
                  />
                  <span className="text-xs">{message.duration}</span>
                </div>
              )}
            </div>
            <div 
              className={`text-xs text-muted-foreground mt-1 ${
                message.isMine ? 'text-right' : 'text-left'
              }`}
            >
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="groups" className="w-full mb-4" onValueChange={(value) => setChatType(value as 'groups' | 'direct')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="groups">Grupos</TabsTrigger>
          <TabsTrigger value="direct">Direto</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="flex flex-1 h-full overflow-hidden">
        {/* Chat list sidebar */}
        <div className="w-1/3 border-r pr-2">
          <ScrollArea className="h-full pr-2">
            {loading && chats.length === 0 ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 p-2 mb-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-1">
                {chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => handleChatSelect(chat)}
                    className={`flex items-center gap-2 p-2 w-full text-left rounded-md hover:bg-secondary ${
                      activeChatId === chat.id ? 'bg-secondary' : ''
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      {chat.type === 'direct' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Radio className="h-4 w-4" />
                      )}
                      <AvatarFallback className="bg-comtalk-500 text-white text-xs">
                        {chat.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                      <div className="font-medium text-sm truncate">{chat.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {chat.lastMessage}
                      </div>
                    </div>
                  </button>
                ))}
                
                {chats.length === 0 && !loading && (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    {chatType === 'groups' ? 'Sem grupos disponíveis' : 'Sem contatos disponíveis'}
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
        
        {/* Message area */}
        <div className="flex-1 flex flex-col pl-2">
          {/* Chat header */}
          {activeChatId && (
            <div className="flex justify-between items-center mb-2 pb-1 border-b">
              <h3 className="font-medium text-sm">{activeChatName}</h3>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {/* Messages */}
          <div className="flex-1 mb-4 overflow-hidden">
            {activeChatId ? (
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                        {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full" />}
                        <div className="max-w-[80%] mx-2">
                          <Skeleton className={`h-12 w-32 rounded-lg ${i % 2 === 0 ? 'ml-auto' : ''}`} />
                          <Skeleton className={`h-3 w-16 mt-1 ${i % 2 === 0 ? 'ml-auto' : ''}`} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      {messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                          <p className="text-sm text-muted-foreground">Sem mensagens</p>
                        </div>
                      ) : (
                        messages.map(renderMessage)
                      )}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>
              </ScrollArea>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Selecione um chat para conversar</p>
              </div>
            )}
          </div>
          
          {/* Message input */}
          {activeChatId && (
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
                disabled={loading || isRecording}
              />
              
              {/* Push-to-talk button */}
              <Button
                type="button"
                size="icon"
                variant={isRecording ? "destructive" : "outline"}
                className={`relative ${isRecording ? "ptt-button animate-pulse bg-red-500" : ""}`}
                disabled={loading || !activeChatId}
                onClick={toggleRecording}
                onMouseLeave={isRecording ? stopRecording : undefined}
                title={isRecording ? "Clique para parar" : "Clique para falar"}
              >
                <Mic className={`h-4 w-4 ${isRecording ? "text-white" : ""}`} />
                {isRecording && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-destructive text-white border border-destructive rounded-md py-1 px-2 text-xs whitespace-nowrap">
                    Gravando: {formatTime(recordingTime)}
                  </div>
                )}
              </Button>
              
              <Button 
                type="submit" 
                size="icon" 
                className="bg-comtalk-500 hover:bg-comtalk-600"
                disabled={!newMessage.trim() || loading || isRecording}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatView;
