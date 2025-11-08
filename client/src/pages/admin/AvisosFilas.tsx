import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2, 
  Play, 
  Pause, 
  Trash2,
  RefreshCw
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AvisosFilas() {
  const [statusAtivo, setStatusAtivo] = useState<"completed" | "failed" | "active" | "waiting">("waiting");

  // Queries
  const statsQuery = trpc.avisos.getQueueStats.useQuery(undefined, {
    refetchInterval: 3000, // Atualizar a cada 3 segundos
  });

  const jobsQuery = trpc.avisos.getRecentJobs.useQuery(
    { status: statusAtivo, limit: 50 },
    { refetchInterval: 5000 }
  );

  // Mutations
  const pauseMutation = trpc.avisos.pauseQueue.useMutation({
    onSuccess: () => {
      toast.success("Fila pausada");
      statsQuery.refetch();
    },
  });

  const resumeMutation = trpc.avisos.resumeQueue.useMutation({
    onSuccess: () => {
      toast.success("Fila retomada");
      statsQuery.refetch();
    },
  });

  const cleanMutation = trpc.avisos.cleanQueue.useMutation({
    onSuccess: () => {
      toast.success("Fila limpa");
      statsQuery.refetch();
      jobsQuery.refetch();
    },
  });

  const stats = statsQuery.data || { waiting: 0, active: 0, completed: 0, failed: 0, total: 0 };
  const jobs = jobsQuery.data || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Completado</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Falhou</Badge>;
      case "active":
        return <Badge variant="default" className="bg-blue-600"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Ativo</Badge>;
      case "waiting":
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Aguardando</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoramento de Filas</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe o processamento de avisos em tempo real
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              statsQuery.refetch();
              jobsQuery.refetch();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => pauseMutation.mutate()}
            disabled={pauseMutation.isPending}
          >
            <Pause className="h-4 w-4 mr-2" />
            Pausar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => resumeMutation.mutate()}
            disabled={resumeMutation.isPending}
          >
            <Play className="h-4 w-4 mr-2" />
            Retomar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => cleanMutation.mutate()}
            disabled={cleanMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar Antigos
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aguardando
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-500" />
              <span className="text-3xl font-bold">{stats.waiting}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span className="text-3xl font-bold">{stats.active}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-3xl font-bold">{stats.completed}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Falhados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="text-3xl font-bold">{stats.failed}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-gray-500" />
              <span className="text-3xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Jobs Recentes</CardTitle>
          <CardDescription>
            Últimos 50 jobs por status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={statusAtivo} onValueChange={(v) => setStatusAtivo(v as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="waiting">
                Aguardando ({stats.waiting})
              </TabsTrigger>
              <TabsTrigger value="active">
                Ativos ({stats.active})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completados ({stats.completed})
              </TabsTrigger>
              <TabsTrigger value="failed">
                Falhados ({stats.failed})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={statusAtivo} className="mt-4">
              {jobsQuery.isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  Carregando jobs...
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum job encontrado
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job: any) => (
                    <Card key={job.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusBadge(statusAtivo)}
                              <span className="text-sm font-mono text-muted-foreground">
                                {job.id}
                              </span>
                            </div>
                            <p className="font-medium mb-1">{job.name}</p>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p>
                                Criado:{" "}
                                {formatDistanceToNow(new Date(job.timestamp), {
                                  addSuffix: true,
                                  locale: ptBR,
                                })}
                              </p>
                              {job.processedOn && (
                                <p>
                                  Processado:{" "}
                                  {formatDistanceToNow(new Date(job.processedOn), {
                                    addSuffix: true,
                                    locale: ptBR,
                                  })}
                                </p>
                              )}
                              {job.finishedOn && (
                                <p>
                                  Finalizado:{" "}
                                  {formatDistanceToNow(new Date(job.finishedOn), {
                                    addSuffix: true,
                                    locale: ptBR,
                                  })}
                                </p>
                              )}
                            </div>
                            {job.failedReason && (
                              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                                <strong>Erro:</strong> {job.failedReason}
                              </div>
                            )}
                            {job.returnvalue && (
                              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                                <strong>Resultado:</strong>{" "}
                                {typeof job.returnvalue === "object"
                                  ? JSON.stringify(job.returnvalue, null, 2)
                                  : job.returnvalue}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
