import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';
import { ArrowLeft, FileText, Eye, Download, TrendingUp, Loader2 } from 'lucide-react';

/**
 * Página de Estatísticas de Materiais (Admin)
 * - Total de materiais por tipo
 * - Materiais mais acessados
 * - Materiais por disciplina/assunto
 * - Estatísticas de uso
 */
export default function MateriaisStatsPage() {
  const [, setLocation] = useLocation();

  // Queries
  const { data: stats, isLoading } = trpc.materiais.getStats.useQuery();

  return (
    <AdminLayout
      title="Estatísticas de Materiais"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Materiais', href: '/admin/materiais' },
        { label: 'Estatísticas' },
      ]}
      actions={
        <Button variant="outline" onClick={() => setLocation('/admin/materiais')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Carregando estatísticas...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Materiais</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalMateriais || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.materiaisAtivos || 0} ativos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Visualizações</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalVisualizacoes || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Média: {stats?.mediaVisualizacoes?.toFixed(1) || 0} por material
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Downloads</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalDownloads || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Média: {stats?.mediaDownloads?.toFixed(1) || 0} por material
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engajamento</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.taxaEngajamento?.toFixed(1) || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Taxa de visualização/download
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Materiais por Tipo */}
          <Card>
            <CardHeader>
              <CardTitle>Materiais por Tipo</CardTitle>
              <CardDescription>Distribuição dos materiais por categoria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.porTipo?.map((item: any) => (
                  <div key={item.tipo} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {item.tipo === 'pdf' && '📄'}
                        {item.tipo === 'video' && '🎥'}
                        {item.tipo === 'link' && '🔗'}
                        {item.tipo === 'texto' && '📝'}
                      </span>
                      <span className="font-medium capitalize">{item.tipo}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold">{item.count}</span>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${((item.count / (stats?.totalMateriais || 1)) * 100).toFixed(0)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Materiais Mais Acessados */}
          <Card>
            <CardHeader>
              <CardTitle>Materiais Mais Acessados</CardTitle>
              <CardDescription>Top 10 materiais com mais visualizações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.maisAcessados?.slice(0, 10).map((material: any, index: number) => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-muted-foreground">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{material.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {material.disciplinaNome} → {material.assuntoNome}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{material.visualizacoes || 0}</p>
                      <p className="text-xs text-muted-foreground">visualizações</p>
                    </div>
                  </div>
                ))}
                {(!stats?.maisAcessados || stats.maisAcessados.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum material com visualizações ainda
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Materiais por Disciplina */}
          <Card>
            <CardHeader>
              <CardTitle>Materiais por Disciplina</CardTitle>
              <CardDescription>Distribuição por área do conhecimento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.porDisciplina?.map((item: any) => (
                  <div key={item.disciplinaId} className="flex items-center justify-between">
                    <span className="font-medium">{item.disciplinaNome}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold">{item.count}</span>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${((item.count / (stats?.totalMateriais || 1)) * 100).toFixed(0)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
