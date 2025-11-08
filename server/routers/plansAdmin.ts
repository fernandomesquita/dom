/**
 * Router Admin - Módulo de Planos
 * 
 * Endpoints para administradores: CRUD completo, estatísticas, gestão de destaque
 */

import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { plans, planEnrollments, planDisciplines } from '../../drizzle/schema-plans';
import { eq, and, isNull, desc, sql, or, like } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

// Helper para verificar se usuário é admin
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
  }
  return next({ ctx });
});

export const plansAdminRouter = router({
  /**
   * Criar novo plano
   */
  create: adminProcedure
    .input(z.object({
      name: z.string().min(3).max(255),
      description: z.string().optional(),
      logoUrl: z.string().url().optional(),
      featuredImageUrl: z.string().url(),
      landingPageUrl: z.string().url().optional(),
      category: z.enum(['Pago', 'Gratuito']),
      editalStatus: z.enum(['Pré-edital', 'Pós-edital', 'N/A']).optional(),
      entity: z.string().optional(),
      role: z.string().optional(),
      knowledgeRootId: z.string().uuid(),
      price: z.number().positive().optional(),
      validityDate: z.string().optional(),  // ISO date
      durationDays: z.number().int().positive().optional(),
      mentorId: z.number().int().optional(),
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Validações de negócio
      if (input.category === 'Pago') {
        if (!input.price || !input.landingPageUrl) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Planos pagos devem ter price e landing_page_url',
          });
        }
      }

      const planId = crypto.randomUUID();

      await db.insert(plans).values({
        id: planId,
        name: input.name,
        description: input.description,
        logoUrl: input.logoUrl,
        featuredImageUrl: input.featuredImageUrl,
        landingPageUrl: input.landingPageUrl,
        category: input.category,
        editalStatus: input.editalStatus || 'N/A',
        entity: input.entity,
        role: input.role,
        knowledgeRootId: input.knowledgeRootId,
        paywallRequired: input.category === 'Pago',
        price: input.price ? input.price.toString() : null,
        validityDate: input.validityDate,
        durationDays: input.durationDays,
        mentorId: input.mentorId,
        tags: input.tags || [],
        status: 'Em edição',
        createdBy: ctx.user.id,
        updatedBy: ctx.user.id,
      });

      return {
        id: planId,
        name: input.name,
        status: 'Em edição' as const,
        createdAt: new Date().toISOString(),
      };
    }),

  /**
   * Atualizar plano existente
   */
  update: adminProcedure
    .input(z.object({
      id: z.string().uuid(),
      name: z.string().min(3).max(255).optional(),
      description: z.string().optional(),
      logoUrl: z.string().url().optional(),
      featuredImageUrl: z.string().url().optional(),
      landingPageUrl: z.string().url().optional(),
      category: z.enum(['Pago', 'Gratuito']).optional(),
      editalStatus: z.enum(['Pré-edital', 'Pós-edital', 'N/A']).optional(),
      entity: z.string().optional(),
      role: z.string().optional(),
      status: z.enum(['Ativo', 'Expirado', 'Oculto', 'Em edição']).optional(),
      price: z.number().positive().optional(),
      validityDate: z.string().optional(),
      durationDays: z.number().int().positive().optional(),
      mentorId: z.number().int().optional(),
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const { id, ...updates } = input;

      // Verificar se plano existe
      const [existing] = await db
        .select()
        .from(plans)
        .where(and(eq(plans.id, id), isNull(plans.deletedAt)))
        .limit(1);

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plano não encontrado',
        });
      }

      // Validações de negócio
      const finalCategory = updates.category || existing.category;
      if (finalCategory === 'Pago') {
        const finalPrice = updates.price || existing.price;
        const finalLandingPage = updates.landingPageUrl || existing.landingPageUrl;
        if (!finalPrice || !finalLandingPage) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Planos pagos devem ter price e landing_page_url',
          });
        }
      }

      // Atualizar
      const updateData: any = { ...updates, updatedBy: ctx.user.id };
      if (updates.price) updateData.price = updates.price.toString();
      if (updates.category) updateData.paywallRequired = updates.category === 'Pago';

      await db
        .update(plans)
        .set(updateData)
        .where(eq(plans.id, id));

      return { success: true };
    }),

  /**
   * Soft delete de plano
   */
  delete: adminProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db
        .update(plans)
        .set({
          deletedAt: new Date(),
          isFeatured: false,  // Remover destaque ao deletar
        })
        .where(eq(plans.id, input.id));

      return { success: true };
    }),

  /**
   * Definir plano em destaque (apenas 1)
   */
  setFeatured: adminProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Verificar se plano está ativo
      const [plan] = await db
        .select()
        .from(plans)
        .where(and(eq(plans.id, input.id), isNull(plans.deletedAt)))
        .limit(1);

      if (!plan) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plano não encontrado',
        });
      }

      if (plan.status !== 'Ativo') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Apenas planos ativos podem ser destacados',
        });
      }

      // Remover destaque de todos os outros
      await db
        .update(plans)
        .set({ isFeatured: false })
        .where(eq(plans.isFeatured, true));

      // Definir novo destaque
      await db
        .update(plans)
        .set({ isFeatured: true })
        .where(eq(plans.id, input.id));

      return { success: true };
    }),

  /**
   * Listar todos os planos (incluindo ocultos/expirados)
   */
  listAll: adminProcedure
    .input(z.object({
      search: z.string().optional(),
      status: z.enum(['Ativo', 'Expirado', 'Oculto', 'Em edição']).optional(),
      category: z.enum(['Pago', 'Gratuito']).optional(),
      mentorId: z.number().int().optional(),
      page: z.number().int().positive().default(1),
      pageSize: z.number().int().positive().max(100).default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const { search, status, category, mentorId, page, pageSize } = input;
      const offset = (page - 1) * pageSize;

      const conditions = [isNull(plans.deletedAt)];

      if (search) {
        conditions.push(
          or(
            like(plans.name, `%${search}%`),
            like(plans.entity, `%${search}%`),
          )!
        );
      }

      if (status) conditions.push(eq(plans.status, status));
      if (category) conditions.push(eq(plans.category, category));
      if (mentorId) conditions.push(eq(plans.mentorId, mentorId));

      const items = await db
        .select()
        .from(plans)
        .where(and(...conditions))
        .orderBy(desc(plans.createdAt))
        .limit(pageSize)
        .offset(offset);

      const [{ count }] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(plans)
        .where(and(...conditions));

      return {
        items: items.map(item => ({
          ...item,
          price: item.price ? `R$ ${parseFloat(item.price.toString()).toFixed(2)}` : null,
          tags: item.tags as string[] || [],
        })),
        pagination: {
          page,
          pageSize,
          totalItems: count,
          totalPages: Math.ceil(count / pageSize),
        },
      };
    }),

  /**
   * Estatísticas de um plano
   */
  getStats: adminProcedure
    .input(z.object({
      planId: z.string().uuid(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Total de matrículas
      const [{ totalEnrollments }] = await db
        .select({ totalEnrollments: sql<number>`COUNT(*)` })
        .from(planEnrollments)
        .where(eq(planEnrollments.planId, input.planId));

      // Matrículas ativas
      const [{ activeEnrollments }] = await db
        .select({ activeEnrollments: sql<number>`COUNT(*)` })
        .from(planEnrollments)
        .where(
          and(
            eq(planEnrollments.planId, input.planId),
            eq(planEnrollments.status, 'Ativo')
          )
        );

      // TODO: Calcular taxa de conclusão, tempo médio de estudo, etc.

      return {
        totalEnrollments,
        activeEnrollments,
        completionRate: 0,
        avgStudyHours: 0,
      };
    }),

  /**
   * Vincular disciplina ao plano
   */
  linkDiscipline: adminProcedure
    .input(z.object({
      planId: z.string().uuid(),
      disciplineId: z.string().uuid(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      await db.insert(planDisciplines).values({
        planId: input.planId,
        disciplineId: input.disciplineId,
      }).onDuplicateKeyUpdate({ set: { planId: input.planId } });

      return { success: true };
    }),

  /**
   * Desvincular disciplina do plano
   */
  unlinkDiscipline: adminProcedure
    .input(z.object({
      planId: z.string().uuid(),
      disciplineId: z.string().uuid(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      await db.delete(planDisciplines).where(
        and(
          eq(planDisciplines.planId, input.planId),
          eq(planDisciplines.disciplineId, input.disciplineId)
        )
      );

      return { success: true };
    }),

  /**
   * Listar disciplinas de um plano
   */
  listDisciplines: adminProcedure
    .input(z.object({
      planId: z.string().uuid(),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const result = await db.select().from(planDisciplines).where(
        eq(planDisciplines.planId, input.planId)
      );

      return result;
    }),
});
