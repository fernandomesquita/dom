// Schema do Módulo de Questões - DOM V4
// 8 tabelas principais para sistema completo de resolução de questões

import {
  mysqlTable,
  int,
  varchar,
  text,
  boolean,
  timestamp,
  mysqlEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";
import { users, disciplinas, assuntos, topicos } from "./schema";

// ========================================
// TABELA PRINCIPAL: questions
// ========================================

export const questions = mysqlTable(
  "questions",
  {
    id: int("id").autoincrement().primaryKey(),
    uniqueCode: varchar("uniqueCode", { length: 20 }).notNull().unique(),

    // Integração com Árvore de Conhecimento
    disciplinaId: varchar("disciplinaId", { length: 36 }).references(() => disciplinas.id, {
      onDelete: "set null",
    }),
    assuntoId: varchar("assuntoId", { length: 36 }).references(() => assuntos.id, {
      onDelete: "set null",
    }),
    topicoId: varchar("topicoId", { length: 36 }).references(() => topicos.id, {
      onDelete: "set null",
    }),

    // Conteúdo
    statementText: text("statementText").notNull(),
    statementImage: varchar("statementImage", { length: 500 }),

    // Tipo e respostas
    questionType: mysqlEnum("questionType", [
      "multiple_choice",
      "true_false",
    ]).notNull(),
    optionA: text("optionA"),
    optionB: text("optionB"),
    optionC: text("optionC"),
    optionD: text("optionD"),
    optionE: text("optionE"),
    correctOption: mysqlEnum("correctOption", ["A", "B", "C", "D", "E"]),
    trueFalseAnswer: boolean("trueFalseAnswer"),

    // Explicação
    explanationText: text("explanationText"),
    explanationImage: varchar("explanationImage", { length: 500 }),

    // Metadados
    examBoard: varchar("examBoard", { length: 100 }),
    examYear: int("examYear"),
    examInstitution: varchar("examInstitution", { length: 255 }),
    difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]),

    // Sinalizações
    isOutdated: boolean("isOutdated").default(false),
    isAnnulled: boolean("isAnnulled").default(false),
    flagReason: text("flagReason"),

    // Status
    isActive: boolean("isActive").notNull().default(true),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    // Índices simples
    uniqueCodeIdx: index("uniqueCodeIdx").on(table.uniqueCode),
    disciplinaIdx: index("disciplinaIdx").on(table.disciplinaId),
    assuntoIdx: index("assuntoIdx").on(table.assuntoId),
    topicoIdx: index("topicoIdx").on(table.topicoId),
    typeIdx: index("typeIdx").on(table.questionType),
    activeIdx: index("activeIdx").on(table.isActive),

    // ⚡ Índices compostos (para filtros mais usados)
    disciplinaAssuntoIdx: index("disciplinaAssuntoIdx").on(
      table.disciplinaId,
      table.assuntoId
    ),
    disciplinaDifficultyIdx: index("disciplinaDifficultyIdx").on(
      table.disciplinaId,
      table.difficulty
    ),
    examBoardYearIdx: index("examBoardYearIdx").on(
      table.examBoard,
      table.examYear
    ),
  })
);

// ========================================
// TABELA: questionAttempts (otimizada)
// ========================================

export const questionAttempts = mysqlTable(
  "questionAttempts",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: varchar("userId", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    questionId: int("questionId")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),

    // Resposta
    selectedOption: mysqlEnum("selectedOption", ["A", "B", "C", "D", "E"]),
    trueFalseAnswer: boolean("trueFalseAnswer"),
    isCorrect: boolean("isCorrect").notNull(),
    timeSpent: int("timeSpent"), // em segundos

    // Contexto
    source: mysqlEnum("source", ["practice", "exam", "notebook"]).notNull(),
    examAttemptId: int("examAttemptId"), // referência para examAttempts (adicionada depois)

    attemptedAt: timestamp("attemptedAt").notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("userIdx").on(table.userId),
    questionIdx: index("questionIdx").on(table.questionId),
    examIdx: index("examIdx").on(table.examAttemptId),

    // ⚡ CRÍTICO: Índice para estatísticas temporais
    userDateIdx: index("userDateIdx").on(table.userId, table.attemptedAt),

    // ⚡ Índice composto para filtros de resolução
    userQuestionIdx: index("userQuestionIdx").on(
      table.userId,
      table.questionId
    ),
  })
);

