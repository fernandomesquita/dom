import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

const studentSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  cpf: z.string().optional(),
  senha: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  role: z.enum(["ALUNO", "PROFESSOR", "MENTOR", "ADMINISTRATIVO", "MASTER"]),
});

type StudentFormData = z.infer<typeof studentSchema>;

export default function StudentFormPage() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      role: "ALUNO",
    },
  });

  const createMutation = trpc.admin.users_v1.create.useMutation({
    onSuccess: () => {
      toast.success("Usuário criado com sucesso!");
      utils.admin.users_v1.list.invalidate();
      setLocation("/admin/alunos");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: StudentFormData) => {
    createMutation.mutate({
      ...data,
      cpf: data.cpf || undefined,
    });
  };

  const roleValue = watch("role");

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/admin/alunos")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Novo Usuário</h1>
            <p className="text-muted-foreground mt-1">Preencha os dados para criar um novo usuário</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Dados do Usuário</CardTitle>
              <CardDescription>Informações básicas e credenciais de acesso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="nome">
                  Nome Completo <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nome"
                  placeholder="João da Silva"
                  {...register("nome")}
                  className={errors.nome ? "border-destructive" : ""}
                />
                {errors.nome && (
                  <p className="text-sm text-destructive">{errors.nome.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="joao@exemplo.com"
                  {...register("email")}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* CPF */}
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF (opcional)</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  {...register("cpf")}
                  className={errors.cpf ? "border-destructive" : ""}
                />
                {errors.cpf && (
                  <p className="text-sm text-destructive">{errors.cpf.message}</p>
                )}
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <Label htmlFor="senha">
                  Senha <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="senha"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  {...register("senha")}
                  className={errors.senha ? "border-destructive" : ""}
                />
                {errors.senha && (
                  <p className="text-sm text-destructive">{errors.senha.message}</p>
                )}
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="role">
                  Tipo de Usuário <span className="text-destructive">*</span>
                </Label>
                <Select value={roleValue} onValueChange={(value) => setValue("role", value as any)}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALUNO">Aluno</SelectItem>
                    <SelectItem value="PROFESSOR">Professor</SelectItem>
                    <SelectItem value="MENTOR">Mentor</SelectItem>
                    <SelectItem value="ADMINISTRATIVO">Administrativo</SelectItem>
                    <SelectItem value="MASTER">Master</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-destructive">{errors.role.message}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || createMutation.isPending}
                  className="flex-1"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting || createMutation.isPending ? "Criando..." : "Criar Usuário"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/admin/alunos")}
                  disabled={isSubmitting || createMutation.isPending}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </AdminLayout>
  );
}
