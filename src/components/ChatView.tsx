
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock chat data (in a real app, this would come from an API)
const initialMessages = [
  { id: 1, sender: "João Silva", content: "Bom dia pessoal! Temos reunião às 10h hoje.", timestamp: new Date(Date.now() - 1000 * 60 * 30), isMine: false },
  { id: 2, sender: "Maria Oliveira", content: "Ok, estarei lá!", timestamp: new Date(Date.now() - 1000 * 60 * 28), isMine: false },
  { id: 3, sender: "Você", content: "Confirmo presença também.", timestamp: new Date(Date.now() - 1000 * 60 * 25), isMine: true },
  { id: 4, sender: "Carlos Santos", content: "Alguém pode me passar o link da reunião?", timestamp: new Date(Date.now() - 1000 * 60 * 15), isMine: false },
  { id: 5, sender: "Você", content: "Estou enviando por e-mail agora.", timestamp: new Date(Date.now() - 1000 * 60 * 10), isMine: true },
];

const ChatView = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [chatType, setChatType] = useState("groups");
  const { toast } = useToast();
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    const message = {
      id: Date.now(),
      sender: "Você",
      content: newMessage,
      timestamp: new Date(),
      isMine: true
    };
    
    setMessages([...messages, message]);
    setNewMessage("");
    
    // In a real app, we would send the message to the API here
    // For now, we'll just show a toast to simulate
    toast({
      description: "Mensagem enviada",
    });
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
