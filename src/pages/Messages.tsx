import MainLayout from "@/components/MainLayout";
import ChatView from "@/components/ChatView";

const Messages = () => {
  return (
    <MainLayout>
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Mensagens</h1>
          <p className="text-muted-foreground">Converse com seus contatos e grupos.</p>
        </div>
        
        <div className="flex-1 bg-background rounded-lg border min-h-[500px]">
          <ChatView />
        </div>
      </div>
    </MainLayout>
  );
};

export default Messages; 