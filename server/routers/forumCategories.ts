import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { publicProcedure, router, protectedProcedure } from '../_core/trpc';
import { getDb } from '../db';
import { forumCategories } from '../../drizzle/schema-forum';
import { randomUUID } from 'crypto';
import { TRPCError } from '@trpc/server';

/**
 * Router de Categorias do Fórum
 */
export const forumCategoriesRouter = router({
  /**
   * Listar todas as categorias ativas
   */
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

    const categories = await db
      .select()
      .from(forumCategories)
      .where(eq(forumCategories.isAtiva, true))
      .orderBy(forumCategories.ordem);

    return categories;
  }),

  /**
   * Listar todas as categorias (incluindo inativas) - Admin
   */
  listAll: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== 'admin') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Apenas administradores' });
    }

    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

    const categories = await db
      .select()
      .from(forumCategories)
      .orderBy(forumCategories.ordem);

    return categories;
  }),

  /**
   * Criar nova categoria - Admin
   */
  create: protectedProcedure
    .input(
      z.object({
        nome: z.string().min(3).max(100),
        descricao: z.string().optional(),
        icone: z.string().optional(),
        cor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
        ordem: z.number().int().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Apenas administradores' });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const id = randomUUID();

      await db.insert(forumCategories).values({
        id,
        nome: input.nome,
        descricao: input.descricao,
        icone: input.icone,
        cor: input.cor,
        ordem: input.ordem,
        isAtiva: true,
      });

      const [categoria] = await db
        .select()
        .from(forumCategories)
        .where(eq(forumCategories.id, id));

      return categoria;
    }),

  /**
   * Atualizar categoria - Admin
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        nome: z.string().min(3).max(100).optional(),
        descricao: z.string().optional(),
        icone: z.string().optional(),
        cor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
        ordem: z.number().int().optional(),
        isAtiva: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Apenas administradores' });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const { id, ...data } = input;

      await db
        .update(forumCategories)
        .set(data)
        .where(eq(forumCategories.id, id));

      const [categoria] = await db
        .select()
        .from(forumCategories)
        .where(eq(forumCategories.id, id));

      return categoria;
    }),

  /**
   * Deletar categoria - Admin
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Apenas administradores' });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Soft delete: marcar como inativa
      await db
        .update(forumCategories)
        .set({ isAtiva: false })
        .where(eq(forumCategories.id, input.id));

      return { success: true };
    }),

  /**
   * Reordenar categorias - Admin
   */
  reorder: protectedProcedure
    .input(
      z.object({
        categorias: z.array(
          z.object({
            id: z.string().uuid(),
            ordem: z.number().int(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Apenas administradores' });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Atualizar ordem de cada categoria
      for (const cat of input.categorias) {
        await db
          .update(forumCategories)
          .set({ ordem: cat.ordem })
          .where(eq(forumCategories.id, cat.id));
      }

      return { success: true };
    }),
});
