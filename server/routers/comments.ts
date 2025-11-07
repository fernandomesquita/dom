/**
 * Comments Router - Sistema de comentários em questões
 * Suporta comentários principais e respostas (depth 1)
 */

import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../_core/trpc';
import { questionComments, commentLikes } from '../../drizzle/schema-questions';
import { users } from '../../drizzle/schema';
import { eq, and, desc, sql, isNull } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

// ============================================================================
// ROUTER DE COMENTÁRIOS
// ============================================================================

export const commentsRouter = router({
  /**
   * 1. LIST - Listar comentários de uma questão
   */
  list: publicProcedure
    .input(z.object({
      questionId: z.number(),
      sortBy: z.enum(['newest', 'oldest', 'most_liked']).default('most_liked'),
    }))
    .query(async ({ ctx, input }) => {
      const { questionId, sortBy } = input;
      const userId = ctx.user?.id;

      // Ordenação
      let orderBy;
      switch (sortBy) {
        case 'newest':
          orderBy = desc(questionComments.createdAt);
          break;
        case 'oldest':
          orderBy = questionComments.createdAt;
          break;
        case 'most_liked':
          orderBy = desc(questionComments.likesCount);
          break;
      }

      // Buscar comentários principais (sem parent)
      const mainComments = await ctx.db
        .select({
          id: questionComments.id,
          questionId: questionComments.questionId,
          userId: questionComments.userId,
          content: questionComments.content,
          likesCount: questionComments.likesCount,
          // repliesCount calculado dinamicamente
          createdAt: questionComments.createdAt,
          updatedAt: questionComments.updatedAt,
          // Join com user
          userName: users.nomeCompleto,
          userEmail: users.email,
        })
        .from(questionComments)
        .leftJoin(users, eq(questionComments.userId, users.id))
        .where(and(
          eq(questionComments.questionId, questionId),
          isNull(questionComments.parentId)
        ))
        .orderBy(orderBy);

      // Para cada comentário principal, buscar se usuário deu like
      const commentsWithLikes = await Promise.all(
        mainComments.map(async (comment) => {
          let hasLiked = false;

          if (userId) {
            const [like] = await ctx.db
              .select()
              .from(commentLikes)
              .where(and(
                eq(commentLikes.commentId, comment.id),
                eq(commentLikes.userId, userId)
              ))
              .limit(1);

            hasLiked = !!like;
          }

          // Buscar respostas (depth 1)
          const replies = await ctx.db
            .select({
              id: questionComments.id,
              questionId: questionComments.questionId,
              parentId: questionComments.parentId,
              userId: questionComments.userId,
              content: questionComments.content,
              likesCount: questionComments.likesCount,
              createdAt: questionComments.createdAt,
              updatedAt: questionComments.updatedAt,
              userName: users.nomeCompleto,
              userEmail: users.email,
            })
            .from(questionComments)
            .leftJoin(users, eq(questionComments.userId, users.id))
            .where(eq(questionComments.parentId, comment.id))
            .orderBy(questionComments.createdAt);

          // Verificar likes nas respostas
          const repliesWithLikes = await Promise.all(
            replies.map(async (reply) => {
              let replyHasLiked = false;

              if (userId) {
                const [like] = await ctx.db
                  .select()
                  .from(commentLikes)
                  .where(and(
                    eq(commentLikes.commentId, reply.id),
                    eq(commentLikes.userId, userId)
                  ))
                  .limit(1);

                replyHasLiked = !!like;
              }

              return {
                ...reply,
                hasLiked: replyHasLiked,
              };
            })
          );

          return {
            ...comment,
            hasLiked,
            replies: repliesWithLikes,
          };
        })
      );

      return commentsWithLikes;
    }),

  /**
   * 2. CREATE - Criar comentário ou resposta
   */
  create: protectedProcedure
    .input(z.object({
      questionId: z.number(),
      content: z.string().min(1).max(2000),
      parentId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { questionId, content, parentId } = input;
      const userId = ctx.user.id;

      // Se for resposta, validar que parent existe e não é resposta de resposta (depth 1)
      if (parentId) {
        const [parent] = await ctx.db
          .select()
          .from(questionComments)
          .where(eq(questionComments.id, parentId))
          .limit(1);

        if (!parent) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Comentário pai não encontrado',
          });
        }

        if (parent.parentId !== null) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Não é possível responder uma resposta (profundidade máxima: 1)',
          });
        }
      }

      // Inserir comentário
      const [newComment] = await ctx.db
        .insert(questionComments)
        .values({
          questionId,
          userId,
          content,
          parentId: parentId || null,
        })
        .$returningId();

      // Se for resposta, não precisa incrementar contador (contar dinamicamente)

      return { id: newComment.id };
    }),

  /**
   * 3. UPDATE - Atualizar comentário (apenas autor)
   */
  update: protectedProcedure
    .input(z.object({
      commentId: z.number(),
      content: z.string().min(1).max(2000),
    }))
    .mutation(async ({ ctx, input }) => {
      const { commentId, content } = input;
      const userId = ctx.user.id;

      // Verificar se comentário existe e pertence ao usuário
      const [comment] = await ctx.db
        .select()
        .from(questionComments)
        .where(eq(questionComments.id, commentId))
        .limit(1);

      if (!comment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Comentário não encontrado',
        });
      }

      if (comment.userId !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Você não tem permissão para editar este comentário',
        });
      }

      // Atualizar
      await ctx.db
        .update(questionComments)
        .set({
          content,
          isEdited: true,
        })
        .where(eq(questionComments.id, commentId));

      return { success: true };
    }),

  /**
   * 4. DELETE - Deletar comentário (apenas autor)
   */
  delete: protectedProcedure
    .input(z.object({
      commentId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { commentId } = input;
      const userId = ctx.user.id;

      // Verificar se comentário existe e pertence ao usuário
      const [comment] = await ctx.db
        .select()
        .from(questionComments)
        .where(eq(questionComments.id, commentId))
        .limit(1);

      if (!comment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Comentário não encontrado',
        });
      }

      if (comment.userId !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Você não tem permissão para deletar este comentário',
        });
      }

      // Se for comentário principal, deletar respostas também
      if (comment.parentId === null) {
        await ctx.db
          .delete(questionComments)
          .where(eq(questionComments.parentId, commentId));
      }

      // Deletar comentário
      await ctx.db
        .delete(questionComments)
        .where(eq(questionComments.id, commentId));

      return { success: true };
    }),

  /**
   * 5. TOGGLE_LIKE - Curtir/descurtir comentário
   */
  toggleLike: protectedProcedure
    .input(z.object({
      commentId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { commentId } = input;
      const userId = ctx.user.id;

      // Verificar se já curtiu
      const [existing] = await ctx.db
        .select()
        .from(commentLikes)
        .where(and(
          eq(commentLikes.commentId, commentId),
          eq(commentLikes.userId, userId)
        ))
        .limit(1);

      if (existing) {
        // Remover like
        await ctx.db
          .delete(commentLikes)
          .where(and(
            eq(commentLikes.commentId, commentId),
            eq(commentLikes.userId, userId)
          ));

        // Decrementar contador
        await ctx.db
          .update(questionComments)
          .set({
            likesCount: sql`GREATEST(${questionComments.likesCount} - 1, 0)`,
          })
          .where(eq(questionComments.id, commentId));

        return { liked: false };
      } else {
        // Adicionar like
        await ctx.db
          .insert(commentLikes)
          .values({
            commentId,
            userId,
          });

        // Incrementar contador
        await ctx.db
          .update(questionComments)
          .set({
            likesCount: sql`${questionComments.likesCount} + 1`,
          })
          .where(eq(questionComments.id, commentId));

        return { liked: true };
      }
    }),
});
