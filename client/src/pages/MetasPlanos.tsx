import { useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Target, Plus, Calendar, Upload, Clock, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function MetasPlanos() {
  const [, setLocation] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [horasPorDia, setHorasPorDia] = useState('4');
  const [diasDisponiveis, setDiasDisponiveis] = useState(127); // Todos os dias

  const planosQuery = trpc.metasPlanos.list.useQuery();
  const createMutation = trpc.metasPlanos.create.useMutation();
  const deleteMutation = trpc.metasPlanos.delete.useMutation();

  const handleCreate = async () => {
    if (!nome.trim()) {
      toast.error('Nome do plano é obrigatório');
      return;
    }

    const horas = parseFloat(horasPorDia);
    if (isNaN(horas) || horas <= 0 || horas > 24) {
      toast.error('Horas por dia deve ser entre 0 e 24');
      return;
    }

    try {
      const plano = await createMutation.mutateAsync({
        nome,
        descricao: descricao.trim() || undefined,
        horasPorDia: horas,
        diasDisponiveis,
      });

      toast.success('Plano criado com sucesso!');
      setIsCreateDialogOpen(false);
      setNome('');
      setDescricao('');
      setHorasPorDia('4');
      setDiasDisponiveis(127);
      planosQuery.refetch();
      
      // Redirecionar para o cronograma do plano
      setLocation(`/metas/planos/${plano.id}/cronograma`);
    } catch (error: any) {
      toast.error('Erro ao criar plano: ' + error.message);
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja deletar o plano "${nome}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success('Plano deletado com sucesso');
      planosQuery.refetch();
    } catch (error: any) {
      toast.error('Erro ao deletar plano: ' + error.message);
    }
  };

  const toggleDia = (dia: number) => {
    const bit = 1 << dia;
    setDiasDisponiveis((prev) => prev ^ bit);
  };

  const isDiaSelected = (dia: number) => {
    return (diasDisponiveis & (1 << dia)) !== 0;
  };

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="container py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Target className="w-8 h-8" />
              Meus Planos de Estudo
            </h1>
            <p className="text-muted-foreground mt-2">
              Organize suas metas e acompanhe seu progresso
            </p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Novo Plano
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Plano de Estudo</DialogTitle>
                <DialogDescription>
                  Configure seu plano de estudo com metas e cronograma personalizado
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Plano *</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Preparação EARA 2025"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição (opcional)</Label>
                  <Textarea
                    id="descricao"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Descreva os objetivos deste plano..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="horas">Horas de Estudo por Dia *</Label>
                  <Input
                    id="horas"
                    type="number"
                    min="0.5"
                    max="24"
                    step="0.5"
                    value={horasPorDia}
                    onChange={(e) => setHorasPorDia(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Capacidade diária de estudo (será respeitada na distribuição de metas)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Dias Disponíveis para Estudo</Label>
                  <div className="flex gap-2">
                    {diasSemana.map((dia, idx) => (
                      <Button
                        key={idx}
                        type="button"
                        variant={isDiaSelected(idx) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleDia(idx)}
                      >
                        {dia}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Selecione os dias da semana em que você pode estudar
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Criando...' : 'Criar Plano'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {planosQuery.isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando planos...</div>
        ) : planosQuery.data?.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum plano criado ainda</h3>
              <p className="text-muted-foreground mb-4">
                Crie seu primeiro plano de estudo para começar a organizar suas metas
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Plano
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {planosQuery.data?.map((plano: any) => {
              const diasAtivos = [];
              for (let i = 0; i < 7; i++) {
                if ((plano.dias_disponiveis & (1 << i)) !== 0) {
                  diasAtivos.push(diasSemana[i]);
                }
              }

              return (
                <Card key={plano.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-1">{plano.nome}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {plano.descricao || 'Sem descrição'}
                        </CardDescription>
                      </div>
                      <Badge variant={plano.ativo ? 'default' : 'secondary'}>
                        {plano.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{plano.horas_por_dia}h por dia</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{diasAtivos.join(', ')}</span>
                    </div>

                    <div className="pt-2 border-t space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Criado em:</span>
                        <span>{format(new Date(plano.criado_em), 'dd/MM/yyyy', { locale: ptBR })}</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(`/metas/planos/${plano.id}/hoje`)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Hoje
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(`/metas/planos/${plano.id}/cronograma`)}
                      >
                        <Calendar className="w-4 h-4 mr-1" />
                        Cronograma
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(`/metas/planos/${plano.id}/nova`)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Nova
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(`/metas/planos/${plano.id}/importar`)}
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        Importar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(plano.id, plano.nome)}
                        disabled={deleteMutation.isPending}
                      >
                        Deletar
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
