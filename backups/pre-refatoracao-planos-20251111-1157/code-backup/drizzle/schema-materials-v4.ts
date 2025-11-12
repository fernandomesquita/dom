// ============================================================================
// MÓDULO DE MATERIAIS V4.0 - Schema Completo
// ============================================================================
// Este arquivo contém as definições de schema para o módulo de Materiais V4.0
// Deve ser importado e adicionado ao schema.ts principal

import { mysqlTable, int, varchar, text, boolean, decimal, timestamp, mysqlEnum, index, uniqueIndex } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

/**
 * MATERIALS - Tabela principal de materiais
 * Sistema completo com categorias, tipos, controle de acesso e estatísticas agregadas
 */
export const materials = mysqlTable("materials", {
  id: int("id").autoincrement().primaryKey(),
  
  // Conteúdo
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnailUrl").notNull(),
  
  // Classificação
  category: mysqlEnum("category", ["base", "revisao", "promo"]).notNull(),
  type: mysqlEnum("type", ["video", "pdf", "audio"]).notNull(),
  
  // Controle de acesso
  isPaid: boolean("isPaid").default(false).notNull(),
  isAvailable: boolean("isAvailable").default(true).notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  
  // Comentários
  commentsEnabled: boolean("commentsEnabled").default(true).notNull(),
  
  // Estatísticas agregadas (cache para performance)
  upvotes: int("upvotes").default(0).notNull(),
  viewCount: int("viewCount").default(0).notNull(),
  downloadCount: int("downloadCount").default(0).notNull(),
  favoriteCount: int("favoriteCount").default(0).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  ratingCount: int("ratingCount").default(0).notNull(),
  
  // Metadados
  createdBy: varchar("createdBy", { length: 36 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  categoryIdx: index("categoryIdx").on(table.category),
  typeIdx: index("typeIdx").on(table.type),
  isPaidIdx: index("isPaidIdx").on(table.isPaid),
  isAvailableIdx: index("isAvailableIdx").on(table.isAvailable),
  isFeaturedIdx: index("isFeaturedIdx").on(table.isFeatured),
  createdAtIdx: index("createdAtIdx").on(table.createdAt),
  
  // Índice composto para queries frequentes
  categoryPaidIdx: index("categoryPaidIdx")
    .on(table.category, table.isPaid, table.isAvailable),
    
  // Nota: Removido titleDescIdx pois MySQL não permite índice em TEXT sem tamanho
  // Para busca full-text, usar FULLTEXT index ou busca via aplicação
}));

/**
 * MATERIAL_ITEMS - Múltiplas instâncias por material
 * Permite um material ter vários vídeos, PDFs ou áudios
 */
export const materialItems = mysqlTable("materialItems", {
  id: int("id").autoincrement().primaryKey(),
  materialId: int("materialId").notNull(),
  
  // Conteúdo
  title: varchar("title", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["video", "pdf", "audio"]).notNull(),
  url: text("url"),                    // Para YouTube/Vimeo
  filePath: text("filePath"),          // Para PDFs/áudios no storage
  
  // Metadados
  duration: int("duration"),           // Segundos
  fileSize: int("fileSize"),           // Bytes
  order: int("order").default(0).notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  materialIdx: index("materialIdx").on(table.materialId),
  orderIdx: index("orderIdx").on(table.order),
}));

/**
 * MATERIAL_LINKS - Integração com Árvore de Conhecimento DOM
 * Vincula materiais à estrutura disciplina > assunto > tópico
 */
export const materialLinks = mysqlTable("materialLinks", {
  id: int("id").autoincrement().primaryKey(),
  materialId: int("materialId").notNull(),
  
  // Referências à Árvore DOM
  disciplinaId: varchar("disciplinaId", { length: 36 }).notNull(),
  assuntoId: varchar("assuntoId", { length: 36 }).notNull(),
  topicoId: varchar("topicoId", { length: 36 }).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  // Índice composto para queries
  matTreeIdx: index("mat_tree_idx")
    .on(table.materialId, table.disciplinaId, table.assuntoId, table.topicoId),
  
  // Unique: um material não pode estar vinculado 2x ao mesmo tópico
  matTopicoUniq: uniqueIndex("mat_topico_uniq")
    .on(table.materialId, table.topicoId),
}));

/**
 * MATERIAL_VIEWS - Rastreamento de visualizações
 * Com índice único para de-duplication (1 visualização por usuário/material/dia)
 */
export const materialViews = mysqlTable("materialViews", {
  id: int("id").autoincrement().primaryKey(),
  materialId: int("materialId").notNull(),
  userId: varchar("userId", { length: 36 }).notNull(),
  
  // Metadados da visualização
  viewedAt: timestamp("viewedAt").defaultNow().notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
}, (table) => ({
  materialIdx: index("materialIdx").on(table.materialId),
  userIdx: index("userIdx").on(table.userId),
  viewedAtIdx: index("viewedAtIdx").on(table.viewedAt),
  
  // Índice composto para trending
  materialTimeIdx: index("materialTimeIdx")
    .on(table.materialId, table.viewedAt),
  
  // De-duplication: 1 visualização por usuário/material
  // Nota: Removido DATE() do índice por incompatibilidade com MySQL 9.4
  // A de-duplicação agora é por usuário/material (sem filtro de dia)
  uniqueView: uniqueIndex("unique_view")
    .on(table.userId, table.materialId),
}));

/**
 * MATERIAL_DOWNLOADS - Rastreamento de downloads
 * Com fingerprint do PDF para auditoria
 */
