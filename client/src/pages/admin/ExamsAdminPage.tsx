import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Edit, Trash2, Eye, Copy, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

/**
 * Página de Gerenciamento de Simulados (Admin)
 * 
 * Permite:
 * - Criar novos simulados
 * - Editar simulados existentes
 * - Configurar questões
 * - Definir tempo e regras
 * - Publicar/despublicar
 */
export default function ExamsAdminPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questionsCount, setQuestionsCount] = useState(20);
  const [timeLimit, setTimeLimit] = useState(60);
  const [passingScore, setPassingScore] = useState(70);
  const [disciplinaId, setDisciplinaId] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | ''>('');

  // Queries
  const disciplinasQuery = trpc.disciplinas.getAll.useQuery();
  
  // Mutation
  const createExamMutation = trpc.exams.create.useMutation({
    onSuccess: () => {
      toast.success('Simulado criado com sucesso!');
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro ao criar simulado: ${error.message}`);
    },
  });

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setQuestionsCount(20);
    setTimeLimit(60);
    setPassingScore(70);
    setDisciplinaId('');
    setDifficulty('');
  };

  const handleCreateExam = () => {
    if (!title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }
    if (questionsCount < 1) {
      toast.error('Quantidade de questões deve ser maior que 0');
      return;
    }

    createExamMutation.mutate({
      title,
      description: description || undefined,
      questionsCount,
      timeLimit: timeLimit || undefined,
      passingScore: passingScore || undefined,
      disciplinaId: disciplinaId || undefined,
      difficulty: difficulty || undefined,
    });
  };

  return (
    <AdminLayout
      title="Gerenciar Simulados"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Simulados' },
      ]}
      actions={
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Simulado
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Simulado</DialogTitle>
              <DialogDescription>
                Configure as informações básicas do simulado. As questões serão selecionadas automaticamente com base nos filtros.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="exam-title">Título do Simulado *</Label>
                <Input
                  id="exam-title"
                  placeholder="Ex: Simulado EARA - Módulo 1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="exam-description">Descrição</Label>
                <Textarea
                  id="exam-description"
                  placeholder="Descreva o conteúdo e objetivos do simulado"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="exam-questions">Quantidade de Questões *</Label>
                  <Input
                    id="exam-questions"
                    type="number"
                    min="1"
                    placeholder="20"
                    value={questionsCount}
                    onChange={(e) => setQuestionsCount(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exam-time">Tempo Limite (minutos)</Label>
                  <Input
                    id="exam-time"
                    type="number"
                    min="0"
                    placeholder="60"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="exam-passing-score">Nota Mínima para Aprovação (%)</Label>
                <Input
                  id="exam-passing-score"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="70"
                  value={passingScore}
                  onChange={(e) => setPassingScore(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exam-disciplina">Filtrar por Disciplina (opcional)</Label>
                <Select value={disciplinaId} onValueChange={setDisciplinaId}>
                  <SelectTrigger id="exam-disciplina">
                    <SelectValue placeholder="Todas as disciplinas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as disciplinas</SelectItem>
                    {disciplinasQuery.data?.map((d: any) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="exam-difficulty">Filtrar por Dificuldade (opcional)</Label>
                <Select value={difficulty} onValueChange={(v: any) => setDifficulty(v)}>
                  <SelectTrigger id="exam-difficulty">
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

              <div className="flex justify-end gap-4 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={createExamMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreateExam}
                  disabled={createExamMutation.isPending}
                >
                  {createExamMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Criar Simulado
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="space-y-6">
        {/* Mensagem informativa */}
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Como funciona:</strong> Ao criar um simulado, o sistema seleciona automaticamente questões aleatórias do banco de dados com base nos filtros escolhidos (disciplina, dificuldade). As questões são embaralhadas e vinculadas ao simulado.
            </p>
          </CardContent>
        </Card>

        {/* Placeholder para lista de simulados */}
        <Card>
          <CardHeader>
            <CardTitle>Simulados Criados</CardTitle>
            <CardDescription>
              A listagem de simulados será implementada em breve. Por enquanto, você pode criar novos simulados usando o botão acima.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhum simulado encontrado.</p>
              <p className="text-sm mt-2">Clique em "Novo Simulado" para criar o primeiro.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
