import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { TRPCError } from '@trpc/server';
import { router, staffProcedure, adminRoleProcedure } from '../../_core/trpc';
import { getRawDb } from '../../db';
import { logAuditAction, AuditAction, TargetType } from '../../_core/audit';

/**
 * Router de Gestão de Planos de Estudo (Admin) - v1
 * 
 * Gerenciamento administrativo de planos de estudo
 * Apenas staff tem acesso
 */

const planCreateSchema = z.object({
  userId: z.string().uuid().optional(), // Se não fornecido, cria para o próprio admin
  titulo: z.string().min(3, 'Título deve ter no mínimo 3 caracteres').max(200),
  horasPorDia: z.number().min(0.5, 'Mínimo 30 minutos').max(12, 'Máximo 12 horas'),
  diasDisponiveisBitmask: z.number().int().min(1).max(127), // 7 bits (Dom-Sáb)
  dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  dataFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional(),
  status: z.enum(['ATIVO', 'PAUSADO', 'CONCLUIDO']).default('ATIVO'),
});

const planUpdateSchema = planCreateSchema.partial().omit({ userId: true });

export const plansRouter_v1 = router({
  /**
   * Listar planos com filtros e paginação
   */
  list: staffProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        userId: z.string().uuid().optional(),
        status: z.enum(['ATIVO', 'PAUSADO', 'CONCLUIDO']).optional(),
        search: z.string().optional(),
        sortBy: z.enum(['titulo', 'criado_em', 'data_inicio']).default('criado_em'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
      })
    )
    .query(async ({ input, ctx }) => {
      const startTime = Date.now();
      const { page, limit, userId, status, search, sortBy, sortOrder } = input;
      const offset = (page - 1) * limit;

      try {
        const db = await getRawDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

        // Construir query
        let query = `
          SELECT 
            p.*,
            u.nome_completo as usuario_nome,
            u.email as usuario_email,
            (SELECT COUNT(*) FROM metas_cronograma WHERE plano_id = p.id) as total_metas,
            (SELECT COUNT(*) FROM metas_cronograma WHERE plano_id = p.id AND concluded_at_utc IS NOT NULL) as metas_concluidas
          FROM metas_planos_estudo p
          LEFT JOIN users u ON p.usuario_id = u.id
          WHERE 1=1
        `;
        const params: any[] = [];

        if (userId) {
          query += ` AND p.usuario_id = ?`;
          params.push(userId);
        }

        if (status) {
          query += ` AND p.status = ?`;
          params.push(status);
        }

        if (search) {
          query += ` AND (p.titulo LIKE ? OR u.nome_completo LIKE ? OR u.email LIKE ?)`;
          const searchPattern = `%${search}%`;
          params.push(searchPattern, searchPattern, searchPattern);
        }

        // Contar total
        let countQuery = `
          SELECT COUNT(DISTINCT p.id) as total
          FROM metas_planos_estudo p
          LEFT JOIN users u ON p.usuario_id = u.id
          WHERE 1=1
        `;
        const countParams: any[] = [];
        
        if (userId) {
          countQuery += ` AND p.usuario_id = ?`;
          countParams.push(userId);
        }
        if (status) {
          countQuery += ` AND p.status = ?`;
          countParams.push(status);
        }
        if (search) {
          countQuery += ` AND (p.titulo LIKE ? OR u.nome_completo LIKE ? OR u.email LIKE ?)`;
          const searchPattern = `%${search}%`;
          countParams.push(searchPattern, searchPattern, searchPattern);
        }
        
        const [{ total }] = await db.query(countQuery, countParams);

        // Ordenação
        const sortColumn = sortBy === 'titulo' ? 'p.titulo' : sortBy === 'data_inicio' ? 'p.data_inicio' : 'p.criado_em';
        query += ` ORDER BY ${sortColumn} ${sortOrder.toUpperCase()}`;
        query += ` LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const plans = await db.query(query, params);

        const duration = Date.now() - startTime;

        ctx.logger.info(
          {
            action: 'LIST_PLANS',
            user_id: ctx.user.id,
            filters: { userId, status, search },
            results: plans.length,
            duration_ms: duration,
          },
          'Plans listed'
        );

        return {
          plans,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        };
      } catch (error) {
        ctx.logger.error({ error: String(error) }, 'Failed to list plans');
        throw error;
      }
    }),

  /**
   * Buscar plano por ID
   */
  getById: staffProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getRawDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

        const result = await db.query(
          `SELECT 
            p.*,
            u.nome_completo as usuario_nome,
            u.email as usuario_email,
            (SELECT COUNT(*) FROM metas_cronograma WHERE plano_id = p.id) as total_metas,
            (SELECT COUNT(*) FROM metas_cronograma WHERE plano_id = p.id AND concluded_at_utc IS NOT NULL) as metas_concluidas
          FROM metas_planos_estudo p
          LEFT JOIN users u ON p.usuario_id = u.id
          WHERE p.id = ?`,
          [input.id]
        );

        if (result.length === 0) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Plano não encontrado' });
        }

        ctx.logger.info(
          {
            action: 'GET_PLAN',
            user_id: ctx.user.id,
            plan_id: input.id,
          },
          'Plan retrieved'
        );

        return result[0];
      } catch (error) {
        ctx.logger.error({ error: String(error) }, 'Failed to get plan');
        throw error;
      }
    }),

  /**
   * Criar novo plano
   */
  create: staffProcedure
    .input(planCreateSchema)
    .mutation(async ({ input, ctx }) => {
      const startTime = Date.now();

      try {
        const db = await getRawDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

        const planoId = uuidv4();
        const targetUserId = input.userId || ctx.user.id;

        await db.query(
          `INSERT INTO metas_planos_estudo (
            id, usuario_id, titulo, horas_por_dia, dias_disponiveis_bitmask,
            data_inicio, data_fim, status, criado_por_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            planoId,
            targetUserId,
            input.titulo,
            input.horasPorDia,
            input.diasDisponiveisBitmask,
            input.dataInicio,
            input.dataFim || null,
            input.status,
            ctx.user.id,
          ]
        );

        const result = await db.query(
          `SELECT * FROM metas_planos_estudo WHERE id = ?`,
          [planoId]
        );

        const duration = Date.now() - startTime;

        // Auditoria
        await logAuditAction({
          actorId: ctx.user.id,
          actorRole: ctx.user.role,
          action: AuditAction.CREATE_PLAN,
          targetType: TargetType.PLAN,
          targetId: planoId,
          payload: { titulo: input.titulo, targetUserId },
          req: ctx.req,
        });

        ctx.logger.info(
          {
            action: 'CREATE_PLAN',
            user_id: ctx.user.id,
            plan_id: planoId,
            target_user_id: targetUserId,
            duration_ms: duration,
          },
          'Plan created'
        );

        return result[0];
      } catch (error) {
        ctx.logger.error({ error: String(error) }, 'Failed to create plan');
        throw error;
      }
    }),

  /**
   * Atualizar plano
   */
  update: staffProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: planUpdateSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const startTime = Date.now();

      try {
        const db = await getRawDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

        // Verificar se plano existe
        const existing = await db.query(
          `SELECT * FROM metas_planos_estudo WHERE id = ?`,
          [input.id]
        );

        if (existing.length === 0) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Plano não encontrado' });
        }

        // Construir update
        const updates: string[] = [];
        const params: any[] = [];

        if (input.data.titulo !== undefined) {
          updates.push('titulo = ?');
          params.push(input.data.titulo);
        }
        if (input.data.horasPorDia !== undefined) {
          updates.push('horas_por_dia = ?');
          params.push(input.data.horasPorDia);
        }
        if (input.data.diasDisponiveisBitmask !== undefined) {
          updates.push('dias_disponiveis_bitmask = ?');
          params.push(input.data.diasDisponiveisBitmask);
        }
        if (input.data.dataInicio !== undefined) {
          updates.push('data_inicio = ?');
          params.push(input.data.dataInicio);
        }
        if (input.data.dataFim !== undefined) {
          updates.push('data_fim = ?');
          params.push(input.data.dataFim);
        }
        if (input.data.status !== undefined) {
          updates.push('status = ?');
          params.push(input.data.status);
        }

        if (updates.length === 0) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Nenhum campo para atualizar' });
        }

        updates.push('atualizado_em = NOW()');
        params.push(input.id);

        await db.query(
          `UPDATE metas_planos_estudo SET ${updates.join(', ')} WHERE id = ?`,
          params
        );

        const result = await db.query(
          `SELECT * FROM metas_planos_estudo WHERE id = ?`,
          [input.id]
        );

        const duration = Date.now() - startTime;

        // Auditoria
        await logAuditAction({
          actorId: ctx.user.id,
          actorRole: ctx.user.role,
          action: AuditAction.UPDATE_PLAN,
          targetType: TargetType.PLAN,
          targetId: input.id,
          payload: input.data,
          req: ctx.req,
        });

        ctx.logger.info(
          {
            action: 'UPDATE_PLAN',
            user_id: ctx.user.id,
            plan_id: input.id,
            duration_ms: duration,
          },
          'Plan updated'
        );

        return result[0];
      } catch (error) {
        ctx.logger.error({ error: String(error) }, 'Failed to update plan');
        throw error;
      }
    }),

  /**
   * Deletar plano (soft delete)
   */
  delete: adminRoleProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getRawDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

        // Verificar se plano existe
        const existing = await db.query(
          `SELECT * FROM metas_planos_estudo WHERE id = ?`,
          [input.id]
        );

        if (existing.length === 0) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Plano não encontrado' });
        }

        // Verificar se há metas associadas
        const [{ total }] = await db.query(
          `SELECT COUNT(*) as total FROM metas_cronograma WHERE plano_id = ?`,
          [input.id]
        );

        if (total > 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Não é possível deletar plano com ${total} meta(s) associada(s). Delete as metas primeiro.`,
          });
        }

        // Soft delete
        await db.query(
          `UPDATE metas_planos_estudo SET status = 'CONCLUIDO', atualizado_em = NOW() WHERE id = ?`,
          [input.id]
        );

        // Auditoria
        await logAuditAction({
          actorId: ctx.user.id,
          actorRole: ctx.user.role,
          action: AuditAction.DELETE_PLAN,
          targetType: TargetType.PLAN,
          targetId: input.id,
          payload: { titulo: existing[0].titulo },
          req: ctx.req,
        });

        ctx.logger.info(
          {
            action: 'DELETE_PLAN',
            user_id: ctx.user.id,
            plan_id: input.id,
          },
          'Plan deleted (soft)'
        );

        return { success: true };
      } catch (error) {
        ctx.logger.error({ error: String(error) }, 'Failed to delete plan');
        throw error;
      }
    }),

  /**
   * Estatísticas de planos
   */
  stats: staffProcedure.query(async ({ ctx }) => {
    try {
      const db = await getRawDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const [stats] = await db.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'ATIVO' THEN 1 ELSE 0 END) as ativos,
          SUM(CASE WHEN status = 'PAUSADO' THEN 1 ELSE 0 END) as pausados,
          SUM(CASE WHEN status = 'CONCLUIDO' THEN 1 ELSE 0 END) as concluidos,
          (SELECT COUNT(DISTINCT usuario_id) FROM metas_planos_estudo) as usuarios_com_planos,
          (SELECT COUNT(*) FROM metas) as total_metas
        FROM metas_planos_estudo
      `);

      ctx.logger.info(
        {
          action: 'GET_PLAN_STATS',
          user_id: ctx.user.id,
        },
        'Plan stats retrieved'
      );

      return stats;
    } catch (error) {
      ctx.logger.error({ error: String(error) }, 'Failed to get plan stats');
      throw error;
    }
  }),
});
