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
} from 'lucide-react';
import { ExamGenerator } from '@/components/exams/ExamGenerator';
import { useLocation } from 'wouter';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Exams() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('create');

  // Queries
  const { data: attemptsData, isLoading } = trpc.exams.listMyAttempts.useQuery({
    limit: 20,
    offset: 0,
  });

  const handleResumeAttempt = (attemptId: number) => {
    setLocation(`/simulados/${attemptId}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">Concluído</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">Em andamento</Badge>;
      case 'abandoned':
        return <Badge variant="destructive">Abandonado</Badge>;
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container max-w-7xl py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Simulados</h1>
          <p className="text-muted-foreground mt-2">
            Crie simulados personalizados e teste seus conhecimentos
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="create">Criar Simulado</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          {/* Tab: Criar Simulado */}
          <TabsContent value="create" className="mt-6">
            <ExamGenerator />
          </TabsContent>

          {/* Tab: Histórico */}
          <TabsContent value="history" className="mt-6 space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-2/3" />
                      <Skeleton className="h-4 w-1/2 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : attemptsData && attemptsData.items.length > 0 ? (
              <div className="space-y-4">
                {attemptsData.items.map(({ attempt, exam }) => {
                  const timeAgo = formatDistanceToNow(new Date(attempt.startedAt), {
                    addSuffix: true,
                    locale: ptBR,
                  });

                  return (
                    <Card key={attempt.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-xl">{exam.title}</CardTitle>
                            {exam.description && (
                              <CardDescription>{exam.description}</CardDescription>
                            )}
                          </div>
                          {getStatusBadge(attempt.status)}
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Estatísticas */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{exam.totalQuestions}</p>
                              <p className="text-xs text-muted-foreground">Questões</p>
                            </div>
                          </div>

                          {attempt.status === 'completed' && (
                            <>
                              <div className="flex items-center gap-2">
                                <Trophy
                                  className={`h-4 w-4 ${getScoreColor(attempt.score || 0)}`}
                                />
                                <div>
                                  <p className={`text-sm font-medium ${getScoreColor(attempt.score || 0)}`}>
                                    {attempt.score?.toFixed(1)}%
                                  </p>
                                  <p className="text-xs text-muted-foreground">Nota</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <div>
                                  <p className="text-sm font-medium">{attempt.correctCount}</p>
                                  <p className="text-xs text-muted-foreground">Acertos</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-red-600" />
                                <div>
                                  <p className="text-sm font-medium">{attempt.wrongCount}</p>
                                  <p className="text-xs text-muted-foreground">Erros</p>
                                </div>
                              </div>
                            </>
                          )}

                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">
                                {Math.floor((attempt.timeSpent || 0) / 60)}min
                              </p>
                              <p className="text-xs text-muted-foreground">Tempo</p>
                            </div>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{timeAgo}</span>
                          </div>

                          {attempt.status === 'in_progress' ? (
                            <Button onClick={() => handleResumeAttempt(attempt.id)}>
                              <Play className="mr-2 h-4 w-4" />
                              Continuar
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              onClick={() => handleResumeAttempt(attempt.id)}
                            >
                              Ver Resultado
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  Você ainda não realizou nenhum simulado. Crie um novo simulado para começar!
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
