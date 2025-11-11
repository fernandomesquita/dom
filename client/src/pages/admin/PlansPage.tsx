import { useState } from "react";
import { Link } from "wouter";
import { Plus, Search, Filter, Loader2, Users, Target, Calendar } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminLayout } from "@/components/admin/AdminLayout";

/**
 * Página de Gestão de Planos de Estudo (Admin)
 */
export default function PlansPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ATIVO" | "PAUSADO" | "CONCLUIDO" | "all">("all");
  const [sortBy, setSortBy] = useState<"titulo" | "criado_em" | "data_inicio">("criado_em");

  const { data, isLoading, error } = trpc.admin.plans_v1.listNew.useQuery({
    page,
    pageSize: 20,
    search: search || undefined,
    // Note: listNew não suporta status e sortBy ainda
  });

  const { data: stats } = trpc.admin.plans_v1.stats.useQuery();

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Planos de Estudo</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie os planos de estudo dos alunos
            </p>
          </div>
          <Link href="/admin/planos/novo">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Plano
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Planos</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ativos</CardTitle>
                <Target className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.ativos}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários com Planos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.usuarios_com_planos}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Metas</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_metas}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título, aluno..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9"
                />
              </div>

              <Select
                value={status}
                onValueChange={(value: any) => {
                  setStatus(value);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="ATIVO">Ativo</SelectItem>
                  <SelectItem value="PAUSADO">Pausado</SelectItem>
                  <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={sortBy}
                onValueChange={(value: any) => setSortBy(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="criado_em">Data de criação</SelectItem>
                  <SelectItem value="titulo">Título</SelectItem>
                  <SelectItem value="data_inicio">Data de início</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setStatus("all");
                  setSortBy("criado_em");
                  setPage(1);
                }}
              >
                Limpar filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Plans List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-destructive">Erro ao carregar planos: {error.message}</p>
            </CardContent>
          </Card>
        ) : data && data.plans.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum plano encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {search || status !== "all"
                  ? "Tente ajustar os filtros"
                  : "Crie o primeiro plano de estudo"}
              </p>
              {!search && status === "all" && (
                <Link href="/admin/planos/novo">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Plano
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {data?.plans.map((plan: any) => (
                <Card key={plan.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-xl">{plan.titulo}</CardTitle>
                          <Badge
                            variant={
                              plan.status === "ATIVO"
                                ? "default"
                                : plan.status === "PAUSADO"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {plan.status}
                          </Badge>
                        </div>
                        <CardDescription>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {plan.usuario_nome || "Sem usuário"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(plan.data_inicio).toLocaleDateString("pt-BR")}
                              {plan.data_fim && ` - ${new Date(plan.data_fim).toLocaleDateString("pt-BR")}`}
                            </span>
                          </div>
                        </CardDescription>
                      </div>
                      <Link href={`/admin/planos/${plan.id}`}>
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Horas por dia</p>
                        <p className="font-semibold">{plan.horas_por_dia}h</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total de metas</p>
                        <p className="font-semibold">{plan.total_metas || 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Metas concluídas</p>
                        <p className="font-semibold">
                          {plan.metas_concluidas || 0}
                          {plan.total_metas > 0 && (
                            <span className="text-muted-foreground ml-1">
                              ({Math.round((plan.metas_concluidas / plan.total_metas) * 100)}%)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {data && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Página {data.pagination.page} de {data.pagination.totalPages} ({data.pagination.total}{" "}
                  {data.pagination.total === 1 ? "plano" : "planos"})
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= data.pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
