/**
 * Header - Navegação global persistente
 */

import { Link, useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { APP_LOGO, APP_TITLE, getLoginUrl } from '@/const';
import {
  Home,
  BookOpen,
  FileText,
  Notebook,
  BarChart3,
  Menu,
  User,
  Settings,
  LogOut,
  BookMarked,
} from 'lucide-react';
import { AvisosCentral } from './avisos/AvisosCentral';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navigation = [
  { name: 'Início', href: '/', icon: Home },
  { name: 'Questões', href: '/questoes', icon: FileText },
  { name: 'Simulados', href: '/simulados', icon: BookOpen },
  { name: 'Cadernos', href: '/cadernos', icon: Notebook },
  { name: 'Estatísticas', href: '/estatisticas', icon: BarChart3 },
  { name: 'Materiais', href: '/materiais', icon: BookMarked },
];

export default function Header() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return location === '/';
    }
    return location.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-2 mr-6 cursor-pointer">
            <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />
            <span className="font-bold text-xl hidden sm:inline-block">{APP_TITLE}</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-4 ml-auto">
          {/* Central de Avisos */}
          {isAuthenticated && <AvisosCentral />}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="hidden lg:inline-block">{user.nomeCompleto || user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/perfil">
                    <div className="flex items-center gap-2 w-full cursor-pointer">
                      <User className="h-4 w-4" />
                      Meu Perfil
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/configuracoes">
                    <div className="flex items-center gap-2 w-full cursor-pointer">
                      <Settings className="h-4 w-4" />
                      Configurações
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Entrar</Link>
              </Button>
              <Button asChild>
                <Link href="/cadastro">Começar Grátis</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="flex md:hidden ml-auto">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-md text-base font-medium transition-colors cursor-pointer',
                          active
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {item.name}
                      </div>
                    </Link>
                  );
                })}

                <div className="border-t pt-4 mt-4">
                  {isAuthenticated && user ? (
                    <>
                      <div className="px-4 py-2 text-sm text-muted-foreground">
                        {user.nomeCompleto || user.email}
                      </div>
                      <Link href="/perfil">
                        <div
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-md text-base font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
                        >
                          <User className="h-5 w-5" />
                          Meu Perfil
                        </div>
                      </Link>
                      <Link href="/configuracoes">
                        <div
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-md text-base font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
                        >
                          <Settings className="h-5 w-5" />
                          Configurações
                        </div>
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50 w-full"
                      >
                        <LogOut className="h-5 w-5" />
                        Sair
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login">
                        <div
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-center px-4 py-3 rounded-md text-base font-medium border mb-2 cursor-pointer"
                        >
                          Entrar
                        </div>
                      </Link>
                      <Link href="/cadastro">
                        <div
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-center px-4 py-3 rounded-md text-base font-medium bg-primary text-primary-foreground cursor-pointer"
                        >
                          Começar Grátis
                        </div>
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
