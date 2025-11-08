import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { avisosTemplates } from "../../drizzle/schema-avisos";
import { eq, desc, like, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { extrairVariaveis, validarVariaveis, gerarPreviewExemplo, processarVariaveis, VARIAVEIS_DISPONIVEIS } from "../helpers/variaveis";

/**
 * Router de Templates de Avisos (Admin)
 * Procedures para gerenciar templates reutilizáveis
 */

export const avisosTemplatesRouter = router({
  /**
   * LIST TEMPLATES
   * Listar templates disponíveis
   */
  listTemplates: protectedProcedure
    .input(
      z.object({
        tipo: z.enum(["informativo", "importante", "urgente", "individual", "premium"]).optional(),
        busca: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Construir condições
      const conditions = [];
      if (input.tipo) conditions.push(eq(avisosTemplates.tipo, input.tipo));
      if (input.busca) {
        conditions.push(like(avisosTemplates.nome, `%${input.busca}%`));
      }

      const templates = await db
        .select()
        .from(avisosTemplates)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(avisosTemplates.usadoCount), desc(avisosTemplates.criadoEm));

      return templates;
    }),

  /**
   * CREATE TEMPLATE
   * Criar novo template
   */
  createTemplate: protectedProcedure
    .input(
      z.object({
        nome: z.string().min(1).max(100),
        descricao: z.string().optional(),
        tipo: z.enum(["informativo", "importante", "urgente", "individual", "premium"]),
        conteudoTemplate: z.string().min(1),
        variaveisDisponiveis: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const templateId = uuidv4();
      const agora = new Date();

      // Validar variáveis
      const validacao = validarVariaveis(input.conteudoTemplate);
      if (!validacao.valido) {
        throw new Error(
          `Variáveis inválidas: ${validacao.variaveisInvalidas.join(", ")}`
        );
      }

      // Extrair variáveis usadas
      const variaveis = extrairVariaveis(input.conteudoTemplate);

      await db.insert(avisosTemplates).values({
        id: templateId,
        nome: input.nome,
        descricao: input.descricao,
        tipo: input.tipo,
        conteudoTemplate: input.conteudoTemplate,
        variaveisDisponiveis: variaveis as any,
        criadoPor: ctx.user.id,
        criadoEm: agora,
        usadoCount: 0,
      });

      return { id: templateId };
    }),

  /**
   * USE TEMPLATE
   * Usar template para criar aviso (retorna dados preenchidos)
   */
  useTemplate: protectedProcedure
    .input(
      z.object({
        templateId: z.string().uuid(),
        variaveis: z.record(z.string(), z.string()).optional(), // Ex: { "{{nome_aluno}}": "João" }
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Buscar template
      const [template] = await db
        .select()
        .from(avisosTemplates)
        .where(eq(avisosTemplates.id, input.templateId))
        .limit(1);

      if (!template) {
        throw new Error("Template not found");
      }

      // Processar variáveis com dados reais do usuário
      const conteudoFinal = await processarVariaveis(
        template.conteudoTemplate,
        ctx.user.id
      );

      // Incrementar contador de uso
      await db
        .update(avisosTemplates)
        .set({
          usadoCount: template.usadoCount + 1,
        })
        .where(eq(avisosTemplates.id, input.templateId));

      // Retornar dados do aviso preenchido
      return {
        tipo: template.tipo,
        conteudo: conteudoFinal,
        titulo: template.nome,
      };
    }),

  /**
   * PREVIEW EXEMPLO
   * Gerar preview do template com dados de exemplo
   */
  previewExemplo: protectedProcedure
    .input(z.object({ conteudo: z.string() }))
    .query(async ({ input }) => {
      const preview = gerarPreviewExemplo(input.conteudo);
      const variaveis = extrairVariaveis(input.conteudo);
      return { preview, variaveis };
    }),

  /**
   * PREVIEW REAL
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
   * GET VARIAVEIS DISPONIVEIS
   * Retornar lista de variáveis suportadas
   */
  getVariaveisDisponiveis: protectedProcedure.query(() => {
    return VARIAVEIS_DISPONIVEIS;
  }),

  /**
   * UPDATE TEMPLATE
   * Atualizar template existente
   */
  updateTemplate: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        nome: z.string().min(1).max(100).optional(),
        descricao: z.string().optional(),
        tipo: z.enum(["informativo", "importante", "urgente", "individual", "premium"]).optional(),
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
   * DELETE TEMPLATE
   * Deletar template
   */
  deleteTemplate: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(avisosTemplates).where(eq(avisosTemplates.id, input.id));

      return { success: true };
    }),
});
