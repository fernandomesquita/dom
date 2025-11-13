/**
 * Exams Router - Sistema de simulados/provas
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import { exams, examQuestions, examAttempts, questions } from '../../drizzle/schema-questions';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

// ============================================================================
// ROUTER DE EXAMS (SIMULADOS)
// ============================================================================

export const examsRouter = router({
  /**
   * 1. CREATE - Criar novo simulado
   */
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(200),
      description: z.string().optional(),
      disciplinaId: z.string().optional(),
      difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
      questionCount: z.number().min(1).max(100).default(20),
      timeLimit: z.number().min(1).max(300).optional(), // minutos
      isPublic: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Buscar questões aleatórias baseadas nos filtros
      let query = ctx.db
        .select()
        .from(questions)
        .where(eq(questions.isActive, true));

      // Aplicar filtros
      const conditions = [eq(questions.isActive, true)];
      
      if (input.disciplinaId) {
        conditions.push(eq(questions.disciplinaId, input.disciplinaId));
      }
      
      if (input.difficulty) {
        conditions.push(eq(questions.difficulty, input.difficulty));
      }

      const availableQuestions = await ctx.db
        .select()
        .from(questions)
        .where(and(...conditions))
        .orderBy(sql`RAND()`)
        .limit(input.questionCount);

      if (availableQuestions.length < input.questionCount) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Apenas ${availableQuestions.length} questões disponíveis com os filtros selecionados`,
        });
      }

      // Criar simulado
      const [exam] = await ctx.db
        .insert(exams)
        .values({
          title: input.title,
          description: input.description || null,
          createdBy: userId,
          totalQuestions: availableQuestions.length,
          timeLimit: input.timeLimit || null,
          isPublic: input.isPublic,
          isActive: true,
        })
        .$returningId();

      // Associar questões ao simulado
      await ctx.db.insert(examQuestions).values(
        availableQuestions.map((q, index) => ({
          examId: exam.id,
          questionId: q.id,
          orderIndex: index + 1,
        }))
      );

      return { examId: exam.id };
    }),

  /**
   * 2. START - Iniciar tentativa de simulado
   */
  start: protectedProcedure
    .input(z.object({
      examId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { examId } = input;

      // Verificar se simulado existe
      const [exam] = await ctx.db
        .select()
        .from(exams)
        .where(eq(exams.id, examId))
        .limit(1);

      if (!exam) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Simulado não encontrado',
        });
      }

      if (!exam.isActive) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Simulado não está ativo',
        });
      }

      // Verificar se já existe tentativa em andamento
      const [existingAttempt] = await ctx.db
        .select()
        .from(examAttempts)
        .where(and(
          eq(examAttempts.examId, examId),
          eq(examAttempts.userId, userId),
          eq(examAttempts.status, 'in_progress')
        ))
        .limit(1);

      if (existingAttempt) {
        return { attemptId: existingAttempt.id, resumed: true };
      }

      // Criar nova tentativa
      const [attempt] = await ctx.db
        .insert(examAttempts)
        .values({
          examId,
          userId,
          status: 'in_progress',
          startedAt: new Date(),
        })
        .$returningId();

      return { attemptId: attempt.id, resumed: false };
    }),

  /**
   * 3. SUBMIT_ANSWER - Enviar resposta de uma questão do simulado (autosave)
   */
  submitAnswer: protectedProcedure
    .input(z.object({
      attemptId: z.number(),
      questionId: z.number(),
      selectedOption: z.enum(['A', 'B', 'C', 'D', 'E']).optional(),
      trueFalseAnswer: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Verificar se tentativa pertence ao usuário e está em andamento
      const [attempt] = await ctx.db
        .select()
        .from(examAttempts)
        .where(eq(examAttempts.id, input.attemptId))
        .limit(1);

      if (!attempt) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Tentativa não encontrada',
        });
      }

      if (attempt.userId !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Você não tem permissão para acessar esta tentativa',
        });
      }

      if (attempt.status !== 'in_progress') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Esta tentativa já foi finalizada',
        });
      }

      // Buscar questão
      const [question] = await ctx.db
        .select()
        .from(questions)
        .where(eq(questions.id, input.questionId))
        .limit(1);

      if (!question) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Questão não encontrada',
        });
      }

      // Determinar resposta do usuário
      const userAnswer = question.questionType === 'multiple_choice'
        ? input.selectedOption
        : input.trueFalseAnswer?.toString();

      // Salvar resposta no JSON answers do examAttempts
      const currentAnswers = attempt.answers as Record<string, any> || {};
      currentAnswers[input.questionId.toString()] = {
        selectedOption: input.selectedOption,
        trueFalseAnswer: input.trueFalseAnswer,
        answeredAt: new Date().toISOString(),
      };

      await ctx.db
        .update(examAttempts)
        .set({
          answers: currentAnswers,
        })
        .where(eq(examAttempts.id, input.attemptId));

      return { success: true };
    }),

  /**
   * 4. FINISH - Finalizar simulado e calcular nota
   */
  finish: protectedProcedure
    .input(z.object({
      attemptId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Buscar tentativa
      const [attempt] = await ctx.db
        .select()
        .from(examAttempts)
        .where(eq(examAttempts.id, input.attemptId))
        .limit(1);

      if (!attempt) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Tentativa não encontrada',
        });
      }

      if (attempt.userId !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Você não tem permissão para acessar esta tentativa',
        });
      }

      if (attempt.status !== 'in_progress') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Esta tentativa já foi finalizada',
        });
      }

      // Buscar questões do simulado
      const examQuestionsData = await ctx.db
        .select({
          questionId: examQuestions.questionId,
          question: questions,
        })
        .from(examQuestions)
        .innerJoin(questions, eq(examQuestions.questionId, questions.id))
        .where(eq(examQuestions.examId, attempt.examId));

      // Calcular nota
      const answers = attempt.answers as Record<string, any> || {};
      let correctCount = 0;
      let wrongCount = 0;
      let unansweredCount = 0;

      examQuestionsData.forEach(({ questionId, question }) => {
        const userAnswer = answers[questionId.toString()];

        if (!userAnswer) {
          unansweredCount++;
          return;
        }

        const correctAnswer = question.questionType === 'multiple_choice'
          ? question.correctOption
          : question.trueFalseAnswer?.toString();

        const submittedAnswer = question.questionType === 'multiple_choice'
          ? userAnswer.selectedOption
          : userAnswer.trueFalseAnswer?.toString();

        if (submittedAnswer === correctAnswer) {
          correctCount++;
        } else {
          wrongCount++;
        }
      });

      const totalQuestions = examQuestionsData.length;
      const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

      // Calcular tempo gasto
      const timeSpent = attempt.startedAt 
        ? Math.floor((Date.now() - new Date(attempt.startedAt).getTime()) / 1000)
        : 0;

      // Atualizar tentativa
      await ctx.db
        .update(examAttempts)
        .set({
          status: 'completed',
          completedAt: new Date(),
          score: Math.round(score * 100) / 100,
          correctCount,
          wrongCount,
          unansweredCount,
          timeSpent,
        })
        .where(eq(examAttempts.id, input.attemptId));

      return {
        score,
        correctCount,
        wrongCount,
        unansweredCount,
        totalQuestions,
        timeSpent,
      };
    }),

  /**
   * 5. GET_BY_ID - Buscar simulado por ID com questões
   */
  getById: protectedProcedure
    .input(z.object({
      examId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      // Buscar simulado
      const [exam] = await ctx.db
        .select()
        .from(exams)
        .where(eq(exams.id, input.examId))
        .limit(1);

      if (!exam) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Simulado não encontrado',
        });
      }

      // Buscar questões do simulado
      const examQuestionsData = await ctx.db
        .select({
          orderIndex: examQuestions.orderIndex,
          question: questions,
        })
        .from(examQuestions)
        .innerJoin(questions, eq(examQuestions.questionId, questions.id))
        .where(eq(examQuestions.examId, input.examId))
        .orderBy(examQuestions.orderIndex);

      return {
        exam,
        questions: examQuestionsData.map(eq => eq.question),
      };
    }),

  /**
   * 6. GET_ATTEMPT - Buscar tentativa de simulado
   */
  getAttempt: protectedProcedure
    .input(z.object({
      attemptId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const results = await ctx.db
        .select({
          attempt: examAttempts,
          exam: exams,
        })
        .from(examAttempts)
        .leftJoin(exams, eq(examAttempts.examId, exams.id))
        .where(eq(examAttempts.id, input.attemptId))
        .limit(1);

      if (results.length === 0 || !results[0].attempt) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Tentativa não encontrada',
        });
      }

      const { attempt, exam } = results[0];

      if (attempt.userId !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Você não tem permissão para acessar esta tentativa',
        });
      }

      return {
        ...attempt,
        exam,
      };
    }),

  /**
   * 7. LIST_MY_ATTEMPTS - Listar tentativas do usuário
   */
  listMyAttempts: protectedProcedure
    .input(z.object({
      status: z.enum(['in_progress', 'completed', 'abandoned']).optional(),
      limit: z.number().min(1).max(50).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const conditions = [eq(examAttempts.userId, userId)];
      
      if (input.status) {
        conditions.push(eq(examAttempts.status, input.status));
      }

      const attempts = await ctx.db
        .select({
          attempt: examAttempts,
          exam: exams,
        })
        .from(examAttempts)
        .innerJoin(exams, eq(examAttempts.examId, exams.id))
        .where(and(...conditions))
        .orderBy(desc(examAttempts.startedAt))
        .limit(input.limit)
        .offset(input.offset);

      const [{ count }] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(examAttempts)
        .where(and(...conditions));

      return {
        items: attempts,
        total: count,
        hasMore: input.offset + input.limit < count,
      };
    }),

  /**
   * 8. LIST_ALL - Listar todos os simulados (Admin)
   */
  listAll: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.limit;
      const conditions = [eq(exams.isActive, true)];

      // Buscar simulados
      const examsData = await ctx.db
        .select({
          id: exams.id,
          title: exams.title,
          description: exams.description,
          totalQuestions: exams.totalQuestions,
          timeLimit: exams.timeLimit,
          passingScore: exams.passingScore,
          isPublic: exams.isPublic,
          createdAt: exams.createdAt,
          createdBy: exams.createdBy,
        })
        .from(exams)
        .where(and(...conditions))
        .orderBy(desc(exams.createdAt))
        .limit(input.limit)
        .offset(offset);

      // Contar total
      const [{ total }] = await ctx.db
        .select({ total: sql<number>`COUNT(*)` })
        .from(exams)
        .where(and(...conditions));

      return {
        items: examsData,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          totalPages: Math.ceil(total / input.limit),
        },
      };
    }),
});
