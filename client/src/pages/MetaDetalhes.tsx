import { useParams, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Clock, Calendar, Target, FileText, HelpCircle, CheckCircle2, XCircle, AlertCircle, Plus, Trash2, BookOpen, Video, FileAudio, Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TIPO_COLORS = {
  ESTUDO: 'bg-blue-500',
  QUESTOES: 'bg-green-500',
  REVISAO: 'bg-purple-500',
  REVISAO_DIFERIDA: 'bg-orange-500',
};

const STATUS_COLORS = {
  PENDENTE: 'bg-yellow-500',
  EM_ANDAMENTO: 'bg-blue-500',
  CONCLUIDA: 'bg-green-500',
  PRECISA_MAIS_TEMPO: 'bg-orange-500',
  OMITIDA: 'bg-red-500',
};

export default function MetaDetalhes() {
  const { metaId } = useParams<{ metaId: string }>();
  const [, setLocation] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const metaQuery = trpc.metasMetas.getById.useQuery({ id: metaId! }, { enabled: !!metaId });
  const materiaisVinculadosQuery = trpc.metasMetas.listarMateriaisVinculados.useQuery(
    { metaId: metaId! },
    { enabled: !!metaId }
  );
  const materiaisDisponiveisQuery = trpc.metasMetas.buscarMateriaisDisponiveis.useQuery(
    { metaId: metaId!, limit: 20 },
    { enabled: !!metaId && dialogOpen }
  );

  const vincularMutation = trpc.metasMetas.vincularMaterial.useMutation({
    onSuccess: () => {
      toast.success('Material vinculado com sucesso!');
      materiaisVinculadosQuery.refetch();
      setDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao vincular material');
    },
  });

  const desvincularMutation = trpc.metasMetas.desvincularMaterial.useMutation({
    onSuccess: () => {
      toast.success('Material desvinculado com sucesso!');
      materiaisVinculadosQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao desvincular material');
    },
  });

  const handleVincular = (materialId: number) => {
    vincularMutation.mutate({ metaId: metaId!, materialId });
  };

  const handleDesvincular = (materialId: number) => {
    desvincularMutation.mutate({ metaId: metaId!, materialId });
  };

  const getIconByType = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      case 'audio':
        return <FileAudio className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  if (metaQuery.isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!metaQuery.data) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Meta não encontrada</h3>
            <p className="text-muted-foreground">A meta solicitada não existe ou foi removida.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const meta = metaQuery.data;

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="container py-8">
      <Button variant="ghost" onClick={() => setLocation(`/metas/planos/${meta.plano_id}/cronograma`)} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para Cronograma
      </Button>

      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline" className="text-lg px-3 py-1">
              {meta.display_number}
            </Badge>
            <Badge className={TIPO_COLORS[meta.tipo as keyof typeof TIPO_COLORS]}>
              {meta.tipo}
            </Badge>
            <Badge className={STATUS_COLORS[meta.status as keyof typeof STATUS_COLORS]}>
              {meta.status}
            </Badge>
            {meta.fixed && <Badge variant="secondary">Fixada</Badge>}
            {meta.auto_generated && <Badge variant="outline">Auto-gerada</Badge>}
          </div>
          <h1 className="text-3xl font-bold">{meta.ktree_disciplina_id}</h1>
          <p className="text-xl text-muted-foreground mt-1">{meta.ktree_assunto_id}</p>
          {meta.ktree_topico_id && (
            <p className="text-muted-foreground">{meta.ktree_topico_id}</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Data Agendada</span>
                </div>
                <span className="font-medium">
                  {format(new Date(meta.scheduled_date), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Duração Planejada</span>
                </div>
                <span className="font-medium">{meta.duracao_planejada_min} minutos</span>
              </div>

              {meta.duracao_real_sec && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Duração Real</span>
                  </div>
                  <span className="font-medium">{formatDuration(meta.duracao_real_sec)}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Target className="w-4 h-4" />
                  <span>Ordem no Dia</span>
                </div>
                <span className="font-medium">#{meta.scheduled_order}</span>
              </div>

              {meta.meta_origem_id && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    <span>Meta de Origem</span>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0"
                    onClick={() => setLocation(`/metas/${meta.meta_origem_id}`)}
                  >
                    Ver origem
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Datas Importantes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Criada em:</span>
                <span>{format(new Date(meta.criado_em), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
              </div>

              {meta.concluido_em && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Concluída em:</span>
                  <span>{format(new Date(meta.concluido_em), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                </div>
              )}

              {meta.omitido_em && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Omitida em:</span>
                  <span>{format(new Date(meta.omitido_em), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                </div>
              )}

              {meta.atualizado_em && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Última atualização:</span>
                  <span>{format(new Date(meta.atualizado_em), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {meta.orientacoes_estudo && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Orientações de Estudo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{meta.orientacoes_estudo}</p>
            </CardContent>
          </Card>
        )}

        {meta.motivo_omissao && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                <XCircle className="w-5 h-5" />
                Motivo da Omissão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-900">{meta.motivo_omissao}</p>
            </CardContent>
          </Card>
        )}

        {/* Seção de Materiais Vinculados */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Materiais Vinculados
              </CardTitle>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Material
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Adicionar Material</DialogTitle>
                    <DialogDescription>
                      Selecione um material para vincular a esta meta. Materiais filtrados por disciplina e assunto.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar material..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {materiaisDisponiveisQuery.isLoading && (
                      <div className="text-center py-8 text-muted-foreground">Carregando...</div>
                    )}

                    {materiaisDisponiveisQuery.data && materiaisDisponiveisQuery.data.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhum material disponível para esta meta.
                      </div>
                    )}

                    <div className="space-y-2">
                      {materiaisDisponiveisQuery.data
                        ?.filter((m: any) =>
                          searchTerm
                            ? m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              m.description?.toLowerCase().includes(searchTerm.toLowerCase())
                            : true
                        )
                        .map((material: any) => (
                          <Card key={material.id} className="cursor-pointer hover:bg-accent transition-colors">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                <img
                                  src={material.thumbnailUrl}
                                  alt={material.title}
                                  className="w-24 h-16 object-cover rounded"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="text-xs">
                                      {getIconByType(material.type)}
                                      <span className="ml-1">{material.type}</span>
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      {material.category}
                                    </Badge>
                                    {material.isPaid && (
                                      <Badge variant="default" className="text-xs">Premium</Badge>
                                    )}
                                  </div>
                                  <h4 className="font-semibold text-sm mb-1 truncate">{material.title}</h4>
                                  {material.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                      {material.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                    <span>{material.viewCount} visualizações</span>
                                    {material.rating > 0 && (
                                      <span>⭐ {Number(material.rating).toFixed(1)}</span>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleVincular(material.id)}
                                  disabled={vincularMutation.isPending}
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Vincular
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {materiaisVinculadosQuery.isLoading && (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            )}

            {materiaisVinculadosQuery.data && materiaisVinculadosQuery.data.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum material vinculado. Clique em "Adicionar Material" para vincular.
              </div>
            )}

            <div className="space-y-3">
              {materiaisVinculadosQuery.data?.map((material: any) => (
                <Card key={material.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={material.thumbnailUrl}
                        alt={material.title}
                        className="w-32 h-20 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {getIconByType(material.type)}
                            <span className="ml-1">{material.type}</span>
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {material.category}
                          </Badge>
                          {material.isPaid && (
                            <Badge variant="default" className="text-xs">Premium</Badge>
                          )}
                        </div>
                        <h4 className="font-semibold mb-1">{material.title}</h4>
                        {material.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {material.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{material.viewCount} visualizações</span>
                          {material.rating > 0 && (
                            <span>⭐ {Number(material.rating).toFixed(1)}</span>
                          )}
                          <span className="text-xs">
                            Vinculado em {format(new Date(material.vinculadoEm), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDesvincular(material.id)}
                        disabled={desvincularMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Metadados Técnicos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm font-mono">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID:</span>
              <span className="text-xs">{meta.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plano ID:</span>
              <span className="text-xs">{meta.plano_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Key:</span>
              <span>{meta.order_key}</span>
            </div>
            {meta.row_hash && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Row Hash:</span>
                <span className="text-xs truncate max-w-xs">{meta.row_hash}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
