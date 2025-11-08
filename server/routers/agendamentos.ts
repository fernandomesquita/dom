import { z } from 'zod';
import { router, adminProcedure } from '../_core/trpc';
import { getDb } from '../db';
import { avisosAgendamentos, avisosAgendamentosLogs } from '../../drizzle/schema-avisos';
import { eq, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { calcularProximasExecucoes } from '../scheduler/avisos';

/**
 * Router de Agendamentos de Avisos
 * Gerencia agendamento de avisos com recorrência
 */

export const agendamentosRouter = router({
  /**
   * Criar agendamento
   */
  create: adminProcedure
    .input(
      z.object({
        avisoId: z.string(),
        dataExecucao: z.string(), // ISO string
        recorrencia: z.enum(['unica', 'diaria', 'semanal', 'mensal']),
        timezone: z.string().default('America/Sao_Paulo'),
        segmentacao: z
          .object({
            diasUltimoAcesso: z.number().optional(),
            taxaAcertoMin: z.number().optional(),
            taxaAcertoMax: z.number().optional(),
            questoesResolvidasMin: z.number().optional(),
            questoesResolvidasMax: z.number().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const dataExecucao = new Date(input.dataExecucao);
      const agora = new Date();

      // Validar data no futuro
      if (dataExecucao <= agora) {
        throw new Error('Data de execução deve ser no futuro');
      }

      const id = uuidv4();

      await db.insert(avisosAgendamentos).values({
        id,
        avisoId: input.avisoId,
        dataExecucao,
        recorrencia: input.recorrencia,
        timezone: input.timezone,
        proximaExecucao: dataExecucao,
        status: 'ativo',
        segmentacao: input.segmentacao || null,
        criadoPor: ctx.user.id.toString(),
      });

      return { id, success: true };
    }),

  /**
   * Listar agendamentos
   */
  list: adminProcedure
    .input(
      z.object({
        status: z.enum(['ativo', 'pausado', 'concluido', 'cancelado']).optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      let query = db.select().from(avisosAgendamentos);

      if (input.status) {
        query = query.where(eq(avisosAgendamentos.status, input.status)) as any;
      }

      const agendamentos = await query
        .orderBy(desc(avisosAgendamentos.proximaExecucao))
        .limit(input.limit);

      return agendamentos;
    }),

  /**
   * Obter detalhes de um agendamento
   */
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const [agendamento] = await db
        .select()
        .from(avisosAgendamentos)
        .where(eq(avisosAgendamentos.id, input.id))
        .limit(1);

      return agendamento || null;
    }),

  /**
   * Cancelar agendamento
   */
  cancel: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db
        .update(avisosAgendamentos)
        .set({ status: 'cancelado' })
        .where(eq(avisosAgendamentos.id, input.id));

      return { success: true };
    }),

  /**
   * Pausar agendamento
   */
  pause: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db
        .update(avisosAgendamentos)
        .set({ status: 'pausado' })
        .where(eq(avisosAgendamentos.id, input.id));

      return { success: true };
    }),

  /**
   * Retomar agendamento
   */
  resume: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db
        .update(avisosAgendamentos)
        .set({ status: 'ativo' })
        .where(eq(avisosAgendamentos.id, input.id));

      return { success: true };
    }),

  /**
   * Calcular próximas execuções
   */
  getProximasExecucoes: adminProcedure
    .input(
      z.object({
        dataInicio: z.string(),
        recorrencia: z.enum(['unica', 'diaria', 'semanal', 'mensal']),
        quantidade: z.number().default(5),
      })
    )
    .query(({ input }) => {
      const dataInicio = new Date(input.dataInicio);
      const execucoes = calcularProximasExecucoes(
        dataInicio,
        input.recorrencia,
        input.quantidade
      );

      return execucoes.map((data) => data.toISOString());
    }),

  /**
   * Listar logs de execução
   */
  getLogs: adminProcedure
    .input(
      z.object({
        agendamentoId: z.string().optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      let query = db.select().from(avisosAgendamentosLogs);

      if (input.agendamentoId) {
        query = query.where(
          eq(avisosAgendamentosLogs.agendamentoId, input.agendamentoId)
        ) as any;
      }

      const logs = await query
        .orderBy(desc(avisosAgendamentosLogs.executadoEm))
        .limit(input.limit);

      return logs;
    }),

  /**
   * Estatísticas de agendamentos
   */
  getStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db)
      return {
        ativos: 0,
        pausados: 0,
        concluidos: 0,
        cancelados: 0,
        totalExecucoes: 0,
        sucessos: 0,
        erros: 0,
      };

    const [agendamentosAtivos] = await db
      .select()
      .from(avisosAgendamentos)
      .where(eq(avisosAgendamentos.status, 'ativo'));

    const [agendamentosPausados] = await db
      .select()
      .from(avisosAgendamentos)
      .where(eq(avisosAgendamentos.status, 'pausado'));

    const [agendamentosConcluidos] = await db
      .select()
      .from(avisosAgendamentos)
      .where(eq(avisosAgendamentos.status, 'concluido'));

    const [agendamentosCancelados] = await db
      .select()
      .from(avisosAgendamentos)
      .where(eq(avisosAgendamentos.status, 'cancelado'));

    const logs = await db.select().from(avisosAgendamentosLogs);

    const sucessos = logs.filter((l) => l.status === 'sucesso').length;
    const erros = logs.filter((l) => l.status === 'erro').length;

    return {
      ativos: Array.isArray(agendamentosAtivos) ? agendamentosAtivos.length : 1,
      pausados: Array.isArray(agendamentosPausados)
        ? agendamentosPausados.length
        : 1,
      concluidos: Array.isArray(agendamentosConcluidos)
        ? agendamentosConcluidos.length
        : 1,
      cancelados: Array.isArray(agendamentosCancelados)
        ? agendamentosCancelados.length
        : 1,
      totalExecucoes: logs.length,
      sucessos,
      erros,
    };
  }),
});
