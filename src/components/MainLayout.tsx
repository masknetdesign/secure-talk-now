import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    try {
      // Check if user is logged in
      const userData = localStorage.getItem("comtalk-user");
      if (!userData) {
        navigate("/login");
        return;
      }
      
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setError(null);
      } catch (error) {
        console.error("Failed to parse user data:", error);
        setError("Erro ao carregar dados do usuário");
        navigate("/login");
      }
    } catch (err) {
      console.error("Error in MainLayout:", err);
      setError("Erro ao carregar layout principal");
    } finally {
      setLoading(false);
    }
  }, [navigate]);
  
  const handleLogout = () => {
    try {
      localStorage.removeItem("comtalk-user");
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      });
      navigate("/login");
    } catch (err) {
      console.error("Error during logout:", err);
      toast({
        title: "Erro ao fazer logout",
        description: "Ocorreu um erro durante o logout. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  if (loading) {
    return <div className="p-4">Carregando...</div>;
  }
  
  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!user) {
    return <div className="p-4">Redirecionando para login...</div>;
  }
  
  return (
    <div className="flex flex-col h-screen bg-background">
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
      <main className="flex-1 overflow-auto p-4">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
