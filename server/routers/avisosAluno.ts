import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { avisos, avisosVisualizacoes, avisosFilaEntrega } from "../../drizzle/schema-avisos";
import { eq, and, desc, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

/**
 * Router de Avisos para Alunos (Público)
 * Procedures para visualizar, interagir e gerenciar avisos recebidos
 */

export const avisosAlunoRouter = router({
  /**
   * GET PENDENTES
   * Buscar avisos pendentes do usuário (não visualizados ou não dismissados)
   */
  getPendentes: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const userId = ctx.user.id;
    const agora = new Date();

    // Buscar avisos ativos que o usuário ainda não dismissou
    const avisosPendentes = await db
      .select({
        id: avisos.id,
        tipo: avisos.tipo,
        formatoExibicao: avisos.formatoExibicao,
        titulo: avisos.titulo,
        subtitulo: avisos.subtitulo,
        conteudo: avisos.conteudo,
        midiaTipo: avisos.midiaTipo,
        midiaUrl: avisos.midiaUrl,
        midiaThumbnail: avisos.midiaThumbnail,
        ctaTexto: avisos.ctaTexto,
        ctaUrl: avisos.ctaUrl,
        ctaEstilo: avisos.ctaEstilo,
        ctaSecundarioTexto: avisos.ctaSecundarioTexto,
        ctaSecundarioUrl: avisos.ctaSecundarioUrl,
        ctaSecundarioEstilo: avisos.ctaSecundarioEstilo,
        linksAdicionais: avisos.linksAdicionais,
        prioridade: avisos.prioridade,
        dismissavel: avisos.dismissavel,
        // Join com visualizações
        visualizado: sql<boolean>`${avisosVisualizacoes.avisoId} IS NOT NULL`,
        dismissado: avisosVisualizacoes.dismissado,
      })
      .from(avisos)
      .leftJoin(
        avisosVisualizacoes,
        and(
          eq(avisosVisualizacoes.avisoId, avisos.id),
          eq(avisosVisualizacoes.alunoId, userId)
        )
      )
      .where(
        and(
          eq(avisos.status, "ativo"),
          sql`${avisos.dataInicio} <= ${agora}`,
          sql`(${avisos.dataFim} IS NULL OR ${avisos.dataFim} >= ${agora})`,
          sql`(${avisosVisualizacoes.dismissado} IS NULL OR ${avisosVisualizacoes.dismissado} = FALSE)`
        )
      )
      .orderBy(avisos.prioridade, desc(avisos.criadoEm));

    return avisosPendentes;
  }),

  /**
   * REGISTRAR VISUALIZAÇÃO
   * Registrar que o usuário visualizou um aviso
   */
  registrarVisualizacao: protectedProcedure
    .input(
      z.object({
        avisoId: z.string().uuid(),
        dispositivo: z.enum(["mobile", "desktop", "tablet"]).optional(),
        tempoVisualizacao: z.number().int().min(0).optional(), // segundos
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userId = ctx.user.id;
      const agora = new Date();

      // UPSERT: Inserir ou atualizar visualização
      await db
        .insert(avisosVisualizacoes)
        .values({
          avisoId: input.avisoId,
          alunoId: userId,
          visualizadoEm: agora,
          dispositivo: input.dispositivo || "desktop",
          tempoVisualizacao: input.tempoVisualizacao || 0,
          totalVisualizacoes: 1,
          ultimaVisualizacao: agora,
          dismissado: false,
          clicouCta: false,
        })
        .onDuplicateKeyUpdate({
          set: {
            totalVisualizacoes: sql`${avisosVisualizacoes.totalVisualizacoes} + 1`,
            ultimaVisualizacao: agora,
            tempoVisualizacao: sql`${avisosVisualizacoes.tempoVisualizacao} + ${input.tempoVisualizacao || 0}`,
          },
        });

      return { success: true };
    }),

  /**
   * DISPENSAR AVISO
   * Marcar aviso como dismissado (não exibir mais)
   */
  dispensar: protectedProcedure
    .input(
      z.object({
        avisoId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userId = ctx.user.id;
      const agora = new Date();

      // Atualizar visualização para dismissado
      await db
        .insert(avisosVisualizacoes)
        .values({
          avisoId: input.avisoId,
          alunoId: userId,
          visualizadoEm: agora,
          dismissado: true,
          dismissadoEm: agora,
          totalVisualizacoes: 1,
          ultimaVisualizacao: agora,
          clicouCta: false,
          tempoVisualizacao: 0,
        })
        .onDuplicateKeyUpdate({
          set: {
            dismissado: true,
            dismissadoEm: agora,
          },
        });

      return { success: true };
    }),

  /**
   * CLICAR CTA
   * Registrar que o usuário clicou no Call-to-Action
   */
  clicarCTA: protectedProcedure
    .input(
      z.object({
        avisoId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userId = ctx.user.id;
      const agora = new Date();

      // Atualizar visualização para clicou CTA
      await db
        .insert(avisosVisualizacoes)
        .values({
          avisoId: input.avisoId,
          alunoId: userId,
          visualizadoEm: agora,
          clicouCta: true,
          clicouCtaEm: agora,
          totalVisualizacoes: 1,
          ultimaVisualizacao: agora,
          dismissado: false,
          tempoVisualizacao: 0,
        })
        .onDuplicateKeyUpdate({
          set: {
            clicouCta: true,
            clicouCtaEm: agora,
          },
        });

      return { success: true };
    }),

  /**
   * GET HISTÓRICO
   * Buscar histórico de avisos visualizados pelo usuário
   */
  getHistorico: protectedProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
        tipo: z.enum(["informativo", "importante", "urgente", "individual", "premium"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userId = ctx.user.id;
      const offset = (input.page - 1) * input.limit;

      // Buscar avisos visualizados pelo usuário
      const historico = await db
        .select({
          id: avisos.id,
          tipo: avisos.tipo,
          formatoExibicao: avisos.formatoExibicao,
          titulo: avisos.titulo,
          subtitulo: avisos.subtitulo,
          conteudo: avisos.conteudo,
          visualizadoEm: avisosVisualizacoes.visualizadoEm,
          dismissado: avisosVisualizacoes.dismissado,
          clicouCta: avisosVisualizacoes.clicouCta,
          totalVisualizacoes: avisosVisualizacoes.totalVisualizacoes,
        })
        .from(avisosVisualizacoes)
        .innerJoin(avisos, eq(avisos.id, avisosVisualizacoes.avisoId))
        .where(
          and(
            eq(avisosVisualizacoes.alunoId, userId),
            input.tipo ? eq(avisos.tipo, input.tipo) : undefined
          )
        )
        .orderBy(desc(avisosVisualizacoes.ultimaVisualizacao))
        .limit(input.limit)
        .offset(offset);

      // Contar total
      const [{ total }] = await db
        .select({ total: sql<number>`COUNT(*)` })
        .from(avisosVisualizacoes)
        .innerJoin(avisos, eq(avisos.id, avisosVisualizacoes.avisoId))
        .where(
          and(
            eq(avisosVisualizacoes.alunoId, userId),
            input.tipo ? eq(avisos.tipo, input.tipo) : undefined
          )
        );

      return {
        items: historico,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          totalPages: Math.ceil(total / input.limit),
        },
      };
    }),
});
