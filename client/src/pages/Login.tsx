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
 * Sistema DOM - Página de Login
 * 
 * Autenticação simples com email e senha (SEM OAuth)
 */

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const utils = trpc.useUtils();

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async (data) => {
      console.log('[LOGIN] onSuccess chamado:', data);
      toast.success(data.message);
      
      // ✅ Salvar refresh token para auto-refresh posterior
      if (data.tokens?.refreshToken) {
        localStorage.setItem('refresh_token', data.tokens.refreshToken);
        console.log('[LOGIN] Refresh token salvo no localStorage');
      }
      
      // Invalidar query auth.me para forçar refetch com novo cookie
      console.log('[LOGIN] Invalidando query auth.me');
      await utils.auth.me.invalidate();
      
      console.log('[LOGIN] Redirecionando para /dashboard');
      setLocation("/dashboard");
      console.log('[LOGIN] setLocation("/dashboard") executado');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, senha });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center justify-center gap-2 mb-8 cursor-pointer">
            <BookOpen className="h-10 w-10 text-indigo-600" />
            <span className="text-3xl font-bold text-slate-900">DOM-EARA</span>
          </div>
        </Link>

        {/* Card de Login */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Entrar na sua conta</CardTitle>
            <CardDescription>
              Digite seu email e senha para acessar a plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loginMutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="senha">Senha</Label>
                  <Link href="/recuperar-senha">
                    <span className="text-sm text-indigo-600 hover:text-indigo-700 cursor-pointer">
                      Esqueceu a senha?
                    </span>
                  </Link>
                </div>
                <Input
                  id="senha"
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  disabled={loginMutation.isPending}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-slate-600">Não tem uma conta? </span>
              <Link href="/cadastro">
                <span className="text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer">
                  Criar conta grátis
                </span>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Links */}
        <div className="mt-4 flex items-center justify-between text-sm">
          <Link href="/">
            <span className="text-slate-600 hover:text-slate-900 cursor-pointer">
              ← Voltar para página inicial
            </span>
          </Link>
          <Link href="/admin/login">
            <span className="text-slate-500 hover:text-slate-700 cursor-pointer text-xs">
              Acesso para equipe →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
