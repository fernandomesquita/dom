import { boolean, datetime, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { users } from "./schema";

/**
 * E10: DASHBOARD DO ALUNO - SCHEMA
 * 
 * 8 tabelas para suportar o dashboard principal:
 * 1. widget_configs - Configuração de widgets por usuário
 * 2. streak_logs - Histórico de streaks
 * 3. streak_protections - Proteções de streak usadas
 * 4. telemetry_events - Eventos de telemetria
 * 5. dashboard_customizations - Customizações do dashboard
 * 6. daily_summaries - Resumos diários agregados
 * 7. gamification_xp - XP e níveis
 * 8. gamification_achievements - Conquistas desbloqueadas
 */

// ============================================
// 1. CONFIGURAÇÃO DE WIDGETS
// ============================================
export const widgetConfigs = mysqlTable("widget_configs", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  widgetType: mysqlEnum("widget_type", [
    "cronograma",
    "qtd",
    "streak",
    "progresso_semanal",
    "materiais",
    "revisoes",
    "plano",
    "comunidade"
  ]).notNull(),
  title: varchar("title", { length: 255 }), // Título customizado pelo aluno
  position: int("position").notNull().default(0), // Ordem de exibição
  isVisible: boolean("is_visible").notNull().default(true),
  isExpanded: boolean("is_expanded").notNull().default(true),
  config: json("config"), // Configurações específicas do widget (JSON)
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

// ============================================
// 2. TRACKING DE STREAK
// ============================================
export const streakLogs = mysqlTable("streak_logs", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  date: datetime("date").notNull(), // Data do streak (YYYY-MM-DD)
  metasCompletas: int("metas_completas").notNull().default(0),
  questoesResolvidas: int("questoes_resolvidas").notNull().default(0),
  tempoEstudo: int("tempo_estudo").notNull().default(0), // Em minutos
  streakAtivo: boolean("streak_ativo").notNull().default(true), // Se manteve o streak
  protecaoUsada: boolean("protecao_usada").notNull().default(false), // Se usou proteção
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// 3. PROTEÇÕES DE STREAK
// ============================================
export const streakProtections = mysqlTable("streak_protections", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  tipo: mysqlEnum("tipo", ["diaria", "semanal", "mensal"]).notNull(),
  quantidade: int("quantidade").notNull().default(0), // Quantidade disponível
  quantidadeUsada: int("quantidade_usada").notNull().default(0),
  dataExpiracao: datetime("data_expiracao"), // Quando expira (se aplicável)
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

// ============================================
// 4. TELEMETRIA E ANALYTICS
// ============================================
export const telemetryEvents = mysqlTable("telemetry_events", {
  id: varchar("id", { length: 255 }).primaryKey(),
  eventId: varchar("event_id", { length: 255 }).notNull().unique(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  
  // Contexto
  widget: varchar("widget", { length: 100 }).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  category: mysqlEnum("category", ["engagement", "conversion", "error", "performance"]).notNull(),
  
  // Dados
  properties: json("properties"), // Propriedades do evento (JSON)
  metadata: json("metadata"), // Metadados adicionais (JSON)
  
  // Temporal
  timestamp: datetime("timestamp").notNull(),
  timezone: varchar("timezone", { length: 100 }),
  duration: int("duration"), // Duração em ms (se aplicável)
  
  // Device/Browser
  userAgent: text("user_agent"),
  viewport: json("viewport"), // { width, height }
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// 5. CUSTOMIZAÇÕES DO DASHBOARD
// ============================================
export const dashboardCustomizations = mysqlTable("dashboard_customizations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().unique(),
  
  // Preferências visuais
  theme: mysqlEnum("theme", ["light", "dark", "auto"]).notNull().default("light"),
  compactMode: boolean("compact_mode").notNull().default(false),
  
  // Mensagens personalizadas
  heroMessage: text("hero_message"), // Mensagem customizada no Hero Section
  showMotivationalQuotes: boolean("show_motivational_quotes").notNull().default(true),
  
  // Notificações
  notifyStreakRisk: boolean("notify_streak_risk").notNull().default(true),
  notifyDailyGoals: boolean("notify_daily_goals").notNull().default(true),
  notifyAchievements: boolean("notify_achievements").notNull().default(true),
  
  // Gamificação
  showXpBar: boolean("show_xp_bar").notNull().default(true),
  showLeaderboard: boolean("show_leaderboard").notNull().default(true),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

// ============================================
// 6. RESUMOS DIÁRIOS AGREGADOS
// ============================================
export const dailySummaries = mysqlTable("daily_summaries", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  date: datetime("date").notNull(), // Data do resumo (YYYY-MM-DD)
  
  // Metas
  metasPlanejadas: int("metas_planejadas").notNull().default(0),
  metasConcluidas: int("metas_concluidas").notNull().default(0),
  metasEmAndamento: int("metas_em_andamento").notNull().default(0),
  
  // Questões
  questoesResolvidas: int("questoes_resolvidas").notNull().default(0),
  questoesCorretas: int("questoes_corretas").notNull().default(0),
  questoesErradas: int("questoes_erradas").notNull().default(0),
  
  // Tempo
  tempoEstudo: int("tempo_estudo").notNull().default(0), // Em minutos
  tempoQuestoes: int("tempo_questoes").notNull().default(0), // Em minutos
  tempoMateriais: int("tempo_materiais").notNull().default(0), // Em minutos
  
  // Materiais
  materiaisAcessados: int("materiais_acessados").notNull().default(0),
  materiaisConcluidos: int("materiais_concluidos").notNull().default(0),
  
  // Revisões
  revisoesPendentes: int("revisoes_pendentes").notNull().default(0),
  revisoesConcluidas: int("revisoes_concluidas").notNull().default(0),
  
  // Fórum
  postsCreated: int("posts_created").notNull().default(0),
  repliesCreated: int("replies_created").notNull().default(0),
  
  // XP
  xpGanho: int("xp_ganho").notNull().default(0),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

// ============================================
// 7. GAMIFICAÇÃO - XP E NÍVEIS
// ============================================
export const gamificationXp = mysqlTable("gamification_xp", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().unique(),
  
  // XP
  totalXp: int("total_xp").notNull().default(0),
  currentLevel: int("current_level").notNull().default(1),
  xpForNextLevel: int("xp_for_next_level").notNull().default(100),
  
  // Histórico
  lastXpGain: datetime("last_xp_gain"),
  lastLevelUp: datetime("last_level_up"),
  
  // Estatísticas
  totalMetasConcluidas: int("total_metas_concluidas").notNull().default(0),
  totalQuestoesResolvidas: int("total_questoes_resolvidas").notNull().default(0),
  totalMateriaisLidos: int("total_materiais_lidos").notNull().default(0),
  totalRevisoesConcluidas: int("total_revisoes_concluidas").notNull().default(0),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

// ============================================
// 8. GAMIFICAÇÃO - CONQUISTAS
// ============================================
export const gamificationAchievements = mysqlTable("gamification_achievements", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  achievementId: varchar("achievement_id", { length: 255 }).notNull(), // ID da conquista (ex: "first_meta")
  
  // Metadados
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 100 }), // Nome do ícone (Lucide)
  rarity: mysqlEnum("rarity", ["comum", "raro", "epico", "lendario"]).notNull().default("comum"),
  
  // XP
  xpReward: int("xp_reward").notNull().default(0),
  
  // Status
  unlockedAt: datetime("unlocked_at").notNull(),
  viewedAt: datetime("viewed_at"), // Quando o usuário viu a notificação
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// TYPES
// ============================================
export type WidgetConfig = typeof widgetConfigs.$inferSelect;
export type InsertWidgetConfig = typeof widgetConfigs.$inferInsert;

export type StreakLog = typeof streakLogs.$inferSelect;
export type InsertStreakLog = typeof streakLogs.$inferInsert;

export type StreakProtection = typeof streakProtections.$inferSelect;
export type InsertStreakProtection = typeof streakProtections.$inferInsert;

export type TelemetryEvent = typeof telemetryEvents.$inferSelect;
export type InsertTelemetryEvent = typeof telemetryEvents.$inferInsert;

export type DashboardCustomization = typeof dashboardCustomizations.$inferSelect;
export type InsertDashboardCustomization = typeof dashboardCustomizations.$inferInsert;

export type DailySummary = typeof dailySummaries.$inferSelect;
export type InsertDailySummary = typeof dailySummaries.$inferInsert;

export type GamificationXp = typeof gamificationXp.$inferSelect;
export type InsertGamificationXp = typeof gamificationXp.$inferInsert;

export type GamificationAchievement = typeof gamificationAchievements.$inferSelect;
export type InsertGamificationAchievement = typeof gamificationAchievements.$inferInsert;
