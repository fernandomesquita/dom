import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BarChart3, TrendingUp, Clock, Target, AlertTriangle, Calendar } from 'lucide-react';

export default function MetasDashboard() {
  const globalStatsQuery = trpc.metasAnalytics.globalStats.useQuery();
  const conclusaoPorDisciplinaQuery = trpc.metasAnalytics.conclusaoPorDisciplina.useQuery({});
  const metasMaisOmitidasQuery = trpc.metasAnalytics.metasMaisOmitidas.useQuery();
  const tempoMedioPorTipoQuery = trpc.metasAnalytics.tempoMedioPorTipo.useQuery();
  const progressoTemporalQuery = trpc.metasAnalytics.progressoTemporal.useQuery({ dias: 30 });
  const distribuicaoPorDiaQuery = trpc.metasAnalytics.distribuicaoPorDiaSemana.useQuery();

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const globalStats = globalStatsQuery.data;

  return (
    <div className="container py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="w-8 h-8" />
            Dashboard de Metas
          </h1>
          <p className="text-muted-foreground mt-2">
            Análise detalhada do seu progresso e estatísticas de estudo
          </p>
        </div>

        {globalStatsQuery.isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando estatísticas...</div>
        ) : (
          <>
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Total de Planos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{globalStats?.totalPlanos || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Tempo Estudado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatTime(globalStats?.tempoTotalEstudadoSec || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Planejado: {globalStats?.tempoTotalPlanejadoMin || 0}min
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Metas Concluídas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {globalStats?.metasPorStatus.find((s: any) => s.status === 'CONCLUIDA')?.total || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Metas Omitidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {globalStats?.metasPorStatus.find((s: any) => s.status === 'OMITIDA')?.total || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Metas por Status</CardTitle>
                  <CardDescription>Distribuição geral das suas metas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {globalStats?.metasPorStatus.map((item: any) => (
                      <div key={item.status} className="flex items-center justify-between">
                        <Badge variant="outline">{item.status}</Badge>
                        <span className="font-semibold">{item.total}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Metas por Tipo</CardTitle>
                  <CardDescription>Distribuição por tipo de atividade</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {globalStats?.metasPorTipo.map((item: any) => (
                      <div key={item.tipo} className="flex items-center justify-between">
                        <Badge>{item.tipo}</Badge>
                        <span className="font-semibold">{item.total}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Taxa de Conclusão por Disciplina
                </CardTitle>
                <CardDescription>Desempenho por área de conhecimento</CardDescription>
              </CardHeader>
              <CardContent>
                {conclusaoPorDisciplinaQuery.isLoading ? (
                  <div className="text-center py-4 text-muted-foreground">Carregando...</div>
                ) : conclusaoPorDisciplinaQuery.data?.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">Nenhum dado disponível</div>
                ) : (
                  <div className="space-y-4">
                    {conclusaoPorDisciplinaQuery.data?.map((item: any) => (
                      <div key={item.disciplina} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{item.disciplina}</span>
                          <span className="text-muted-foreground">
                            {item.concluidas}/{item.total} ({item.taxa_conclusao}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 transition-all"
                            style={{ width: `${item.taxa_conclusao}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Metas Mais Omitidas
                </CardTitle>
                <CardDescription>Identifique gargalos no seu estudo</CardDescription>
              </CardHeader>
              <CardContent>
                {metasMaisOmitidasQuery.isLoading ? (
                  <div className="text-center py-4 text-muted-foreground">Carregando...</div>
                ) : metasMaisOmitidasQuery.data?.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">Nenhuma meta omitida</div>
                ) : (
                  <div className="space-y-3">
                    {metasMaisOmitidasQuery.data?.map((item: any, idx: number) => (
                      <div key={idx} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="font-medium">{item.disciplina}</div>
                            <div className="text-sm text-muted-foreground">{item.assunto}</div>
                            {item.topico && (
                              <div className="text-xs text-muted-foreground">{item.topico}</div>
                            )}
                          </div>
                          <Badge variant="destructive">{item.total_omissoes}x</Badge>
                        </div>
                        {item.motivos && (
                          <div className="text-xs text-muted-foreground mt-2">
                            <span className="font-medium">Motivos:</span> {item.motivos}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Tempo Médio por Tipo
                </CardTitle>
                <CardDescription>Planejado vs Real</CardDescription>
              </CardHeader>
              <CardContent>
                {tempoMedioPorTipoQuery.isLoading ? (
                  <div className="text-center py-4 text-muted-foreground">Carregando...</div>
                ) : tempoMedioPorTipoQuery.data?.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">Nenhum dado disponível</div>
                ) : (
                  <div className="space-y-4">
                    {tempoMedioPorTipoQuery.data?.map((item: any) => (
                      <div key={item.tipo} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge>{item.tipo}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {item.total_metas} metas
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <div className="text-muted-foreground">Planejado</div>
                            <div className="font-semibold">
                              {Math.round(item.media_planejada_min)}min
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Real</div>
                            <div className="font-semibold">
                              {Math.round(item.media_real_min)}min
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Diferença</div>
                            <div className={`font-semibold ${item.diferenca_min > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {item.diferenca_min > 0 ? '+' : ''}{Math.round(item.diferenca_min)}min
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Distribuição por Dia da Semana
                </CardTitle>
                <CardDescription>Padrões de estudo semanais</CardDescription>
              </CardHeader>
              <CardContent>
                {distribuicaoPorDiaQuery.isLoading ? (
                  <div className="text-center py-4 text-muted-foreground">Carregando...</div>
                ) : (
                  <div className="space-y-3">
                    {distribuicaoPorDiaQuery.data?.map((item: any) => (
                      <div key={item.dia_semana} className="flex items-center justify-between">
                        <span className="font-medium w-24">{item.dia_semana_nome}</span>
                        <div className="flex-1 mx-4">
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500"
                              style={{
                                width: `${(item.total_metas / Math.max(...(distribuicaoPorDiaQuery.data?.map((d: any) => d.total_metas) || [1]))) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground w-20 text-right">
                          {item.total_metas} metas
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
