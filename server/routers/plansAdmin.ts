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
  if (ctx.user.role !== 'MASTER' && ctx.user.role !== 'ADMINISTRATIVO') {
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
      slug: z.string().optional(), // Frontend envia mas não é usado
      description: z.string().optional(),
      logoUrl: z.string().url().optional(),
      featuredImageUrl: z.string().url().optional(),
      landingPageUrl: z.string().url().optional(),
      category: z.enum(['Pago', 'Gratuito']),
      editalStatus: z.enum(['Pré-edital', 'Pós-edital', 'N/A']).optional(),
      entity: z.string().optional(),
      role: z.string().optional(),
      knowledgeRootId: z.string().uuid().optional(),
      price: z.string().optional(), // Frontend envia como string
      validityDate: z.string().optional(),  // ISO date
      durationDays: z.number().int().positive().optional(),
      mentorId: z.number().int().optional(),
      tags: z.array(z.string()).optional(),
      isHidden: z.boolean().optional(),
      isFeatured: z.boolean().optional(),
      disponivel: z.boolean().optional(),
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

      // Gerar slug automaticamente se não fornecido
      const slug = input.slug || 
        input.name.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

      await db.insert(plans).values({
        id: planId,
        name: input.name,
        slug: slug,
        description: input.description || null,
        logoUrl: input.logoUrl || null,
        featuredImageUrl: input.featuredImageUrl || null,
        landingPageUrl: input.landingPageUrl || null,
        category: input.category,
        editalStatus: input.editalStatus || 'N/A',
        entity: input.entity || null,
        role: input.role || null,
        knowledgeRootId: input.knowledgeRootId || null,
        paywallRequired: input.category === 'Pago',
        price: input.price || null,
        validityDate: input.validityDate || null,
        durationDays: input.durationDays || null,
        mentorId: input.mentorId || null,
        tags: input.tags || [],
        status: 'Em edição',
        isHidden: input.isHidden ?? false,
        isFeatured: input.isFeatured ?? false,
        disponivel: input.disponivel ?? true,
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

      // ✅ LOGS DE DEBUG:
      console.log('🔍 ============ DATABASE DEBUG ============');
      console.log('🔍 [DB] Connection URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@'));
      
      // Query para ver QUAL banco está conectado:
      const [dbInfo] = await db.execute(sql`
        SELECT 
          DATABASE() as current_database,
          USER() as current_user,
          @@hostname as hostname,
          @@port as port
      `);
      console.log('🔍 [DB] Banco conectado:', dbInfo);
      
      // Query para contar registros em CADA tabela:
      try {
        const [plansCount] = await db.execute(sql`SELECT COUNT(*) as total FROM plans`);
        console.log('🔍 [DB] Registros em "plans":', plansCount);
      } catch (e) {
        console.log('🔍 [DB] Erro ao contar "plans":', e.message);
      }
      
      try {
        const [metasCount] = await db.execute(sql`SELECT COUNT(*) as total FROM metas_planos_estudo`);
        console.log('🔍 [DB] Registros em "metas_planos_estudo":', metasCount);
      } catch (e) {
        console.log('🔍 [DB] Erro ao contar "metas_planos_estudo":', e.message);
      }
      
      console.log('🔍 [listAll] Iniciando query de planos');
      console.log('🔍 [listAll] Input:', input);

      const { search, status, category, mentorId, page, pageSize } = input;
      const offset = (page - 1) * pageSize;

      const conditions = [isNull(plans.deletedAt)];
      console.log('🔍 [listAll] Conditions iniciais:', conditions);

      if (search) {
        conditions.push(
          or(
            like(plans.name, `%${search}%`),
            like(plans.entity, `%${search}%`),
          )!
        );
      }

      if (status) {
        conditions.push(eq(plans.editalStatus, status));
        console.log('🔍 [listAll] Adicionou filtro status:', status);
      }
      if (category) conditions.push(eq(plans.category, category));
      if (mentorId) conditions.push(eq(plans.mentorId, mentorId));

      const items = await db
        .select()
        .from(plans)
        .where(and(...conditions))
        .orderBy(desc(plans.createdAt))
        .limit(pageSize)
        .offset(offset);

      console.log('🔍 [listAll] Resultados encontrados:', items.length);
      console.log('🔍 [listAll] Primeiro item:', items[0]);

      const [{ count }] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(plans)
        .where(and(...conditions));

      console.log('🔍 [listAll] Total de registros:', count);

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
