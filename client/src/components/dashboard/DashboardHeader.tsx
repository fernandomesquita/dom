import { useState } from "react";
import { Link } from "wouter";
import { Bell, Menu, X, Flame, User, LogOut, Settings, Heart, FileQuestion, GraduationCap } from "lucide-react";
import { AchievementsDialog } from "./AchievementsDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { APP_LOGO, APP_TITLE } from "@/const";

/**
 * E10: Dashboard Header
 * 
 * Header fixo com:
 * - Logo + Navegação
 * - Streak em destaque (animado) 🔥
 * - Avatar + Dropdown
 * - Notificações (badge)
 * - Responsivo (mobile menu)
 */

export function DashboardHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  // Buscar streak atual
  const { data: streakData } = trpc.streak.getCurrentStreak.useQuery(undefined, {
    refetchInterval: 60000, // Atualizar a cada 1 minuto
  });
  
  // Buscar contagem de favoritos
  const { data: favoritesCount } = trpc.admin.materials_v1.getFavoritesCount.useQuery();

  const streak = streakData?.diasConsecutivos || 0;
  const emRisco = streakData?.emRisco || false;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo + Navegação Desktop */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            {APP_LOGO && (
              <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />
            )}
            <span className="font-bold text-lg hidden sm:inline-block">
              {APP_TITLE}
            </span>
          </Link>

          {/* Navegação Desktop */}
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/metas/cronograma" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Metas
            </Link>
            <Link href="/questoes" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group">
              <FileQuestion className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" />
              <span>Questões</span>
            </Link>
            <Link href="/simulados" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group">
              <GraduationCap className="h-4 w-4 text-purple-600 group-hover:scale-110 transition-transform" />
              <span>Simulados</span>
            </Link>
            <Link href="/materiais" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Materiais
            </Link>
            <Link href="/materiais/favoritos" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group">
              <div className="relative inline-block">
                <Heart className="h-4 w-4 text-red-500 group-hover:fill-current transition-all" />
                {favoritesCount && favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-1 shadow-sm">
                    {favoritesCount > 99 ? '99+' : favoritesCount}
                  </span>
                )}
              </div>
              <span>Favoritos</span>
            </Link>
            <Link href="/forum" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Fórum
            </Link>
          </nav>
        </div>

        {/* Streak + Ações */}
        <div className="flex items-center gap-4">
          {/* Conquistas */}
          <div className="hidden md:block">
            <AchievementsDialog />
          </div>

          {/* Streak Badge (Destaque) */}
          <div
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full ${
              emRisco
                ? "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400"
                : "bg-gradient-to-r from-orange-500 to-red-500 text-white"
            } animate-pulse`}
          >
            <Flame className="h-4 w-4" />
            <span className="font-bold text-sm">{streak} dias</span>
          </div>

          {/* Notificações */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              3
            </Badge>
          </Button>

          {/* Avatar + Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-2 p-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user?.name || "Aluno"}</span>
                  <span className="text-xs text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/perfil" className="flex items-center gap-2 w-full">
                  <User className="h-4 w-4" />
                  Meu Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/configuracoes" className="flex items-center gap-2 w-full">
                  <Settings className="h-4 w-4" />
                  Configurações
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => logout()}
                className="text-red-600 dark:text-red-400"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container flex flex-col gap-2 py-4">
            {/* Streak Mobile */}
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                emRisco
                  ? "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400"
                  : "bg-gradient-to-r from-orange-500 to-red-500 text-white"
              }`}
            >
              <Flame className="h-4 w-4" />
              <span className="font-bold text-sm">{streak} dias de streak</span>
              {emRisco && (
                <Badge variant="destructive" className="ml-auto">
                  Em risco!
                </Badge>
              )}
            </div>

            <Link
              href="/metas/cronograma"
              className="px-3 py-2 text-sm font-medium hover:bg-accent rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Metas
            </Link>
            <Link
              href="/questoes"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-accent rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FileQuestion className="h-4 w-4 text-blue-600" />
              <span>Questões</span>
            </Link>
            <Link
              href="/simulados"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-accent rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              <GraduationCap className="h-4 w-4 text-purple-600" />
              <span>Simulados</span>
            </Link>
            <Link
              href="/materiais"
              className="px-3 py-2 text-sm font-medium hover:bg-accent rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Materiais
            </Link>
            <Link
              href="/materiais/favoritos"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-accent rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="relative inline-block">
                <Heart className="h-4 w-4 text-red-500" />
                {favoritesCount && favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-1 shadow-sm">
                    {favoritesCount > 99 ? '99+' : favoritesCount}
                  </span>
                )}
              </div>
              <span>Favoritos</span>
            </Link>
            <Link
              href="/forum"
              className="px-3 py-2 text-sm font-medium hover:bg-accent rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Fórum
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
