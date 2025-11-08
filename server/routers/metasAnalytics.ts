/**
 * Router de Analytics de Metas
 * Estatísticas e métricas agregadas para admin dashboard
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '../_core/trpc';
import { getDb } from '../db';

export const metasAnalyticsRouter = router({
  /**
   * Estatísticas globais de todos os planos
   */
  globalStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

    // Total de planos
    const totalPlanos = await db.query(
      `SELECT COUNT(*) as total FROM metas_planos_estudo WHERE usuario_id = ?`,
      [ctx.user.id]
    );

    // Total de metas por status
    const metasPorStatus = await db.query(
      `SELECT 
        m.status,
        COUNT(*) as total
       FROM metas_cronograma m
       JOIN metas_planos_estudo p ON m.plano_id = p.id
       WHERE p.usuario_id = ?
       GROUP BY m.status`,
      [ctx.user.id]
    );

    // Total de metas por tipo
    const metasPorTipo = await db.query(
      `SELECT 
        m.tipo,
        COUNT(*) as total
       FROM metas_cronograma m
       JOIN metas_planos_estudo p ON m.plano_id = p.id
       WHERE p.usuario_id = ?
       GROUP BY m.tipo`,
      [ctx.user.id]
    );

    // Tempo total estudado (metas concluídas)
    const tempoTotal = await db.query(
      `SELECT 
        SUM(m.duracao_real_sec) as total_segundos,
        SUM(m.duracao_planejada_min) as total_planejado_min
       FROM metas_cronograma m
       JOIN metas_planos_estudo p ON m.plano_id = p.id
       WHERE p.usuario_id = ? AND m.status = 'CONCLUIDA'`,
      [ctx.user.id]
    );

    return {
      totalPlanos: totalPlanos[0].total,
      metasPorStatus,
      metasPorTipo,
      tempoTotalEstudadoSec: tempoTotal[0].total_segundos || 0,
      tempoTotalPlanejadoMin: tempoTotal[0].total_planejado_min || 0,
    };
  }),

  /**
   * Taxa de conclusão por disciplina
   */
  conclusaoPorDisciplina: protectedProcedure
    .input(
      z.object({
        dataInicio: z.string().optional(),
        dataFim: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      let whereClause = 'WHERE p.usuario_id = ?';
      const params: any[] = [ctx.user.id];

      if (input.dataInicio) {
        whereClause += ' AND m.scheduled_date >= ?';
        params.push(input.dataInicio);
      }

      if (input.dataFim) {
        whereClause += ' AND m.scheduled_date <= ?';
        params.push(input.dataFim);
      }

      const result = await db.query(
        `SELECT 
          m.ktree_disciplina_id as disciplina,
          COUNT(*) as total,
          SUM(CASE WHEN m.status = 'CONCLUIDA' THEN 1 ELSE 0 END) as concluidas,
          SUM(CASE WHEN m.status = 'OMITIDA' THEN 1 ELSE 0 END) as omitidas,
          ROUND(SUM(CASE WHEN m.status = 'CONCLUIDA' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as taxa_conclusao
         FROM metas_cronograma m
         JOIN metas_planos_estudo p ON m.plano_id = p.id
         ${whereClause}
         GROUP BY m.ktree_disciplina_id
         ORDER BY taxa_conclusao DESC`,
        params
      );

      return result;
    }),

  /**
   * Metas mais omitidas (top 10)
   */
  metasMaisOmitidas: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

    const result = await db.query(
      `SELECT 
        m.ktree_disciplina_id as disciplina,
        m.ktree_assunto_id as assunto,
        m.ktree_topico_id as topico,
        m.tipo,
        COUNT(*) as total_omissoes,
        GROUP_CONCAT(DISTINCT m.motivo_omissao SEPARATOR '; ') as motivos
       FROM metas_cronograma m
       JOIN metas_planos_estudo p ON m.plano_id = p.id
       WHERE p.usuario_id = ? AND m.status = 'OMITIDA'
       GROUP BY m.ktree_disciplina_id, m.ktree_assunto_id, m.ktree_topico_id, m.tipo
       ORDER BY total_omissoes DESC
       LIMIT 10`,
      [ctx.user.id]
    );

    return result;
  }),

  /**
   * Tempo médio de estudo vs planejado por tipo
   */
  tempoMedioPorTipo: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

    const result = await db.query(
      `SELECT 
        m.tipo,
        COUNT(*) as total_metas,
        AVG(m.duracao_planejada_min) as media_planejada_min,
        AVG(m.duracao_real_sec / 60) as media_real_min,
        ROUND(AVG(m.duracao_real_sec / 60) - AVG(m.duracao_planejada_min), 2) as diferenca_min
       FROM metas_cronograma m
       JOIN metas_planos_estudo p ON m.plano_id = p.id
       WHERE p.usuario_id = ? AND m.status = 'CONCLUIDA' AND m.duracao_real_sec IS NOT NULL
       GROUP BY m.tipo`,
      [ctx.user.id]
    );

    return result;
  }),

  /**
   * Progresso temporal (últimos 30 dias)
   */
  progressoTemporal: protectedProcedure
    .input(
      z.object({
        dias: z.number().min(7).max(90).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const dias = input.dias || 30;

      const result = await db.query(
        `SELECT 
          m.scheduled_date as data,
          COUNT(*) as total_metas,
          SUM(CASE WHEN m.status = 'CONCLUIDA' THEN 1 ELSE 0 END) as concluidas,
          SUM(CASE WHEN m.status = 'OMITIDA' THEN 1 ELSE 0 END) as omitidas,
          SUM(CASE WHEN m.status = 'PENDENTE' THEN 1 ELSE 0 END) as pendentes,
          SUM(m.duracao_planejada_min) as tempo_planejado_min,
          SUM(CASE WHEN m.duracao_real_sec IS NOT NULL THEN m.duracao_real_sec / 60 ELSE 0 END) as tempo_real_min
         FROM metas_cronograma m
         JOIN metas_planos_estudo p ON m.plano_id = p.id
         WHERE p.usuario_id = ? 
           AND m.scheduled_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
           AND m.scheduled_date <= CURDATE()
         GROUP BY m.scheduled_date
         ORDER BY m.scheduled_date ASC`,
        [ctx.user.id, dias]
      );

      return result;
    }),

  /**
   * Distribuição de metas por dia da semana
   */
  distribuicaoPorDiaSemana: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

    const result = await db.query(
      `SELECT 
        DAYOFWEEK(m.scheduled_date) as dia_semana,
        COUNT(*) as total_metas,
        SUM(CASE WHEN m.status = 'CONCLUIDA' THEN 1 ELSE 0 END) as concluidas,
        AVG(m.duracao_planejada_min) as media_duracao_min
       FROM metas_cronograma m
       JOIN metas_planos_estudo p ON m.plano_id = p.id
       WHERE p.usuario_id = ?
       GROUP BY dia_semana
       ORDER BY dia_semana`,
      [ctx.user.id]
    );

    // Mapear números para nomes dos dias
    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return result.map((r: any) => ({
      ...r,
      dia_semana_nome: diasSemana[r.dia_semana - 1],
    }));
  }),

  /**
   * Histórico de redistribuições
   */
  historicoRedistribuicoes: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const limit = input.limit || 20;

      const result = await db.query(
        `SELECT 
          l.id,
          l.meta_id,
          l.data_original,
          l.data_nova,
          l.motivo,
          l.criado_em,
          m.display_number,
          m.ktree_disciplina_id,
          m.ktree_assunto_id
         FROM metas_cronograma_log_redistribuicao l
         JOIN metas_cronograma m ON l.meta_id = m.id
         JOIN metas_planos_estudo p ON m.plano_id = p.id
         WHERE p.usuario_id = ?
         ORDER BY l.criado_em DESC
         LIMIT ?`,
        [ctx.user.id, limit]
      );

      return result;
    }),
});
