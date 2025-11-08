import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { ArrowLeft, MessageCircle, Pin, Users } from 'lucide-react';
import { Link, useParams } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Página de Categoria do Fórum
 * Lista threads de uma categoria específica
 */
export default function ForumCategoria() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();

  // Buscar categoria
  const { data: categories } = trpc.forumCategories.list.useQuery();
  const categoria = categories?.find((c) => c.id === id);

  // Buscar threads da categoria
  const { data: threadsData, isLoading: loadingThreads } = trpc.forumThreads.list.useQuery(
    {
      categoriaId: id,
      ordenar: 'atividade',
      limit: 20,
    },
    { enabled: !!id }
  );

  if (!categoria) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="p-12 text-center text-gray-500">
            <p>Categoria não encontrada</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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

          <div className="flex items-start gap-4">
            <div className="text-5xl" style={{ color: categoria.cor || '#3B82F6' }}>
              {categoria.icone || '📁'}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{categoria.nome}</h1>
              {categoria.descricao && (
                <p className="text-gray-600 mt-2">{categoria.descricao}</p>
              )}
            </div>

            {isAuthenticated && (
              <Link href="/forum/novo">
                <Button size="lg">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Nova Discussão
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Estatísticas */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  {threadsData?.total || 0} discussões
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Threads */}
          {loadingThreads ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : threadsData?.threads.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma discussão nesta categoria ainda.</p>
                <p className="text-sm mt-1">Seja o primeiro a iniciar uma conversa!</p>
                {isAuthenticated && (
                  <Link href="/forum/novo">
                    <Button className="mt-4">Criar Discussão</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {threadsData?.threads.map(({ thread, autor }) => (
                <Link key={thread.id} href={`/forum/thread/${thread.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {thread.isPinned && <Pin className="w-4 h-4 text-blue-600" />}
                            <h3 className="font-semibold text-gray-900 line-clamp-1">
                              {thread.titulo}
                            </h3>
                          </div>

                          <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                            <span>Por {autor?.nome || 'Anônimo'}</span>
                            <span>•</span>
                            <span>
                              {new Date(thread.criadoEm).toLocaleDateString('pt-BR')}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" />
                              {thread.totalMensagens} respostas
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {thread.visualizacoes} visualizações
                            </span>
                          </div>

                          {thread.tags && JSON.parse(thread.tags).length > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                              {JSON.parse(thread.tags).map((tag: string) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* Paginação */}
          {threadsData && threadsData.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button variant="outline" disabled={threadsData.page === 1}>
                Anterior
              </Button>
              <span className="text-sm text-gray-600">
                Página {threadsData.page} de {threadsData.totalPages}
              </span>
              <Button variant="outline" disabled={threadsData.page === threadsData.totalPages}>
                Próxima
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
