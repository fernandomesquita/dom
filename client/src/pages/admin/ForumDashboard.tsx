import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import {
  MessageCircle,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Ban,
  TrendingUp,
  Eye,
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

/**
 * Dashboard Administrativo do Fórum
 * Visão geral de estatísticas e atividades
 */
export default function ForumDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Verificar permissão
  if (user?.role !== 'admin') {
    setLocation('/forum');
    return null;
  }

  // Buscar estatísticas de moderação
  const { data: moderationStats, isLoading: loadingModeration } =
    trpc.forumModeration.getStats.useQuery();

  // Buscar threads recentes
  const { data: recentThreads, isLoading: loadingThreads } = trpc.forumThreads.list.useQuery({
    ordenar: 'recente',
    limit: 10,
  });

  // Buscar categorias
  const { data: categories } = trpc.forumCategories.listAll.useQuery();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard do Fórum</h1>
              <p className="text-gray-600 mt-1">Visão geral e gerenciamento</p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/admin/forum/moderation">
                <Button variant="outline">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Moderação
                </Button>
              </Link>
              <Link href="/forum">
                <Button>Ver Fórum</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="space-y-8">
          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total de Threads */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total de Discussões</p>
                    {loadingThreads ? (
                      <Skeleton className="h-8 w-20 mt-2" />
                    ) : (
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        {recentThreads?.total || 0}
                      </p>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pendentes de Moderação */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pendentes</p>
                    {loadingModeration ? (
                      <Skeleton className="h-8 w-20 mt-2" />
                    ) : (
                      <p className="text-3xl font-bold text-orange-600 mt-1">
                        {moderationStats?.pendentes || 0}
                      </p>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Aprovados */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Aprovados</p>
                    {loadingModeration ? (
                      <Skeleton className="h-8 w-20 mt-2" />
                    ) : (
                      <p className="text-3xl font-bold text-green-600 mt-1">
                        {moderationStats?.aprovados || 0}
                      </p>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usuários Suspensos */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Suspensos</p>
                    {loadingModeration ? (
                      <Skeleton className="h-8 w-20 mt-2" />
                    ) : (
                      <p className="text-3xl font-bold text-red-600 mt-1">
                        {moderationStats?.usuariosSuspensos || 0}
                      </p>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Ban className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Categorias */}
            <Card>
              <CardHeader>
                <CardTitle>Categorias</CardTitle>
                <CardDescription>Gerenciar categorias do fórum</CardDescription>
              </CardHeader>
              <CardContent>
                {categories?.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Nenhuma categoria</p>
                ) : (
                  <div className="space-y-3">
                    {categories?.map((cat) => (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl" style={{ color: cat.cor || '#3B82F6' }}>
                            {cat.icone || '📁'}
                          </span>
                          <div>
                            <p className="font-semibold text-gray-900">{cat.nome}</p>
                            {cat.descricao && (
                              <p className="text-sm text-gray-600">{cat.descricao}</p>
                            )}
                          </div>
                        </div>
                        <Badge variant={cat.isAtiva ? 'default' : 'secondary'}>
                          {cat.isAtiva ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Discussões Recentes */}
            <Card>
              <CardHeader>
                <CardTitle>Discussões Recentes</CardTitle>
                <CardDescription>Últimas 10 discussões criadas</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingThreads ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : recentThreads?.threads.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Nenhuma discussão</p>
                ) : (
                  <div className="space-y-3">
                    {recentThreads?.threads.map(({ thread, autor, categoria }) => (
                      <Link key={thread.id} href={`/forum/thread/${thread.id}`}>
                        <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 line-clamp-1">
                                {thread.titulo}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                <span>{autor?.nome || 'Anônimo'}</span>
                                <span>•</span>
                                <Badge variant="outline" className="text-xs">
                                  {categoria?.nome}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {thread.visualizacoes}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="w-4 h-4" />
                                {thread.totalMensagens}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>Gerenciamento do fórum</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/admin/forum/moderation">
                  <Button variant="outline" className="w-full justify-start" size="lg">
                    <AlertTriangle className="w-5 h-5 mr-3" />
                    Fila de Moderação
                  </Button>
                </Link>

                <Link href="/admin/forum/categories">
                  <Button variant="outline" className="w-full justify-start" size="lg">
                    <MessageCircle className="w-5 h-5 mr-3" />
                    Gerenciar Categorias
                  </Button>
                </Link>

                <Link href="/admin/forum/suspensions">
                  <Button variant="outline" className="w-full justify-start" size="lg">
                    <Ban className="w-5 h-5 mr-3" />
                    Usuários Suspensos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
