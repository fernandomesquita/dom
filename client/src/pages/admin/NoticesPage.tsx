import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  FileText,
  AlertCircle,
  AlertTriangle,
  Info,
  Wrench,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function NoticesPage() {
  const [, navigate] = useLocation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [tipo, setTipo] = useState<string>("all");
  const [publicado, setPublicado] = useState<string>("all");

  // Queries
  const { data, isLoading, refetch } = trpc.admin.notices_v1.list.useQuery({
    page,
    limit: 20,
    search: search || undefined,
    tipo: tipo !== "all" ? (tipo as any) : undefined,
    publicado: publicado === "all" ? undefined : publicado === "true",
  });

  const { data: stats } = trpc.admin.notices_v1.stats.useQuery();

  // Mutations
  const deleteMutation = trpc.admin.notices_v1.delete.useMutation({
    onSuccess: () => {
      toast.success("Aviso deletado com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao deletar aviso");
    },
  });

  const updateMutation = trpc.admin.notices_v1.update.useMutation({
    onSuccess: () => {
      toast.success("Aviso atualizado com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar aviso");
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja deletar este aviso?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleTogglePublish = (id: string, currentStatus: boolean) => {
    updateMutation.mutate({
      id,
      publicado: !currentStatus,
      rascunho: currentStatus, // Se estava publicado, vira rascunho
    });
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "INFORMATIVO":
        return <Info className="h-4 w-4" />;
      case "IMPORTANTE":
        return <AlertCircle className="h-4 w-4" />;
      case "URGENTE":
        return <AlertTriangle className="h-4 w-4" />;
      case "MANUTENCAO":
        return <Wrench className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTipoBadgeColor = (tipo: string) => {
    switch (tipo) {
      case "INFORMATIVO":
        return "bg-blue-100 text-blue-800";
      case "IMPORTANTE":
        return "bg-yellow-100 text-yellow-800";
      case "URGENTE":
        return "bg-red-100 text-red-800";
      case "MANUTENCAO":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Avisos</h1>
            <p className="text-muted-foreground">
              Gerencie avisos e notificações para os alunos
            </p>
          </div>
          <Button onClick={() => navigate("/admin/avisos/novo")}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Aviso
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Avisos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Publicados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats?.publicados || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rascunhos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">
                {stats?.rascunhos || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Visualizações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats?.totalVisualizacoes || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar avisos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="INFORMATIVO">Informativo</SelectItem>
                  <SelectItem value="IMPORTANTE">Importante</SelectItem>
                  <SelectItem value="URGENTE">Urgente</SelectItem>
                  <SelectItem value="MANUTENCAO">Manutenção</SelectItem>
                </SelectContent>
              </Select>

              <Select value={publicado} onValueChange={setPublicado}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="true">Publicados</SelectItem>
                  <SelectItem value="false">Rascunhos</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setTipo("all");
                  setPublicado("all");
                  setPage(1);
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Avisos */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Carregando avisos...</p>
              </div>
            ) : !data?.avisos || data.avisos.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum aviso encontrado</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate("/admin/avisos/novo")}
                >
                  Criar Primeiro Aviso
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {data.avisos.map((aviso) => (
                  <div
                    key={aviso.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getTipoIcon(aviso.tipo)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold truncate">{aviso.titulo}</h3>
                        <Badge className={getTipoBadgeColor(aviso.tipo)}>
                          {aviso.tipo}
                        </Badge>
                        {aviso.publicado && (
                          <Badge className="bg-green-100 text-green-800">
                            Publicado
                          </Badge>
                        )}
                        {aviso.rascunho && (
                          <Badge variant="outline">Rascunho</Badge>
                        )}
                        {aviso.agendado && (
                          <Badge className="bg-purple-100 text-purple-800">
                            Agendado
                          </Badge>
                        )}
                      </div>

                      <div
                        className="text-sm text-muted-foreground line-clamp-2"
                        dangerouslySetInnerHTML={{
                          __html: aviso.conteudo.substring(0, 200) + "...",
                        }}
                      />

                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span>Destinatários: {aviso.destinatarios}</span>
                        <span>•</span>
                        <span>{aviso.visualizacoes} visualizações</span>
                        <span>•</span>
                        <span>
                          Criado em{" "}
                          {new Date(aviso.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => navigate(`/admin/avisos/${aviso.id}`)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleTogglePublish(aviso.id, aviso.publicado)
                          }
                        >
                          {aviso.publicado ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              Despublicar
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Publicar
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(aviso.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Deletar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}

            {/* Paginação */}
            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <p className="text-sm text-muted-foreground">
                  Página {data.page} de {data.totalPages} ({data.total} avisos)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= data.totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
