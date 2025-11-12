import {
  boolean,
  datetime,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  index,
} from "drizzle-orm/mysql-core";

/**
 * Schema de Avisos/Notificações
 * Sistema completo de comunicação admin → alunos
 */

export const notices = mysqlTable("notices", {
  id: varchar("id", { length: 36 }).primaryKey(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  conteudo: text("conteudo").notNull(), // HTML do Tiptap
  tipo: mysqlEnum("tipo", ["INFORMATIVO", "IMPORTANTE", "URGENTE", "MANUTENCAO"]).default("INFORMATIVO").notNull(),
  prioridade: int("prioridade").default(0).notNull(), // 0-10 (maior = mais prioritário)
  
  // Segmentação
  destinatarios: mysqlEnum("destinatarios", ["TODOS", "PLANO_ESPECIFICO", "ROLE_ESPECIFICA", "USUARIOS_ESPECIFICOS"]).default("TODOS").notNull(),
  planoId: varchar("plano_id", { length: 36 }), // Se destinatarios = PLANO_ESPECIFICO
  roleDestino: mysqlEnum("role_destino", ["ALUNO", "PROFESSOR", "MENTOR", "ADMINISTRATIVO", "MASTER"]), // Se destinatarios = ROLE_ESPECIFICA
  usuariosIds: json("usuarios_ids"), // Array de IDs se destinatarios = USUARIOS_ESPECIFICOS
  
  // Agendamento
  agendado: boolean("agendado").default(false).notNull(),
  dataPublicacao: datetime("data_publicacao"), // NULL = publicar imediatamente
  dataExpiracao: datetime("data_expiracao"), // NULL = sem expiração
  
  // Status
  publicado: boolean("publicado").default(false).notNull(),
  rascunho: boolean("rascunho").default(true).notNull(),
  
  // Metadados
  criadoPor: varchar("criado_por", { length: 36 }).notNull(),
  visualizacoes: int("visualizacoes").default(0).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  tipoIdx: index("idx_tipo").on(table.tipo),
  destinatariosIdx: index("idx_destinatarios").on(table.destinatarios),
  planoIdIdx: index("idx_plano_id").on(table.planoId),
  publicadoIdx: index("idx_publicado").on(table.publicado),
  dataPublicacaoIdx: index("idx_data_publicacao").on(table.dataPublicacao),
  criadoPorIdx: index("idx_criado_por").on(table.criadoPor),
}));

/**
 * Tabela de leituras de avisos (para tracking)
 */
export const noticeReads = mysqlTable("notice_reads", {
  id: varchar("id", { length: 36 }).primaryKey(),
  noticeId: varchar("notice_id", { length: 36 }).notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  lido: boolean("lido").default(true).notNull(),
  lidoEm: timestamp("lido_em").defaultNow().notNull(),
}, (table) => ({
  noticeIdIdx: index("idx_notice_id").on(table.noticeId),
  userIdIdx: index("idx_user_id").on(table.userId),
  uniqueRead: index("idx_unique_read").on(table.noticeId, table.userId),
}));

export type Notice = typeof notices.$inferSelect;
export type InsertNotice = typeof notices.$inferInsert;
export type NoticeRead = typeof noticeReads.$inferSelect;
export type InsertNoticeRead = typeof noticeReads.$inferInsert;
