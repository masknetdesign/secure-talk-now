
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import SidebarNav from "@/components/SidebarNav";
import ChatView from "@/components/ChatView";
import PushToTalk from "@/components/PushToTalk";
import { MessageSquare, LogOut } from "lucide-react";

interface User {
  name: string;
  email: string;
  token: string;
  role: string;
}

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("comtalk-user");
    if (!userData) {
      navigate("/login");
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (error) {
      console.error("Failed to parse user data:", error);
      navigate("/login");
    }
  }, [navigate]);
  
  const handleLogout = () => {
    localStorage.removeItem("comtalk-user");
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso."
    });
    navigate("/login");
  };
  
  if (!user) {
    return null; // Will redirect via the useEffect
  }
  
  return (
    <div className="flex h-screen bg-background">
      <SidebarNav user={user} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="border-b h-14 flex items-center justify-between px-4 bg-background">
          <h1 className="text-xl font-bold">ComTalk</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm mr-2 text-muted-foreground">
              Olá, {user.name}
            </span>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Sair">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="container h-full py-4">
            {children}
          </div>
        </main>
        
        {/* Footer with PTT and communication tabs */}
        <footer className="border-t bg-background">
          <div className="container mx-auto p-2">
            <Tabs defaultValue="ptt" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ptt">
                  <div className="flex items-center gap-1">
                    Push-to-Talk
                  </div>
                </TabsTrigger>
                <TabsTrigger value="chat">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" /> Chat
                  </div>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="ptt" className="mt-2">
                <PushToTalk />
              </TabsContent>
              <TabsContent value="chat" className="mt-2">
                <ChatView />
              </TabsContent>
            </Tabs>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
