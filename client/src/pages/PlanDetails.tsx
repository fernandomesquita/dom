/**
 * Página Pública: /plans/:id
 * 
 * Detalhes completos de um plano específico
 */

import { useParams, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, Briefcase, Calendar, Clock, Star, User, ExternalLink, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PlanDetails() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const { data: plan, isLoading } = trpc.plansPublic.getById.useQuery(
    { id: id! },
    { enabled: !!id }
  );

  const enrollMutation = trpc.plansUser.enroll.useMutation({
    onSuccess: (data) => {
      toast.success('Matrícula realizada com sucesso!');
      setLocation(data.redirectUrl);
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao realizar matrícula');
    },
  });

  const handleEnroll = () => {
    if (!isAuthenticated) {
      toast.error('Você precisa estar logado para se matricular');
      setLocation('/login');
      return;
    }

    if (plan?.category === 'Pago' && plan.landingPageUrl) {
      window.open(plan.landingPageUrl, '_blank');
    } else {
      enrollMutation.mutate({ planId: id! });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="h-96 w-full" />
        <div className="container py-8">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-2/3" />
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Plano não encontrado</h1>
          <p className="text-muted-foreground mb-4">O plano que você está procurando não existe ou foi removido.</p>
          <Button onClick={() => setLocation('/allplans')}>Ver todos os planos</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={plan.featuredImageUrl}
          alt={plan.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0">
          <div className="container py-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">{plan.category}</Badge>
              {plan.editalStatus !== 'N/A' && (
                <Badge variant="outline">{plan.editalStatus}</Badge>
              )}
              {plan.isFeatured && (
                <Badge className="bg-primary">
                  <Star className="h-3 w-3 mr-1" />
                  EM DESTAQUE
                </Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{plan.name}</h1>
            {plan.entity && plan.role && (
              <p className="text-xl text-muted-foreground">
                {plan.entity} • {plan.role}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="md:col-span-2 space-y-6">
            {/* Descrição */}
            <Card>
              <CardHeader>
                <CardTitle>Sobre o Plano</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">
                  {plan.description || 'Sem descrição disponível.'}
                </p>
              </CardContent>
            </Card>

            {/* Informações do Mentor */}
            {plan.mentor && (
              <Card>
                <CardHeader>
                  <CardTitle>Mentor Responsável</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold">{plan.mentor.name}</p>
                      <p className="text-sm text-muted-foreground">Mentor do plano</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Preview da Árvore de Conhecimentos */}
            <Card>
              <CardHeader>
                <CardTitle>Conteúdo Programático</CardTitle>
                <CardDescription>
                  Este plano abrange uma estrutura completa de conhecimentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Materiais organizados por disciplina e assunto</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Banco de questões segmentado</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Cronograma de metas personalizado</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Fórum colaborativo com outros alunos</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Card de Matrícula */}
            <Card className="sticky top-4">
              <CardHeader>
                {plan.price && (
                  <div className="text-3xl font-bold mb-2">{plan.price}</div>
                )}
                <CardTitle>
                  {plan.category === 'Gratuito' ? 'Matricule-se Gratuitamente' : 'Adquira Acesso'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleEnroll}
                  disabled={enrollMutation.isPending}
                >
                  {enrollMutation.isPending ? (
                    'Processando...'
                  ) : plan.category === 'Gratuito' ? (
                    'Matricular-se Agora'
                  ) : (
                    <>
                      Saiba Mais
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>

                <div className="space-y-2 text-sm text-muted-foreground">
                  {plan.durationDays && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Duração: {plan.durationDays} dias</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Acesso imediato ao conteúdo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Suporte do mentor</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações Adicionais */}
            <Card>
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {plan.entity && (
                  <div className="flex items-start gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Entidade</p>
                      <p className="text-muted-foreground">{plan.entity}</p>
                    </div>
                  </div>
                )}
                {plan.role && (
                  <div className="flex items-start gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Cargo</p>
                      <p className="text-muted-foreground">{plan.role}</p>
                    </div>
                  </div>
                )}
                {plan.editalStatus !== 'N/A' && (
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Status do Edital</p>
                      <p className="text-muted-foreground">{plan.editalStatus}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            {plan.tags && plan.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {plan.tags.map((tag, i) => (
                      <Badge key={i} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
