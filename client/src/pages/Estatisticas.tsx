import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { BarChart3, TrendingUp, Target, Clock, Award, Calendar, PieChart as PieChartIcon } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Página de Estatísticas do Aluno
 * 
 * Exibe métricas detalhadas de desempenho:
 * - Questões respondidas (total, acertos, erros, taxa)
 * - Tempo de estudo
 * - Metas cumpridas
 * - Gráficos de evolução (últimos 30 dias)
 * - Desempenho por dificuldade
 */

const COLORS = {
  acertos: "#22c55e", // verde
  erros: "#ef4444", // vermelho
  metas: "#3b82f6", // azul
};

export default function Estatisticas() {
  // Queries para buscar estatísticas
  const { data: stats, isLoading: loadingStats } = trpc.dashboard.getStats.useQuery();
  const { data: progressoSemanal, isLoading: loadingProgresso } = trpc.dashboard.getProgressoSemanal.useQuery();
  const { data: evolucao, isLoading: loadingEvolucao } = trpc.dashboard.getEvolucao30Dias.useQuery();
  const { data: desempenhoDificuldade, isLoading: loadingDificuldade } = trpc.dashboard.getDesempenhoPorDificuldade.useQuery();

  const isLoading = loadingStats || loadingProgresso || loadingEvolucao || loadingDificuldade;

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Dados para o gráfico de pizza (Acertos vs Erros)
  const pieData = [
    { name: "Acertos", value: stats?.totalQuestoes ? Math.round((stats.taxaAcerto / 100) * stats.totalQuestoes) : 0 },
    { name: "Erros", value: stats?.totalQuestoes ? stats.totalQuestoes - Math.round((stats.taxaAcerto / 100) * stats.totalQuestoes) : 0 },
  ];

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Estatísticas</h1>
        <p className="text-muted-foreground">
          Acompanhe seu desempenho e progresso nos estudos
        </p>
      </div>

      {/* Cards de Estatísticas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total de Questões */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Questões
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalQuestoes || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              questões respondidas
            </p>
          </CardContent>
        </Card>

        {/* Taxa de Acerto */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Acerto
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.taxaAcerto || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              de acertos nas questões
            </p>
          </CardContent>
        </Card>

        {/* Metas Cumpridas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Metas Cumpridas
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.metasCumpridas || 0}/{stats?.metasTotal || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              metas concluídas
            </p>
          </CardContent>
        </Card>

        {/* Tempo de Estudo */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tempo de Estudo
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.tempoEstudo || 0}h
            </div>
            <p className="text-xs text-muted-foreground">
              horas estudadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com Gráficos */}
      <Tabs defaultValue="evolucao" className="space-y-4">
        <TabsList>
          <TabsTrigger value="evolucao">Evolução</TabsTrigger>
          <TabsTrigger value="desempenho">Desempenho</TabsTrigger>
          <TabsTrigger value="semanal">Progresso Semanal</TabsTrigger>
        </TabsList>

        {/* Tab: Evolução (Últimos 30 dias) */}
        <TabsContent value="evolucao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolução dos Últimos 30 Dias</CardTitle>
              <CardDescription>
                Acompanhe seu progresso diário em questões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={evolucao || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="data"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return format(date, "dd/MM", { locale: ptBR });
                    }}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => {
                      const date = new Date(value);
                      return format(date, "dd 'de' MMMM", { locale: ptBR });
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="acertos"
                    stroke={COLORS.acertos}
                    name="Acertos"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="erros"
                    stroke={COLORS.erros}
                    name="Erros"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Desempenho */}
        <TabsContent value="desempenho" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Gráfico de Pizza: Acertos vs Erros */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Acertos vs Erros
                </CardTitle>
                <CardDescription>
                  Distribuição geral de respostas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
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
                      <Cell fill={COLORS.acertos} />
                      <Cell fill={COLORS.erros} />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Barras: Desempenho por Dificuldade */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Desempenho por Dificuldade
                </CardTitle>
                <CardDescription>
                  Acertos e erros por nível
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={desempenhoDificuldade || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="acertos" fill={COLORS.acertos} name="Acertos" />
                    <Bar dataKey="erros" fill={COLORS.erros} name="Erros" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Progresso Semanal */}
        <TabsContent value="semanal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Progresso Semanal
              </CardTitle>
              <CardDescription>
                Seu desempenho nos últimos 7 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Metas */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Metas</span>
                    <span className="text-sm text-muted-foreground">
                      {progressoSemanal?.metas || 0}/{progressoSemanal?.metasTotal || 0}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{
                        width: `${((progressoSemanal?.metas || 0) / (progressoSemanal?.metasTotal || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Questões */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Questões</span>
                    <span className="text-sm text-muted-foreground">
                      {progressoSemanal?.questoes || 0}/{progressoSemanal?.questoesTotal || 140}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{
                        width: `${((progressoSemanal?.questoes || 0) / (progressoSemanal?.questoesTotal || 140)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Conquistas Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Conquistas Recentes
          </CardTitle>
          <CardDescription>
            Seus últimos achievements desbloqueados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma conquista desbloqueada ainda</p>
            <p className="text-sm">Continue estudando para desbloquear achievements!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
