import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { sidebarItems } from "../../drizzle/schema";
import { eq, asc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

/**
 * Router: Sidebar
 * 
 * Gerencia os itens da sidebar do aluno.
 * 
 * Procedures:
 * - list: Lista todos os itens visíveis (ordenados por ordem)
 * - create: Cria um novo item (apenas admin)
 * - update: Atualiza um item existente (apenas admin)
 * - delete: Remove um item (apenas admin)
 * - reorder: Reordena itens (apenas admin)
 */

export const sidebarRouter = router({
  // Lista todos os itens visíveis da sidebar (ordenados por ordem)
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const items = await db
      .select()
      .from(sidebarItems)
      .where(eq(sidebarItems.visivel, true))
      .orderBy(asc(sidebarItems.ordem));

    return items;
  }),

  // Lista TODOS os itens (incluindo ocultos) - apenas admin
  listAll: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "MASTER" && ctx.user.role !== "ADMINISTRATIVO") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem acessar" });
    }

    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const items = await db
      .select()
      .from(sidebarItems)
      .orderBy(asc(sidebarItems.ordem));

    return items;
  }),

  // Cria um novo item - apenas admin
  create: protectedProcedure
    .input(
      z.object({
        label: z.string().min(1).max(100),
        icon: z.string().min(1).max(50),
        path: z.string().min(1).max(255),
        ordem: z.number().int().min(0).default(0),
        visivel: z.boolean().default(true),
        cor: z.string().max(50).default("gray"),
        descricao: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "MASTER" && ctx.user.role !== "ADMINISTRATIVO") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem criar itens" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [newItem] = await db.insert(sidebarItems).values(input);

      return { success: true, id: newItem.insertId };
    }),

  // Atualiza um item existente - apenas admin
  update: protectedProcedure
    .input(
      z.object({
        id: z.number().int(),
        label: z.string().min(1).max(100).optional(),
        icon: z.string().min(1).max(50).optional(),
        path: z.string().min(1).max(255).optional(),
        ordem: z.number().int().min(0).optional(),
        visivel: z.boolean().optional(),
        cor: z.string().max(50).optional(),
        descricao: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "MASTER" && ctx.user.role !== "ADMINISTRATIVO") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem atualizar itens" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const { id, ...data } = input;
      await db.update(sidebarItems).set(data).where(eq(sidebarItems.id, id));

      return { success: true };
    }),

  // Remove um item - apenas admin
  delete: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "MASTER" && ctx.user.role !== "ADMINISTRATIVO") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem remover itens" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      await db.delete(sidebarItems).where(eq(sidebarItems.id, input.id));

      return { success: true };
    }),

  // Reordena itens - apenas admin
  reorder: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            id: z.number().int(),
            ordem: z.number().int().min(0),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "MASTER" && ctx.user.role !== "ADMINISTRATIVO") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem reordenar itens" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Atualiza a ordem de cada item
      for (const item of input.items) {
        await db.update(sidebarItems).set({ ordem: item.ordem }).where(eq(sidebarItems.id, item.id));
      }

      return { success: true };
    }),
});
