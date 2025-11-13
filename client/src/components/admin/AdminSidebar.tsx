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
  ChevronRight,
  MessageSquare,
  HelpCircle,
  FolderTree,
  ChevronDown,
  ChevronUp,
  Plus,
  Upload,
  ListChecks,
  FileSpreadsheet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';

interface SubNavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  roles?: string[]; // Roles permitidas (undefined = todos)
  subItems?: SubNavItem[];
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
    icon: Target,
    subItems: [
      {
        title: 'Dashboard',
        href: '/admin/metas',
        icon: BarChart3,
      },
      {
        title: 'Nova Meta',
        href: '/admin/metas/nova',
        icon: Plus,
      },
      {
        title: 'Importar Lote',
        href: '/admin/metas/importar',
        icon: Upload,
      },
    ],
  },
  {
    title: 'Questões',
    icon: HelpCircle,
    subItems: [
      {
        title: 'Listar Questões',
        href: '/admin/questoes',
        icon: ListChecks,
      },
      {
        title: 'Nova Questão',
        href: '/admin/questoes/nova',
        icon: Plus,
      },
      {
        title: 'Importar Lote',
        href: '/admin/questoes/importar',
        icon: Upload,
      },
    ],
  },
  {
    title: 'Simulados',
    href: '/admin/simulados',
    icon: FileText,
  },
  {
    title: 'Estatísticas',
    href: '/admin/estatisticas',
    icon: BarChart3,
  },
  {
    title: 'Avisos',
    icon: Megaphone,
    subItems: [
      {
        title: 'Gerenciar',
        href: '/admin/avisos',
        icon: ListChecks,
      },
      {
        title: 'Templates',
        href: '/admin/avisos/templates',
        icon: FileText,
      },
      {
        title: 'Agendamentos',
        href: '/admin/avisos/agendamentos',
        icon: BarChart3,
      },
      {
        title: 'Filas',
        href: '/admin/avisos/filas',
        icon: Upload,
      },
      {
        title: 'Analytics',
        href: '/admin/avisos/analytics',
        icon: BarChart3,
      },
    ],
  },
  {
    title: 'Logs de Auditoria',
    href: '/admin/auditoria',
    icon: FileSpreadsheet,
  },
  {
    title: 'Fórum',
    href: '/admin/forum',
    icon: MessageSquare,
  },
  {
    title: 'Árvore do Conhecimento',
    href: '/admin/arvore',
    icon: FolderTree,
  },
  {
    title: 'Materiais',
    icon: FileText,
    subItems: [
      {
        title: 'Gerenciar',
        href: '/admin/materiais',
        icon: ListChecks,
      },
      {
        title: 'Novo Material',
        href: '/admin/materiais/novo',
        icon: Plus,
      },
      {
        title: 'Estatísticas',
        href: '/admin/materiais/estatisticas',
        icon: BarChart3,
      },
    ],
  },
  {
    title: 'Configurações',
    href: '/admin/configuracoes',
    icon: Settings,
  },
  {
    title: 'Personalização',
    href: '/admin/personalizacao',
    icon: Palette,
    roles: ['MASTER'], // Apenas Master
  },
];

export function AdminSidebar() {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { user } = useAuth();

  // Filtrar itens baseado nas permissões do usuário
  const filteredItems = navItems.filter(item => {
    if (!item.roles) return true; // Sem restrição
    return user?.role && item.roles.includes(user.role);
  });

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const isItemActive = (item: NavItem) => {
    if (item.href) {
      return location === item.href || 
        (item.href !== '/admin' && location.startsWith(item.href));
    }
    if (item.subItems) {
      return item.subItems.some(sub => location === sub.href || location.startsWith(sub.href));
    }
    return false;
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300 overflow-y-auto',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4 sticky top-0 bg-background z-10">
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
      <nav className="space-y-1 p-2 pb-24">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = isItemActive(item);
          const isExpanded = expandedItems.includes(item.title);
          const hasSubItems = item.subItems && item.subItems.length > 0;

          return (
            <div key={item.title}>
              {/* Item Principal */}
              {item.href ? (
                <Link href={item.href}>
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
              ) : (
                <button
                  onClick={() => !collapsed && hasSubItems && toggleExpanded(item.title)}
                  className={cn(
                    'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.title}</span>
                      {hasSubItems && (
                        isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )
                      )}
                    </>
                  )}
                </button>
              )}

              {/* Subitens */}
              {!collapsed && hasSubItems && isExpanded && (
                <div className="ml-4 mt-1 space-y-1 border-l pl-4">
                  {item.subItems!.map((subItem) => {
                    const SubIcon = subItem.icon;
                    const isSubActive = location === subItem.href || location.startsWith(subItem.href);

                    return (
                      <Link key={subItem.href} href={subItem.href}>
                        <a
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                            isSubActive
                              ? 'bg-accent text-accent-foreground font-medium'
                              : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                          )}
                        >
                          <SubIcon className="h-4 w-4 shrink-0" />
                          <span>{subItem.title}</span>
                        </a>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Info (Footer) */}
      {!collapsed && user && (
        <div className="fixed bottom-0 left-0 w-64 border-t bg-background p-4">
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
