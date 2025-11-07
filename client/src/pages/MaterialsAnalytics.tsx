import { ArrowLeft, TrendingUp, Eye, Download, ThumbsUp, Star } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/**
 * Página de Analytics de Materiais
 * Mostra estatísticas completas, gráficos e top 10 materiais
 */
export default function MaterialsAnalytics() {
  const { data: stats, isLoading } = trpc.materials.getAdminStats.useQuery();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/admin/materiais">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold">Analytics de Materiais</h1>
          <p className="text-muted-foreground">
            Estatísticas completas e insights sobre os materiais
          </p>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Materiais</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalMaterials || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeMaterials || 0} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalViews?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Média: {Math.round((stats?.totalViews || 0) / (stats?.totalMaterials || 1))} por material
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalDownloads?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              PDFs baixados com DRM
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating Médio</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Number(stats?.averageRating || 0).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalRatings || 0} avaliações
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Materiais por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Materiais por Categoria</CardTitle>
            <CardDescription>Distribuição por tipo de conteúdo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.materialsByCategory || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="Quantidade" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Materiais por Tipo */}
        <Card>
          <CardHeader>
            <CardTitle>Materiais por Tipo</CardTitle>
            <CardDescription>Distribuição por formato</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.materialsByType || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#10b981" name="Quantidade" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top 10 Materiais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mais Visualizados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Top 10 Mais Visualizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.topViewed?.slice(0, 10).map((material: any, index: number) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between p-2 rounded hover:bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-muted-foreground w-6">
                      #{index + 1}
                    </span>
                    <span className="text-sm">{material.title}</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {material.viewCount?.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mais Baixados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Top 10 Mais Baixados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.topDownloaded?.slice(0, 10).map((material: any, index: number) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between p-2 rounded hover:bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-muted-foreground w-6">
                      #{index + 1}
                    </span>
                    <span className="text-sm">{material.title}</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {material.downloadCount?.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mais Upvotados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ThumbsUp className="h-5 w-5" />
              Top 10 Mais Upvotados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.topUpvoted?.slice(0, 10).map((material: any, index: number) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between p-2 rounded hover:bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-muted-foreground w-6">
                      #{index + 1}
                    </span>
                    <span className="text-sm">{material.title}</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {material.upvoteCount?.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Melhor Avaliados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Top 10 Melhor Avaliados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.topRated?.slice(0, 10).map((material: any, index: number) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between p-2 rounded hover:bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-muted-foreground w-6">
                      #{index + 1}
                    </span>
                    <span className="text-sm">{material.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">
                      {Number(material.averageRating || 0).toFixed(1)}
                    </span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
