import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Loader2, Lock } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

/**
 * Sistema DOM - Página de Login Administrativa
 * 
 * Autenticação para ADMINISTRATIVO e MASTER
 * Visual diferenciado (tema dark) e verificação de role
 */

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const utils = trpc.useUtils();

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async (data) => {
      console.log('[ADMIN LOGIN] onSuccess chamado:', data);
      
      // ✅ Salvar refresh token
      if (data.tokens?.refreshToken) {
        localStorage.setItem('refresh_token', data.tokens.refreshToken);
      }
      
      // Invalidar query auth.me para forçar refetch
      await utils.auth.me.invalidate();
      
      // Buscar dados do usuário atualizado
      const userData = await utils.auth.me.fetch();
      console.log('[ADMIN LOGIN] Dados do usuário:', userData);
      
      // ⚠️ VERIFICAÇÃO DE ROLE CRÍTICA
      if (!userData?.role || !['ADMINISTRATIVO', 'MASTER'].includes(userData.role)) {
        console.log('[ADMIN LOGIN] Acesso negado - role:', userData?.role);
        toast.error('Acesso negado. Esta área é restrita à equipe administrativa.');
        
        // Deslogar o usuário
        await utils.auth.logout.mutate();
        localStorage.removeItem('refresh_token');
        
        return; // Parar execução
      }
      
      // ✅ Role válido - permitir acesso
      console.log('[ADMIN LOGIN] Acesso permitido - role:', userData.role);
      toast.success(`Bem-vindo, ${userData.nomeCompleto || userData.email}!`);
      
      // Redirecionar para dashboard admin
      setLocation("/admin/dashboard");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Admin */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="relative">
            <Shield className="h-12 w-12 text-purple-400" />
            <Lock className="h-5 w-5 text-purple-300 absolute -bottom-1 -right-1" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">DOM-EARA</h1>
            <p className="text-sm text-purple-300 font-medium">Portal Administrativo</p>
          </div>
        </div>

        {/* Badge de Área Restrita */}
        <div className="mb-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full">
            <Lock className="h-4 w-4 text-red-400" />
            <span className="text-sm font-semibold text-red-400 uppercase tracking-wide">
              Área Restrita
            </span>
          </div>
        </div>

        {/* Card de Login */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-white">Acesso Administrativo</CardTitle>
            <CardDescription className="text-slate-400">
              Área restrita para administradores e equipe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@dom.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loginMutation.isPending}
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha" className="text-slate-300">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  disabled={loginMutation.isPending}
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-purple-500/20"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Autenticando...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Acessar Painel
                  </>
                )}
              </Button>
            </form>

            {/* Aviso de Segurança */}
            <div className="mt-6 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-xs text-amber-400 text-center">
                ⚠️ Apenas usuários com permissões administrativas podem acessar esta área
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Link para login de alunos */}
        <div className="mt-6 text-center">
          <Link href="/login">
            <span className="text-sm text-slate-400 hover:text-slate-300 cursor-pointer">
              ← Acessar como aluno
            </span>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500">
            Sistema de Gestão DOM-EARA • Acesso Restrito
          </p>
        </div>
      </div>
    </div>
  );
}
