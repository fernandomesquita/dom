/**
 * Statistics - Dashboard de estatísticas do aluno
 */

import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  Flame,
  Trophy,
  Brain,
} from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Badge } from '@/components/ui/badge';

export default function Statistics() {
  const { user } = useAuth();

  // Queries
  const { data: userStats, isLoading: statsLoading } = trpc.questions.getUserStats.useQuery();
  const { data: evolution, isLoading: evolutionLoading } = trpc.questions.getEvolution.useQuery({
    days: 30,
  });
  const { data: comparison, isLoading: comparisonLoading } =
    trpc.questions.compareWithClass.useQuery();

  const isLoading = statsLoading || evolutionLoading || comparisonLoading;

  if (isLoading) {
    return (
      <div className="container max-w-7xl py-8">
        <div className="space-y-6">
          <Skeleton className="h-12 w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="container max-w-7xl py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p>Nenhuma estatística disponível ainda.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Comece a resolver questões para ver suas estatísticas!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const accuracyRate = userStats.totalAttempts > 0
    ? (userStats.correctCount / userStats.totalAttempts) * 100
    : 0;

  const avgTimePerQuestion = 0; // TODO: implementar tracking de tempo

  // Cores para gráficos
  const COLORS = {
    correct: '#10b981',
    wrong: '#ef4444',
    easy: '#3b82f6',
    medium: '#f59e0b',
    hard: '#ef4444',
  };

  // Dados para gráfico de pizza (acertos vs erros)
  const accuracyData = [
    { name: 'Acertos', value: userStats.correctCount, color: COLORS.correct },
    { name: 'Erros', value: userStats.wrongCount, color: COLORS.wrong },
  ];

  // Dados para gráfico de dificuldade (placeholder - dados não disponíveis ainda)
  const difficultyData = [
    { name: 'Fácil', acertos: 0, erros: 0 },
    { name: 'Média', acertos: 0, erros: 0 },
    { name: 'Difícil', acertos: 0, erros: 0 },
  ];

  return (
    <div className="container max-w-7xl py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Estatísticas</h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe seu desempenho e evolução
          </p>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total de questões */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Resolvidas</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.totalAttempts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Questões resolvidas
              </p>
            </CardContent>
          </Card>

          {/* Taxa de acerto */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Acerto</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {accuracyRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {userStats.correctCount} acertos de {userStats.totalAttempts}
              </p>
            </CardContent>
          </Card>

          {/* Tempo médio */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(avgTimePerQuestion)}s
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Por questão
              </p>
            </CardContent>
          </Card>

          {/* Streak */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Streak Atual</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                0 dias
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Continue assim!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="evolution" className="space-y-4">
          <TabsList>
            <TabsTrigger value="evolution">Evolução</TabsTrigger>
            <TabsTrigger value="performance">Desempenho</TabsTrigger>
            <TabsTrigger value="comparison">Comparação</TabsTrigger>
          </TabsList>

          {/* Tab: Evolução */}
          <TabsContent value="evolution" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Evolução nos Últimos 30 Dias</CardTitle>
                <CardDescription>
                  Acompanhe seu progresso diário
                </CardDescription>
              </CardHeader>
              <CardContent>
                {evolution && evolution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={evolution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return `${date.getDate()}/${date.getMonth() + 1}`;
                        }}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(value) => {
                          const date = new Date(value as string);
                          return date.toLocaleDateString('pt-BR');
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="correctCount"
                        stroke={COLORS.correct}
                        name="Acertos"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="wrongCount"
                        stroke={COLORS.wrong}
                        name="Erros"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum dado de evolução disponível
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Desempenho */}
          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Acertos vs Erros */}
              <Card>
                <CardHeader>
                  <CardTitle>Acertos vs Erros</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={accuracyData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {accuracyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Desempenho por Dificuldade */}
              <Card>
                <CardHeader>
                  <CardTitle>Por Dificuldade</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={difficultyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="acertos" fill={COLORS.correct} name="Acertos" />
                      <Bar dataKey="erros" fill={COLORS.wrong} name="Erros" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Comparação */}
          <TabsContent value="comparison" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Comparação com a Turma
                </CardTitle>
                <CardDescription>
                  Veja como você está em relação aos outros alunos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {comparison ? (
                  <>
                    {/* Comparação geral */}
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Comparação com a Turma</p>
                      <p className="text-lg">
                        Você resolveu <span className="font-bold">{userStats.totalAttempts}</span> questões
                        com <span className="font-bold text-green-600">{accuracyRate.toFixed(1)}%</span> de acerto.
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Média da turma: <span className="font-semibold">{comparison.classAverage.toFixed(1)}%</span>
                      </p>
                    </div>

                    {/* Comparação de métricas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">Taxa de Acerto</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold">
                            {accuracyRate.toFixed(1)}%
                          </span>
                          <Badge variant={accuracyRate >= comparison.classAverage ? 'default' : 'secondary'}>
                            {accuracyRate >= comparison.classAverage ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : null}
                            Média: {comparison.classAverage.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">Questões Resolvidas</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold">{userStats.totalAttempts}</span>
                          <Badge variant="secondary">
                            Total da turma: {comparison.userTotal}
                          </Badge>
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">Tempo Médio</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold">
                            {Math.round(avgTimePerQuestion)}s
                          </span>
                          <Badge variant="secondary">
                            -
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Dados de comparação não disponíveis
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
