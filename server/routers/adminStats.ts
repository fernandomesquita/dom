import { z } from 'zod';
import { router, adminRoleProcedure } from '../_core/trpc';
import { getDb } from '../db';
import { users } from '../../drizzle/schema';
import { sql, count, and, gte } from 'drizzle-orm';

/**
 * Router de Estatísticas Admin
 * 
 * Fornece métricas e dados para dashboards administrativos:
 * - Total de usuários e crescimento
 * - Atividade de questões
 * - Metas ativas e concluídas
 * - Atividade no fórum
 * - Gráficos de tendências
 */

export const adminStatsRouter = router({
  /**
   * Buscar estatísticas gerais da plataforma
   */
  getOverview: adminRoleProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    // Total de usuários
    const totalUsersResult = await db.select({ count: count() }).from(users);
    const totalUsers = totalUsersResult[0]?.count || 0;

    // Usuários ativos (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsersResult = await db
      .select({ count: count() })
      .from(users)
      .where(gte(users.lastSignedIn, thirtyDaysAgo));
    
    const activeUsers = activeUsersResult[0]?.count || 0;

    // TODO: Implementar queries para questões, metas e fórum quando tabelas existirem
    
    return {
      totalUsers,
      activeUsers,
      totalQuestions: 0, // TODO: Implementar
      questionsThisMonth: 0, // TODO: Implementar
      activeGoals: 0, // TODO: Implementar
      completedGoals: 0, // TODO: Implementar
      forumThreads: 0, // TODO: Implementar
      forumPosts: 0, // TODO: Implementar
    };
  }),

  /**
   * Buscar crescimento de usuários (últimos 6 meses)
   */
  getUserGrowth: adminRoleProcedure
    .input(
      z.object({
        months: z.number().int().min(1).max(12).default(6),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database not available');
      }

      const monthsAgo = new Date();
      monthsAgo.setMonth(monthsAgo.getMonth() - input.months);

      // Agrupar usuários por mês de criação
      const result = await db
        .select({
          month: sql<string>`DATE_FORMAT(${users.createdAt}, '%Y-%m')`,
          count: count(),
        })
        .from(users)
        .where(gte(users.createdAt, monthsAgo))
        .groupBy(sql`DATE_FORMAT(${users.createdAt}, '%Y-%m')`)
        .orderBy(sql`DATE_FORMAT(${users.createdAt}, '%Y-%m')`);

      return result.map((row) => ({
        month: row.month,
        users: row.count,
      }));
    }),

  /**
   * Buscar atividade diária (últimos 30 dias)
   * TODO: Implementar quando tabela de questões existir
   */
  getDailyActivity: adminRoleProcedure
    .input(
      z.object({
        days: z.number().int().min(1).max(90).default(30),
      })
    )
    .query(async ({ input }) => {
      // TODO: Implementar query real quando tabela question_attempts existir
      
      // Retornar dados simulados por enquanto
      const result = [];
      for (let i = input.days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        result.push({
          date: dateStr,
          questions: Math.floor(Math.random() * 500) + 100,
        });
      }
      
      return result;
    }),

  /**
   * Buscar top usuários mais ativos
   */
  getTopUsers: adminRoleProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(10),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database not available');
      }

      // TODO: Implementar join com tabela de questões quando existir
      // Por enquanto, retornar usuários mais recentes
      
      const result = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          createdAt: users.createdAt,
        })
        .from(users)
        .orderBy(users.createdAt)
        .limit(input.limit);

      return result.map((user, index) => ({
        id: user.id,
        name: user.name || 'Usuário sem nome',
        email: user.email || '',
        questionsAnswered: 500 - index * 40, // TODO: Buscar do banco
        accuracy: 85 - index * 2, // TODO: Calcular do banco
      }));
    }),
});
