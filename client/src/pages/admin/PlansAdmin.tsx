import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Users,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function PlansAdmin() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);

  // Queries
  const { data: plansData, isLoading, refetch } = trpc.plansAdmin.listAll.useQuery({});
  const plans = plansData?.items || [];
  const { data: stats } = trpc.plansAdmin.getStats.useQuery();

  // Mutations
  const deleteMutation = trpc.plansAdmin.delete.useMutation({
    onSuccess: () => {
      toast.success("Plano deletado com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao deletar plano: ${error.message}`);
    },
  });

  const setFeaturedMutation = trpc.plansAdmin.setFeatured.useMutation({
    onSuccess: () => {
      toast.success("Plano em destaque atualizado!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao destacar plano: ${error.message}`);
    },
  });

  const updateMutation = trpc.plansAdmin.update.useMutation({
    onSuccess: () => {
      toast.success("Plano atualizado com sucesso!");
      refetch();
      setEditingPlan(null);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar plano: ${error.message}`);
    },
  });

  // Filtered plans
  const filteredPlans = plans?.filter((plan) => {
    const matchesSearch =
      searchQuery === "" ||
      plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.entity?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.role?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || plan.category === categoryFilter;

    const matchesVisibility =
      visibilityFilter === "all" ||
      (visibilityFilter === "visible" && !plan.isHidden) ||
      (visibilityFilter === "hidden" && plan.isHidden);

    return matchesSearch && matchesCategory && matchesVisibility;
  });

  const handleToggleVisibility = (planId: string, currentlyHidden: boolean) => {
    updateMutation.mutate({
      id: planId,
      isHidden: !currentlyHidden,
    });
  };

  const handleToggleFeatured = (planId: string, currentlyFeatured: boolean) => {
    if (currentlyFeatured) {
      // Remove featured
      updateMutation.mutate({
        id: planId,
        isFeatured: false,
      });
    } else {
      // Set as featured (will unset others)
      setFeaturedMutation.mutate({ planId });
    }
  };

  const handleDelete = (planId: string, planName: string) => {
    if (confirm(`Tem certeza que deseja deletar o plano "${planName}"?`)) {
      deleteMutation.mutate({ id: planId });
    }
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Planos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todos os planos de estudo da plataforma
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Planos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPlans || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total de Matrículas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEnrollments || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Taxa de Conversão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.conversionRate || 0}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Planos Pagos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.paidPlans || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, entidade ou cargo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                <SelectItem value="Pago">Pago</SelectItem>
                <SelectItem value="Gratuito">Gratuito</SelectItem>
              </SelectContent>
            </Select>

            <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Visibilidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="visible">Visíveis</SelectItem>
                <SelectItem value="hidden">Ocultos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Planos ({filteredPlans?.length || 0})</CardTitle>
          <CardDescription>
            Lista completa de todos os planos cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando planos...
            </div>
          ) : filteredPlans?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum plano encontrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status Edital</TableHead>
                  <TableHead>Matrículas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans?.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {plan.name}
                          {plan.isFeatured && (
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {plan.entity} • {plan.role}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={plan.category === "Pago" ? "default" : "secondary"}>
                        {plan.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{plan.editalStatus}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{plan._count?.enrollments || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {plan.isHidden ? (
                        <Badge variant="destructive">Oculto</Badge>
                      ) : (
                        <Badge variant="default">Visível</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleVisibility(plan.id, plan.isHidden)}
                          title={plan.isHidden ? "Tornar visível" : "Ocultar"}
                        >
                          {plan.isHidden ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleFeatured(plan.id, plan.isFeatured)}
                          title={plan.isFeatured ? "Remover destaque" : "Destacar"}
                        >
                          {plan.isFeatured ? (
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          ) : (
                            <StarOff className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingPlan(plan)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(plan.id, plan.name)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingPlan && (
        <EditPlanDialog
          plan={editingPlan}
          open={!!editingPlan}
          onClose={() => setEditingPlan(null)}
          onSave={(data) => {
            updateMutation.mutate({ id: editingPlan.id, ...data });
          }}
        />
      )}

      {/* Create Dialog */}
      <CreatePlanDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => {
          setIsCreateDialogOpen(false);
          refetch();
        }}
      />
    </div>
  );
}

// Edit Plan Dialog Component
function EditPlanDialog({
  plan,
  open,
  onClose,
  onSave,
}: {
  plan: any;
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    name: plan.name,
    description: plan.description || "",
    entity: plan.entity || "",
    role: plan.role || "",
    price: plan.price || "",
    landingPageUrl: plan.landingPageUrl || "",
    isHidden: plan.isHidden,
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Plano</DialogTitle>
          <DialogDescription>
            Atualize as informações do plano de estudo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="edit-name">Nome do Plano *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="edit-description">Descrição</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-entity">Entidade</Label>
              <Input
                id="edit-entity"
                value={formData.entity}
                onChange={(e) => setFormData({ ...formData, entity: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="edit-role">Cargo</Label>
              <Input
                id="edit-role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-price">Preço</Label>
              <Input
                id="edit-price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="R$ 997,00"
              />
            </div>

            <div>
              <Label htmlFor="edit-landing">URL da Landing Page</Label>
              <Input
                id="edit-landing"
                value={formData.landingPageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, landingPageUrl: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="edit-hidden"
              checked={formData.isHidden}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isHidden: checked })
              }
            />
            <Label htmlFor="edit-hidden">Ocultar plano da listagem pública</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => onSave(formData)}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Create Plan Dialog Component
function CreatePlanDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    category: "Gratuito" as "Pago" | "Gratuito",
    entity: "",
    role: "",
    editalStatus: "N/A" as "Pré-edital" | "Pós-edital" | "N/A",
    price: "",
    landingPageUrl: "",
    isHidden: false,
  });

  const createMutation = trpc.plansAdmin.create.useMutation({
    onSuccess: () => {
      toast.success("Plano criado com sucesso!");
      onSuccess();
      // Reset form
      setFormData({
        name: "",
        slug: "",
        description: "",
        category: "Gratuito",
        entity: "",
        role: "",
        editalStatus: "N/A",
        price: "",
        landingPageUrl: "",
        isHidden: false,
      });
    },
    onError: (error) => {
      toast.error(`Erro ao criar plano: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.slug) {
      toast.error("Nome e slug são obrigatórios!");
      return;
    }

    createMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Plano</DialogTitle>
          <DialogDescription>
            Adicione um novo plano de estudo à plataforma
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="create-name">Nome do Plano *</Label>
            <Input
              id="create-name"
              value={formData.name}
              onChange={(e) => {
                const name = e.target.value;
                const slug = name
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-+|-+$/g, "");
                setFormData({ ...formData, name, slug });
              }}
              placeholder="Ex: Concurso TRF 5ª Região"
            />
          </div>

          <div>
            <Label htmlFor="create-slug">Slug (URL) *</Label>
            <Input
              id="create-slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="concurso-trf-5-regiao"
            />
            <p className="text-xs text-muted-foreground mt-1">
              URL amigável (gerado automaticamente)
            </p>
          </div>

          <div>
            <Label htmlFor="create-description">Descrição</Label>
            <Textarea
              id="create-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Descreva o plano de estudo..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="create-category">Categoria *</Label>
              <Select
                value={formData.category}
                onValueChange={(value: "Pago" | "Gratuito") =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger id="create-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gratuito">Gratuito</SelectItem>
                  <SelectItem value="Pago">Pago</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="create-edital">Status do Edital</Label>
              <Select
                value={formData.editalStatus}
                onValueChange={(value: "Pré-edital" | "Pós-edital" | "N/A") =>
                  setFormData({ ...formData, editalStatus: value })
                }
              >
                <SelectTrigger id="create-edital">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="N/A">N/A</SelectItem>
                  <SelectItem value="Pré-edital">Pré-edital</SelectItem>
                  <SelectItem value="Pós-edital">Pós-edital</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="create-entity">Entidade</Label>
              <Input
                id="create-entity"
                value={formData.entity}
                onChange={(e) => setFormData({ ...formData, entity: e.target.value })}
                placeholder="Ex: TRF 5ª Região"
              />
            </div>

            <div>
              <Label htmlFor="create-role">Cargo</Label>
              <Input
                id="create-role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="Ex: Analista Judiciário"
              />
            </div>
          </div>

          {formData.category === "Pago" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-price">Preço *</Label>
                <Input
                  id="create-price"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="R$ 997,00"
                />
              </div>

              <div>
                <Label htmlFor="create-landing">URL da Landing Page *</Label>
                <Input
                  id="create-landing"
                  value={formData.landingPageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, landingPageUrl: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="create-hidden"
              checked={formData.isHidden}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isHidden: checked })
              }
            />
            <Label htmlFor="create-hidden">Ocultar plano da listagem pública</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending ? "Criando..." : "Criar Plano"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
