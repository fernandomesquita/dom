import { z } from "zod";
import { router, protectedProcedure } from "../../_core/trpc";
import { getDb } from "../../db";
import { streakLogs, streakProtections } from "../../../drizzle/schema-dashboard";
import { eq, and, gte, desc, sql } from "drizzle-orm";

/**
 * E10: Dashboard do Aluno - Streak Router
 * 
 * 4 procedures:
 * 1. getCurrentStreak - Streak atual
 * 2. useProtection - Usar proteção de streak
 * 3. getHistory - Histórico de streaks
 * 4. getLeaderboard - Ranking de streaks
 */

export const streakRouter = router({
  /**
   * 1. getCurrentStreak - Streak atual
   * Retorna o streak atual do usuário
   */
  getCurrentStreak: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const userId = ctx.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Buscar logs dos últimos 30 dias
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const logs = await db
      .select()
      .from(streakLogs)
      .where(
        and(
          eq(streakLogs.userId, userId),
          gte(streakLogs.date, thirtyDaysAgo)
        )
      )
      .orderBy(desc(streakLogs.date));

    // Calcular streak atual
    let currentStreak = 0;
    let checkDate = new Date(today);

    for (const log of logs) {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);

      if (logDate.getTime() === checkDate.getTime()) {
        if (log.streakAtivo) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      } else {
        break;
      }
    }

    // Verificar se está em risco (não estudou hoje)
    const todayLog = logs.find((log) => {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime();
    });

    const emRisco = !todayLog || !todayLog.streakAtivo;

    // Buscar proteções disponíveis
    const [protections] = await db
      .select()
      .from(streakProtections)
      .where(eq(streakProtections.userId, userId))
      .limit(1);

    const protecoesDisponiveis = protections
      ? protections.quantidade - protections.quantidadeUsada
      : 0;

    // Últimos 7 dias
    const ultimos7Dias = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const log = logs.find((l) => {
        const logDate = new Date(l.date);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === date.getTime();
      });

      const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      ultimos7Dias.push({
        dia: dayNames[date.getDay()],
        ativo: log ? log.streakAtivo : false,
        protecaoUsada: log ? log.protecaoUsada : false,
      });
    }

    return {
      diasConsecutivos: currentStreak,
      emRisco,
      protecoesDisponiveis,
      ultimos7Dias,
    };
  }),

  /**
   * 2. useProtection - Usar proteção de streak
   * Permite o usuário usar uma proteção para manter o streak
   */
  useProtection: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const userId = ctx.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Verificar se há proteções disponíveis
    const [protections] = await db
      .select()
      .from(streakProtections)
      .where(eq(streakProtections.userId, userId))
      .limit(1);

    if (!protections) {
      throw new Error("Nenhuma proteção disponível");
    }

    const protecoesDisponiveis = protections.quantidade - protections.quantidadeUsada;

    if (protecoesDisponiveis <= 0) {
      throw new Error("Nenhuma proteção disponível");
    }

    // Verificar se já usou proteção hoje
    const [todayLog] = await db
      .select()
      .from(streakLogs)
      .where(
        and(
          eq(streakLogs.userId, userId),
          eq(streakLogs.date, today)
        )
      )
      .limit(1);

    if (todayLog && todayLog.protecaoUsada) {
      throw new Error("Você já usou uma proteção hoje");
    }

    // Usar proteção
    await db
      .update(streakProtections)
      .set({ quantidadeUsada: protections.quantidadeUsada + 1 })
      .where(eq(streakProtections.userId, userId));

    // Criar ou atualizar log de hoje
    if (todayLog) {
      await db
        .update(streakLogs)
        .set({
          streakAtivo: true,
          protecaoUsada: true,
        })
        .where(
          and(
            eq(streakLogs.userId, userId),
            eq(streakLogs.date, today)
          )
        );
    } else {
      await db.insert(streakLogs).values({
        id: `sl_${userId}_${Date.now()}`,
        userId,
        date: today,
        metasCompletas: 0,
        questoesResolvidas: 0,
        tempoEstudo: 0,
        streakAtivo: true,
        protecaoUsada: true,
      });
    }

    return { success: true, protecoesRestantes: protecoesDisponiveis - 1 };
  }),

  /**
   * 3. getHistory - Histórico de streaks
   * Retorna o histórico de streaks do usuário
   */
  getHistory: protectedProcedure
    .input(
      z.object({
        days: z.number().min(7).max(365).default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userId = ctx.user.id;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - input.days);

      const logs = await db
        .select()
        .from(streakLogs)
        .where(
          and(
            eq(streakLogs.userId, userId),
            gte(streakLogs.date, startDate)
          )
        )
        .orderBy(desc(streakLogs.date));

      return logs.map((log) => ({
        date: log.date,
        streakAtivo: log.streakAtivo,
        protecaoUsada: log.protecaoUsada,
        metasCompletas: log.metasCompletas,
        questoesResolvidas: log.questoesResolvidas,
        tempoEstudo: log.tempoEstudo,
      }));
    }),

  /**
   * 4. getLeaderboard - Ranking de streaks
   * Retorna o ranking de streaks da plataforma
   */
  getLeaderboard: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(3).max(100).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // TODO: Implementar cálculo de streak para todos os usuários
      // Por enquanto, retornar mock
      return [];
    }),
});
