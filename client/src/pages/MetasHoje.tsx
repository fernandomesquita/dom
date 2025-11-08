import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Target, Clock, CheckCircle2, AlertCircle, XCircle, Play, Pause, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TIPO_COLORS = {
  ESTUDO: 'bg-blue-500',
  QUESTOES: 'bg-green-500',
  REVISAO: 'bg-purple-500',
};

export default function MetasHoje() {
  const { planoId } = useParams<{ planoId: string }>();
  const [, setLocation] = useLocation();

  const [selectedMeta, setSelectedMeta] = useState<any>(null);
  const [actionType, setActionType] = useState<'complete' | 'needMoreTime' | 'omit' | null>(null);
  const [omitReason, setOmitReason] = useState('');
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const hoje = format(new Date(), 'yyyy-MM-dd');

  const metasQuery = trpc.metasMetas.list.useQuery({
    planoId: planoId!,
    status: 'PENDENTE',
    dataInicio: hoje,
    dataFim: hoje,
  }, {
    enabled: !!planoId,
    refetchInterval: 30000,
  });

  const completeMutation = trpc.metasMetas.complete.useMutation();
  const needMoreTimeMutation = trpc.metasMetas.needMoreTime.useMutation();
  const omitMutation = trpc.metasMetas.omit.useMutation();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = (meta: any) => {
    setSelectedMeta(meta);
    setTimer(0);
    setIsTimerRunning(true);
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
  };

  const handleResumeTimer = () => {
    setIsTimerRunning(true);
  };

  const handleOpenAction = (meta: any, action: 'complete' | 'needMoreTime' | 'omit') => {
    setSelectedMeta(meta);
    setActionType(action);
    setIsTimerRunning(false);
  };

  const handleCloseDialog = () => {
    setActionType(null);
    setOmitReason('');
  };

  const handleComplete = async () => {
    if (!selectedMeta) return;

    try {
      await completeMutation.mutateAsync({
        id: selectedMeta.id,
        duracaoRealSec: timer,
      });

      toast.success('Meta concluída com sucesso!');
      setSelectedMeta(null);
      setTimer(0);
      setIsTimerRunning(false);
      handleCloseDialog();
      metasQuery.refetch();
    } catch (error: any) {
      toast.error('Erro ao concluir meta: ' + error.message);
    }
  };

  const handleNeedMoreTime = async () => {
    if (!selectedMeta) return;

    try {
      await needMoreTimeMutation.mutateAsync({
        id: selectedMeta.id,
        duracaoGastaSec: timer,
      });

      toast.success('Meta reagendada para próximo dia disponível');
      setSelectedMeta(null);
      setTimer(0);
      setIsTimerRunning(false);
      handleCloseDialog();
      metasQuery.refetch();
    } catch (error: any) {
      toast.error('Erro ao solicitar mais tempo: ' + error.message);
    }
  };

  const handleOmit = async () => {
    if (!selectedMeta || !omitReason.trim()) {
      toast.error('Por favor, informe o motivo da omissão');
      return;
    }

    try {
      await omitMutation.mutateAsync({
        id: selectedMeta.id,
        motivo: omitReason,
      });

      toast.success('Meta omitida');
      setSelectedMeta(null);
      setTimer(0);
      setIsTimerRunning(false);
      handleCloseDialog();
      metasQuery.refetch();
    } catch (error: any) {
      toast.error('Erro ao omitir meta: ' + error.message);
    }
  };

  const metas = metasQuery.data || [];
  const totalMinutos = metas.reduce((acc: number, meta: any) => acc + meta.duracao_planejada_min, 0);
  const progressPercent = metas.length > 0 ? 0 : 100;

  return (
    <div className="container py-8">
      <Button variant="ghost" onClick={() => setLocation(`/metas/planos/${planoId}`)} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para Plano
      </Button>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="w-8 h-8" />
            Metas de Hoje
          </h1>
          <p className="text-muted-foreground mt-2">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Metas Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metas.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Tempo Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.floor(totalMinutos / 60)}h {totalMinutos % 60}m
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Progresso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{progressPercent}%</div>
                <Progress value={progressPercent} />
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedMeta && (
          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Meta em Andamento</CardTitle>
                  <CardDescription>
                    <Badge variant="outline" className="mt-2">
                      {selectedMeta.display_number}
                    </Badge>
                  </CardDescription>
                </div>
                <div className="text-3xl font-mono font-bold">
                  {formatTime(timer)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="font-semibold">{selectedMeta.ktree_disciplina_id}</div>
                <div className="text-sm text-muted-foreground">{selectedMeta.ktree_assunto_id}</div>
              </div>

              {selectedMeta.orientacoes_estudo && (
                <div className="text-sm bg-muted p-3 rounded-lg">
                  {selectedMeta.orientacoes_estudo}
                </div>
              )}

              <div className="flex gap-2">
                {!isTimerRunning ? (
                  <Button onClick={handleResumeTimer} size="lg">
                    <Play className="w-4 h-4 mr-2" />
                    Retomar
                  </Button>
                ) : (
                  <Button onClick={handlePauseTimer} variant="outline" size="lg">
                    <Pause className="w-4 h-4 mr-2" />
                    Pausar
                  </Button>
                )}

                <Button onClick={() => handleOpenAction(selectedMeta, 'complete')} variant="default" size="lg">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Concluir
                </Button>

                <Button onClick={() => handleOpenAction(selectedMeta, 'needMoreTime')} variant="outline" size="lg">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Mais Tempo
                </Button>

                <Button onClick={() => handleOpenAction(selectedMeta, 'omit')} variant="destructive" size="lg">
                  <XCircle className="w-4 h-4 mr-2" />
                  Omitir
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Suas Metas de Hoje</h2>

          {metasQuery.isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : metas.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Parabéns!</h3>
                <p className="text-muted-foreground">Você não tem metas pendentes para hoje.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {metas.map((meta: any) => (
                <Card key={meta.id} className={selectedMeta?.id === meta.id ? 'border-primary' : ''}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{meta.display_number}</Badge>
                          <Badge className={TIPO_COLORS[meta.tipo as keyof typeof TIPO_COLORS]}>
                            {meta.tipo}
                          </Badge>
                          {meta.fixed && <Badge variant="secondary">Fixada</Badge>}
                        </div>

                        <div className="font-semibold mb-1">{meta.ktree_disciplina_id}</div>
                        <div className="text-sm text-muted-foreground mb-2">{meta.ktree_assunto_id}</div>

                        {meta.orientacoes_estudo && (
                          <div className="text-sm text-muted-foreground mb-3">
                            {meta.orientacoes_estudo}
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {meta.duracao_planejada_min} minutos
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {selectedMeta?.id !== meta.id && (
                          <Button onClick={() => handleStartTimer(meta)} size="lg">
                            <Play className="w-4 h-4 mr-2" />
                            Iniciar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={actionType === 'complete'} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Concluir Meta</DialogTitle>
            <DialogDescription>
              Confirme que você concluiu esta meta. Revisões serão agendadas automaticamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleComplete} disabled={completeMutation.isPending}>
              {completeMutation.isPending ? 'Concluindo...' : 'Concluir Meta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={actionType === 'needMoreTime'} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Mais Tempo</DialogTitle>
            <DialogDescription>
              Esta meta será reagendada para o próximo dia disponível.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleNeedMoreTime} disabled={needMoreTimeMutation.isPending}>
              {needMoreTimeMutation.isPending ? 'Reagendando...' : 'Reagendar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={actionType === 'omit'} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Omitir Meta</DialogTitle>
            <DialogDescription>
              Por favor, informe o motivo da omissão desta meta.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="omit-reason">Motivo</Label>
              <Textarea
                id="omit-reason"
                value={omitReason}
                onChange={(e) => setOmitReason(e.target.value)}
                placeholder="Ex: Não tive tempo suficiente, mudança de prioridades..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleOmit} disabled={omitMutation.isPending}>
              {omitMutation.isPending ? 'Omitindo...' : 'Omitir Meta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
