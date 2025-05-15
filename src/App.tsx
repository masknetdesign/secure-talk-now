
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";
import PushToTalk from "./components/PushToTalk";
import AdminPage from "./pages/AdminPage";
import { useEffect, useState } from "react";
import { AppProvider, useApp } from "./contexts/AppContext";
import MainLayout from "./components/MainLayout";

const queryClient = new QueryClient();

// Componente de roteamento que depende da autenticação
const AppRoutes = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { currentUser } = useApp();

  useEffect(() => {
    // Verificar autenticação sempre que o currentUser mudar
    const checkAuth = () => {
      const userData = localStorage.getItem("comtalk-user");
      console.log("Verificando autenticação:", !!userData, !!currentUser);
      setIsAuthenticated(!!userData || !!currentUser);
    };
    
    checkAuth();
    
    // Adicionar um listener para mudanças de autenticação
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, [currentUser]);

  // Mostrar um loader enquanto verifica a autenticação
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-comtalk-900 to-comtalk-700">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      <Route 
        path="/dashboard" 
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/messages" 
        element={isAuthenticated ? <Messages /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/push-to-talk" 
        element={isAuthenticated ? 
          <MainLayout>
            <PushToTalk />
          </MainLayout> 
          : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/admin" 
        element={isAuthenticated ? 
          <MainLayout>
            <AdminPage />
          </MainLayout> 
          : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/" 
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <HashRouter>
            <AppRoutes />
          </HashRouter>
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;
