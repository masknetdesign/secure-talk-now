import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useFirebase } from "@/contexts/FirebaseContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login = () => {
  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Register state
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { signIn, createUser, currentUser } = useFirebase();

  // Verificar se o usuário já está autenticado ao carregar a página
  useEffect(() => {
    const userData = localStorage.getItem("comtalk-user");
    if (userData || currentUser) {
      console.log("Usuário já autenticado, redirecionando...");
      navigateToDashboard();
    }
  }, [currentUser]);

  // Função para navegação direta para o dashboard
  const navigateToDashboard = () => {
    // Forçar redirecionamento direto usando window.location
    window.location.href = "/#/dashboard";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(null);

    try {
      // Fazer login com Firebase
      await signIn(email, password);
      
      // Redirecionar imediatamente
      navigateToDashboard();
    } catch (error: any) {
      console.error("Login error:", error);
      setLoginError(error.message || "Erro ao fazer login. Verifique suas credenciais.");
      setIsLoading(false);
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    setRegisterError(null);
    
    // Validar formulário
    if (registerPassword !== registerConfirmPassword) {
      setRegisterError("As senhas não coincidem.");
      setIsRegistering(false);
      return;
    }
    
    if (registerPassword.length < 6) {
      setRegisterError("A senha deve ter pelo menos 6 caracteres.");
      setIsRegistering(false);
      return;
    }
    
    try {
      // Criar usuário usando a função do contexto
      await createUser(registerEmail, registerPassword, displayName || registerEmail.split('@')[0]);
      
      // Fazer login automaticamente após o registro
      await signIn(registerEmail, registerPassword);
      
      // Redirecionar imediatamente
      navigateToDashboard();
    } catch (error: any) {
      console.error("Register error:", error);
      setRegisterError(error.message || "Erro ao criar conta. Tente novamente.");
      setIsRegistering(false);
    }
  };
  
  // Para facilitar o login durante testes
  const handleTestLogin = async () => {
    setEmail("test@example.com");
    setPassword("password123");
  };

  // Verificar se há dados de usuário no localStorage
  const userData = localStorage.getItem("comtalk-user");
  if (userData) {
    // Redirecionar imediatamente sem mostrar mensagem
    navigateToDashboard();
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-comtalk-900 to-comtalk-700 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white">ComTalk</h1>
          <p className="text-comtalk-100 mt-1">Comunicação empresarial segura</p>
        </div>
        
        <Card className="w-full">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Cadastro</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  Entre com suas credenciais corporativas
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  {loginError && (
                    <Alert variant="destructive">
                      <AlertDescription>{loginError}</AlertDescription>
                    </Alert>
                  )}
                  
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
                      <button 
                        type="button" 
                        className="text-xs text-comtalk-500 hover:underline"
                        onClick={handleTestLogin}
                      >
                        Usar credenciais de teste
                      </button>
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
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <CardHeader>
                <CardTitle>Cadastro</CardTitle>
                <CardDescription>
                  Crie sua conta para acessar o sistema
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4">
                  {registerError && (
                    <Alert variant="destructive">
                      <AlertDescription>{registerError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nome completo</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Seu nome"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email">E-mail corporativo</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="seu.email@empresa.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Senha</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">Confirmar senha</Label>
                    <Input
                      id="register-confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex-col space-y-2">
                  <Button 
                    type="submit" 
                    className="w-full bg-comtalk-500 hover:bg-comtalk-600" 
                    disabled={isRegistering}
                  >
                    {isRegistering ? "Criando conta..." : "Cadastrar"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="text-xs text-center text-muted-foreground p-4 pt-0">
            Acesso restrito a usuários autorizados.
            <br />
            Entre em contato com seu administrador para solicitar acesso administrativo.
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
