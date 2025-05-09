import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Home, 
  MessageSquare, 
  Users, 
  Radio, 
  Bell, 
  CalendarDays, 
  Settings,
  Search,
  User
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { AddContactDialog } from "./AddContactDialog";
import { CreateGroupDialog } from "./CreateGroupDialog";
import { useFirebase } from "@/contexts/FirebaseContext";

interface User {
  name: string;
  email: string;
  token: string;
  role: string;
  photoURL?: string;
}

interface SidebarNavProps {
  user: User;
}

const SidebarNav = ({ user }: SidebarNavProps) => {
  const location = useLocation();
  const { listenToContacts, listenToGroups } = useFirebase();
  const [contacts, setContacts] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState<'chats' | 'groups' | 'contacts'>('chats');
  
  // Listen for contacts and groups
  useEffect(() => {
    const contactsUnsubscribe = listenToContacts((fetchedContacts) => {
      setContacts(fetchedContacts);
    });
    
    const groupsUnsubscribe = listenToGroups((fetchedGroups) => {
      setGroups(fetchedGroups);
    });
    
    return () => {
      contactsUnsubscribe();
      groupsUnsubscribe();
    };
  }, [listenToContacts, listenToGroups]);
  
  // Filter contacts and groups based on search term
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Display content based on active section
  const renderContent = () => {
    switch(activeSection) {
      case 'contacts':
        return (
          <div className="space-y-1 px-2">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-sm">Contatos</h3>
              <AddContactDialog />
            </div>
            {filteredContacts.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                {searchTerm ? "Nenhum contato encontrado" : "Nenhum contato adicionado"}
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <Button
                  key={contact.id}
                  variant="ghost"
                  className="w-full justify-start font-normal"
                  asChild
                >
                  <Link to={`/chat/${contact.userId || contact.id}`}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        {contact.photoURL ? (
                          <AvatarImage src={contact.photoURL} alt={contact.name} />
                        ) : (
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span className="truncate">{contact.name}</span>
                    </div>
                  </Link>
                </Button>
              ))
            )}
          </div>
        );
      case 'groups':
        return (
          <div className="space-y-1 px-2">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-sm">Grupos</h3>
              <CreateGroupDialog />
            </div>
            {filteredGroups.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                {searchTerm ? "Nenhum grupo encontrado" : "Nenhum grupo criado"}
              </div>
            ) : (
              filteredGroups.map((group) => (
                <Button
                  key={group.id}
                  variant="ghost"
                  className="w-full justify-start font-normal"
                  asChild
                >
                  <Link to={`/group/${group.id}`}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>
                          <Radio className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">{group.name}</span>
                    </div>
                  </Link>
                </Button>
              ))
            )}
          </div>
        );
      default: // 'chats'
        return (
          <div className="space-y-1 px-2">
            <h3 className="font-medium text-sm mb-2">Conversas Recentes</h3>
            <div className="text-center py-4 text-sm text-muted-foreground">
              {searchTerm ? "Nenhuma conversa encontrada" : "Nenhuma conversa recente"}
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className="w-64 border-r h-full flex flex-col bg-background">
      {/* User Profile */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar>
            {user.photoURL ? (
              <AvatarImage src={user.photoURL} alt={user.name} />
            ) : (
              <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            )}
          </Avatar>
          <div className="overflow-hidden">
            <p className="font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      </div>
      
      {/* Search */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Pesquisar..." 
            className="pl-8" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Section Tabs */}
      <div className="flex border-b">
        <Button 
          variant="ghost" 
          className={`flex-1 rounded-none ${activeSection === 'chats' ? 'border-b-2 border-primary' : ''}`}
          onClick={() => setActiveSection('chats')}
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          <span className="text-xs">Chats</span>
        </Button>
        <Button 
          variant="ghost" 
          className={`flex-1 rounded-none ${activeSection === 'groups' ? 'border-b-2 border-primary' : ''}`}
          onClick={() => setActiveSection('groups')}
        >
          <Radio className="h-4 w-4 mr-1" />
          <span className="text-xs">Grupos</span>
        </Button>
        <Button 
          variant="ghost" 
          className={`flex-1 rounded-none ${activeSection === 'contacts' ? 'border-b-2 border-primary' : ''}`}
          onClick={() => setActiveSection('contacts')}
        >
          <Users className="h-4 w-4 mr-1" />
          <span className="text-xs">Contatos</span>
        </Button>
      </div>
      
      {/* Chat/Contact/Group List */}
      <ScrollArea className="flex-1 py-2">
        {renderContent()}
      </ScrollArea>
      
      {/* Navigation */}
      <div className="mt-auto border-t p-2">
        <div className="grid grid-cols-4 gap-1">
          <Button 
            variant={location.pathname === '/dashboard' ? 'secondary' : 'ghost'} 
            size="icon" 
            className="h-10 w-full" 
            asChild
          >
            <Link to="/dashboard">
              <Home className="h-5 w-5" />
            </Link>
          </Button>
          <Button 
            variant={location.pathname === '/messages' ? 'secondary' : 'ghost'} 
            size="icon" 
            className="h-10 w-full" 
            asChild
          >
            <Link to="/messages">
              <MessageSquare className="h-5 w-5" />
            </Link>
          </Button>
          <Button 
            variant={location.pathname === '/calendar' ? 'secondary' : 'ghost'} 
            size="icon" 
            className="h-10 w-full" 
            asChild
          >
            <Link to="/calendar">
              <CalendarDays className="h-5 w-5" />
            </Link>
          </Button>
          <Button 
            variant={location.pathname === '/settings' ? 'secondary' : 'ghost'} 
            size="icon" 
            className="h-10 w-full" 
            asChild
          >
            <Link to="/settings">
              <Settings className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SidebarNav;
