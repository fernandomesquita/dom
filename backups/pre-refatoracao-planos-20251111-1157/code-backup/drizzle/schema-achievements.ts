import { mysqlTable, varchar, text, int, timestamp, boolean, mysqlEnum } from "drizzle-orm/mysql-core";

/**
 * Sistema de Conquistas/Achievements
 * 
 * Tabelas:
 * - achievements: Definição de todas as conquistas disponíveis
 * - userAchievements: Conquistas desbloqueadas pelos usuários
 */

export const achievements = mysqlTable("achievements", {
  id: varchar("id", { length: 50 }).primaryKey(), // ex: "first_question", "streak_7"
  title: varchar("title", { length: 100 }).notNull(), // "Primeira Questão"
  description: text("description").notNull(), // "Resolva sua primeira questão"
  icon: varchar("icon", { length: 50 }).notNull(), // "trophy", "fire", "star"
  category: mysqlEnum("category", [
    "primeiras_acoes", // Primeiras ações
    "marcos_quantidade", // Marcos de quantidade
    "sequencias", // Sequências/Streaks
    "excelencia", // Excelência em desempenho
    "especiais", // Conquistas especiais
  ]).notNull(),
  tier: mysqlEnum("tier", ["bronze", "prata", "ouro", "platina"]).notNull(), // Nível da conquista
  xpReward: int("xp_reward").notNull().default(0), // XP ganho ao desbloquear
  requirement: int("requirement").notNull().default(1), // Valor necessário (ex: 10 questões)
  isHidden: boolean("is_hidden").notNull().default(false), // Conquista secreta
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userAchievements = mysqlTable("user_achievements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(), // FK para users.id
  achievementId: varchar("achievement_id", { length: 50 }).notNull(), // FK para achievements.id
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
  progress: int("progress").notNull().default(0), // Progresso atual (para conquistas em andamento)
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;
