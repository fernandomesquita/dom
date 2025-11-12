import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { topicos, assuntos, disciplinas } from "../../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import { generateSlug } from "../_core/slug-generator";
import { TRPCError } from "@trpc/server";
import { v4 as uuidv4 } from "uuid";

// ============================================================================
// SCHEMAS DE VALIDAÇÃO
// ============================================================================

const topicoInput = z.object({
  assuntoId: z.string().uuid("ID do assunto inválido"),
  codigo: z.string().max(20).optional().transform(val => val ? val.trim().toUpperCase() : undefined),
  nome: z.string().min(1, "Nome é obrigatório").max(200).transform(val => val.trim()),
  descricao: z.string().optional(),
  sortOrder: z.number().int().min(0).default(100),
});

// ============================================================================
// ROUTER DE TÓPICOS
// ============================================================================

export const topicosRouter = router({
  // CREATE - Criar novo tópico (ADMIN ONLY)
  create: adminProcedure
    .input(topicoInput)
    .mutation(async ({ ctx, input }) => {
      const slug = generateSlug(input.nome);
      
      // Gerar código automaticamente se não fornecido
      let codigo = input.codigo;
      if (!codigo) {
        const prefix = input.nome.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
        const timestamp = Date.now().toString().slice(-6);
        codigo = `${prefix}${timestamp}`;
      }
      
      // Verificar se assunto existe e buscar disciplinaId
      const [assunto] = await ctx.db
        .select({ 
          id: assuntos.id,
          disciplinaId: assuntos.disciplinaId,
        })
        .from(assuntos)
        .where(eq(assuntos.id, input.assuntoId))
        .limit(1);
      
      if (!assunto) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Assunto não encontrado",
        });
      }
      
      // Verificar código duplicado NO ESCOPO do assunto
      const [existingCodigo] = await ctx.db
        .select({ id: topicos.id })
        .from(topicos)
        .where(and(
          eq(topicos.assuntoId, input.assuntoId),
          eq(topicos.codigo, codigo)
        ))
        .limit(1);
      
      if (existingCodigo) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Código "${input.codigo}" já existe neste assunto`,
        });
      }
      
      // Verificar slug duplicado NO ESCOPO do assunto
      const [existingSlug] = await ctx.db
        .select({ id: topicos.id })
        .from(topicos)
        .where(and(
          eq(topicos.assuntoId, input.assuntoId),
          eq(topicos.slug, slug)
        ))
        .limit(1);
      
      if (existingSlug) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Já existe um tópico com nome similar neste assunto`,
        });
      }
      
      const id = uuidv4();
      
      // Criar tópico com disciplinaId denormalizado
      await ctx.db.insert(topicos).values({
        id,
        ...input,
        codigo,
        slug,
        disciplinaId: assunto.disciplinaId, // Denormalização estratégica
        createdBy: ctx.user.id,
        ativo: true,
      });
      
      return { id, slug };
    }),
  
  // READ ALL - Listar todos os tópicos (ADMIN)
  getAll: adminProcedure
    .query(async ({ ctx }) => {
      const items = await ctx.db
        .select()
        .from(topicos)
        .orderBy(topicos.sortOrder, topicos.nome);
      
      return items;
    }),
  
  // READ BY ASSUNTO - Listar tópicos de um assunto com paginação
  getByAssunto: protectedProcedure
    .input(z.object({
      assuntoId: z.string().uuid(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      includeInactive: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      const where = input.includeInactive
        ? eq(topicos.assuntoId, input.assuntoId)
        : and(
            eq(topicos.assuntoId, input.assuntoId),
            eq(topicos.ativo, true)
          );
      
      const [items, [{ count }]] = await Promise.all([
        ctx.db
          .select()
          .from(topicos)
          .where(where)
          .orderBy(topicos.sortOrder, topicos.nome)
          .limit(input.limit)
          .offset(input.offset),
        
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(topicos)
          .where(where),
      ]);
      
      return {
        items,
        total: count,
        hasMore: input.offset + input.limit < count,
      };
    }),
  
  // READ BY DISCIPLINE - Listar tópicos de uma disciplina (usa disciplinaId denormalizado)
  getByDiscipline: protectedProcedure
    .input(z.object({
      disciplinaId: z.string().uuid(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      includeInactive: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      const where = input.includeInactive
        ? eq(topicos.disciplinaId, input.disciplinaId)
        : and(
            eq(topicos.disciplinaId, input.disciplinaId),
            eq(topicos.ativo, true)
          );
      
      const [items, [{ count }]] = await Promise.all([
        ctx.db
          .select()
          .from(topicos)
          .where(where)
          .orderBy(topicos.sortOrder, topicos.nome)
          .limit(input.limit)
          .offset(input.offset),
        
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(topicos)
          .where(where),
      ]);
      
      return {
        items,
        total: count,
        hasMore: input.offset + input.limit < count,
      };
    }),
  
  // READ ONE - Buscar tópico por ID ou slug
  getByIdOrSlug: protectedProcedure
    .input(z.object({
      id: z.string().optional(),
      slug: z.string().optional(),
      assuntoId: z.string().uuid().optional(), // Necessário quando buscar por slug
    }).refine(data => data.id || (data.slug && data.assuntoId), {
      message: "Informe id ou (slug + assuntoId)",
    }))
    .query(async ({ ctx, input }) => {
      let where;
      
      if (input.id) {
        where = eq(topicos.id, input.id);
      } else {
        where = and(
          eq(topicos.slug, input.slug!),
          eq(topicos.assuntoId, input.assuntoId!)
        );
      }
      
      const [topico] = await ctx.db
        .select()
        .from(topicos)
        .where(where)
        .limit(1);
      
      if (!topico) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tópico não encontrado",
        });
      }
      
      return topico;
    }),
  
  // UPDATE - Atualizar tópico (ADMIN ONLY)
  update: adminProcedure
    .input(z.object({
      id: z.string(),
      data: topicoInput.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Buscar tópico atual
      const [currentTopico] = await ctx.db
        .select()
        .from(topicos)
        .where(eq(topicos.id, input.id))
        .limit(1);
      
      if (!currentTopico) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tópico não encontrado",
        });
      }
      
      const updates: any = { ...input.data };
      let assuntoId = input.data.assuntoId || currentTopico.assuntoId;
      let disciplinaId = currentTopico.disciplinaId;
      
      // Verificar se assunto existe (se mudou) e atualizar disciplinaId
      if (input.data.assuntoId && input.data.assuntoId !== currentTopico.assuntoId) {
        const [assunto] = await ctx.db
          .select({ 
            id: assuntos.id,
            disciplinaId: assuntos.disciplinaId,
          })
          .from(assuntos)
          .where(eq(assuntos.id, input.data.assuntoId))
          .limit(1);
        
        if (!assunto) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Assunto não encontrado",
          });
        }
        
        // Atualizar disciplinaId denormalizado
        updates.disciplinaId = assunto.disciplinaId;
        disciplinaId = assunto.disciplinaId;
      }
      
      // Regenerar slug se nome mudou
      if (input.data.nome) {
        updates.slug = generateSlug(input.data.nome);
        
        // Verificar slug duplicado NO ESCOPO do assunto
        const [existing] = await ctx.db
          .select({ id: topicos.id })
          .from(topicos)
          .where(and(
            eq(topicos.assuntoId, assuntoId),
            eq(topicos.slug, updates.slug),
            sql`${topicos.id} != ${input.id}`
          ))
          .limit(1);
        
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Já existe um tópico com nome similar neste assunto",
          });
        }
      }
      
      // Verificar código duplicado NO ESCOPO do assunto
      if (input.data.codigo) {
        const [existing] = await ctx.db
          .select({ id: topicos.id })
          .from(topicos)
          .where(and(
            eq(topicos.assuntoId, assuntoId),
            eq(topicos.codigo, input.data.codigo),
            sql`${topicos.id} != ${input.id}`
          ))
          .limit(1);
        
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Código "${input.data.codigo}" já existe neste assunto`,
          });
        }
      }
      
      await ctx.db
        .update(topicos)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(topicos.id, input.id));
      
      return { success: true };
    }),
  
  // SOFT DELETE - Desativar tópico (ADMIN ONLY)
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Verificar se tem materiais ou questões vinculados
      // Por enquanto, apenas desativar
      
      const [result] = await ctx.db
        .update(topicos)
        .set({
          ativo: false,
          updatedAt: new Date(),
        })
        .where(eq(topicos.id, input.id));
      
      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tópico não encontrado",
        });
      }
      
      return { success: true };
    }),
  
  // REORDER - Reordenar tópicos dentro de um assunto (ADMIN ONLY)
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
            .update(topicos)
            .set({ 
              sortOrder: item.sortOrder,
              updatedAt: timestamp,
            })
            .where(eq(topicos.id, item.id))
        )
      );
      
      return { success: true };
    }),
  
  // STATISTICS - Estatísticas dos tópicos por assunto
  getStats: protectedProcedure
    .input(z.object({
      assuntoId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const [stats] = await ctx.db
        .select({
          totalActive: sql<number>`sum(case when ${topicos.ativo} = 1 then 1 else 0 end)`,
          totalInactive: sql<number>`sum(case when ${topicos.ativo} = 0 then 1 else 0 end)`,
        })
        .from(topicos)
        .where(eq(topicos.assuntoId, input.assuntoId));
      
      return {
        totalActive: stats?.totalActive ?? 0,
        totalInactive: stats?.totalInactive ?? 0,
        total: (stats?.totalActive ?? 0) + (stats?.totalInactive ?? 0),
      };
    }),
});
