import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

/**
 * Página de Moderação do Fórum
 * Gerenciar conteúdo pendente de aprovação
 */
export default function ForumModeration() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const utils = trpc.useUtils();

  // Verificar permissão
  if (user?.role !== 'admin') {
    setLocation('/forum');
    return null;
  }

  // Buscar itens pendentes
  const { data: pendingData, isLoading } = trpc.forumModeration.getPending.useQuery({
    tipo: 'todos',
    limit: 50,
  });

  // Aprovar
  const approveMutation = trpc.forumModeration.approve.useMutation({
    onSuccess: () => {
      toast.success('Conteúdo aprovado!');
      utils.forumModeration.getPending.invalidate();
      utils.forumModeration.getStats.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Rejeitar
  const rejectMutation = trpc.forumModeration.reject.useMutation({
    onSuccess: () => {
      toast.success('Conteúdo rejeitado!');
      setRejectDialogOpen(false);
      setSelectedItem(null);
      setRejectReason('');
      utils.forumModeration.getPending.invalidate();
      utils.forumModeration.getStats.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleApprove = (itemId: string) => {
    approveMutation.mutate({ itemId });
  };

  const handleRejectClick = (itemId: string) => {
    setSelectedItem(itemId);
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (!selectedItem) return;

    if (!rejectReason.trim()) {
      toast.error('Digite o motivo da rejeição');
      return;
    }

    if (rejectReason.length < 10) {
      toast.error('Motivo deve ter pelo menos 10 caracteres');
      return;
    }

    rejectMutation.mutate({
      itemId: selectedItem,
      motivo: rejectReason,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container py-6">
          <Link href="/admin/forum/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>

          <h1 className="text-2xl font-bold text-gray-900">Fila de Moderação</h1>
          <p className="text-gray-600 mt-1">
            Conteúdo aguardando aprovação ({pendingData?.total || 0} itens)
          </p>
        </div>
      </div>

      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : pendingData?.items.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nenhum item pendente!
                </h3>
                <p className="text-gray-600">
                  Todos os conteúdos foram moderados
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingData?.items.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">
                            {item.tipo === 'thread' ? 'Discussão' : 'Mensagem'}
                          </Badge>
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Pendente
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">
                          {item.tipo === 'thread' ? 'Nova Discussão' : 'Nova Mensagem'}
                        </CardTitle>
                        <CardDescription>
                          {new Date(item.criadoEm).toLocaleString('pt-BR')}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Conteúdo */}
                    <div
                      className="prose max-w-none mb-4 p-4 bg-gray-50 rounded-lg"
                      dangerouslySetInnerHTML={{ __html: item.conteudo }}
                    />

                    {/* Motivo da Moderação */}
                    {item.motivo && (
                      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm font-semibold text-yellow-900 mb-1">
                          Motivo da Moderação:
                        </p>
                        <p className="text-sm text-yellow-800">{item.motivo}</p>
                      </div>
                    )}

                    {/* Ações */}
                    <div className="flex items-center gap-3">
                      <Button
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(item.id)}
                        disabled={approveMutation.isPending}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Aprovar
                      </Button>

                      <Button
                        variant="destructive"
                        onClick={() => handleRejectClick(item.id)}
                        disabled={rejectMutation.isPending}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Rejeitar
                      </Button>

                      {item.threadId && (
                        <Link href={`/forum/thread/${item.threadId}`}>
                          <Button variant="outline">Ver Contexto</Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dialog de Rejeição */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Conteúdo</DialogTitle>
            <DialogDescription>
              Digite o motivo da rejeição. O usuário será notificado.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            placeholder="Ex: Conteúdo contém links não permitidos..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={rejectMutation.isPending || !rejectReason.trim()}
            >
              {rejectMutation.isPending ? 'Rejeitando...' : 'Confirmar Rejeição'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
