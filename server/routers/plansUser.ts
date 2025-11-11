/**
 * Router Autenticado - Módulo de Planos
 * 
 * Endpoints para usuários logados: matrícula, meus planos, dashboard
 */

import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { plans, planEnrollments } from '../../drizzle/schema-plans';
import { users } from '../../drizzle/schema';
import { eq, and, isNull, desc, sql } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const plansUserRouter = router({
  /**
   * Matricular-se em um plano gratuito
   */
  enroll: protectedProcedure
    .input(z.object({
      planId: z.string().uuid(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const { planId } = input;
      const userId = ctx.user.id;

      // 1. Validar plano
      const [plan] = await db
        .select()
        .from(plans)
        .where(
          and(
            eq(plans.id, planId),
            eq(plans.isHidden, false),
            eq(plans.category, 'Gratuito')
          )
        )
        .limit(1);

      if (!plan) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Plano não disponível para matrícula direta',
        });
      }

      // 2. Verificar se já está matriculado
      const [existing] = await db
        .select()
        .from(planEnrollments)
        .where(
          and(
            eq(planEnrollments.planId, planId),
            eq(planEnrollments.userId, userId)
          )
        )
        .limit(1);

      if (existing) {
        // Idempotente: retornar matrícula existente
        return {
          enrollmentId: existing.id,
          planId,
          userId: userId.toString(),
          enrolledAt: existing.enrolledAt.toISOString(),
          status: existing.status,
          redirectUrl: `/plans/${planId}/dashboard`,
        };
      }

      // 3. Criar matrícula
      const enrollmentId = crypto.randomUUID();
      const expiresAt = plan.validityDate ? new Date(plan.validityDate) : null;

      await db.insert(planEnrollments).values({
        id: enrollmentId,
        planId,
        userId,
        enrolledAt: new Date(),
        expiresAt,
        status: 'Ativo',
        dailyHours: 4,
        createdBy: userId,
      });

      // 4. TODO: Disparar evento para sincronizar metas
      // await events.emit('plan_enrolled', { planId, userId, enrollmentId });

      return {
        enrollmentId,
        planId,
        userId: userId.toString(),
        enrolledAt: new Date().toISOString(),
        status: 'Ativo' as const,
        redirectUrl: `/plans/${planId}/dashboard`,
      };
    }),

  /**
   * Listar planos em que o usuário está matriculado
   */
  myPlans: protectedProcedure
    .input(z.object({
      status: z.enum(['Ativo', 'Expirado', 'Cancelado', 'Suspenso']).optional(),
      page: z.number().int().positive().default(1),
      pageSize: z.number().int().positive().max(100).default(20),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const { status, page, pageSize } = input;
      const userId = ctx.user.id;
      const offset = (page - 1) * pageSize;

      const conditions = [eq(planEnrollments.userId, userId)];
      if (status) {
        conditions.push(eq(planEnrollments.status, status));
      }

      const items = await db
        .select({
          enrollmentId: planEnrollments.id,
          planId: plans.id,
          planName: plans.name,
          featuredImageUrl: plans.featuredImageUrl,
          entity: plans.entity,
          role: plans.role,
          enrolledAt: planEnrollments.enrolledAt,
          expiresAt: planEnrollments.expiresAt,
          status: planEnrollments.status,
        })
        .from(planEnrollments)
        .innerJoin(plans, eq(planEnrollments.planId, plans.id))
        .where(and(...conditions))
        .orderBy(desc(planEnrollments.enrolledAt))
        .limit(pageSize)
        .offset(offset);

      const [{ count }] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(planEnrollments)
        .where(and(...conditions));

      return {
        items: items.map(item => ({
          enrollmentId: item.enrollmentId,
          plan: {
            id: item.planId,
            name: item.planName,
            featuredImageUrl: item.featuredImageUrl,
            entity: item.entity,
            role: item.role,
          },
          enrolledAt: item.enrolledAt.toISOString(),
          expiresAt: item.expiresAt?.toISOString() || null,
          status: item.status,
          progressPercentage: 0,  // TODO: Calcular progresso real
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
   * Dashboard do plano para usuário matriculado
   */
  dashboard: protectedProcedure
    .input(z.object({
      planId: z.string().uuid(),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const { planId } = input;
      const userId = ctx.user.id;

      // 1. Verificar matrícula
      const [enrollment] = await db
        .select()
        .from(planEnrollments)
        .where(
          and(
            eq(planEnrollments.planId, planId),
            eq(planEnrollments.userId, userId),
            eq(planEnrollments.status, 'Ativo')
          )
        )
        .limit(1);

      if (!enrollment) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Você não está matriculado neste plano',
        });
      }

      // 2. Buscar dados do plano
      const [plan] = await db
        .select({
          id: plans.id,
          name: plans.name,
          description: plans.description,
          featuredImageUrl: plans.featuredImageUrl,
          entity: plans.entity,
          role: plans.role,
          mentorId: plans.mentorId,
          mentorName: users.name,
        })
        .from(plans)
        .leftJoin(users, eq(plans.mentorId, users.id))
        .where(eq(plans.id, planId))
        .limit(1);

      if (!plan) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plano não encontrado',
        });
      }

      // 3. TODO: Buscar progresso real (metas, questões, horas)
      const progress = {
        goalsCompleted: 0,
        goalsTotal: 0,
        questionsAttempted: 0,
        questionsCorrect: 0,
        studyHours: 0,
        lastActivity: null as string | null,
      };

      return {
        plan: {
          id: plan.id,
          name: plan.name,
          description: plan.description,
          featuredImageUrl: plan.featuredImageUrl,
          entity: plan.entity,
          role: plan.role,
          mentor: plan.mentorId ? {
            name: plan.mentorName || 'Mentor',
            avatarUrl: null,
          } : null,
        },
        enrollment: {
          enrolledAt: enrollment.enrolledAt.toISOString(),
          expiresAt: enrollment.expiresAt?.toISOString() || null,
          dailyHours: enrollment.dailyHours,
        },
        progress,
        quickActions: {
          continueStudyUrl: `/metas/hoje`,
          practiceQuestionsUrl: `/questions`,
          viewMaterialsUrl: `/materials`,
        },
      };
    }),

  /**
   * Atualizar configurações personalizadas da matrícula
   */
  updateSettings: protectedProcedure
    .input(z.object({
      planId: z.string().uuid(),
      dailyHours: z.number().int().min(1).max(24).optional(),
      customSettings: z.record(z.any()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const { planId, dailyHours, customSettings } = input;
      const userId = ctx.user.id;

      // Verificar matrícula
      const [enrollment] = await db
        .select()
        .from(planEnrollments)
        .where(
          and(
            eq(planEnrollments.planId, planId),
            eq(planEnrollments.userId, userId)
          )
        )
        .limit(1);

      if (!enrollment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Matrícula não encontrada',
        });
      }

      // Atualizar
      const updates: any = {};
      if (dailyHours !== undefined) updates.dailyHours = dailyHours;
      if (customSettings !== undefined) updates.customSettings = customSettings;
      
      // Adicionar availableDays se estiver em customSettings
      if (customSettings?.availableDays !== undefined) {
        updates.availableDays = customSettings.availableDays;
      }

      await db
        .update(planEnrollments)
        .set(updates)
        .where(eq(planEnrollments.id, enrollment.id));

      return { success: true };
    }),
});
