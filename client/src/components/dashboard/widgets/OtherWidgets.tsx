import { TrendingUp, BookOpen, RefreshCw, CreditCard, MessageSquare, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { getCacheConfig } from "@/lib/cache-config";
import { WidgetErrorState } from "@/components/ErrorState";

/**
 * E10: Widgets Restantes (5)
 * 
 * 4. ProgressoSemanalWidget
 * 5. MateriaisWidget
 * 6. RevisoesWidget
 * 7. PlanoWidget
 * 8. ComunidadeWidget
 */

// 4. Progresso Semanal Widget
export function ProgressoSemanalWidget() {
  const [, navigate] = useLocation();
  const { data, isLoading, error, refetch } = trpc.widgets.getProgressoSemanal.useQuery(
    undefined,
    getCacheConfig('progressoSemanal')
  );

  if (error) {
    return (
      <WidgetErrorState
        message="Não foi possível carregar o progresso semanal."
        onRetry={() => refetch()}
      />
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progresso Semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const metas = data?.metas || { concluidas: 0, total: 0, percentual: 0 };
  const questoes = data?.questoes || { resolvidas: 0, total: 0, percentual: 0 };
  const tempo = data?.tempo || { estudado: 0, planejado: 0, percentual: 0 };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          Progresso Semanal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Metas</span>
            <span className="font-semibold">{metas.concluidas}/{metas.total}</span>
          </div>
          <Progress value={metas.percentual} className="h-2" />
        </div>

        {/* Questões */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Questões</span>
            <span className="font-semibold">{questoes.resolvidas}/{questoes.total}</span>
          </div>
          <Progress value={questoes.percentual} className="h-2" />
        </div>

        {/* Tempo */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tempo de Estudo</span>
            <span className="font-semibold">{Math.floor(tempo.estudado / 60)}h</span>
          </div>
          <Progress value={tempo.percentual} className="h-2" />
        </div>

        <Button variant="outline" className="w-full" onClick={() => navigate("/estatisticas")}>
          Ver Detalhes
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}

// 5. Materiais Widget
export function MateriaisWidget() {
  const [, navigate] = useLocation();
  const { data, isLoading, error, refetch } = trpc.widgets.getMateriaisAndamento.useQuery(
    undefined,
    getCacheConfig('materiais')
  );

  if (error) {
    return (
      <WidgetErrorState
        message="Não foi possível carregar os materiais."
        onRetry={() => refetch()}
      />
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Materiais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const materiais = data?.materiais || [];
  const total = data?.total || 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-green-600" />
            Materiais
          </div>
          <Badge variant="secondary">{total}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {materiais.length > 0 ? (
          <div className="space-y-2">
            {materiais.slice(0, 3).map((material: any) => (
              <div key={material.id} className="p-2 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium truncate">{material.title}</p>
                <Progress value={material.progress || 0} className="h-1 mt-1" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-sm text-muted-foreground">
            Nenhum material em andamento
          </div>
        )}

        <Button variant="outline" className="w-full" onClick={() => navigate("/materiais")}>
          Ver Todos os Materiais
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}

// 6. Revisões Widget
export function RevisoesWidget() {
  const [, navigate] = useLocation();
  const { data, isLoading, error, refetch } = trpc.widgets.getRevisoesPendentes.useQuery(
    undefined,
    getCacheConfig('revisoes')
  );

  if (error) {
    return (
      <WidgetErrorState
        message="Não foi possível carregar as revisões."
        onRetry={() => refetch()}
      />
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Revisões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const revisoes = data?.revisoes || [];
  const total = data?.total || 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-yellow-600" />
            Revisões
          </div>
          {total > 0 && (
            <Badge variant="destructive">{total}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {revisoes.length > 0 ? (
          <div className="space-y-2">
            {revisoes.slice(0, 3).map((revisao: any) => (
              <div key={revisao.id} className="p-2 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium truncate">{revisao.title}</p>
                <p className="text-xs text-muted-foreground">{revisao.dueDate}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-sm text-muted-foreground">
            Nenhuma revisão pendente
          </div>
        )}

        <Button variant="outline" className="w-full" onClick={() => navigate("/revisoes")}>
          Ver Todas as Revisões
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}

// 7. Plano Widget
export function PlanoWidget() {
  const [, navigate] = useLocation();
  const { data, isLoading, error, refetch } = trpc.widgets.getPlanoAtual.useQuery(
    undefined,
    getCacheConfig('plano')
  );

  if (error) {
    return (
      <WidgetErrorState
        message="Não foi possível carregar o plano."
        onRetry={() => refetch()}
      />
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Meu Plano
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const plano = data?.plano;
  // stats removido - não existe no tipo de retorno

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-indigo-600" />
          Meu Plano
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Plano Atual</span>
            <Badge variant="default">{plano?.nome || 'Sem Plano'}</Badge>
          </div>
          <p className="text-lg font-semibold">{plano?.descricao || 'Nenhum plano ativo'}</p>
        </div>

        {plano && (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Plano Ativo</span>
              <span className="font-medium">{plano.nome}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Dias Restantes</span>
              <span className="font-medium text-indigo-600">{plano.diasRestantes}</span>
            </div>
          </div>
        )}

        <Button variant="outline" className="w-full" onClick={() => navigate("/planos")}>
          Ver Detalhes do Plano
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}

// 8. Comunidade Widget
export function ComunidadeWidget() {
  const [, navigate] = useLocation();
  const { data, isLoading, error, refetch } = trpc.widgets.getUltimasDiscussoes.useQuery(
    undefined,
    getCacheConfig('comunidade')
  );

  if (error) {
    return (
      <WidgetErrorState
        message="Não foi possível carregar as discussões."
        onRetry={() => refetch()}
      />
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comunidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const discussoes = data?.discussoes || [];

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-pink-600" />
          Comunidade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {discussoes.length > 0 ? (
            discussoes.slice(0, 3).map((discussao: any) => (
              <div key={discussao.id} className="p-2 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted" onClick={() => navigate(`/forum/${discussao.id}`)}>
                <p className="text-sm font-medium truncate">
                  {discussao.titulo}
                </p>
                <p className="text-xs text-muted-foreground">
                  {discussao.tempoRelativo} · {discussao.respostas} respostas
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Nenhuma discussão recente
            </div>
          )}
        </div>

        <Button variant="outline" className="w-full" onClick={() => navigate("/forum")}>
          Acessar Fórum
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
