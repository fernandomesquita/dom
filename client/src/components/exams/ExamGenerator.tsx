/**
 * ExamGenerator - Gerador de simulados com filtros (versão simplificada)
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useLocation } from 'wouter';

export function ExamGenerator() {
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState('');
  const [questionCount, setQuestionCount] = useState(20);

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
      questionCount,
      isPublic: false,
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
