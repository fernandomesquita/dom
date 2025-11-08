import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { 
  BookOpen, 
  Calendar, 
  CheckCircle, 
  Clock, 
  FileText, 
  Target,
  TrendingUp,
  Users,
  ArrowRight,
  Play,
  BarChart3
} from "lucide-react";
import { useParams, Link } from "wouter";

export default function PlanDashboard() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Queries
  const { data: plan, isLoading: planLoading } = trpc.plansPublic.getById.useQuery(
    { id: id! },
    { enabled: !!id }
  );

  const { data: dashboard, isLoading: dashboardLoading } = trpc.plansUser.dashboard.useQuery(
    { planId: id! },
    { enabled: !!id && isAuthenticated }
  );

  const { data: enrollment } = trpc.plansUser.myPlans.useQuery(
    undefined,
    { 
      enabled: isAuthenticated,
      select: (data) => data.find(e => e.plan.id === id)
    }
  );

  // Loading states
  if (authLoading || planLoading) {
    return <DashboardSkeleton />;
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container py-8">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>
              Você precisa estar logado e matriculado no plano para acessar o dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/login">Fazer Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Plan not found
  if (!plan) {
    return (
      <div className="container py-8">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle>Plano Não Encontrado</CardTitle>
            <CardDescription>
              O plano solicitado não foi encontrado ou não está mais disponível.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/allplans">Ver Todos os Planos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not enrolled
  if (!enrollment) {
    return (
      <div className="container py-8">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle>Matrícula Necessária</CardTitle>
            <CardDescription>
              Você precisa se matricular neste plano para acessar o dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              <strong>{plan.name}</strong>
            </p>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href={`/plans/${id}`}>Ver Detalhes</Link>
              </Button>
              <Button asChild>
                <Link href="/allplans">Explorar Planos</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{plan.name}</h1>
          <p className="text-muted-foreground mt-1">
            {plan.entity} • {plan.role}
          </p>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                enrollment.status === 'Ativo' ? 'bg-green-500' :
                enrollment.status === 'Expirado' ? 'bg-red-500' :
                enrollment.status === 'Suspenso' ? 'bg-yellow-500' :
                'bg-gray-500'
              }`} />
              <span className="text-sm font-medium">{enrollment.status}</span>
            </div>
            {enrollment.expiresAt && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Expira em {new Date(enrollment.expiresAt).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
          </div>
        </div>
        <Button asChild>
          <Link href={`/plans/${id}`}>
            <ArrowRight className="w-4 h-4 mr-2" />
            Ver Detalhes do Plano
          </Link>
        </Button>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Progresso Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progresso do Plano</span>
                <span className="font-medium">{enrollment.progressPercentage}%</span>
              </div>
              <Progress value={enrollment.progressPercentage} className="h-2" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {dashboardLoading ? '...' : dashboard?.stats.completedGoals || 0}
                </div>
                <div className="text-sm text-muted-foreground">Metas Concluídas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {dashboardLoading ? '...' : dashboard?.stats.studyHours || 0}h
                </div>
                <div className="text-sm text-muted-foreground">Horas de Estudo</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {dashboardLoading ? '...' : dashboard?.stats.questionsAnswered || 0}
                </div>
                <div className="text-sm text-muted-foreground">Questões Resolvidas</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <Link href="/metas/hoje" className="block">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium">Metas de Hoje</div>
                  <div className="text-sm text-muted-foreground">
                    {dashboardLoading ? '...' : dashboard?.todayGoals || 0} pendentes
                  </div>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <Link href="/questoes" className="block">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">Resolver Questões</div>
                  <div className="text-sm text-muted-foreground">
                    Banco de questões
                  </div>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <Link href="/materiais" className="block">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <div className="font-medium">Materiais</div>
                  <div className="text-sm text-muted-foreground">
                    PDFs e vídeos
                  </div>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <Link href="/simulados" className="block">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Play className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium">Simulados</div>
                  <div className="text-sm text-muted-foreground">
                    Pratique provas
                  </div>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-1" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : dashboard?.recentActivity?.length ? (
              <div className="space-y-4">
                {dashboard.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="p-1 bg-muted rounded-full mt-1">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma atividade recente</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Comece estudando para ver seu progresso aqui
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Study Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Estatísticas de Estudo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Dias consecutivos</span>
                  <span className="font-medium">{dashboard?.stats.streakDays || 0} dias</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Média diária</span>
                  <span className="font-medium">{dashboard?.stats.avgDailyHours || 0}h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Taxa de acerto</span>
                  <span className="font-medium">{dashboard?.stats.accuracyRate || 0}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Materiais visualizados</span>
                  <span className="font-medium">{dashboard?.stats.materialsViewed || 0}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container py-8 space-y-8">
      {/* Header Skeleton */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-96" />
          <Skeleton className="h-4 w-64" />
          <div className="flex items-center gap-4 mt-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Progress Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="text-center space-y-2">
                  <Skeleton className="h-8 w-16 mx-auto" />
                  <Skeleton className="h-4 w-24 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map(j => (
                  <div key={j} className="flex justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
