/**
 * Router de Planos de Estudo
 * Gerenciamento de planos de estudo do aluno
 */

import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { TRPCError } from '@trpc/server';
import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { getRawDb } from '../db';
import { redistributePlan } from '../helpers/metasDistribuicao';

export const metasPlanosRouter = router({
  /**
   * Criar novo plano de estudo
   */
  create: protectedProcedure
    .input(
      z.object({
        titulo: z.string().min(3).max(200),
        horasPorDia: z.number().min(0.5).max(12), // 30min a 12h
        diasDisponiveisBitmask: z.number().int().min(1).max(127), // 7 bits (Dom-Sáb)
        dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
        dataFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getRawDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const planoId = uuidv4();

      await db.query(
        `INSERT INTO metas_planos_estudo (
          id, usuario_id, titulo, horas_por_dia, dias_disponiveis_bitmask,
          data_inicio, data_fim, status, criado_por_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          planoId,
          ctx.user.id,
          input.titulo,
          input.horasPorDia,
          input.diasDisponiveisBitmask,
          input.dataInicio,
          input.dataFim || null,
          'ATIVO',
          ctx.user.id,
        ]
      );

      const result = await db.query(
        `SELECT * FROM metas_planos_estudo WHERE id = ?`,
        [planoId]
      );

      return result[0];
    }),

  /**
   * Buscar plano por ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const db = await getRawDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const result = await db.query(
        `SELECT * FROM metas_planos_estudo WHERE id = ? AND usuario_id = ?`,
        [input.id, ctx.user.id]
      );

      if (result.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Plano não encontrado' });
      }

      return result[0];
    }),

  /**
   * Listar planos do usuário
   */
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(['ATIVO', 'PAUSADO', 'CONCLUIDO']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getRawDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      let query = `SELECT * FROM metas_planos_estudo WHERE usuario_id = ?`;
      const params: any[] = [ctx.user.id];

      if (input.status) {
        query += ` AND status = ?`;
        params.push(input.status);
      }

      query += ` ORDER BY criado_em DESC`;

      const result = await db.query(query, params);
      return result;
    }),

  /**
   * Atualizar plano
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        titulo: z.string().min(3).max(200).optional(),
        horasPorDia: z.number().min(0.5).max(12).optional(),
        diasDisponiveisBitmask: z.number().int().min(1).max(127).optional(),
        dataFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        status: z.enum(['ATIVO', 'PAUSADO', 'CONCLUIDO']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getRawDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Verificar se plano pertence ao usuário
      const plano = await db.query(
        `SELECT * FROM metas_planos_estudo WHERE id = ? AND usuario_id = ?`,
        [input.id, ctx.user.id]
      );

      if (plano.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Plano não encontrado' });
      }

      // Construir update dinâmico
      const updates: string[] = [];
      const params: any[] = [];

      if (input.titulo !== undefined) {
        updates.push('titulo = ?');
        params.push(input.titulo);
      }
      if (input.horasPorDia !== undefined) {
        updates.push('horas_por_dia = ?');
        params.push(input.horasPorDia);
      }
      if (input.diasDisponiveisBitmask !== undefined) {
        updates.push('dias_disponiveis_bitmask = ?');
        params.push(input.diasDisponiveisBitmask);
      }
      if (input.dataFim !== undefined) {
        updates.push('data_fim = ?');
        params.push(input.dataFim);
      }
      if (input.status !== undefined) {
        updates.push('status = ?');
        params.push(input.status);
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

      // Se mudou horas ou dias, redistribuir
      if (input.horasPorDia !== undefined || input.diasDisponiveisBitmask !== undefined) {
        await redistributePlan(db, input.id);
      }

      const result = await db.query(
        `SELECT * FROM metas_planos_estudo WHERE id = ?`,
        [input.id]
      );

      return result[0];
    }),

  /**
   * Deletar plano (soft delete)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getRawDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Verificar se plano pertence ao usuário
      const plano = await db.query(
        `SELECT * FROM metas_planos_estudo WHERE id = ? AND usuario_id = ?`,
        [input.id, ctx.user.id]
      );

      if (plano.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Plano não encontrado' });
      }

      await db.query(
        `UPDATE metas_planos_estudo SET status = 'CONCLUIDO', atualizado_em = NOW() WHERE id = ?`,
        [input.id]
      );

      return { success: true };
    }),

  /**
   * Redistribuir metas pendentes
   */
  redistribute: protectedProcedure
    .input(z.object({ planoId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getRawDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Verificar se plano pertence ao usuário
      const plano = await db.query(
        `SELECT * FROM metas_planos_estudo WHERE id = ? AND usuario_id = ?`,
        [input.planoId, ctx.user.id]
      );

      if (plano.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Plano não encontrado' });
      }

      const result = await redistributePlan(db, input.planoId);

      return {
        success: true,
        metasAtualizadas: result.metasAtualizadas,
        diasAfetados: result.diasAfetados,
      };
    }),

  /**
   * Buscar cronograma do plano
   */
  getSchedule: protectedProcedure
    .input(
      z.object({
        planoId: z.string().uuid(),
        dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        dataFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        status: z.enum(['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA', 'PRECISA_MAIS_TEMPO', 'all']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getRawDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Verificar se plano pertence ao usuário
      const plano = await db.query(
        `SELECT * FROM metas_planos_estudo WHERE id = ? AND usuario_id = ?`,
        [input.planoId, ctx.user.id]
      );

      if (plano.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Plano não encontrado' });
      }

      // Construir query de metas
      let query = `SELECT * FROM metas_cronograma WHERE plano_id = ? AND omitted = false`;
      const params: any[] = [input.planoId];

      if (input.dataInicio) {
        query += ` AND scheduled_date >= ?`;
        params.push(input.dataInicio);
      }
      if (input.dataFim) {
        query += ` AND scheduled_date <= ?`;
        params.push(input.dataFim);
      }
      if (input.status && input.status !== 'all') {
        query += ` AND status = ?`;
        params.push(input.status);
      }

      query += ` ORDER BY scheduled_date ASC, scheduled_order ASC`;

      const metas = await db.query(query, params);

      // Calcular estatísticas
      const statsResult = await db.query(
        `SELECT 
          COUNT(*) as total_metas,
          SUM(CASE WHEN status = 'CONCLUIDA' THEN 1 ELSE 0 END) as concluidas,
          SUM(CASE WHEN status = 'PENDENTE' THEN 1 ELSE 0 END) as pendentes,
          SUM(duracao_planejada_min) as tempo_planejado_min,
          SUM(CASE WHEN status = 'CONCLUIDA' THEN COALESCE(duracao_real_sec, 0) ELSE 0 END) / 60 as tempo_gasto_min
         FROM metas
         WHERE plano_id = ? AND omitted = false`,
        [input.planoId]
      );

      const stats = statsResult[0];
      const progressPercent = stats.total_metas > 0
        ? Math.round((stats.concluidas / stats.total_metas) * 100)
        : 0;

      return {
        plano: plano[0],
        metas,
        summary: {
          totalMetas: stats.total_metas,
          concluidas: stats.concluidas,
          pendentes: stats.pendentes,
          tempoPlanejadomin: stats.tempo_planejado_min,
          tempoGastoMin: Math.round(stats.tempo_gasto_min),
          progressPercent,
        },
      };
    }),
});
