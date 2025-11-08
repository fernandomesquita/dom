import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { trpc } from '@/lib/trpc';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

/**
 * Página de Criação de Novo Thread
 */
export default function ForumNovoThread() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const utils = trpc.useUtils();

  // Buscar categorias
  const { data: categories, isLoading: loadingCategories } = trpc.forumCategories.list.useQuery();

  // Criar thread
  const createThreadMutation = trpc.forumThreads.create.useMutation({
    onSuccess: (thread) => {
      toast.success('Discussão criada com sucesso!');
      utils.forumThreads.list.invalidate();
      setLocation(`/forum/thread/${thread.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Redirecionar se não autenticado
  if (!isAuthenticated) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-600 mb-4">Você precisa estar logado para criar uma discussão</p>
            <Link href="/login">
              <Button>Fazer Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (!tag) return;

    if (tags.length >= 5) {
      toast.error('Máximo de 5 tags');
      return;
    }

    if (tags.includes(tag)) {
      toast.error('Tag já adicionada');
      return;
    }

    setTags([...tags, tag]);
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo.trim()) {
      toast.error('Digite um título');
      return;
    }

    if (titulo.length < 10) {
      toast.error('Título deve ter pelo menos 10 caracteres');
      return;
    }

    if (!conteudo.trim()) {
      toast.error('Digite o conteúdo');
      return;
    }

    if (conteudo.length < 20) {
      toast.error('Conteúdo deve ter pelo menos 20 caracteres');
      return;
    }

    if (!categoriaId) {
      toast.error('Selecione uma categoria');
      return;
    }

    createThreadMutation.mutate({
      titulo,
      conteudo,
      categoriaId,
      tags: tags.length > 0 ? tags : undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container py-6">
          <Link href="/forum">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Fórum
            </Button>
          </Link>

          <h1 className="text-2xl font-bold text-gray-900">Nova Discussão</h1>
          <p className="text-gray-600 mt-1">
            Compartilhe suas dúvidas e conhecimentos com a comunidade
          </p>
        </div>
      </div>

      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Criar Nova Discussão</CardTitle>
                <CardDescription>
                  Preencha os campos abaixo para iniciar uma nova discussão
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Categoria */}
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select value={categoriaId} onValueChange={setCategoriaId}>
                    <SelectTrigger id="categoria">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingCategories ? (
                        <SelectItem value="loading" disabled>
                          Carregando...
                        </SelectItem>
                      ) : (
                        categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.icone} {cat.nome}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Título */}
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    placeholder="Ex: Como estudar Direito Constitucional?"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    maxLength={200}
                  />
                  <p className="text-sm text-gray-500">
                    {titulo.length}/200 caracteres (mínimo 10)
                  </p>
                </div>

                {/* Conteúdo */}
                <div className="space-y-2">
                  <Label htmlFor="conteudo">Conteúdo *</Label>
                  <Textarea
                    id="conteudo"
                    placeholder="Descreva sua dúvida ou compartilhe seu conhecimento..."
                    value={conteudo}
                    onChange={(e) => setConteudo(e.target.value)}
                    rows={12}
                  />
                  <p className="text-sm text-gray-500">
                    {conteudo.length} caracteres (mínimo 20)
                  </p>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (opcional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tags"
                      placeholder="Ex: direito-constitucional"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={handleAddTag}>
                      Adicionar
                    </Button>
                  </div>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  )}

                  <p className="text-sm text-gray-500">
                    {tags.length}/5 tags (pressione Enter ou clique em Adicionar)
                  </p>
                </div>

                {/* Dicas */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">💡 Dicas para uma boa discussão</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>✅ Seja claro e objetivo no título</li>
                      <li>✅ Descreva o contexto da sua dúvida</li>
                      <li>✅ Use tags para facilitar a busca</li>
                      <li>✅ Seja respeitoso com todos</li>
                      <li>❌ Evite compartilhar contatos pessoais</li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Botões */}
                <div className="flex items-center gap-3">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={createThreadMutation.isPending}
                  >
                    {createThreadMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      'Criar Discussão'
                    )}
                  </Button>

                  <Link href="/forum">
                    <Button type="button" variant="outline" size="lg">
                      Cancelar
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
