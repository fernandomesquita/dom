/**
 * CommentSection - Seção completa de comentários de uma questão
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageSquare, ArrowUpDown } from 'lucide-react';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';
import { toast } from 'sonner';

interface CommentSectionProps {
  questionId: number;
  currentUserId?: string;
}

type SortBy = 'newest' | 'oldest' | 'most_liked';

export function CommentSection({ questionId, currentUserId }: CommentSectionProps) {
  const [sortBy, setSortBy] = useState<SortBy>('most_liked');
  const utils = trpc.useUtils();

  // Queries
  const { data: comments, isLoading } = trpc.comments.list.useQuery({
    questionId,
    sortBy,
  });

  // Mutations
  const createMutation = trpc.comments.create.useMutation({
    onSuccess: () => {
      utils.comments.list.invalidate({ questionId });
      toast.success('Comentário publicado!');
    },
    onError: () => {
      toast.error('Erro ao publicar comentário');
    },
  });

  const updateMutation = trpc.comments.update.useMutation({
    onSuccess: () => {
      utils.comments.list.invalidate({ questionId });
      toast.success('Comentário atualizado!');
    },
    onError: () => {
      toast.error('Erro ao atualizar comentário');
    },
  });

  const deleteMutation = trpc.comments.delete.useMutation({
    onSuccess: () => {
      utils.comments.list.invalidate({ questionId });
      toast.success('Comentário deletado!');
    },
    onError: () => {
      toast.error('Erro ao deletar comentário');
    },
  });

  const toggleLikeMutation = trpc.comments.toggleLike.useMutation({
    onMutate: async ({ commentId }) => {
      // Cancelar queries em andamento
      await utils.comments.list.cancel({ questionId });

      // Snapshot do estado anterior
      const previousComments = utils.comments.list.getData({ questionId, sortBy });

      // Atualização otimista
      if (previousComments) {
        utils.comments.list.setData({ questionId, sortBy }, (old) => {
          if (!old) return old;

          return old.map((comment) => {
            if (comment.id === commentId) {
              const newLikesCount = comment.hasLiked
                ? (comment.likesCount || 0) - 1
                : (comment.likesCount || 0) + 1;

              return {
                ...comment,
                hasLiked: !comment.hasLiked,
                likesCount: newLikesCount,
              };
            }

            // Atualizar replies também
            if (comment.replies) {
              return {
                ...comment,
                replies: comment.replies.map((reply) => {
                  if (reply.id === commentId) {
                    const newLikesCount = reply.hasLiked
                      ? (reply.likesCount || 0) - 1
                      : (reply.likesCount || 0) + 1;

                    return {
                      ...reply,
                      hasLiked: !reply.hasLiked,
                      likesCount: newLikesCount,
                    };
                  }
                  return reply;
                }),
              };
            }

            return comment;
          });
        });
      }

      return { previousComments };
    },
    onError: (_err, _variables, context) => {
      // Rollback em caso de erro
      if (context?.previousComments) {
        utils.comments.list.setData({ questionId, sortBy }, context.previousComments);
      }
      toast.error('Erro ao curtir comentário');
    },
  });

  const handleCreateComment = async (content: string) => {
    await createMutation.mutateAsync({
      questionId,
      content,
    });
  };

  const handleReply = async (parentId: number, content: string) => {
    await createMutation.mutateAsync({
      questionId,
      content,
      parentId,
    });
  };

  const handleEdit = async (commentId: number, content: string) => {
    await updateMutation.mutateAsync({
      commentId,
      content,
    });
  };

  const handleDelete = async (commentId: number) => {
    await deleteMutation.mutateAsync({ commentId });
  };

  const handleLike = async (commentId: number) => {
    if (!currentUserId) {
      toast.error('Faça login para curtir comentários');
      return;
    }

    await toggleLikeMutation.mutateAsync({ commentId });
  };

  const totalComments = comments?.reduce(
    (acc, comment) => acc + 1 + (comment.replies?.length || 0),
    0
  ) || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <CardTitle>Comentários</CardTitle>
            <span className="text-sm text-muted-foreground">({totalComments})</span>
          </div>

          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
            <SelectTrigger className="w-[180px]">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="most_liked">Mais curtidos</SelectItem>
              <SelectItem value="newest">Mais recentes</SelectItem>
              <SelectItem value="oldest">Mais antigos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Formulário de novo comentário */}
        {currentUserId ? (
          <CommentForm
            onSubmit={handleCreateComment}
            placeholder="Compartilhe sua dúvida ou conhecimento sobre esta questão..."
          />
        ) : (
          <Alert>
            <AlertDescription>
              Faça login para comentar e participar da discussão.
            </AlertDescription>
          </Alert>
        )}

        {/* Lista de comentários */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : comments && comments.length > 0 ? (
          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={currentUserId}
                onLike={handleLike}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <Alert>
            <AlertDescription>
              Nenhum comentário ainda. Seja o primeiro a comentar!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
