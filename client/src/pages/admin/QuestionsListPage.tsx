import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';
import { Plus, Search, Filter, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Página de Listagem de Questões (Admin)
 * - Listagem com paginação
 * - Filtros: disciplina, assunto, tópico, dificuldade, banca
 * - Busca por texto
 * - Ações: visualizar, editar, excluir
 */
export default function QuestionsListPage() {
  const [, setLocation] = useLocation();
  
  // Filtros
  const [disciplinaId, setDisciplinaId] = useState<string>('all');
  const [assuntoId, setAssuntoId] = useState<string>('all');
  const [topicoId, setTopicoId] = useState<string>('all');
  const [difficulty, setDifficulty] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Buscar dados da árvore
  const { data: disciplinas } = trpc.disciplinas.getAll.useQuery();
  const { data: assuntos } = trpc.assuntos.getAll.useQuery();
  const { data: topicos } = trpc.topicos.getAll.useQuery();

  // Buscar questões
  const { data: questionsData, isLoading } = trpc.questions.list.useQuery({
    page,
    limit: 20,
    disciplinaId: disciplinaId === 'all' ? undefined : disciplinaId,
    assuntoId: assuntoId === 'all' ? undefined : assuntoId,
    topicoId: topicoId === 'all' ? undefined : topicoId,
    difficulty: difficulty === 'all' ? undefined : (difficulty as any),
    search: search || undefined,
  });

  const handleClearFilters = () => {
    setDisciplinaId('');
    setAssuntoId('');
    setTopicoId('');
    setDifficulty('');
    setSearch('');
    setPage(1);
  };

  const getDifficultyBadge = (diff: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      easy: { variant: 'default', label: 'Fácil' },
      medium: { variant: 'secondary', label: 'Média' },
      hard: { variant: 'destructive', label: 'Difícil' },
    };
    const config = variants[diff] || variants.medium;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <AdminLayout
      title="Questões"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Questões' },
      ]}
      actions={
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setLocation('/admin/questoes/importar')}>
            <FileText className="mr-2 h-4 w-4" />
            Importar Lote
          </Button>
          <Button onClick={() => setLocation('/admin/questoes/nova')}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Questão
          </Button>
        </div>
      }
    >
      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Filtros</CardTitle>
              <CardDescription>Refine a busca de questões</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              Limpar Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Busca por texto */}
            <div className="lg:col-span-2">
              <label className="text-sm font-medium mb-2 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar no enunciado..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Disciplina */}
            <div>
              <label className="text-sm font-medium mb-2 block">Disciplina</label>
              <Select value={disciplinaId} onValueChange={setDisciplinaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {disciplinas?.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assunto */}
            <div>
              <label className="text-sm font-medium mb-2 block">Assunto</label>
              <Select value={assuntoId} onValueChange={setAssuntoId} disabled={!disciplinaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {assuntos
                    ?.filter((a) => !disciplinaId || a.disciplinaId === disciplinaId)
                    .map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tópico */}
            <div>
              <label className="text-sm font-medium mb-2 block">Tópico</label>
              <Select value={topicoId} onValueChange={setTopicoId} disabled={!assuntoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {topicos
                    ?.filter((t) => !assuntoId || t.assuntoId === assuntoId)
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dificuldade */}
            <div>
              <label className="text-sm font-medium mb-2 block">Dificuldade</label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="easy">Fácil</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="hard">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Listagem */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Questões Cadastradas</CardTitle>
              <CardDescription>
                {questionsData?.total || 0} questões encontradas
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Carregando questões...</span>
            </div>
          ) : questionsData && questionsData.items.length > 0 ? (
            <div className="space-y-4">
              {questionsData.items.map((question) => (
                <Card key={question.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{question.uniqueCode}</Badge>
                          {getDifficultyBadge(question.difficulty)}
                          <Badge variant="secondary">
                            {question.questionType === 'multiple_choice' ? 'Múltipla Escolha' : 'V/F'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                          {question.statementText}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {question.examBoard && (
                            <span>Banca: {question.examBoard}</span>
                          )}
                          {question.examYear && (
                            <span>Ano: {question.examYear}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toast.info('Visualização em desenvolvimento')}
                        >
                          Visualizar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toast.info('Edição em desenvolvimento')}
                        >
                          Editar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Paginação */}
              {questionsData.total > 20 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {page} de {Math.ceil(questionsData.total / 20)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= Math.ceil(questionsData.total / 20)}
                    onClick={() => setPage(page + 1)}
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhuma questão encontrada com os filtros selecionados
              </p>
              <Button variant="link" onClick={handleClearFilters} className="mt-2">
                Limpar filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
