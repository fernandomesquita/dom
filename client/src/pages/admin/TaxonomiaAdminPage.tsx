import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { TaxonomiaImportDialog } from '@/components/admin/TaxonomiaImportDialog';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical, 
  BookOpen, 
  FolderTree, 
  FileText, 
  Download, 
  Upload,
  History,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Link } from 'wouter';

/**
 * Página de Gestão da Árvore do Conhecimento (Taxonomia)
 * 
 * Gerencia a hierarquia completa:
 * - Disciplinas (nível 1)
 * - Assuntos (nível 2)
 * - Tópicos (nível 3)
 */
export default function TaxonomiaAdminPage() {
  const [activeTab, setActiveTab] = useState('disciplinas');
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const utils = trpc.useUtils();

  // Mutation para gerar template
  const generateTemplateMutation = trpc.taxonomiaImport.generateTemplate.useMutation({
    onSuccess: (data) => {
      // Converter base64 para blob e fazer download
      const byteCharacters = atob(data.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: data.mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Template baixado com sucesso!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Mutation para preview
  const previewMutation = trpc.taxonomiaImport.previewImport.useMutation({
    onSuccess: (data) => {
      setPreviewData(data);
      toast.success('Preview gerado com sucesso!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Mutation para importar
  const importMutation = trpc.taxonomiaImport.importBatch.useMutation({
    onSuccess: (data) => {
      toast.success(`Importação concluída! ${data.resumo.disciplinas} disciplinas, ${data.resumo.assuntos} assuntos, ${data.resumo.topicos} tópicos`);
      setIsImportDialogOpen(false);
      setPreviewData(null);
      setUploadedFile(null);
      utils.disciplinas.getAll.invalidate();
      utils.assuntos.getAll.invalidate();
      utils.topicos.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Mutation para desfazer
  const undoMutation = trpc.taxonomiaImport.undoLastImport.useMutation({
    onSuccess: (data) => {
      toast.success(`Importação desfeita! ${data.resumo.disciplinas} disciplinas, ${data.resumo.assuntos} assuntos, ${data.resumo.topicos} tópicos marcados como inativos`);
      utils.disciplinas.getAll.invalidate();
      utils.assuntos.getAll.invalidate();
      utils.topicos.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDownloadTemplate = () => {
    generateTemplateMutation.mutate();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);

    // Ler arquivo e converter para base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);
      previewMutation.mutate({ base64Data: base64 });
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConfirmImport = () => {
    if (!uploadedFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);
      importMutation.mutate({ base64Data: base64 });
    };
    reader.readAsArrayBuffer(uploadedFile);
  };

  return (
    <AdminLayout
      title="Árvore do Conhecimento"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Taxonomia' },
      ]}
    >
      {/* Botões de ação */}
      <div className="flex gap-2 mb-4">
        <Button
          variant="outline"
          onClick={handleDownloadTemplate}
          disabled={generateTemplateMutation.isPending}
        >
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>
        <Button
          onClick={() => setIsImportDialogOpen(true)}
        >
          <Upload className="h-4 w-4 mr-2" />
          Importar Excel
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            if (confirm('⚠️ Tem certeza que deseja desfazer a última importação? Todos os registros importados serão marcados como inativos.')) {
              undoMutation.mutate();
            }
          }}
          disabled={undoMutation.isPending}
        >
          {undoMutation.isPending ? 'Desfazendo...' : 'Desfazer Última Importação'}
        </Button>
        <Link href="/admin/arvore/historico">
          <Button variant="outline">
            <History className="h-4 w-4 mr-2" />
            Ver Histórico
          </Button>
        </Link>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="disciplinas" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Disciplinas
          </TabsTrigger>
          <TabsTrigger value="assuntos" className="flex items-center gap-2">
            <FolderTree className="h-4 w-4" />
            Assuntos
          </TabsTrigger>
          <TabsTrigger value="topicos" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Tópicos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="disciplinas">
          <DisciplinasTab />
        </TabsContent>

        <TabsContent value="assuntos">
          <AssuntosTab />
        </TabsContent>

        <TabsContent value="topicos">
          <TopicosTab />
        </TabsContent>
      </Tabs>

      {/* Dialog de importação */}
      <TaxonomiaImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        previewData={previewData}
        onFileUpload={handleFileUpload}
        onConfirmImport={handleConfirmImport}
        isPreviewLoading={previewMutation.isPending}
        isImportLoading={importMutation.isPending}
      />
    </AdminLayout>
  );
}

// ============================================================================
// TAB DE DISCIPLINAS
// ============================================================================

function DisciplinasTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    descricao: '',
    corHex: '#4F46E5',
    icone: '',
  });

  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.disciplinas.getAll.useQuery({ 
    limit: 100, 
    includeInactive: true 
  });

  const createMutation = trpc.disciplinas.create.useMutation({
    onSuccess: () => {
      toast.success('Disciplina criada com sucesso!');
      utils.disciplinas.getAll.invalidate();
      closeDialog();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.disciplinas.update.useMutation({
    onSuccess: () => {
      toast.success('Disciplina atualizada com sucesso!');
      utils.disciplinas.getAll.invalidate();
      closeDialog();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.disciplinas.delete.useMutation({
    onSuccess: () => {
      toast.success('Disciplina deletada com sucesso!');
      utils.disciplinas.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const toggleActiveMutation = trpc.disciplinas.update.useMutation({
    onSuccess: () => {
      toast.success('Status atualizado!');
      utils.disciplinas.getAll.invalidate();
    },
  });

  const openDialog = (disciplina?: any) => {
    if (disciplina) {
      setEditingId(disciplina.id);
      setFormData({
        codigo: disciplina.codigo,
        nome: disciplina.nome,
        descricao: disciplina.descricao || '',
        corHex: disciplina.corHex,
        icone: disciplina.icone || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        codigo: '',
        nome: '',
        descricao: '',
        corHex: '#4F46E5',
        icone: '',
      });
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja deletar esta disciplina? Isso também deletará todos os assuntos e tópicos relacionados.')) {
      deleteMutation.mutate({ id });
    }
  };

  const handleToggleActive = (id: string, currentStatus: boolean) => {
    toggleActiveMutation.mutate({ 
      id, 
      ativo: !currentStatus 
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Disciplinas</CardTitle>
            <CardDescription>
              Gerenciar disciplinas (nível 1 da árvore)
            </CardDescription>
          </div>
          <Button onClick={() => openDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Disciplina
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center py-8 text-muted-foreground">Carregando...</p>
        ) : data?.items && data.items.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Cor</TableHead>
                <TableHead>Ícone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((disciplina: any) => (
                <TableRow key={disciplina.id}>
                  <TableCell>
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{disciplina.codigo}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{disciplina.nome}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded border" 
                        style={{ backgroundColor: disciplina.corHex }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {disciplina.corHex}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {disciplina.icone || '-'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(disciplina.id, disciplina.ativo)}
                    >
                      {disciplina.ativo ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDialog(disciplina)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(disciplina.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center py-8 text-muted-foreground">
            Nenhuma disciplina cadastrada
          </p>
        )}
      </CardContent>

      {/* Dialog de Criar/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Disciplina' : 'Nova Disciplina'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados da disciplina
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="codigo">Código *</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                placeholder="Ex: DIR"
                maxLength={20}
              />
            </div>

            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Direito Constitucional"
                maxLength={100}
              />
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descrição opcional"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="corHex">Cor (Hex)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="corHex"
                  type="color"
                  value={formData.corHex}
                  onChange={(e) => setFormData({ ...formData, corHex: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  value={formData.corHex}
                  onChange={(e) => setFormData({ ...formData, corHex: e.target.value })}
                  placeholder="#4F46E5"
                  maxLength={7}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="icone">Ícone (opcional)</Label>
              <Input
                id="icone"
                value={formData.icone}
                onChange={(e) => setFormData({ ...formData, icone: e.target.value })}
                placeholder="Ex: book"
                maxLength={50}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.codigo || !formData.nome || createMutation.isPending || updateMutation.isPending}
            >
              {editingId ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ============================================================================
// TAB DE ASSUNTOS
// ============================================================================

function AssuntosTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    disciplinaId: '',
    codigo: '',
    nome: '',
    descricao: '',
  });

  const utils = trpc.useUtils();
  const { data: disciplinas } = trpc.disciplinas.getAll.useQuery({ limit: 100 });
  const { data, isLoading } = trpc.assuntos.getAll.useQuery({ 
    limit: 100, 
    includeInactive: true 
  });

  const createMutation = trpc.assuntos.create.useMutation({
    onSuccess: () => {
      toast.success('Assunto criado com sucesso!');
      utils.assuntos.getAll.invalidate();
      closeDialog();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.assuntos.update.useMutation({
    onSuccess: () => {
      toast.success('Assunto atualizado com sucesso!');
      utils.assuntos.getAll.invalidate();
      closeDialog();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.assuntos.delete.useMutation({
    onSuccess: () => {
      toast.success('Assunto deletado com sucesso!');
      utils.assuntos.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const openDialog = (assunto?: any) => {
    if (assunto) {
      setEditingId(assunto.id);
      setFormData({
        disciplinaId: assunto.disciplinaId,
        codigo: assunto.codigo,
        nome: assunto.nome,
        descricao: assunto.descricao || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        disciplinaId: '',
        codigo: '',
        nome: '',
        descricao: '',
      });
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja deletar este assunto? Isso também deletará todos os tópicos relacionados.')) {
      deleteMutation.mutate({ id });
    }
  };

  const getDisciplinaNome = (disciplinaId: string) => {
    const disciplina = disciplinas?.items?.find((d: any) => d.id === disciplinaId);
    return disciplina?.nome || '-';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Assuntos</CardTitle>
            <CardDescription>
              Gerenciar assuntos (nível 2 da árvore)
            </CardDescription>
          </div>
          <Button onClick={() => openDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Assunto
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center py-8 text-muted-foreground">Carregando...</p>
        ) : data?.items && data.items.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Disciplina</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((assunto: any) => (
                <TableRow key={assunto.id}>
                  <TableCell>
                    <Badge>{getDisciplinaNome(assunto.disciplinaId)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{assunto.codigo}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{assunto.nome}</TableCell>
                  <TableCell>
                    {assunto.ativo ? (
                      <Badge variant="default">Ativo</Badge>
                    ) : (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDialog(assunto)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(assunto.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center py-8 text-muted-foreground">
            Nenhum assunto cadastrado
          </p>
        )}
      </CardContent>

      {/* Dialog de Criar/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Assunto' : 'Novo Assunto'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do assunto
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="disciplinaId">Disciplina *</Label>
              <select
                id="disciplinaId"
                value={formData.disciplinaId}
                onChange={(e) => setFormData({ ...formData, disciplinaId: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecione uma disciplina</option>
                {disciplinas?.items?.map((d: any) => (
                  <option key={d.id} value={d.id}>
                    {d.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="codigo">Código *</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                placeholder="Ex: DIR-01"
                maxLength={20}
              />
            </div>

            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Princípios Fundamentais"
                maxLength={100}
              />
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descrição opcional"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.disciplinaId || !formData.codigo || !formData.nome || createMutation.isPending || updateMutation.isPending}
            >
              {editingId ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ============================================================================
// TAB DE TÓPICOS
// ============================================================================

function TopicosTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedDisciplinaId, setSelectedDisciplinaId] = useState('');
  const [formData, setFormData] = useState({
    assuntoId: '',
    codigo: '',
    nome: '',
    descricao: '',
  });

  const utils = trpc.useUtils();
  const { data: disciplinas } = trpc.disciplinas.getAll.useQuery({ limit: 100 });
  const { data: assuntos } = trpc.assuntos.getAll.useQuery({ limit: 500 });
  const { data, isLoading } = trpc.topicos.getAll.useQuery({ 
    limit: 500, 
    includeInactive: true 
  });

  const createMutation = trpc.topicos.create.useMutation({
    onSuccess: () => {
      toast.success('Tópico criado com sucesso!');
      utils.topicos.getAll.invalidate();
      closeDialog();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.topicos.update.useMutation({
    onSuccess: () => {
      toast.success('Tópico atualizado com sucesso!');
      utils.topicos.getAll.invalidate();
      closeDialog();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.topicos.delete.useMutation({
    onSuccess: () => {
      toast.success('Tópico deletado com sucesso!');
      utils.topicos.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const openDialog = (topico?: any) => {
    if (topico) {
      setEditingId(topico.id);
      const assunto = assuntos?.items?.find((a: any) => a.id === topico.assuntoId);
      setSelectedDisciplinaId(assunto?.disciplinaId || '');
      setFormData({
        assuntoId: topico.assuntoId,
        codigo: topico.codigo,
        nome: topico.nome,
        descricao: topico.descricao || '',
      });
    } else {
      setEditingId(null);
      setSelectedDisciplinaId('');
      setFormData({
        assuntoId: '',
        codigo: '',
        nome: '',
        descricao: '',
      });
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja deletar este tópico?')) {
      deleteMutation.mutate({ id });
    }
  };

  const getAssuntoNome = (assuntoId: string) => {
    const assunto = assuntos?.items?.find((a: any) => a.id === assuntoId);
    return assunto?.nome || '-';
  };

  const getDisciplinaNome = (assuntoId: string) => {
    const assunto = assuntos?.items?.find((a: any) => a.id === assuntoId);
    const disciplina = disciplinas?.items?.find((d: any) => d.id === assunto?.disciplinaId);
    return disciplina?.nome || '-';
  };

  const filteredAssuntos = assuntos?.items?.filter((a: any) => 
    !selectedDisciplinaId || a.disciplinaId === selectedDisciplinaId
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tópicos</CardTitle>
            <CardDescription>
              Gerenciar tópicos (nível 3 da árvore)
            </CardDescription>
          </div>
          <Button onClick={() => openDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Tópico
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center py-8 text-muted-foreground">Carregando...</p>
        ) : data?.items && data.items.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Disciplina</TableHead>
                <TableHead>Assunto</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((topico: any) => (
                <TableRow key={topico.id}>
                  <TableCell>
                    <Badge variant="secondary">{getDisciplinaNome(topico.assuntoId)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge>{getAssuntoNome(topico.assuntoId)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{topico.codigo}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{topico.nome}</TableCell>
                  <TableCell>
                    {topico.ativo ? (
                      <Badge variant="default">Ativo</Badge>
                    ) : (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDialog(topico)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(topico.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center py-8 text-muted-foreground">
            Nenhum tópico cadastrado
          </p>
        )}
      </CardContent>

      {/* Dialog de Criar/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Tópico' : 'Novo Tópico'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do tópico
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="disciplina-select">Disciplina *</Label>
              <select
                id="disciplina-select"
                value={selectedDisciplinaId}
                onChange={(e) => {
                  setSelectedDisciplinaId(e.target.value);
                  setFormData({ ...formData, assuntoId: '' });
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecione uma disciplina</option>
                {disciplinas?.items?.map((d: any) => (
                  <option key={d.id} value={d.id}>
                    {d.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="assuntoId">Assunto *</Label>
              <select
                id="assuntoId"
                value={formData.assuntoId}
                onChange={(e) => setFormData({ ...formData, assuntoId: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={!selectedDisciplinaId}
              >
                <option value="">Selecione um assunto</option>
                {filteredAssuntos?.map((a: any) => (
                  <option key={a.id} value={a.id}>
                    {a.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="codigo">Código *</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                placeholder="Ex: DIR-01-01"
                maxLength={20}
              />
            </div>

            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Fundamentos da República"
                maxLength={100}
              />
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descrição opcional"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.assuntoId || !formData.codigo || !formData.nome || createMutation.isPending || updateMutation.isPending}
            >
              {editingId ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
