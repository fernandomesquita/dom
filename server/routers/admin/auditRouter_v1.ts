import { z } from 'zod';
import { router, adminRoleProcedure } from '../../_core/trpc';
import { auditLogs } from '../../../drizzle/schema';
import { desc, eq, and, gte, lte, like, sql } from 'drizzle-orm';
import { createModuleLogger } from '../../_core/logger';

const logger = createModuleLogger('audit');

/**
 * Router de auditoria (v1)
 * 
 * Procedures para listar, filtrar e analisar logs de auditoria
 * Apenas administradores (MASTER + ADMINISTRATIVO) têm acesso
 */
export const auditRouter_v1 = router({
  /**
   * Listar logs de auditoria com filtros e paginação
   */
  list: adminRoleProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        actorId: z.string().optional(),
        action: z.string().optional(),
        targetType: z.string().optional(),
        startDate: z.string().optional(), // ISO date
        endDate: z.string().optional(), // ISO date
        search: z.string().optional(), // Busca em payload
      })
    )
    .query(async ({ input, ctx }) => {
      const startTime = Date.now();
      const { page, limit, actorId, action, targetType, startDate, endDate, search } = input;
      const offset = (page - 1) * limit;

      try {
        // Construir filtros
        const filters = [];
        if (actorId) filters.push(eq(auditLogs.actorId, actorId));
        if (action) filters.push(eq(auditLogs.action, action));
        if (targetType) filters.push(eq(auditLogs.targetType, targetType));
        if (startDate) filters.push(gte(auditLogs.createdAt, new Date(startDate)));
        if (endDate) filters.push(lte(auditLogs.createdAt, new Date(endDate)));

        // Buscar logs
        const logs = await ctx.db
          .select()
          .from(auditLogs)
          .where(filters.length > 0 ? and(...filters) : undefined)
          .orderBy(desc(auditLogs.createdAt))
          .limit(limit)
          .offset(offset);

        // Contar total
        const [{ count }] = await ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(auditLogs)
          .where(filters.length > 0 ? and(...filters) : undefined);

        const duration = Date.now() - startTime;

        ctx.logger.info(
          {
            action: 'LIST_AUDIT_LOGS',
            user_id: ctx.user.id,
            filters: { actorId, action, targetType, startDate, endDate },
            results: logs.length,
            duration_ms: duration,
          },
          'Audit logs listed'
        );

        return {
          logs,
          pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit),
          },
        };
      } catch (error) {
        ctx.logger.error({ error: String(error) }, 'Failed to list audit logs');
        throw error;
      }
    }),

  /**
   * Buscar logs de um usuário específico
   */
  getByUser: adminRoleProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input, ctx }) => {
      const { userId, limit } = input;

      try {
        const logs = await ctx.db
          .select()
          .from(auditLogs)
          .where(eq(auditLogs.actorId, userId))
          .orderBy(desc(auditLogs.createdAt))
          .limit(limit);

        ctx.logger.info(
          {
            action: 'GET_USER_AUDIT_LOGS',
            user_id: ctx.user.id,
            target_user_id: userId,
            results: logs.length,
          },
          'User audit logs retrieved'
        );

        return logs;
      } catch (error) {
        ctx.logger.error({ error: String(error) }, 'Failed to get user audit logs');
        throw error;
      }
    }),

  /**
   * Buscar logs de uma ação específica
   */
  getByAction: adminRoleProcedure
    .input(
      z.object({
        action: z.string(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input, ctx }) => {
      const { action, limit } = input;

      try {
        const logs = await ctx.db
          .select()
          .from(auditLogs)
          .where(eq(auditLogs.action, action))
          .orderBy(desc(auditLogs.createdAt))
          .limit(limit);

        ctx.logger.info(
          {
            action: 'GET_ACTION_AUDIT_LOGS',
            user_id: ctx.user.id,
            target_action: action,
            results: logs.length,
          },
          'Action audit logs retrieved'
        );

        return logs;
      } catch (error) {
        ctx.logger.error({ error: String(error) }, 'Failed to get action audit logs');
        throw error;
      }
    }),

  /**
   * Estatísticas de auditoria
   */
  stats: adminRoleProcedure.query(async ({ ctx }) => {
    try {
      // Total de logs
      const [{ total }] = await ctx.db
        .select({ total: sql<number>`count(*)` })
        .from(auditLogs);

      // Logs por ação (top 10)
      const byAction = await ctx.db
        .select({
          action: auditLogs.action,
          count: sql<number>`count(*)`,
        })
        .from(auditLogs)
        .groupBy(auditLogs.action)
        .orderBy(desc(sql`count(*)`))
        .limit(10);

      // Logs por usuário (top 10)
      const byUser = await ctx.db
        .select({
          actorId: auditLogs.actorId,
          actorRole: auditLogs.actorRole,
          count: sql<number>`count(*)`,
        })
        .from(auditLogs)
        .groupBy(auditLogs.actorId, auditLogs.actorRole)
        .orderBy(desc(sql`count(*)`))
        .limit(10);

      // Logs das últimas 24h
      const last24h = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(auditLogs)
        .where(gte(auditLogs.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000)));

      ctx.logger.info(
        {
          action: 'GET_AUDIT_STATS',
          user_id: ctx.user.id,
        },
        'Audit stats retrieved'
      );

      return {
        total,
        last24h: last24h[0].count,
        byAction,
        byUser,
      };
    } catch (error) {
      ctx.logger.error({ error: String(error) }, 'Failed to get audit stats');
      throw error;
    }
  }),
});
