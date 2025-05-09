
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Users, Bell, Radio, FileText } from "lucide-react";

interface UserProps {
  name: string;
  email: string;
  token: string;
  role: string;
}

const SidebarNav = ({ user }: { user: UserProps }) => {
  const [userStatus, setUserStatus] = useState("available");
  
  // Mock data - in a real app this would come from an API
  const contacts = [
    { id: 1, name: "João Silva", status: "available", avatar: "" },
    { id: 2, name: "Maria Oliveira", status: "busy", avatar: "" },
    { id: 3, name: "Carlos Santos", status: "field", avatar: "" },
    { id: 4, name: "Ana Pereira", status: "available", avatar: "" },
  ];
  
  const groups = [
    { id: 101, name: "Equipe de TI", members: 6 },
    { id: 102, name: "Diretoria", members: 4 },
    { id: 103, name: "Operações", members: 12 },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case "available": return "bg-green-500";
      case "busy": return "bg-red-500";
      case "field": return "bg-amber-500";
      default: return "bg-gray-500";
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch(status) {
      case "available": return "Disponível";
      case "busy": return "Ocupado";
      case "field": return "Em campo";
      default: return "Offline";
    }
  };

  return (
    <aside className="w-72 bg-sidebar border-r flex flex-col h-full">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground">
              {user.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sidebar-foreground truncate">{user.name}</p>
            <p className="text-xs text-sidebar-foreground/70 truncate">{user.email}</p>
          </div>
        </div>
        
        <Select value={userStatus} onValueChange={setUserStatus}>
          <SelectTrigger className="bg-sidebar-accent text-sidebar-foreground border-sidebar-border">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">
              <div className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                Disponível
              </div>
            </SelectItem>
            <SelectItem value="busy">
              <div className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-red-500 mr-2" />
                Ocupado
              </div>
            </SelectItem>
            <SelectItem value="field">
              <div className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-amber-500 mr-2" />
                Em campo
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className="p-3">
          <h3 className="text-sm font-medium text-sidebar-foreground mb-2 flex items-center">
            <Radio className="h-4 w-4 mr-1" /> Canais
          </h3>
          <Button variant="ghost" className="w-full justify-start text-sidebar-foreground mb-1 hover:bg-sidebar-accent">
            <Bell className="h-4 w-4 mr-2" /> Avisos da Empresa
          </Button>
          <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent">
            <FileText className="h-4 w-4 mr-2" /> Documentos
          </Button>
        </div>
        
        <div className="p-3 border-t border-sidebar-border">
          <h3 className="text-sm font-medium text-sidebar-foreground mb-2 flex items-center">
            <Users className="h-4 w-4 mr-1" /> Grupos
          </h3>
          {groups.map(group => (
            <Button 
              key={group.id}
              variant="ghost" 
              className="w-full justify-between text-sidebar-foreground mb-1 hover:bg-sidebar-accent"
            >
              <span>{group.name}</span>
              <Badge variant="secondary" className="bg-sidebar-accent text-xs">
                {group.members}
              </Badge>
            </Button>
          ))}
        </div>
        
        <div className="p-3 border-t border-sidebar-border">
          <h3 className="text-sm font-medium text-sidebar-foreground mb-2 flex items-center">
            <User className="h-4 w-4 mr-1" /> Contatos
          </h3>
          {contacts.map(contact => (
            <div 
              key={contact.id}
              className="flex items-center p-2 rounded-md mb-1 hover:bg-sidebar-accent cursor-pointer"
            >
              <Avatar className="h-8 w-8 mr-2">
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                  {contact.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-sidebar-foreground">{contact.name}</p>
                <div className="flex items-center text-xs text-sidebar-foreground/70">
                  <span className={`h-1.5 w-1.5 rounded-full ${getStatusColor(contact.status)} mr-1`} />
                  {getStatusLabel(contact.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default SidebarNav;
