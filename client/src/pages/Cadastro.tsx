import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

/**
 * Sistema DOM - Página de Cadastro
 * 
 * Registro de novo usuário com autenticação simples (SEM OAuth)
 */

export default function Cadastro() {
  const [, setLocation] = useLocation();
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      // Redirecionar para dashboard
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar se as senhas coincidem
    if (senha !== confirmarSenha) {
      toast.error("As senhas não coincidem");
      return;
    }

    registerMutation.mutate({
      nomeCompleto,
      email,
      senha,
      dataNascimento,
      cpf: cpf || undefined,
      telefone: telefone || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center justify-center gap-2 mb-8 cursor-pointer">
            <BookOpen className="h-10 w-10 text-indigo-600" />
            <span className="text-3xl font-bold text-slate-900">DOM-EARA</span>
          </div>
        </Link>

        {/* Card de Cadastro */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Criar sua conta</CardTitle>
            <CardDescription>
              Preencha os dados abaixo para começar sua jornada rumo à aprovação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nomeCompleto">Nome Completo *</Label>
                  <Input
                    id="nomeCompleto"
                    type="text"
                    placeholder="João da Silva"
                    value={nomeCompleto}
                    onChange={(e) => setNomeCompleto(e.target.value)}
                    required
                    disabled={registerMutation.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={registerMutation.isPending}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="senha">Senha *</Label>
                  <Input
                    id="senha"
                    type="password"
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    disabled={registerMutation.isPending}
                  />
                  <p className="text-xs text-slate-500">
                    Mínimo 8 caracteres, 1 maiúscula e 1 número
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha">Confirmar Senha *</Label>
                  <Input
                    id="confirmarSenha"
                    type="password"
                    placeholder="••••••••"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    required
                    disabled={registerMutation.isPending}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
                  <Input
                    id="dataNascimento"
                    type="date"
                    value={dataNascimento}
                    onChange={(e) => setDataNascimento(e.target.value)}
                    required
                    disabled={registerMutation.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF (opcional)</Label>
                  <Input
                    id="cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    disabled={registerMutation.isPending}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone (opcional)</Label>
                <Input
                  id="telefone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  disabled={registerMutation.isPending}
                />
              </div>

              <div className="text-xs text-slate-500">
                * Campos obrigatórios
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  "Criar Conta"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-slate-600">Já tem uma conta? </span>
              <Link href="/login">
                <a className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Fazer login
                </a>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Link para voltar */}
        <div className="mt-4 text-center">
          <Link href="/">
            <a className="text-sm text-slate-600 hover:text-slate-900">
              ← Voltar para página inicial
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
