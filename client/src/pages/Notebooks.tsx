/**
 * Notebooks - Cadernos personalizados de questões
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
  BookOpen,
  XCircle,
  Heart,
  Trash2,
  CheckCircle2,
  PlayCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type NotebookType = 'review' | 'mistakes' | 'favorites';

export default function Notebooks() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<NotebookType>('review');

  // Queries
  const { data: reviewData, isLoading: reviewLoading, refetch: refetchReview } =
    trpc.questions.getNotebookQuestions.useQuery({
      notebookType: 'review',
      limit: 50,
      offset: 0,
    });

  const { data: mistakesData, isLoading: mistakesLoading, refetch: refetchMistakes } =
    trpc.questions.getNotebookQuestions.useQuery({
      notebookType: 'mistakes',
      limit: 50,
      offset: 0,
    });

  const { data: favoritesData, isLoading: favoritesLoading, refetch: refetchFavorites } =
    trpc.questions.getNotebookQuestions.useQuery({
      notebookType: 'favorites',
      limit: 50,
      offset: 0,
    });

  // Mutations
  const removeFromNotebookMutation = trpc.questions.removeFromNotebook.useMutation({
    onSuccess: () => {
      toast.success('Questão removida do caderno');
      // Refetch baseado no tab ativo
      if (activeTab === 'review') refetchReview();
      else if (activeTab === 'mistakes') refetchMistakes();
      else refetchFavorites();
    },
    onError: () => {
      toast.error('Erro ao remover questão');
    },
  });

  const handleRemove = async (questionId: number, notebookType: NotebookType) => {
    if (confirm('Remover esta questão do caderno?')) {
      await removeFromNotebookMutation.mutateAsync({ questionId, notebookType });
    }
  };

  const handleStartPractice = (notebookType: NotebookType) => {
    // TODO: Implementar modo treino com questões do caderno
    toast.info('Modo treino em desenvolvimento');
  };

  const renderNotebookContent = (
    data: typeof reviewData | typeof mistakesData | typeof favoritesData,
    isLoading: boolean,
    notebookType: NotebookType,
    icon: React.ReactNode,
    title: string,
    description: string,
    color: string
  ) => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      );
    }

    if (!data || data.items.length === 0) {
      return (
        <Alert>
          <AlertDescription>
            Nenhuma questão neste caderno ainda. Adicione questões enquanto resolve para
            organizá-las melhor!
          </AlertDescription>
        </Alert>
      );
    }

    const totalQuestions = data.total;
    const avgAccuracy =
      data.items.reduce((sum: number, q: any) => sum + (q.accuracy || 0), 0) /
      data.items.length;

    return (
      <div className="space-y-6">
        {/* Header com estatísticas */}
        <Card className={`border-l-4 ${color}`}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {icon}
                <div>
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </div>
              </div>
              <Button onClick={() => handleStartPractice(notebookType)}>
                <PlayCircle className="mr-2 h-4 w-4" />
                Iniciar Treino
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{totalQuestions}</p>
                <p className="text-sm text-muted-foreground">Questões</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {avgAccuracy.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">Taxa de Acerto Média</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {data.items.filter((q: any) => q.attemptCount > 0).length}
                </p>
                <p className="text-sm text-muted-foreground">Já Resolvidas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de questões */}
        <div className="space-y-3">
          {data.items.map((question: any) => {
            const timeAgo = question.addedToNotebook
              ? formatDistanceToNow(new Date(question.addedToNotebook), {
                  addSuffix: true,
                  locale: ptBR,
                })
              : '';

            return (
              <Card key={question.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {/* Header */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline">{question.uniqueCode}</Badge>
                        {question.examBoard && (
                          <Badge variant="secondary">{question.examBoard}</Badge>
                        )}
                        {question.examYear && (
                          <Badge variant="secondary">{question.examYear}</Badge>
                        )}
                        <Badge variant="outline">
                          {question.difficulty === 'easy'
                            ? 'Fácil'
                            : question.difficulty === 'medium'
                            ? 'Média'
                            : 'Difícil'}
                        </Badge>
                      </div>

                      {/* Enunciado (truncado) */}
                      <p className="text-sm line-clamp-2">{question.statementText}</p>

                      {/* Estatísticas */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Tentativas: {question.attemptCount}</span>
                        {question.attemptCount > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              {question.lastAttemptCorrect ? (
                                <CheckCircle2 className="h-3 w-3 text-green-600" />
                              ) : (
                                <XCircle className="h-3 w-3 text-red-600" />
                              )}
                              Última: {question.lastAttemptCorrect ? 'Acerto' : 'Erro'}
                            </span>
                            <span>•</span>
                            <span>Acerto: {question.accuracy.toFixed(0)}%</span>
                          </>
                        )}
                        {timeAgo && (
                          <>
                            <span>•</span>
                            <span>Adicionado {timeAgo}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(`/questoes?id=${question.id}`)}
                      >
                        Ver Questão
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(question.id, notebookType)}
                        disabled={removeFromNotebookMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="container max-w-7xl py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Meus Cadernos</h1>
          <p className="text-muted-foreground mt-2">
            Organize suas questões para revisão, erros e favoritos
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as NotebookType)}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="review">
              <BookOpen className="mr-2 h-4 w-4" />
              Revisão
            </TabsTrigger>
            <TabsTrigger value="mistakes">
              <XCircle className="mr-2 h-4 w-4" />
              Erros
            </TabsTrigger>
            <TabsTrigger value="favorites">
              <Heart className="mr-2 h-4 w-4" />
              Favoritos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="review" className="mt-6">
            {renderNotebookContent(
              reviewData,
              reviewLoading,
              'review',
              <BookOpen className="h-6 w-6 text-blue-600" />,
              'Caderno de Revisão',
              'Questões marcadas para revisar mais tarde',
              'border-l-blue-600',
            )}
          </TabsContent>

          <TabsContent value="mistakes" className="mt-6">
            {renderNotebookContent(
              mistakesData,
              mistakesLoading,
              'mistakes',
              <XCircle className="h-6 w-6 text-red-600" />,
              'Caderno de Erros',
              'Questões que você errou e precisa revisar',
              'border-l-red-600',
            )}
          </TabsContent>

          <TabsContent value="favorites" className="mt-6">
            {renderNotebookContent(
              favoritesData,
              favoritesLoading,
              'favorites',
              <Heart className="h-6 w-6 text-pink-600" />,
              'Caderno de Favoritos',
              'Suas questões favoritas',
              'border-l-pink-600',
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
