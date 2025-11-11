/**
 * Router de Metas
 * Gerenciamento de metas individuais de estudo
 */

import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { TRPCError } from '@trpc/server';
import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { getRawDb } from '../db';
import {
  makeOrderKey,
  formatDisplayNumber,
  getNextMetaNumber,
} from '../helpers/metasNumeracao';
import { scheduleReviewCycle, hasScheduledReviews } from '../helpers/metasRevisao';
import { redistributePlan } from '../helpers/metasDistribuicao';

export const metasMetasRouter = router({
  /**
   * Listar metas com filtros
   */
  list: protectedProcedure
    .input(
      z.object({
        planoId: z.string().uuid(),
        status: z.enum(['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA', 'PRECISA_MAIS_TEMPO', 'all']).optional(),
        tipo: z.enum(['ESTUDO', 'QUESTOES', 'REVISAO', 'all']).optional(),
        dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        dataFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        incluirOmitidas: z.boolean().optional(),
        limit: z.number().int().min(1).max(100).optional(),
        offset: z.number().int().min(0).optional(),
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

      // Construir query
      let query = `SELECT * FROM metas_cronograma WHERE plano_id = ?`;
      const params: any[] = [input.planoId];

      if (!input.incluirOmitidas) {
        query += ` AND omitted = false`;
      }

      if (input.status && input.status !== 'all') {
        query += ` AND status = ?`;
        params.push(input.status);
      }

      if (input.tipo && input.tipo !== 'all') {
        query += ` AND tipo = ?`;
        params.push(input.tipo);
      }

      if (input.dataInicio) {
        query += ` AND scheduled_date >= ?`;
        params.push(input.dataInicio);
      }

      if (input.dataFim) {
        query += ` AND scheduled_date <= ?`;
        params.push(input.dataFim);
      }

      query += ` ORDER BY scheduled_date ASC, scheduled_order ASC`;

      if (input.limit) {
        query += ` LIMIT ?`;
        params.push(input.limit);
      }

      if (input.offset) {
        query += ` OFFSET ?`;
        params.push(input.offset);
      }

      const metas = await db.query(query, params);
      return metas;
    }),

  /**
   * Buscar meta por ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const db = await getRawDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const result = await db.query(
        `SELECT m.*, p.usuario_id 
         FROM metas_cronograma m
         JOIN metas_planos_estudo p ON m.plano_id = p.id
         WHERE m.id = ? AND p.usuario_id = ?`,
        [input.id, ctx.user.id]
      );

      if (result.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Meta não encontrada' });
      }

      return result[0];
    }),

  /**
   * Criar meta manual
   */
  create: protectedProcedure
    .input(
      z.object({
        planoId: z.string().uuid(),
        tipo: z.enum(['ESTUDO', 'QUESTOES', 'REVISAO']),
        ktreeDisciplinaId: z.string(),
        ktreeAssuntoId: z.string(),
        ktreeTopicoId: z.string().optional(),
        ktreeSubtopicoId: z.string().optional(),
        duracaoPlanejadaMin: z.number().int().min(15).max(180),
        orientacoesEstudo: z.string().optional(),
        scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        fixed: z.boolean().optional(),
      })
    )
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

      // Obter próximo número de meta
      const { base, suffix } = await getNextMetaNumber(db, input.planoId);
      const displayNumber = formatDisplayNumber(base, suffix);
      const orderKey = makeOrderKey(base, suffix);

      // Obter próxima ordem no dia
      const orderResult = await db.query(
        `SELECT COALESCE(MAX(scheduled_order), 0) + 1 as next_order
         FROM metas
         WHERE plano_id = ? AND scheduled_date = ?`,
        [input.planoId, input.scheduledDate]
      );
      const scheduledOrder = orderResult[0].next_order;

      const metaId = uuidv4();

      await db.query(
        `INSERT INTO metas_cronograma (
          id, plano_id, meta_number_base, meta_number_suffix, display_number, order_key,
          ktree_disciplina_id, ktree_assunto_id, ktree_topico_id, ktree_subtopico_id,
          tipo, duracao_planejada_min, orientacoes_estudo,
          scheduled_date, scheduled_order, status, fixed, auto_generated, criado_por_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          metaId,
          input.planoId,
          base,
          suffix,
          displayNumber,
          orderKey,
          input.ktreeDisciplinaId,
          input.ktreeAssuntoId,
          input.ktreeTopicoId || null,
          input.ktreeSubtopicoId || null,
          input.tipo,
          input.duracaoPlanejadaMin,
          input.orientacoesEstudo || null,
          input.scheduledDate,
          scheduledOrder,
          'PENDENTE',
          input.fixed || false,
          false,
          ctx.user.id,
        ]
      );

      const result = await db.query(`SELECT * FROM metas_cronograma WHERE id = ?`, [metaId]);
      return result[0];
    }),

  /**
   * Atualizar meta
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        duracaoPlanejadaMin: z.number().int().min(15).max(180).optional(),
        orientacoesEstudo: z.string().optional(),
        scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getRawDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Verificar se meta pertence ao usuário e não está concluída
      const meta = await db.query(
        `SELECT m.*, p.usuario_id 
         FROM metas_cronograma m
         JOIN metas_planos_estudo p ON m.plano_id = p.id
         WHERE m.id = ? AND p.usuario_id = ?`,
        [input.id, ctx.user.id]
      );

      if (meta.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Meta não encontrada' });
      }

      if (meta[0].status === 'CONCLUIDA') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Não é possível editar meta concluída' });
      }

      // Construir update dinâmico
      const updates: string[] = [];
      const params: any[] = [];

      if (input.duracaoPlanejadaMin !== undefined) {
        updates.push('duracao_planejada_min = ?');
        params.push(input.duracaoPlanejadaMin);
      }

      if (input.orientacoesEstudo !== undefined) {
        updates.push('orientacoes_estudo = ?');
        params.push(input.orientacoesEstudo);
      }

      if (input.scheduledDate !== undefined) {
        updates.push('scheduled_date = ?');
        params.push(input.scheduledDate);
      }

      if (updates.length === 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Nenhum campo para atualizar' });
      }

      updates.push('atualizado_em = NOW()');
      params.push(input.id);

      await db.query(
        `UPDATE metas_cronograma SET ${updates.join(', ')} WHERE id = ?`,
        params
      );

      const result = await db.query(`SELECT * FROM metas_cronograma WHERE id = ?`, [input.id]);
      return result[0];
    }),

  /**
   * Concluir meta
   */
  complete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        duracaoRealSec: z.number().int().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getRawDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Verificar se meta pertence ao usuário
      const meta = await db.query(
        `SELECT m.*, p.usuario_id 
         FROM metas_cronograma m
         JOIN metas_planos_estudo p ON m.plano_id = p.id
         WHERE m.id = ? AND p.usuario_id = ?`,
        [input.id, ctx.user.id]
      );

      if (meta.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Meta não encontrada' });
      }

      if (meta[0].status === 'CONCLUIDA') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Meta já está concluída' });
      }

      // Marcar como concluída
      await db.query(
        `UPDATE metas_cronograma 
         SET status = 'CONCLUIDA', duracao_real_sec = ?, concluded_at_utc = NOW(), atualizado_em = NOW()
         WHERE id = ?`,
        [input.duracaoRealSec, input.id]
      );

      // Se é meta de ESTUDO, criar ciclo de revisão
      if (meta[0].tipo === 'ESTUDO') {
        const temRevisoes = await hasScheduledReviews(db, input.id);
        
        if (!temRevisoes) {
          await scheduleReviewCycle(db, meta[0], ctx.user.id);
        }
      }

      // Marcar materiais vinculados como "vistos"
      const materiaisVinculados = await db.query(
        `SELECT material_id FROM metas_cronograma_materiais WHERE meta_id = ?`,
        [input.id]
      );

      for (const vinculo of materiaisVinculados) {
        // Verificar se já existe registro de visualização
        const existing = await db.query(
          `SELECT id FROM materialViews WHERE materialId = ? AND userId = ?`,
          [vinculo.material_id, ctx.user.id]
        );

        if (existing.length === 0) {
          // Criar registro de visualização
          await db.query(
            `INSERT INTO materialViews (materialId, userId, viewedAt)
             VALUES (?, ?, NOW())`,
            [vinculo.material_id, ctx.user.id]
          );

          // Incrementar contador de visualizações do material
          await db.query(
            `UPDATE materials SET viewCount = viewCount + 1 WHERE id = ?`,
            [vinculo.material_id]
          );
        }
      }

      const result = await db.query(`SELECT * FROM metas_cronograma WHERE id = ?`, [input.id]);
      return result[0];
    }),

  /**
   * Solicitar mais tempo (cria meta continuação)
   */
  needMoreTime: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        duracaoGastaSec: z.number().int().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getRawDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Buscar meta original
      const meta = await db.query(
        `SELECT m.*, p.usuario_id, p.horas_por_dia, p.dias_disponiveis_bitmask
         FROM metas_cronograma m
         JOIN metas_planos_estudo p ON m.plano_id = p.id
         WHERE m.id = ? AND p.usuario_id = ?`,
        [input.id, ctx.user.id]
      );

      if (meta.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Meta não encontrada' });
      }

      if (meta[0].status === 'CONCLUIDA') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Meta já está concluída' });
      }

      // Marcar original como PRECISA_MAIS_TEMPO
      await db.query(
        `UPDATE metas_cronograma 
         SET status = 'PRECISA_MAIS_TEMPO', duracao_real_sec = ?, atualizado_em = NOW()
         WHERE id = ?`,
        [input.duracaoGastaSec, input.id]
      );

      // Criar meta continuação (MESMO número, próximo dia disponível)
      const continuacaoId = uuidv4();
      
      // Calcular próximo dia disponível (amanhã ou próximo dia da semana)
      const hoje = new Date();
      const amanha = new Date(hoje);
      amanha.setDate(amanha.getDate() + 1);
      const scheduledDate = amanha.toISOString().split('T')[0];

      await db.query(
        `INSERT INTO metas_cronograma (
          id, plano_id, meta_number_base, meta_number_suffix, display_number, order_key,
          ktree_disciplina_id, ktree_assunto_id, ktree_topico_id, ktree_subtopico_id,
          tipo, duracao_planejada_min, orientacoes_estudo,
          scheduled_date, scheduled_order, status, parent_meta_id, auto_generated, criado_por_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          continuacaoId,
          meta[0].plano_id,
          meta[0].meta_number_base,
          meta[0].meta_number_suffix,
          meta[0].display_number, // MESMO número
          meta[0].order_key,
          meta[0].ktree_disciplina_id,
          meta[0].ktree_assunto_id,
          meta[0].ktree_topico_id,
          meta[0].ktree_subtopico_id,
          meta[0].tipo,
          meta[0].duracao_planejada_min,
          meta[0].orientacoes_estudo,
          scheduledDate,
          1, // Será ajustado pela redistribuição
          'PENDENTE',
          input.id,
          true,
          ctx.user.id,
        ]
      );

      // Redistribuir plano
      await redistributePlan(db, meta[0].plano_id);

      const original = await db.query(`SELECT * FROM metas_cronograma WHERE id = ?`, [input.id]);
      const continuacao = await db.query(`SELECT * FROM metas_cronograma WHERE id = ?`, [continuacaoId]);

      return {
        original: original[0],
        continuacao: continuacao[0],
      };
    }),

  /**
   * Omitir meta
   */
  omit: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        motivo: z.string().min(3).max(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getRawDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Verificar se meta pertence ao usuário
      const meta = await db.query(
        `SELECT m.*, p.usuario_id 
         FROM metas_cronograma m
         JOIN metas_planos_estudo p ON m.plano_id = p.id
         WHERE m.id = ? AND p.usuario_id = ?`,
        [input.id, ctx.user.id]
      );

      if (meta.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Meta não encontrada' });
      }

      if (meta[0].status === 'CONCLUIDA') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Não é possível omitir meta concluída' });
      }

      // Marcar como omitida
      await db.query(
        `UPDATE metas_cronograma 
         SET omitted = true, omission_reason = ?, atualizado_em = NOW()
         WHERE id = ?`,
        [input.motivo, input.id]
      );

      // Redistribuir plano
      await redistributePlan(db, meta[0].plano_id);

      const result = await db.query(`SELECT * FROM metas_cronograma WHERE id = ?`, [input.id]);
      return result[0];
    }),

  /**
   * Restaurar meta omitida
   */
  restore: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getRawDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Verificar se meta pertence ao usuário
      const meta = await db.query(
        `SELECT m.*, p.usuario_id 
         FROM metas_cronograma m
         JOIN metas_planos_estudo p ON m.plano_id = p.id
         WHERE m.id = ? AND p.usuario_id = ?`,
        [input.id, ctx.user.id]
      );

      if (meta.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Meta não encontrada' });
      }

      if (!meta[0].omitted) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Meta não está omitida' });
      }

      // Restaurar
      await db.query(
        `UPDATE metas_cronograma 
         SET omitted = false, omission_reason = NULL, atualizado_em = NOW()
         WHERE id = ?`,
        [input.id]
      );

      // Redistribuir plano
      await redistributePlan(db, meta[0].plano_id);

      const result = await db.query(`SELECT * FROM metas_cronograma WHERE id = ?`, [input.id]);
      return result[0];
    }),

  // ========================================================================
  // INTEGRAÇÃO COM MATERIAIS
  // ========================================================================

  /**
   * Vincular material à meta
   */
  vincularMaterial: protectedProcedure
    .input(
      z.object({
        metaId: z.string().uuid(),
        materialId: z.number().int(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getRawDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Verificar se meta pertence ao usuário
      const meta = await db.query(
        `SELECT m.*, p.usuario_id 
         FROM metas_cronograma m
         JOIN metas_planos_estudo p ON m.plano_id = p.id
         WHERE m.id = ? AND p.usuario_id = ?`,
        [input.metaId, ctx.user.id]
      );

      if (meta.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Meta não encontrada' });
      }

      // Verificar se material existe
      const material = await db.query(
        `SELECT id FROM materials WHERE id = ?`,
        [input.materialId]
      );

      if (material.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Material não encontrado' });
      }

      // Verificar se já existe vínculo
      const existing = await db.query(
        `SELECT id FROM metas_cronograma_materiais WHERE meta_id = ? AND material_id = ?`,
        [input.metaId, input.materialId]
      );

      if (existing.length > 0) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Material já vinculado a esta meta' });
      }

      // Criar vínculo
      const vinculoId = uuidv4();
      await db.query(
        `INSERT INTO metas_cronograma_materiais (id, meta_id, material_id, criado_em)
         VALUES (?, ?, ?, NOW())`,
        [vinculoId, input.metaId, input.materialId]
      );

      return { success: true, id: vinculoId };
    }),

  /**
   * Desvincular material da meta
   */
  desvincularMaterial: protectedProcedure
    .input(
      z.object({
        metaId: z.string().uuid(),
        materialId: z.number().int(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getRawDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Verificar se meta pertence ao usuário
      const meta = await db.query(
        `SELECT m.*, p.usuario_id 
         FROM metas_cronograma m
         JOIN metas_planos_estudo p ON m.plano_id = p.id
         WHERE m.id = ? AND p.usuario_id = ?`,
        [input.metaId, ctx.user.id]
      );

      if (meta.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Meta não encontrada' });
      }

      // Deletar vínculo
      await db.query(
        `DELETE FROM metas_cronograma_materiais WHERE meta_id = ? AND material_id = ?`,
        [input.metaId, input.materialId]
      );

      return { success: true };
    }),

  /**
   * Listar materiais vinculados à meta
   */
  listarMateriaisVinculados: protectedProcedure
    .input(
      z.object({
        metaId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getRawDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Verificar se meta pertence ao usuário
      const meta = await db.query(
        `SELECT m.*, p.usuario_id 
         FROM metas_cronograma m
         JOIN metas_planos_estudo p ON m.plano_id = p.id
         WHERE m.id = ? AND p.usuario_id = ?`,
        [input.metaId, ctx.user.id]
      );

      if (meta.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Meta não encontrada' });
      }

      // Buscar materiais vinculados
      const materiais = await db.query(
        `SELECT 
           m.id,
           m.title,
           m.description,
           m.thumbnailUrl,
           m.category,
           m.type,
           m.isPaid,
           m.viewCount,
           m.rating,
           mm.criado_em as vinculadoEm
         FROM metas_cronograma_materiais mm
         JOIN materials m ON mm.material_id = m.id
         WHERE mm.meta_id = ?
         ORDER BY mm.criado_em DESC`,
        [input.metaId]
      );

      return materiais;
    }),

  /**
   * Verificar conflitos de horário e sugerir próximo slot
   */
  verificarConflitos: protectedProcedure
    .input(
      z.object({
        planoId: z.string(),
        date: z.string(),
        duracaoMin: z.number().min(15).max(240),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getRawDb();
      if (!db) throw new Error("Database not available");

      const [plano] = await db
        .select()
        .from(metasPlanos)
        .where(
          and(
            eq(metasPlanos.id, input.planoId),
            eq(metasPlanos.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!plano) throw new Error("Plano não encontrado");

      const metasDoDia = await db
        .select()
        .from(metasCronograma)
        .where(
          and(
            eq(metasCronograma.planoId, input.planoId),
            eq(metasCronograma.scheduledDate, input.date),
            eq(metasCronograma.status, "PENDENTE")
          )
        )
        .orderBy(metasCronograma.scheduledOrder);

      const minutosUsados = metasDoDia.reduce(
        (acc, m) => acc + (m.duracaoPlanejadaMin || 0),
        0
      );
      const capacidadeMin = (plano.horasPorDia || 0) * 60;
      const minutosRestantes = capacidadeMin - minutosUsados;
      const temConflito = input.duracaoMin > minutosRestantes;

      let proximaDataDisponivel: string | null = null;
      if (temConflito) {
        const dataAtual = new Date(input.date);
        const diasDisponiveis = plano.diasDisponiveis || 127;

        for (let i = 1; i <= 30; i++) {
          const dataCandidata = new Date(dataAtual);
          dataCandidata.setDate(dataCandidata.getDate() + i);
          const diaSemana = dataCandidata.getDay();

          if ((diasDisponiveis & (1 << diaSemana)) === 0) continue;

          const dataCandidataStr = dataCandidata.toISOString().split("T")[0];
          const metasCandidata = await db
            .select()
            .from(metasCronograma)
            .where(
              and(
                eq(metasCronograma.planoId, input.planoId),
                eq(metasCronograma.scheduledDate, dataCandidataStr),
                eq(metasCronograma.status, "PENDENTE")
              )
            );

          const minutosUsadosCandidata = metasCandidata.reduce(
            (acc, m) => acc + (m.duracaoPlanejadaMin || 0),
            0
          );
          const minutosRestantesCandidata = capacidadeMin - minutosUsadosCandidata;

          if (input.duracaoMin <= minutosRestantesCandidata) {
            proximaDataDisponivel = dataCandidataStr;
            break;
          }
        }
      }

      return {
        temConflito,
        minutosUsados,
        minutosRestantes,
        capacidadeMin,
        proximaDataDisponivel,
        metasNoDia: metasDoDia.length,
      };
    }),

  /**
   * Buscar materiais disponíveis filtrados por KTree
   */
  buscarMateriaisDisponiveis: protectedProcedure
    .input(
      z.object({
        metaId: z.string().uuid(),
        limit: z.number().int().min(1).max(50).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getRawDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Buscar meta com KTree
      const meta = await db.query(
        `SELECT m.*, p.usuario_id 
         FROM metas_cronograma m
         JOIN metas_planos_estudo p ON m.plano_id = p.id
         WHERE m.id = ? AND p.usuario_id = ?`,
        [input.metaId, ctx.user.id]
      );

      if (meta.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Meta não encontrada' });
      }

      const metaData = meta[0];

      // Buscar materiais que correspondem ao KTree da meta e que ainda não estão vinculados
      const materiais = await db.query(
        `SELECT DISTINCT
           m.id,
           m.title,
           m.description,
           m.thumbnailUrl,
           m.category,
           m.type,
           m.isPaid,
           m.viewCount,
           m.rating
         FROM materials m
         JOIN materialLinks ml ON m.id = ml.materialId
         WHERE ml.disciplinaId = ?
           AND ml.assuntoId = ?
           AND m.isAvailable = true
           AND m.id NOT IN (
             SELECT material_id FROM metas_cronograma_materiais WHERE meta_id = ?
           )
         ORDER BY m.isFeatured DESC, m.rating DESC, m.viewCount DESC
         LIMIT ?`,
        [
          metaData.ktree_disciplina_id,
          metaData.ktree_assunto_id,
          input.metaId,
          input.limit || 20,
        ]
      );

      return materiais;
    }),
});
