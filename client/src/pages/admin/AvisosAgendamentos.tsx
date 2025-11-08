import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Calendar, Pause, Play, X, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AvisosAgendamentos() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [proximasExecucoes, setProximasExecucoes] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    avisoId: '',
    dataExecucao: '',
    recorrencia: 'unica' as 'unica' | 'diaria' | 'semanal' | 'mensal',
    timezone: 'America/Sao_Paulo',
  });

  // Queries
  const agendamentosQuery = trpc.agendamentos.list.useQuery({ limit: 50 });
  const statsQuery = trpc.agendamentos.getStats.useQuery();
  const avisosQuery = trpc.avisos.list.useQuery({ ativo: true });

  // Mutations
  const createMutation = trpc.agendamentos.create.useMutation({
    onSuccess: () => {
      toast.success('Agendamento criado com sucesso!');
      agendamentosQuery.refetch();
      statsQuery.refetch();
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const cancelMutation = trpc.agendamentos.cancel.useMutation({
    onSuccess: () => {
      toast.success('Agendamento cancelado!');
      agendamentosQuery.refetch();
      statsQuery.refetch();
    },
  });

  const pauseMutation = trpc.agendamentos.pause.useMutation({
    onSuccess: () => {
      toast.success('Agendamento pausado!');
      agendamentosQuery.refetch();
      statsQuery.refetch();
    },
  });

  const resumeMutation = trpc.agendamentos.resume.useMutation({
    onSuccess: () => {
      toast.success('Agendamento retomado!');
      agendamentosQuery.refetch();
      statsQuery.refetch();
    },
  });

  const proximasExecucoesQuery = trpc.agendamentos.getProximasExecucoes.useQuery(
    {
      dataInicio: formData.dataExecucao,
      recorrencia: formData.recorrencia,
      quantidade: 5,
    },
    {
      enabled: formData.dataExecucao.length > 0,
      onSuccess: (data) => {
        setProximasExecucoes(data);
      },
    }
  );

  const resetForm = () => {
    setFormData({
      avisoId: '',
      dataExecucao: '',
      recorrencia: 'unica',
      timezone: 'America/Sao_Paulo',
    });
    setProximasExecucoes([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleCancel = (id: string) => {
    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
      cancelMutation.mutate({ id });
    }
  };

  const handlePause = (id: string) => {
    pauseMutation.mutate({ id });
  };

  const handleResume = (id: string) => {
    resumeMutation.mutate({ id });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      ativo: 'default',
      pausado: 'secondary',
      concluido: 'outline',
      cancelado: 'destructive',
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getRecorrenciaLabel = (recorrencia: string) => {
    const labels: Record<string, string> = {
      unica: 'Única',
      diaria: 'Diária',
      semanal: 'Semanal',
      mensal: 'Mensal',
    };
    return labels[recorrencia] || recorrencia;
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agendamentos de Avisos</h1>
          <p className="text-muted-foreground mt-2">
            Agende avisos para serem enviados automaticamente
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Agendamento</DialogTitle>
              <DialogDescription>
                Configure quando e com que frequência o aviso será enviado
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="avisoId">Aviso *</Label>
                <Select
                  value={formData.avisoId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, avisoId: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um aviso" />
                  </SelectTrigger>
                  <SelectContent>
                    {avisosQuery.data?.map((aviso) => (
                      <SelectItem key={aviso.id} value={aviso.id}>
                        {aviso.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataExecucao">Data e Hora de Início *</Label>
                <Input
                  id="dataExecucao"
                  type="datetime-local"
                  value={formData.dataExecucao}
                  onChange={(e) =>
                    setFormData({ ...formData, dataExecucao: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recorrencia">Recorrência *</Label>
                <Select
                  value={formData.recorrencia}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, recorrencia: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unica">Única (não repete)</SelectItem>
                    <SelectItem value="diaria">Diária</SelectItem>
                    <SelectItem value="semanal">Semanal</SelectItem>
                    <SelectItem value="mensal">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {proximasExecucoes.length > 0 && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Próximas Execuções
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm">
                      {proximasExecucoes.slice(0, 5).map((data, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="text-muted-foreground">#{index + 1}</span>
                          <span className="font-medium">
                            {format(new Date(data), "dd/MM/yyyy 'às' HH:mm", {
                              locale: ptBR,
                            })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  Criar Agendamento
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      {statsQuery.data && (
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsQuery.data.ativos}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pausados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsQuery.data.pausados}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsQuery.data.concluidos}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Execuções</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsQuery.data.totalExecucoes}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {statsQuery.data.sucessos} sucessos / {statsQuery.data.erros} erros
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Agendamentos */}
      <div className="space-y-4">
        {agendamentosQuery.data?.map((agendamento) => (
          <Card key={agendamento.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">
                      Aviso ID: {agendamento.avisoId}
                    </CardTitle>
                    {getStatusBadge(agendamento.status)}
                  </div>
                  <CardDescription className="mt-2">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Recorrência: {getRecorrenciaLabel(agendamento.recorrencia)}
                      </span>
                      {agendamento.proximaExecucao && (
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Próxima execução:{' '}
                          {format(
                            new Date(agendamento.proximaExecucao),
                            "dd/MM/yyyy 'às' HH:mm",
                            { locale: ptBR }
                          )}
                        </span>
                      )}
                    </div>
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  {agendamento.status === 'ativo' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePause(agendamento.id)}
                      title="Pausar"
                    >
                      <Pause className="h-4 w-4" />
                    </Button>
                  )}
                  {agendamento.status === 'pausado' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleResume(agendamento.id)}
                      title="Retomar"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  {(agendamento.status === 'ativo' ||
                    agendamento.status === 'pausado') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancel(agendamento.id)}
                      title="Cancelar"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}

        {agendamentosQuery.data?.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Nenhum agendamento criado
              </h3>
              <p className="text-muted-foreground mb-4">
                Crie seu primeiro agendamento para enviar avisos automaticamente
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Agendamento
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
