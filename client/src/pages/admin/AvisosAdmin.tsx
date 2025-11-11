import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { showAvisoToast } from '@/components/AvisoToast';

type FiltrosSegmentacao = {
  ultimoAcesso?: number;
  taxaAcerto?: [number, number];
  questoesResolvidas?: [number, number];
};

export default function AvisosAdmin() {
  const [showPreview, setShowPreview] = useState(false);

  // Form state
  const [filtrosSegmentacao, setFiltrosSegmentacao] = useState<FiltrosSegmentacao>({});
  const [templateSelecionado, setTemplateSelecionado] = useState<string>('');
  const [formData, setFormData] = useState({
    tipo: 'informativo' as 'informativo' | 'importante' | 'urgente' | 'individual' | 'premium',
    titulo: '',
    conteudo: '',
    formatoExibicao: 'modal' as 'modal' | 'banner' | 'toast' | 'badge',
    midiaUrl: '',
    ctaTexto: '',
    ctaUrl: '',
    dismissavel: true,
    prioridade: 5,
  });

  // Queries
  const avisosQuery = trpc.avisos.list.useQuery({ page: 1, limit: 50 });
  const templatesQuery = trpc.avisosTemplates.listTemplates.useQuery({});

  // Mutations
  const useTemplateMutation = trpc.avisosTemplates.useTemplate.useMutation({
    onSuccess: (data) => {
      setFormData({
        ...formData,
        tipo: data.tipo,
        titulo: data.titulo,
        conteudo: data.conteudo,
      });
      toast.success('Template aplicado com sucesso!');
    },
  });

  const createMutation = trpc.avisos.create.useMutation({
    onSuccess: () => {
      toast.success('Aviso criado com sucesso!');
      avisosQuery.refetch();
      // Reset form
      setFormData({
        tipo: 'informativo',
        titulo: '',
        conteudo: '',
        formatoExibicao: 'modal',
        midiaUrl: '',
        ctaTexto: '',
        ctaUrl: '',
        dismissavel: true,
        prioridade: 5,
      });
    },
    onError: (error) => {
      toast.error(`Erro ao criar aviso: ${error.message}`);
    },
  });

  const publicarMutation = trpc.avisos.publicar.useMutation({
    onSuccess: () => {
      toast.success('Aviso publicado com sucesso!');
      avisosQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao publicar aviso: ${error.message}`);
    },
  });

  const pausarMutation = trpc.avisos.pausar.useMutation({
    onSuccess: () => {
      toast.success('Aviso pausado com sucesso!');
      avisosQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao pausar aviso: ${error.message}`);
    },
  });

  const deleteMutation = trpc.avisos.delete.useMutation({
    onSuccess: () => {
      toast.success('Aviso deletado com sucesso!');
      avisosQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao deletar aviso: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    if (!formData.titulo || !formData.conteudo) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    // Transformar strings vazias em undefined para campos opcionais
    const payload = {
      ...formData,
      midiaUrl: formData.midiaUrl || undefined,
      ctaUrl: formData.ctaUrl || undefined,
      ctaTexto: formData.ctaTexto || undefined,
    };

    createMutation.mutate(payload);
  };

  const handlePreview = () => {
    if (!formData.titulo || !formData.conteudo) {
      toast.error('Preencha título e conteúdo para visualizar o preview');
      return;
    }

    if (formData.formatoExibicao === 'toast') {
      showAvisoToast({
        id: 'preview',
        tipo: 'informativo',
        titulo: formData.titulo,
        conteudo: formData.conteudo,
        ctaTexto: formData.ctaTexto || null,
        ctaUrl: formData.ctaUrl || null,
      });
    } else {
      setShowPreview(true);
    }
  };

  const previewAviso = {
    id: 'preview',
    tipo: 'informativo' as const,
    titulo: formData.titulo,
    conteudo: formData.conteudo,
    imagemUrl: formData.midiaUrl || null,
    ctaTexto: formData.ctaTexto || null,
    ctaUrl: formData.ctaUrl || null,
  };

  return (
    <AdminLayout
      title="Gerenciar Avisos"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Avisos' },
      ]}
    >

      <Tabs defaultValue="criar">
        <TabsList>
          <TabsTrigger value="criar">Criar Aviso</TabsTrigger>
          <TabsTrigger value="lista">Lista de Avisos</TabsTrigger>
        </TabsList>

        <TabsContent value="criar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Aviso</CardTitle>
              <CardDescription>Preencha os dados do aviso que será exibido aos alunos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Template */}
              <div className="space-y-2">
                <Label>📄 Usar Template</Label>
                <p className="text-sm text-muted-foreground">Preencha rapidamente com um template existente</p>
                <Select
                  value={templateSelecionado}
                  onValueChange={(value) => {
                    setTemplateSelecionado(value);
                    useTemplateMutation.mutate({ templateId: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templatesQuery.isLoading && <SelectItem value="loading">Carregando...</SelectItem>}
                    {templatesQuery.data && templatesQuery.data.length === 0 && (
                      <SelectItem value="empty">Nenhum template disponível</SelectItem>
                    )}
                    {templatesQuery.data?.map((template: any) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Tipo */}
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, tipo: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="informativo">Informativo</SelectItem>
                      <SelectItem value="importante">Importante</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Formato */}
                <div className="space-y-2">
                  <Label htmlFor="formato">Formato de Exibição *</Label>
                  <Select
                    value={formData.formatoExibicao}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, formatoExibicao: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modal">Modal (Centralizado)</SelectItem>
                      <SelectItem value="banner">Banner (Topo)</SelectItem>
                      <SelectItem value="toast">Toast (Notificação)</SelectItem>
                      <SelectItem value="badge">Badge (Apenas contador)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Título */}
              <div className="space-y-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ex: Nova funcionalidade disponível!"
                />
              </div>

              {/* Conteúdo */}
              <div className="space-y-2">
                <Label htmlFor="conteudo">Conteúdo *</Label>
                <Textarea
                  id="conteudo"
                  value={formData.conteudo}
                  onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                  placeholder="Espero que você esteja gostando da plataforma"
                  rows={4}
                />
              </div>

              {/* URL da Imagem */}
              <div className="space-y-2">
                <Label htmlFor="midiaUrl">URL da Imagem (opcional)</Label>
                <Input
                  id="midiaUrl"
                  type="url"
                  value={formData.midiaUrl}
                  onChange={(e) => setFormData({ ...formData, midiaUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              {/* Texto do Botão */}
              <div className="space-y-2">
                <Label htmlFor="ctaTexto">Texto do Botão (opcional)</Label>
                <Input
                  id="ctaTexto"
                  value={formData.ctaTexto}
                  onChange={(e) => setFormData({ ...formData, ctaTexto: e.target.value })}
                  placeholder="Ex: Saiba mais"
                />
              </div>

              {/* URL do Botão */}
              <div className="space-y-2">
                <Label htmlFor="ctaUrl">URL do Botão (opcional)</Label>
                <Input
                  id="ctaUrl"
                  type="url"
                  value={formData.ctaUrl}
                  onChange={(e) => setFormData({ ...formData, ctaUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              {/* Pode ser dispensado? */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="dismissavel"
                  checked={formData.dismissavel}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, dismissavel: checked })
                  }
                />
                <Label htmlFor="dismissavel">Pode ser dispensado?</Label>
              </div>

              {/* Prioridade */}
              <div className="space-y-2">
                <Label htmlFor="prioridade">Prioridade (1-10, maior = mais importante)</Label>
                <Input
                  id="prioridade"
                  type="number"
                  min={1}
                  max={10}
                  value={formData.prioridade}
                  onChange={(e) =>
                    setFormData({ ...formData, prioridade: parseInt(e.target.value) })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Alcance Estimado */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-blue-500">ℹ️</span> Alcance Estimado
              </CardTitle>
              <CardDescription>Usuários que receberão este aviso com os filtros atuais</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configure os filtros para ver o alcance estimado
              </p>
            </CardContent>
          </Card>

          {/* Filtros de Segmentação */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros de Segmentação</CardTitle>
              <CardDescription>Refine o público-alvo com critérios específicos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Último Acesso */}
              <div className="space-y-2">
                <Label>Último Acesso (dias)</Label>
                <p className="text-sm text-muted-foreground">
                  Ex: 7 (usuários ativos nos últimos 7 dias)
                </p>
                <Input
                  type="number"
                  placeholder="7"
                  value={filtrosSegmentacao.ultimoAcesso || ''}
                  onChange={(e) =>
                    setFiltrosSegmentacao({
                      ...filtrosSegmentacao,
                      ultimoAcesso: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              {/* Taxa de Acerto */}
              <div className="space-y-2">
                <Label>Taxa de Acerto</Label>
                <p className="text-sm text-muted-foreground">0% - 100%</p>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={filtrosSegmentacao.taxaAcerto || [0, 100]}
                  onValueChange={(value: any) =>
                    setFiltrosSegmentacao({ ...filtrosSegmentacao, taxaAcerto: value })
                  }
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Questões Resolvidas */}
              <div className="space-y-2">
                <Label>Questões Resolvidas</Label>
                <p className="text-sm text-muted-foreground">0 - 1000</p>
                <Slider
                  min={0}
                  max={1000}
                  step={10}
                  value={filtrosSegmentacao.questoesResolvidas || [0, 1000]}
                  onValueChange={(value: any) =>
                    setFiltrosSegmentacao({ ...filtrosSegmentacao, questoesResolvidas: value })
                  }
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>0</span>
                  <span>500</span>
                  <span>1000+</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button onClick={handlePreview} variant="outline" className="flex-1">
                <span className="mr-2">👁️</span> Visualizar Preview
              </Button>
              <Button onClick={handleSubmit} className="flex-1">
                <span className="mr-2">💾</span> Salvar Aviso
              </Button>
            </CardContent>
          </Card>

          {/* Dicas */}
          <Card>
            <CardHeader>
              <CardTitle>Dicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>Modal:</strong> Ideal para anúncios importantes que exigem atenção imediata
              </p>
              <p>
                <strong>Banner:</strong> Perfeito para avisos persistentes visíveis
              </p>
              <p>
                <strong>Toast:</strong> Melhor para notificações rápidas e não intrusivas
              </p>
              <p>
                <strong>Badge:</strong> Apenas contador de notificações
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lista">
          <Card>
            <CardHeader>
              <CardTitle>Avisos Criados</CardTitle>
              <CardDescription>Gerencie todos os avisos existentes</CardDescription>
            </CardHeader>
            <CardContent>
              {avisosQuery.isLoading && <p>Carregando avisos...</p>}
              {avisosQuery.data?.items && avisosQuery.data.items.length === 0 && (
                <p className="text-muted-foreground">Nenhum aviso criado ainda</p>
              )}
              {avisosQuery.data?.items && avisosQuery.data.items.length > 0 && (
                <div className="space-y-4">
                  {avisosQuery.data.items.map((aviso: any) => (
                    <div
                      key={aviso.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-semibold">{aviso.titulo}</h3>
                        <p className="text-sm text-muted-foreground">{aviso.tipo}</p>
                      </div>
                      <div className="flex gap-2">
                        {aviso.status === 'rascunho' && (
                          <Button
                            size="sm"
                            onClick={() => publicarMutation.mutate({ id: aviso.id })}
                          >
                            Publicar
                          </Button>
                        )}
                        {aviso.status === 'ativo' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => pausarMutation.mutate({ id: aviso.id })}
                          >
                            Pausar
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteMutation.mutate({ id: aviso.id })}
                        >
                          Deletar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Preview */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preview do Aviso</DialogTitle>
            <DialogDescription>
              Visualização de como o aviso aparecerá para os alunos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {formData.midiaUrl && (
              <img
                src={formData.midiaUrl}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Imagem+n%C3%A3o+dispon%C3%ADvel';
                }}
              />
            )}
            <div>
              <h3 className="text-xl font-bold mb-2">{previewAviso.titulo}</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{previewAviso.conteudo}</p>
            </div>
            {previewAviso.ctaTexto && previewAviso.ctaUrl && (
              <Button asChild>
                <a href={previewAviso.ctaUrl} target="_blank" rel="noopener noreferrer">
                  {previewAviso.ctaTexto}
                </a>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
