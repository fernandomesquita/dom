import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { adminRoleProcedure, publicProcedure, protectedProcedure, router } from "../../_core/trpc";
import { getDb } from "../../db";
import { notices, noticeReads } from "../../../drizzle/schema-notices";
import { eq, and, or, sql, desc, asc, like, gte, lte } from "drizzle-orm";
import { logAuditAction, AuditAction } from "../../_core/audit";
import { v4 as uuidv4 } from "uuid";

/**
 * Router de Avisos/Notificações - Versão 1
 * Gestão completa de avisos para o dashboard admin
 */

export const noticesRouter_v1 = router({
  /**
   * Listar avisos (admin)
   */
  list: adminRoleProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        tipo: z.enum(["INFORMATIVO", "IMPORTANTE", "URGENTE", "MANUTENCAO"]).optional(),
        publicado: z.boolean().optional(),
        rascunho: z.boolean().optional(),
        orderBy: z.enum(["created_at", "updated_at", "data_publicacao", "visualizacoes"]).default("created_at"),
        orderDir: z.enum(["asc", "desc"]).default("desc"),
      })
    )
    .query(async ({ input, ctx }) => {
      const startTime = Date.now();
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível" });

      const { page, limit, search, tipo, publicado, rascunho, orderBy, orderDir } = input;
      const offset = (page - 1) * limit;

      // Construir WHERE conditions
      const conditions = [];
      if (search) {
        conditions.push(
          or(
            like(notices.titulo, `%${search}%`),
            like(notices.conteudo, `%${search}%`)
          )
        );
      }
      if (tipo) conditions.push(eq(notices.tipo, tipo));
      if (publicado !== undefined) conditions.push(eq(notices.publicado, publicado));
      if (rascunho !== undefined) conditions.push(eq(notices.rascunho, rascunho));

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Ordenação
      const orderColumn = notices[orderBy];
      const orderFn = orderDir === "asc" ? asc : desc;

      // Query principal
      const results = await db
        .select()
        .from(notices)
        .where(whereClause)
        .orderBy(orderFn(orderColumn))
        .limit(limit)
        .offset(offset);

      // Contar total
      const [{ count }] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(notices)
        .where(whereClause);

      const duration = Date.now() - startTime;
      ctx.logger.info("notices.list", { duration_ms: duration, count: results.length });

      return {
        avisos: results,
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      };
    }),

  /**
   * Obter aviso por ID
   */
  getById: adminRoleProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const startTime = Date.now();
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível" });

      const [aviso] = await db.select().from(notices).where(eq(notices.id, input.id)).limit(1);

      if (!aviso) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Aviso não encontrado" });
      }

      const duration = Date.now() - startTime;
      ctx.logger.info("notices.getById", { duration_ms: duration, id: input.id });

      return aviso;
    }),

  /**
   * Criar aviso
   */
  create: adminRoleProcedure
    .input(
      z.object({
        titulo: z.string().min(3).max(255),
        conteudo: z.string().min(10),
        tipo: z.enum(["INFORMATIVO", "IMPORTANTE", "URGENTE", "MANUTENCAO"]).default("INFORMATIVO"),
        prioridade: z.number().min(0).max(10).default(0),
        destinatarios: z.enum(["TODOS", "PLANO_ESPECIFICO", "ROLE_ESPECIFICA", "USUARIOS_ESPECIFICOS"]).default("TODOS"),
        planoId: z.string().uuid().optional(),
        roleDestino: z.enum(["ALUNO", "PROFESSOR", "MENTOR", "ADMINISTRATIVO", "MASTER"]).optional(),
        usuariosIds: z.array(z.string().uuid()).optional(),
        agendado: z.boolean().default(false),
        dataPublicacao: z.string().datetime().optional(),
        dataExpiracao: z.string().datetime().optional(),
        publicado: z.boolean().default(false),
        rascunho: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const startTime = Date.now();
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível" });

      // Validações de segmentação
      if (input.destinatarios === "PLANO_ESPECIFICO" && !input.planoId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "planoId é obrigatório para destinatários PLANO_ESPECIFICO" });
      }
      if (input.destinatarios === "ROLE_ESPECIFICA" && !input.roleDestino) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "roleDestino é obrigatório para destinatários ROLE_ESPECIFICA" });
      }
      if (input.destinatarios === "USUARIOS_ESPECIFICOS" && (!input.usuariosIds || input.usuariosIds.length === 0)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "usuariosIds é obrigatório para destinatários USUARIOS_ESPECIFICOS" });
      }

      const id = uuidv4();
      const now = new Date();

      await db.insert(notices).values({
        id,
        titulo: input.titulo,
        conteudo: input.conteudo,
        tipo: input.tipo,
        prioridade: input.prioridade,
        destinatarios: input.destinatarios,
        planoId: input.planoId || null,
        roleDestino: input.roleDestino || null,
        usuariosIds: input.usuariosIds ? JSON.stringify(input.usuariosIds) : null,
        agendado: input.agendado,
        dataPublicacao: input.dataPublicacao ? new Date(input.dataPublicacao) : null,
        dataExpiracao: input.dataExpiracao ? new Date(input.dataExpiracao) : null,
        publicado: input.publicado,
        rascunho: input.rascunho,
        criadoPor: ctx.user.id,
        visualizacoes: 0,
        createdAt: now,
        updatedAt: now,
      });

      // Auditoria
      await logAuditAction({
        actorId: ctx.user.id,
        actorRole: ctx.user.role,
        action: AuditAction.CREATE_NOTICE,
        targetType: "NOTICE",
        targetId: id,
        payload: { titulo: input.titulo, tipo: input.tipo },
        ipAddress: ctx.req.ip,
        userAgent: ctx.req.headers["user-agent"],
      });

      const duration = Date.now() - startTime;
      ctx.logger.info("notices.create", { duration_ms: duration, id });

      return { id, success: true };
    }),

  /**
   * Atualizar aviso
   */
  update: adminRoleProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        titulo: z.string().min(3).max(255).optional(),
        conteudo: z.string().min(10).optional(),
        tipo: z.enum(["INFORMATIVO", "IMPORTANTE", "URGENTE", "MANUTENCAO"]).optional(),
        prioridade: z.number().min(0).max(10).optional(),
        destinatarios: z.enum(["TODOS", "PLANO_ESPECIFICO", "ROLE_ESPECIFICA", "USUARIOS_ESPECIFICOS"]).optional(),
        planoId: z.string().uuid().optional().nullable(),
        roleDestino: z.enum(["ALUNO", "PROFESSOR", "MENTOR", "ADMINISTRATIVO", "MASTER"]).optional().nullable(),
        usuariosIds: z.array(z.string().uuid()).optional().nullable(),
        agendado: z.boolean().optional(),
        dataPublicacao: z.string().datetime().optional().nullable(),
        dataExpiracao: z.string().datetime().optional().nullable(),
        publicado: z.boolean().optional(),
        rascunho: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const startTime = Date.now();
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível" });

      // Verificar se aviso existe
      const [existing] = await db.select().from(notices).where(eq(notices.id, input.id)).limit(1);
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Aviso não encontrado" });
      }

      // Construir objeto de atualização
      const updateData: any = { updatedAt: new Date() };
      if (input.titulo !== undefined) updateData.titulo = input.titulo;
      if (input.conteudo !== undefined) updateData.conteudo = input.conteudo;
      if (input.tipo !== undefined) updateData.tipo = input.tipo;
      if (input.prioridade !== undefined) updateData.prioridade = input.prioridade;
      if (input.destinatarios !== undefined) updateData.destinatarios = input.destinatarios;
      if (input.planoId !== undefined) updateData.planoId = input.planoId;
      if (input.roleDestino !== undefined) updateData.roleDestino = input.roleDestino;
      if (input.usuariosIds !== undefined) updateData.usuariosIds = input.usuariosIds ? JSON.stringify(input.usuariosIds) : null;
      if (input.agendado !== undefined) updateData.agendado = input.agendado;
      if (input.dataPublicacao !== undefined) updateData.dataPublicacao = input.dataPublicacao ? new Date(input.dataPublicacao) : null;
      if (input.dataExpiracao !== undefined) updateData.dataExpiracao = input.dataExpiracao ? new Date(input.dataExpiracao) : null;
      if (input.publicado !== undefined) updateData.publicado = input.publicado;
      if (input.rascunho !== undefined) updateData.rascunho = input.rascunho;

      await db.update(notices).set(updateData).where(eq(notices.id, input.id));

      // Auditoria
      await logAuditAction({
        actorId: ctx.user.id,
        actorRole: ctx.user.role,
        action: AuditAction.UPDATE_NOTICE,
        targetType: "NOTICE",
        targetId: input.id,
        payload: updateData,
        ipAddress: ctx.req.ip,
        userAgent: ctx.req.headers["user-agent"],
      });

      const duration = Date.now() - startTime;
      ctx.logger.info("notices.update", { duration_ms: duration, id: input.id });

      return { success: true };
    }),

  /**
   * Deletar aviso
   */
  delete: adminRoleProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const startTime = Date.now();
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível" });

      // Verificar se aviso existe
      const [existing] = await db.select().from(notices).where(eq(notices.id, input.id)).limit(1);
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Aviso não encontrado" });
      }

      // Deletar reads associados
      await db.delete(noticeReads).where(eq(noticeReads.noticeId, input.id));

      // Deletar aviso
      await db.delete(notices).where(eq(notices.id, input.id));

      // Auditoria
      await logAuditAction({
        actorId: ctx.user.id,
        actorRole: ctx.user.role,
        action: AuditAction.DELETE_NOTICE,
        targetType: "NOTICE",
        targetId: input.id,
        payload: { titulo: existing.titulo },
        ipAddress: ctx.req.ip,
        userAgent: ctx.req.headers["user-agent"],
      });

      const duration = Date.now() - startTime;
      ctx.logger.info("notices.delete", { duration_ms: duration, id: input.id });

      return { success: true };
    }),

  /**
   * Estatísticas de avisos (admin)
   */
  stats: adminRoleProcedure.query(async ({ ctx }) => {
    const startTime = Date.now();
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível" });

    const [stats] = await db
      .select({
        total: sql<number>`COUNT(*)`,
        publicados: sql<number>`SUM(CASE WHEN ${notices.publicado} = 1 THEN 1 ELSE 0 END)`,
        rascunhos: sql<number>`SUM(CASE WHEN ${notices.rascunho} = 1 THEN 1 ELSE 0 END)`,
        agendados: sql<number>`SUM(CASE WHEN ${notices.agendado} = 1 THEN 1 ELSE 0 END)`,
        totalVisualizacoes: sql<number>`SUM(${notices.visualizacoes})`,
      })
      .from(notices);

    const duration = Date.now() - startTime;
    ctx.logger.info("notices.stats", { duration_ms: duration });

    return stats;
  }),
});
