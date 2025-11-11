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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";

// ===== SCHEMA ZOD COMPLETO (17 CAMPOS) =====
// Baseado em drizzle/schema-plans.ts

const planFormSchema = z.object({
  // Seção 1: Informações Básicas
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(255),
  slug: z.string().min(3).max(255).optional(),
  description: z.string().optional(),
  
  // Seção 2: Classificação
  category: z.enum(['Pago', 'Gratuito']),
  editalStatus: z.enum(['Pré-edital', 'Pós-edital', 'N/A']).default('N/A'),
  entity: z.string().optional(),
  role: z.string().optional(),
  
  // Seção 3: Modelo de Negócio (condicionais)
  price: z.string().optional(),
  landingPageUrl: z.string().url("URL inválida").optional().or(z.literal('')),
  
  // Seção 4: Duração e Validade
  durationDays: z.coerce.number().int().positive().optional(),
  validityDate: z.string().optional(), // ISO date string
  
  // Seção 5: Imagens e Destaque
  featuredImageUrl: z.string().url("URL inválida").optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().default(false),
  
  // Seção 6: Disponibilidade
  disponivel: z.boolean().default(true),
  isHidden: z.boolean().default(false),
  mentorId: z.coerce.number().int().positive().optional(),
}).refine(
  (data) => {
    // Validação: Plano Pago DEVE ter price e landingPageUrl
    if (data.category === 'Pago') {
      return data.price && data.price.length > 0 && data.landingPageUrl && data.landingPageUrl.length > 0;
    }
    return true;
  },
  {
    message: "Planos pagos devem ter preço e landing page URL",
    path: ["price"],
  }
);

type PlanFormData = z.infer<typeof planFormSchema>;

// ===== HELPER: Auto-formatar slug =====
function formatSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .trim()
    .replace(/\s+/g, '-') // Espaços viram hífens
    .replace(/-+/g, '-'); // Remove hífens duplicados
}

