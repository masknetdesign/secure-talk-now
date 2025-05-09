
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Radio, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useFirebase } from "@/contexts/FirebaseContext";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

const PushToTalk = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioMessages, setAudioMessages] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("all");
  const recordingTimeout = useRef<number | null>(null);
  const recordingInterval = useRef<number | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const { currentUser, sendAudioMessage } = useFirebase();

  // Listen for new audio messages in the selected group
  useEffect(() => {
    if (!currentUser) return;

    const chatId = selectedGroup === "all" ? "general" : selectedGroup;
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const messagesQuery = query(
      messagesRef, 
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const newAudioMessages = snapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            sender: data.sender,
            timestamp: data.timestamp?.toDate() || new Date(),
            duration: data.duration || "0:00",
            audioUrl: data.audioUrl,
            type: data.type
          };
        })
        .filter(msg => msg.type === 'audio');

      setAudioMessages(newAudioMessages);
    });

    return () => unsubscribe();
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

  const startRecording = () => {
    // In a real app, we would use the Web Audio API here
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
  };

  const stopRecording = async () => {
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

    // In a real app, we would stop recording and save the audio
    setIsRecording(false);

    // Don't add a message if recording time is too short
    if (recordingTime < 1) {
      return;
    }

    try {
      // This is where you would upload the audio file to Firebase Storage
      // For now, we'll just simulate it
      const audioUrl = `https://example.com/audio_${Date.now()}.mp3`;
      const duration = formatTime(recordingTime);
      
      // Use the selected group as the chat ID, or "general" if "all" is selected
      const chatId = selectedGroup === "all" ? "general" : selectedGroup;
      
      // Send the audio message to Firebase
      await sendAudioMessage(chatId, audioUrl, duration);
      
      // Reset recording time
      setRecordingTime(0);
    } catch (error) {
      console.error("Error sending audio message:", error);
    }
  };

  return (
    <div className="flex flex-col h-80">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Push-to-Talk</h2>
        <select 
          className="bg-secondary text-sm rounded-md p-1"
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          <option value="all">Todos</option>
          <option value="ti">Equipe de TI</option>
          <option value="ops">Operações</option>
          <option value="dir">Diretoria</option>
        </select>
      </div>

      <ScrollArea className="flex-1 mb-4">
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
                  <Radio className="h-3 w-3 mr-1" />
                  <span>Áudio ({message.duration})</span>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 w-8 p-0"
                title="Reproduzir áudio"
                onClick={() => {
                  // In a real app, we would play the audio here
                  console.log("Playing audio:", message.audioUrl);
                }}
              >
                <span className="sr-only">Reproduzir</span>
                <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-current border-b-[5px] border-b-transparent ml-0.5"></div>
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="flex flex-col items-center">
        {isRecording && (
          <div className="text-center mb-2 text-comtalk-500 animate-pulse">
            Gravando: {formatTime(recordingTime)}
          </div>
        )}

        <button
          className="ptt-button w-20 h-20 mb-2"
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
        >
          {isRecording ? (
            <MicOff className="h-10 w-10" />
          ) : (
            <Mic className="h-10 w-10" />
          )}
        </button>

        <p className="text-xs text-center text-muted-foreground">
          Mantenha pressionado para falar
        </p>
      </div>
    </div>
  );
};

export default PushToTalk;
