
import { useState, useEffect, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useApp } from "@/contexts/AppContext";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserPlus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const formSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  members: z.array(z.string()).min(1, { message: "Selecione pelo menos um membro" }),
});

type FormValues = z.infer<typeof formSchema>;

type Contact = {
  id: string;
  name: string;
  email: string;
  userId?: string;
};

interface CreateGroupDialogProps {
  children?: ReactNode;
}

export function CreateGroupDialog({ children }: CreateGroupDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const { createGroup, getContacts, listenToContacts } = useApp();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      members: [],
    },
  });

  useEffect(() => {
    // Fetch contacts when dialog opens
    if (open) {
      const unsubscribe = listenToContacts((fetchedContacts) => {
        setContacts(fetchedContacts);
      });
      
      return () => unsubscribe();
    }
  }, [open, listenToContacts]);

  const onSubmit = async (values: FormValues) => {
    console.log("Criando grupo com valores:", values);
    setIsLoading(true);
    try {
      const groupId = await createGroup(values.name, values.members);
      console.log("Grupo criado com sucesso, ID:", groupId);
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="gap-1">
            <UserPlus className="h-4 w-4" />
            <span>Criar Grupo</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Grupo</DialogTitle>
          <DialogDescription>
            Crie um grupo e adicione membros para iniciar uma conversa em grupo.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Grupo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Equipe de Vendas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="members"
              render={() => (
                <FormItem>
                  <div className="mb-2">
                    <FormLabel>Membros</FormLabel>
                  </div>
                  <ScrollArea className="h-60 border rounded-md p-2">
                    {contacts.length === 0 ? (
                      <div className="py-2 px-1 text-center text-muted-foreground">
                        Sem contatos disponíveis
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {contacts.map((contact) => (
                          <FormField
                            key={contact.id}
                            control={form.control}
                            name="members"
                            render={({ field }) => {
                              const userId = contact.userId || contact.id;
                              return (
                                <FormItem
                                  key={userId}
                                  className="flex flex-row items-center space-x-2 space-y-0 p-1 hover:bg-secondary rounded-md"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(userId)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, userId])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== userId
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarFallback>
                                        {contact.name.substring(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="text-sm font-medium leading-none">
                                        {contact.name}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {contact.email}
                                      </div>
                                    </div>
                                  </div>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isLoading || contacts.length === 0}>
                {isLoading ? "Criando..." : "Criar Grupo"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
