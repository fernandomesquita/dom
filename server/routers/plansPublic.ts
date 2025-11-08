/**
 * Router Público - Módulo de Planos
 * 
 * Endpoints sem autenticação para listagem e visualização de planos
 */

import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { plans } from '../../drizzle/schema-plans';
import { users } from '../../drizzle/schema';
import { eq, and, like, or, sql, isNull, desc } from 'drizzle-orm';

export const plansPublicRouter = router({
  /**
   * Listagem paginada de planos ativos (página pública /allplans)
   */
  list: publicProcedure
    .input(z.object({
      search: z.string().optional(),
      category: z.enum(['Pago', 'Gratuito']).optional(),
      entity: z.string().optional(),
      editalStatus: z.enum(['Pré-edital', 'Pós-edital', 'N/A']).optional(),
      tag: z.string().optional(),
      page: z.number().int().positive().default(1),
      pageSize: z.number().int().positive().max(100).default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const { search, category, entity, editalStatus, tag, page, pageSize } = input;
      const offset = (page - 1) * pageSize;

      // Construir WHERE clause dinamicamente
      const conditions = [
        eq(plans.isHidden, false), // Usar is_hidden ao invés de status
      ];

      if (search) {
        conditions.push(
          or(
            like(plans.name, `%${search}%`),
            like(plans.description, `%${search}%`),
          )!
        );
      }

      if (category) {
        conditions.push(eq(plans.category, category));
      }

      if (entity) {
        conditions.push(eq(plans.entity, entity));
      }

      if (editalStatus) {
        conditions.push(eq(plans.editalStatus, editalStatus));
      }

      // Query principal
      const items = await db
        .select({
          id: plans.id,
          name: plans.name,
          description: plans.description,
          featuredImageUrl: plans.featuredImageUrl,
          // logoUrl não existe no banco
          category: plans.category,
          entity: plans.entity,
          role: plans.role,
          editalStatus: plans.editalStatus,
          isFeatured: plans.isFeatured,
          price: plans.price,
          tags: plans.tags,
          createdAt: plans.createdAt,
          landingPageUrl: plans.landingPageUrl,
        })
        .from(plans)
        .where(and(...conditions))
        .orderBy(
          desc(plans.isFeatured),  // 1º: Destaque
          sql`CASE WHEN category = 'Pago' THEN 1 ELSE 2 END`,  // 2º: Pagos antes (usar nome literal da coluna)
          desc(plans.createdAt)    // 3º: Mais recentes
        )
        .limit(pageSize)
        .offset(offset);

      // Contar total
      const [{ count }] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(plans)
        .where(and(...conditions));

      return {
        items: items.map(item => ({
          ...item,
          price: item.price || 'Gratuito', // Mostrar valor direto do banco
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
   * Detalhe de um plano específico (preview público)
   */
  getById: publicProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const result = await db
        .select({
          id: plans.id,
          name: plans.name,
          description: plans.description,
          featuredImageUrl: plans.featuredImageUrl,
          // logoUrl não existe
          category: plans.category,
          entity: plans.entity,
          role: plans.role,
          editalStatus: plans.editalStatus,
          isFeatured: plans.isFeatured,
          price: plans.price,
          // durationDays não existe
          tags: plans.tags,
          landingPageUrl: plans.landingPageUrl,
          createdAt: plans.createdAt,
          // mentorId/mentorName não existem
        })
        .from(plans)
        // Remover JOIN com users
        .where(
          and(
            eq(plans.id, input.id),
            eq(plans.isHidden, false)
          )
        )
        .limit(1);

      if (!result.length) {
        throw new Error('Plano não encontrado ou inativo');
      }

      const plan = result[0];

      return {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        featuredImageUrl: plan.featuredImageUrl,
        // logoUrl removido
        category: plan.category,
        entity: plan.entity,
        role: plan.role,
        editalStatus: plan.editalStatus,
        isFeatured: plan.isFeatured,
        price: plan.price || 'Gratuito', // Mostrar valor direto do banco
        // durationDays removido
        tags: plan.tags as string[] || [],
        // mentor removido
        landingPageUrl: plan.landingPageUrl,
        createdAt: plan.createdAt.toISOString(),
      };
    }),
});
