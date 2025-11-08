import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminFooter } from './AdminFooter';
import { useAuth } from '@/_core/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

/**
 * Layout padrão para páginas administrativas
 * 
 * Features:
 * - Sidebar com navegação
 * - Header com user menu
 * - Footer com versão
 * - Proteção de rota (apenas staff)
 * - Loading state durante autenticação
 */
export function AdminLayout({ children, title, breadcrumbs }: AdminLayoutProps) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirecionar se não autenticado
    if (!loading && !user) {
      setLocation('/login');
      return;
    }

    // Redirecionar se for ALUNO (não tem acesso ao admin)
    if (!loading && user && user.role === 'ALUNO') {
      setLocation('/dashboard');
      return;
    }
  }, [user, loading, setLocation]);

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Não renderizar se não for staff
  if (!user || user.role === 'ALUNO') {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden ml-64">
        {/* Header */}
        <AdminHeader title={title} breadcrumbs={breadcrumbs} />

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-muted/10">
          <div className="container py-6">
            {children}
          </div>
        </main>

        {/* Footer */}
        <AdminFooter />
      </div>
    </div>
  );
}
