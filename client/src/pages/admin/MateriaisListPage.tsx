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
import { Plus, Search, FileText, Loader2, ExternalLink, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Página de Listagem de Materiais (Admin)
 * - Listagem com paginação
 * - Filtros: disciplina, assunto, tópico, tipo
 * - Busca por texto
 * - Ações: visualizar, editar, excluir
 */
export default function MateriaisListPage() {
  const [, setLocation] = useLocation();
  
  // Filtros
  const [disciplinaId, setDisciplinaId] = useState<string>('');
  const [assuntoId, setAssuntoId] = useState<string>('');
  const [topicoId, setTopicoId] = useState<string>('');
  const [tipo, setTipo] = useState<string>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Buscar dados da árvore
  const { data: disciplinas } = trpc.disciplinas.getAll.useQuery();
  const { data: assuntos } = trpc.assuntos.getAll.useQuery();
  const { data: topicos } = trpc.topicos.getAll.useQuery();

  // Buscar materiais
  const { data: materiaisData, isLoading } = trpc.materiais.list.useQuery({
    page,
    limit: 20,
    disciplinaId: disciplinaId || undefined,
    assuntoId: assuntoId || undefined,
    topicoId: topicoId || undefined,
    tipo: tipo || undefined,
    search: search || undefined,
  });

  const handleClearFilters = () => {
    setDisciplinaId('');
    setAssuntoId('');
    setTopicoId('');
    setTipo('');
    setSearch('');
    setPage(1);
  };

  const getTipoBadge = (materialTipo: string) => {
    const tipos: Record<string, { variant: any; label: string; icon: string }> = {
      pdf: { variant: 'default', label: 'PDF', icon: '📄' },
      video: { variant: 'secondary', label: 'Vídeo', icon: '🎥' },
      link: { variant: 'outline', label: 'Link', icon: '🔗' },
      texto: { variant: 'default', label: 'Texto', icon: '📝' },
    };
    const config = tipos[materialTipo] || tipos.texto;
    return (
      <Badge variant={config.variant}>
        {config.icon} {config.label}
      </Badge>
    );
  };

  return (
    <AdminLayout
      title="Materiais"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Materiais' },
      ]}
      actions={
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setLocation('/admin/materiais/estatisticas')}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Estatísticas
          </Button>
          <Button onClick={() => setLocation('/admin/materiais/novo')}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Material
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
              <CardDescription>Refine a busca de materiais</CardDescription>
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
                  placeholder="Buscar no título ou descrição..."
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

            {/* Tipo */}
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo</label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="video">Vídeo</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                  <SelectItem value="texto">Texto</SelectItem>
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
              <CardTitle>Materiais Cadastrados</CardTitle>
              <CardDescription>
                {materiaisData?.total || 0} materiais encontrados
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Carregando materiais...</span>
            </div>
          ) : materiaisData && materiaisData.items.length > 0 ? (
            <div className="space-y-4">
              {materiaisData.items.map((material: any) => (
                <Card key={material.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getTipoBadge(material.tipo)}
                          {material.ativo ? (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Ativo
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-400 border-gray-400">
                              Inativo
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg mb-1">{material.title}</h3>
                        {material.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {material.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {material.disciplinaNome && (
                            <span>📚 {material.disciplinaNome}</span>
                          )}
                          {material.assuntoNome && (
                            <span>→ {material.assuntoNome}</span>
                          )}
                          {material.topicoNome && (
                            <span>→ {material.topicoNome}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {material.url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(material.url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation(`/admin/materiais/${material.id}/editar`)}
                        >
                          Editar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Paginação */}
              {materiaisData.total > 20 && (
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
                    Página {page} de {Math.ceil(materiaisData.total / 20)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= Math.ceil(materiaisData.total / 20)}
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
                Nenhum material encontrado com os filtros selecionados
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
