import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Eye,
  Activity,
  Users,
  Clock,
  TrendingUp,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [actorId, setActorId] = useState("");
  const [action, setAction] = useState("");
  const [targetType, setTargetType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedLog, setSelectedLog] = useState<any>(null);

  // Queries
  const { data, isLoading, refetch } = trpc.admin.audit_v1.list.useQuery({
    page,
    limit: 20,
    actorId: actorId || undefined,
    action: action || undefined,
    targetType: targetType || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const { data: stats } = trpc.admin.audit_v1.stats.useQuery();

  const handleClearFilters = () => {
    setActorId("");
    setAction("");
    setTargetType("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const getActionBadgeColor = (action: string) => {
    if (action === "TAXONOMIA_IMPORT") return "bg-green-100 text-green-800";
    if (action === "TAXONOMIA_UNDO") return "bg-orange-100 text-orange-800";
    if (action.startsWith("CREATE")) return "bg-green-100 text-green-800";
    if (action.startsWith("UPDATE")) return "bg-blue-100 text-blue-800";
    if (action.startsWith("DELETE")) return "bg-red-100 text-red-800";
    if (action.includes("LOGIN") || action.includes("LOGOUT")) return "bg-purple-100 text-purple-800";
    return "bg-gray-100 text-gray-800";
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "MASTER":
        return "bg-red-100 text-red-800";
      case "ADMINISTRATIVO":
        return "bg-orange-100 text-orange-800";
      case "MENTOR":
        return "bg-blue-100 text-blue-800";
      case "PROFESSOR":
        return "bg-green-100 text-green-800";
      case "ALUNO":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Auditoria</h1>
          <p className="text-muted-foreground">
            Visualize e filtre logs de todas as ações administrativas do sistema
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Total de Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Últimas 24h
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats?.last24h || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Ação Mais Comum
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-semibold truncate">
                {stats?.byAction[0]?.action || "N/A"}
              </div>
              <div className="text-xs text-muted-foreground">
                {stats?.byAction[0]?.count || 0} ocorrências
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Usuários Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats?.byUser.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="actorId">ID do Usuário</Label>
                <Input
                  id="actorId"
                  placeholder="UUID do usuário"
                  value={actorId}
                  onChange={(e) => setActorId(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="action">Ação</Label>
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as ações" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as ações</SelectItem>
                    <SelectItem value="CREATE_USER">Criar Usuário</SelectItem>
                    <SelectItem value="UPDATE_USER">Atualizar Usuário</SelectItem>
                    <SelectItem value="DELETE_USER">Deletar Usuário</SelectItem>
                    <SelectItem value="SUSPEND_USER">Suspender Usuário</SelectItem>
                    <SelectItem value="REACTIVATE_USER">Reativar Usuário</SelectItem>
                    <SelectItem value="IMPERSONATE_USER">Impersonar Usuário</SelectItem>
                    <SelectItem value="CREATE_PLAN">Criar Plano</SelectItem>
                    <SelectItem value="UPDATE_PLAN">Atualizar Plano</SelectItem>
                    <SelectItem value="DELETE_PLAN">Deletar Plano</SelectItem>
                    <SelectItem value="CREATE_GOAL">Criar Meta</SelectItem>
                    <SelectItem value="UPDATE_GOAL">Atualizar Meta</SelectItem>
                    <SelectItem value="DELETE_GOAL">Deletar Meta</SelectItem>
                    <SelectItem value="CREATE_NOTICE">Criar Aviso</SelectItem>
                    <SelectItem value="UPDATE_NOTICE">Atualizar Aviso</SelectItem>
                    <SelectItem value="DELETE_NOTICE">Deletar Aviso</SelectItem>
                    <SelectItem value="TAXONOMIA_IMPORT">Importar Taxonomia</SelectItem>
                    <SelectItem value="TAXONOMIA_UNDO">Desfazer Importação</SelectItem>
                    <SelectItem value="LOGIN">Login</SelectItem>
                    <SelectItem value="LOGOUT">Logout</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetType">Tipo de Recurso</Label>
                <Select value={targetType} onValueChange={setTargetType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os tipos</SelectItem>
                    <SelectItem value="USER">Usuário</SelectItem>
                    <SelectItem value="PLAN">Plano</SelectItem>
                    <SelectItem value="GOAL">Meta</SelectItem>
                    <SelectItem value="NOTICE">Aviso</SelectItem>
                    <SelectItem value="ENROLLMENT">Matrícula</SelectItem>
                    <SelectItem value="AUTH">Autenticação</SelectItem>
                    <SelectItem value="SETTINGS">Configurações</SelectItem>
                    <SelectItem value="taxonomia">Árvore do Conhecimento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Data Inicial</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Data Final</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <Button variant="outline" onClick={handleClearFilters} className="w-full">
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Logs de Auditoria</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Carregando logs...</p>
              </div>
            ) : !data?.logs || data.logs.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum log encontrado</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedLog(log)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getActionBadgeColor(log.action)}>
                          {log.action}
                        </Badge>
                        <Badge className={getRoleBadgeColor(log.actorRole)}>
                          {log.actorRole}
                        </Badge>
                        {log.targetType && (
                          <Badge variant="outline">{log.targetType}</Badge>
                        )}
                      </div>

                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-4">
                          <span>Usuário: {log.actorId.substring(0, 8)}...</span>
                          {log.targetId && (
                            <>
                              <span>•</span>
                              <span>Alvo: {log.targetId.substring(0, 8)}...</span>
                            </>
                          )}
                          <span>•</span>
                          <span>
                            {new Date(log.createdAt).toLocaleString("pt-BR")}
                          </span>
                        </div>
                        {log.ipAddress && (
                          <div className="text-xs">IP: {log.ipAddress}</div>
                        )}
                      </div>
                    </div>

                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Paginação */}
            {data && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <p className="text-sm text-muted-foreground">
                  Página {data.pagination.page} de {data.pagination.totalPages} (
                  {data.pagination.total} logs)
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
                    disabled={page >= data.pagination.totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Detalhes */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Log</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">ID</Label>
                  <p className="font-mono text-sm">{selectedLog.id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Ação</Label>
                  <p>
                    <Badge className={getActionBadgeColor(selectedLog.action)}>
                      {selectedLog.action}
                    </Badge>
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Usuário</Label>
                  <p className="font-mono text-sm">{selectedLog.actorId}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Role</Label>
                  <p>
                    <Badge className={getRoleBadgeColor(selectedLog.actorRole)}>
                      {selectedLog.actorRole}
                    </Badge>
                  </p>
                </div>
                {selectedLog.targetType && (
                  <div>
                    <Label className="text-muted-foreground">Tipo de Recurso</Label>
                    <p>{selectedLog.targetType}</p>
                  </div>
                )}
                {selectedLog.targetId && (
                  <div>
                    <Label className="text-muted-foreground">ID do Recurso</Label>
                    <p className="font-mono text-sm">{selectedLog.targetId}</p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">Data/Hora</Label>
                  <p>{new Date(selectedLog.createdAt).toLocaleString("pt-BR")}</p>
                </div>
                {selectedLog.ipAddress && (
                  <div>
                    <Label className="text-muted-foreground">Endereço IP</Label>
                    <p className="font-mono text-sm">{selectedLog.ipAddress}</p>
                  </div>
                )}
              </div>

              {selectedLog.userAgent && (
                <div>
                  <Label className="text-muted-foreground">User Agent</Label>
                  <p className="text-sm break-all">{selectedLog.userAgent}</p>
                </div>
              )}

              {selectedLog.payload && (
                <div>
                  <Label className="text-muted-foreground">Payload</Label>
                  <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
