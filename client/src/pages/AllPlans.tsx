/**
 * Página Pública: /allplans
 * 
 * Listagem de todos os planos ativos com filtros e paginação
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Star, Building2, Briefcase, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header';

export default function AllPlans() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'Pago' | 'Gratuito' | undefined>();
  const [editalStatus, setEditalStatus] = useState<'Pré-edital' | 'Pós-edital' | 'N/A' | undefined>();
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.plansPublic.list.useQuery({
    search: search || undefined,
    category,
    editalStatus,
    page,
    pageSize: 12,
  });

  const plans = data?.items || [];
  const pagination = data?.pagination;

  // Separar plano em destaque
  const featuredPlan = plans.find(p => p.isFeatured);
  const regularPlans = plans.filter(p => !p.isFeatured);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header */}
      <div className="border-b">
        <div className="container py-8">
          <h1 className="text-4xl font-bold mb-2">Planos de Estudo</h1>
          <p className="text-muted-foreground">
            Escolha o plano ideal para sua jornada de aprovação
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="border-b bg-muted/30">
        <div className="container py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Busca */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, entidade ou cargo..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>

            {/* Categoria */}
            <Select
              value={category || 'all'}
              onValueChange={(v) => {
                setCategory(v === 'all' ? undefined : v as any);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                <SelectItem value="Gratuito">Gratuito</SelectItem>
                <SelectItem value="Pago">Pago</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Edital */}
            <Select
              value={editalStatus || 'all'}
              onValueChange={(v) => {
                setEditalStatus(v === 'all' ? undefined : v as any);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status Edital" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="Pré-edital">Pré-edital</SelectItem>
                <SelectItem value="Pós-edital">Pós-edital</SelectItem>
                <SelectItem value="N/A">N/A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container py-8">
        {isLoading ? (
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
        ) : (
          <>
            {/* Plano em Destaque */}
            {featuredPlan && (
              <Card className="mb-8 border-2 border-primary">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="relative">
                    <img
                      src={featuredPlan.featuredImageUrl}
                      alt={featuredPlan.name}
                      className="w-full h-full object-cover rounded-l-lg"
                    />
                    <Badge className="absolute top-4 left-4 bg-primary">
                      <Star className="h-3 w-3 mr-1" />
                      EM DESTAQUE
                    </Badge>
                  </div>
                  <div className="p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{featuredPlan.category}</Badge>
                        {featuredPlan.editalStatus !== 'N/A' && (
                          <Badge variant="outline">{featuredPlan.editalStatus}</Badge>
                        )}
                      </div>
                      <h2 className="text-3xl font-bold mb-2">{featuredPlan.name}</h2>
                      <p className="text-muted-foreground mb-4">{featuredPlan.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        {featuredPlan.entity && (
                          <div className="flex items-center gap-2 text-sm">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span>{featuredPlan.entity}</span>
                          </div>
                        )}
                        {featuredPlan.role && (
                          <div className="flex items-center gap-2 text-sm">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span>{featuredPlan.role}</span>
                          </div>
                        )}
                      </div>

                      {featuredPlan.tags && featuredPlan.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {featuredPlan.tags.map((tag, i) => (
                            <Badge key={i} variant="outline">{tag}</Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      {featuredPlan.price && (
                        <span className="text-2xl font-bold">{featuredPlan.price}</span>
                      )}
                      <Button
                        size="lg"
                        onClick={() => setLocation(`/planos/${featuredPlan.id}`)}
                      >
                        {featuredPlan.category === 'Gratuito' ? 'Matricular-se' : 'Saiba Mais'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Grid de Planos Regulares */}
            {regularPlans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {regularPlans.map((plan) => (
                  <Card key={plan.id} className="flex flex-col">
                    <div className="relative">
                      <img
                        src={plan.featuredImageUrl}
                        alt={plan.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Badge variant="secondary">{plan.category}</Badge>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{plan.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="space-y-2 text-sm">
                        {plan.entity && (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="line-clamp-1">{plan.entity}</span>
                          </div>
                        )}
                        {plan.role && (
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span className="line-clamp-1">{plan.role}</span>
                          </div>
                        )}
                        {plan.editalStatus !== 'N/A' && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{plan.editalStatus}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between">
                      {plan.price && (
                        <span className="font-bold">{plan.price}</span>
                      )}
                      <Button
                        variant={plan.category === 'Gratuito' ? 'default' : 'outline'}
                        onClick={() => setLocation(`/planos/${plan.id}`)}
                      >
                        {plan.category === 'Gratuito' ? 'Matricular-se' : 'Saiba Mais'}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum plano encontrado com os filtros selecionados.</p>
              </div>
            )}

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
        )}
      </div>
    </div>
  );
}
