import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import {
  Plus,
  Edit,
  Trash,
  Eye,
  EyeOff,
  GripVertical,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * Página Admin: Gerenciamento da Sidebar
 * 
 * Funcionalidades:
 * - Listar todos os itens (visíveis e ocultos)
 * - Criar novo item (label, icon, path)
 * - Editar item existente
 * - Deletar item
 * - Toggle visibilidade
 * - Reordenar itens (drag and drop com dnd-kit) ✅
 */

interface SidebarItem {
  id: number;
  label: string;
  icon: string;
  path: string;
  ordem: number;
  visivel: boolean;
  cor?: string;
  descricao?: string;
}

function SortableRow({ item, onEdit, onDelete, onToggleVisibility }: {
  item: SidebarItem;
  onEdit: (item: SidebarItem) => void;
  onDelete: (id: number) => void;
  onToggleVisibility: (item: SidebarItem) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell>
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
      </TableCell>
      <TableCell className="font-medium">{item.label}</TableCell>
      <TableCell>
        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
          {item.icon}
        </code>
      </TableCell>
      <TableCell>
        <code className="text-xs text-blue-600">{item.path}</code>
      </TableCell>
      <TableCell>{item.ordem}</TableCell>
      <TableCell>
        {item.visivel ? (
          <Badge variant="default">Visível</Badge>
        ) : (
          <Badge variant="secondary">Oculto</Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onToggleVisibility(item)}
          >
            {item.visivel ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(item)}
          >
            <Edit className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(item.id)}
          >
            <Trash className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function SidebarAdmin() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SidebarItem | null>(null);
  const [localItems, setLocalItems] = useState<SidebarItem[]>([]);

  const utils = trpc.useUtils();

  // Query: Listar todos os itens
  const { data: items, isLoading } = trpc.sidebar.listAll.useQuery(undefined, {
    onSuccess: (data) => {
      setLocalItems(data || []);
    },
  });

  // Mutation: Criar item
  const createMutation = trpc.sidebar.create.useMutation({
    onSuccess: () => {
      toast.success('Item criado com sucesso!');
      utils.sidebar.listAll.invalidate();
      setIsCreateOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Mutation: Atualizar item
  const updateMutation = trpc.sidebar.update.useMutation({
    onSuccess: () => {
      toast.success('Item atualizado com sucesso!');
      utils.sidebar.listAll.invalidate();
      setIsEditOpen(false);
      setEditingItem(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Mutation: Deletar item
  const deleteMutation = trpc.sidebar.delete.useMutation({
    onSuccess: () => {
      toast.success('Item deletado com sucesso!');
      utils.sidebar.listAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Mutation: Reordenar itens
  const reorderMutation = trpc.sidebar.reorder.useMutation({
    onSuccess: () => {
      toast.success('Ordem atualizada com sucesso!');
      utils.sidebar.listAll.invalidate();
    },
    onError: (error) => {
      toast.error('Erro ao atualizar ordem: ' + error.message);
      // Reverter para ordem original em caso de erro
      utils.sidebar.listAll.invalidate();
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = localItems.findIndex((item) => item.id === active.id);
    const newIndex = localItems.findIndex((item) => item.id === over.id);

    const newItems = arrayMove(localItems, oldIndex, newIndex);
    setLocalItems(newItems);

    // Atualizar ordem no backend
    const updates = newItems.map((item, index) => ({
      id: item.id,
      ordem: index + 1,
    }));

    reorderMutation.mutate({ items: updates });
  };

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createMutation.mutate({
      label: formData.get('label') as string,
      icon: formData.get('icon') as string,
      path: formData.get('path') as string,
      ordem: parseInt(formData.get('ordem') as string) || 0,
      visivel: formData.get('visivel') === 'on',
      cor: formData.get('cor') as string || 'gray',
      descricao: formData.get('descricao') as string || undefined,
    });
  };

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (!editingItem) return;

    updateMutation.mutate({
      id: editingItem.id,
      label: formData.get('label') as string,
      icon: formData.get('icon') as string,
      path: formData.get('path') as string,
      ordem: parseInt(formData.get('ordem') as string),
      visivel: formData.get('visivel') === 'on',
      cor: formData.get('cor') as string,
      descricao: formData.get('descricao') as string || undefined,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja deletar este item?')) {
      deleteMutation.mutate({ id });
    }
  };

  const handleToggleVisibility = (item: SidebarItem) => {
    updateMutation.mutate({
      id: item.id,
      visivel: !item.visivel,
    });
  };

  const handleEditClick = (item: SidebarItem) => {
    setEditingItem(item);
    setIsEditOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Sidebar</h1>
          <p className="text-gray-600 mt-1">
            Configure os itens do menu lateral do aluno (arraste para reordenar)
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  name="label"
                  placeholder="Ex: Dashboard"
                  required
                />
              </div>

              <div>
                <Label htmlFor="icon">Ícone (Lucide)</Label>
                <Input
                  id="icon"
                  name="icon"
                  placeholder="Ex: LayoutDashboard"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Veja ícones em: lucide.dev
                </p>
              </div>

              <div>
                <Label htmlFor="path">Caminho</Label>
                <Input
                  id="path"
                  name="path"
                  placeholder="Ex: /dashboard"
                  required
                />
              </div>

              <div>
                <Label htmlFor="ordem">Ordem</Label>
                <Input
                  id="ordem"
                  name="ordem"
                  type="number"
                  defaultValue={localItems.length + 1}
                  min={0}
                />
              </div>

              <div>
                <Label htmlFor="cor">Cor</Label>
                <Input
                  id="cor"
                  name="cor"
                  placeholder="Ex: blue"
                  defaultValue="gray"
                />
              </div>

              <div>
                <Label htmlFor="descricao">Descrição (opcional)</Label>
                <Input
                  id="descricao"
                  name="descricao"
                  placeholder="Descrição do item"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="visivel" name="visivel" defaultChecked />
                <Label htmlFor="visivel">Visível</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Criando...' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Itens da Sidebar ({localItems?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Ícone</TableHead>
                  <TableHead>Caminho</TableHead>
                  <TableHead>Ordem</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <SortableContext
                items={localItems.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <TableBody>
                  {localItems?.map((item) => (
                    <SortableRow
                      key={item.id}
                      item={item}
                      onEdit={handleEditClick}
                      onDelete={handleDelete}
                      onToggleVisibility={handleToggleVisibility}
                    />
                  ))}
                </TableBody>
              </SortableContext>
            </Table>
          </DndContext>

          {localItems?.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum item cadastrado
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Item</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <Label htmlFor="edit-label">Label</Label>
                <Input
                  id="edit-label"
                  name="label"
                  defaultValue={editingItem.label}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-icon">Ícone (Lucide)</Label>
                <Input
                  id="edit-icon"
                  name="icon"
                  defaultValue={editingItem.icon}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-path">Caminho</Label>
                <Input
                  id="edit-path"
                  name="path"
                  defaultValue={editingItem.path}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-ordem">Ordem</Label>
                <Input
                  id="edit-ordem"
                  name="ordem"
                  type="number"
                  defaultValue={editingItem.ordem}
                  min={0}
                />
              </div>

              <div>
                <Label htmlFor="edit-cor">Cor</Label>
                <Input
                  id="edit-cor"
                  name="cor"
                  defaultValue={editingItem.cor || 'gray'}
                />
              </div>

              <div>
                <Label htmlFor="edit-descricao">Descrição (opcional)</Label>
                <Input
                  id="edit-descricao"
                  name="descricao"
                  defaultValue={editingItem.descricao || ''}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-visivel"
                  name="visivel"
                  defaultChecked={editingItem.visivel}
                />
                <Label htmlFor="edit-visivel">Visível</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditingItem(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
