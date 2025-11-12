import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Plus, Upload, GripVertical, Edit, Copy, Trash2, Clock, Target } from "lucide-react";
import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { toast } from "sonner";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Goal {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: 'ESTUDO' | 'QUESTOES' | 'REVISAO';
  duracao: string;
  status: string;
  order_index: number;
  plano_titulo: string;
  disciplina_nome: string | null;
  assunto_nome: string | null;
  topico_nome: string | null;
}

function SortableGoalItem({ goal, onEdit, onClone, onDelete }: {
  goal: Goal;
  onEdit: (id: string) => void;
  onClone: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: goal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const tipoColors = {
    ESTUDO: 'bg-blue-100 text-blue-800',
    QUESTOES: 'bg-green-100 text-green-800',
    REVISAO: 'bg-purple-100 text-purple-800',
  };

  const statusColors = {
    PENDENTE: 'bg-gray-100 text-gray-800',
    CONCLUIDA: 'bg-green-100 text-green-800',
    ATRASADA: 'bg-red-100 text-red-800',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border rounded-lg p-4 mb-2 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-medium text-gray-900 truncate">{goal.titulo}</h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge className={tipoColors[goal.tipo]}>{goal.tipo}</Badge>
              <Badge className={statusColors[goal.status as keyof typeof statusColors]}>
                {goal.status}
              </Badge>
            </div>
          </div>

          {goal.descricao && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{goal.descricao}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{goal.duracao}</span>
            </div>
            {goal.disciplina_nome && (
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                <span className="truncate">
                  {goal.disciplina_nome}
                  {goal.assunto_nome && ` › ${goal.assunto_nome}`}
                  {goal.topico_nome && ` › ${goal.topico_nome}`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(goal.id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onClone(goal.id)}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(goal.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PlanGoalsPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const planId = params.id as string;

  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const utils = trpc.useUtils();

  // Query
  const { data: goals = [], isLoading } = trpc.admin.goals_v1.list.useQuery({
    planoId: planId,
    tipo: tipoFilter === 'all' ? undefined : tipoFilter as any,
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: search || undefined,
    page: 1,
    limit: 100,
    sortBy: 'order_index',
    sortOrder: 'asc',
  });

  // Mutations
  const reorderMutation = trpc.admin.goals_v1.reorder.useMutation({
    onSuccess: () => {
      utils.admin.goals_v1.list.invalidate();
    },
  });

  const cloneMutation = trpc.admin.goals_v1.clone.useMutation({
    onSuccess: () => {
      toast.success('Meta clonada com sucesso!');
      utils.admin.goals_v1.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao clonar meta: ${error.message}`);
    },
  });

  const deleteMutation = trpc.admin.goals_v1.delete.useMutation({
    onSuccess: () => {
      toast.success('Meta excluída com sucesso!');
      utils.admin.goals_v1.list.invalidate();
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error(`Erro ao excluir meta: ${error.message}`);
      setDeleteId(null);
    },
  });

  // Drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = goals.findIndex((g: Goal) => g.id === active.id);
      const newIndex = goals.findIndex((g: Goal) => g.id === over.id);

      // Optimistic update
      const newGoals = arrayMove(goals, oldIndex, newIndex);
      utils.admin.goals_v1.list.setData(
        {
          planoId: planId,
          tipo: tipoFilter === 'all' ? undefined : tipoFilter as any,
          status: statusFilter === 'all' ? undefined : statusFilter,
          search: search || undefined,
          page: 1,
          limit: 100,
          sortBy: 'order_index',
          sortOrder: 'asc',
        },
        newGoals
      );

      // Server update
      reorderMutation.mutate({
        goalId: active.id as string,
        newOrderIndex: newIndex,
      });
    }
  };

  const handleEdit = (id: string) => {
    setLocation(`/admin/metas/${id}`);
  };

  const handleClone = (id: string) => {
    cloneMutation.mutate({ goalId: id });
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate({ id: deleteId });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Metas do Plano</h1>
            <p className="text-gray-600 mt-1">
              Gerencie as metas de estudo deste plano
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setLocation(`/admin/planos/${planId}/metas/upload`)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload em Lote
            </Button>
            <Button onClick={() => setLocation(`/admin/metas/novo?planoId=${planId}`)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Meta
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Buscar</label>
                <Input
                  placeholder="Buscar por título..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Tipo</label>
                <Select value={tipoFilter} onValueChange={setTipoFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="ESTUDO">Estudo</SelectItem>
                    <SelectItem value="QUESTOES">Questões</SelectItem>
                    <SelectItem value="REVISAO">Revisão</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="PENDENTE">Pendente</SelectItem>
                    <SelectItem value="CONCLUIDA">Concluída</SelectItem>
                    <SelectItem value="ATRASADA">Atrasada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goals List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Metas ({goals.length})
              <span className="text-sm font-normal text-gray-500 ml-2">
                Arraste para reordenar
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Carregando...</div>
            ) : goals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma meta encontrada. Crie a primeira meta!
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={goals.map((g: Goal) => g.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {goals.map((goal: Goal) => (
                    <SortableGoalItem
                      key={goal.id}
                      goal={goal}
                      onEdit={handleEdit}
                      onClone={handleClone}
                      onDelete={handleDelete}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