export default function PlanFormPage() {
  const [, params] = useRoute("/admin/planos/:id");
  const [, setLocation] = useLocation();
  const planId = params?.id === "novo" ? null : params?.id;
  const isEditing = Boolean(planId);

  const form = useForm<PlanFormData>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      category: 'Gratuito',
      editalStatus: 'N/A',
      entity: '',
      role: '',
      price: '',
      landingPageUrl: '',
      durationDays: undefined,
      validityDate: '',
      featuredImageUrl: '',
      tags: [],
      isFeatured: false,
      disponivel: true,
      isHidden: false,
      mentorId: undefined,
    },
  });

  // Carregar dados do plano se estiver editando
  const { data: planData, isLoading: isLoadingPlan } = trpc.plansAdmin.getById.useQuery(
    { id: planId! },
    { enabled: isEditing }
  );

  useEffect(() => {
    if (planData) {
      form.reset({
        name: planData.name || '',
        slug: planData.slug || '',
        description: planData.description || '',
        category: planData.category || 'Gratuito',
        editalStatus: planData.editalStatus || 'N/A',
        entity: planData.entity || '',
        role: planData.role || '',
        price: planData.price || '',
        landingPageUrl: planData.landingPageUrl || '',
        durationDays: planData.durationDays || undefined,
        validityDate: planData.validityDate ? new Date(planData.validityDate).toISOString().split('T')[0] : '',
        featuredImageUrl: planData.featuredImageUrl || '',
        tags: planData.tags || [],
        isFeatured: planData.isFeatured || false,
        disponivel: planData.disponivel ?? true,
        isHidden: planData.isHidden || false,
        mentorId: planData.mentorId || undefined,
      });
    }
  }, [planData, form]);

  const utils = trpc.useUtils();

  const createMutation = trpc.plansAdmin.create.useMutation({
    onSuccess: () => {
      toast.success("Plano criado com sucesso!");
      utils.plansAdmin.listAll.invalidate();
      setLocation("/admin/planos");
    },
    onError: (error) => {
      toast.error(`Erro ao criar plano: ${error.message}`);
    },
  });

  const updateMutation = trpc.plansAdmin.update.useMutation({
    onSuccess: () => {
      toast.success("Plano atualizado com sucesso!");
      utils.plansAdmin.listAll.invalidate();
      utils.plansAdmin.getById.invalidate({ id: planId! });
      setLocation("/admin/planos");
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar plano: ${error.message}`);
    },
  });

  const onSubmit = async (data: PlanFormData) => {
    try {
      // Limpar campos vazios (null, undefined, string vazia)
      const cleanData: any = {};
      
      Object.entries(data).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') return;
        if (Array.isArray(value) && value.length === 0) return;
        cleanData[key] = value;
      });
      
      if (isEditing) {
        // MODO EDITAR
        await updateMutation.mutateAsync({
          id: planId!,
          ...cleanData,
        });
        
        toast.success('Plano atualizado com sucesso!');
      } else {
        // MODO CRIAR
        await createMutation.mutateAsync(cleanData);
        
        toast.success('Plano criado com sucesso!');
      }
      
      // Redirecionar para lista de planos
      setLocation('/admin/planos');
      
    } catch (error: any) {
      console.error('Erro ao salvar plano:', error);
      
      // Erro amigável para o usuário
      const errorMessage = error?.message || 'Erro ao salvar plano. Tente novamente.';
      toast.error(errorMessage);
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* ===== SEÇÃO 1: INFORMAÇÕES BÁSICAS ===== */}
            <Card>
              <CardHeader>
                <CardTitle>1. Informações Básicas</CardTitle>
                <CardDescription>
                  Nome, slug e descrição do plano
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Plano *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: Plano EARA Pré-Edital - Auditor Fiscal RF" 
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            // Auto-gerar slug se estiver vazio
                            if (!form.getValues('slug')) {
                              form.setValue('slug', formatSlug(e.target.value));
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Nome completo e descritivo do plano
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug (URL amigável)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="plano-eara-pre-edital-auditor-rf" 
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Gerado automaticamente. Edite se necessário.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva o plano, objetivos, público-alvo..." 
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Descrição completa do plano (opcional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* ===== SEÇÃO 2: CLASSIFICAÇÃO ===== */}
            <Card>
              <CardHeader>
                <CardTitle>2. Classificação</CardTitle>
                <CardDescription>
                  Categoria, entidade, cargo e momento do edital
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Gratuito">Gratuito</SelectItem>
                            <SelectItem value="Pago">Pago</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="editalStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Momento do Edital *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o momento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Pré-edital">Pré-edital</SelectItem>
                            <SelectItem value="Pós-edital">Pós-edital</SelectItem>
                            <SelectItem value="N/A">N/A (Não se aplica)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="entity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entidade</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: Receita Federal, Petrobras, TRF 5ª Região" 
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Órgão ou empresa do concurso
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: Auditor Fiscal, Analista, Técnico" 
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Cargo específico do concurso
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* ===== SEÇÃO 3: MODELO DE NEGÓCIO (CONDICIONAL) ===== */}
            {form.watch('category') === 'Pago' && (
              <Card>
                <CardHeader>
                  <CardTitle>3. Modelo de Negócio</CardTitle>
                  <CardDescription>
                    Preço e landing page (obrigatório para planos pagos)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: R$ 299,90" 
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Valor do plano (obrigatório para planos pagos)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="landingPageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Landing Page URL *</FormLabel>
                        <FormControl>
                          <Input 
                            type="url"
                            placeholder="https://exemplo.com/plano-auditor-rf" 
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          URL da página de venda (obrigatório para planos pagos)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* ===== SEÇÃO 4: DURAÇÃO E VALIDADE ===== */}
            <Card>
              <CardHeader>
                <CardTitle>4. Duração e Validade</CardTitle>
                <CardDescription>
                  Tempo de acesso e data de expiração
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="durationDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duração (dias)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="Ex: 180, 365"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormDescription>
                          Deixe vazio para acesso vitalício
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="validityDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Validade</FormLabel>
                        <FormControl>
                          <Input 
                            type="date"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Data limite de acesso ao plano
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* ===== SEÇÃO 5: IMAGENS E DESTAQUE ===== */}
            <Card>
              <CardHeader>
                <CardTitle>5. Imagens e Destaque</CardTitle>
                <CardDescription>
                  Imagem de capa e configurações de destaque
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="featuredImageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL da Imagem de Destaque</FormLabel>
                      <FormControl>
                        <Input 
                          type="url"
                          placeholder="https://exemplo.com/imagem-plano.jpg" 
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Imagem de capa do plano (opcional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Plano em Destaque
                        </FormLabel>
                        <FormDescription>
                          Exibir este plano em posição de destaque na listagem
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* ===== SEÇÃO 6: DISPONIBILIDADE ===== */}
            <Card>
              <CardHeader>
                <CardTitle>6. Disponibilidade</CardTitle>
                <CardDescription>
                  Controle de visibilidade e disponibilidade para matrícula
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="disponivel"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Disponível para Matrícula
                        </FormLabel>
                        <FormDescription>
                          Permite que alunos se matriculem neste plano
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isHidden"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Ocultar da Listagem Pública
                        </FormLabel>
                        <FormDescription>
                          Plano não aparece na página pública de planos
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* ===== BOTÕES DE AÇÃO ===== */}
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
      </div>
    </AdminLayout>
  );
}
