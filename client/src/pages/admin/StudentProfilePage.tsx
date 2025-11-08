import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, User, BookOpen, BarChart3, History, Eye, UserX, UserCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function StudentProfilePage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const { data: profile, isLoading } = trpc.admin.users_v1.getProfile.useQuery(
    { userId: id! },
    { enabled: !!id }
  );

  const { data: loginHistory } = trpc.admin.users_v1.loginHistory.useQuery(
    { userId: id!, limit: 20 },
    { enabled: !!id }
  );

  const suspendMutation = trpc.admin.users_v1.suspend.useMutation({
    onSuccess: () => {
      toast.success("Usuário suspenso com sucesso");
      utils.admin.users_v1.getProfile.invalidate({ userId: id! });
      utils.admin.users_v1.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const reactivateMutation = trpc.admin.users_v1.reactivate.useMutation({
    onSuccess: () => {
      toast.success("Usuário reativado com sucesso");
      utils.admin.users_v1.getProfile.invalidate({ userId: id! });
      utils.admin.users_v1.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const impersonateMutation = trpc.admin.users_v1.generateImpersonationToken.useMutation({
    onSuccess: (data) => {
      // Store original token
      const originalToken = localStorage.getItem("auth_token");
      if (originalToken) {
        sessionStorage.setItem("original_token", originalToken);
        sessionStorage.setItem("impersonated_user", JSON.stringify(data.user));
      }

      // Set new token
      localStorage.setItem("auth_token", data.token);

      // Redirect to dashboard
      toast.success(`Visualizando como ${data.user.nome}`);
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AdminLayout>
    );
  }

  if (!profile) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Usuário não encontrado</h2>
          <Button onClick={() => setLocation("/admin/alunos")} className="mt-4">
            Voltar para lista
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const user = profile.user as any;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/admin/alunos")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{user.nome}</h1>
              <p className="text-muted-foreground mt-1">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => impersonateMutation.mutate({ userId: id! })}
              disabled={impersonateMutation.isPending}
            >
              <Eye className="mr-2 h-4 w-4" />
              Ver como Aluno
            </Button>
            {user.ativo ? (
              <Button
                variant="destructive"
                onClick={() => suspendMutation.mutate({ userId: id! })}
                disabled={suspendMutation.isPending}
              >
                <UserX className="mr-2 h-4 w-4" />
                Suspender
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={() => reactivateMutation.mutate({ userId: id! })}
                disabled={reactivateMutation.isPending}
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Reativar
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">
              <User className="mr-2 h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="plans">
              <BookOpen className="mr-2 h-4 w-4" />
              Planos
            </TabsTrigger>
            <TabsTrigger value="stats">
              <BarChart3 className="mr-2 h-4 w-4" />
              Estatísticas
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="mr-2 h-4 w-4" />
              Histórico de Acessos
            </TabsTrigger>
          </TabsList>

          {/* Tab: Visão Geral */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total de Planos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user.total_planos || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total de Metas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user.total_metas || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Metas Concluídas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user.metas_concluidas || 0}</div>
                  {user.total_metas > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round((user.metas_concluidas / user.total_metas) * 100)}% de conclusão
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nome</p>
                    <p className="text-base">{user.nome}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-base">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">CPF</p>
                    <p className="text-base">{user.cpf || "Não informado"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Role</p>
                    <Badge variant="outline">{user.role}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge variant={user.ativo ? "default" : "destructive"}>
                      {user.ativo ? "Ativo" : "Suspenso"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cadastrado em</p>
                    <p className="text-base">
                      {new Date(user.criado_em).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Último login</p>
                    <p className="text-base">
                      {user.ultimo_login
                        ? new Date(user.ultimo_login).toLocaleDateString("pt-BR")
                        : "Nunca"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Planos */}
          <TabsContent value="plans" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Planos de Estudo</CardTitle>
                <CardDescription>
                  {profile.enrollments.length} plano(s) matriculado(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {profile.enrollments.length > 0 ? (
                  <div className="space-y-4">
                    {(profile.enrollments as any[]).map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold">{enrollment.titulo}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {enrollment.total_metas} metas • {enrollment.metas_concluidas} concluídas
                            {enrollment.total_metas > 0 && (
                              <span className="ml-2">
                                ({Math.round((enrollment.metas_concluidas / enrollment.total_metas) * 100)}%)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Criado em {new Date(enrollment.criado_em).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <Badge variant={enrollment.status === "ATIVO" ? "default" : "secondary"}>
                          {enrollment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Nenhum plano matriculado</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Este usuário ainda não possui planos de estudo.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Estatísticas */}
          <TabsContent value="stats" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas de Progresso</CardTitle>
                <CardDescription>Visualização do desempenho do aluno</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">Gráficos em desenvolvimento</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Gráficos de progresso, tempo de estudo e questões resolvidas serão exibidos aqui.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Histórico de Acessos */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Logins</CardTitle>
                <CardDescription>
                  {loginHistory?.length || 0} registro(s) de acesso
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loginHistory && loginHistory.length > 0 ? (
                  <div className="space-y-2">
                    {(loginHistory as any[]).map((login) => (
                      <div key={login.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="text-sm font-medium">{login.ip_address}</p>
                          <p className="text-xs text-muted-foreground">{login.user_agent}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(login.login_at).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <History className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Nenhum registro de acesso</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Este usuário ainda não realizou login.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
