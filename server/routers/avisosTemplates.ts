import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { avisosTemplates } from "../../drizzle/schema-avisos";
import { eq, desc, like, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

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

      await db.insert(avisosTemplates).values({
        id: templateId,
        nome: input.nome,
        descricao: input.descricao,
        tipo: input.tipo,
        conteudoTemplate: input.conteudoTemplate,
        variaveisDisponiveis: input.variaveisDisponiveis as any,
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

      // Substituir variáveis no conteúdo
      let conteudoFinal = template.conteudoTemplate;
      if (input.variaveis) {
        Object.entries(input.variaveis).forEach(([chave, valor]) => {
          conteudoFinal = conteudoFinal.replace(new RegExp(chave, "g"), valor);
        });
      }

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
});
