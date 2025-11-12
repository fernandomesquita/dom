import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/_core/hooks/useAuth";
import { BookOpen, User, FileText, HelpCircle, MessageSquare, LogOut } from "lucide-react";

/**
 * Sidebar lateral do aluno
 * 
 * Exibe itens de navegação customizáveis via admin.
 * Itens são carregados do banco de dados (tabela sidebar_items).
 * Se não houver itens no banco, usa itens padrão (fallback).
 */

// Itens padrão caso não haja itens no banco
const defaultItems = [
  {
    id: 'planos',
    label: 'Planos de Estudos',
    path: '/planos',
    icon: 'BookOpen',
    cor: 'blue',
    descricao: 'Explore todos os planos disponíveis'
  },
  {
    id: 'meus-planos',
    label: 'Seu Plano',
    path: '/meus-planos',
    icon: 'User',
    cor: 'green',
    descricao: 'Acesse seus planos matriculados'
  },
  {
    id: 'simulados',
    label: 'Simulados',
    path: '/simulados',
    icon: 'FileText',
    cor: 'purple',
    descricao: 'Faça simulados e teste seus conhecimentos'
  },
  {
    id: 'questoes',
    label: 'Questões',
    path: '/questoes',
    icon: 'HelpCircle',
    cor: 'orange',
    descricao: 'Pratique com nosso banco de questões'
  },
  {
    id: 'forum',
    label: 'Fórum',
    path: '/forum',
    icon: 'MessageSquare',
    cor: 'indigo',
    descricao: 'Participe da comunidade'
  },
];

export function StudentSidebar() {
  const [location] = useLocation();
  const { logout } = useAuth();
  const { data: items, isLoading } = trpc.sidebar.list.useQuery();

  if (isLoading) {
    return (
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="p-4 space-y-2">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </aside>
    );
  }

  // Usar itens do banco ou itens padrão como fallback
  const displayItems = items && items.length > 0 ? items : defaultItems;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col">
      <nav className="p-4 space-y-1 flex-1">
        {displayItems.map((item) => {
          const Icon = Icons[item.icon as keyof typeof Icons] as any;
          const isActive = location === item.path || location.startsWith(item.path + "/");

          return (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Link href={item.path}>
                  <a
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      "hover:bg-gray-100",
                      isActive && "bg-blue-50 text-blue-600 font-medium"
                    )}
                  >
                    {Icon && (
                      <Icon
                        className={cn(
                          "w-5 h-5",
                          isActive ? `text-${item.cor}-600` : "text-gray-500"
                        )}
                      />
                    )}
                    <span className="text-sm">{item.label}</span>
                  </a>
                </Link>
              </TooltipTrigger>
              {item.descricao && (
                <TooltipContent side="right">
                  <p>{item.descricao}</p>
                </TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </nav>

      {/* Botão de Logoff fixo no rodapé */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => logout()}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full",
            "hover:bg-red-50 hover:text-red-600 text-gray-700"
          )}
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Sair</span>
        </button>
      </div>
    </aside>
  );
}
