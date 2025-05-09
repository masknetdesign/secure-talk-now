import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from "@/contexts/FirebaseContext";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut } = useFirebase();
  
  useEffect(() => {
    try {
      // Check if user is logged in
      const userData = localStorage.getItem("comtalk-user");
      if (!userData) {
        console.log("Usuário não encontrado no localStorage, redirecionando para login");
        navigate("/login", { replace: true });
        return;
      }
      
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setError(null);
      } catch (error) {
        console.error("Failed to parse user data:", error);
        setError("Erro ao carregar dados do usuário");
        navigate("/login", { replace: true });
      }
    } catch (err) {
      console.error("Error in MainLayout:", err);
      setError("Erro ao carregar layout principal");
    } finally {
      setLoading(false);
    }
  }, [navigate]);
  
  const handleLogout = async () => {
    try {
      setLoading(true);
      
      // Usar a função de logout do FirebaseContext
      await signOut();
      
      // Garantir que o localStorage esteja limpo
      localStorage.removeItem("comtalk-user");
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      });
      
      // Forçar redirecionamento para login com replace
      navigate("/login", { replace: true });
      
      // Redundância para garantir o redirecionamento
      setTimeout(() => {
        if (window.location.hash !== "#/login") {
          window.location.href = "/#/login";
          window.location.reload();
        }
      }, 300);
    } catch (err) {
      console.error("Error during logout:", err);
      setLoading(false);
      toast({
        title: "Erro ao fazer logout",
        description: "Ocorreu um erro durante o logout. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-comtalk-900 to-comtalk-700">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-comtalk-900 to-comtalk-700">
        <div className="text-white text-center">
          <div className="text-red-400 font-bold mb-2">Erro</div>
          <div>{error}</div>
          <button 
            className="mt-4 bg-white text-comtalk-800 px-4 py-2 rounded-md"
            onClick={() => navigate("/login", { replace: true })}
          >
            Voltar para o login
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-comtalk-900 to-comtalk-700">
        <div className="text-white text-center">
          <div>Redirecionando para login...</div>
          <button 
            className="mt-4 bg-white text-comtalk-800 px-4 py-2 rounded-md"
            onClick={() => navigate("/login", { replace: true })}
          >
            Ir para o login agora
          </button>
        </div>
      </div>
    );
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
          {user.role === "admin" && (
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1 mr-2" 
              onClick={() => navigate("/admin")}
            >
              <ShieldAlert className="h-4 w-4" />
              Admin
            </Button>
          )}
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
