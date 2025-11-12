import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { forumThreads, forumMessages, users } from "../../drizzle/schema";
import { desc, sql, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const forumStatsRouter = router({
  getOverview: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const [stats] = await db
      .select({
        totalThreads: sql<number>`count(distinct ${forumThreads.id})`,
        totalMessages: sql<number>`count(distinct ${forumMessages.id})`,
      })
      .from(forumThreads)
      .leftJoin(forumMessages, eq(forumMessages.threadId, forumThreads.id));

    return {
      totalThreads: Number(stats?.totalThreads || 0),
      totalMessages: Number(stats?.totalMessages || 0),
      activeUsers: 0,
      suspendedUsers: 0,
      totalUpvotes: 0,
      pinnedThreads: 0,
      lockedThreads: 0,
    };
  }),

  getPopularThreads: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const threads = await db
      .select()
      .from(forumThreads)
      .orderBy(desc(forumThreads.views))
      .limit(10);

    return threads;
  }),

  getRecentThreads: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const threads = await db
      .select()
      .from(forumThreads)
      .orderBy(desc(forumThreads.createdAt))
      .limit(10);

    return threads;
  }),

  getTopUsers: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    // Retornar array vazio por enquanto (implementação futura)
    return [];
  }),
});
