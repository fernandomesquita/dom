/**
 * Questions - Página principal de questões
 * Lista questões com filtros e permite resolução
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { QuestionCard } from '@/components/questions/QuestionCard';
import { QuestionFilters, QuestionFiltersState } from '@/components/questions/QuestionFilters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft, ChevronRight, Target, TrendingUp, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function Questions() {
  const [filters, setFilters] = useState<QuestionFiltersState>({});
  const [page, setPage] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const limit = 20;

  // Buscar questões
  const { data: questionsData, isLoading: isLoadingQuestions } = trpc.questions.list.useQuery({
    ...filters,
    page,
    limit,
  });

  // Buscar estatísticas do usuário
  const { data: userStats } = trpc.questions.getUserStats.useQuery();

  // Buscar dados para filtros
  const { data: disciplinasData } = trpc.disciplinas.getAll.useQuery({ limit: 100 });
  // TODO: Adicionar procedures getAll em assuntos e topicos
  const assuntosData = { items: [] };
  const topicosData = { items: [] };

  // Mutations
  const submitAnswerMutation = trpc.questions.submitAnswer.useMutation();
  const flagQuestionMutation = trpc.questions.flagQuestion.useMutation();
  const addToNotebookMutation = trpc.questions.addToNotebook.useMutation();

  const questions = questionsData?.items.map(item => item.question) || [];
  const totalQuestions = questionsData?.pagination.total || 0;
  const totalPages = Math.ceil(totalQuestions / limit);
  const currentQuestion = questions[currentQuestionIndex];

  // Extrair bancas e anos únicos
  const examBoards = Array.from(
    new Set(questions.map((q: any) => q.examBoard).filter(Boolean))
  ) as string[];
  
  const examYears = Array.from(
    new Set(questions.map((q: any) => q.examYear).filter(Boolean))
  ).sort((a, b) => (b as number) - (a as number)) as number[];

  const handleSubmitAnswer = async (answer: string | boolean) => {
    if (!currentQuestion) return { isCorrect: false, correctAnswer: '', explanation: '' };

    try {
      const result = await submitAnswerMutation.mutateAsync({
        questionId: currentQuestion.id,
        selectedOption: typeof answer === 'string' ? answer as 'A' | 'B' | 'C' | 'D' | 'E' : undefined,
        trueFalseAnswer: typeof answer === 'boolean' ? answer : undefined,
        timeSpent: 0,
        source: 'practice',
      });

      if (result.isCorrect) {
        toast.success('Resposta correta! 🎉');
      } else {
        toast.error('Resposta incorreta. Veja a explicação.');
      }

      return {
        isCorrect: result.isCorrect,
        correctAnswer: result.correctAnswer,
        explanation: result.explanation,
        explanationImage: result.explanationImage,
      };
    } catch (error) {
      toast.error('Erro ao enviar resposta');
      throw error;
    }
  };

  const handleFlagQuestion = async () => {
    if (!currentQuestion) return;

    try {
      await flagQuestionMutation.mutateAsync({
        questionId: currentQuestion.id,
        flagType: 'error',
        reason: 'Questão sinalizada pelo usuário',
      });

      toast.success('Questão sinalizada para revisão');
    } catch (error) {
      toast.error('Erro ao sinalizar questão');
    }
  };

  const handleAddToNotebook = async () => {
    if (!currentQuestion) return;

    try {
      await addToNotebookMutation.mutateAsync({
        questionId: currentQuestion.id,
        notebookType: 'review',
      });

      toast.success('Questão adicionada ao caderno de revisão');
    } catch (error) {
      toast.error('Erro ao adicionar questão ao caderno');
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (page < totalPages) {
      setPage(page + 1);
      setCurrentQuestionIndex(0);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (page > 1) {
      setPage(page - 1);
      setCurrentQuestionIndex(limit - 1);
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Banco de Questões</h1>
        <p className="text-muted-foreground">
          Pratique com milhares de questões de concursos anteriores
        </p>
      </div>

      {/* Estatísticas do usuário */}
      {userStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Respondidas</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.totalAttempts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Acerto</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.accuracy.toFixed(1)}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sequência Atual</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.correctCount}</div>
              <p className="text-xs text-muted-foreground">acertos</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filtros (sidebar) */}
        <div className="lg:col-span-1">
          <QuestionFilters
            filters={filters}
            onChange={(newFilters) => {
              setFilters(newFilters);
              setPage(1);
              setCurrentQuestionIndex(0);
            }}
            disciplinas={disciplinasData?.items || []}
            assuntos={assuntosData?.items || []}
            topicos={topicosData?.items || []}
            examBoards={examBoards}
            examYears={examYears}
          />
        </div>

        {/* Questão atual */}
        <div className="lg:col-span-3 space-y-6">
          {isLoadingQuestions ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ) : questions.length === 0 ? (
            <Alert>
              <AlertDescription>
                Nenhuma questão encontrada com os filtros selecionados.
              </AlertDescription>
            </Alert>
          ) : currentQuestion ? (
            <>
              {/* Contador de questões */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Questão {(page - 1) * limit + currentQuestionIndex + 1} de {totalQuestions}
                </p>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousQuestion}
                    disabled={page === 1 && currentQuestionIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextQuestion}
                    disabled={page === totalPages && currentQuestionIndex === questions.length - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Card da questão */}
              <QuestionCard
                question={currentQuestion}
                onSubmit={handleSubmitAnswer}
                onFlag={handleFlagQuestion}
                onAddToNotebook={handleAddToNotebook}
                showTimer
              />

              {/* Navegação inferior */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handlePreviousQuestion}
                  disabled={page === 1 && currentQuestionIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
                
                <Button
                  onClick={handleNextQuestion}
                  disabled={page === totalPages && currentQuestionIndex === questions.length - 1}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
