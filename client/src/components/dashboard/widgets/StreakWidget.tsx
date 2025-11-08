import { Flame, Shield, Trophy, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { getCacheConfig } from "@/lib/cache-config";
import { WidgetErrorState } from "@/components/ErrorState";

/**
 * E10: Widget Streak
 * 
 * Exibe:
 * - Dias consecutivos (grande destaque)
 * - Status (ativo/em risco)
 * - Proteções disponíveis
 * - Últimos 7 dias (calendário visual)
 * - Botão para usar proteção
 */

export function StreakWidget() {
  const utils = trpc.useUtils();

  // Buscar dados do streak com cache otimizado (1 minuto)
  const { data, isLoading, error, refetch } = trpc.streak.getCurrentStreak.useQuery(
    undefined,
    getCacheConfig('streak')
  );

  // Tratamento de erro
  if (error) {
    return (
      <WidgetErrorState
        message="Não foi possível carregar seu streak. Tente novamente."
        onRetry={() => refetch()}
      />
    );
  }

  // Mutation para usar proteção
  const useProtection = trpc.streak.useProtection.useMutation({
    onSuccess: (result) => {
      toast.success(`Proteção usada! Você tem ${result.protecoesRestantes} proteções restantes.`);
      utils.streak.getCurrentStreak.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-20 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const diasConsecutivos = data?.diasConsecutivos || 0;
  const emRisco = data?.emRisco || false;
  const protecoesDisponiveis = data?.protecoesDisponiveis || 0;
  const ultimos7Dias = data?.ultimos7Dias || [];

  return (
    <Card className={`hover:shadow-lg transition-shadow ${emRisco ? "border-orange-500 border-2" : ""}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Streak
          </div>
          {emRisco && (
            <Badge variant="destructive" className="animate-pulse">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Em Risco!
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dias Consecutivos (Destaque) */}
        <div className="text-center py-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Flame className="h-8 w-8 text-orange-500 animate-pulse" />
            <span className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              {diasConsecutivos}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            dia{diasConsecutivos !== 1 ? "s" : ""} consecutivo{diasConsecutivos !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Últimos 7 Dias (Calendário Visual) */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
          <div className="flex justify-between gap-1">
            {ultimos7Dias.map((dia, index) => {
              const isToday = index === ultimos7Dias.length - 1;

              return (
                <div key={index} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      dia.ativo
                        ? isToday
                          ? "bg-gradient-to-br from-orange-500 to-red-500 text-white"
                          : "bg-green-500 text-white"
                        : "bg-muted"
                    }`}
                  >
                    {dia.ativo && (
                      dia.protecaoUsada ? (
                        <Shield className="h-4 w-4" />
                      ) : (
                        <Flame className="h-4 w-4" />
                      )
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {dia.dia}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Proteções Disponíveis */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Proteções</span>
          </div>
          <Badge variant="secondary">{protecoesDisponiveis}</Badge>
        </div>

        {/* Botão Usar Proteção (apenas se em risco e tiver proteções) */}
        {emRisco && protecoesDisponiveis > 0 && (
          <Button
            variant="outline"
            className="w-full border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
            onClick={() => useProtection.mutate()}
            disabled={useProtection.isPending}
          >
            <Shield className="h-4 w-4 mr-2" />
            {useProtection.isPending ? "Usando..." : "Usar Proteção"}
          </Button>
        )}

        {/* Mensagem de Incentivo */}
        {!emRisco && diasConsecutivos > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            <Trophy className="h-4 w-4 inline-block mr-1 text-yellow-500" />
            Continue assim! Você está arrasando! 🔥
          </div>
        )}
      </CardContent>
    </Card>
  );
}
