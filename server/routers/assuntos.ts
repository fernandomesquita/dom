import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { assuntos, disciplinas, topicos } from "../../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import { generateSlug } from "../_core/slug-generator";
import { TRPCError } from "@trpc/server";
import { v4 as uuidv4 } from "uuid";

// ============================================================================
// SCHEMAS DE VALIDAÇÃO
// ============================================================================

const assuntoInput = z.object({
  disciplinaId: z.string().uuid("ID da disciplina inválido"),
  codigo: z.string().max(20).optional().transform(val => val ? val.trim().toUpperCase() : undefined),
  nome: z.string().min(1, "Nome é obrigatório").max(150).transform(val => val.trim()),
  descricao: z.string().optional(),
  sortOrder: z.number().int().min(0).default(100),
});

// ============================================================================
// ROUTER DE ASSUNTOS
// ============================================================================

export const assuntosRouter = router({
  // CREATE - Criar novo assunto (ADMIN ONLY)
  create: adminProcedure
    .input(assuntoInput)
    .mutation(async ({ ctx, input }) => {
      const slug = generateSlug(input.nome);
      
      // Gerar código automaticamente se não fornecido
      let codigo = input.codigo;
      if (!codigo) {
        const prefix = input.nome.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
        const timestamp = Date.now().toString().slice(-6);
        codigo = `${prefix}${timestamp}`;
      }
      
      // Verificar se disciplina existe
      const [disciplina] = await ctx.db
        .select({ id: disciplinas.id })
        .from(disciplinas)
        .where(eq(disciplinas.id, input.disciplinaId))
        .limit(1);
      
      if (!disciplina) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Disciplina não encontrada",
        });
      }
      
      // Verificar código duplicado NO ESCOPO da disciplina
      const [existingCodigo] = await ctx.db
        .select({ id: assuntos.id })
        .from(assuntos)
        .where(and(
          eq(assuntos.disciplinaId, input.disciplinaId),
          eq(assuntos.codigo, codigo)
        ))
        .limit(1);
      
      if (existingCodigo) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Código "${input.codigo}" já existe nesta disciplina`,
        });
      }
      
      // Verificar slug duplicado NO ESCOPO da disciplina
      const [existingSlug] = await ctx.db
        .select({ id: assuntos.id })
        .from(assuntos)
        .where(and(
          eq(assuntos.disciplinaId, input.disciplinaId),
          eq(assuntos.slug, slug)
        ))
        .limit(1);
      
      if (existingSlug) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Já existe um assunto com nome similar nesta disciplina`,
        });
      }
      
      const id = uuidv4();
      
      await ctx.db.insert(assuntos).values({
        id,
        ...input,
        codigo,
        slug,
        createdBy: ctx.user.id,
        ativo: true,
      });
      
      return { id, slug };
    }),
  
  // READ ALL - Listar todos os assuntos com paginação
  getAll: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(500).default(100),
      offset: z.number().min(0).default(0),
      includeInactive: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      const where = input.includeInactive
        ? undefined
        : eq(assuntos.ativo, true);
      
      const [items, [{ count }]] = await Promise.all([
        ctx.db
          .select({
            id: assuntos.id,
            codigo: assuntos.codigo,
            nome: assuntos.nome,
            descricao: assuntos.descricao,
            slug: assuntos.slug,
            disciplinaId: assuntos.disciplinaId,
            sortOrder: assuntos.sortOrder,
            ativo: assuntos.ativo,
            createdAt: assuntos.createdAt,
          })
          .from(assuntos)
          .where(where)
          .orderBy(assuntos.sortOrder, assuntos.nome)
          .limit(input.limit)
          .offset(input.offset),
        
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(assuntos)
          .where(where),
      ]);
      
      return {
        items,
        total: count,
        hasMore: input.offset + input.limit < count,
      };
    }),
  
  // READ BY DISCIPLINE - Listar assuntos de uma disciplina com paginação
  getByDiscipline: protectedProcedure
    .input(z.object({
      disciplinaId: z.string().uuid(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      includeInactive: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      const where = input.includeInactive
        ? eq(assuntos.disciplinaId, input.disciplinaId)
        : and(
            eq(assuntos.disciplinaId, input.disciplinaId),
            eq(assuntos.ativo, true)
          );
      
      const [items, [{ count }]] = await Promise.all([
        ctx.db
          .select()
          .from(assuntos)
          .where(where)
          .orderBy(assuntos.sortOrder, assuntos.nome)
          .limit(input.limit)
          .offset(input.offset),
        
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(assuntos)
          .where(where),
      ]);
      
      return {
        items,
        total: count,
        hasMore: input.offset + input.limit < count,
      };
    }),
  
  // READ ONE - Buscar assunto por ID ou slug
  getByIdOrSlug: protectedProcedure
    .input(z.object({
      id: z.string().optional(),
      slug: z.string().optional(),
      disciplinaId: z.string().uuid().optional(), // Necessário quando buscar por slug
    }).refine(data => data.id || (data.slug && data.disciplinaId), {
      message: "Informe id ou (slug + disciplinaId)",
    }))
    .query(async ({ ctx, input }) => {
      let where;
      
      if (input.id) {
        where = eq(assuntos.id, input.id);
      } else {
        where = and(
          eq(assuntos.slug, input.slug!),
          eq(assuntos.disciplinaId, input.disciplinaId!)
        );
      }
      
      const [assunto] = await ctx.db
        .select()
        .from(assuntos)
        .where(where)
        .limit(1);
      
      if (!assunto) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Assunto não encontrado",
        });
      }
      
      return assunto;
    }),
  
  // UPDATE - Atualizar assunto (ADMIN ONLY)
  update: adminProcedure
    .input(z.object({
      id: z.string(),
      data: assuntoInput.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Buscar assunto atual
      const [currentAssunto] = await ctx.db
        .select()
        .from(assuntos)
        .where(eq(assuntos.id, input.id))
        .limit(1);
      
      if (!currentAssunto) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Assunto não encontrado",
        });
      }
      
      const updates: any = { ...input.data };
      const disciplinaId = input.data.disciplinaId || currentAssunto.disciplinaId;
      
      // Verificar se disciplina existe (se mudou)
      if (input.data.disciplinaId && input.data.disciplinaId !== currentAssunto.disciplinaId) {
        const [disciplina] = await ctx.db
          .select({ id: disciplinas.id })
          .from(disciplinas)
          .where(eq(disciplinas.id, input.data.disciplinaId))
          .limit(1);
        
        if (!disciplina) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Disciplina não encontrada",
          });
        }
      }
      
      // Regenerar slug se nome mudou
      if (input.data.nome) {
        updates.slug = generateSlug(input.data.nome);
        
        // Verificar slug duplicado NO ESCOPO da disciplina
        const [existing] = await ctx.db
          .select({ id: assuntos.id })
          .from(assuntos)
          .where(and(
            eq(assuntos.disciplinaId, disciplinaId),
            eq(assuntos.slug, updates.slug),
            sql`${assuntos.id} != ${input.id}`
          ))
          .limit(1);
        
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Já existe um assunto com nome similar nesta disciplina",
          });
        }
      }
      
      // Verificar código duplicado NO ESCOPO da disciplina
      if (input.data.codigo) {
        const [existing] = await ctx.db
          .select({ id: assuntos.id })
          .from(assuntos)
          .where(and(
            eq(assuntos.disciplinaId, disciplinaId),
            eq(assuntos.codigo, input.data.codigo),
            sql`${assuntos.id} != ${input.id}`
          ))
          .limit(1);
        
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Código "${input.data.codigo}" já existe nesta disciplina`,
          });
        }
      }
      
      await ctx.db
        .update(assuntos)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(assuntos.id, input.id));
      
      return { success: true };
    }),
  
  // SOFT DELETE - Desativar assunto (ADMIN ONLY)
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verificar se tem tópicos ativos
      const [topicosCount] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(topicos)
        .where(and(
          eq(topicos.assuntoId, input.id),
          eq(topicos.ativo, true)
        ));
      
      if (topicosCount && topicosCount.count > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Não é possível desativar: existem ${topicosCount.count} tópico(s) ativo(s)`,
        });
      }
      
      const [result] = await ctx.db
        .update(assuntos)
        .set({
          ativo: false,
          updatedAt: new Date(),
        })
        .where(eq(assuntos.id, input.id));
      
      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Assunto não encontrado",
        });
      }
      
      return { success: true };
    }),
  
  // REORDER - Reordenar assuntos dentro de uma disciplina (ADMIN ONLY)
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
            .update(assuntos)
            .set({ 
              sortOrder: item.sortOrder,
              updatedAt: timestamp,
            })
            .where(eq(assuntos.id, item.id))
        )
      );
      
      return { success: true };
    }),
  
  // STATISTICS - Estatísticas dos assuntos por disciplina
  getStats: protectedProcedure
    .input(z.object({
      disciplinaId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const [stats] = await ctx.db
        .select({
          totalActive: sql<number>`sum(case when ${assuntos.ativo} = 1 then 1 else 0 end)`,
          totalInactive: sql<number>`sum(case when ${assuntos.ativo} = 0 then 1 else 0 end)`,
        })
        .from(assuntos)
        .where(eq(assuntos.disciplinaId, input.disciplinaId));
      
      return {
        totalActive: stats?.totalActive ?? 0,
        totalInactive: stats?.totalInactive ?? 0,
        total: (stats?.totalActive ?? 0) + (stats?.totalInactive ?? 0),
      };
    }),
});
