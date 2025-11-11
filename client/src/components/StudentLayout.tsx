import { ReactNode } from "react";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { XPBar } from "./dashboard/XPBar";
import { AvisosManager } from "./avisos/AvisosManager";
import { WebSocketIndicator } from "./WebSocketIndicator";
import { StudentSidebar } from "./StudentSidebar";
import Footer from "./Footer";

/**
 * Layout padrão para páginas do aluno
 * 
 * Estrutura:
 * - DashboardHeader: Header branco com navegação (Metas, Questões, Simulados, etc.)
 * - XPBar: Barra roxa de gamificação (XP, Nível, Metas, Questões)
 * - AvisosManager: Sistema de avisos/notificações
 * - WebSocketIndicator: Indicador de conexão
 * - Main: Conteúdo da página
 * - Footer: Rodapé global com versão automática
 */

export function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Fixo */}
      <DashboardHeader />

      {/* XP Bar (Gamificação) */}
      <XPBar />

      {/* Avisos Manager */}
      <AvisosManager />

      {/* WebSocket Indicator */}
      <WebSocketIndicator />

      {/* Container com Sidebar + Conteúdo */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Lateral */}
        <StudentSidebar />

        {/* Conteúdo Principal */}
        <main className="flex-1 overflow-auto">
          <div className="min-h-full flex flex-col">
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
}
