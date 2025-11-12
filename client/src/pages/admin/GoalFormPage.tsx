import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useLocation } from "wouter";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useState } from "react";

const durationRegex = /^(\d+h)?(\d+min)?$/;

const goalSchema = z.object({
  planoId: z.string().uuid(),
  titulo: z.string().min(1, "Título é obrigatório"),
  descricao: z.string().optional(),
  tipo: z.enum(['ESTUDO', 'QUESTOES', 'REVISAO']),
  duracao: z.string().regex(durationRegex, 'Formato inválido. Use "1h30min" ou "45min"'),
  disciplinaId: z.string().uuid().optional(),
  assuntoId: z.string().uuid().optional(),
  topicoId: z.string().uuid().optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

export default function GoalFormPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const goalId = params.id as string | undefined;
  const isEditing = !!goalId;

  // Get planoId from URL query
  const urlParams = new URLSearchParams(window.location.search);
  const planoIdFromUrl = urlParams.get('planoId');

  const [selectedDisciplina, setSelectedDisciplina] = useState<string>('');
  const [selectedAssunto, setSelectedAssunto] = useState<string>('');

  const utils = trpc.useUtils();

  // Queries
  const { data: goal, isLoading: loadingGoal } = trpc.admin.goals_v1.getById.useQuery(
    { id: goalId! },
    { enabled: isEditing }
  );

  const { data: planosData } = trpc.admin.plans_v1.listNew.useQuery({
    page: 1,
    pageSize: 100,
  });
  const planos = planosData?.plans || [];

  const { data: disciplinas = [] } = trpc.ktree.disciplinas.list.useQuery();
  
  const { data: assuntos = [] } = trpc.ktree.assuntos.list.useQuery(
    { disciplinaId: selectedDisciplina },
    { enabled: !!selectedDisciplina }
  );

  const { data: topicos = [] } = trpc.ktree.topicos.list.useQuery(
    { assuntoId: selectedAssunto },
    { enabled: !!selectedAssunto }
  );

  // Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      planoId: planoIdFromUrl || '',
      tipo: 'ESTUDO',
    },
  });

  // Load goal data when editing
  useEffect(() => {
    if (goal) {
      setValue('planoId', goal.plano_id);
      setValue('titulo', goal.titulo);
      setValue('descricao', goal.descricao || '');
      setValue('tipo', goal.tipo);
      setValue('duracao', goal.duracao);
      if (goal.disciplina_id) {
        setValue('disciplinaId', goal.disciplina_id);
        setSelectedDisciplina(goal.disciplina_id);
      }
      if (goal.assunto_id) {
        setValue('assuntoId', goal.assunto_id);
        setSelectedAssunto(goal.assunto_id);
      }
      if (goal.topico_id) {
        setValue('topicoId', goal.topico_id);
      }
    }
  }, [goal, setValue]);

  // Mutations
  const createMutation = trpc.admin.goals_v1.create.useMutation({
    onSuccess: (data) => {
      toast.success('Meta criada com sucesso!');
      utils.admin.goals_v1.list.invalidate();
      setLocation(`/admin/planos/${watch('planoId')}/metas`);
    },
    onError: (error) => {
      toast.error(`Erro ao criar meta: ${error.message}`);
    },
  });

  const updateMutation = trpc.admin.goals_v1.update.useMutation({
    onSuccess: () => {
      toast.success('Meta atualizada com sucesso!');
      utils.admin.goals_v1.list.invalidate();
      utils.admin.goals_v1.getById.invalidate({ id: goalId! });
      setLocation(`/admin/planos/${watch('planoId')}/metas`);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar meta: ${error.message}`);
    },
  });

  const onSubmit = (data: GoalFormData) => {
    if (isEditing) {
      updateMutation.mutate({
        id: goalId,
        ...data,
      });
    } else {
      createMutation.mutate(data);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isEditing && loadingGoal) {
    return (
      <AdminLayout>
        <div className="text-center py-8">Carregando...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation(`/admin/planos/${watch('planoId') || planoIdFromUrl}/metas`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Editar Meta' : 'Nova Meta'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditing ? 'Atualize os dados da meta' : 'Preencha os dados da nova meta'}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Informações da Meta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Plano */}
              <div>
                <Label htmlFor="planoId">Plano de Estudo *</Label>
                <Select
                  value={watch('planoId')}
                  onValueChange={(value) => setValue('planoId', value)}
                  disabled={isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    {planos.map((plano: any) => (
                      <SelectItem key={plano.id} value={plano.id}>
                        {plano.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.planoId && (
                  <p className="text-sm text-red-600 mt-1">{errors.planoId.message}</p>
                )}
              </div>

              {/* Título */}
              <div>
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  {...register('titulo')}
                  placeholder="Ex: Estudar Direito Constitucional"
                />
                {errors.titulo && (
                  <p className="text-sm text-red-600 mt-1">{errors.titulo.message}</p>
                )}
              </div>

              {/* Descrição */}
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  {...register('descricao')}
                  placeholder="Descreva os objetivos desta meta..."
                  rows={3}
                />
              </div>

              {/* Tipo e Duração */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select
                    value={watch('tipo')}
                    onValueChange={(value) => setValue('tipo', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ESTUDO">Estudo</SelectItem>
                      <SelectItem value="QUESTOES">Questões</SelectItem>
                      <SelectItem value="REVISAO">Revisão</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.tipo && (
                    <p className="text-sm text-red-600 mt-1">{errors.tipo.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="duracao">Duração *</Label>
                  <Input
                    id="duracao"
                    {...register('duracao')}
                    placeholder="Ex: 1h30min ou 45min"
                  />
                  {errors.duracao && (
                    <p className="text-sm text-red-600 mt-1">{errors.duracao.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Formato: "1h30min" ou "45min"
                  </p>
                </div>
              </div>

              {/* Knowledge Tree */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium text-gray-900">Árvore de Conhecimento (Opcional)</h3>

                {/* Disciplina */}
                <div>
                  <Label htmlFor="disciplinaId">Disciplina</Label>
                  <Select
                    value={watch('disciplinaId')}
                    onValueChange={(value) => {
                      setValue('disciplinaId', value);
                      setValue('assuntoId', '');
                      setValue('topicoId', '');
                      setSelectedDisciplina(value);
                      setSelectedAssunto('');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma disciplina" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhuma</SelectItem>
                      {disciplinas.map((d: any) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Assunto */}
                {selectedDisciplina && (
                  <div>
                    <Label htmlFor="assuntoId">Assunto</Label>
                    <Select
                      value={watch('assuntoId')}
                      onValueChange={(value) => {
                        setValue('assuntoId', value);
                        setValue('topicoId', '');
                        setSelectedAssunto(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um assunto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhum</SelectItem>
                        {assuntos.map((a: any) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Tópico */}
                {selectedAssunto && (
                  <div>
                    <Label htmlFor="topicoId">Tópico</Label>
                    <Select
                      value={watch('topicoId')}
                      onValueChange={(value) => setValue('topicoId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um tópico" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhum</SelectItem>
                        {topicos.map((t: any) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation(`/admin/planos/${watch('planoId') || planoIdFromUrl}/metas`)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
