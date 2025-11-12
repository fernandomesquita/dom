import { useAuth } from '@/_core/hooks/useAuth';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import {
  MessageCircle,
  Users,
  ThumbsUp,
  Ban,
  TrendingUp,
  Eye,
  Pin,
  Lock,
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

  // Verificar permissão (apenas ADMIN ou MASTER)
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MASTER')) {
    setLocation('/forum');
    return null;
  }

  // Buscar estatísticas gerais
  const { data: stats, isLoading: loadingStats } = trpc.forumStats.getOverview.useQuery();

  // Buscar threads recentes
  const { data: recentThreads, isLoading: loadingThreads } = trpc.forumStats.getRecentThreads.useQuery({
    limit: 10,
  });

  // Buscar threads populares
  const { data: popularThreads, isLoading: loadingPopular } = trpc.forumStats.getPopularThreads.useQuery({
    limit: 10,
    periodo: '30d',
  });

  // Buscar usuários mais ativos
  const { data: topUsers, isLoading: loadingUsers } = trpc.forumStats.getTopUsers.useQuery({
    limit: 10,
    tipo: 'threads',
  });

  return (
    <AdminLayout
      title="Dashboard do Fórum"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Fórum' },
      ]}
      actions={
        <div className="flex items-center gap-3">
          <Link href="/admin/forum/moderacao">
            <Button variant="outline">
              <Ban className="w-4 h-4 mr-2" />
              Moderação
            </Button>
          </Link>
          <Link href="/forum">
            <Button>Ver Fórum</Button>
          </Link>
        </div>
      }
    >

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
                    {loadingStats ? (
                      <Skeleton className="h-8 w-20 mt-2" />
                    ) : (
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        {stats?.totalThreads || 0}
                      </p>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total de Respostas */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total de Respostas</p>
                    {loadingStats ? (
                      <Skeleton className="h-8 w-20 mt-2" />
                    ) : (
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        {stats?.totalMessages || 0}
                      </p>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usuários Ativos */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Usuários Ativos</p>
                    {loadingStats ? (
                      <Skeleton className="h-8 w-20 mt-2" />
                    ) : (
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        {stats?.activeUsers || 0}
                      </p>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usuários Suspensos */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Usuários Suspensos</p>
                    {loadingStats ? (
                      <Skeleton className="h-8 w-20 mt-2" />
                    ) : (
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        {stats?.suspendedUsers || 0}
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

          {/* Estatísticas Adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total de Upvotes</p>
                    {loadingStats ? (
                      <Skeleton className="h-8 w-20 mt-2" />
                    ) : (
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {stats?.totalUpvotes || 0}
                      </p>
                    )}
                  </div>
                  <ThumbsUp className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Threads Fixadas</p>
                    {loadingStats ? (
                      <Skeleton className="h-8 w-20 mt-2" />
                    ) : (
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {stats?.pinnedThreads || 0}
                      </p>
                    )}
                  </div>
                  <Pin className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Threads Trancadas</p>
                    {loadingStats ? (
                      <Skeleton className="h-8 w-20 mt-2" />
                    ) : (
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {stats?.lockedThreads || 0}
                      </p>
                    )}
                  </div>
                  <Lock className="w-8 h-8 text-gray-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Threads Recentes e Populares */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Threads Recentes */}
            <Card>
              <CardHeader>
                <CardTitle>Discussões Recentes</CardTitle>
                <CardDescription>Últimas 10 threads criadas</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingThreads ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentThreads?.map((thread) => (
                      <Link key={thread.id} href={`/forum/thread/${thread.id}`}>
                        <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 line-clamp-1">
                                {thread.titulo}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Por {thread.userName || 'Anônimo'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              {thread.fixado && (
                                <Badge variant="secondary">
                                  <Pin className="w-3 h-3" />
                                </Badge>
                              )}
                              {thread.trancado && (
                                <Badge variant="secondary">
                                  <Lock className="w-3 h-3" />
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" />
                              {thread.totalRespostas || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {thread.visualizacoes || 0}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Threads Populares */}
            <Card>
              <CardHeader>
                <CardTitle>Discussões Populares</CardTitle>
                <CardDescription>Mais visualizadas nos últimos 30 dias</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingPopular ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {popularThreads?.map((thread, index) => (
                      <Link key={thread.id} href={`/forum/thread/${thread.id}`}>
                        <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-blue-600">
                                {index + 1}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 line-clamp-1">
                                {thread.titulo}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Por {thread.userName || 'Anônimo'}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Eye className="w-4 h-4" />
                                  {thread.visualizacoes || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="w-4 h-4" />
                                  {thread.totalRespostas || 0}
                                </span>
                              </div>
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

          {/* Usuários Mais Ativos */}
          <Card>
            <CardHeader>
              <CardTitle>Usuários Mais Ativos</CardTitle>
              <CardDescription>Top 10 usuários por threads criadas</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {topUsers?.map((user, index) => (
                    <div
                      key={user.userId}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-purple-600">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.userName}</p>
                          <p className="text-sm text-gray-600">{user.userEmail}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {user.count} threads
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
