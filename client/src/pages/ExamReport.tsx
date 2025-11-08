/**
 * ExamReport - Relatório detalhado após finalizar simulado
 */

import { useParams, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  TrendingUp,
  Award,
  ArrowLeft,
  RotateCcw,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function ExamReport() {
  const { attemptId } = useParams();
  const [, setLocation] = useLocation();

  // Query do resultado do simulado
  const { data: attempt, isLoading } = trpc.exams.getAttempt.useQuery({
    attemptId: Number(attemptId),
  });

  if (isLoading) {
    return (
      <div className="container max-w-7xl py-8">
        <div className="space-y-6">
          <Skeleton className="h-12 w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!attempt || !attempt.exam) {
    return (
      <div className="container max-w-7xl py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p>Simulado não encontrado.</p>
            <Button className="mt-4" onClick={() => setLocation('/simulados')}>
              Voltar para Simulados
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const exam = attempt.exam;

  const answers = attempt.answers as Record<string, any> || {};
  const totalQuestions = exam.totalQuestions;
  const correctCount = attempt.correctCount || 0;
  const wrongCount = totalQuestions - correctCount;
  const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
  const timeSpent = attempt.timeSpent || 0;
  const avgTimePerQuestion = totalQuestions > 0 ? timeSpent / totalQuestions : 0;
  const score = attempt.score || 0;

  // Dados para gráfico de pizza
  const pieData = [
    { name: 'Acertos', value: correctCount, color: '#10b981' },
    { name: 'Erros', value: wrongCount, color: '#ef4444' },
  ];

  // Status do simulado
  const isPassed = exam.passingScore
    ? score >= exam.passingScore
    : accuracy >= 70;

  return (
    <div className="container max-w-7xl py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/simulados')}
              className="mb-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Simulados
            </Button>
            <h1 className="text-3xl font-bold">{exam.title}</h1>
            <p className="text-muted-foreground mt-2">
              Finalizado em {new Date(attempt.completedAt!).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <Button onClick={() => setLocation('/simulados')}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Fazer Novo Simulado
          </Button>
        </div>

        {/* Badge de aprovação/reprovação */}
        {exam.passingScore && (
          <Card className={`border-l-4 ${isPassed ? 'border-l-green-600' : 'border-l-red-600'}`}>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                {isPassed ? (
                  <Award className="h-8 w-8 text-green-600" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-600" />
                )}
                <div>
                  <p className="text-lg font-semibold">
                    {isPassed ? 'Aprovado!' : 'Não aprovado'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Nota mínima: {exam.passingScore} pontos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pontuação */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pontuação</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{score}</div>
              <p className="text-xs text-muted-foreground mt-1">
                de {totalQuestions} pontos
              </p>
            </CardContent>
          </Card>

          {/* Taxa de acerto */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Acerto</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${accuracy >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                {accuracy.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {correctCount} de {totalQuestions} questões
              </p>
            </CardContent>
          </Card>

          {/* Tempo total */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tempo Total</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Média: {Math.round(avgTimePerQuestion)}s/questão
              </p>
            </CardContent>
          </Card>

          {/* Desempenho */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Desempenho</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {accuracy >= 90 ? 'Excelente' : accuracy >= 70 ? 'Bom' : accuracy >= 50 ? 'Regular' : 'Precisa Melhorar'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {correctCount} acertos, {wrongCount} erros
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Gráfico de pizza */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Respostas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Placeholder para desempenho por disciplina */}
          <Card>
            <CardHeader>
              <CardTitle>Desempenho por Disciplina</CardTitle>
              <CardDescription>Em desenvolvimento</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[250px]">
              <p className="text-muted-foreground">
                Análise por disciplina será implementada em breve
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Revisão de questões */}
        <Card>
          <CardHeader>
            <CardTitle>Revisão de Questões</CardTitle>
            <CardDescription>
              Revise suas respostas e veja os gabaritos comentados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(answers).map(([questionId, answer]: [string, any], index) => {
                const isCorrect = answer.isCorrect;
                
                return (
                  <div
                    key={questionId}
                    className={`p-4 border rounded-lg ${
                      isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">Questão {index + 1}</span>
                          <Badge variant={isCorrect ? 'default' : 'destructive'}>
                            {isCorrect ? 'Acerto' : 'Erro'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Sua resposta: <span className="font-medium">{answer.userAnswer || 'Não respondida'}</span>
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Resposta correta: <span className="font-medium text-green-700">{answer.correctAnswer}</span>
                          </p>
                        )}
                        {answer.explanation && (
                          <div className="mt-2 p-3 bg-white rounded border">
                            <p className="text-sm font-medium mb-1">Explicação:</p>
                            <p className="text-sm text-muted-foreground">{answer.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Ações finais */}
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => setLocation('/simulados')}>
            Ver Todos os Simulados
          </Button>
          <Button onClick={() => setLocation('/questoes')}>
            Treinar Questões
          </Button>
        </div>
      </div>
    </div>
  );
}
