import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface MaterialFormPageProps {
  params?: { id?: string };
}

/**
 * Página de Formulário de Material (Admin)
 * - Criação e edição de materiais
 * - Integração com árvore do conhecimento
 * - Suporte a múltiplos tipos (PDF, vídeo, link, texto)
 */
export default function MaterialFormPage({ params }: MaterialFormPageProps) {
  console.log('🔵 [MaterialFormPage] ===== COMPONENTE INICIANDO =====');
  console.log('🔵 [MaterialFormPage] URL:', window.location.href);
  console.log('🔵 [MaterialFormPage] params recebidos:', params);
  console.log('🔵 [MaterialFormPage] Timestamp:', new Date().toISOString());
  
  const [, setLocation] = useLocation();
  const materialId = params?.id;
  const isEditing = !!materialId;
  
  console.log('🟢 [MaterialFormPage] materialId:', materialId);
  console.log('🟢 [MaterialFormPage] isEditing:', isEditing);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tipo, setTipo] = useState<string>('pdf');
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [disciplinaId, setDisciplinaId] = useState('');
  const [assuntoId, setAssuntoId] = useState('');
  const [topicoId, setTopicoId] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [category, setCategory] = useState<'base' | 'revisao' | 'promo'>('base');
  const [isPaid, setIsPaid] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [commentsEnabled, setCommentsEnabled] = useState(true);

  // Queries
  const { data: disciplinas } = trpc.disciplinas.getAll.useQuery({});
  const { data: assuntos } = trpc.assuntos.getAll.useQuery({});
  const { data: topicos } = trpc.topicos.getAll.useQuery({});
  
  const { data: materialData, isLoading: loadingMaterial } = trpc.materiais.getById.useQuery(
    { id: materialId! },
    { enabled: isEditing }
  );

  // Mutations
  const createMutation = trpc.materiais.create.useMutation({
    onSuccess: () => {
      toast.success('Material criado com sucesso!');
      setLocation('/admin/materiais');
    },
    onError: (error) => {
      toast.error(`Erro ao criar material: ${error.message}`);
    },
  });

  const updateMutation = trpc.materiais.update.useMutation({
    onSuccess: () => {
      toast.success('Material atualizado com sucesso!');
      setLocation('/admin/materiais');
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar material: ${error.message}`);
    },
  });

  // Load material data for editing
  useEffect(() => {
    if (materialData) {
      setTitle(materialData.title || '');
      setDescription(materialData.description || '');
      setTipo(materialData.tipo || 'pdf');
      setUrl(materialData.url || '');
      setContent(materialData.content || '');
      setDisciplinaId(materialData.disciplinaId || '');
      setAssuntoId(materialData.assuntoId || '');
      setTopicoId(materialData.topicoId || '');
      setAtivo(materialData.ativo ?? true);
    }
  }, [materialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🟡 [MaterialFormPage] ===== HANDLESUBMIT CHAMADO =====');
    console.log('🟡 [MaterialFormPage] title:', title);
    console.log('🟡 [MaterialFormPage] tipo:', tipo);
    console.log('🟡 [MaterialFormPage] disciplinaId:', disciplinaId);
    console.log('🟡 [MaterialFormPage] topicoId:', topicoId);

    if (!title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    if (!disciplinaId) {
      toast.error('Disciplina é obrigatória');
      return;
    }

    if (!assuntoId) {
      toast.error('Assunto é obrigatório');
      return;
    }

    if (tipo !== 'texto' && !url.trim()) {
      toast.error('URL é obrigatória para este tipo de material');
      return;
    }

    const data = {
      title,
      description: description || undefined,
      thumbnailUrl: thumbnailUrl || "https://via.placeholder.com/400x300?text=Material",
      category,
      type: tipo,
      isPaid,
      isAvailable: ativo,
      isFeatured,
      commentsEnabled,
      items: [{
        title,
        type: tipo,
        url: (tipo === 'video' || tipo === 'link') ? url : undefined,
        filePath: tipo === 'texto' ? content : undefined,
        duration: undefined,
        fileSize: undefined,
        order: 0
      }],
      links: [{
        disciplinaId,
        assuntoId,
        topicoId: topicoId && topicoId !== 'none' ? topicoId : undefined
      }]
    };

    console.log('🚀 [MaterialFormPage] Enviando estrutura completa:', JSON.stringify(data, null, 2));

    if (isEditing) {
      updateMutation.mutate({ id: materialId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isEditing && loadingMaterial) {
    return (
      <AdminLayout title="Carregando..." breadcrumbs={[]}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isEditing ? 'Editar Material' : 'Novo Material'}
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Materiais', href: '/admin/materiais' },
        { label: isEditing ? 'Editar' : 'Novo' },
      ]}
      actions={
        <Button variant="outline" onClick={() => setLocation('/admin/materiais')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>Dados principais do material</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Apostila de Direito Constitucional"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição detalhada do material..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="tipo">Tipo de Material *</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">📄 PDF</SelectItem>
                  <SelectItem value="video">🎥 Vídeo</SelectItem>
                  <SelectItem value="link">🔗 Link Externo</SelectItem>
                  <SelectItem value="texto">📝 Texto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {tipo !== 'texto' && (
              <div>
                <Label htmlFor="url">URL *</Label>
                <Input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  required={tipo !== 'texto'}
                />
              </div>
            )}

            {tipo === 'texto' && (
              <div>
                <Label htmlFor="content">Conteúdo</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Conteúdo do material..."
                  rows={10}
                />
              </div>
            )}

            {/* Thumbnail */}
            <div>
              <Label htmlFor="thumbnail">Imagem de Capa (URL)</Label>
              <Input
                id="thumbnail"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg (opcional)"
              />
            </div>

            {/* Category */}
            <div>
              <Label>Categoria *</Label>
              <Select value={category} onValueChange={(value: any) => setCategory(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="base">📚 Material Base</SelectItem>
                  <SelectItem value="revisao">🔄 Revisão</SelectItem>
                  <SelectItem value="promo">🎁 Promocional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* isPaid */}
            <div className="flex items-center space-x-2">
              <Switch 
                id="isPaid"
                checked={isPaid} 
                onCheckedChange={setIsPaid}
              />
              <Label htmlFor="isPaid">Material Pago</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="ativo"
                checked={ativo}
                onCheckedChange={setAtivo}
              />
              <Label htmlFor="ativo" className="cursor-pointer">
                Material ativo (visível para alunos)
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Árvore do Conhecimento */}
        <Card>
          <CardHeader>
            <CardTitle>Árvore do Conhecimento</CardTitle>
            <CardDescription>Vincule o material a disciplina, assunto e tópico</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="disciplina">Disciplina *</Label>
              <Select value={disciplinaId} onValueChange={setDisciplinaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a disciplina" />
                </SelectTrigger>
                <SelectContent>
                  {disciplinas?.items?.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="assunto">Assunto *</Label>
              <Select value={assuntoId} onValueChange={setAssuntoId} disabled={!disciplinaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o assunto" />
                </SelectTrigger>
                <SelectContent>
                  {assuntos?.items
                    ?.filter((a) => a.disciplinaId === disciplinaId)
                    .map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="topico">Tópico (Opcional)</Label>
              <Select value={topicoId} onValueChange={setTopicoId} disabled={!assuntoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tópico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {topicos?.items
                    ?.filter((t) => t.assuntoId === assuntoId)
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setLocation('/admin/materiais')}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {(createMutation.isPending || updateMutation.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? 'Salvar Alterações' : 'Criar Material'}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}