// ========================================
// TABELA: questionFlags (sistema de moderação)
// ========================================

export const questionFlags = mysqlTable(
  "questionFlags",
  {
    id: int("id").autoincrement().primaryKey(),
    questionId: int("questionId")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    userId: varchar("userId", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    flagType: mysqlEnum("flagType", [
      "outdated",
      "annulled",
      "error",
      "duplicate",
    ]).notNull(),
    reason: text("reason").notNull(),

    // Moderação
    status: mysqlEnum("status", ["pending", "approved", "rejected"])
      .notNull()
      .default("pending"),
    reviewedBy: varchar("reviewedBy", { length: 36 }).references(() => users.id),
    reviewedAt: timestamp("reviewedAt"),
    reviewNotes: text("reviewNotes"),

    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    questionIdx: index("questionIdx").on(table.questionId),
    statusIdx: index("statusIdx").on(table.status),
    userIdx: index("userIdx").on(table.userId),
  })
);

// ========================================
// TABELA: questionComments (profundidade limitada)
// ========================================

// @ts-ignore - Referência circular necessária para self-join
export const questionComments = mysqlTable(
  "questionComments",
  {
    id: int("id").autoincrement().primaryKey(),
    questionId: int("questionId")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    userId: varchar("userId", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // ⚡ SIMPLIFICADO: limite de profundidade = 1 (sem recursão profunda)
    parentId: int("parentId").references((): any => questionComments.id, {
      onDelete: "cascade",
    }),

    content: text("content").notNull(),
    images: text("images"), // JSON array de URLs
    isOfficial: boolean("isOfficial").default(false),
    likesCount: int("likesCount").default(0),

    isEdited: boolean("isEdited").default(false),
    isActive: boolean("isActive").default(true),

    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    questionIdx: index("questionIdx").on(table.questionId),
    parentIdx: index("parentIdx").on(table.parentId),
    userIdx: index("userIdx").on(table.userId),
    activeIdx: index("activeIdx").on(table.isActive),
  })
);

// ========================================
// TABELA: commentLikes
// ========================================

export const commentLikes = mysqlTable(
  "commentLikes",
  {
    id: int("id").autoincrement().primaryKey(),
    commentId: int("commentId")
      .notNull()
      .references(() => questionComments.id, { onDelete: "cascade" }),
    userId: varchar("userId", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    // ⚡ Índice composto único (um usuário só pode curtir uma vez)
    commentUserIdx: uniqueIndex("commentUserIdx").on(
      table.commentId,
      table.userId
    ),
  })
);

// ========================================
// TABELA: userNotebooks (cadernos personalizados)
// ========================================

export const userNotebooks = mysqlTable(
  "userNotebooks",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: varchar("userId", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    questionId: int("questionId")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),

    notebookType: mysqlEnum("notebookType", [
      "review",
      "mistakes",
      "favorites",
    ]).notNull(),

    // ⚡ SEGURANÇA: notas pessoais podem conter dados sensíveis
    personalNotes: text("personalNotes"), // Considere criptografia no app layer
    color: varchar("color", { length: 7 }),
    order: int("order").default(0),

    addedAt: timestamp("addedAt").notNull().defaultNow(),
  },
  (table) => ({
    // ⚡ OTIMIZAÇÃO: índice composto para leitura rápida
    userTypeIdx: index("userTypeIdx").on(table.userId, table.notebookType),
    questionIdx: index("questionIdx").on(table.questionId),
    uniqueNotebook: uniqueIndex("uniqueNotebook").on(
      table.userId,
      table.questionId,
      table.notebookType
    ),
  })
);

