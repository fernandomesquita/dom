import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { forumNotifications } from '../../drizzle/schema-forum';
import { eq, and, desc, sql } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

/**
 * Router de Notificações do Fórum
 * Gerenciamento de notificações de atividades no fórum
 */
export const forumNotificationsRouter = router({
  /**
   * Listar notificações do usuário
   */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        apenasNaoLidas: z.boolean().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const conditions = [eq(forumNotifications.usuarioId, ctx.user.id)];
      if (input.apenasNaoLidas) {
        conditions.push(eq(forumNotifications.isLida, false));
      }

      const notifications = await db
        .select()
        .from(forumNotifications)
        .where(and(...conditions))
        .orderBy(desc(forumNotifications.criadoEm))
        .limit(input.limit)
        .offset(input.offset);

      const total = await db
        .select({ count: sql<number>`count(*)` })
        .from(forumNotifications)
        .where(and(...conditions));

      return {
        notifications,
        total: total[0]?.count || 0,
        page: Math.floor(input.offset / input.limit) + 1,
        totalPages: Math.ceil((total[0]?.count || 0) / input.limit),
      };
    }),

  /**
   * Contar notificações não lidas
   */
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(forumNotifications)
      .where(
        and(
          eq(forumNotifications.usuarioId, ctx.user.id),
          eq(forumNotifications.isLida, false)
        )
      );

    return result?.count || 0;
  }),

  /**
   * Marcar notificação como lida
   */
  markRead: protectedProcedure
    .input(
      z.object({
        notificacaoId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      await db
        .update(forumNotifications)
        .set({ isLida: true })
        .where(
          and(
            eq(forumNotifications.id, input.notificacaoId),
            eq(forumNotifications.usuarioId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  /**
   * Marcar todas como lidas
   */
  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

    await db
      .update(forumNotifications)
      .set({ isLida: true })
      .where(
        and(
          eq(forumNotifications.usuarioId, ctx.user.id),
          eq(forumNotifications.isLida, false)
        )
      );

    return { success: true };
  }),

  /**
   * Deletar notificação
   */
  delete: protectedProcedure
    .input(
      z.object({
        notificacaoId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      await db
        .delete(forumNotifications)
        .where(
          and(
            eq(forumNotifications.id, input.notificacaoId),
            eq(forumNotifications.usuarioId, ctx.user.id)
          )
        );

      return { success: true };
    }),
});
