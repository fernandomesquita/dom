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
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye, Copy } from 'lucide-react';

export default function AvisosTemplates() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    tipo: 'informativo' as 'informativo' | 'importante' | 'urgente' | 'individual' | 'premium',
    conteudoTemplate: '',
  });

  // Queries
  const templatesQuery = trpc.avisosTemplates.listTemplates.useQuery({});
  const variaveisQuery = trpc.avisosTemplates.getVariaveisDisponiveis.useQuery();
  const previewQuery = trpc.avisosTemplates.previewExemplo.useQuery(
    { conteudo: formData.conteudoTemplate },
    { enabled: formData.conteudoTemplate.length > 0 }
  );

  // Mutations
  const createMutation = trpc.avisosTemplates.createTemplate.useMutation({
    onSuccess: () => {
      toast.success('Template criado com sucesso!');
      templatesQuery.refetch();
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const updateMutation = trpc.avisosTemplates.updateTemplate.useMutation({
    onSuccess: () => {
      toast.success('Template atualizado com sucesso!');
      templatesQuery.refetch();
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const deleteMutation = trpc.avisosTemplates.deleteTemplate.useMutation({
    onSuccess: () => {
      toast.success('Template excluído com sucesso!');
      templatesQuery.refetch();
    },
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      tipo: 'informativo',
      conteudoTemplate: '',
    });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (template: any) => {
    setFormData({
      nome: template.nome,
      descricao: template.descricao || '',
      tipo: template.tipo,
      conteudoTemplate: template.conteudoTemplate,
    });
    setEditingId(template.id);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este template?')) {
      deleteMutation.mutate({ id });
    }
  };

  const handlePreview = (conteudo: string) => {
    setPreviewContent(conteudo);
    setPreviewOpen(true);
  };

  const insertarVariavel = (variavel: string) => {
    setFormData({
      ...formData,
      conteudoTemplate: formData.conteudoTemplate + variavel,
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Templates de Avisos</h1>
          <p className="text-muted-foreground mt-2">
            Crie templates reutilizáveis com variáveis dinâmicas
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Editar Template' : 'Novo Template'}
              </DialogTitle>
              <DialogDescription>
                Use variáveis dinâmicas como {{nome}}, {{email}}, {{plano}} no conteúdo
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Template *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Boas-vindas Novo Aluno"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Breve descrição do template"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}
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

              <div className="space-y-2">
                <Label>Variáveis Disponíveis</Label>
                <div className="flex flex-wrap gap-2">
                  {variaveisQuery.data?.map((v) => (
                    <Button
                      key={v.nome}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertarVariavel(v.nome)}
                      title={v.descricao}
                    >
                      <Copy className="mr-1 h-3 w-3" />
                      {v.nome}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="conteudoTemplate">Conteúdo do Template *</Label>
                <Textarea
                  id="conteudoTemplate"
                  value={formData.conteudoTemplate}
                  onChange={(e) =>
                    setFormData({ ...formData, conteudoTemplate: e.target.value })
                  }
                  placeholder="Olá {{nome}}! Bem-vindo à plataforma..."
                  rows={6}
                  required
                />
              </div>

              {previewQuery.data && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Preview com Dados de Exemplo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{previewQuery.data.preview}</p>
                    {previewQuery.data.variaveis.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {previewQuery.data.variaveis.map((v) => (
                          <Badge key={v} variant="secondary" className="text-xs">
                            {v}
                          </Badge>
                        ))}
                      </div>
                    )}
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
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingId ? 'Atualizar' : 'Criar'} Template
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Templates */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templatesQuery.data?.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{template.nome}</CardTitle>
                  {template.descricao && (
                    <CardDescription className="mt-1">
                      {template.descricao}
                    </CardDescription>
                  )}
                </div>
                <Badge variant="outline">{template.tipo}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground line-clamp-3">
                  {template.conteudoTemplate}
                </div>

                {template.variaveisDisponiveis &&
                  Array.isArray(template.variaveisDisponiveis) &&
                  template.variaveisDisponiveis.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {template.variaveisDisponiveis.map((v: string) => (
                        <Badge key={v} variant="secondary" className="text-xs">
                          {v}
                        </Badge>
                      ))}
                    </div>
                  )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-muted-foreground">
                    Usado {template.usadoCount || 0}x
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreview(template.conteudoTemplate)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de Preview */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Preview do Template</DialogTitle>
            <DialogDescription>
              Visualização com dados de exemplo
            </DialogDescription>
          </DialogHeader>
          <div className="whitespace-pre-wrap text-sm">{previewContent}</div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

