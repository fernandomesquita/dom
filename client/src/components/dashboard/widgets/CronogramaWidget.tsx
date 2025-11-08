import { Calendar, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { getCacheConfig } from "@/lib/cache-config";
import { WidgetErrorState } from "@/components/ErrorState";

/**
 * E10: Widget Cronograma
 * 
 * Exibe:
 * - Meta de hoje (se houver)
 * - Próxima meta
 * - Progresso geral
 * - CTA para ver cronograma completo
 */

export function CronogramaWidget() {
  const [, navigate] = useLocation(); // useLocation do wouter retorna [location, setLocation]

  // Buscar dados do cronograma com cache otimizado (5 minutos)
  const { data, isLoading, error, refetch } = trpc.widgets.getCronograma.useQuery(
    undefined,
    getCacheConfig('cronograma')
  );

  // Tratamento de erro
  if (error) {
    return (
      <WidgetErrorState
        message="Não foi possível carregar o cronograma. Tente novamente."
        onRetry={() => refetch()}
      />
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Cronograma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-8 bg-muted rounded w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const metaHoje = data?.metaHoje;
  const proximaMeta = data?.proximasMetas?.[0]; // Corrigido: proximasMetas é um array
  const totalMetas = data?.totalMetas || 0;
  const metasConcluidas = data?.metasConcluidas || 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Cronograma
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Meta de Hoje */}
        {metaHoje ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Meta de Hoje
              </span>
              <Badge variant="default">Hoje</Badge>
            </div>
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <h4 className="font-semibold text-sm mb-1">{metaHoje.titulo}</h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{Math.ceil(metaHoje.valorAlvo * 2)} min</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhuma meta para hoje
            </p>
          </div>
        )}

        {/* Próxima Meta */}
        {proximaMeta && (
          <div className="space-y-2">
            <span className="text-sm font-medium text-muted-foreground">
              Próxima Meta
            </span>
            <div className="p-3 bg-muted/50 border rounded-lg">
              <h4 className="font-semibold text-sm mb-1">{proximaMeta.titulo}</h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{new Date(proximaMeta.prazo).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Progresso Geral */}
        {totalMetas > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progresso Geral</span>
              <span className="font-semibold">
                {metasConcluidas}/{totalMetas}
              </span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{
                  width: `${(metasConcluidas / totalMetas) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* CTA */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate("/metas/cronograma")}
        >
          Ver Cronograma Completo
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
