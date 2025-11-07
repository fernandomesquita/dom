import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Target, Trophy, Users, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "wouter";

/**
 * Sistema DOM - Landing Page
 * 
 * Página inicial institucional da plataforma de mentoria para concursos públicos
 */

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header/Navbar */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-indigo-600" />
            <span className="text-2xl font-bold text-slate-900">DOM-EARA</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#funcionalidades" className="text-slate-600 hover:text-indigo-600 transition">
              Funcionalidades
            </a>
            <a href="#planos" className="text-slate-600 hover:text-indigo-600 transition">
              Planos
            </a>
            <a href="#sobre" className="text-slate-600 hover:text-indigo-600 transition">
              Sobre
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/cadastro">
              <Button>Começar Grátis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Sua aprovação em concursos públicos começa aqui
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Plataforma completa de mentoria com metodologia EARA® para organizar seus estudos,
            resolver questões e alcançar sua aprovação de forma eficiente.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cadastro">
              <Button size="lg" className="text-lg px-8">
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Conhecer Planos
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funcionalidades" className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Tudo que você precisa para ser aprovado
          </h2>
          <p className="text-lg text-slate-600">
            Ferramentas completas para organizar, estudar e acompanhar seu progresso
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Target className="h-12 w-12 text-indigo-600 mb-2" />
              <CardTitle>Cronograma Inteligente</CardTitle>
              <CardDescription>
                Algoritmo EARA® distribui automaticamente seus estudos de forma otimizada
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BookOpen className="h-12 w-12 text-indigo-600 mb-2" />
              <CardTitle>Materiais Organizados</CardTitle>
              <CardDescription>
                PDFs, vídeos e áudios estruturados por disciplina, assunto e tópico
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle2 className="h-12 w-12 text-indigo-600 mb-2" />
              <CardTitle>Banco de Questões</CardTitle>
              <CardDescription>
                Milhares de questões organizadas por banca, ano e nível de dificuldade
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Trophy className="h-12 w-12 text-indigo-600 mb-2" />
              <CardTitle>Gamificação</CardTitle>
              <CardDescription>
                Sistema de Streak e QTD para manter sua motivação e consistência
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-indigo-600 mb-2" />
              <CardTitle>Fórum Colaborativo</CardTitle>
              <CardDescription>
                Tire dúvidas e compartilhe conhecimento com outros concurseiros
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Target className="h-12 w-12 text-indigo-600 mb-2" />
              <CardTitle>Metas Personalizadas</CardTitle>
              <CardDescription>
                Defina objetivos e acompanhe seu progresso em tempo real
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para começar sua jornada?
          </h2>
          <p className="text-xl mb-8 text-indigo-100">
            Junte-se a milhares de concurseiros que já estão estudando de forma inteligente
          </p>
          <Link href="/cadastro">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Criar Conta Grátis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-6 w-6 text-indigo-400" />
                <span className="text-xl font-bold text-white">DOM-EARA</span>
              </div>
              <p className="text-sm">
                Plataforma de mentoria para concursos públicos com metodologia exclusiva EARA®
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Produto</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#funcionalidades" className="hover:text-indigo-400 transition">Funcionalidades</a></li>
                <li><a href="#planos" className="hover:text-indigo-400 transition">Planos</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition">Depoimentos</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Empresa</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#sobre" className="hover:text-indigo-400 transition">Sobre</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition">Contato</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-indigo-400 transition">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition">Privacidade</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition">LGPD</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2025 DOM-EARA. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
