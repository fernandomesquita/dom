/**
 * ExamGenerator - Gerador de simulados com filtros
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useLocation } from 'wouter';

export function ExamGenerator() {
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [disciplinaId, setDisciplinaId] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [questionCount, setQuestionCount] = useState(20);
  const [timeLimit, setTimeLimit] = useState<number>(60);
  const [isPublic, setIsPublic] = useState(false);

  // Queries
  const { data: disciplinas } = trpc.disciplinas.getAll.useQuery({ includeInactive: false });

  // Mutations
  const createExamMutation = trpc.exams.create.useMutation({
    onSuccess: async (data) => {
      toast.success('Simulado criado com sucesso!');
      
      // Iniciar simulado automaticamente
      const startResult = await startExamMutation.mutateAsync({ examId: data.examId });
      
      // Redirecionar para página de resolução
      setLocation(`/simulados/${startResult.attemptId}`);
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao criar simulado');
    },
  });

  const startExamMutation = trpc.exams.start.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Digite um título para o simulado');
      return;
    }

    if (questionCount < 1 || questionCount > 100) {
      toast.error('Quantidade de questões deve estar entre 1 e 100');
      return;
    }

    await createExamMutation.mutateAsync({
      title: title.trim(),
      description: description.trim() || undefined,
      disciplinaId: disciplinaId || undefined,
      difficulty: difficulty as 'easy' | 'medium' | 'hard' | undefined,
      questionCount,
      timeLimit: timeLimit || undefined,
      isPublic,
    });
  };

  const isSubmitting = createExamMutation.isPending || startExamMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Criar Novo Simulado
        </CardTitle>
        <CardDescription>
          Configure os parâmetros do simulado e comece a resolver questões
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título do Simulado *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Simulado de Direito Constitucional"
              maxLength={200}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione uma descrição para o simulado..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Disciplina */}
            <div className="space-y-2">
              <Label htmlFor="disciplina">Disciplina</Label>
              <Select value={disciplinaId} onValueChange={setDisciplinaId} disabled={isSubmitting}>
                <SelectTrigger id="disciplina">
                  <SelectValue placeholder="Todas as disciplinas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as disciplinas</SelectItem>
                  {disciplinas?.items?.map((d: any) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dificuldade */}
            <div className="space-y-2">
              <Label htmlFor="difficulty">Dificuldade</Label>
              <Select value={difficulty} onValueChange={setDifficulty} disabled={isSubmitting}>
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Todas as dificuldades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as dificuldades</SelectItem>
                  <SelectItem value="easy">Fácil</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="hard">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quantidade de questões */}
            <div className="space-y-2">
              <Label htmlFor="questionCount">Quantidade de Questões *</Label>
              <Input
                id="questionCount"
                type="number"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value) || 0)}
                min={1}
                max={100}
                disabled={isSubmitting}
                required
              />
              <p className="text-xs text-muted-foreground">Mínimo: 1 | Máximo: 100</p>
            </div>

            {/* Tempo limite */}
            <div className="space-y-2">
              <Label htmlFor="timeLimit">Tempo Limite (minutos)</Label>
              <Input
                id="timeLimit"
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value) || 0)}
                min={1}
                max={300}
                disabled={isSubmitting}
                placeholder="Sem limite"
              />
              <p className="text-xs text-muted-foreground">Deixe vazio para sem limite</p>
            </div>
          </div>

          {/* Público */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="isPublic" className="text-base">
                Simulado Público
              </Label>
              <p className="text-sm text-muted-foreground">
                Permitir que outros usuários vejam e realizem este simulado
              </p>
            </div>
            <Switch
              id="isPublic"
              checked={isPublic}
              onCheckedChange={setIsPublic}
              disabled={isSubmitting}
            />
          </div>

          {/* Botão de submit */}
          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Criando simulado...' : 'Criar e Iniciar Simulado'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
