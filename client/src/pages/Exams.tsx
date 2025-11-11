/**
 * Exams - Página de simulados
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  Trophy,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { ExamGenerator } from '@/components/exams/ExamGenerator';
import { useLocation } from 'wouter';
import { StudentLayout } from '@/components/StudentLayout';

export default function Exams() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('create');

  // Query de tentativas de simulados
  const { data: attemptsData, isLoading, error } = trpc.exams.listMyAttempts.useQuery(
    {
      limit: 20,
      offset: 0,
    },
    {
      retry: 1,
      onError: (err) => {
        console.error('Erro ao carregar simulados:', err);
      },
    }
  );

  const handleResumeAttempt = (attemptId: number) => {
    setLocation(`/simulados/${attemptId}`);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      in_progress: { label: 'Em Andamento', variant: 'default' as const, icon: Play },
      completed: { label: 'Concluído', variant: 'secondary' as const, icon: CheckCircle2 },
      abandoned: { label: 'Abandonado', variant: 'destructive' as const, icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.in_progress;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <StudentLayout>
      <div className="bg-background">
      <div className="container max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Simulados</h1>
          <p className="text-muted-foreground">
            Teste seus conhecimentos com simulados completos
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="create">Criar Simulado</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          {/* Tab: Criar Simulado */}
          <TabsContent value="create" className="space-y-6">
            <ExamGenerator />
          </TabsContent>

          {/* Tab: Histórico */}
          <TabsContent value="history" className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Erro ao carregar histórico de simulados. Tente novamente mais tarde.
                </AlertDescription>
              </Alert>
            )}

            {isLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!isLoading && !error && attemptsData && (
              <>
                {attemptsData.items.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium mb-2">
                        Você ainda não realizou nenhum simulado
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Crie um novo simulado para começar!
                      </p>
                      <Button onClick={() => setActiveTab('create')}>
                        Criar Primeiro Simulado
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {attemptsData.items.map((attempt) => (
                      <Card key={attempt.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-xl">
                                {attempt.exam?.title || 'Simulado sem título'}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {formatDate(attempt.startedAt)}
                              </CardDescription>
                            </div>
                            {getStatusBadge(attempt.status)}
                          </div>
                        </CardHeader>

                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Questões</p>
                              <p className="text-lg font-semibold flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                {attempt.exam?.totalQuestions || 0}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Tempo Limite</p>
                              <p className="text-lg font-semibold flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {attempt.exam?.timeLimit ? `${attempt.exam.timeLimit}min` : 'Ilimitado'}
                              </p>
                            </div>

                            {attempt.status === 'completed' && (
                              <>
                                <div className="space-y-1">
                                  <p className="text-sm text-muted-foreground">Nota</p>
                                  <p className="text-lg font-semibold flex items-center gap-1">
                                    <Trophy className="h-4 w-4" />
                                    {attempt.score?.toFixed(1) || '0.0'}%
                                  </p>
                                </div>

                                <div className="space-y-1">
                                  <p className="text-sm text-muted-foreground">Acertos</p>
                                  <p className="text-lg font-semibold flex items-center gap-1">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    {attempt.correctAnswers || 0}/{attempt.exam?.totalQuestions || 0}
                                  </p>
                                </div>
                              </>
                            )}
                          </div>

                          <div className="flex gap-2">
                            {attempt.status === 'in_progress' && (
                              <Button
                                onClick={() => handleResumeAttempt(attempt.id)}
                                className="flex-1"
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Continuar Simulado
                              </Button>
                            )}

                            {attempt.status === 'completed' && (
                              <>
                                <Button
                                  onClick={() => setLocation(`/simulados/${attempt.id}/relatorio`)}
                                  variant="default"
                                  className="flex-1"
                                >
                                  <Trophy className="h-4 w-4 mr-2" />
                                  Ver Relatório
                                </Button>
                                <Button
                                  onClick={() => handleResumeAttempt(attempt.id)}
                                  variant="outline"
                                >
                                  Revisar
                                </Button>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
      </div>
    </StudentLayout>
  );
}
