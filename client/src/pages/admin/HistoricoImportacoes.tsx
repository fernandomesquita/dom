import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { History, Undo2, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Página de Histórico de Importações da Taxonomia
 * Lista todas as importações com status, datas e botão individual de desfazer
 */
export default function HistoricoImportacoes() {
  const utils = trpc.useUtils();

  // Query para listar importações
  const { data: imports, isLoading } = trpc.taxonomiaImport.listImports.useQuery();

  // Mutation para desfazer importação específica
  const undoMutation = trpc.taxonomiaImport.undoLastImport.useMutation({
    onSuccess: (data) => {
      toast.success(`Importação desfeita! ${data.resumo.disciplinas} disciplinas, ${data.resumo.assuntos} assuntos, ${data.resumo.topicos} tópicos marcados como inativos`);
      utils.taxonomiaImport.listImports.invalidate();
      utils.disciplinas.getAll.invalidate();
      utils.assuntos.getAll.invalidate();
      utils.topicos.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleUndo = (importId: string, batchId: string) => {
    if (confirm('⚠️ Tem certeza que deseja desfazer esta importação? Todos os registros importados serão marcados como inativos.')) {
      undoMutation.mutate();
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'ATIVO') {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Ativo
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-800">
        <XCircle className="h-3 w-3 mr-1" />
        Desfeito
      </Badge>
    );
  };

  return (
    <AdminLayout
      title="Histórico de Importações"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Árvore do Conhecimento', href: '/admin/arvore' },
        { label: 'Histórico' },
      ]}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Todas as Importações
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando histórico...
            </div>
          ) : !imports || imports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma importação encontrada
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Batch ID</TableHead>
                  <TableHead className="text-center">Disciplinas</TableHead>
                  <TableHead className="text-center">Assuntos</TableHead>
                  <TableHead className="text-center">Tópicos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {imports.map((imp: any) => (
                  <TableRow key={imp.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {new Date(imp.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(imp.createdAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {imp.batchId.substring(0, 8)}...
                      </code>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {imp.totalDisciplinas}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {imp.totalAssuntos}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {imp.totalTopicos}
                    </TableCell>
                    <TableCell>{getStatusBadge(imp.status)}</TableCell>
                    <TableCell className="text-right">
                      {imp.status === 'ATIVO' ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleUndo(imp.id, imp.batchId)}
                          disabled={undoMutation.isPending}
                        >
                          <Undo2 className="h-4 w-4 mr-1" />
                          Desfazer
                        </Button>
                      ) : (
                        <div className="text-xs text-muted-foreground">
                          Desfeito em{' '}
                          {imp.undoneAt
                            ? new Date(imp.undoneAt).toLocaleDateString('pt-BR')
                            : '-'}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
