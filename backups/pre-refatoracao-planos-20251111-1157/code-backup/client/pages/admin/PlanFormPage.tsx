import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";

const planFormSchema = z.object({
  titulo: z.string().min(3, "Título deve ter no mínimo 3 caracteres").max(200),
  horasPorDia: z.coerce
    .number()
    .min(0.5, "Mínimo 30 minutos")
    .max(12, "Máximo 12 horas"),
  diasDisponiveis: z.object({
    domingo: z.boolean(),
    segunda: z.boolean(),
    terca: z.boolean(),
    quarta: z.boolean(),
    quinta: z.boolean(),
    sexta: z.boolean(),
    sabado: z.boolean(),
  }),
  dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  dataFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida").optional().or(z.literal("")),
  status: z.enum(["ATIVO", "PAUSADO", "CONCLUIDO"]),
});

type PlanFormValues = z.infer<typeof planFormSchema>;

/**
 * Converte objeto de dias disponíveis para bitmask
 * Domingo = bit 0, Segunda = bit 1, ..., Sábado = bit 6
 */
function diasToBitmask(dias: PlanFormValues["diasDisponiveis"]): number {
  let bitmask = 0;
  if (dias.domingo) bitmask |= 1 << 0;
  if (dias.segunda) bitmask |= 1 << 1;
  if (dias.terca) bitmask |= 1 << 2;
  if (dias.quarta) bitmask |= 1 << 3;
  if (dias.quinta) bitmask |= 1 << 4;
  if (dias.sexta) bitmask |= 1 << 5;
  if (dias.sabado) bitmask |= 1 << 6;
  return bitmask;
}

/**
 * Converte bitmask para objeto de dias disponíveis
 */
function bitmaskToDias(bitmask: number): PlanFormValues["diasDisponiveis"] {
  return {
    domingo: Boolean(bitmask & (1 << 0)),
    segunda: Boolean(bitmask & (1 << 1)),
    terca: Boolean(bitmask & (1 << 2)),
    quarta: Boolean(bitmask & (1 << 3)),
    quinta: Boolean(bitmask & (1 << 4)),
    sexta: Boolean(bitmask & (1 << 5)),
    sabado: Boolean(bitmask & (1 << 6)),
  };
}

export default function PlanFormPage() {
  const [, params] = useRoute("/admin/planos/:id");
  const [, setLocation] = useLocation();
  const planId = params?.id === "novo" ? null : params?.id;
  const isEditing = Boolean(planId);

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      titulo: "",
      horasPorDia: 4,
      diasDisponiveis: {
        domingo: false,
        segunda: true,
        terca: true,
        quarta: true,
        quinta: true,
        sexta: true,
        sabado: false,
      },
      dataInicio: new Date().toISOString().split("T")[0],
      dataFim: "",
      status: "ATIVO",
    },
  });

  // Carregar dados do plano se estiver editando
  const { data: planData, isLoading: isLoadingPlan } = trpc.admin.plans_v1.getById.useQuery(
    { id: planId! },
    { enabled: isEditing }
  );

  useEffect(() => {
    if (planData) {
      form.reset({
        titulo: planData.titulo,
        horasPorDia: planData.horas_por_dia,
        diasDisponiveis: bitmaskToDias(planData.dias_disponiveis_bitmask),
        dataInicio: planData.data_inicio.split("T")[0],
        dataFim: planData.data_fim ? planData.data_fim.split("T")[0] : "",
        status: planData.status,
      });
    }
  }, [planData, form]);

  const utils = trpc.useUtils();

  const createMutation = trpc.admin.plans_v1.create.useMutation({
    onSuccess: () => {
      toast.success("Plano criado com sucesso!");
      utils.admin.plans_v1.list.invalidate();
      utils.admin.plans_v1.stats.invalidate();
      setLocation("/admin/planos");
    },
    onError: (error) => {
      toast.error(`Erro ao criar plano: ${error.message}`);
    },
  });

  const updateMutation = trpc.admin.plans_v1.update.useMutation({
    onSuccess: () => {
      toast.success("Plano atualizado com sucesso!");
      utils.admin.plans_v1.list.invalidate();
      utils.admin.plans_v1.getById.invalidate({ id: planId! });
      setLocation("/admin/planos");
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar plano: ${error.message}`);
    },
  });

  const onSubmit = (values: PlanFormValues) => {
    const bitmask = diasToBitmask(values.diasDisponiveis);

    if (bitmask === 0) {
      toast.error("Selecione pelo menos um dia da semana");
      return;
    }

    const payload = {
      titulo: values.titulo,
      horasPorDia: values.horasPorDia,
      diasDisponiveisBitmask: bitmask,
      dataInicio: values.dataInicio,
      dataFim: values.dataFim || undefined,
      status: values.status,
    };

    if (isEditing) {
      updateMutation.mutate({
        id: planId!,
        data: payload,
      });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isEditing && isLoadingPlan) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/admin/planos")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditing ? "Editar Plano" : "Novo Plano"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditing
                ? "Atualize as informações do plano de estudo"
                : "Crie um novo plano de estudo para um aluno"}
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Plano</CardTitle>
            <CardDescription>
              Preencha os dados do plano de estudo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="titulo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Plano TRF 5ª Região 2025" {...field} />
                      </FormControl>
                      <FormDescription>
                        Nome identificador do plano de estudo
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="horasPorDia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horas por dia *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.5"
                            min="0.5"
                            max="12"
                            placeholder="4"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Entre 0.5 (30min) e 12 horas
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ATIVO">Ativo</SelectItem>
                            <SelectItem value="PAUSADO">Pausado</SelectItem>
                            <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-3">
                  <FormLabel>Dias disponíveis *</FormLabel>
                  <div className="grid grid-cols-7 gap-2">
                    {[
                      { name: "domingo", label: "Dom" },
                      { name: "segunda", label: "Seg" },
                      { name: "terca", label: "Ter" },
                      { name: "quarta", label: "Qua" },
                      { name: "quinta", label: "Qui" },
                      { name: "sexta", label: "Sex" },
                      { name: "sabado", label: "Sáb" },
                    ].map((dia) => (
                      <FormField
                        key={dia.name}
                        control={form.control}
                        name={`diasDisponiveis.${dia.name as keyof PlanFormValues["diasDisponiveis"]}`}
                        render={({ field }) => (
                          <FormItem className="flex flex-col items-center space-y-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-xs font-normal">
                              {dia.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormDescription>
                    Selecione os dias da semana disponíveis para estudo
                  </FormDescription>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="dataInicio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de início *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dataFim"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de término</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormDescription>Opcional</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/admin/planos")}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {isEditing ? "Atualizar" : "Criar"} Plano
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
