import MainLayout from "@/components/MainLayout";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useApp } from "@/contexts/AppContext";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import { 
  MessageSquare, 
  Users, 
  Headphones, 
  Mail, 
  Calendar,
  Activity,
  Bell,
  UserPlus
} from "lucide-react";
import { AddContactDialog } from "@/components/AddContactDialog";
import { CreateGroupDialog } from "@/components/CreateGroupDialog";
import { toast } from "@/components/ui/use-toast";

// Types for our component data
type RecentActivity = {
  id: string;
  type: 'message' | 'voice' | 'group' | 'notification';
  title: string;
  content: string;
  timestamp: Date;
  sender: string;
  groupName?: string;
};

type MessageStats = {
  sent: number;
  received: number;
  groups: number;
  voice: number;
};

type ActivityData = {
  name: string;
  messages: number;
  calls: number;
};

const initialMessageStats: MessageStats = {
  sent: 0,
  received: 0,
  groups: 0,
  voice: 0
};

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [messageStats, setMessageStats] = useState<MessageStats>(initialMessageStats);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  
  const { currentUser } = useApp();
  
  // Sample activity data for demonstration when real data isn't available yet
  const generateSampleActivityData = () => {
    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];
    return days.map(day => ({
      name: day,
      messages: Math.floor(Math.random() * 30) + 5,
      calls: Math.floor(Math.random() * 10)
    }));
  };
  
  // Load all dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        if (!currentUser) {
          setError("Usuário não autenticado");
          setIsLoading(false);
          return;
        }
        
        // Fetch message statistics
        await fetchMessageStats();
        
        // Fetch recent activity (messages, calls, etc.)
        await fetchRecentActivity();
        
        // Generate sample activity data
        setActivityData(generateSampleActivityData());
        
        setError(null);
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
        setError("Erro ao carregar dados do dashboard");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, [currentUser]);
  
  // Fetch recent activity across all sources
  const fetchRecentActivity = async () => {
    if (!currentUser) return;
    
    try {
      // In a real app with Supabase, we would fetch real activity from the database
      // For now, let's create some mock data
      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'message',
          title: 'John Doe',
          content: 'Olá, como vai?',
          timestamp: new Date(),
          sender: 'John Doe'
        },
        {
          id: '2',
          type: 'voice',
          title: 'Maria Silva',
          content: 'Mensagem de áudio (0:23)',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          sender: 'Maria Silva',
          groupName: 'Equipe de Marketing'
        }
      ];
      
      setRecentActivity(mockActivity);
    } catch (error) {
      console.error("Error fetching activity:", error);
    }
  };
  
  // Fetch message statistics
  const fetchMessageStats = async () => {
    if (!currentUser) return;
    
    try {
      // In a real app with Supabase, we would fetch real statistics from the database
      // For now, let's use mock data
      setMessageStats({
        sent: 32,
        received: 48,
        groups: 5,
        voice: 12
      });
      
    } catch (error) {
      console.error("Error fetching message stats:", error);
      
      // If there's an error, still update with default values to avoid UI breaking
      setMessageStats({
        sent: 0,
        received: 0,
        groups: 0,
        voice: 0
      });
    }
  };
  
  // Render a single activity item
  const renderActivityItem = (item: RecentActivity) => {
    return (
      <div key={item.id} className="flex items-start space-x-4 py-3">
        <div className="mt-1">
          {item.type === 'message' && <MessageSquare className="h-5 w-5 text-blue-500" />}
          {item.type === 'voice' && <Headphones className="h-5 w-5 text-green-500" />}
          {item.type === 'group' && <Users className="h-5 w-5 text-purple-500" />}
          {item.type === 'notification' && <Bell className="h-5 w-5 text-amber-500" />}
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{item.title}</p>
            <span className="text-xs text-muted-foreground">
              {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {item.groupName && <span className="font-medium">[{item.groupName}] </span>}
            {item.content}
          </p>
        </div>
      </div>
    );
  };
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  // Component for the stats cards
  const StatsCard = ({ title, value, icon, description }: { 
    title: string, 
    value: number | string, 
    icon: React.ReactNode,
    description?: string
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <p>Carregando...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-red-500">{error}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Bem-vindo ao ComTalk, sua plataforma de comunicação empresarial segura.</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard 
          title="Mensagens Enviadas" 
          value={messageStats.sent}
          icon={<Mail className="h-4 w-4" />}
          description="Total no último mês"
        />
        <StatsCard 
          title="Mensagens Recebidas" 
          value={messageStats.received}
          icon={<MessageSquare className="h-4 w-4" />}
          description="Total no último mês"
        />
        <StatsCard 
          title="Mensagens de Voz" 
          value={messageStats.voice}
          icon={<Headphones className="h-4 w-4" />}
          description="Total no último mês"
        />
        <StatsCard 
          title="Grupos Ativos" 
          value={messageStats.groups}
          icon={<Users className="h-4 w-4" />}
          description="Grupos que você participa"
        />
      </div>
      
      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        {/* Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Semanal</CardTitle>
            <CardDescription>Mensagens e chamadas na última semana</CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="messages" name="Mensagens" fill="#0088FE" />
                  <Bar dataKey="calls" name="Chamadas" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Message Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Mensagens</CardTitle>
            <CardDescription>Por tipo de comunicação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Enviadas', value: messageStats.sent },
                      { name: 'Recebidas', value: messageStats.received },
                      { name: 'Áudio', value: messageStats.voice },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'Enviadas', value: messageStats.sent },
                      { name: 'Recebidas', value: messageStats.received },
                      { name: 'Áudio', value: messageStats.voice },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="overview" className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="activity">Atividade</TabsTrigger>
          <TabsTrigger value="analytics">Análise</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>Acesso direto às funcionalidades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="h-20 justify-start p-4" asChild>
                    <Link to="/messages">
                      <div className="flex flex-col items-center justify-center w-full space-y-2">
                        <MessageSquare className="h-5 w-5" />
                        <span className="text-xs">Mensagens</span>
                      </div>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-20 justify-start p-4" asChild>
                    <Link to="/push-to-talk">
                      <div className="flex flex-col items-center justify-center w-full space-y-2">
                        <Headphones className="h-5 w-5" />
                        <span className="text-xs">Push-to-Talk</span>
                      </div>
                    </Link>
                  </Button>
                  <AddContactDialog>
                    <Button variant="outline" className="h-20 justify-start p-4 w-full">
                      <div className="flex flex-col items-center justify-center w-full space-y-2">
                        <UserPlus className="h-5 w-5" />
                        <span className="text-xs">Adicionar Contato</span>
                      </div>
                    </Button>
                  </AddContactDialog>
                  <CreateGroupDialog>
                    <Button variant="outline" className="h-20 justify-start p-4 w-full">
                      <div className="flex flex-col items-center justify-center w-full space-y-2">
                        <Users className="h-5 w-5" />
                        <span className="text-xs">Criar Grupo</span>
                      </div>
                    </Button>
                  </CreateGroupDialog>
                </div>
              </CardContent>
            </Card>
            
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
                <CardDescription>Últimas interações</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[280px]">
                  <div className="space-y-2">
                    {recentActivity.length > 0 ? (
                      recentActivity.map(renderActivityItem)
                    ) : (
                      <div className="flex items-center justify-center h-[200px]">
                        <p className="text-muted-foreground">Nenhuma atividade recente encontrada</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Atividade</CardTitle>
              <CardDescription>Histórico completo de atividades</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map(renderActivityItem)
                  ) : (
                    <div className="flex items-center justify-center h-[200px]">
                      <p className="text-muted-foreground">Nenhuma atividade recente encontrada</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas de Uso</CardTitle>
              <CardDescription>Visão geral da sua atividade no ComTalk</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-8">
                <div>
                  <h3 className="text-sm font-medium mb-2">Resumo de Mensagens</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded bg-blue-500"></div>
                      <span className="text-sm">Enviadas: {messageStats.sent}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded bg-green-500"></div>
                      <span className="text-sm">Recebidas: {messageStats.received}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded bg-amber-500"></div>
                      <span className="text-sm">Áudio: {messageStats.voice}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded bg-purple-500"></div>
                      <span className="text-sm">Grupos: {messageStats.groups}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Uso do Sistema</h3>
                  <p className="text-sm text-muted-foreground">
                    Você está utilizando o ComTalk ativamente com {messageStats.sent + messageStats.received} mensagens trocadas.
                    Seu uso de áudio representa {messageStats.voice > 0 
                      ? Math.round((messageStats.voice / (messageStats.sent + messageStats.received + messageStats.voice)) * 100) 
                      : 0}% das suas comunicações.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Dicas de Produtividade</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                    <li>Experimente usar as mensagens de áudio para comunicações mais longas.</li>
                    <li>Crie grupos específicos para projetos para manter as conversas organizadas.</li>
                    <li>Utilize o calendário para agendar reuniões e chamadas importantes.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default Dashboard;
