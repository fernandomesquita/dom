import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Eye, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function AdminMateriais() {
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any>(null);

  const { data: materials, isLoading, refetch } = trpc.materials.list.useQuery({
    limit: 20,
    offset: (page - 1) * 20,
  });

  const createMaterial = trpc.materials.create.useMutation({
    onSuccess: () => {
      toast.success("Material criado com sucesso!");
      setIsCreateOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMaterial = trpc.materials.update.useMutation({
    onSuccess: () => {
      toast.success("Material atualizado com sucesso!");
      setEditingMaterial(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMaterial = trpc.materials.delete.useMutation({
    onSuccess: () => {
      toast.success("Material deletado com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja deletar este material?")) {
      deleteMaterial.mutate({ id });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "base":
        return "bg-[#35463D] text-white";
      case "revisao":
        return "bg-[#6E9B84] text-white";
      case "promo":
        return "bg-purple-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "base":
        return "Base";
      case "revisao":
        return "Revisão";
      case "promo":
        return "Promo";
      default:
        return category;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Materiais</h1>
          <p className="text-muted-foreground">
            Crie, edite e organize materiais educacionais
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/materiais/analytics">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </Link>
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Material
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Material</DialogTitle>
                <DialogDescription>
                  Preencha os dados do novo material educacional
                </DialogDescription>
              </DialogHeader>
              <MaterialForm
                onSubmit={(data) => createMaterial.mutate(data)}
                isLoading={createMaterial.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Carregando materiais...</div>
      ) : (
        <>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Upvotes</TableHead>
                  <TableHead className="text-right">Rating</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials?.map((material: any) => (
                  <TableRow key={material.id}>
                    <TableCell className="font-medium">
                      {material.title}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs ${getCategoryColor(
                          material.category
                        )}`}
                      >
                        {getCategoryLabel(material.category)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {material.type === "video" && "Vídeo"}
                        {material.type === "pdf" && "PDF"}
                        {material.type === "audio" && "Áudio"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {material.isAvailable ? (
                        <span className="text-green-600 text-sm">Ativo</span>
                      ) : (
                        <span className="text-red-600 text-sm">Inativo</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {material.viewCount}
                    </TableCell>
                    <TableCell className="text-right">
                      {material.upvotes}
                    </TableCell>
                    <TableCell className="text-right">
                      {material.avgRating
                        ? material.avgRating.toFixed(1)
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <Link href={`/materiais/${material.id}`} target="_blank">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingMaterial(material)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(material.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <span className="flex items-center px-4">
              Página {page}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
              disabled={!materials || materials.length < 20}
            >
              Próxima
            </Button>
          </div>
        </>
      )}

      {/* Dialog de Edição */}
      {editingMaterial && (
        <Dialog open={!!editingMaterial} onOpenChange={() => setEditingMaterial(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Material</DialogTitle>
              <DialogDescription>
                Atualize os dados do material
              </DialogDescription>
            </DialogHeader>
            <MaterialForm
              initialData={editingMaterial}
              onSubmit={(data) =>
                updateMaterial.mutate({ id: editingMaterial.id, ...data })
              }
              isLoading={updateMaterial.isPending}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Componente de formulário reutilizável
function MaterialForm({
  initialData,
  onSubmit,
  isLoading,
}: {
  initialData?: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    category: initialData?.category || "base",
    type: initialData?.type || "video",
    thumbnailUrl: initialData?.thumbnailUrl || "",
    isPaid: initialData?.isPaid || false,
    isAvailable: initialData?.isAvailable ?? true,
    isFeatured: initialData?.isFeatured || false,
    allowComments: initialData?.allowComments ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Descrição *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Categoria *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) =>
              setFormData({ ...formData, category: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="base">Base</SelectItem>
              <SelectItem value="revisao">Revisão</SelectItem>
              <SelectItem value="promo">Promo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="type">Tipo *</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="video">Vídeo</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="audio">Áudio</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="thumbnailUrl">URL da Thumbnail</Label>
        <Input
          id="thumbnailUrl"
          value={formData.thumbnailUrl}
          onChange={(e) =>
            setFormData({ ...formData, thumbnailUrl: e.target.value })
          }
          placeholder="https://..."
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="isPaid">Material Pago</Label>
          <Switch
            id="isPaid"
            checked={formData.isPaid}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, isPaid: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="isAvailable">Disponível</Label>
          <Switch
            id="isAvailable"
            checked={formData.isAvailable}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, isAvailable: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="isFeatured">Destaque</Label>
          <Switch
            id="isFeatured"
            checked={formData.isFeatured}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, isFeatured: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="allowComments">Permitir Comentários</Label>
          <Switch
            id="allowComments"
            checked={formData.allowComments}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, allowComments: checked })
            }
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar Material"}
        </Button>
      </div>
    </form>
  );
}
