import { Brain, Target, TrendingUp, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { getCacheConfig } from "@/lib/cache-config";
import { WidgetErrorState } from "@/components/ErrorState";

/**
 * E10: Widget QTD (Questões do Dia)
 * 
 * Exibe:
 * - Questões resolvidas hoje
 * - Meta diária
 * - Taxa de acerto
 * - Mini-gráfico dos últimos 7 dias
 * - CTA para resolver questões
 */

export function QTDWidget() {
  const [, navigate] = useLocation();

  // Buscar dados do QTD com cache otimizado (1 minuto)
  const { data, isLoading, error, refetch } = trpc.widgets.getQTD.useQuery(
    undefined,
    getCacheConfig('qtd')
  );

  // Tratamento de erro
  if (error) {
    return (
      <WidgetErrorState
        message="Não foi possível carregar as questões do dia. Tente novamente."
        onRetry={() => refetch()}
      />
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            QTD
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-20 bg-muted rounded w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const questoesResolvidas = data?.questoesResolvidas || 0;
  const metaDiaria = data?.metaDiaria || 20;
  const taxaAcerto = data?.taxaAcerto || 0;
  const ultimos7Dias = data?.ultimos7Dias || [];

  const progressoPercentual = Math.min((questoesResolvidas / metaDiaria) * 100, 100);

  // Calcular altura das barras do mini-gráfico
  const maxQuestoes = Math.max(...ultimos7Dias.map((d) => d.questoes), metaDiaria);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600" />
          QTD - Questões do Dia
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estatísticas Principais */}
        <div className="grid grid-cols-2 gap-4">
          {/* Questões Resolvidas */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Resolvidas Hoje</p>
            <p className="text-2xl font-bold text-blue-600">
              {questoesResolvidas}
            </p>
          </div>

          {/* Taxa de Acerto */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Taxa de Acerto</p>
            <p className="text-2xl font-bold text-green-600">{taxaAcerto}%</p>
          </div>
        </div>

        {/* Progresso da Meta */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Meta Diária</span>
            </div>
            <span className="font-semibold">
              {questoesResolvidas}/{metaDiaria}
            </span>
          </div>
          <Progress value={progressoPercentual} className="h-2" />
        </div>

        {/* Mini-Gráfico dos Últimos 7 Dias */}
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>Últimos 7 dias</span>
          </div>
          <div className="flex items-end justify-between gap-1 h-16">
            {ultimos7Dias.map((dia, index) => {
              const altura = maxQuestoes > 0 ? (dia.questoes / maxQuestoes) * 100 : 0;
              const isToday = index === ultimos7Dias.length - 1;

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t transition-all ${
                      isToday
                        ? "bg-blue-600"
                        : dia.questoes > 0
                        ? "bg-blue-400"
                        : "bg-muted"
                    }`}
                    style={{ height: `${altura}%` }}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {dia.dia}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <Button
          variant="default"
          className="w-full bg-blue-600 hover:bg-blue-700"
          onClick={() => navigate("/questoes")}
        >
          Resolver Questões
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
