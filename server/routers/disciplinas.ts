import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { disciplinas, assuntos } from "../../drizzle/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { generateSlug } from "../_core/slug-generator";
import { TRPCError } from "@trpc/server";
import { v4 as uuidv4 } from "uuid";

// ============================================================================
// SCHEMAS DE VALIDAÇÃO
// ============================================================================

const disciplinaInput = z.object({
  codigo: z.string().min(1, "Código é obrigatório").max(20).transform(val => val.trim().toUpperCase()),
  nome: z.string().min(1, "Nome é obrigatório").max(100).transform(val => val.trim()),
  descricao: z.string().optional(),
  corHex: z.string().regex(/^#[0-9A-F]{6}$/i, "Cor inválida (formato: #RRGGBB)").default("#4F46E5"),
  icone: z.string().max(50).optional(),
  sortOrder: z.number().int().min(0).default(100),
});

// ============================================================================
// ROUTER DE DISCIPLINAS
// ============================================================================

export const disciplinasRouter = router({
  // CREATE - Criar nova disciplina (ADMIN ONLY)
  create: adminProcedure
    .input(disciplinaInput)
    .mutation(async ({ ctx, input }) => {
      const slug = generateSlug(input.nome);
      
      // Verificar código duplicado
      const [existingCodigo] = await ctx.db
        .select({ id: disciplinas.id })
        .from(disciplinas)
        .where(eq(disciplinas.codigo, input.codigo))
        .limit(1);
      
      if (existingCodigo) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Código "${input.codigo}" já existe`,
        });
      }
      
      // Verificar slug duplicado
      const [existingSlug] = await ctx.db
        .select({ id: disciplinas.id })
        .from(disciplinas)
        .where(eq(disciplinas.slug, slug))
        .limit(1);
      
      if (existingSlug) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Já existe uma disciplina com nome similar`,
        });
      }
      
      const id = uuidv4();
      
      await ctx.db.insert(disciplinas).values({
        id,
        ...input,
        slug,
        createdBy: ctx.user.id,
        ativo: true,
      });
      
      return { id, slug };
    }),
  
  // READ ALL - Listar todas as disciplinas com paginação
  getAll: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      includeInactive: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      const where = input.includeInactive 
        ? undefined 
        : eq(disciplinas.ativo, true);
      
      const [items, [{ count }]] = await Promise.all([
        ctx.db
          .select()
          .from(disciplinas)
          .where(where)
          .orderBy(disciplinas.sortOrder, disciplinas.nome)
          .limit(input.limit)
          .offset(input.offset),
        
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(disciplinas)
          .where(where),
      ]);
      
      return {
        items,
        total: count,
        hasMore: input.offset + input.limit < count,
      };
    }),
  
  // READ ONE - Buscar disciplina por ID ou slug
  getByIdOrSlug: protectedProcedure
    .input(z.object({
      id: z.string().optional(),
      slug: z.string().optional(),
    }).refine(data => data.id || data.slug, {
      message: "Informe id ou slug",
    }))
    .query(async ({ ctx, input }) => {
      const where = input.id 
        ? eq(disciplinas.id, input.id)
        : eq(disciplinas.slug, input.slug!);
      
      const [disciplina] = await ctx.db
        .select()
        .from(disciplinas)
        .where(where)
        .limit(1);
      
      if (!disciplina) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Disciplina não encontrada",
        });
      }
      
      return disciplina;
    }),
  
  // UPDATE - Atualizar disciplina (ADMIN ONLY)
  update: adminProcedure
    .input(z.object({
      id: z.string(),
      data: disciplinaInput.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      const updates: any = { ...input.data };
      
      // Regenerar slug se nome mudou
      if (input.data.nome) {
        updates.slug = generateSlug(input.data.nome);
        
        // Verificar slug duplicado
        const [existing] = await ctx.db
          .select({ id: disciplinas.id })
          .from(disciplinas)
          .where(and(
            eq(disciplinas.slug, updates.slug),
            sql`${disciplinas.id} != ${input.id}`
          ))
          .limit(1);
        
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Já existe uma disciplina com nome similar",
          });
        }
      }
      
      // Verificar código duplicado
      if (input.data.codigo) {
        const [existing] = await ctx.db
          .select({ id: disciplinas.id })
          .from(disciplinas)
          .where(and(
            eq(disciplinas.codigo, input.data.codigo),
            sql`${disciplinas.id} != ${input.id}`
          ))
          .limit(1);
        
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Código "${input.data.codigo}" já existe`,
          });
        }
      }
      
      const [result] = await ctx.db
        .update(disciplinas)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(disciplinas.id, input.id));
      
      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Disciplina não encontrada",
        });
      }
      
      return { success: true };
    }),
  
  // SOFT DELETE - Desativar disciplina (ADMIN ONLY)
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verificar se tem assuntos ativos
      const [assuntosCount] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(assuntos)
        .where(and(
          eq(assuntos.disciplinaId, input.id),
          eq(assuntos.ativo, true)
        ));
      
      if (assuntosCount && assuntosCount.count > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Não é possível desativar: existem ${assuntosCount.count} assunto(s) ativo(s)`,
        });
      }
      
      const [result] = await ctx.db
        .update(disciplinas)
        .set({
          ativo: false,
          updatedAt: new Date(),
        })
        .where(eq(disciplinas.id, input.id));
      
      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Disciplina não encontrada",
        });
      }
      
      return { success: true };
    }),
  
  // REORDER - Reordenar disciplinas (ADMIN ONLY)
  reorder: adminProcedure
    .input(z.object({
      items: z.array(z.object({
        id: z.string(),
        sortOrder: z.number(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const timestamp = new Date();
      
      // Atualizar em batch
      await Promise.all(
        input.items.map((item) =>
          ctx.db
            .update(disciplinas)
            .set({ 
              sortOrder: item.sortOrder,
              updatedAt: timestamp,
            })
            .where(eq(disciplinas.id, item.id))
        )
      );
      
      return { success: true };
    }),
  
  // STATISTICS - Estatísticas das disciplinas
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const [stats] = await ctx.db
        .select({
          totalActive: sql<number>`sum(case when ${disciplinas.ativo} = 1 then 1 else 0 end)`,
          totalInactive: sql<number>`sum(case when ${disciplinas.ativo} = 0 then 1 else 0 end)`,
        })
        .from(disciplinas);
      
      return {
        totalActive: stats?.totalActive ?? 0,
        totalInactive: stats?.totalInactive ?? 0,
        total: (stats?.totalActive ?? 0) + (stats?.totalInactive ?? 0),
      };
    }),
});
