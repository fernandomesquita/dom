import { z } from "zod";
import { router, adminProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { disciplinas, assuntos, topicos, taxonomiaImports, auditLogs } from "../../drizzle/schema";
import { generateSlug } from "../_core/slug-generator";
import { TRPCError } from "@trpc/server";
import { v4 as uuidv4 } from "uuid";
import { eq, and, sql } from "drizzle-orm";
import * as XLSX from "xlsx";

/**
 * Router de Importação em Batch da Taxonomia
 * Permite importar Disciplinas, Assuntos e Tópicos via Excel
 */

// ============================================================================
// SCHEMAS DE VALIDAÇÃO
// ============================================================================

const disciplinaImportSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().optional(),
  corHex: z.string().regex(/^#[0-9A-F]{6}$/i, "Cor inválida").default("#4F46E5"),
  icone: z.string().optional(),
});

const assuntoImportSchema = z.object({
  disciplinaNome: z.string().min(1, "Nome da disciplina é obrigatório"),
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().optional(),
});

const topicoImportSchema = z.object({
  disciplinaNome: z.string().min(1, "Nome da disciplina é obrigatório"),
  assuntoNome: z.string().min(1, "Nome do assunto é obrigatório"),
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().optional(),
});

const batchImportSchema = z.object({
  disciplinas: z.array(disciplinaImportSchema),
  assuntos: z.array(assuntoImportSchema),
  topicos: z.array(topicoImportSchema),
});

// ============================================================================
// HELPER: Gerar código automático
// ============================================================================

function generateCodigo(nome: string, prefix?: string): string {
  const slug = generateSlug(nome);
  const code = slug.toUpperCase().replace(/-/g, '_').substring(0, 10);
  return prefix ? `${prefix}-${code}` : code;
}

async function getNextSequence(db: any, disciplinaId?: string, assuntoId?: string): Promise<number> {
  if (assuntoId) {
    // Próximo número de tópico dentro do assunto
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(topicos)
      .where(eq(topicos.assuntoId, assuntoId));
    return (result?.count || 0) + 1;
  } else if (disciplinaId) {
    // Próximo número de assunto dentro da disciplina
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(assuntos)
      .where(eq(assuntos.disciplinaId, disciplinaId));
    return (result?.count || 0) + 1;
  }
  return 1;
}

// ============================================================================
// ROUTER
// ============================================================================

