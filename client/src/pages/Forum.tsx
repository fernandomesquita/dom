import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { MessageCircle, Pin, TrendingUp, Users } from 'lucide-react';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Página Principal do Fórum
 * Lista categorias e threads recentes
 */
export default function Forum() {
  const { user, isAuthenticated } = useAuth();

  // Buscar categorias
  const { data: categories, isLoading: loadingCategories } = trpc.forumCategories.list.useQuery();

  // Buscar threads recentes
  const { data: threadsData, isLoading: loadingThreads } = trpc.forumThreads.list.useQuery({
    ordenar: 'atividade',
    limit: 10,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Fórum Colaborativo</h1>
              <p className="text-gray-600 mt-2">
                Tire dúvidas e compartilhe conhecimento com outros concurseiros
              </p>
            </div>

            {isAuthenticated ? (
              <Link href="/forum/novo">
                <Button size="lg">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Nova Discussão
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button size="lg">Entrar para Participar</Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Categorias */}
            <Card>
              <CardHeader>
                <CardTitle>Categorias</CardTitle>
                <CardDescription>Explore as discussões por categoria</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingCategories ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categories?.map((cat) => (
                      <Link key={cat.id} href={`/forum/categoria/${cat.id}`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div
                                className="text-3xl"
                                style={{ color: cat.cor || '#3B82F6' }}
                              >
                                {cat.icone || '📁'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900">{cat.nome}</h3>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {cat.descricao}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Threads Recentes */}
            <Card>
              <CardHeader>
                <CardTitle>Discussões Recentes</CardTitle>
                <CardDescription>Últimas atividades no fórum</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingThreads ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : threadsData?.threads.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhuma discussão ainda.</p>
                    <p className="text-sm mt-1">Seja o primeiro a iniciar uma conversa!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {threadsData?.threads.map(({ thread, categoria, autor }) => (
                      <Link key={thread.id} href={`/forum/thread/${thread.id}`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  {thread.isPinned && (
                                    <Pin className="w-4 h-4 text-blue-600" />
                                  )}
                                  <h3 className="font-semibold text-gray-900 line-clamp-1">
                                    {thread.titulo}
                                  </h3>
                                </div>

                                <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                                  <span>Por {autor?.nome || 'Anônimo'}</span>
                                  <span>•</span>
                                  <Badge variant="secondary">{categoria?.nome}</Badge>
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
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Estatísticas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total de Discussões</span>
                  <span className="font-semibold">{threadsData?.total || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Categorias</span>
                  <span className="font-semibold">{categories?.length || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Regras */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Regras do Fórum</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✅ Seja respeitoso com todos</li>
                  <li>✅ Mantenha o foco em concursos</li>
                  <li>✅ Busque antes de postar</li>
                  <li>❌ Sem spam ou autopromoção</li>
                  <li>❌ Sem compartilhar contatos</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
