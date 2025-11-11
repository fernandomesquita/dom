import { mysqlTable, varchar, text, mysqlEnum, int, boolean, timestamp, json } from 'drizzle-orm/mysql-core';

// ===== ENUMS =====

export const categoryEnum = mysqlEnum('category', ['Pago', 'Gratuito']);

export const editalStatusEnum = mysqlEnum('edital_status', [
  'Pré-edital',
  'Pós-edital',
  'N/A'
]);

// ===== TABELA PLANS =====

export const plans = mysqlTable('plans', {
  // Identificação
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  description: text('description'),
  
  // Classificação e contexto
  category: categoryEnum.notNull(),
  entity: varchar('entity', { length: 255 }),
  role: varchar('role', { length: 255 }),
  editalStatus: editalStatusEnum.notNull().default('N/A'),
  
  // Imagens e branding
  featuredImageUrl: text('featured_image_url'),
  
  // Modelo de negócio
  price: varchar('price', { length: 50 }), // ⚠️ VARCHAR no banco!
  landingPageUrl: text('landing_page_url'),
  durationDays: int('duration_days'),
  validityDate: timestamp('validity_date'), // ⚠️ DATETIME no banco!
  
  // Tags e categorização
  tags: json('tags').$type<string[]>(),
  
  // Status e destaque
  isFeatured: boolean('is_featured').notNull().default(false),
  isHidden: boolean('is_hidden').notNull().default(false),
  
  // ⭐ CAMPO NOVO (será adicionado por migration)
  // disponivel: boolean('disponivel').notNull().default(true),
  
  // Responsabilidade
  mentorId: int('mentor_id'), // ⚠️ INT no banco!
  
  // Auditoria
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

// ===== TYPES =====

export type Plan = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;

// ===== TABELA: plan_enrollments =====

export const planEnrollments = mysqlTable('plan_enrollments', {
  id: varchar('id', { length: 36 }).primaryKey(),
  planId: varchar('plan_id', { length: 36 }).notNull().references(() => plans.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 36 }).notNull(),
  
  // Datas e validade
  enrolledAt: timestamp('enrolled_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
  lastAccessedAt: timestamp('last_accessed_at'),
  
  // Status e configurações
  status: mysqlEnum('status', ['Ativo', 'Expirado', 'Cancelado', 'Suspenso']).default('Ativo').notNull(),
  dailyHours: int('daily_hours').default(4).notNull(),
  
  // Personalização por aluno
  customSettings: json('custom_settings').$type<Record<string, any>>().default({}),
  
  // Auditoria
  createdBy: varchar('created_by', { length: 36 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export type PlanEnrollment = typeof planEnrollments.$inferSelect;
export type InsertPlanEnrollment = typeof planEnrollments.$inferInsert;

// ===== TABELA: plan_disciplines =====

export const planDisciplines = mysqlTable("plan_disciplines", {
  id: varchar("id", { length: 36 }).primaryKey(),
  planId: varchar("plan_id", { length: 36 }).notNull().references(() => plans.id, { onDelete: "cascade" }),
  disciplineId: varchar("discipline_id", { length: 36 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PlanDiscipline = typeof planDisciplines.$inferSelect;
export type InsertPlanDiscipline = typeof planDisciplines.$inferInsert;
