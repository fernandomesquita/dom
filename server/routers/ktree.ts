import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { disciplinas, assuntos, topicos } from "../../drizzle/schema";
import { eq, and, like, or } from "drizzle-orm";

/**
 * Router de Taxonomia (KTree)
 * Endpoints para buscar disciplinas, assuntos e tópicos
 */
export const ktreeRouter = router({
  /**
   * Listar todas as disciplinas ativas
   */
  listDisciplinas: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = db
        .select({
          id: disciplinas.id,
          codigo: disciplinas.codigo,
          nome: disciplinas.nome,
          descricao: disciplinas.descricao,
          corHex: disciplinas.corHex,
          icone: disciplinas.icone,
        })
        .from(disciplinas)
        .where(eq(disciplinas.ativo, true))
        .$dynamic();

      if (input?.search) {
        query = query.where(
          or(
            like(disciplinas.nome, `%${input.search}%`),
            like(disciplinas.codigo, `%${input.search}%`)
          )
        );
      }

      const result = await query.orderBy(disciplinas.sortOrder);
      return result;
    }),

  /**
   * Listar assuntos de uma disciplina
   */
  listAssuntos: publicProcedure
    .input(
      z.object({
        disciplinaId: z.string(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = db
        .select({
          id: assuntos.id,
          codigo: assuntos.codigo,
          nome: assuntos.nome,
          descricao: assuntos.descricao,
          disciplinaId: assuntos.disciplinaId,
        })
        .from(assuntos)
        .where(
          and(
            eq(assuntos.disciplinaId, input.disciplinaId),
            eq(assuntos.ativo, true)
          )
        )
        .$dynamic();

      if (input.search) {
        query = query.where(
          or(
            like(assuntos.nome, `%${input.search}%`),
            like(assuntos.codigo, `%${input.search}%`)
          )
        );
      }

      const result = await query.orderBy(assuntos.sortOrder);
      return result;
    }),

  /**
   * Listar tópicos de um assunto
   */
  listTopicos: publicProcedure
    .input(
      z.object({
        assuntoId: z.string(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = db
        .select({
          id: topicos.id,
          codigo: topicos.codigo,
          nome: topicos.nome,
          descricao: topicos.descricao,
          assuntoId: topicos.assuntoId,
          disciplinaId: topicos.disciplinaId,
        })
        .from(topicos)
        .where(
          and(
            eq(topicos.assuntoId, input.assuntoId),
            eq(topicos.ativo, true)
          )
        )
        .$dynamic();

      if (input.search) {
        query = query.where(
          or(
            like(topicos.nome, `%${input.search}%`),
            like(topicos.codigo, `%${input.search}%`)
          )
        );
      }

      const result = await query.orderBy(topicos.sortOrder);
      return result;
    }),

  /**
   * Buscar breadcrumb completo (disciplina > assunto > tópico)
   */
  getBreadcrumb: publicProcedure
    .input(
      z.object({
        disciplinaId: z.string().optional(),
        assuntoId: z.string().optional(),
        topicoId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result: {
        disciplina?: { id: string; nome: string; codigo: string };
        assunto?: { id: string; nome: string; codigo: string };
        topico?: { id: string; nome: string; codigo: string };
      } = {};

      if (input.disciplinaId) {
        const [disc] = await db
          .select({
            id: disciplinas.id,
            nome: disciplinas.nome,
            codigo: disciplinas.codigo,
          })
          .from(disciplinas)
          .where(eq(disciplinas.id, input.disciplinaId))
          .limit(1);
        if (disc) result.disciplina = disc;
      }

      if (input.assuntoId) {
        const [ass] = await db
          .select({
            id: assuntos.id,
            nome: assuntos.nome,
            codigo: assuntos.codigo,
          })
          .from(assuntos)
          .where(eq(assuntos.id, input.assuntoId))
          .limit(1);
        if (ass) result.assunto = ass;
      }

      if (input.topicoId) {
        const [top] = await db
          .select({
            id: topicos.id,
            nome: topicos.nome,
            codigo: topicos.codigo,
          })
          .from(topicos)
          .where(eq(topicos.id, input.topicoId))
          .limit(1);
        if (top) result.topico = top;
      }

      return result;
    }),
});
