import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  BookOpen, 
  Target, 
  Users, 
  Megaphone, 
  Palette,
  BarChart3,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  roles?: string[]; // Roles permitidas (undefined = todos)
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Planos',
    href: '/admin/planos',
    icon: BookOpen,
  },
  {
    title: 'Metas',
    href: '/admin/metas',
    icon: Target,
  },
  {
    title: 'Alunos',
    href: '/admin/alunos',
    icon: Users,
  },
  {
    title: 'Avisos',
    href: '/admin/avisos',
    icon: Megaphone,
  },
  {
    title: 'Estatísticas',
    href: '/admin/estatisticas',
    icon: BarChart3,
  },
  {
    title: 'Logs de Auditoria',
    href: '/admin/auditoria',
    icon: FileText,
  },
  {
    title: 'Personalização',
    href: '/admin/personalizacao',
    icon: Palette,
    roles: ['MASTER'], // Apenas Master
  },
  {
    title: 'Configurações',
    href: '/admin/configuracoes',
    icon: Settings,
    roles: ['MASTER', 'ADMINISTRATIVO'], // Admin+
  },
];

export function AdminSidebar() {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  // Filtrar itens baseado nas permissões do usuário
  const filteredItems = navItems.filter(item => {
    if (!item.roles) return true; // Sem restrição
    return user?.role && item.roles.includes(user.role);
  });

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <span className="font-semibold">Admin</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-1.5 hover:bg-accent"
          aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 p-2">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || 
            (item.href !== '/admin' && location.startsWith(item.href));

          return (
            <Link key={item.href} href={item.href}>
              <a
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
                title={collapsed ? item.title : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.title}</span>
                    {item.badge && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </a>
            </Link>
          );
        })}
      </nav>

      {/* User Info (Footer) */}
      {!collapsed && user && (
        <div className="absolute bottom-0 left-0 right-0 border-t p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              {user.nomeCompleto?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{user.nomeCompleto}</p>
              <p className="truncate text-xs text-muted-foreground">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
