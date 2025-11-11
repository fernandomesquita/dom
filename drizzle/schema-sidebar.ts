import { int, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Tabela: sidebar_items
 * 
 * Gerencia os itens da sidebar do aluno que podem ser customizados via admin.
 * 
 * Campos:
 * - id: ID único do item
 * - label: Texto exibido no menu (ex: "Dashboard", "Questões")
 * - icon: Nome do ícone do lucide-react (ex: "LayoutDashboard", "FileQuestion")
 * - path: Caminho da rota (ex: "/dashboard", "/questoes")
 * - ordem: Ordem de exibição (menor = primeiro)
 * - visivel: Se o item está visível ou oculto
 * - cor: Cor do ícone (ex: "blue", "green", "purple")
 * - criadoEm: Data de criação
 * - atualizadoEm: Data de atualização
 */

export const sidebarItems = mysqlTable("sidebar_items", {
  id: int("id").autoincrement().primaryKey(),
  label: varchar("label", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 50 }).notNull(), // Nome do ícone do lucide-react
  path: varchar("path", { length: 255 }).notNull(),
  ordem: int("ordem").notNull().default(0),
  visivel: boolean("visivel").notNull().default(true),
  cor: varchar("cor", { length: 50 }).default("gray"), // Cor do ícone
  descricao: text("descricao"), // Descrição opcional para tooltip
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
  atualizadoEm: timestamp("atualizado_em").defaultNow().onUpdateNow().notNull(),
});

export type SidebarItem = typeof sidebarItems.$inferSelect;
export type InsertSidebarItem = typeof sidebarItems.$inferInsert;
