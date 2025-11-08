import { z } from 'zod';
import { adminProcedure, protectedProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import {
  forumModerationQueue,
  forumUserSuspensions,
  forumDomainWhitelist,
  forumThreads,
  forumMessages,
} from '../../drizzle/schema-forum';
import { eq, and, desc, gte, sql } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

/**
 * Router de Moderação do Fórum
 * Gerenciamento de conteúdo suspeito e suspensões de usuários
 */
export const forumModerationRouter = router({
  /**
   * Listar itens pendentes de moderação
   */
  getPending: adminProcedure
    .input(
      z.object({
        tipo: z.enum(['thread', 'mensagem', 'todos']).optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const conditions = [eq(forumModerationQueue.status, 'pendente')];
      if (input.tipo && input.tipo !== 'todos') {
        conditions.push(eq(forumModerationQueue.tipo, input.tipo));
      }

      const items = await db
        .select()
        .from(forumModerationQueue)
        .where(and(...conditions))
        .orderBy(desc(forumModerationQueue.criadoEm))
        .limit(input.limit)
        .offset(input.offset);

      const total = await db
        .select({ count: sql<number>`count(*)` })
        .from(forumModerationQueue)
        .where(and(...conditions));

      return {
        items,
        total: total[0]?.count || 0,
        page: Math.floor(input.offset / input.limit) + 1,
        totalPages: Math.ceil((total[0]?.count || 0) / input.limit),
      };
    }),

  /**
   * Aprovar conteúdo
   */
  approve: adminProcedure
    .input(
      z.object({
        itemId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Buscar item
      const [item] = await db
        .select()
        .from(forumModerationQueue)
        .where(eq(forumModerationQueue.id, input.itemId))
        .limit(1);

      if (!item) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Item não encontrado' });
      }

      if (item.status !== 'pendente') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Item já foi moderado' });
      }

      // Atualizar status do item
      await db
        .update(forumModerationQueue)
        .set({
          status: 'aprovado',
          moderadoPor: ctx.user.id,
          moderadoEm: new Date(),
        })
        .where(eq(forumModerationQueue.id, input.itemId));

      // Atualizar status do conteúdo original
      if (item.tipo === 'thread' && item.threadId) {
        await db
          .update(forumThreads)
          .set({ status: 'ativo' })
          .where(eq(forumThreads.id, item.threadId));
      } else if (item.tipo === 'mensagem' && item.mensagemId) {
        await db
          .update(forumMessages)
          .set({ status: 'ativo' })
          .where(eq(forumMessages.id, item.mensagemId));
      }

      return { success: true };
    }),

  /**
   * Rejeitar conteúdo
   */
  reject: adminProcedure
    .input(
      z.object({
        itemId: z.string(),
        motivo: z.string().min(10).max(500),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Buscar item
      const [item] = await db
        .select()
        .from(forumModerationQueue)
        .where(eq(forumModerationQueue.id, input.itemId))
        .limit(1);

      if (!item) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Item não encontrado' });
      }

      if (item.status !== 'pendente') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Item já foi moderado' });
      }

      // Atualizar status do item
      await db
        .update(forumModerationQueue)
        .set({
          status: 'rejeitado',
          motivo: input.motivo,
          moderadoPor: ctx.user.id,
          moderadoEm: new Date(),
        })
        .where(eq(forumModerationQueue.id, input.itemId));

      // Soft delete do conteúdo original
      if (item.tipo === 'thread' && item.threadId) {
        await db
          .update(forumThreads)
          .set({
            status: 'excluido',
            deletadoEm: new Date(),
            deletadoPor: ctx.user.id,
            motivoDelecao: input.motivo,
          })
          .where(eq(forumThreads.id, item.threadId));
      } else if (item.tipo === 'mensagem' && item.mensagemId) {
        await db
          .update(forumMessages)
          .set({
            status: 'excluido',
            deletadoEm: new Date(),
            deletadoPor: ctx.user.id,
          })
          .where(eq(forumMessages.id, item.mensagemId));
      }

      return { success: true };
    }),

  /**
   * Suspender usuário
   */
  suspendUser: adminProcedure
    .input(
      z.object({
        usuarioId: z.string(),
        duracao: z.enum(['1', '7', '30', 'permanente']),
        motivo: z.string().min(10).max(500),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Calcular data de término
      let terminoEm: Date | null = null;
      if (input.duracao !== 'permanente') {
        const dias = parseInt(input.duracao);
        terminoEm = new Date();
        terminoEm.setDate(terminoEm.getDate() + dias);
      }

      // Criar suspensão
      await db.insert(forumUserSuspensions).values({
        usuarioId: input.usuarioId,
        suspensoPor: ctx.user.id,
        motivo: input.motivo,
        terminoEm,
      });

      return { success: true, terminoEm };
    }),

  /**
   * Remover suspensão
   */
  unsuspendUser: adminProcedure
    .input(
      z.object({
        usuarioId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Buscar suspensão ativa
      const [suspensao] = await db
        .select()
        .from(forumUserSuspensions)
        .where(
          and(
            eq(forumUserSuspensions.usuarioId, input.usuarioId),
            eq(forumUserSuspensions.ativo, true)
          )
        )
        .limit(1);

      if (!suspensao) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Usuário não está suspenso' });
      }

      // Desativar suspensão
      await db
        .update(forumUserSuspensions)
        .set({ ativo: false })
        .where(eq(forumUserSuspensions.id, suspensao.id));

      return { success: true };
    }),

  /**
   * Listar usuários suspensos
   */
  getSuspendedUsers: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const suspensions = await db
        .select()
        .from(forumUserSuspensions)
        .where(eq(forumUserSuspensions.ativo, true))
        .orderBy(desc(forumUserSuspensions.criadoEm))
        .limit(input.limit)
        .offset(input.offset);

      const total = await db
        .select({ count: sql<number>`count(*)` })
        .from(forumUserSuspensions)
        .where(eq(forumUserSuspensions.ativo, true));

      return {
        suspensions,
        total: total[0]?.count || 0,
        page: Math.floor(input.offset / input.limit) + 1,
        totalPages: Math.ceil((total[0]?.count || 0) / input.limit),
      };
    }),

  /**
   * Gerenciar whitelist de domínios
   */
  addDomainToWhitelist: adminProcedure
    .input(
      z.object({
        dominio: z.string().min(3).max(100),
        motivo: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Verificar se já existe
      const [existing] = await db
        .select()
        .from(forumDomainWhitelist)
        .where(eq(forumDomainWhitelist.dominio, input.dominio))
        .limit(1);

      if (existing) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Domínio já está na whitelist' });
      }

      await db.insert(forumDomainWhitelist).values({
        dominio: input.dominio,
        motivo: input.motivo,
        adicionadoPor: ctx.user.id,
      });

      return { success: true };
    }),

  removeDomainFromWhitelist: adminProcedure
    .input(
      z.object({
        dominioId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      await db.delete(forumDomainWhitelist).where(eq(forumDomainWhitelist.id, input.dominioId));

      return { success: true };
    }),

  listWhitelist: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

    const domains = await db.select().from(forumDomainWhitelist).orderBy(forumDomainWhitelist.dominio);

    return domains;
  }),

  /**
   * Estatísticas de moderação
   */
  getStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

    const [pendentes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(forumModerationQueue)
      .where(eq(forumModerationQueue.status, 'pendente'));

    const [aprovados] = await db
      .select({ count: sql<number>`count(*)` })
      .from(forumModerationQueue)
      .where(eq(forumModerationQueue.status, 'aprovado'));

    const [rejeitados] = await db
      .select({ count: sql<number>`count(*)` })
      .from(forumModerationQueue)
      .where(eq(forumModerationQueue.status, 'rejeitado'));

    const [suspensos] = await db
      .select({ count: sql<number>`count(*)` })
      .from(forumUserSuspensions)
      .where(eq(forumUserSuspensions.ativo, true));

    return {
      pendentes: pendentes?.count || 0,
      aprovados: aprovados?.count || 0,
      rejeitados: rejeitados?.count || 0,
      usuariosSuspensos: suspensos?.count || 0,
    };
  }),
});