// ========================================
// TABELA: exams (simulados)
// ========================================

export const exams = mysqlTable(
  "exams",
  {
    id: int("id").autoincrement().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),

    totalQuestions: int("totalQuestions").notNull(),
    timeLimit: int("timeLimit"), // em minutos
    passingScore: int("passingScore"), // pontuação mínima para aprovação

    isPublic: boolean("isPublic").default(false),
    planIds: text("planIds"), // JSON array de IDs de planos

    scheduledFor: timestamp("scheduledFor"),
    closesAt: timestamp("closesAt"),

    isActive: boolean("isActive").default(true),
    createdBy: varchar("createdBy", { length: 36 })
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    createdByIdx: index("createdByIdx").on(table.createdBy),
    scheduledIdx: index("scheduledIdx").on(table.scheduledFor),
    activeIdx: index("activeIdx").on(table.isActive),
  })
);

// ========================================
// TABELA: examQuestions (questões dos simulados)
// ========================================

export const examQuestions = mysqlTable(
  "examQuestions",
  {
    id: int("id").autoincrement().primaryKey(),
    examId: int("examId")
      .notNull()
      .references(() => exams.id, { onDelete: "cascade" }),
    questionId: int("questionId")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    order: int("order").notNull(),
  },
  (table) => ({
    examIdx: index("examIdx").on(table.examId),
    questionIdx: index("questionIdx").on(table.questionId),
    orderIdx: index("orderIdx").on(table.examId, table.order),
  })
);

// ========================================
// TABELA: examAttempts (tentativas de simulados)
// ========================================

export const examAttempts = mysqlTable(
  "examAttempts",
  {
    id: int("id").autoincrement().primaryKey(),
    examId: int("examId")
      .notNull()
      .references(() => exams.id, { onDelete: "cascade" }),
    userId: varchar("userId", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    score: int("score").notNull(),
    correctCount: int("correctCount").notNull(),
    wrongCount: int("wrongCount").notNull(),
    skippedCount: int("skippedCount").notNull(),
    timeSpent: int("timeSpent").notNull(), // em segundos

    status: mysqlEnum("status", ["in_progress", "completed", "abandoned"])
      .notNull()
      .default("in_progress"),

    startedAt: timestamp("startedAt").notNull().defaultNow(),
    completedAt: timestamp("completedAt"),
  },
  (table) => ({
    examIdx: index("examIdx").on(table.examId),
    userIdx: index("userIdx").on(table.userId),
    statusIdx: index("statusIdx").on(table.status),
    scoreIdx: index("scoreIdx").on(table.score),
  })
);

// ========================================
// TYPES (para uso no tRPC e frontend)
// ========================================

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;

export type QuestionAttempt = typeof questionAttempts.$inferSelect;
export type InsertQuestionAttempt = typeof questionAttempts.$inferInsert;

export type QuestionFlag = typeof questionFlags.$inferSelect;
export type InsertQuestionFlag = typeof questionFlags.$inferInsert;

export type QuestionComment = typeof questionComments.$inferSelect;
export type InsertQuestionComment = typeof questionComments.$inferInsert;

export type CommentLike = typeof commentLikes.$inferSelect;
export type InsertCommentLike = typeof commentLikes.$inferInsert;

export type UserNotebook = typeof userNotebooks.$inferSelect;
export type InsertUserNotebook = typeof userNotebooks.$inferInsert;

export type Exam = typeof exams.$inferSelect;
export type InsertExam = typeof exams.$inferInsert;

export type ExamQuestion = typeof examQuestions.$inferSelect;
export type InsertExamQuestion = typeof examQuestions.$inferInsert;

export type ExamAttempt = typeof examAttempts.$inferSelect;
export type InsertExamAttempt = typeof examAttempts.$inferInsert;
