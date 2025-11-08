import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import {
  ArrowLeft,
  MessageCircle,
  Pin,
  Lock,
  ThumbsUp,
  MoreVertical,
  Edit,
  Trash,
  CheckCircle,
} from 'lucide-react';
import { Link, useParams } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Página de Visualização de Thread
 */
export default function ForumThread() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const utils = trpc.useUtils();

  // Buscar thread
  const { data: threadData, isLoading: loadingThread } = trpc.forumThreads.getById.useQuery(
    { id: id! },
    { enabled: !!id }
  );

  // Buscar mensagens
  const { data: messagesData, isLoading: loadingMessages } = trpc.forumMessages.list.useQuery(
    { threadId: id!, limit: 100 },
    { enabled: !!id }
  );

  // Registrar visualização
  const viewMutation = trpc.forumThreads.view.useMutation();

  // Criar mensagem
  const createMessageMutation = trpc.forumMessages.create.useMutation({
    onSuccess: () => {
      toast.success('Resposta publicada!');
      setReplyContent('');
      setReplyingTo(null);
      utils.forumMessages.list.invalidate({ threadId: id! });
      utils.forumThreads.getById.invalidate({ id: id! });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Upvote
  const upvoteMutation = trpc.forumMessages.upvote.useMutation({
    onSuccess: () => {
      utils.forumMessages.list.invalidate({ threadId: id! });
    },
  });

  // Registrar visualização ao carregar
  useState(() => {
    if (id) {
      viewMutation.mutate({ threadId: id });
    }
  });

  const handleReply = () => {
    if (!replyContent.trim()) {
      toast.error('Digite uma resposta');
      return;
    }

    createMessageMutation.mutate({
      threadId: id!,
      conteudo: replyContent,
      mensagemPaiId: replyingTo || undefined,
    });
  };

  const handleUpvote = (mensagemId: string) => {
    if (!isAuthenticated) {
      toast.error('Faça login para dar upvote');
      return;
    }

    upvoteMutation.mutate({ mensagemId });
  };

  if (loadingThread) {
    return (
      <div className="container py-8">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!threadData) {
    return (
      <div className="container py-8 text-center">
        <p className="text-gray-600">Thread não encontrado</p>
      </div>
    );
  }

  const { thread, categoria, autor } = threadData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container py-6">
          <Link href="/forum">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Fórum
            </Button>
          </Link>

          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {thread.isPinned && <Pin className="w-5 h-5 text-blue-600" />}
                {thread.isLocked && <Lock className="w-5 h-5 text-gray-600" />}
                <h1 className="text-2xl font-bold text-gray-900">{thread.titulo}</h1>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>Por {autor?.nome || 'Anônimo'}</span>
                <span>•</span>
                <Badge variant="secondary">{categoria?.nome}</Badge>
                <span>•</span>
                <span>{new Date(thread.criadoEm).toLocaleDateString('pt-BR')}</span>
                <span>•</span>
                <span>{thread.visualizacoes} visualizações</span>
              </div>
            </div>

            {user?.role === 'admin' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Pin className="w-4 h-4 mr-2" />
                    {thread.isPinned ? 'Desafixar' : 'Fixar'}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Lock className="w-4 h-4 mr-2" />
                    {thread.isLocked ? 'Desbloquear' : 'Bloquear'}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <Trash className="w-4 h-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Conteúdo Original */}
          <Card>
            <CardContent className="p-6">
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: thread.conteudo }} />

              {thread.tags && JSON.parse(thread.tags).length > 0 && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  {JSON.parse(thread.tags).map((tag: string) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mensagens */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {thread.totalMensagens} Respostas
            </h2>

            {loadingMessages ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : messagesData?.messages.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma resposta ainda.</p>
                  <p className="text-sm mt-1">Seja o primeiro a responder!</p>
                </CardContent>
              </Card>
            ) : (
              messagesData?.messages.map(({ message, autor, userUpvoted }) => (
                <Card
                  key={message.id}
                  className={message.nivelAninhamento > 0 ? `ml-${message.nivelAninhamento * 8}` : ''}
                >
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Upvote */}
                      <div className="flex flex-col items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={userUpvoted ? 'text-blue-600' : ''}
                          onClick={() => handleUpvote(message.id)}
                          disabled={!isAuthenticated}
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </Button>
                        <span className="text-sm font-semibold">{message.upvotes}</span>
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900">
                            {autor?.nome || 'Anônimo'}
                          </span>
                          {message.isRespostaOficial && (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Resposta Oficial
                            </Badge>
                          )}
                          <span className="text-sm text-gray-500">
                            {new Date(message.criadoEm).toLocaleDateString('pt-BR')}
                          </span>
                        </div>

                        <div
                          className="prose max-w-none text-gray-700"
                          dangerouslySetInnerHTML={{ __html: message.conteudo }}
                        />

                        <div className="flex items-center gap-3 mt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReplyingTo(message.id)}
                            disabled={thread.isLocked || !isAuthenticated}
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Responder
                          </Button>

                          {user?.id === message.autorId && (
                            <>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4 mr-1" />
                                Editar
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600">
                                <Trash className="w-4 h-4 mr-1" />
                                Excluir
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Editor de Resposta */}
          {isAuthenticated && !thread.isLocked && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {replyingTo ? 'Responder comentário' : 'Sua Resposta'}
                </h3>

                <Textarea
                  placeholder="Digite sua resposta..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={6}
                  className="mb-3"
                />

                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleReply}
                    disabled={createMessageMutation.isPending || !replyContent.trim()}
                  >
                    {createMessageMutation.isPending ? 'Publicando...' : 'Publicar Resposta'}
                  </Button>

                  {replyingTo && (
                    <Button variant="ghost" onClick={() => setReplyingTo(null)}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {!isAuthenticated && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-600 mb-4">Faça login para participar da discussão</p>
                <Link href="/login">
                  <Button>Entrar</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {thread.isLocked && (
            <Card>
              <CardContent className="p-6 text-center">
                <Lock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600">Esta discussão foi bloqueada por um moderador</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
