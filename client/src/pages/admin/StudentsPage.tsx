import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Link } from "wouter";
import { UserPlus, Search, Users, UserCheck, UserX, GraduationCap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>();
  const [page, setPage] = useState(1);

  const { data: stats, isLoading: statsLoading } = trpc.admin.users_v1.stats.useQuery();
  const { data, isLoading } = trpc.admin.users_v1.list.useQuery({
    search: search || undefined,
    role: roleFilter as any,
    isActive: statusFilter,
    page,
    limit: 20,
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestão de Alunos</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie usuários, visualize perfis e atribua planos
            </p>
          </div>
          <Link href="/admin/alunos/novo">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Aluno
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  Total de Usuários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-green-500" />
                  Usuários Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.ativos || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <UserX className="h-4 w-4 text-red-500" />
                  Usuários Suspensos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.suspensos || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-purple-500" />
                  Alunos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.alunos || 0}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Filtre usuários por nome, email, role ou status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9"
                />
              </div>

              <Select
                value={roleFilter || "all"}
                onValueChange={(value) => {
                  setRoleFilter(value === "all" ? undefined : value);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os roles</SelectItem>
                  <SelectItem value="ALUNO">Aluno</SelectItem>
                  <SelectItem value="PROFESSOR">Professor</SelectItem>
                  <SelectItem value="MENTOR">Mentor</SelectItem>
                  <SelectItem value="ADMINISTRATIVO">Administrativo</SelectItem>
                  <SelectItem value="MASTER">Master</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={statusFilter === undefined ? "all" : statusFilter ? "active" : "suspended"}
                onValueChange={(value) => {
                  setStatusFilter(value === "all" ? undefined : value === "active");
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="suspended">Suspensos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Usuários</CardTitle>
            <CardDescription>
              {data ? `${data.total} usuário(s) encontrado(s)` : "Carregando..."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-9 w-24" />
                  </div>
                ))}
              </div>
            ) : data && data.users.length > 0 ? (
              <div className="space-y-4">
                {(data.users as any[]).map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{user.nome}</h3>
                        <Badge variant={user.ativo ? "default" : "destructive"}>
                          {user.ativo ? "Ativo" : "Suspenso"}
                        </Badge>
                        <Badge variant="outline">{user.role}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {user.email} {user.cpf && `• CPF: ${user.cpf}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {user.total_planos} plano(s) • Cadastrado em{" "}
                        {new Date(user.criado_em).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/admin/alunos/${user.id}`}>
                        <Button variant="outline" size="sm">
                          Ver Perfil
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Nenhum usuário encontrado</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Tente ajustar os filtros ou criar um novo usuário.
                </p>
              </div>
            )}

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {page} de {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages}
                >
                  Próxima
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
