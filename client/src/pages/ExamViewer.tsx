/**
 * ExamViewer - Interface para resolver simulado
 */

import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Flag,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ExamViewer() {
  const [, params] = useRoute('/simulados/:attemptId');
  const [, setLocation] = useLocation();
  const attemptId = parseInt(params?.attemptId || '0');

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showFinishDialog, setShowFinishDialog] = useState(false);

  // Queries
  const { data: attempt, isLoading: attemptLoading } = trpc.exams.getAttempt.useQuery({
    attemptId,
  });

  const { data: examData, isLoading: examLoading } = trpc.exams.getById.useQuery(
    { examId: attempt?.examId || 0 },
    { enabled: !!attempt?.examId }
  );

  // Mutations
  const submitAnswerMutation = trpc.exams.submitAnswer.useMutation({
    onError: () => {
      toast.error('Erro ao salvar resposta');
    },
  });

  const finishExamMutation = trpc.exams.finish.useMutation({
    onSuccess: () => {
      toast.success('Simulado finalizado!');
      setLocation(`/simulados/${attemptId}/resultado`);
    },
    onError: () => {
      toast.error('Erro ao finalizar simulado');
    },
  });

  // Cronômetro
  useEffect(() => {
    if (!attempt || attempt.status !== 'in_progress') return;

    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [attempt]);

  // Carregar respostas salvas
  useEffect(() => {
    if (attempt?.answers) {
      setAnswers(attempt.answers as Record<number, any>);
    }
  }, [attempt]);

  const handleAnswerChange = async (questionId: number, answer: any) => {
    // Atualizar estado local
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));

    // Autosave
    await submitAnswerMutation.mutateAsync({
      attemptId,
      questionId,
      selectedOption: answer.selectedOption,
      trueFalseAnswer: answer.trueFalseAnswer,
    });
  };

  const handleFinish = async () => {
    setShowFinishDialog(false);
    await finishExamMutation.mutateAsync({ attemptId });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (attemptLoading || examLoading) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!attempt || !examData) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p>Simulado não encontrado</p>
            <Button onClick={() => setLocation('/simulados')} className="mt-4">
              Voltar para Simulados
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { exam, questions } = examData;
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;

  const isAnswered = (questionId: number) => {
    return !!answers[questionId];
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentQuestionIndex(index);
    }
  };

  return (
    <div className="container max-w-7xl py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Navegação */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Progresso</h3>
                <Badge variant="secondary">
                  {answeredCount}/{totalQuestions}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={progress} />

              {/* Cronômetro */}
              <div className="flex items-center gap-2 text-lg font-mono">
                <Clock className="h-5 w-5" />
                <span>{formatTime(timeElapsed)}</span>
              </div>

              {/* Grid de questões */}
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, index) => (
                  <button
                    key={q.id}
                    onClick={() => goToQuestion(index)}
                    className={cn(
                      'aspect-square rounded-md border-2 flex items-center justify-center text-sm font-medium transition-colors',
                      index === currentQuestionIndex
                        ? 'border-primary bg-primary text-primary-foreground'
                        : isAnswered(q.id)
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-gray-400'
                    )}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              {/* Botão finalizar */}
              <Button
                onClick={() => setShowFinishDialog(true)}
                className="w-full"
                variant="destructive"
                disabled={finishExamMutation.isPending}
              >
                <Flag className="mr-2 h-4 w-4" />
                Finalizar Simulado
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main - Questão */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{exam.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Questão {currentQuestionIndex + 1} de {totalQuestions}
                  </p>
                </div>
                <Badge variant="outline">{currentQuestion.uniqueCode}</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Metadados */}
              <div className="flex flex-wrap gap-2">
                {currentQuestion.examBoard && (
                  <Badge variant="secondary">{currentQuestion.examBoard}</Badge>
                )}
                {currentQuestion.examYear && (
                  <Badge variant="secondary">{currentQuestion.examYear}</Badge>
                )}
                <Badge variant="outline">
                  {currentQuestion.difficulty === 'easy'
                    ? 'Fácil'
                    : currentQuestion.difficulty === 'medium'
                    ? 'Média'
                    : 'Difícil'}
                </Badge>
              </div>

              {/* Enunciado */}
              <div className="prose max-w-none">
                <p className="text-base whitespace-pre-wrap">{currentQuestion.statementText}</p>
              </div>

              {/* Alternativas */}
              {currentQuestion.questionType === 'multiple_choice' ? (
                <RadioGroup
                  value={answers[currentQuestion.id]?.selectedOption || ''}
                  onValueChange={(value) =>
                    handleAnswerChange(currentQuestion.id, { selectedOption: value })
                  }
                >
                  {(['A', 'B', 'C', 'D', 'E'] as const).map((option) => {
                    const optionText = currentQuestion[`option${option}` as keyof typeof currentQuestion];
                    if (!optionText) return null;

                    return (
                      <div
                        key={option}
                        className="flex items-start gap-3 p-4 rounded-lg border-2 hover:border-primary/50 transition-colors cursor-pointer"
                      >
                        <RadioGroupItem value={option} id={`option-${option}`} className="mt-1" />
                        <Label
                          htmlFor={`option-${option}`}
                          className="flex-1 cursor-pointer text-base"
                        >
                          <span className="font-semibold mr-2">{option})</span>
                          {optionText as string}
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() =>
                      handleAnswerChange(currentQuestion.id, { trueFalseAnswer: true })
                    }
                    className={cn(
                      'w-full p-4 rounded-lg border-2 text-left transition-colors',
                      answers[currentQuestion.id]?.trueFalseAnswer === true
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-300 hover:border-primary/50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {answers[currentQuestion.id]?.trueFalseAnswer === true ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                      <span className="text-base font-medium">Verdadeiro</span>
                    </div>
                  </button>

                  <button
                    onClick={() =>
                      handleAnswerChange(currentQuestion.id, { trueFalseAnswer: false })
                    }
                    className={cn(
                      'w-full p-4 rounded-lg border-2 text-left transition-colors',
                      answers[currentQuestion.id]?.trueFalseAnswer === false
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-300 hover:border-primary/50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {answers[currentQuestion.id]?.trueFalseAnswer === false ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                      <span className="text-base font-medium">Falso</span>
                    </div>
                  </button>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => goToQuestion(currentQuestionIndex - 1)}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>

              <Button
                onClick={() => goToQuestion(currentQuestionIndex + 1)}
                disabled={currentQuestionIndex === totalQuestions - 1}
              >
                Próxima
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Dialog de confirmação */}
      <AlertDialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finalizar Simulado?</AlertDialogTitle>
            <AlertDialogDescription>
              Você respondeu {answeredCount} de {totalQuestions} questões.
              {answeredCount < totalQuestions && (
                <span className="block mt-2 text-yellow-600 font-medium">
                  Atenção: Você ainda tem {totalQuestions - answeredCount} questões não
                  respondidas.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar Respondendo</AlertDialogCancel>
            <AlertDialogAction onClick={handleFinish}>Finalizar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
