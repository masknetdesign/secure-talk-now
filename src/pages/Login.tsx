
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Here we would connect to the backend for authentication
      // For now, we'll simulate a login with a valid corporate email
      if (email.includes("@") && password.length >= 6) {
        // Mock authentication simulation
        setTimeout(() => {
          // Store a mock token in localStorage
          localStorage.setItem("comtalk-user", JSON.stringify({
            name: email.split("@")[0],
            email,
            token: "mock-token-12345",
            role: "user"
          }));
          
          toast({
            title: "Login bem-sucedido",
            description: "Bem-vindo ao ComTalk!",
          });
          
          navigate("/dashboard");
        }, 1500);
      } else {
        throw new Error("Credenciais inválidas");
      }
    } catch (error) {
      toast({
        title: "Erro de autenticação",
        description: "Verifique seu e-mail e senha.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-comtalk-900 to-comtalk-700 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white">ComTalk</h1>
          <p className="text-comtalk-100 mt-1">Comunicação empresarial segura</p>
        </div>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Entre com suas credenciais corporativas
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail corporativo</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <a href="#" className="text-xs text-comtalk-500 hover:underline">
                    Esqueceu a senha?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex-col space-y-2">
              <Button 
                type="submit" 
                className="w-full bg-comtalk-500 hover:bg-comtalk-600" 
                disabled={isLoading}
              >
                {isLoading ? "Autenticando..." : "Entrar"}
              </Button>
              <p className="text-xs text-center text-muted-foreground pt-2">
                Acesso restrito a usuários autorizados.
                <br />
                Entre em contato com seu administrador para solicitar acesso.
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
