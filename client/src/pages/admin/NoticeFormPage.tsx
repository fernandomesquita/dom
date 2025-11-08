import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

export default function NoticeFormPage() {
  const [, navigate] = useLocation();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;

  // Form state
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [tipo, setTipo] = useState<"INFORMATIVO" | "IMPORTANTE" | "URGENTE" | "MANUTENCAO">("INFORMATIVO");
  const [prioridade, setPrioridade] = useState(0);
  const [destinatarios, setDestinatarios] = useState<"TODOS" | "PLANO_ESPECIFICO" | "ROLE_ESPECIFICA" | "USUARIOS_ESPECIFICOS">("TODOS");
  const [planoId, setPlanoId] = useState("");
  const [roleDestino, setRoleDestino] = useState<"ALUNO" | "PROFESSOR" | "MENTOR" | "ADMINISTRATIVO" | "MASTER">("ALUNO");
  const [agendado, setAgendado] = useState(false);
  const [dataPublicacao, setDataPublicacao] = useState("");
  const [dataExpiracao, setDataExpiracao] = useState("");
  const [publicado, setPublicado] = useState(false);

  // Queries
  const { data: aviso, isLoading } = trpc.admin.notices_v1.getById.useQuery(
    { id: id! },
    { enabled: isEdit }
  );

  // Mutations
  const createMutation = trpc.admin.notices_v1.create.useMutation({
    onSuccess: () => {
      toast.success("Aviso criado com sucesso!");
      navigate("/admin/avisos-v2");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar aviso");
    },
  });

  const updateMutation = trpc.admin.notices_v1.update.useMutation({
    onSuccess: () => {
      toast.success("Aviso atualizado com sucesso!");
      navigate("/admin/avisos-v2");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar aviso");
    },
  });

  // Carregar dados do aviso em modo edição
  useEffect(() => {
    if (aviso) {
      setTitulo(aviso.titulo);
      setConteudo(aviso.conteudo);
      setTipo(aviso.tipo);
      setPrioridade(aviso.prioridade);
      setDestinatarios(aviso.destinatarios);
      setPlanoId(aviso.planoId || "");
      setRoleDestino(aviso.roleDestino || "ALUNO");
      setAgendado(aviso.agendado);
      setDataPublicacao(aviso.dataPublicacao ? new Date(aviso.dataPublicacao).toISOString().slice(0, 16) : "");
      setDataExpiracao(aviso.dataExpiracao ? new Date(aviso.dataExpiracao).toISOString().slice(0, 16) : "");
      setPublicado(aviso.publicado);
    }
  }, [aviso]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!titulo.trim()) {
      toast.error("Título é obrigatório");
      return;
    }
    if (!conteudo.trim()) {
      toast.error("Conteúdo é obrigatório");
      return;
    }
    if (destinatarios === "PLANO_ESPECIFICO" && !planoId) {
      toast.error("Selecione um plano para destinatários específicos");
      return;
    }

    const data = {
      titulo,
      conteudo,
      tipo,
      prioridade,
      destinatarios,
      planoId: destinatarios === "PLANO_ESPECIFICO" ? planoId : undefined,
      roleDestino: destinatarios === "ROLE_ESPECIFICA" ? roleDestino : undefined,
      agendado,
      dataPublicacao: agendado && dataPublicacao ? dataPublicacao : undefined,
      dataExpiracao: dataExpiracao || undefined,
      publicado,
      rascunho: !publicado,
    };

    if (isEdit) {
      updateMutation.mutate({ id: id!, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isEdit && isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando aviso...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/avisos-v2")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEdit ? "Editar Aviso" : "Novo Aviso"}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? "Atualize as informações do aviso" : "Crie um novo aviso para os alunos"}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Manutenção programada no sistema"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select value={tipo} onValueChange={(v: any) => setTipo(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INFORMATIVO">Informativo</SelectItem>
                      <SelectItem value="IMPORTANTE">Importante</SelectItem>
                      <SelectItem value="URGENTE">Urgente</SelectItem>
                      <SelectItem value="MANUTENCAO">Manutenção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prioridade">Prioridade (0-10)</Label>
                  <Input
                    id="prioridade"
                    type="number"
                    min="0"
                    max="10"
                    value={prioridade}
                    onChange={(e) => setPrioridade(parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="flex items-center gap-2 pt-8">
                  <Switch
                    id="publicado"
                    checked={publicado}
                    onCheckedChange={setPublicado}
                  />
                  <Label htmlFor="publicado">Publicar imediatamente</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Conteúdo *</Label>
                <RichTextEditor
                  content={conteudo}
                  onChange={setConteudo}
                  placeholder="Escreva o conteúdo do aviso..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Destinatários</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="destinatarios">Quem deve receber este aviso? *</Label>
                <Select value={destinatarios} onValueChange={(v: any) => setDestinatarios(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODOS">Todos os usuários</SelectItem>
                    <SelectItem value="PLANO_ESPECIFICO">Plano específico</SelectItem>
                    <SelectItem value="ROLE_ESPECIFICA">Role específica</SelectItem>
                    <SelectItem value="USUARIOS_ESPECIFICOS">Usuários específicos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {destinatarios === "PLANO_ESPECIFICO" && (
                <div className="space-y-2">
                  <Label htmlFor="planoId">Plano *</Label>
                  <Input
                    id="planoId"
                    value={planoId}
                    onChange={(e) => setPlanoId(e.target.value)}
                    placeholder="ID do plano"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Todos os alunos matriculados neste plano receberão o aviso
                  </p>
                </div>
              )}

              {destinatarios === "ROLE_ESPECIFICA" && (
                <div className="space-y-2">
                  <Label htmlFor="roleDestino">Role *</Label>
                  <Select value={roleDestino} onValueChange={(v: any) => setRoleDestino(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALUNO">Alunos</SelectItem>
                      <SelectItem value="PROFESSOR">Professores</SelectItem>
                      <SelectItem value="MENTOR">Mentores</SelectItem>
                      <SelectItem value="ADMINISTRATIVO">Administrativos</SelectItem>
                      <SelectItem value="MASTER">Masters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {destinatarios === "USUARIOS_ESPECIFICOS" && (
                <div className="space-y-2">
                  <Label>Usuários</Label>
                  <p className="text-sm text-muted-foreground">
                    Funcionalidade de seleção múltipla será implementada em breve
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agendamento (Opcional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="agendado"
                  checked={agendado}
                  onCheckedChange={setAgendado}
                />
                <Label htmlFor="agendado">Agendar publicação</Label>
              </div>

              {agendado && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataPublicacao">Data de Publicação</Label>
                    <Input
                      id="dataPublicacao"
                      type="datetime-local"
                      value={dataPublicacao}
                      onChange={(e) => setDataPublicacao(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dataExpiracao">Data de Expiração</Label>
                    <Input
                      id="dataExpiracao"
                      type="datetime-local"
                      value={dataExpiracao}
                      onChange={(e) => setDataExpiracao(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/avisos-v2")}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {isEdit ? "Atualizar" : "Criar"} Aviso
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
