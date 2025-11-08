import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  ResponsiveContainer 
} from 'recharts';
import { Eye, MousePointerClick, XCircle, TrendingUp } from 'lucide-react';

const COLORS = {
  informativo: '#3b82f6', // blue
  importante: '#f59e0b', // amber
  urgente: '#ef4444', // red
  individual: '#8b5cf6', // purple
  premium: '#ec4899', // pink
};

export default function AvisosAnalytics() {
  const [periodo, setPeriodo] = useState(30); // dias
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | 'informativo' | 'importante' | 'urgente' | 'individual' | 'premium'>('todos');

  // Query de analytics do backend
  const analyticsQuery = trpc.avisos.getAnalyticsSummary.useQuery({
    periodo,
    tipoFiltro,
  });

  const metricsData = analyticsQuery.data?.metrics || {
    totalVisualizacoes: 0,
    totalCliques: 0,
    totalDispensas: 0,
    taxaEngajamento: 0,
  };

  const visualizacoesTimeline = analyticsQuery.data?.timeline || [];
  const performancePorTipo = analyticsQuery.data?.performancePorTipo || [];
  
  // Calcular distribuição por formato
  const distribuicaoPorFormato = analyticsQuery.data?.distribuicaoPorFormato?.map(d => ({
    formato: d.formato.charAt(0).toUpperCase() + d.formato.slice(1),
    value: d.count,
  })) || [];

  // Calcular percentual para PieChart
  const totalFormatos = distribuicaoPorFormato.reduce((acc, d) => acc + d.value, 0);
  const distribuicaoPorFormatoPercent = distribuicaoPorFormato.map(d => ({
    formato: d.formato,
    value: totalFormatos > 0 ? Math.round((d.value / totalFormatos) * 100) : 0,
  }));

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  const formatPercent = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics de Avisos</h1>
          <p className="text-muted-foreground mt-2">
            Métricas e desempenho dos avisos enviados
          </p>
        </div>

        {/* Filtros */}
        <div className="flex gap-4">
          <Select value={String(periodo)} onValueChange={(v) => setPeriodo(Number(v))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>

          <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              <SelectItem value="informativo">Informativo</SelectItem>
              <SelectItem value="importante">Importante</SelectItem>
              <SelectItem value="urgente">Urgente</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Visualizações
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(metricsData.totalVisualizacoes)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +12% em relação ao período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cliques em CTA
            </CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(metricsData.totalCliques)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +8% em relação ao período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avisos Dispensados
            </CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(metricsData.totalDispensas)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              14.4% do total de visualizações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Engajamento
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercent(metricsData.taxaEngajamento)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cliques / Visualizações
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Gráficos */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
          <TabsTrigger value="performance">Performance por Tipo</TabsTrigger>
          <TabsTrigger value="distribuicao">Distribuição</TabsTrigger>
        </TabsList>

        {/* Timeline */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Visualizações e Cliques ao Longo do Tempo</CardTitle>
              <CardDescription>
                Acompanhe o engajamento dos avisos nos últimos {periodo} dias
              </CardDescription>
            </CardHeader>
            <CardContent>
                {analyticsQuery.isLoading ? (
                  <div className="h-[350px] flex items-center justify-center">
                    <p className="text-muted-foreground">Carregando dados...</p>
                  </div>
                ) : visualizacoesTimeline.length === 0 ? (
                  <div className="h-[350px] flex items-center justify-center">
                    <p className="text-muted-foreground">Nenhum dado disponível para o período selecionado</p>
                  </div>
                ) : (
                <ResponsiveContainer width="100%" height={350}>
                <LineChart data={visualizacoesTimeline.map(t => ({ ...t, data: new Date(t.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="visualizacoes" 
                    stroke="#3b82f6" 
                    name="Visualizações"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cliques" 
                    stroke="#10b981" 
                    name="Cliques"
                    strokeWidth={2}
                  />
                  </LineChart>
                </ResponsiveContainer>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance por Tipo */}
        <TabsContent value="performance">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Visualizações por Tipo</CardTitle>
                <CardDescription>
                  Comparação de alcance entre tipos de aviso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performancePorTipo}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tipo" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="visualizacoes" fill="#3b82f6" name="Visualizações" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Taxa de Cliques por Tipo</CardTitle>
                <CardDescription>
                  Efetividade dos CTAs por tipo de aviso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performancePorTipo}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tipo" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="taxa" fill="#10b981" name="Taxa de Cliques (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Performance */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Ranking de Performance</CardTitle>
              <CardDescription>
                Avisos ordenados por taxa de engajamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performancePorTipo
                  .sort((a, b) => b.taxa - a.taxa)
                  .map((item, index) => (
                    <div
                      key={item.tipo}
                      className="flex items-center justify-between border-b pb-3 last:border-0"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-muted-foreground">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="font-medium">{item.tipo}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatNumber(item.visualizacoes)} visualizações
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{formatPercent(item.taxa)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatNumber(item.cliques)} cliques
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribuição */}
        <TabsContent value="distribuicao">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Formato de Exibição</CardTitle>
              <CardDescription>
                Preferência de formatos utilizados nos avisos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsQuery.isLoading ? (
                  <div className="h-[350px] flex items-center justify-center">
                    <p className="text-muted-foreground">Carregando dados...</p>
                  </div>
                ) : distribuicaoPorFormatoPercent.length === 0 ? (
                  <div className="h-[350px] flex items-center justify-center">
                    <p className="text-muted-foreground">Nenhum dado disponível</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={distribuicaoPorFormatoPercent}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.formato} (${entry.value}%)`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {distribuicaoPorFormatoPercent.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={Object.values(COLORS)[index % Object.values(COLORS).length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
