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
import { useEffect, useState } from "react";
import { FirebaseProvider } from "./contexts/FirebaseContext";
import MainLayout from "./components/MainLayout";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("comtalk-user");
    setIsAuthenticated(!!userData);
  }, []);

  // Show nothing while checking authentication
  if (isAuthenticated === null) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <FirebaseProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <HashRouter>
            <Routes>
              <Route 
                path="/login" 
                element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} 
              />
              <Route 
                path="/dashboard" 
                element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/messages" 
                element={isAuthenticated ? <Messages /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/push-to-talk" 
                element={isAuthenticated ? 
                  <MainLayout>
                    <PushToTalk />
                  </MainLayout> 
                  : <Navigate to="/login" />} 
              />
              <Route 
                path="/" 
                element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </HashRouter>
        </TooltipProvider>
      </FirebaseProvider>
    </QueryClientProvider>
  );
};

export default App;
