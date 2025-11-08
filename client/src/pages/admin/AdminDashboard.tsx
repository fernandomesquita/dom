import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { Users, BookOpen, Target, TrendingUp, Activity } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className="mt-2 flex items-center text-xs text-green-600">
            <TrendingUp className="mr-1 h-3 w-3" />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { data: auditStats, isLoading: loadingAudit } = trpc.admin.audit_v1.stats.useQuery();

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {loadingAudit ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                title="Total de Ações"
                value={auditStats?.total || 0}
                description="Ações registradas no sistema"
                icon={Activity}
              />
              <StatCard
                title="Últimas 24h"
                value={auditStats?.last24h || 0}
                description="Ações nas últimas 24 horas"
                icon={TrendingUp}
                trend="+12% vs. ontem"
              />
              <StatCard
                title="Usuários Ativos"
                value={auditStats?.byUser.length || 0}
                description="Usuários com atividade recente"
                icon={Users}
              />
              <StatCard
                title="Tipos de Ação"
                value={auditStats?.byAction.length || 0}
                description="Diferentes tipos de ação"
                icon={BookOpen}
              />
            </>
          )}
        </div>

        {/* Ações Mais Comuns */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Ações Mais Comuns</CardTitle>
              <CardDescription>Top 10 ações registradas</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAudit ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {auditStats?.byAction.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium">{item.action}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{item.count} vezes</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usuários Mais Ativos</CardTitle>
              <CardDescription>Top 10 usuários por atividade</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAudit ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {auditStats?.byUser.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.actorId.slice(0, 8)}...</p>
                          <p className="text-xs text-muted-foreground">{item.actorRole}</p>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{item.count} ações</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Placeholder para gráficos futuros */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade ao Longo do Tempo</CardTitle>
            <CardDescription>Gráfico de atividade dos últimos 30 dias (em breve)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              <p>Gráfico será implementado na Fase 6</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
