/**
 * Router de Batch Import de Metas
 * Importação em massa de metas via Excel
 */

import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { createHash } from 'crypto';
import {
  makeOrderKey,
  formatDisplayNumber,
  getNextMetaNumber,
} from '../helpers/metasNumeracao';

/**
 * Schema de validação para linha do Excel
 */
const MetaImportSchema = z.object({
  tipo: z.enum(['ESTUDO', 'QUESTOES', 'REVISAO']),
  ktreeDisciplinaId: z.string().min(1),
  ktreeAssuntoId: z.string().min(1),
  ktreeTopicoId: z.string().optional(),
  ktreeSubtopicoId: z.string().optional(),
  duracaoPlanejadaMin: z.number().int().min(15).max(180),
  orientacoesEstudo: z.string().optional(),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fixed: z.boolean().optional(),
});

type MetaImport = z.infer<typeof MetaImportSchema>;

/**
 * Gerar hash único para linha (idempotência)
 */
function generateRowHash(planoId: string, meta: MetaImport): string {
  const data = JSON.stringify({
    planoId,
    tipo: meta.tipo,
    ktreeDisciplinaId: meta.ktreeDisciplinaId,
    ktreeAssuntoId: meta.ktreeAssuntoId,
    ktreeTopicoId: meta.ktreeTopicoId || '',
    ktreeSubtopicoId: meta.ktreeSubtopicoId || '',
    scheduledDate: meta.scheduledDate,
  });
  return createHash('sha256').update(data).digest('hex');
}

