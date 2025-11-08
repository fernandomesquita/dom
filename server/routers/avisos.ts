import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { 
  avisos, 
  avisosSegmentacao, 
  avisosVisualizacoes, 
  avisosFilaEntrega,
  avisosAnalytics 
} from "../../drizzle/schema-avisos";
import { eq, and, desc, sql, like, or } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { adicionarJobEnvioEmMassa, getQueueStats, getRecentJobs, pauseQueue, resumeQueue, cleanQueue } from "../queues/config";
import { emitToAll } from "../_core/socket";
import { calcularUsuariosElegiveis, obterEstatisticasSegmentacao } from "../helpers/segmentacao";

/**
 * Router de Avisos (Admin)
 * Procedures para criar, gerenciar e analisar avisos
 */

export const avisosRouter = router({
  /**
   * CREATE
   * Criar novo aviso (admin)
   */
  create: protectedProcedure
    .input(
      z.object({
        tipo: z.enum(["informativo", "importante", "urgente", "individual", "premium"]),
        formatoExibicao: z.enum(["modal", "banner", "toast", "badge"]),
        titulo: z.string().min(1).max(100),
        subtitulo: z.string().max(150).optional(),
        conteudo: z.string().min(1),
        midiaTipo: z.enum(["imagem", "video", "audio"]).optional(),
        midiaUrl: z.string().url().optional(),
        midiaThumbnail: z.string().url().optional(),
        ctaTexto: z.string().max(50).optional(),
        ctaUrl: z.string().url().optional(),
        ctaEstilo: z.enum(["primary", "secondary", "outline"]).optional(),
        ctaSecundarioTexto: z.string().max(50).optional(),
        ctaSecundarioUrl: z.string().url().optional(),
        ctaSecundarioEstilo: z.enum(["text", "outline"]).optional(),
        linksAdicionais: z.array(z.object({ texto: z.string(), url: z.string().url() })).optional(),
        prioridade: z.number().int().min(1).max(10).default(5),
        dismissavel: z.boolean().default(true),
        reaparecePosDispensar: z.boolean().default(false),
        frequenciaReexibicao: z.enum(["nunca", "diaria", "semanal"]).optional(),
        limiteExibicoes: z.number().int().min(1).optional(),
        dataInicio: z.date().optional(),
        dataFim: z.date().optional(),
        horarioExibicao: z.enum(["qualquer", "comercial", "noturno"]).default("qualquer"),
        sensivel: z.boolean().default(false),
        grupoTeste: z.enum(["A", "B", "C"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // TODO: Verificar se usuário é admin
      // if (ctx.user.role !== 'admin') throw new Error("Unauthorized");

      const avisoId = uuidv4();
      const agora = new Date();

      await db.insert(avisos).values({
        id: avisoId,
        tipo: input.tipo,
        formatoExibicao: input.formatoExibicao,
        titulo: input.titulo,
        subtitulo: input.subtitulo,
        conteudo: input.conteudo,
        midiaTipo: input.midiaTipo,
        midiaUrl: input.midiaUrl,
        midiaThumbnail: input.midiaThumbnail,
        ctaTexto: input.ctaTexto,
        ctaUrl: input.ctaUrl,
        ctaEstilo: input.ctaEstilo,
        ctaSecundarioTexto: input.ctaSecundarioTexto,
        ctaSecundarioUrl: input.ctaSecundarioUrl,
        ctaSecundarioEstilo: input.ctaSecundarioEstilo,
        linksAdicionais: input.linksAdicionais as any,
        prioridade: input.prioridade,
        dismissavel: input.dismissavel,
        reaparecePosDispensar: input.reaparecePosDispensar,
        frequenciaReexibicao: input.frequenciaReexibicao,
        limiteExibicoes: input.limiteExibicoes,
        dataInicio: input.dataInicio || agora,
        dataFim: input.dataFim,
        horarioExibicao: input.horarioExibicao,
        status: "rascunho",
        sensivel: input.sensivel,
        grupoTeste: input.grupoTeste,
        criadoPor: ctx.user.id,
        criadoEm: agora,
        atualizadoEm: agora,
      });

      // Emitir evento WebSocket
      emitToAll('novoAviso', { avisoId, tipo: input.tipo, titulo: input.titulo });

      return { id: avisoId };
    }),

  /**
   * UPDATE
   * Atualizar aviso existente (admin)
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        tipo: z.enum(["informativo", "importante", "urgente", "individual", "premium"]).optional(),
        formatoExibicao: z.enum(["modal", "banner", "toast", "badge"]).optional(),
        titulo: z.string().min(1).max(100).optional(),
        subtitulo: z.string().max(150).optional(),
        conteudo: z.string().min(1).optional(),
        midiaTipo: z.enum(["imagem", "video", "audio"]).optional(),
        midiaUrl: z.string().url().optional(),
        midiaThumbnail: z.string().url().optional(),
        ctaTexto: z.string().max(50).optional(),
        ctaUrl: z.string().url().optional(),
        ctaEstilo: z.enum(["primary", "secondary", "outline"]).optional(),
        ctaSecundarioTexto: z.string().max(50).optional(),
        ctaSecundarioUrl: z.string().url().optional(),
        ctaSecundarioEstilo: z.enum(["text", "outline"]).optional(),
        linksAdicionais: z.array(z.object({ texto: z.string(), url: z.string().url() })).optional(),
        prioridade: z.number().int().min(1).max(10).optional(),
        dismissavel: z.boolean().optional(),
        reaparecePosDispensar: z.boolean().optional(),
        frequenciaReexibicao: z.enum(["nunca", "diaria", "semanal"]).optional(),
        limiteExibicoes: z.number().int().min(1).optional(),
        dataInicio: z.date().optional(),
        dataFim: z.date().optional(),
        horarioExibicao: z.enum(["qualquer", "comercial", "noturno"]).optional(),
        sensivel: z.boolean().optional(),
        grupoTeste: z.enum(["A", "B", "C"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...updateData } = input;

      // Remover campos undefined
      const cleanData = Object.fromEntries(
        Object.entries(updateData).filter(([_, v]) => v !== undefined)
      );

      if (Object.keys(cleanData).length === 0) {
        throw new Error("No fields to update");
      }

      await db
        .update(avisos)
        .set({
          ...cleanData,
          atualizadoEm: new Date(),
        })
        .where(eq(avisos.id, id));

      // Emitir evento WebSocket
      emitToAll('avisoAtualizado', { avisoId: id });

      return { success: true };
    }),

  /**
   * DELETE
   * Deletar aviso (soft delete via status)
   */
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Soft delete: mudar status para "expirado"
      await db
        .update(avisos)
        .set({
          status: "expirado",
          atualizadoEm: new Date(),
        })
        .where(eq(avisos.id, input.id));

      // Emitir evento WebSocket
      emitToAll('avisoExcluido', { avisoId: input.id });

      return { success: true };
    }),

  /**
   * LIST
   * Listar avisos com filtros (admin)
   */
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
        status: z.enum(["rascunho", "agendado", "ativo", "pausado", "expirado"]).optional(),
        tipo: z.enum(["informativo", "importante", "urgente", "individual", "premium"]).optional(),
        busca: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const offset = (input.page - 1) * input.limit;

      // Construir condições
      const conditions = [];
      if (input.status) conditions.push(eq(avisos.status, input.status));
      if (input.tipo) conditions.push(eq(avisos.tipo, input.tipo));
      if (input.busca) {
        conditions.push(
          or(
            like(avisos.titulo, `%${input.busca}%`),
            like(avisos.conteudo, `%${input.busca}%`)
          )
        );
      }

      // Buscar avisos
      const items = await db
        .select()
        .from(avisos)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(avisos.criadoEm))
        .limit(input.limit)
        .offset(offset);

      // Contar total
      const [{ total }] = await db
        .select({ total: sql<number>`COUNT(*)` })
        .from(avisos)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return {
        items,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          totalPages: Math.ceil(total / input.limit),
        },
      };
    }),

  /**
   * GET BY ID
   * Buscar aviso por ID (admin)
   */
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [aviso] = await db
        .select()
        .from(avisos)
        .where(eq(avisos.id, input.id))
        .limit(1);

      if (!aviso) {
        throw new Error("Aviso not found");
      }

      // Buscar segmentação associada
      const [segmentacao] = await db
        .select()
        .from(avisosSegmentacao)
        .where(eq(avisosSegmentacao.avisoId, input.id))
        .limit(1);

      return {
        ...aviso,
        segmentacao,
      };
    }),

  /**
   * PUBLICAR
   * Publicar aviso (mudar status para ativo e adicionar à fila)
   */
  publicar: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Atualizar status para ativo
      await db
        .update(avisos)
        .set({
          status: "ativo",
          atualizadoEm: new Date(),
        })
        .where(eq(avisos.id, input.id));

      // TODO: Adicionar à fila de processamento (BullMQ)
      // await filaProcessamento.add('processar_aviso', { avisoId: input.id });

      return { success: true, message: "Aviso publicado e adicionado à fila de processamento" };
    }),

  /**
   * PAUSAR
   * Pausar aviso ativo
   */
  pausar: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(avisos)
        .set({
          ...cleanData,
          atualizadoEm: new Date(),
        })
        .where(eq(avisos.id, id));

      // Emitir evento WebSocket
      emitToAll('avisoAtualizado', { avisoId: id });

      return { success: true };
    }),

  /**
   * DUPLICAR
   * Duplicar aviso existente
   */
  duplicar: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Buscar aviso original
      const [avisoOriginal] = await db
        .select()
        .from(avisos)
        .where(eq(avisos.id, input.id))
        .limit(1);

      if (!avisoOriginal) {
        throw new Error("Aviso not found");
      }

      // Criar cópia
      const novoId = uuidv4();
      const agora = new Date();

      await db.insert(avisos).values({
        ...avisoOriginal,
        id: novoId,
        titulo: `${avisoOriginal.titulo} (Cópia)`,
        status: "rascunho",
        criadoPor: ctx.user.id,
        criadoEm: agora,
        atualizadoEm: agora,
      });

      // Copiar segmentação se existir
      const [segmentacaoOriginal] = await db
        .select()
        .from(avisosSegmentacao)
        .where(eq(avisosSegmentacao.avisoId, input.id))
        .limit(1);

      if (segmentacaoOriginal) {
        await db.insert(avisosSegmentacao).values({
          ...segmentacaoOriginal,
          id: uuidv4(),
          avisoId: novoId,
          cacheGeradoEm: null,
          alunosElegiveisCacheIds: null,
          totalAlunosImpactados: null,
        });
      }

      return { id: novoId };
    }),

  /**
   * GET ANALYTICS
   * Buscar analytics de um aviso específico
   */
  getAnalytics: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Buscar analytics do cache
      const [analytics] = await db
        .select()
        .from(avisosAnalytics)
        .where(eq(avisosAnalytics.avisoId, input.id))
        .limit(1);

      // Se não existir no cache, calcular em tempo real
      if (!analytics) {
        const [stats] = await db
          .select({
            totalVisualizados: sql<number>`COUNT(DISTINCT ${avisosVisualizacoes.alunoId})`,
            totalDismissados: sql<number>`SUM(CASE WHEN ${avisosVisualizacoes.dismissado} = TRUE THEN 1 ELSE 0 END)`,
            totalCliquesCta: sql<number>`SUM(CASE WHEN ${avisosVisualizacoes.clicouCta} = TRUE THEN 1 ELSE 0 END)`,
            tempoMedioVisualizacao: sql<number>`AVG(${avisosVisualizacoes.tempoVisualizacao})`,
          })
          .from(avisosVisualizacoes)
          .where(eq(avisosVisualizacoes.avisoId, input.id));

        // Buscar total enviados
        const [{ totalEnviados }] = await db
          .select({ totalEnviados: sql<number>`COUNT(*)` })
          .from(avisosFilaEntrega)
          .where(eq(avisosFilaEntrega.avisoId, input.id));

        return {
          avisoId: input.id,
          totalEnviados: totalEnviados || 0,
          totalVisualizados: stats.totalVisualizados || 0,
          totalDismissados: stats.totalDismissados || 0,
          totalCliquesCta: stats.totalCliquesCta || 0,
          taxaVisualizacao: totalEnviados > 0 ? Math.round((stats.totalVisualizados / totalEnviados) * 100) : 0,
          taxaDismiss: stats.totalVisualizados > 0 ? Math.round((stats.totalDismissados / stats.totalVisualizados) * 100) : 0,
          taxaConversao: stats.totalVisualizados > 0 ? Math.round((stats.totalCliquesCta / stats.totalVisualizados) * 100) : 0,
          tempoMedioVisualizacao: Math.round(stats.tempoMedioVisualizacao || 0),
          atualizadoEm: new Date(),
        };
      }

      return analytics;
    }),

  /**
   * GET ANALYTICS SUMMARY
   * Buscar resumo de analytics para dashboard
   */
  getAnalyticsSummary: protectedProcedure
    .input(
      z.object({
        periodo: z.number().int().min(1).max(365).default(30), // dias
        tipoFiltro: z.enum(["todos", "informativo", "importante", "urgente", "individual", "premium"]).default("todos"),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - input.periodo);

      // Métricas principais
      const metricsQuery = db
        .select({
          totalVisualizacoes: sql<number>`COALESCE(SUM(${avisosAnalytics.totalVisualizados}), 0)`,
          totalCliques: sql<number>`COALESCE(SUM(${avisosAnalytics.totalCliquesCta}), 0)`,
          totalDispensas: sql<number>`COALESCE(SUM(${avisosAnalytics.totalDismissados}), 0)`,
        })
        .from(avisosAnalytics)
        .innerJoin(avisos, eq(avisosAnalytics.avisoId, avisos.id))
        .where(
          and(
            sql`${avisos.createdAt} >= ${dataInicio}`,
            input.tipoFiltro !== "todos" ? eq(avisos.tipo, input.tipoFiltro) : undefined
          )
        );

      const metricsResult = await metricsQuery;
      const metrics = metricsResult[0] || { totalVisualizacoes: 0, totalCliques: 0, totalDispensas: 0 };

      const taxaEngajamento = metrics.totalVisualizacoes > 0
        ? (metrics.totalCliques / metrics.totalVisualizacoes) * 100
        : 0;

      // Performance por tipo
      const performancePorTipoQuery = db
        .select({
          tipo: avisos.tipo,
          visualizacoes: sql<number>`COALESCE(SUM(${avisosAnalytics.totalVisualizados}), 0)`,
          cliques: sql<number>`COALESCE(SUM(${avisosAnalytics.totalCliquesCta}), 0)`,
        })
        .from(avisosAnalytics)
        .innerJoin(avisos, eq(avisosAnalytics.avisoId, avisos.id))
        .where(sql`${avisos.createdAt} >= ${dataInicio}`)
        .groupBy(avisos.tipo);

      const performancePorTipo = await performancePorTipoQuery;

      // Distribuição por formato
      const distribuicaoPorFormatoQuery = db
        .select({
          formato: avisos.formatoExibicao,
          count: sql<number>`COUNT(*)`,
        })
        .from(avisos)
        .where(sql`${avisos.createdAt} >= ${dataInicio}`)
        .groupBy(avisos.formatoExibicao);

      const distribuicaoPorFormato = await distribuicaoPorFormatoQuery;

      // Timeline de visualizações (últimos 7 dias)
      const timelineQuery = db
        .select({
          data: sql<string>`DATE(${avisosVisualizacoes.visualizadoEm})`,
          visualizacoes: sql<number>`COUNT(*)`,
          cliques: sql<number>`SUM(CASE WHEN ${avisosVisualizacoes.clicouCta} = 1 THEN 1 ELSE 0 END)`,
        })
        .from(avisosVisualizacoes)
        .where(sql`${avisosVisualizacoes.visualizadoEm} >= DATE_SUB(NOW(), INTERVAL 7 DAY)`)
        .groupBy(sql`DATE(${avisosVisualizacoes.visualizadoEm})`)
        .orderBy(sql`DATE(${avisosVisualizacoes.visualizadoEm})`);

      const timeline = await timelineQuery;

      return {
        metrics: {
          totalVisualizacoes: Number(metrics.totalVisualizacoes),
          totalCliques: Number(metrics.totalCliques),
          totalDispensas: Number(metrics.totalDispensas),
          taxaEngajamento: Number(taxaEngajamento.toFixed(1)),
        },
        performancePorTipo: performancePorTipo.map(p => ({
          tipo: p.tipo,
          visualizacoes: Number(p.visualizacoes),
          cliques: Number(p.cliques),
          taxa: p.visualizacoes > 0 ? Number(((p.cliques / p.visualizacoes) * 100).toFixed(1)) : 0,
        })),
        distribuicaoPorFormato: distribuicaoPorFormato.map(d => ({
          formato: d.formato,
          count: Number(d.count),
        })),
        timeline: timeline.map(t => ({
          data: t.data,
          visualizacoes: Number(t.visualizacoes),
          cliques: Number(t.cliques),
        })),
      };
    }),

  /**
   * DISPARAR ENVIO EM MASSA
   * Adicionar job à fila para enviar aviso para múltiplos usuários
   */
  dispararEnvioEmMassa: protectedProcedure
    .input(
      z.object({
        avisoId: z.string().uuid(),
        segmentacao: z.object({
          planos: z.array(z.string()).optional(),
          nivelEngajamento: z.enum(["baixo", "medio", "alto"]).optional(),
          taxaAcertoMin: z.number().min(0).max(100).optional(),
          taxaAcertoMax: z.number().min(0).max(100).optional(),
          diasUltimoAcesso: z.number().int().min(1).optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Verificar se aviso existe e está ativo
      const [aviso] = await db
        .select()
        .from(avisos)
        .where(eq(avisos.id, input.avisoId))
        .limit(1);

      if (!aviso) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Aviso não encontrado" });
      }

      if (aviso.status !== "ativo") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Aviso não está ativo" });
      }

      // Adicionar job à fila
      const job = await adicionarJobEnvioEmMassa({
        avisoId: input.avisoId,
        segmentacao: input.segmentacao,
        adminId: ctx.user.id,
      });

      return {
        success: true,
        jobId: job.id,
        message: "Envio em massa iniciado. Processamento em andamento.",
      };
    }),

  /**
   * GET QUEUE STATS
   * Obter estatísticas da fila de processamento
   */
  getQueueStats: protectedProcedure
    .query(async () => {
      const stats = await getQueueStats();
      return stats;
    }),

  /**
   * GET RECENT JOBS
   * Obter jobs recentes da fila
   */
  getRecentJobs: protectedProcedure
    .input(
      z.object({
        status: z.enum(["completed", "failed", "active", "waiting"]),
        limit: z.number().int().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      const jobs = await getRecentJobs(input.status, input.limit);
      return jobs.map(job => ({
        id: job.id,
        name: job.name,
        data: job.data,
        returnvalue: job.returnvalue,
        failedReason: job.failedReason,
        timestamp: job.timestamp,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
      }));
    }),

  /**
   * PAUSE QUEUE
   * Pausar processamento da fila
   */
  pauseQueue: protectedProcedure
    .mutation(async () => {
      await pauseQueue();
      return { success: true, message: "Fila pausada" };
    }),

  /**
   * RESUME QUEUE
   * Retomar processamento da fila
   */
  resumeQueue: protectedProcedure
    .mutation(async () => {
      await resumeQueue();
      return { success: true, message: "Fila retomada" };
    }),

  /**
   * CLEAN QUEUE
   * Limpar jobs antigos da fila
   */
  cleanQueue: protectedProcedure
    .mutation(async () => {
      await cleanQueue();
      return { success: true, message: "Fila limpa" };
    }),

  /**
   * PREVIEW ALCANCE
   * Calcular quantos usuários serão alcançados com os filtros de segmentação
   */
  previewAlcance: protectedProcedure
    .input(
      z.object({
        planos: z.array(z.string()).optional(),
        diasUltimoAcesso: z.number().int().min(1).optional(),
        disciplinas: z.array(z.string()).optional(),
        taxaAcertoMin: z.number().min(0).max(100).optional(),
        taxaAcertoMax: z.number().min(0).max(100).optional(),
        questoesResolvidasMin: z.number().int().min(0).optional(),
        questoesResolvidasMax: z.number().int().min(0).optional(),
      })
    )
    .query(async ({ input }) => {
      const estatisticas = await obterEstatisticasSegmentacao(input);
      return estatisticas;
    }),
});
