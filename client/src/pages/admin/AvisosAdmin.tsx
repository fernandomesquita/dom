import { useState } from 'react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Save, Eye, FileText } from 'lucide-react';
import { AvisoModal } from '@/components/avisos/AvisoModal';
import { AvisoBanner } from '@/components/avisos/AvisoBanner';
import { showAvisoToast } from '@/components/avisos/AvisoToast';
import { SegmentacaoAvancada, type FiltrosSegmentacao } from '@/components/avisos/SegmentacaoAvancada';

export default function AvisosAdmin() {
  const [activeTab, setActiveTab] = useState('criar');
  const [showPreview, setShowPreview] = useState(false);

  // Form state
  const [filtrosSegmentacao, setFiltrosSegmentacao] = useState<FiltrosSegmentacao>({});
  const [templateSelecionado, setTemplateSelecionado] = useState<string>('');
  const [formData, setFormData] = useState({
    tipoId: '',
    titulo: '',
    conteudo: '',
    formato: 'modal' as 'modal' | 'banner' | 'toast' | 'badge',
    imagemUrl: '',
    ctaTexto: '',
    ctaUrl: '',
    dispensavel: true,
    prioridade: 5,
    ativo: true,
  });

  // Queries
  const avisosQuery = trpc.avisos.list.useQuery({ page: 1, limit: 50 });
  const templatesQuery = trpc.avisosTemplates.listTemplates.useQuery({});

  // Mutations
  const useTemplateMutation = trpc.avisosTemplates.useTemplate.useMutation({
    onSuccess: (data) => {
      setFormData({
        ...formData,
        tipoId: data.tipo === 'informativo' ? '1' : data.tipo === 'importante' ? '2' : data.tipo === 'urgente' ? '3' : data.tipo === 'individual' ? '4' : '5',
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
        tipoId: '',
        titulo: '',
        conteudo: '',
        formato: 'modal',
        imagemUrl: '',
        ctaTexto: '',
        ctaUrl: '',
        dispensavel: true,
        prioridade: 5,
        ativo: true,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tipoId || !formData.titulo || !formData.conteudo) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    createMutation.mutate(formData);
  };

  const handlePreview = () => {
    if (!formData.titulo || !formData.conteudo) {
      toast.error('Preencha título e conteúdo para visualizar o preview');
      return;
    }

    if (formData.formato === 'toast') {
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
    imagemUrl: formData.imagemUrl || null,
    ctaTexto: formData.ctaTexto || null,
    ctaUrl: formData.ctaUrl || null,
    dispensavel: formData.dispensavel,
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Gerenciar Avisos</h1>
        <p className="text-muted-foreground mt-2">
          Crie e gerencie avisos para seus alunos
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="criar">Criar Aviso</TabsTrigger>
          <TabsTrigger value="lista">Lista de Avisos</TabsTrigger>
        </TabsList>

        {/* Tab: Criar Aviso */}
        <TabsContent value="criar">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Coluna Esquerda: Formulário */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Aviso</CardTitle>
                  <CardDescription>
                    Preencha os dados do aviso que será exibido aos alunos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Usar Template */}
                  <Card className="bg-blue-50 border-blue-200 mb-4">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Usar Template
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Preencha rapidamente com um template existente
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Select
                        value={templateSelecionado}
                        onValueChange={(value) => {
                          setTemplateSelecionado(value);
                          if (value) {
                            useTemplateMutation.mutate({ templateId: value });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um template" />
                        </SelectTrigger>
                        <SelectContent>
                          {templatesQuery.data?.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.nome} ({template.tipo})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  {/* Tipo */}
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo *</Label>
                    <Select
                      value={formData.tipoId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, tipoId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Informativo</SelectItem>
                        <SelectItem value="2">Importante</SelectItem>
                        <SelectItem value="3">Urgente</SelectItem>
                        <SelectItem value="4">Individual</SelectItem>
                        <SelectItem value="5">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Formato */}
                  <div className="space-y-2">
                    <Label htmlFor="formato">Formato de Exibição *</Label>
                    <Select
                      value={formData.formato}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, formato: value })
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

                  {/* Título */}
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título *</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) =>
                        setFormData({ ...formData, titulo: e.target.value })
                      }
                      placeholder="Ex: Nova funcionalidade disponível!"
                    />
                  </div>

                  {/* Conteúdo */}
                  <div className="space-y-2">
                    <Label htmlFor="conteudo">Conteúdo *</Label>
                    <Textarea
                      id="conteudo"
                      value={formData.conteudo}
                      onChange={(e) =>
                        setFormData({ ...formData, conteudo: e.target.value })
                      }
                      placeholder="Descreva o aviso..."
                      rows={4}
                    />
                  </div>

                  {/* Imagem URL */}
                  <div className="space-y-2">
                    <Label htmlFor="imagemUrl">URL da Imagem (opcional)</Label>
                    <Input
                      id="imagemUrl"
                      type="url"
                      value={formData.imagemUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, imagemUrl: e.target.value })
                      }
                      placeholder="https://..."
                    />
                  </div>

                  {/* CTA Texto */}
                  <div className="space-y-2">
                    <Label htmlFor="ctaTexto">Texto do Botão (opcional)</Label>
                    <Input
                      id="ctaTexto"
                      value={formData.ctaTexto}
                      onChange={(e) =>
                        setFormData({ ...formData, ctaTexto: e.target.value })
                      }
                      placeholder="Ex: Saiba mais"
                    />
                  </div>

                  {/* CTA URL */}
                  <div className="space-y-2">
                    <Label htmlFor="ctaUrl">URL do Botão (opcional)</Label>
                    <Input
                      id="ctaUrl"
                      type="url"
                      value={formData.ctaUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, ctaUrl: e.target.value })
                      }
                      placeholder="https://..."
                    />
                  </div>

                  {/* Dispensável */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="dispensavel">Pode ser dispensado?</Label>
                    <Switch
                      id="dispensavel"
                      checked={formData.dispensavel}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, dispensavel: checked })
                      }
                    />
                  </div>

                  {/* Prioridade */}
                  <div className="space-y-2">
                    <Label htmlFor="prioridade">
                      Prioridade (1-10, maior = mais importante)
                    </Label>
                    <Input
                      id="prioridade"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.prioridade}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          prioridade: parseInt(e.target.value) || 5,
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Coluna Direita: Segmentação e Ações */}
              <div className="space-y-6">
                {/* Segmentação Avançada */}
                <SegmentacaoAvancada onChange={setFiltrosSegmentacao} />

                <Card>
                  <CardHeader>
                    <CardTitle>Ações</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handlePreview}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Visualizar Preview
                    </Button>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={createMutation.isPending}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {createMutation.isPending ? 'Salvando...' : 'Salvar Aviso'}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Dicas</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>
                      <strong>Modal:</strong> Ideal para avisos importantes que exigem
                      atenção imediata
                    </p>
                    <p>
                      <strong>Banner:</strong> Perfeito para avisos persistentes que
                      devem ficar visíveis
                    </p>
                    <p>
                      <strong>Toast:</strong> Melhor para notificações rápidas e não
                      intrusivas
                    </p>
                    <p>
                      <strong>Badge:</strong> Apenas adiciona ao contador, sem exibir
                      automaticamente
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </TabsContent>

        {/* Tab: Lista de Avisos */}
        <TabsContent value="lista">
          <Card>
            <CardHeader>
              <CardTitle>Avisos Cadastrados</CardTitle>
              <CardDescription>
                Gerencie todos os avisos criados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {avisosQuery.isLoading ? (
                <p>Carregando...</p>
              ) : avisosQuery.data?.avisos.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum aviso cadastrado ainda
                </p>
              ) : (
                <div className="space-y-4">
                  {avisosQuery.data?.avisos.map((aviso: any) => (
                    <div
                      key={aviso.id}
                      className="border rounded-lg p-4 flex items-start justify-between"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{aviso.titulo}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {aviso.conteudo}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Formato: {aviso.formato}</span>
                          <span>Prioridade: {aviso.prioridade}</span>
                          <span>Status: {aviso.ativo ? 'Ativo' : 'Inativo'}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => publicarMutation.mutate({ avisoId: aviso.id })}
                        >
                          Publicar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => pausarMutation.mutate({ avisoId: aviso.id })}
                        >
                          Pausar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (confirm('Tem certeza que deseja deletar este aviso?')) {
                              deleteMutation.mutate({ avisoId: aviso.id });
                            }
                          }}
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

      {/* Preview Modal */}
      {formData.formato === 'modal' && (
        <AvisoModal
          aviso={previewAviso}
          open={showPreview}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Preview Banner */}
      {formData.formato === 'banner' && showPreview && (
        <div className="fixed top-0 left-0 right-0 z-50 p-4">
          <AvisoBanner
            aviso={previewAviso}
            onDismiss={() => setShowPreview(false)}
          />
        </div>
      )}
    </div>
  );
}
