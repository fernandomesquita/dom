import { z } from 'zod';
import { staffProcedure, adminRoleProcedure, router } from '../../_core/trpc';
import { getDb } from '../../db';
import { TRPCError } from '@trpc/server';
import { logAuditAction, AuditAction, TargetType } from '../../_core/audit';

/**
 * Router de Gestão de Metas (Admin)
 * Versão: v1
 */

// Validação de formato de duração (ex: "1h30min", "45min", "2h")
const durationRegex = /^(\d+h)?(\d+min)?$/;

const goalCreateSchema = z.object({
  planoId: z.string().uuid(),
  titulo: z.string().min(3).max(200),
  descricao: z.string().optional(),
  tipo: z.enum(['ESTUDO', 'QUESTOES', 'REVISAO']),
  duracao: z.string().regex(durationRegex, 'Formato inválido. Use: "1h30min" ou "45min"'),
  disciplinaId: z.string().uuid().optional(),
  assuntoId: z.string().uuid().optional(),
  topicoId: z.string().uuid().optional(),
  orderIndex: z.number().int().min(0).optional(),
});

const goalUpdateSchema = goalCreateSchema.partial().omit({ planoId: true });

export const goalsRouter_v1 = router({
  /**
   * Listar metas com filtros
   */
  list: staffProcedure
    .input(
      z.object({
        planoId: z.string().uuid().optional(),
        tipo: z.enum(['ESTUDO', 'QUESTOES', 'REVISAO']).optional(),
        status: z.enum(['PENDENTE', 'CONCLUIDA', 'ATRASADA']).optional(),
        search: z.string().optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
        sortBy: z.enum(['titulo', 'criado_em', 'order_index']).default('order_index'),
        sortOrder: z.enum(['asc', 'desc']).default('asc'),
      })
    )
    .query(async ({ input, ctx }) => {
      const startTime = Date.now();
      const db = await getDb();

      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Banco de dados não disponível',
        });
      }

      const offset = (input.page - 1) * input.limit;

      // Build WHERE clause
      const whereClauses: string[] = [];
      const params: any[] = [];

      if (input.planoId) {
        whereClauses.push('m.plano_id = ?');
        params.push(input.planoId);
      }

      if (input.tipo) {
        whereClauses.push('m.tipo = ?');
        params.push(input.tipo);
      }

      if (input.status) {
        whereClauses.push('m.status = ?');
        params.push(input.status);
      }

      if (input.search) {
        whereClauses.push('(m.titulo LIKE ? OR m.descricao LIKE ?)');
        params.push(`%${input.search}%`, `%${input.search}%`);
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      // Count total
      const [countResult] = await db.execute(
        `SELECT COUNT(*) as total FROM metas m ${whereClause}`,
        params
      );
      const total = (countResult as any)[0].total;

      // Fetch goals
      const query = `
        SELECT 
          m.*,
          p.titulo as plano_titulo,
          d.nome as disciplina_nome,
          a.nome as assunto_nome,
          t.nome as topico_nome
        FROM metas m
        LEFT JOIN metas_planos_estudo p ON m.plano_id = p.id
        LEFT JOIN disciplinas d ON m.disciplina_id = d.id
        LEFT JOIN assuntos a ON m.assunto_id = a.id
        LEFT JOIN topicos t ON m.topico_id = t.id
        ${whereClause}
        ORDER BY m.${input.sortBy} ${input.sortOrder}
        LIMIT ? OFFSET ?
      `;

      const [goals] = await db.execute(query, [...params, input.limit, offset]);

      const duration = Date.now() - startTime;
      ctx.logger.info({
        action: 'LIST_GOALS',
        userId: ctx.user?.id,
        duration_ms: duration,
        filters: input,
        total,
      });

      return {
        goals,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          totalPages: Math.ceil(total / input.limit),
        },
      };
    }),

  /**
   * Obter meta por ID
   */
  getById: staffProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();

      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Banco de dados não disponível',
        });
      }

      const query = `
        SELECT 
          m.*,
          p.titulo as plano_titulo,
          d.nome as disciplina_nome,
          a.nome as assunto_nome,
          t.nome as topico_nome
        FROM metas m
        LEFT JOIN metas_planos_estudo p ON m.plano_id = p.id
        LEFT JOIN disciplinas d ON m.disciplina_id = d.id
        LEFT JOIN assuntos a ON m.assunto_id = a.id
        LEFT JOIN topicos t ON m.topico_id = t.id
        WHERE m.id = ?
      `;

      const [results] = await db.execute(query, [input.id]);
      const goals = results as any[];

      if (goals.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Meta não encontrada',
        });
      }

      ctx.logger.info({
        action: 'GET_GOAL',
        userId: ctx.user?.id,
        goalId: input.id,
      });

      return goals[0];
    }),

  /**
   * Criar nova meta
   */
  create: staffProcedure
    .input(goalCreateSchema)
    .mutation(async ({ input, ctx }) => {
      const startTime = Date.now();
      const db = await getDb();

      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Banco de dados não disponível',
        });
      }

      // Verificar se plano existe
      const [planos] = await db.execute(
        'SELECT id FROM metas_planos_estudo WHERE id = ?',
        [input.planoId]
      );

      if ((planos as any[]).length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plano de estudo não encontrado',
        });
      }

      // Determinar order_index se não fornecido
      let orderIndex = input.orderIndex;
      if (orderIndex === undefined) {
        const [maxOrder] = await db.execute(
          'SELECT COALESCE(MAX(order_index), -1) + 1 as next_order FROM metas WHERE plano_id = ?',
          [input.planoId]
        );
        orderIndex = (maxOrder as any)[0].next_order;
      }

      // Inserir meta
      const metaId = crypto.randomUUID();
      await db.execute(
        `INSERT INTO metas (
          id, plano_id, titulo, descricao, tipo, duracao, 
          disciplina_id, assunto_id, topico_id, order_index, 
          status, criado_em
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDENTE', NOW())`,
        [
          metaId,
          input.planoId,
          input.titulo,
          input.descricao || null,
          input.tipo,
          input.duracao,
          input.disciplinaId || null,
          input.assuntoId || null,
          input.topicoId || null,
          orderIndex,
        ]
      );

      // Auditoria
      await logAuditAction({
        actorId: ctx.user!.id,
        actorRole: ctx.user!.role,
        action: AuditAction.CREATE_GOAL,
        targetType: TargetType.GOAL,
        targetId: metaId,
        payload: input,
        req: ctx.req,
      });

      const duration = Date.now() - startTime;
      ctx.logger.info({
        action: 'CREATE_GOAL',
        userId: ctx.user?.id,
        goalId: metaId,
        duration_ms: duration,
      });

      return { id: metaId };
    }),

  /**
   * Atualizar meta
   */
  update: staffProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: goalUpdateSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const startTime = Date.now();
      const db = await getDb();

      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Banco de dados não disponível',
        });
      }

      // Verificar se meta existe
      const [metas] = await db.execute('SELECT id FROM metas WHERE id = ?', [input.id]);

      if ((metas as any[]).length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Meta não encontrada',
        });
      }

      // Build UPDATE clause
      const updates: string[] = [];
      const params: any[] = [];

      if (input.data.titulo !== undefined) {
        updates.push('titulo = ?');
        params.push(input.data.titulo);
      }

      if (input.data.descricao !== undefined) {
        updates.push('descricao = ?');
        params.push(input.data.descricao);
      }

      if (input.data.tipo !== undefined) {
        updates.push('tipo = ?');
        params.push(input.data.tipo);
      }

      if (input.data.duracao !== undefined) {
        updates.push('duracao = ?');
        params.push(input.data.duracao);
      }

      if (input.data.disciplinaId !== undefined) {
        updates.push('disciplina_id = ?');
        params.push(input.data.disciplinaId);
      }

      if (input.data.assuntoId !== undefined) {
        updates.push('assunto_id = ?');
        params.push(input.data.assuntoId);
      }

      if (input.data.topicoId !== undefined) {
        updates.push('topico_id = ?');
        params.push(input.data.topicoId);
      }

      if (input.data.orderIndex !== undefined) {
        updates.push('order_index = ?');
        params.push(input.data.orderIndex);
      }

      if (updates.length === 0) {
        return { success: true };
      }

      updates.push('atualizado_em = NOW()');
      params.push(input.id);

      await db.execute(
        `UPDATE metas SET ${updates.join(', ')} WHERE id = ?`,
        params
      );

      // Auditoria
      await logAuditAction({
        actorId: ctx.user!.id,
        actorRole: ctx.user!.role,
        action: AuditAction.UPDATE_GOAL,
        targetType: TargetType.GOAL,
        targetId: input.id,
        payload: input.data,
        req: ctx.req,
      });

      const duration = Date.now() - startTime;
      ctx.logger.info({
        action: 'UPDATE_GOAL',
        userId: ctx.user?.id,
        goalId: input.id,
        duration_ms: duration,
      });

      return { success: true };
    }),

  /**
   * Deletar meta (soft delete)
   */
  delete: adminRoleProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();

      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Banco de dados não disponível',
        });
      }

      // Verificar se há conclusões de alunos
      const [conclusoes] = await db.execute(
        'SELECT COUNT(*) as count FROM metas_conclusoes WHERE meta_id = ?',
        [input.id]
      );

      if ((conclusoes as any)[0].count > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Não é possível deletar meta com conclusões de alunos',
        });
      }

      // Soft delete (marcar como concluída)
      await db.execute(
        "UPDATE metas SET status = 'CONCLUIDA', atualizado_em = NOW() WHERE id = ?",
        [input.id]
      );

      // Auditoria
      await logAuditAction({
        actorId: ctx.user!.id,
        actorRole: ctx.user!.role,
        action: AuditAction.DELETE_GOAL,
        targetType: TargetType.GOAL,
        targetId: input.id,
        payload: {},
        req: ctx.req,
      });

      ctx.logger.info({
        action: 'DELETE_GOAL',
        userId: ctx.user?.id,
        goalId: input.id,
      });

      return { success: true };
    }),

  /**
   * Reordenar meta
   */
  reorder: staffProcedure
    .input(
      z.object({
        goalId: z.string().uuid(),
        newOrderIndex: z.number().int().min(0),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();

      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Banco de dados não disponível',
        });
      }

      // Obter meta e plano_id
      const [metas] = await db.execute(
        'SELECT id, plano_id, order_index FROM metas WHERE id = ?',
        [input.goalId]
      );

      if ((metas as any[]).length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Meta não encontrada',
        });
      }

      const meta = (metas as any)[0];
      const oldIndex = meta.order_index;
      const newIndex = input.newOrderIndex;

      if (oldIndex === newIndex) {
        return { success: true };
      }

      // Reordenar metas do mesmo plano
      if (oldIndex < newIndex) {
        // Movendo para baixo: decrementar order_index das metas entre old e new
        await db.execute(
          `UPDATE metas 
           SET order_index = order_index - 1 
           WHERE plano_id = ? AND order_index > ? AND order_index <= ?`,
          [meta.plano_id, oldIndex, newIndex]
        );
      } else {
        // Movendo para cima: incrementar order_index das metas entre new e old
        await db.execute(
          `UPDATE metas 
           SET order_index = order_index + 1 
           WHERE plano_id = ? AND order_index >= ? AND order_index < ?`,
          [meta.plano_id, newIndex, oldIndex]
        );
      }

      // Atualizar order_index da meta movida
      await db.execute(
        'UPDATE metas SET order_index = ?, atualizado_em = NOW() WHERE id = ?',
        [newIndex, input.goalId]
      );

      // Auditoria
      await logAuditAction({
        actorId: ctx.user!.id,
        actorRole: ctx.user!.role,
        action: AuditAction.REORDER_GOALS,
        targetType: TargetType.GOAL,
        targetId: input.goalId,
        payload: { oldIndex, newIndex },
        req: ctx.req,
      });

      ctx.logger.info({
        action: 'REORDER_GOAL',
        userId: ctx.user?.id,
        goalId: input.goalId,
        oldIndex,
        newIndex,
      });

      return { success: true };
    }),

  /**
   * Clonar meta
   */
  clone: staffProcedure
    .input(z.object({ goalId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();

      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Banco de dados não disponível',
        });
      }

      // Obter meta original
      const [metas] = await db.execute(
        'SELECT * FROM metas WHERE id = ?',
        [input.goalId]
      );

      if ((metas as any[]).length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Meta não encontrada',
        });
      }

      const original = (metas as any)[0];

      // Determinar novo order_index
      const [maxOrder] = await db.execute(
        'SELECT COALESCE(MAX(order_index), -1) + 1 as next_order FROM metas WHERE plano_id = ?',
        [original.plano_id]
      );
      const orderIndex = (maxOrder as any)[0].next_order;

      // Criar cópia
      const novoId = crypto.randomUUID();
      await db.execute(
        `INSERT INTO metas (
          id, plano_id, titulo, descricao, tipo, duracao, 
          disciplina_id, assunto_id, topico_id, order_index, 
          status, criado_em
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDENTE', NOW())`,
        [
          novoId,
          original.plano_id,
          `${original.titulo} (Cópia)`,
          original.descricao,
          original.tipo,
          original.duracao,
          original.disciplina_id,
          original.assunto_id,
          original.topico_id,
          orderIndex,
        ]
      );

      // Auditoria
      await logAuditAction({
        actorId: ctx.user!.id,
        actorRole: ctx.user!.role,
        action: AuditAction.CLONE_GOAL,
        targetType: TargetType.GOAL,
        targetId: novoId,
        payload: { originalId: input.goalId },
        req: ctx.req,
      });

      ctx.logger.info({
        action: 'CLONE_GOAL',
        userId: ctx.user?.id,
        originalId: input.goalId,
        newId: novoId,
      });

      return { id: novoId };
    }),

  /**
   * Batch upload via Excel
   */
  batchUpload: staffProcedure
    .input(
      z.object({
        planoId: z.string().uuid(),
        fileBase64: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();

      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Banco de dados não disponível',
        });
      }

      // Verificar se plano existe
      const [planos] = await db.execute(
        'SELECT id FROM metas_planos_estudo WHERE id = ?',
        [input.planoId]
      );

      if ((planos as any[]).length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plano de estudo não encontrado',
        });
      }

      // Parse Excel
      const xlsx = await import('xlsx');
      const buffer = Buffer.from(input.fileBase64, 'base64');
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(sheet) as any[];

      const success: string[] = [];
      const errors: string[] = [];

      // Obter próximo order_index
      const [maxOrder] = await db.execute(
        'SELECT COALESCE(MAX(order_index), -1) as max_order FROM metas WHERE plano_id = ?',
        [input.planoId]
      );
      let orderIndex = (maxOrder as any)[0].max_order + 1;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNum = i + 2; // +2 porque linha 1 é header e Excel começa em 1

        try {
          // Validar campos obrigatórios
          if (!row.Titulo || !row.Tipo || !row.Duracao) {
            errors.push(`Linha ${rowNum}: Campos obrigatórios faltando (Titulo, Tipo, Duracao)`);
            continue;
          }

          // Validar tipo
          const tipo = row.Tipo.toUpperCase();
          if (!['ESTUDO', 'QUESTOES', 'REVISAO'].includes(tipo)) {
            errors.push(`Linha ${rowNum}: Tipo inválido (${row.Tipo}). Use: ESTUDO, QUESTOES ou REVISAO`);
            continue;
          }

          // Validar formato de duração
          if (!durationRegex.test(row.Duracao)) {
            errors.push(`Linha ${rowNum}: Formato de duração inválido (${row.Duracao}). Use: "1h30min" ou "45min"`);
            continue;
          }

          // Inserir meta
          const metaId = crypto.randomUUID();
          await db.execute(
            `INSERT INTO metas (
              id, plano_id, titulo, descricao, tipo, duracao, 
              order_index, status, criado_em
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDENTE', NOW())`,
            [
              metaId,
              input.planoId,
              row.Titulo,
              row.Descricao || null,
              tipo,
              row.Duracao,
              orderIndex++,
            ]
          );

          success.push(metaId);
        } catch (error: any) {
          errors.push(`Linha ${rowNum}: ${error.message}`);
        }
      }

      // Auditoria
      await logAuditAction({
        actorId: ctx.user!.id,
        actorRole: ctx.user!.role,
        action: AuditAction.BATCH_UPLOAD_GOALS,
        targetType: TargetType.GOAL,
        targetId: input.planoId,
        payload: { totalRows: rows.length, success: success.length, errors: errors.length },
        req: ctx.req,
      });

      ctx.logger.info({
        action: 'BATCH_UPLOAD_GOALS',
        userId: ctx.user?.id,
        planoId: input.planoId,
        totalRows: rows.length,
        success: success.length,
        errors: errors.length,
      });

      return {
        success: success.length,
        errors,
      };
    }),

  /**
   * Estatísticas gerais de metas
   */
  stats: staffProcedure.query(async ({ ctx }) => {
    const db = await getDb();

    if (!db) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Banco de dados não disponível',
      });
    }

    const [stats] = await db.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'PENDENTE' THEN 1 ELSE 0 END) as pendentes,
        SUM(CASE WHEN status = 'CONCLUIDA' THEN 1 ELSE 0 END) as concluidas,
        SUM(CASE WHEN status = 'ATRASADA' THEN 1 ELSE 0 END) as atrasadas,
        SUM(CASE WHEN tipo = 'ESTUDO' THEN 1 ELSE 0 END) as tipo_estudo,
        SUM(CASE WHEN tipo = 'QUESTOES' THEN 1 ELSE 0 END) as tipo_questoes,
        SUM(CASE WHEN tipo = 'REVISAO' THEN 1 ELSE 0 END) as tipo_revisao,
        COUNT(DISTINCT plano_id) as planos_com_metas
      FROM metas
    `);

    ctx.logger.info({
      action: 'GET_GOAL_STATS',
      userId: ctx.user?.id,
    });

    return (stats as any)[0];
  }),
});
