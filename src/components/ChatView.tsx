
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send } from "lucide-react";
import { useFirebase } from "@/contexts/FirebaseContext";

const ChatView = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatType, setChatType] = useState("groups");
  const [activeChatId, setActiveChatId] = useState("general"); // Default chat
  const { currentUser, getMessages, sendMessage } = useFirebase();
  
  // Fetch messages when component loads or when active chat changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (activeChatId) {
        const chatMessages = await getMessages(activeChatId);
        setMessages(chatMessages);
      }
    };
    
    fetchMessages();
  }, [activeChatId, getMessages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      // Send the message to Firebase
      await sendMessage(activeChatId, newMessage);
      
      // Optimistically add the message to the UI
      const message = {
        id: Date.now(),
        sender: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Você',
        content: newMessage,
        timestamp: new Date(),
        isMine: true
      };
      
      setMessages([...messages, message]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col h-80">
      <Tabs defaultValue="groups" className="w-full mb-2" onValueChange={setChatType}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="groups">Grupos</TabsTrigger>
          <TabsTrigger value="direct">Direto</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="flex-1 mb-4">
        <ScrollArea className="h-48 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
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
                      <p className="text-sm">{message.content}</p>
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
            ))}
          </div>
        </ScrollArea>
      </div>
      
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Input
          placeholder="Digite sua mensagem..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="icon" className="bg-comtalk-500 hover:bg-comtalk-600">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatView;
