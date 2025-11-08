/**
 * Schema Drizzle - Módulo de Planos
 * 
 * Tabelas:
 * - plans: Planos de estudo completos (pagos/gratuitos)
 * - plan_enrollments: Matrículas de usuários em planos
 */

import { mysqlTable, varchar, text, decimal, date, int, boolean, timestamp, json, mysqlEnum, uniqueIndex, index } from 'drizzle-orm/mysql-core';
import { users } from './schema';

// ==================== ENUMS ====================

export const planCategoryEnum = mysqlEnum('plan_category', ['Pago', 'Gratuito']);
export const planStatusEnum = mysqlEnum('plan_status', ['Ativo', 'Expirado', 'Oculto', 'Em edição']);
export const editalStatusEnum = mysqlEnum('edital_status', ['Pré-edital', 'Pós-edital', 'N/A']);
export const enrollmentStatusEnum = mysqlEnum('enrollment_status', ['Ativo', 'Expirado', 'Cancelado', 'Suspenso']);

// ==================== TABELA: plans ====================

export const plans = mysqlTable('plans', {
  // Identificação
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  version: varchar('version', { length: 20 }).default('v1.0'),
  
  // Imagens e branding
  logoUrl: varchar('logo_url', { length: 500 }),
  featuredImageUrl: varchar('featured_image_url', { length: 500 }).notNull(),
  landingPageUrl: varchar('landing_page_url', { length: 500 }),
  
  // Classificação e contexto
  category: mysqlEnum('category', ['Pago', 'Gratuito']).notNull(), // Usar enum inline com nome correto da coluna
  editalStatus: editalStatusEnum.default('N/A'),
  entity: varchar('entity', { length: 255 }),        // Ex: "Banco do Brasil"
  role: varchar('role', { length: 255 }),            // Ex: "Agente Comercial"
  tags: json('tags').$type<string[]>().default([]),
  
  // Estrutura de conhecimento (OBRIGATÓRIO)
  // TODO: Adicionar FK quando tabela knowledge_tree estiver disponível
  knowledgeRootId: varchar('knowledge_root_id', { length: 36 }).notNull(),
  
  // Modelo de negócio
  paywallRequired: boolean('paywall_required').default(false),
  price: decimal('price', { precision: 10, scale: 2 }),
  validityDate: date('validity_date'),
  durationDays: int('duration_days'),
  
  // Status e destaque
  status: planStatusEnum.default('Em edição').notNull(),
  isFeatured: boolean('is_featured').default(false),
  isHidden: boolean('is_hidden').default(false).notNull(),
  
  // Responsabilidade e auditoria
  mentorId: int('mentor_id').references(() => users.id, { onDelete: 'set null' }),
  createdBy: int('created_by').references(() => users.id, { onDelete: 'set null' }),
  updatedBy: int('updated_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp('deleted_at'),
  
  // Metadados adicionais
  customSettings: json('custom_settings').$type<Record<string, any>>().default({}),
}, (table) => ({
  // CONSTRAINT: Apenas 1 plano pode estar em destaque
  uniqueFeaturedIdx: uniqueIndex('idx_unique_featured_plan').on(table.isFeatured),
  
  // ÍNDICES para performance
  publicListIdx: index('idx_plans_public_list').on(table.status, table.isFeatured, table.category, table.createdAt),
  entityRoleIdx: index('idx_plans_entity_role').on(table.entity, table.role),
  mentorIdx: index('idx_plans_mentor').on(table.mentorId),
  expiredIdx: index('idx_plans_expired').on(table.validityDate),
  knowledgeRootIdx: index('idx_plans_knowledge_root').on(table.knowledgeRootId),
}));

export type Plan = typeof plans.$inferSelect;
export type InsertPlan = typeof plans.$inferInsert;

// ==================== TABELA: plan_enrollments ====================

export const planEnrollments = mysqlTable('plan_enrollments', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  planId: varchar('plan_id', { length: 36 }).notNull().references(() => plans.id, { onDelete: 'cascade' }),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Datas e validade
  enrolledAt: timestamp('enrolled_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
  lastAccessedAt: timestamp('last_accessed_at'),
  
  // Status e configurações
  status: enrollmentStatusEnum.default('Ativo').notNull(),
  dailyHours: int('daily_hours').default(4).notNull(),
  
  // Personalização por aluno
  customSettings: json('custom_settings').$type<Record<string, any>>().default({}),
  
  // Auditoria
  createdBy: int('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  // CONSTRAINT: Usuário não pode se matricular 2x no mesmo plano
  uniqueEnrollmentIdx: uniqueIndex('idx_unique_enrollment').on(table.planId, table.userId),
  
  // ÍNDICES para performance
  userPlansIdx: index('idx_user_plans').on(table.userId, table.status),
  planEnrollmentsIdx: index('idx_plan_enrollments').on(table.planId, table.status),
  expiredEnrollmentsIdx: index('idx_expired_enrollments').on(table.expiresAt),
}));

export type PlanEnrollment = typeof planEnrollments.$inferSelect;
export type InsertPlanEnrollment = typeof planEnrollments.$inferInsert;

// ==================== TABELA: plan_disciplines ====================

export const planDisciplines = mysqlTable("plan_disciplines", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  planId: varchar("plan_id", { length: 36 }).notNull().references(() => plans.id, { onDelete: "cascade" }),
  disciplineId: varchar("discipline_id", { length: 36 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniquePlanDisciplineIdx: uniqueIndex("idx_unique_plan_discipline").on(table.planId, table.disciplineId),
  planIdIdx: index("idx_plan_disciplines_plan").on(table.planId),
  disciplineIdIdx: index("idx_plan_disciplines_discipline").on(table.disciplineId),
}));

export type PlanDiscipline = typeof planDisciplines.$inferSelect;
export type InsertPlanDiscipline = typeof planDisciplines.$inferInsert;

// ==================== COMENTÁRIOS ====================

/**
 * REGRAS DE NEGÓCIO (implementadas via tRPC procedures):
 * 
 * 1. DESTAQUE ÚNICO:
 *    - Apenas 1 plano pode ter is_featured = TRUE
 *    - Plano em destaque DEVE estar com status = 'Ativo'
 *    - Ao definir novo destaque, remover destaque do anterior
 * 
 * 2. COERÊNCIA DE PAYWALL:
 *    - Se category = 'Pago', então paywall_required = TRUE, price > 0 e landing_page_url != NULL
 *    - Se category = 'Gratuito', então paywall_required = FALSE, price = NULL
 * 
 * 3. EXPIRAÇÃO AUTOMÁTICA:
 *    - Se validity_date < HOJE, então status = 'Expirado' e is_featured = FALSE
 *    - Job agendado verifica expiração diariamente às 00:00
 * 
 * 4. MATRÍCULA:
 *    - Planos gratuitos: matrícula direta via POST /plans/:id/enroll
 *    - Planos pagos: redirecionamento para landing_page_url (pagamento externo)
 *    - Usuário não pode se matricular 2x no mesmo plano (UNIQUE constraint)
 * 
 * 5. SOFT DELETE:
 *    - Planos deletados têm deleted_at != NULL
 *    - Matrículas são mantidas (CASCADE não aplica a soft delete)
 *    - Queries públicas filtram deleted_at IS NULL
 */
