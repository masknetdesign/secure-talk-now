
import MainLayout from "@/components/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, MapPin, Radio, UserRound } from "lucide-react";

const Dashboard = () => {
  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Bem-vindo ao ComTalk, sua plataforma de comunicação empresarial segura.</p>
      </div>
      
      <Tabs defaultValue="recent">
        <TabsList>
          <TabsTrigger value="recent">Recentes</TabsTrigger>
          <TabsTrigger value="announcements">Avisos</TabsTrigger>
          <TabsTrigger value="channels">Canais</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Atividade Recente</CardTitle>
                <CardDescription>Suas últimas interações</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-comtalk-500 text-white">JS</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">João Silva</p>
                      <p className="text-sm text-muted-foreground">Enviou um áudio (0:08)</p>
                      <p className="text-xs text-muted-foreground">Há 30 minutos</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Radio className="h-5 w-5 mt-1 text-comtalk-500" />
                    <div>
                      <p className="font-medium">Equipe de TI</p>
                      <p className="text-sm text-muted-foreground">3 novas mensagens</p>
                      <p className="text-xs text-muted-foreground">Há 15 minutos</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Bell className="h-5 w-5 mt-1 text-comtalk-500" />
                    <div>
                      <p className="font-medium">Aviso da Empresa</p>
                      <p className="text-sm text-muted-foreground">Manutenção programada</p>
                      <p className="text-xs text-muted-foreground">Há 1 hora</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Próximos Eventos</CardTitle>
                <CardDescription>Calendário integrado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 mt-1 text-comtalk-500" />
                    <div>
                      <p className="font-medium">Reunião de Equipe</p>
                      <p className="text-sm text-muted-foreground">Hoje, 14:00 - 15:00</p>
                      <p className="text-xs text-muted-foreground">Sala de Conferência A</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 mt-1 text-comtalk-500" />
                    <div>
                      <p className="font-medium">Treinamento</p>
                      <p className="text-sm text-muted-foreground">Amanhã, 09:00 - 11:00</p>
                      <p className="text-xs text-muted-foreground">Online</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Membros Online</CardTitle>
                <CardDescription>10 usuários ativos agora</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Avatar className="h-10 w-10 border-2 border-green-500">
                    <AvatarFallback className="bg-comtalk-600 text-white">JS</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-10 w-10 border-2 border-green-500">
                    <AvatarFallback className="bg-comtalk-600 text-white">MO</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-10 w-10 border-2 border-red-500">
                    <AvatarFallback className="bg-comtalk-600 text-white">CS</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-10 w-10 border-2 border-green-500">
                    <AvatarFallback className="bg-comtalk-600 text-white">AP</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-10 w-10 border-2 border-amber-500">
                    <AvatarFallback className="bg-comtalk-600 text-white">LP</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-10 w-10 border-2 border-green-500">
                    <AvatarFallback className="bg-comtalk-600 text-white">RT</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm" className="h-10">
                    +4
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Equipes em Campo</CardTitle>
              <CardDescription>Localização de equipes externas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-2 p-3 border rounded-lg">
                    <MapPin className="h-5 w-5 mt-1 text-comtalk-500" />
                    <div>
                      <p className="font-medium">Equipe Manutenção A</p>
                      <p className="text-sm text-muted-foreground">Filial Norte</p>
                      <div className="flex items-center mt-2 gap-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-comtalk-500 text-white text-xs">CS</AvatarFallback>
                        </Avatar>
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-comtalk-500 text-white text-xs">LP</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">+2</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 p-3 border rounded-lg">
                    <MapPin className="h-5 w-5 mt-1 text-comtalk-500" />
                    <div>
                      <p className="font-medium">Equipe Vendas</p>
                      <p className="text-sm text-muted-foreground">Cliente ABC Ltda.</p>
                      <div className="flex items-center mt-2 gap-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-comtalk-500 text-white text-xs">MO</AvatarFallback>
                        </Avatar>
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-comtalk-500 text-white text-xs">AP</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 p-3 border rounded-lg">
                    <MapPin className="h-5 w-5 mt-1 text-comtalk-500" />
                    <div>
                      <p className="font-medium">Equipe Suporte</p>
                      <p className="text-sm text-muted-foreground">Centro de Dados</p>
                      <div className="flex items-center mt-2 gap-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-comtalk-500 text-white text-xs">JS</AvatarFallback>
                        </Avatar>
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-comtalk-500 text-white text-xs">RT</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">+3</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="announcements" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Avisos da Empresa</CardTitle>
              <CardDescription>Comunicados importantes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-l-4 border-comtalk-500 pl-4">
                  <h3 className="font-semibold">Manutenção do Sistema</h3>
                  <p className="text-sm mt-1">O sistema estará indisponível para manutenção programada no próximo domingo, das 23h00 às 05h00.</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-muted-foreground">Departamento de TI</span>
                    <span className="text-xs text-muted-foreground">12/05/2023</span>
                  </div>
                </div>
                
                <div className="border-l-4 border-comtalk-500 pl-4">
                  <h3 className="font-semibold">Nova Política de Segurança</h3>
                  <p className="text-sm mt-1">A partir da próxima semana, todos os funcionários deverão utilizar autenticação de dois fatores para acessar os sistemas da empresa.</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-muted-foreground">Segurança da Informação</span>
                    <span className="text-xs text-muted-foreground">10/05/2023</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="channels" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Canais Disponíveis</CardTitle>
                <CardDescription>Canais de comunicação ativos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <UserRound className="mr-2 h-4 w-4" />
                    <span>Suporte Técnico</span>
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Radio className="mr-2 h-4 w-4" />
                    <span>Operações</span>
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Radio className="mr-2 h-4 w-4" />
                    <span>Comercial</span>
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Avisos Gerais</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default Dashboard;
