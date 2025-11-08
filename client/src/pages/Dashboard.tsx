import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { XPBar } from "@/components/dashboard/XPBar";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { NoticesCarousel } from "@/components/dashboard/NoticesCarousel";
import { CronogramaWidget } from "@/components/dashboard/widgets/CronogramaWidget";
import { QTDWidget } from "@/components/dashboard/widgets/QTDWidget";
import { StreakWidget } from "@/components/dashboard/widgets/StreakWidget";
import {
  ProgressoSemanalWidget,
  MateriaisWidget,
  RevisoesWidget,
  PlanoWidget,
  ComunidadeWidget,
} from "@/components/dashboard/widgets/OtherWidgets";

/**
 * E10: Dashboard do Aluno - Página Principal
 * 
 * A "fachada" do app onde os alunos vivem e interagem diariamente.
 * 
 * Estrutura:
 * 1. Header Fixo (com streak)
 * 2. Hero Section (saudação + CTA principal + mini-stats)
 * 3. Sistema de Avisos (carrossel) - TODO: Fase 3
 * 4. Grid de Widgets (8 widgets) - TODO: Fase 4
 * 5. Acesso Rápido (links) - TODO: Fase 4
 */

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Fixo */}
      <DashboardHeader />

      {/* XP Bar (Gamificação) */}
      <XPBar />

      {/* Conteúdo Principal */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection />

        {/* Sistema de Avisos */}
        <NoticesCarousel />

        {/* Grid de Widgets */}
        <section className="py-8">
          <div className="container">
            <h2 className="text-2xl font-bold mb-6">Seus Widgets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CronogramaWidget />
              <QTDWidget />
              <StreakWidget />
              <ProgressoSemanalWidget />
              <MateriaisWidget />
              <RevisoesWidget />
              <PlanoWidget />
              <ComunidadeWidget />
            </div>
          </div>
        </section>

        {/* Acesso Rápido - TODO: Fase 4 */}
        <section className="py-8 bg-muted/20">
          <div className="container">
            <h2 className="text-2xl font-bold mb-6">Acesso Rápido</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["Metas", "Questões", "Materiais", "Fórum"].map((link) => (
                <div
                  key={link}
                  className="bg-background border rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer"
                >
                  <p className="font-medium">{link}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2025 DOM - Domínio Operacional Modular. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
