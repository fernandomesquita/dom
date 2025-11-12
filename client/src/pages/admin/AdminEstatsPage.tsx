import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, Target, MessageSquare, TrendingUp, Activity } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

/**
 * Página de Estatísticas Admin
 * 
 * Dashboard com métricas gerais da plataforma:
 * - Total de usuários
 * - Questões respondidas
 * - Metas ativas
 * - Atividade no fórum
 * - Gráficos de crescimento
 */
export default function AdminEstatsPage() {
  // Buscar estatísticas gerais
  const { data: overview, isLoading: loadingOverview } = trpc.adminStats.getOverview.useQuery();
  
  // Buscar crescimento de usuários (últimos 6 meses)
  const { data: userGrowth, isLoading: loadingGrowth } = trpc.adminStats.getUserGrowth.useQuery({ months: 6 });
  
  // Buscar atividade diária (últimos 30 dias)
  const { data: dailyActivity, isLoading: loadingActivity } = trpc.adminStats.getDailyActivity.useQuery({ days: 30 });
  
  // Buscar top usuários
  const { data: topUsers, isLoading: loadingTopUsers } = trpc.adminStats.getTopUsers.useQuery({ limit: 10 });

  const stats = overview || {
    totalUsers: 0,
    activeUsers: 0,
    totalQuestions: 0,
    questionsThisMonth: 0,
    activeGoals: 0,
    completedGoals: 0,
    forumThreads: 0,
    forumPosts: 0,
  };

  const statCards = [
    {
      title: 'Total de Usuários',
      value: stats.totalUsers.toLocaleString('pt-BR'),
      subtitle: `${stats.activeUsers} ativos`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Questões Respondidas',
      value: stats.totalQuestions.toLocaleString('pt-BR'),
      subtitle: `${stats.questionsThisMonth} este mês`,
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Metas Ativas',
      value: stats.activeGoals.toLocaleString('pt-BR'),
      subtitle: `${stats.completedGoals} concluídas`,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Atividade no Fórum',
      value: stats.forumThreads.toLocaleString('pt-BR'),
      subtitle: `${stats.forumPosts} posts`,
      icon: MessageSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <AdminLayout
      title="Estatísticas"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Estatísticas' },
      ]}
    >
      <div className="space-y-6">
        {/* Cards de Estatísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`rounded-full p-2 ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.subtitle}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Gráficos */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Gráfico de Crescimento de Usuários */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Crescimento de Usuários
              </CardTitle>
              <CardDescription>
                Novos usuários nos últimos 6 meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingGrowth ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Carregando...</p>
                </div>
              ) : userGrowth && userGrowth.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const [year, month] = value.split('-');
                        return `${month}/${year.slice(2)}`;
                      }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      labelFormatter={(value) => {
                        const [year, month] = value.split('-');
                        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                        return `${monthNames[parseInt(month) - 1]} ${year}`;
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Novos Usuários"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground">Sem dados disponíveis</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gráfico de Atividade Diária */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Atividade Diária
              </CardTitle>
              <CardDescription>
                Questões respondidas por dia (últimos 30 dias)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingActivity ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Carregando...</p>
                </div>
              ) : dailyActivity && dailyActivity.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getDate()}/${date.getMonth() + 1}`;
                      }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      labelFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString('pt-BR');
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="questions" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Questões Respondidas"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground">Sem dados disponíveis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Top Usuários */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Usuários Mais Ativos</CardTitle>
            <CardDescription>
              Usuários com mais questões respondidas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingTopUsers ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Carregando...</p>
              </div>
            ) : topUsers && topUsers.length > 0 ? (
              <div className="space-y-4">
                {topUsers.map((user, i) => (
                  <div key={user.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{user.questionsAnswered} questões</p>
                      <p className="text-sm text-muted-foreground">
                        {user.accuracy}% acerto
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Nenhum usuário encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
