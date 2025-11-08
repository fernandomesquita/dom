import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { avisosTemplates } from "../../drizzle/schema-avisos";
import { eq, desc, like } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { extrairVariaveis, validarVariaveis, gerarPreviewExemplo, processarVariaveis } from "../helpers/variaveis";

/**
 * Router de Templates de Avisos
 * Procedures para gerenciar templates reutilizáveis
 */

export const templatesRouter = router({
  /**
   * CREATE
   * Criar novo template
   */
  create: protectedProcedure
    .input(
      z.object({
        nome: z.string().min(1).max(100),
        descricao: z.string().optional(),
        tipo: z.string(),
        conteudoTemplate: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Validar variáveis
      const validacao = validarVariaveis(input.conteudoTemplate);
      if (!validacao.valido) {
        throw new Error(
          `Variáveis inválidas: ${validacao.variaveisInvalidas.join(", ")}`
        );
      }

      // Extrair variáveis usadas
      const variaveis = extrairVariaveis(input.conteudoTemplate);

      const templateId = uuidv4();
      await db.insert(avisosTemplates).values({
        id: templateId,
        nome: input.nome,
        descricao: input.descricao,
        tipo: input.tipo,
        conteudoTemplate: input.conteudoTemplate,
        variaveisDisponiveis: variaveis,
        criadoPor: ctx.user.id,
        usadoCount: 0,
      });

      return { id: templateId };
    }),

  /**
   * LIST
   * Listar templates com filtros
   */
  list: protectedProcedure
    .input(
      z.object({
        tipo: z.string().optional(),
        busca: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = db.select().from(avisosTemplates);

      // Filtro por tipo
      if (input.tipo) {
        query = query.where(eq(avisosTemplates.tipo, input.tipo)) as any;
      }

      // Filtro por busca
      if (input.busca) {
        query = query.where(like(avisosTemplates.nome, `%${input.busca}%`)) as any;
      }

      const templates = await query.orderBy(desc(avisosTemplates.criadoEm));

      return templates;
    }),

  /**
   * GET BY ID
   * Buscar template por ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [template] = await db
        .select()
        .from(avisosTemplates)
        .where(eq(avisosTemplates.id, input.id))
        .limit(1);

      if (!template) {
        throw new Error("Template não encontrado");
      }

      return template;
    }),

  /**
   * UPDATE
   * Atualizar template existente
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        nome: z.string().min(1).max(100).optional(),
        descricao: z.string().optional(),
        tipo: z.string().optional(),
        conteudoTemplate: z.string().min(1).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...updateData } = input;

      // Se atualizou o conteúdo, revalidar variáveis
      if (updateData.conteudoTemplate) {
        const validacao = validarVariaveis(updateData.conteudoTemplate);
        if (!validacao.valido) {
          throw new Error(
            `Variáveis inválidas: ${validacao.variaveisInvalidas.join(", ")}`
          );
        }

        // Atualizar variáveis disponíveis
        const variaveis = extrairVariaveis(updateData.conteudoTemplate);
        (updateData as any).variaveisDisponiveis = variaveis;
      }

      await db
        .update(avisosTemplates)
        .set(updateData)
        .where(eq(avisosTemplates.id, id));

      return { success: true };
    }),

  /**
   * DELETE
   * Deletar template
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(avisosTemplates).where(eq(avisosTemplates.id, input.id));

      return { success: true };
    }),

  /**
   * PREVIEW COM EXEMPLO
   * Gerar preview do template com dados de exemplo
   */
  previewExemplo: protectedProcedure
    .input(z.object({ conteudo: z.string() }))
    .query(async ({ input }) => {
      const preview = gerarPreviewExemplo(input.conteudo);
      return { preview };
    }),

  /**
   * PREVIEW COM DADOS REAIS
   * Gerar preview do template com dados reais do usuário
   */
  previewReal: protectedProcedure
    .input(
      z.object({
        conteudo: z.string(),
        userId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = input.userId || ctx.user.id;
      const preview = await processarVariaveis(input.conteudo, userId);
      return { preview };
    }),

  /**
   * INCREMENTAR USO
   * Incrementar contador de uso do template
   */
  incrementarUso: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [template] = await db
        .select()
        .from(avisosTemplates)
        .where(eq(avisosTemplates.id, input.id))
        .limit(1);

      if (template) {
        await db
          .update(avisosTemplates)
          .set({ usadoCount: (template.usadoCount || 0) + 1 })
          .where(eq(avisosTemplates.id, input.id));
      }

      return { success: true };
    }),
});