export const taxonomiaImportRouter = router({
  /**
   * Gerar template Excel para download
   */
  generateTemplate: adminProcedure.mutation(async () => {
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Disciplinas
    const disciplinasData = [
      ["nome", "descricao", "corHex", "icone"],
      ["Direito Constitucional", "Estudo da Constituição Federal", "#4F46E5", "book"],
      ["Direito Administrativo", "Princípios e atos administrativos", "#10B981", "briefcase"],
    ];
    const disciplinasSheet = XLSX.utils.aoa_to_sheet(disciplinasData);
    XLSX.utils.book_append_sheet(workbook, disciplinasSheet, "Disciplinas");

    // Sheet 2: Assuntos
    const assuntosData = [
      ["disciplinaNome", "nome", "descricao"],
      ["Direito Constitucional", "Princípios Fundamentais", "Art. 1º ao 4º da CF"],
      ["Direito Constitucional", "Direitos e Garantias", "Art. 5º ao 17 da CF"],
    ];
    const assuntosSheet = XLSX.utils.aoa_to_sheet(assuntosData);
    XLSX.utils.book_append_sheet(workbook, assuntosSheet, "Assuntos");

    // Sheet 3: Tópicos
    const topicosData = [
      ["disciplinaNome", "assuntoNome", "nome", "descricao"],
      ["Direito Constitucional", "Princípios Fundamentais", "Fundamentos da República", "Art. 1º da CF"],
      ["Direito Constitucional", "Princípios Fundamentais", "Objetivos Fundamentais", "Art. 3º da CF"],
    ];
    const topicosSheet = XLSX.utils.aoa_to_sheet(topicosData);
    XLSX.utils.book_append_sheet(workbook, topicosSheet, "Tópicos");

    // Converter para buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    const base64 = buffer.toString("base64");

    return {
      filename: "template-taxonomia.xlsx",
      data: base64,
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  }),

  /**
   * Preview de importação (validar sem salvar)
   */
  previewImport: adminProcedure
    .input(z.object({
      base64Data: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const buffer = Buffer.from(input.base64Data, "base64");
      const workbook = XLSX.read(buffer, { type: "buffer" });

      // Ler sheets
      const disciplinasSheet = workbook.Sheets["Disciplinas"];
      const assuntosSheet = workbook.Sheets["Assuntos"];
      const topicosSheet = workbook.Sheets["Tópicos"];

      if (!disciplinasSheet || !assuntosSheet || !topicosSheet) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Excel inválido. Certifique-se de que possui as 3 sheets: Disciplinas, Assuntos, Tópicos",
        });
      }

      // Converter para JSON
      const disciplinasRaw = XLSX.utils.sheet_to_json(disciplinasSheet);
      const assuntosRaw = XLSX.utils.sheet_to_json(assuntosSheet);
      const topicosRaw = XLSX.utils.sheet_to_json(topicosSheet);

      // Validar dados
      const disciplinasValidadas = disciplinasRaw.map((row: any, index) => {
        try {
          const validated = disciplinaImportSchema.parse({
            nome: row.nome,
            descricao: row.descricao || "",
            corHex: row.corHex || "#4F46E5",
            icone: row.icone || "",
          });
          return {
            ...validated,
            codigo: generateCodigo(validated.nome),
            linha: index + 2,
            valido: true,
            erro: null,
          };
        } catch (error: any) {
          return {
            nome: row.nome || "",
            linha: index + 2,
            valido: false,
            erro: error.errors?.[0]?.message || "Dados inválidos",
          };
        }
      });

      const assuntosValidados = assuntosRaw.map((row: any, index) => {
        try {
          const validated = assuntoImportSchema.parse({
            disciplinaNome: row.disciplinaNome,
            nome: row.nome,
            descricao: row.descricao || "",
          });
          
          // Verificar se disciplina existe no preview
          const disciplinaExiste = disciplinasValidadas.some(
            (d) => d.valido && d.nome === validated.disciplinaNome
          );

          if (!disciplinaExiste) {
            throw new Error(`Disciplina "${validated.disciplinaNome}" não encontrada`);
          }

          return {
            ...validated,
            codigo: "AUTO", // Será gerado no import
            linha: index + 2,
            valido: true,
            erro: null,
          };
        } catch (error: any) {
          return {
            nome: row.nome || "",
            disciplinaNome: row.disciplinaNome || "",
            linha: index + 2,
            valido: false,
            erro: error.message || "Dados inválidos",
          };
        }
      });

      const topicosValidados = topicosRaw.map((row: any, index) => {
        try {
          const validated = topicoImportSchema.parse({
            disciplinaNome: row.disciplinaNome,
            assuntoNome: row.assuntoNome,
            nome: row.nome,
            descricao: row.descricao || "",
          });

          // Verificar se assunto existe no preview
          const assuntoExiste = assuntosValidados.some(
            (a) =>
              a.valido &&
              a.nome === validated.assuntoNome &&
              a.disciplinaNome === validated.disciplinaNome
          );

          if (!assuntoExiste) {
            throw new Error(`Assunto "${validated.assuntoNome}" não encontrado`);
          }

          return {
            ...validated,
            codigo: "AUTO", // Será gerado no import
            linha: index + 2,
            valido: true,
            erro: null,
          };
        } catch (error: any) {
          return {
            nome: row.nome || "",
            assuntoNome: row.assuntoNome || "",
            disciplinaNome: row.disciplinaNome || "",
            linha: index + 2,
            valido: false,
            erro: error.message || "Dados inválidos",
          };
        }
      });

      const totalValidos =
        disciplinasValidadas.filter((d) => d.valido).length +
        assuntosValidados.filter((a) => a.valido).length +
        topicosValidados.filter((t) => t.valido).length;

      const totalInvalidos =
        disciplinasValidadas.filter((d) => !d.valido).length +
        assuntosValidados.filter((a) => !a.valido).length +
        topicosValidados.filter((t) => !t.valido).length;

      return {
        disciplinas: disciplinasValidadas,
        assuntos: assuntosValidados,
        topicos: topicosValidados,
        resumo: {
          totalDisciplinas: disciplinasValidadas.length,
          totalAssuntos: assuntosValidados.length,
          totalTopicos: topicosValidados.length,
          totalValidos,
          totalInvalidos,
          podeSalvar: totalInvalidos === 0,
        },
      };
    }),

  /**
   * Importar em batch (salvar no banco)
   */
  importBatch: adminProcedure
    .input(z.object({
      base64Data: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const buffer = Buffer.from(input.base64Data, "base64");
      const workbook = XLSX.read(buffer, { type: "buffer" });

      // Ler e validar (mesmo código do preview)
      const disciplinasSheet = workbook.Sheets["Disciplinas"];
      const assuntosSheet = workbook.Sheets["Assuntos"];
      const topicosSheet = workbook.Sheets["Tópicos"];

      const disciplinasRaw = XLSX.utils.sheet_to_json(disciplinasSheet);
      const assuntosRaw = XLSX.utils.sheet_to_json(assuntosSheet);
      const topicosRaw = XLSX.utils.sheet_to_json(topicosSheet);

      const batchId = uuidv4();
      const importId = uuidv4();
      const disciplinasMap = new Map<string, string>(); // nome -> id
      const assuntosMap = new Map<string, string>(); // disciplinaNome|assuntoNome -> id
      const disciplinasIds: string[] = [];
      const assuntosIds: string[] = [];
      const topicosIds: string[] = [];

      // 1. Inserir disciplinas
      for (const row of disciplinasRaw) {
        const data = disciplinaImportSchema.parse(row);
        const codigo = generateCodigo(data.nome);
        const slug = generateSlug(data.nome);
        const id = uuidv4();

        await db.insert(disciplinas).values({
          id,
          codigo,
          slug,
          nome: data.nome,
          descricao: data.descricao || null,
          corHex: data.corHex,
          icone: data.icone || null,
          sortOrder: 100,
          createdBy: ctx.user.id,
          ativo: true,
        });

        disciplinasMap.set(data.nome, id);
        disciplinasIds.push(id);
      }

      // 2. Inserir assuntos
      for (const row of assuntosRaw) {
        const data = assuntoImportSchema.parse(row);
        const disciplinaId = disciplinasMap.get(data.disciplinaNome);

        if (!disciplinaId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Disciplina "${data.disciplinaNome}" não encontrada`,
          });
        }

        const seq = await getNextSequence(db, disciplinaId);
        const codigo = `${seq.toString().padStart(2, "0")}`;
        const slug = generateSlug(data.nome);
        const id = uuidv4();

        await db.insert(assuntos).values({
          id,
          disciplinaId,
          codigo,
          slug,
          nome: data.nome,
          descricao: data.descricao || null,
          sortOrder: seq * 10,
          createdBy: ctx.user.id,
          ativo: true,
        });

        assuntosMap.set(`${data.disciplinaNome}|${data.nome}`, id);
        assuntosIds.push(id);
      }

      // 3. Inserir tópicos
      for (const row of topicosRaw) {
        const data = topicoImportSchema.parse(row);
        const assuntoId = assuntosMap.get(`${data.disciplinaNome}|${data.assuntoNome}`);

        if (!assuntoId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Assunto "${data.assuntoNome}" não encontrado`,
          });
        }

        const seq = await getNextSequence(db, undefined, assuntoId);
        const codigo = `${seq.toString().padStart(2, "0")}`;
        const slug = generateSlug(data.nome);
        const id = uuidv4();

        await db.insert(topicos).values({
          id,
          assuntoId,
          disciplinaId: assuntos.find((a: any) => a.id === assuntoId)?.disciplinaId || "",
          codigo,
          slug,
          nome: data.nome,
          descricao: data.descricao || null,
          sortOrder: seq * 10,
          createdBy: ctx.user.id,
          ativo: true,
        });
        
        topicosIds.push(id);
      }

      // Registrar importação
      await db.insert(taxonomiaImports).values({
        id: importId,
        batchId,
        totalDisciplinas: disciplinasRaw.length,
        totalAssuntos: assuntosRaw.length,
        totalTopicos: topicosRaw.length,
        status: "ATIVO",
        importedBy: ctx.user.id,
      });

      // Registrar auditoria
      await db.insert(auditLogs).values({
        id: uuidv4(),
        actorId: ctx.user.id,
        actorRole: ctx.user.role,
        action: "TAXONOMIA_IMPORT",
        targetType: "taxonomia",
        targetId: batchId,
        payload: {
          batchId,
          importId,
          disciplinas: disciplinasRaw.length,
          assuntos: assuntosRaw.length,
          topicos: topicosRaw.length,
          disciplinasIds,
          assuntosIds,
          topicosIds,
        },
      });

      return {
        success: true,
        batchId,
        resumo: {
          disciplinas: disciplinasRaw.length,
          assuntos: assuntosRaw.length,
          topicos: topicosRaw.length,
        },
      };
    }),

  /**
   * Desfazer última importação (soft delete)
   */
  undoLastImport: adminProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Buscar última importação ativa
    const [lastImport] = await db
      .select()
      .from(taxonomiaImports)
      .where(eq(taxonomiaImports.status, "ATIVO"))
      .orderBy(sql`${taxonomiaImports.createdAt} DESC`)
      .limit(1);

    if (!lastImport) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Nenhuma importação ativa encontrada",
      });
    }

    // Buscar IDs dos registros importados no audit log
    const [auditLog] = await db
      .select()
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.action, "TAXONOMIA_IMPORT"),
          eq(auditLogs.targetId, lastImport.batchId)
        )
      )
      .limit(1);

    if (!auditLog || !auditLog.payload) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Dados da importação não encontrados",
      });
    }

    const payload = auditLog.payload as any;
    const { disciplinasIds, assuntosIds, topicosIds } = payload;

    // Marcar como inativo (soft delete)
    if (topicosIds && topicosIds.length > 0) {
      for (const id of topicosIds) {
        await db
          .update(topicos)
          .set({ ativo: false })
          .where(eq(topicos.id, id));
      }
    }

    if (assuntosIds && assuntosIds.length > 0) {
      for (const id of assuntosIds) {
        await db
          .update(assuntos)
          .set({ ativo: false })
          .where(eq(assuntos.id, id));
      }
    }

    if (disciplinasIds && disciplinasIds.length > 0) {
      for (const id of disciplinasIds) {
        await db
          .update(disciplinas)
          .set({ ativo: false })
          .where(eq(disciplinas.id, id));
      }
    }

    // Atualizar status da importação
    await db
      .update(taxonomiaImports)
      .set({
        status: "DESFEITO",
        undoneAt: new Date(),
        undoneBy: ctx.user.id,
      })
      .where(eq(taxonomiaImports.id, lastImport.id));

    // Registrar auditoria do undo
    await db.insert(auditLogs).values({
      id: uuidv4(),
      actorId: ctx.user.id,
      actorRole: ctx.user.role,
      action: "TAXONOMIA_UNDO",
      targetType: "taxonomia",
      targetId: lastImport.batchId,
      payload: {
        importId: lastImport.id,
        batchId: lastImport.batchId,
        disciplinas: lastImport.totalDisciplinas,
        assuntos: lastImport.totalAssuntos,
        topicos: lastImport.totalTopicos,
      },
    });

    return {
      success: true,
      importId: lastImport.id,
      batchId: lastImport.batchId,
      resumo: {
        disciplinas: lastImport.totalDisciplinas,
        assuntos: lastImport.totalAssuntos,
        topicos: lastImport.totalTopicos,
      },
    };
  }),

  /**
   * Listar importações
   */
  listImports: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const imports = await db
      .select()
      .from(taxonomiaImports)
      .orderBy(sql`${taxonomiaImports.createdAt} DESC`)
      .limit(10);

    return imports;
  }),
});