export const materialDownloads = mysqlTable("materialDownloads", {
  id: int("id").autoincrement().primaryKey(),
  materialId: int("materialId").notNull(),
  materialItemId: int("materialItemId"),
  userId: varchar("userId", { length: 36 }).notNull(),
  
  // Metadados
  downloadedAt: timestamp("downloadedAt").defaultNow().notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  
  // Fingerprint do PDF gerado (para auditoria)
  pdfFingerprint: varchar("pdfFingerprint", { length: 64 }),
}, (table) => ({
  materialIdx: index("materialIdx").on(table.materialId),
  userIdx: index("userIdx").on(table.userId),
  downloadedAtIdx: index("downloadedAtIdx").on(table.downloadedAt),
}));

/**
 * MATERIAL_UPVOTES - Sistema de upvotes
 * Cada usuário pode dar upvote apenas uma vez
 */
export const materialUpvotes = mysqlTable("materialUpvotes", {
  id: int("id").autoincrement().primaryKey(),
  materialId: int("materialId").notNull(),
  userId: varchar("userId", { length: 36 }).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  // Unique: cada usuário pode dar upvote apenas uma vez
  userMaterialIdx: uniqueIndex("userMaterialIdx").on(table.userId, table.materialId),
}));

/**
 * MATERIAL_RATINGS - Sistema de avaliação (1-5 estrelas)
 * Cada usuário pode avaliar apenas uma vez
 */
export const materialRatings = mysqlTable("materialRatings", {
  id: int("id").autoincrement().primaryKey(),
  materialId: int("materialId").notNull(),
  userId: varchar("userId", { length: 36 }).notNull(),
  
  rating: int("rating").notNull(), // 1-5
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  materialIdx: index("materialIdx").on(table.materialId),
  userIdx: index("userIdx").on(table.userId),
  
  // Unique: cada usuário pode avaliar apenas uma vez
  userMaterialRatingIdx: uniqueIndex("userMaterialRatingIdx").on(table.userId, table.materialId),
}));

/**
 * MATERIAL_FAVORITES - Sistema de favoritos
 * Cada usuário pode favoritar apenas uma vez
 */
export const materialFavorites = mysqlTable("materialFavorites", {
  id: int("id").autoincrement().primaryKey(),
  materialId: int("materialId").notNull(),
  userId: varchar("userId", { length: 36 }).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  materialIdx: index("materialIdx").on(table.materialId),
  userIdx: index("userIdx").on(table.userId),
  
  // Unique: cada usuário pode favoritar apenas uma vez
  userMaterialFavIdx: uniqueIndex("userMaterialFavIdx").on(table.userId, table.materialId),
}));

/**
 * MATERIAL_SEEN_MARKS - Marcações "visto"
 * Cada usuário pode marcar como visto apenas uma vez
 */
export const materialSeenMarks = mysqlTable("materialSeenMarks", {
  id: int("id").autoincrement().primaryKey(),
  materialId: int("materialId").notNull(),
  userId: varchar("userId", { length: 36 }).notNull(),
  
  markedAt: timestamp("markedAt").defaultNow().notNull(),
}, (table) => ({
  materialIdx: index("materialIdx").on(table.materialId),
  userIdx: index("userIdx").on(table.userId),
  
  // Unique: cada usuário pode marcar como visto apenas uma vez
  userMaterialSeenIdx: uniqueIndex("userMaterialSeenIdx").on(table.userId, table.materialId),
}));

/**
 * MATERIAL_COMMENTS - Sistema de comentários
 * Suporta threads (comentários aninhados)
 */
export const materialComments = mysqlTable("materialComments", {
  id: int("id").autoincrement().primaryKey(),
  materialId: int("materialId").notNull(),
  userId: varchar("userId", { length: 36 }).notNull(),
  
  // Thread (comentários aninhados)
  parentCommentId: int("parentCommentId"),
  
  content: text("content").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  materialIdx: index("materialIdx").on(table.materialId),
  userIdx: index("userIdx").on(table.userId),
  parentIdx: index("parentIdx").on(table.parentCommentId),
}));

// ============================================================================
// TIPOS EXPORTADOS
// ============================================================================

export type Material = typeof materials.$inferSelect;
export type InsertMaterial = typeof materials.$inferInsert;

export type MaterialItem = typeof materialItems.$inferSelect;
export type InsertMaterialItem = typeof materialItems.$inferInsert;

export type MaterialLink = typeof materialLinks.$inferSelect;
export type InsertMaterialLink = typeof materialLinks.$inferInsert;

export type MaterialView = typeof materialViews.$inferSelect;
export type InsertMaterialView = typeof materialViews.$inferInsert;

export type MaterialDownload = typeof materialDownloads.$inferSelect;
export type InsertMaterialDownload = typeof materialDownloads.$inferInsert;

export type MaterialUpvote = typeof materialUpvotes.$inferSelect;
export type InsertMaterialUpvote = typeof materialUpvotes.$inferInsert;

export type MaterialRating = typeof materialRatings.$inferSelect;
export type InsertMaterialRating = typeof materialRatings.$inferInsert;

export type MaterialFavorite = typeof materialFavorites.$inferSelect;
export type InsertMaterialFavorite = typeof materialFavorites.$inferInsert;

export type MaterialSeenMark = typeof materialSeenMarks.$inferSelect;
export type InsertMaterialSeenMark = typeof materialSeenMarks.$inferInsert;

export type MaterialComment = typeof materialComments.$inferSelect;
export type InsertMaterialComment = typeof materialComments.$inferInsert;
