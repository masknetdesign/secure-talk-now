
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function AdminPage() {
  const { currentUser } = useApp();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminStatus, setAdminStatus] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    const checkAdminStatus = async () => {
      setLoading(true);
      try {
        if (!currentUser) {
          setAdminStatus('not-logged-in');
          navigate('/login');
          return;
        }

        // Check if currentUser has admin role
        if (currentUser.role !== 'admin') {
          setAdminStatus('not-admin');
          navigate('/dashboard');
          return;
        }

        setAdminStatus('admin');
        
        // In a real app with Supabase, we would fetch users here
        // For now we'll use mock data
        setUsers([
          {
            id: 'user-1',
            displayName: 'Admin User',
            email: 'admin@example.com',
            role: 'admin'
          },
          {
            id: 'user-2',
            displayName: 'Regular User',
            email: 'user@example.com',
            role: 'user'
          }
        ]);
        
      } catch (error) {
        console.error('Error checking admin status:', error);
        setAdminStatus('error');
      }
      setLoading(false);
    };

    checkAdminStatus();
  }, [currentUser, navigate]);

  const toggleUserRole = async (userId: string, currentRole: string) => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, role: newRole } 
          : user
      ));
      
      // In a real app with Supabase, we would update the user's role in the database here
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  if (loading) {
    return <div className="container mx-auto mt-8">Carregando...</div>;
  }

  if (adminStatus === 'not-admin') {
    return <div className="container mx-auto mt-8">Acesso negado. Você não tem permissões de administrador.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Painel de Administração</CardTitle>
          <CardDescription>Gerencie usuários e configurações do aplicativo</CardDescription>
        </CardHeader>
        <CardContent>
          <h2 className="text-xl font-bold mb-4">Gerenciar Usuários</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="p-2 text-left">Nome</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Função</th>
                  <th className="p-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-muted">
                    <td className="p-2">{user.displayName}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">{user.role || 'user'}</td>
                    <td className="p-2">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => toggleUserRole(user.id, user.role || 'user')}
                      >
                        {user.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