export const metasBatchImportRouter = router({
  /**
   * Validar arquivo antes de importar
   */
  validate: protectedProcedure
    .input(
      z.object({
        planoId: z.string().uuid(),
        metas: z.array(MetaImportSchema),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Verificar se plano pertence ao usuário
      const plano = await db.query(
        `SELECT * FROM metas_planos_estudo WHERE id = ? AND usuario_id = ?`,
        [input.planoId, ctx.user.id]
      );

      if (plano.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Plano não encontrado' });
      }

      const errors: Array<{ row: number; field: string; message: string }> = [];
      const warnings: Array<{ row: number; message: string }> = [];

      // Validar cada linha
      for (let i = 0; i < input.metas.length; i++) {
        const meta = input.metas[i];
        const rowNumber = i + 2; // +2 porque Excel começa em 1 e tem header

        // Validar KTree (disciplina existe?)
        const disciplina = await db.query(
          `SELECT id FROM disciplinas WHERE codigo = ?`,
          [meta.ktreeDisciplinaId]
        );

        if (disciplina.length === 0) {
          errors.push({
            row: rowNumber,
            field: 'ktreeDisciplinaId',
            message: `Disciplina "${meta.ktreeDisciplinaId}" não encontrada`,
          });
        }

        // Validar assunto
        const assunto = await db.query(
          `SELECT id FROM assuntos WHERE codigo = ? AND disciplina_id = ?`,
          [meta.ktreeAssuntoId, disciplina[0]?.id]
        );

        if (assunto.length === 0) {
          errors.push({
            row: rowNumber,
            field: 'ktreeAssuntoId',
            message: `Assunto "${meta.ktreeAssuntoId}" não encontrado na disciplina`,
          });
        }

        // Validar tópico (se fornecido)
        if (meta.ktreeTopicoId) {
          const topico = await db.query(
            `SELECT id FROM topicos WHERE codigo = ? AND assunto_id = ?`,
            [meta.ktreeTopicoId, assunto[0]?.id]
          );

          if (topico.length === 0) {
            errors.push({
              row: rowNumber,
              field: 'ktreeTopicoId',
              message: `Tópico "${meta.ktreeTopicoId}" não encontrado no assunto`,
            });
          }
        }

        // Validar data (não pode ser no passado)
        const scheduledDate = new Date(meta.scheduledDate);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        if (scheduledDate < hoje) {
          warnings.push({
            row: rowNumber,
            message: `Data ${meta.scheduledDate} está no passado`,
          });
        }

        // Verificar duplicata (row_hash)
        const rowHash = generateRowHash(input.planoId, meta);
        const existing = await db.query(
          `SELECT id FROM metas_cronograma WHERE plano_id = ? AND row_hash = ?`,
          [input.planoId, rowHash]
        );

        if (existing.length > 0) {
          warnings.push({
            row: rowNumber,
            message: 'Meta duplicada (já existe no sistema)',
          });
        }
      }

      return {
        valid: errors.length === 0,
        totalRows: input.metas.length,
        errors,
        warnings,
      };
    }),

  /**
   * Importar metas em lote
   */
  import: protectedProcedure
    .input(
      z.object({
        planoId: z.string().uuid(),
        metas: z.array(MetaImportSchema),
        skipDuplicates: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Verificar se plano pertence ao usuário
      const plano = await db.query(
        `SELECT * FROM metas_planos_estudo WHERE id = ? AND usuario_id = ?`,
        [input.planoId, ctx.user.id]
      );

      if (plano.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Plano não encontrado' });
      }

      const results = {
        success: [] as number[],
        skipped: [] as number[],
        failed: [] as Array<{ row: number; error: string }>,
      };

      // Importar cada linha
      for (let i = 0; i < input.metas.length; i++) {
        const meta = input.metas[i];
        const rowNumber = i + 2;

        try {
          // Verificar duplicata
          const rowHash = generateRowHash(input.planoId, meta);
          const existing = await db.query(
            `SELECT id FROM metas_cronograma WHERE plano_id = ? AND row_hash = ?`,
            [input.planoId, rowHash]
          );

          if (existing.length > 0) {
            if (input.skipDuplicates) {
              results.skipped.push(rowNumber);
              continue;
            } else {
              throw new Error('Meta duplicada');
            }
          }

          // Buscar IDs reais do KTree
          const disciplina = await db.query(
            `SELECT id FROM disciplinas WHERE codigo = ?`,
            [meta.ktreeDisciplinaId]
          );

          if (disciplina.length === 0) {
            throw new Error(`Disciplina "${meta.ktreeDisciplinaId}" não encontrada`);
          }

          const assunto = await db.query(
            `SELECT id FROM assuntos WHERE codigo = ? AND disciplina_id = ?`,
            [meta.ktreeAssuntoId, disciplina[0].id]
          );

          if (assunto.length === 0) {
            throw new Error(`Assunto "${meta.ktreeAssuntoId}" não encontrado`);
          }

          let topicoId = null;
          if (meta.ktreeTopicoId) {
            const topico = await db.query(
              `SELECT id FROM topicos WHERE codigo = ? AND assunto_id = ?`,
              [meta.ktreeTopicoId, assunto[0].id]
            );

            if (topico.length === 0) {
              throw new Error(`Tópico "${meta.ktreeTopicoId}" não encontrado`);
            }

            topicoId = topico[0].id;
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
            [input.planoId, meta.scheduledDate]
          );
          const scheduledOrder = orderResult[0].next_order;

          const metaId = uuidv4();

          // Inserir meta
          await db.query(
            `INSERT INTO metas_cronograma (
              id, plano_id, meta_number_base, meta_number_suffix, display_number, order_key,
              ktree_disciplina_id, ktree_assunto_id, ktree_topico_id, ktree_subtopico_id,
              tipo, duracao_planejada_min, orientacoes_estudo,
              scheduled_date, scheduled_order, status, fixed, auto_generated, row_hash, criado_por_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              metaId,
              input.planoId,
              base,
              suffix,
              displayNumber,
              orderKey,
              disciplina[0].id,
              assunto[0].id,
              topicoId,
              meta.ktreeSubtopicoId || null,
              meta.tipo,
              meta.duracaoPlanejadaMin,
              meta.orientacoesEstudo || null,
              meta.scheduledDate,
              scheduledOrder,
              'PENDENTE',
              meta.fixed || false,
              true, // auto_generated = true para batch import
              rowHash,
              ctx.user.id,
            ]
          );

          results.success.push(rowNumber);
        } catch (error: any) {
          results.failed.push({
            row: rowNumber,
            error: error.message || 'Erro desconhecido',
          });
        }
      }

      return {
        totalRows: input.metas.length,
        imported: results.success.length,
        skipped: results.skipped.length,
        failed: results.failed.length,
        details: results,
      };
    }),

  /**
   * Baixar template Excel
   */
  getTemplate: protectedProcedure.query(async () => {
    // Retornar estrutura do template para o frontend gerar
    return {
      headers: [
        'tipo',
        'ktreeDisciplinaId',
        'ktreeAssuntoId',
        'ktreeTopicoId',
        'ktreeSubtopicoId',
        'duracaoPlanejadaMin',
        'orientacoesEstudo',
        'scheduledDate',
        'fixed',
      ],
      example: [
        {
          tipo: 'ESTUDO',
          ktreeDisciplinaId: 'DIR-CONST',
          ktreeAssuntoId: 'DIR-CONST-FUND',
          ktreeTopicoId: 'DIR-CONST-FUND-PRINC',
          ktreeSubtopicoId: '',
          duracaoPlanejadaMin: 60,
          orientacoesEstudo: 'Ler capítulo 1 do livro',
          scheduledDate: '2025-01-15',
          fixed: false,
        },
        {
          tipo: 'QUESTOES',
          ktreeDisciplinaId: 'DIR-CONST',
          ktreeAssuntoId: 'DIR-CONST-FUND',
          ktreeTopicoId: 'DIR-CONST-FUND-PRINC',
          ktreeSubtopicoId: '',
          duracaoPlanejadaMin: 30,
          orientacoesEstudo: 'Resolver 20 questões',
          scheduledDate: '2025-01-16',
          fixed: false,
        },
      ],
    };
  }),
});
