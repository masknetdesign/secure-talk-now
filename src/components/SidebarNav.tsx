
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { User, Users, Bell, Radio, FileText, UserPlus, UserRound, CirclePlus, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useMediaQuery } from "@/hooks/use-mobile";

interface UserProps {
  name: string;
  email: string;
  token: string;
  role: string;
}

const SidebarNav = ({ user }: { user: UserProps }) => {
  const [userStatus, setUserStatus] = useState("available");
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 640px)");
  
  // Contact form schema
  const contactFormSchema = z.object({
    name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
    email: z.string().email({ message: "Email inválido" }),
    department: z.string().optional(),
  });

  // Group form schema
  const groupFormSchema = z.object({
    name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
    description: z.string().optional(),
  });

  const contactForm = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      department: "",
    },
  });

  const groupForm = useForm<z.infer<typeof groupFormSchema>>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });
  
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

  const onContactSubmit = (values: z.infer<typeof contactFormSchema>) => {
    // In a real app, here we would make an API call to add the contact
    console.log("Adding contact:", values);
    toast({
      title: "Contato adicionado",
      description: `${values.name} foi adicionado aos seus contatos.`
    });
    contactForm.reset();
    setContactDialogOpen(false);
  };

  const onGroupSubmit = (values: z.infer<typeof groupFormSchema>) => {
    // In a real app, here we would make an API call to create the group
    console.log("Creating group:", values);
    toast({
      title: "Grupo criado",
      description: `O grupo ${values.name} foi criado com sucesso.`
    });
    groupForm.reset();
    setGroupDialogOpen(false);
  };

  // Component for dialog or drawer based on screen size
  const ContactDialog = () => {
    if (isMobile) {
      return (
        <Drawer open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Adicionar Contato</DrawerTitle>
              <DrawerDescription>Adicione um novo contato à sua lista</DrawerDescription>
            </DrawerHeader>
            <Form {...contactForm}>
              <form onSubmit={contactForm.handleSubmit(onContactSubmit)} className="space-y-4 px-4">
                <FormField
                  control={contactForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do contato" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={contactForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="email@empresa.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={contactForm.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departamento</FormLabel>
                      <FormControl>
                        <Input placeholder="TI, RH, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DrawerFooter>
                  <Button type="submit">Adicionar Contato</Button>
                  <DrawerClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DrawerClose>
                </DrawerFooter>
              </form>
            </Form>
          </DrawerContent>
        </Drawer>
      );
    }

    return (
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Contato</DialogTitle>
            <DialogDescription>Adicione um novo contato à sua lista</DialogDescription>
          </DialogHeader>
          <Form {...contactForm}>
            <form onSubmit={contactForm.handleSubmit(onContactSubmit)} className="space-y-4">
              <FormField
                control={contactForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do contato" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={contactForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@empresa.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={contactForm.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departamento</FormLabel>
                    <FormControl>
                      <Input placeholder="TI, RH, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Adicionar Contato</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  };

  // Component for dialog or drawer based on screen size
  const GroupDialog = () => {
    if (isMobile) {
      return (
        <Drawer open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Criar Grupo</DrawerTitle>
              <DrawerDescription>Crie um novo grupo de comunicação</DrawerDescription>
            </DrawerHeader>
            <Form {...groupForm}>
              <form onSubmit={groupForm.handleSubmit(onGroupSubmit)} className="space-y-4 px-4">
                <FormField
                  control={groupForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Grupo</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do grupo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={groupForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Input placeholder="Descrição do grupo (opcional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DrawerFooter>
                  <Button type="submit">Criar Grupo</Button>
                  <DrawerClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DrawerClose>
                </DrawerFooter>
              </form>
            </Form>
          </DrawerContent>
        </Drawer>
      );
    }

    return (
      <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Grupo</DialogTitle>
            <DialogDescription>Crie um novo grupo de comunicação</DialogDescription>
          </DialogHeader>
          <Form {...groupForm}>
            <form onSubmit={groupForm.handleSubmit(onGroupSubmit)} className="space-y-4">
              <FormField
                control={groupForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Grupo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do grupo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={groupForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input placeholder="Descrição do grupo (opcional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Criar Grupo</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
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
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-sidebar-foreground flex items-center">
              <Users className="h-4 w-4 mr-1" /> Grupos
            </h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full hover:bg-sidebar-accent"
              onClick={() => setGroupDialogOpen(true)}
            >
              <CirclePlus className="h-4 w-4 text-sidebar-foreground" />
            </Button>
          </div>
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
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-sidebar-foreground flex items-center">
              <User className="h-4 w-4 mr-1" /> Contatos
            </h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full hover:bg-sidebar-accent"
              onClick={() => setContactDialogOpen(true)}
            >
              <UserPlus className="h-4 w-4 text-sidebar-foreground" />
            </Button>
          </div>
          
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

      {/* Render dialogs */}
      <ContactDialog />
      <GroupDialog />
    </aside>
  );
};

export default SidebarNav;
