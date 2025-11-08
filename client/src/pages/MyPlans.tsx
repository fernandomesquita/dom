/**
 * Página Autenticada: /my-plans
 * 
 * Listagem dos planos em que o usuário está matriculado
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, TrendingUp } from 'lucide-react';
import { getLoginUrl } from '@/const';

export default function MyPlans() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<'Ativo' | 'Expirado' | 'Cancelado' | 'Suspenso' | undefined>();
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.plansUser.myPlans.useQuery(
    {
      status,
      page,
      pageSize: 12,
    },
    { enabled: isAuthenticated }
  );

  // Redirect para login se não autenticado
  if (!authLoading && !isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  const plans = data?.items || [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container py-8">
          <h1 className="text-4xl font-bold mb-2">Meus Planos</h1>
          <p className="text-muted-foreground">
            Gerencie seus planos de estudo e acompanhe seu progresso
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="border-b bg-muted/30">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <Select
              value={status || 'all'}
              onValueChange={(v) => {
                setStatus(v === 'all' ? undefined : v as any);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Expirado">Expirado</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
                <SelectItem value="Suspenso">Suspenso</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={() => setLocation('/allplans')}>
              Explorar Mais Planos
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container py-8">
        {isLoading || authLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-48 w-full mb-4" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : plans.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((enrollment) => (
                <Card key={enrollment.enrollmentId} className="flex flex-col">
                  <div className="relative">
                    <img
                      src={enrollment.plan.featuredImageUrl}
                      alt={enrollment.plan.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <Badge
                      className="absolute top-2 right-2"
                      variant={enrollment.status === 'Ativo' ? 'default' : 'secondary'}
                    >
                      {enrollment.status}
                    </Badge>
                  </div>

                  <CardHeader>
                    <CardTitle className="line-clamp-2">{enrollment.plan.name}</CardTitle>
                    <CardDescription>
                      {enrollment.plan.entity && enrollment.plan.role && (
                        <span>{enrollment.plan.entity} • {enrollment.plan.role}</span>
                      )}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Matriculado em {new Date(enrollment.enrolledAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    {enrollment.expiresAt && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          Expira em {new Date(enrollment.expiresAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}

                    {/* Badge de Progresso */}
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-medium">{enrollment.progressPercentage}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${enrollment.progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => setLocation(`/plans/${enrollment.plan.id}/dashboard`)}
                      disabled={enrollment.status !== 'Ativo'}
                    >
                      {enrollment.status === 'Ativo' ? 'Acessar Dashboard' : 'Plano Inativo'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Paginação */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {page} de {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Próxima
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Nenhum plano encontrado</h2>
            <p className="text-muted-foreground mb-6">
              Você ainda não está matriculado em nenhum plano.
            </p>
            <Button onClick={() => setLocation('/allplans')}>
              Explorar Planos Disponíveis
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
