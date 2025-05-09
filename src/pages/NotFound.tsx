
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-comtalk-900 to-comtalk-700 p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-comtalk-100 mb-6">Página não encontrada</p>
        <Button 
          onClick={() => navigate("/")}
          className="bg-comtalk-500 hover:bg-comtalk-600"
        >
          Voltar ao início
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
