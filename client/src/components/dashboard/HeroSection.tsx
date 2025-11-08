import { Play, ArrowRight, Brain, BookOpen, Target, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

/**
 * E10: Hero Section
 * 
 * Seção principal do dashboard com:
 * - Mensagem contextual (Bom dia, Fernando!)
 * - CTA Principal ANIMADO (4 estados)
 * - Mini-estatísticas do dia (3 cards)
 * - Próxima ação sugerida
 */

export function HeroSection() {
  const [, navigate] = useLocation();

  // Buscar dados do Hero
  const { data: heroData, isLoading } = trpc.dashboard.getHeroData.useQuery();

  if (isLoading) {
    return (
      <section className="py-8 md:py-12">
        <div className="container">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-16 bg-muted rounded w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-24 bg-muted rounded" />
              <div className="h-24 bg-muted rounded" />
              <div className="h-24 bg-muted rounded" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const greeting = heroData?.greeting || "Olá!";
  const motivationalMessage = heroData?.motivationalMessage || "";
  const cta = heroData?.cta || {
    state: "iniciar_meta",
    text: "Iniciar Meta de Hoje",
    icon: "play",
  };
  const stats = heroData?.stats || {
    metasConcluidas: 0,
    metasPlanejadas: 0,
    questoesResolvidas: 0,
    tempoEstudo: 0,
  };

  // Ícone do CTA baseado no estado
  const getCtaIcon = () => {
    switch (cta.icon) {
      case "play":
        return <Play className="h-5 w-5" />;
      case "arrow-right":
        return <ArrowRight className="h-5 w-5" />;
      case "brain":
        return <Brain className="h-5 w-5" />;
      case "book-open":
        return <BookOpen className="h-5 w-5" />;
      default:
        return <Play className="h-5 w-5" />;
    }
  };

  // Link do CTA baseado no estado
  const getCtaLink = () => {
    switch (cta.state) {
      case "iniciar_meta":
      case "continuar_meta":
        return "/metas/cronograma";
      case "resolver_questoes":
        return "/questoes";
      case "revisar_conteudo":
        return "/revisoes";
      default:
        return "/metas/cronograma";
    }
  };

  // Formatar tempo de estudo
  const formatTempoEstudo = (minutos: number) => {
    if (minutos < 60) {
      return `${minutos}m`;
    }
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}m`;
  };

  return (
    <section className="py-8 md:py-12 bg-gradient-to-b from-background to-muted/20">
      <div className="container space-y-6">
        {/* Saudação + Mensagem Motivacional */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {greeting}
          </h1>
          <p className="text-muted-foreground text-lg">{motivationalMessage}</p>
        </div>

        {/* CTA Principal (Animado) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button
            size="lg"
            className="w-full sm:w-auto text-lg px-8 py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
            onClick={() => navigate(getCtaLink())}
          >
            {getCtaIcon()}
            <span className="ml-2">{cta.text}</span>
          </Button>

          {/* Próxima Ação Sugerida */}
          {cta.state === "iniciar_meta" && stats.metasPlanejadas > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              <span>
                {stats.metasPlanejadas} meta{stats.metasPlanejadas > 1 ? "s" : ""}{" "}
                planejada{stats.metasPlanejadas > 1 ? "s" : ""} para hoje
              </span>
            </div>
          )}
        </div>

        {/* Mini-Estatísticas do Dia */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Metas Concluídas */}
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Metas de Hoje</p>
                <p className="text-2xl font-bold">
                  {stats.metasConcluidas}/{stats.metasPlanejadas}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            {stats.metasPlanejadas > 0 && (
              <div className="mt-2">
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{
                      width: `${(stats.metasConcluidas / stats.metasPlanejadas) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </Card>

          {/* Questões Resolvidas */}
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Questões Resolvidas</p>
                <p className="text-2xl font-bold">{stats.questoesResolvidas}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Meta diária: 20 questões
            </p>
          </Card>

          {/* Tempo de Estudo */}
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Tempo de Estudo</p>
                <p className="text-2xl font-bold">
                  {formatTempoEstudo(stats.tempoEstudo)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
                <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Continue assim! 💪
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
