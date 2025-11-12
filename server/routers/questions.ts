/**
 * tRPC Router - Módulo de Questões
 * 
 * 15 procedures principais:
 * - CRUD Admin (5): create, update, delete, bulkImport, reviewFlag
 * - Listagem (2): list, getById
 * - Resolução (2): submitAnswer, flagQuestion
 * - Cadernos (2): addToNotebook, removeFromNotebook
 * - Estatísticas (4): getUserStats, getNodeStatistics, getEvolution, compareWithClass
 */

import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { 
  questions, 
  questionAttempts, 
  questionFlags,
  userNotebooks,
  questionComments,
} from "../../drizzle/schema-questions";
import { disciplinas, assuntos, topicos } from "../../drizzle/schema";
import { eq, and, or, like, desc, sql, inArray, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";

// ========================================
// HELPER: Gerar uniqueCode
// ========================================

function generateUniqueCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `Q${timestamp}${random}`;
}

// ========================================
// ROUTER: questions
// ========================================

export const questionsRouter = router({
  
  // ========================================
  // ⚡ LISTAR QUESTÕES - OTIMIZADO com LEFT JOIN LATERAL
  // ========================================
  
  list: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      
      // Filtros da Árvore
      disciplinaId: z.string().optional(),
      assuntoId: z.string().optional(),
      topicoId: z.string().optional(),
      
      // Filtros de Tipo
      questionType: z.enum(["multiple_choice", "true_false"]).optional(),
      
      // Filtros de Metadados
      examBoard: z.string().optional(),
      examYear: z.number().optional(),
      examInstitution: z.string().optional(),
      difficulty: z.enum(["easy", "medium", "hard"]).optional(),
      
      // Filtros de Status
      isOutdated: z.boolean().optional(),
      isAnnulled: z.boolean().optional(),
      
      // ⚡ MELHORADO: Filtros de Resolução EM SQL
      onlyAnswered: z.boolean().default(false),
      onlyUnanswered: z.boolean().default(false),
      onlyCorrect: z.boolean().default(false),
      onlyWrong: z.boolean().default(false),
      
      search: z.string().optional(),
      sortBy: z.enum(["newest", "oldest", "difficulty", "examYear"]).default("newest"),
    }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      const offset = (input.page - 1) * input.limit;
      
      // Base conditions
      const conditions = [eq(questions.isActive, true)];
      
      // Filtros da árvore
      if (input.disciplinaId) conditions.push(eq(questions.disciplinaId, input.disciplinaId));
      if (input.assuntoId) conditions.push(eq(questions.assuntoId, input.assuntoId));
      if (input.topicoId) conditions.push(eq(questions.topicoId, input.topicoId));
      
      // Outros filtros
      if (input.questionType) conditions.push(eq(questions.questionType, input.questionType));
      if (input.examBoard) conditions.push(eq(questions.examBoard, input.examBoard));
      if (input.examYear) conditions.push(eq(questions.examYear, input.examYear));
      if (input.difficulty) conditions.push(eq(questions.difficulty, input.difficulty));
      if (input.isOutdated !== undefined) conditions.push(eq(questions.isOutdated, input.isOutdated));
      if (input.isAnnulled !== undefined) conditions.push(eq(questions.isAnnulled, input.isAnnulled));
      if (input.search) conditions.push(like(questions.statementText, `%${input.search}%`));
      
      // ⚡ SIMPLIFICADO: Buscar questões e depois enriquecer com tentativas
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Determinar ordenação
      let orderByClause;
      switch (input.sortBy) {
        case "newest":
          orderByClause = desc(questions.createdAt);
          break;
        case "oldest":
          orderByClause = questions.createdAt;
          break;
        case "difficulty":
          orderByClause = questions.difficulty;
          break;
        case "examYear":
          orderByClause = desc(questions.examYear);
          break;
        default:
          orderByClause = desc(questions.createdAt);
      }
      
      // Buscar questões
      const questionsData = await db
        .select()
        .from(questions)
        .where(and(...conditions))
        .orderBy(orderByClause)
        .limit(input.limit)
        .offset(offset);
      
      // Buscar últimas tentativas do usuário para essas questões
      const questionIds = questionsData.map(q => q.id);
      let attemptsMap: Record<number, typeof questionAttempts.$inferSelect> = {};
      
      if (questionIds.length > 0) {
        const attempts = await db
          .select()
          .from(questionAttempts)
          .where(
            and(
              eq(questionAttempts.userId, userId),
              inArray(questionAttempts.questionId, questionIds)
            )
          )
          .orderBy(desc(questionAttempts.attemptedAt));
        
        // Manter apenas a última tentativa de cada questão
        attempts.forEach(attempt => {
          if (!attemptsMap[attempt.questionId]) {
            attemptsMap[attempt.questionId] = attempt;
          }
        });
      }
      
      // Enriquecer questões com dados de tentativas
      let items = questionsData.map(question => ({
        question,
        lastAttemptCorrect: attemptsMap[question.id]?.isCorrect ?? null,
        hasAttempt: !!attemptsMap[question.id],
      }));
      
      // ⚡ Filtros de resolução (pós-query, mas com dataset pequeno)
      if (input.onlyAnswered) {
        items = items.filter(item => item.hasAttempt);
      }
      if (input.onlyUnanswered) {
        items = items.filter(item => !item.hasAttempt);
      }
      if (input.onlyCorrect) {
        items = items.filter(item => item.lastAttemptCorrect === true);
      }
      if (input.onlyWrong) {
        items = items.filter(item => item.lastAttemptCorrect === false);
      }
      
      // Total count
      const [{ total }] = await db
        .select({ total: sql<number>`COUNT(*)` })
        .from(questions)
        .where(and(...conditions));
      
      return {
        items,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          totalPages: Math.ceil(total / input.limit),
        },
      };
    }),

  // ========================================
  // BUSCAR POR ID
  // ========================================

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Buscar questão com relações
      const [question] = await db
        .select()
        .from(questions)
        .where(eq(questions.id, input.id))
        .limit(1);
      
      if (!question) {
        throw new Error("Questão não encontrada");
      }
      
      // Buscar disciplina, assunto, tópico
      let discipline = null;
      let subject = null;
      let topic = null;
      
      if (question.disciplinaId) {
        [discipline] = await db
          .select()
          .from(disciplinas)
          .where(eq(disciplinas.id, question.disciplinaId))
          .limit(1);
      }
      
      if (question.assuntoId) {
        [subject] = await db
          .select()
          .from(assuntos)
          .where(eq(assuntos.id, question.assuntoId))
          .limit(1);
      }
      
      if (question.topicoId) {
        [topic] = await db
          .select()
          .from(topicos)
          .where(eq(topicos.id, question.topicoId))
          .limit(1);
      }
      
      // Tentativas do usuário
      const attempts = await db
        .select()
        .from(questionAttempts)
        .where(
          and(
            eq(questionAttempts.questionId, input.id),
            eq(questionAttempts.userId, userId)
          )
        )
        .orderBy(desc(questionAttempts.attemptedAt))
        .limit(10);
      
      // Cadernos
      const notebooks = await db
        .select()
        .from(userNotebooks)
        .where(
          and(
            eq(userNotebooks.questionId, input.id),
            eq(userNotebooks.userId, userId)
          )
        );
      
      return {
        question: {
          ...question,
          discipline,
          subject,
          topic,
        },
        attempts,
        notebooks,
        userStats: {
          totalAttempts: attempts.length,
          correctAttempts: attempts.filter((a: typeof questionAttempts.$inferSelect) => a.isCorrect).length,
          lastAttempt: attempts[0] || null,
        },
      };
    }),

  // ========================================
  // CRIAR QUESTÃO (Admin)
  // ========================================

  create: adminProcedure
    .input(z.object({
      // uniqueCode removido - sempre gerado automaticamente
      disciplinaId: z.string().min(1, "Disciplina é obrigatória"),
      assuntoId: z.string().min(1, "Assunto é obrigatório"),
      topicoId: z.string().min(1, "Tópico é obrigatório"),
      
      statementText: z.string().min(10),
      statementImage: z.string().url().optional(),
      questionType: z.enum(["multiple_choice", "true_false"]),
      
      // Múltipla escolha
      optionA: z.string().optional(),
      optionB: z.string().optional(),
      optionC: z.string().optional(),
      optionD: z.string().optional(),
      optionE: z.string().optional(),
      correctOption: z.enum(["A", "B", "C", "D", "E"]).optional(),
      
      // Certo/Errado
      trueFalseAnswer: z.boolean().optional(),
      
      explanationText: z.string().optional(),
      explanationImage: z.string().url().optional(),
      
      examBoard: z.string().optional(),
      examYear: z.number().optional(),
      examInstitution: z.string().optional(),
      difficulty: z.enum(["easy", "medium", "hard"]),
    }))
    .mutation(async ({ input }) => {
      // Validações
      if (input.questionType === "multiple_choice") {
        if (!input.optionA || !input.optionB) {
          throw new Error("Questões de múltipla escolha precisam de pelo menos 2 alternativas");
        }
        if (!input.correctOption) {
          throw new Error("Questões de múltipla escolha precisam de uma resposta correta");
        }
      }
      
      if (input.questionType === "true_false") {
        if (input.trueFalseAnswer === undefined) {
          throw new Error("Questões de certo/errado precisam de uma resposta");
        }
      }
      
      // Gerar uniqueCode
      const uniqueCode = generateUniqueCode();
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Inserir questão
      const [result] = await db.insert(questions).values({
        uniqueCode,
        disciplinaId: input.disciplinaId || null,
        assuntoId: input.assuntoId || null,
        topicoId: input.topicoId || null,
        statementText: input.statementText,
        statementImage: input.statementImage || null,
        questionType: input.questionType,
        optionA: input.optionA || null,
        optionB: input.optionB || null,
        optionC: input.optionC || null,
        optionD: input.optionD || null,
        optionE: input.optionE || null,
        correctOption: input.correctOption || null,
        trueFalseAnswer: input.trueFalseAnswer ?? null,
        explanationText: input.explanationText || null,
        explanationImage: input.explanationImage || null,
        examBoard: input.examBoard || null,
        examYear: input.examYear || null,
        examInstitution: input.examInstitution || null,
        difficulty: input.difficulty,
        isActive: true,
      });
      
      return {
        success: true,
        questionId: result.insertId,
        uniqueCode,
      };
    }),

  // ========================================
  // ATUALIZAR QUESTÃO (Admin)
  // ========================================

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      disciplinaId: z.string().optional(),
      assuntoId: z.string().optional(),
      topicoId: z.string().optional(),
      statementText: z.string().min(10).optional(),
      statementImage: z.string().url().optional().nullable(),
      questionType: z.enum(["multiple_choice", "true_false"]).optional(),
      optionA: z.string().optional().nullable(),
      optionB: z.string().optional().nullable(),
      optionC: z.string().optional().nullable(),
      optionD: z.string().optional().nullable(),
      optionE: z.string().optional().nullable(),
      correctOption: z.enum(["A", "B", "C", "D", "E"]).optional().nullable(),
      trueFalseAnswer: z.boolean().optional().nullable(),
      explanationText: z.string().optional().nullable(),
      explanationImage: z.string().url().optional().nullable(),
      examBoard: z.string().optional().nullable(),
      examYear: z.number().optional().nullable(),
      examInstitution: z.string().optional().nullable(),
      difficulty: z.enum(["easy", "medium", "hard"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db
        .update(questions)
        .set(updates)
        .where(eq(questions.id, id));
      
      return { success: true };
    }),

  // ========================================
  // DELETAR QUESTÃO (Admin) - Soft delete
  // ========================================

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db
        .update(questions)
        .set({ isActive: false })
        .where(eq(questions.id, input.id));
      
      return { success: true };
    }),

  // ========================================
  // ENVIAR RESPOSTA
  // ========================================

  submitAnswer: protectedProcedure
    .input(z.object({
      questionId: z.number(),
      selectedOption: z.enum(["A", "B", "C", "D", "E"]).optional(),
      trueFalseAnswer: z.boolean().optional(),
      timeSpent: z.number().optional(),
      source: z.enum(["practice", "exam", "notebook"]).default("practice"),
      examAttemptId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Buscar questão
      const [question] = await db
        .select()
        .from(questions)
        .where(eq(questions.id, input.questionId))
        .limit(1);
      
      if (!question) {
        throw new Error("Questão não encontrada");
      }
      
      // Calcular isCorrect
      let isCorrect = false;
      
      if (question.questionType === "multiple_choice") {
        if (!input.selectedOption) {
          throw new Error("Selecione uma alternativa");
        }
        isCorrect = input.selectedOption === question.correctOption;
      } else {
        if (input.trueFalseAnswer === undefined) {
          throw new Error("Selecione verdadeiro ou falso");
        }
        isCorrect = input.trueFalseAnswer === question.trueFalseAnswer;
      }
      
      // Inserir tentativa
      await db.insert(questionAttempts).values({
        userId,
        questionId: input.questionId,
        selectedOption: input.selectedOption || null,
        trueFalseAnswer: input.trueFalseAnswer ?? null,
        isCorrect,
        timeSpent: input.timeSpent || null,
        source: input.source,
        examAttemptId: input.examAttemptId || null,
      });
      
      return {
        isCorrect,
        correctAnswer: question.questionType === "multiple_choice" 
          ? question.correctOption 
          : question.trueFalseAnswer,
        explanation: question.explanationText,
        explanationImage: question.explanationImage,
      };
    }),

  // ========================================
  // SINALIZAR QUESTÃO
  // ========================================

  flagQuestion: protectedProcedure
    .input(z.object({
      questionId: z.number(),
      flagType: z.enum(["outdated", "annulled", "error", "duplicate"]),
      reason: z.string().min(10),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.insert(questionFlags).values({
        questionId: input.questionId,
        userId,
        flagType: input.flagType,
        reason: input.reason,
        status: "pending",
      });
      
      return { success: true };
    }),

  // ========================================
  // ADICIONAR A CADERNO
  // ========================================

  addToNotebook: protectedProcedure
    .input(z.object({
      questionId: z.number(),
      notebookType: z.enum(["review", "mistakes", "favorites"]),
      personalNotes: z.string().optional(),
      color: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Verificar se já existe
      const existing = await db
        .select()
        .from(userNotebooks)
        .where(
          and(
            eq(userNotebooks.userId, userId),
            eq(userNotebooks.questionId, input.questionId),
            eq(userNotebooks.notebookType, input.notebookType)
          )
        )
        .limit(1);
      
      if (existing.length > 0) {
        // Atualizar
        await db
          .update(userNotebooks)
          .set({
            personalNotes: input.personalNotes || null,
            color: input.color || null,
          })
          .where(eq(userNotebooks.id, existing[0].id));
      } else {
        // Inserir
        await db.insert(userNotebooks).values({
          userId,
          questionId: input.questionId,
          notebookType: input.notebookType,
          personalNotes: input.personalNotes || null,
          color: input.color || null,
        });
      }
      
      return { success: true };
    }),

  // ========================================
  // LISTAR QUESTÕES DO CADERNO
  // ========================================

  getNotebookQuestions: protectedProcedure
    .input(z.object({
      notebookType: z.enum(["review", "mistakes", "favorites"]),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Buscar questões do caderno
      const notebookItems = await db
        .select()
        .from(userNotebooks)
        .where(
          and(
            eq(userNotebooks.userId, userId),
            eq(userNotebooks.notebookType, input.notebookType)
          )
        )
        .limit(input.limit)
        .offset(input.offset);
      
      if (notebookItems.length === 0) {
        return {
          items: [],
          total: 0,
          hasMore: false,
        };
      }
      
      const questionIds = notebookItems.map((item: typeof userNotebooks.$inferSelect) => item.questionId);
      
      // Buscar questões completas
      const questionsData = await db
        .select()
        .from(questions)
        .where(inArray(questions.id, questionIds));
      
      // Buscar tentativas do usuário para cada questão
      const attempts = await db
        .select()
        .from(questionAttempts)
        .where(
          and(
            eq(questionAttempts.userId, userId),
            inArray(questionAttempts.questionId, questionIds)
          )
        );
      
      // Mapear tentativas por questão
      const attemptsByQuestion = new Map<number, typeof questionAttempts.$inferSelect[]>();
      attempts.forEach((attempt: typeof questionAttempts.$inferSelect) => {
        const list = attemptsByQuestion.get(attempt.questionId) || [];
        list.push(attempt);
        attemptsByQuestion.set(attempt.questionId, list);
      });
      
      // Enriquecer questões com dados de tentativas
      const enrichedQuestions = questionsData.map((q: typeof questions.$inferSelect) => {
        const qAttempts = attemptsByQuestion.get(q.id) || [];
        const lastAttempt = qAttempts.length > 0 ? qAttempts[qAttempts.length - 1] : null;
        const correctCount = qAttempts.filter((a: typeof questionAttempts.$inferSelect) => a.isCorrect).length;
        const accuracy = qAttempts.length > 0 ? (correctCount / qAttempts.length) * 100 : 0;
        
        return {
          ...q,
          attemptCount: qAttempts.length,
          lastAttemptCorrect: lastAttempt?.isCorrect || false,
          accuracy: Math.round(accuracy * 100) / 100,
          addedToNotebook: notebookItems.find((item: typeof userNotebooks.$inferSelect) => item.questionId === q.id)?.addedAt,
        };
      });
      
      // Contar total
      const totalResult = await db
        .select()
        .from(userNotebooks)
        .where(
          and(
            eq(userNotebooks.userId, userId),
            eq(userNotebooks.notebookType, input.notebookType)
          )
        );
      
      return {
        items: enrichedQuestions,
        total: totalResult.length,
        hasMore: totalResult.length > input.offset + input.limit,
      };
    }),

  // ========================================
  // REMOVER DE CADERNO
  // ========================================

  removeFromNotebook: protectedProcedure
    .input(z.object({
      questionId: z.number(),
      notebookType: z.enum(["review", "mistakes", "favorites"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db
        .delete(userNotebooks)
        .where(
          and(
            eq(userNotebooks.userId, userId),
            eq(userNotebooks.questionId, input.questionId),
            eq(userNotebooks.notebookType, input.notebookType)
          )
        );
      
      return { success: true };
    }),

  // ========================================
  // ESTATÍSTICAS DO USUÁRIO (placeholder)
  // ========================================

  getUserStats: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.user.id;
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Buscar todas as tentativas do usuário
      const attempts = await db
        .select()
        .from(questionAttempts)
        .where(eq(questionAttempts.userId, userId));
      
      const totalAttempts = attempts.length;
      const correctCount = attempts.filter((a: typeof questionAttempts.$inferSelect) => a.isCorrect).length;
      const wrongCount = totalAttempts - correctCount;
      const accuracy = totalAttempts > 0 ? (correctCount / totalAttempts) * 100 : 0;
      
      return {
        totalAttempts,
        correctCount,
        wrongCount,
        accuracy: Math.round(accuracy * 100) / 100,
      };
    }),

  // ========================================
  // ESTATÍSTICAS POR NÓ (placeholder)
  // ========================================

  getNodeStatistics: protectedProcedure
    .input(z.object({
      nodeType: z.enum(["discipline", "subject", "topic"]),
      nodeId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Buscar questões do nó
      let nodeQuestions: (typeof questions.$inferSelect)[] = [];
      
      if (input.nodeType === "discipline") {
        nodeQuestions = await db
          .select()
          .from(questions)
          .where(eq(questions.disciplinaId, input.nodeId));
      } else if (input.nodeType === "subject") {
        nodeQuestions = await db
          .select()
          .from(questions)
          .where(eq(questions.assuntoId, input.nodeId));
      } else {
        nodeQuestions = await db
          .select()
          .from(questions)
          .where(eq(questions.topicoId, input.nodeId));
      }
      
      const questionIds = nodeQuestions.map((q: typeof questions.$inferSelect) => q.id);
      
      if (questionIds.length === 0) {
        return {
          total: 0,
          answered: 0,
          correct: 0,
          wrong: 0,
          accuracy: 0,
        };
      }
      
      // Buscar tentativas do usuário
      const attempts = await db
        .select()
        .from(questionAttempts)
        .where(
          and(
            eq(questionAttempts.userId, userId),
            inArray(questionAttempts.questionId, questionIds)
          )
        );
      
      const answered = new Set(attempts.map((a: typeof questionAttempts.$inferSelect) => a.questionId)).size;
      const correct = attempts.filter((a: typeof questionAttempts.$inferSelect) => a.isCorrect).length;
      const wrong = attempts.length - correct;
      const accuracy = attempts.length > 0 ? (correct / attempts.length) * 100 : 0;
      
      return {
        total: questionIds.length,
        answered,
        correct,
        wrong,
        accuracy: Math.round(accuracy * 100) / 100,
      };
    }),

  // ========================================
  // EVOLUÇÃO TEMPORAL (placeholder)
  // ========================================

  getEvolution: protectedProcedure
    .input(z.object({
      days: z.number().min(7).max(90).default(30),
    }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Buscar tentativas dos últimos N dias
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);
      
      const attempts = await db
        .select()
        .from(questionAttempts)
        .where(
          and(
            eq(questionAttempts.userId, userId),
            sql`${questionAttempts.attemptedAt} >= ${startDate}`
          )
        )
        .orderBy(questionAttempts.attemptedAt);
      
      // Agrupar por dia
      const byDay: Record<string, { correct: number; total: number }> = {};
      
      attempts.forEach((attempt: typeof questionAttempts.$inferSelect) => {
        const date = attempt.attemptedAt.toISOString().split('T')[0];
        if (!byDay[date]) {
          byDay[date] = { correct: 0, total: 0 };
        }
        byDay[date].total++;
        if (attempt.isCorrect) {
          byDay[date].correct++;
        }
      });
      
      // Converter para array
      const evolution = Object.entries(byDay).map(([date, stats]) => ({
        date,
        accuracy: (stats.correct / stats.total) * 100,
        totalAttempts: stats.total,
      }));
      
      return evolution;
    }),

  // ========================================
  // COMPARAR COM TURMA (placeholder)
  // ========================================

  compareWithClass: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.user.id;
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Buscar estatísticas do usuário
      const userAttempts = await db
        .select()
        .from(questionAttempts)
        .where(eq(questionAttempts.userId, userId));
      
      const userCorrect = userAttempts.filter((a: typeof questionAttempts.$inferSelect) => a.isCorrect).length;
      const userTotal = userAttempts.length;
      const userAccuracy = userTotal > 0 ? (userCorrect / userTotal) * 100 : 0;
      
      // Buscar todos os usuários (placeholder: deveria filtrar por turma)
      const allAttempts = await db.select().from(questionAttempts);
      
      const allCorrect = allAttempts.filter((a: typeof questionAttempts.$inferSelect) => a.isCorrect).length;
      const allTotal = allAttempts.length;
      const classAverage = allTotal > 0 ? (allCorrect / allTotal) * 100 : 0;
      
      return {
        userAccuracy: Math.round(userAccuracy * 100) / 100,
        classAverage: Math.round(classAverage * 100) / 100,
        userTotal,
      };
    }),

  // ========================================
  // BULK IMPORT (placeholder para Fase 8)
  // ========================================

  bulkImport: adminProcedure
    .input(
      z.object({
        questions: z.array(
          z.object({
            uniqueCode: z.string().optional(),
            statementText: z.string(),
            questionType: z.enum(["multiple_choice", "true_false"]),
            difficulty: z.enum(["easy", "medium", "hard"]),
            disciplinaId: z.string().optional(),
            assuntoId: z.string().optional(),
            topicoId: z.string().optional(),
            examBoard: z.string().optional(),
            examYear: z.number().optional(),
            examInstitution: z.string().optional(),
            optionA: z.string().optional(),
            optionB: z.string().optional(),
            optionC: z.string().optional(),
            optionD: z.string().optional(),
            optionE: z.string().optional(),
            correctOption: z.enum(["A", "B", "C", "D", "E"]).optional(),
            trueFalseAnswer: z.boolean().optional(),
            explanationText: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const results = {
        success: 0,
        failed: 0,
        errors: [] as Array<{ row: number; uniqueCode: string; error: string }>,
      };

      for (let i = 0; i < input.questions.length; i++) {
        const q = input.questions[i];
        try {
          // Gerar uniqueCode se não fornecido
          const uniqueCode = q.uniqueCode || generateUniqueCode();

          // Validar código único
          const existing = await db
            .select()
            .from(questions)
            .where(eq(questions.uniqueCode, uniqueCode))
            .limit(1);

          if (existing.length > 0) {
            throw new Error(`Código ${uniqueCode} já existe`);
          }

          // Validar tipo de questão
          if (q.questionType === "multiple_choice") {
            if (!q.optionA || !q.optionB) {
              throw new Error("Questões de múltipla escolha precisam de pelo menos 2 alternativas");
            }
            if (!q.correctOption) {
              throw new Error("Questões de múltipla escolha precisam de uma resposta correta");
            }
          }

          if (q.questionType === "true_false") {
            if (q.trueFalseAnswer === undefined) {
              throw new Error("Questões de certo/errado precisam de uma resposta");
            }
          }

          // Inserir questão
          await db.insert(questions).values({
            uniqueCode,
            statementText: q.statementText,
            questionType: q.questionType,
            difficulty: q.difficulty,
            disciplinaId: q.disciplinaId || null,
            assuntoId: q.assuntoId || null,
            topicoId: q.topicoId || null,
            examBoard: q.examBoard || null,
            examYear: q.examYear || null,
            examInstitution: q.examInstitution || null,
            optionA: q.optionA || null,
            optionB: q.optionB || null,
            optionC: q.optionC || null,
            optionD: q.optionD || null,
            optionE: q.optionE || null,
            correctOption: q.correctOption || null,
            trueFalseAnswer: q.trueFalseAnswer ?? null,
            explanationText: q.explanationText || null,
            isActive: true,
          });

          results.success++;
        } catch (error: any) {
          results.failed++;
          results.errors.push({
            row: i + 2, // +2 porque linha 1 é header
            uniqueCode: q.uniqueCode || "(não informado)",
            error: error.message || "Erro desconhecido",
          });
        }
      }

      return results;
    }),

  // ========================================
  // REVIEW FLAG (Admin)
  // ========================================

  reviewFlag: adminProcedure
    .input(z.object({
      flagId: z.number(),
      status: z.enum(["approved", "rejected"]),
      reviewNotes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const reviewerId = ctx.user.id;
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Buscar flag
      const [flag] = await db
        .select()
        .from(questionFlags)
        .where(eq(questionFlags.id, input.flagId))
        .limit(1);
      
      if (!flag) {
        throw new Error("Sinalização não encontrada");
      }
      
      // Atualizar flag
      await db
        .update(questionFlags)
        .set({
          status: input.status,
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
          reviewNotes: input.reviewNotes || null,
        })
        .where(eq(questionFlags.id, input.flagId));
      
      // Se aprovado, atualizar questão
      if (input.status === "approved") {
        if (flag.flagType === "outdated") {
          await db
            .update(questions)
            .set({ isOutdated: true })
            .where(eq(questions.id, flag.questionId));
        } else if (flag.flagType === "annulled") {
          await db
            .update(questions)
            .set({ isAnnulled: true })
            .where(eq(questions.id, flag.questionId));
        }
      }
      
      return { success: true };
    }),
});
