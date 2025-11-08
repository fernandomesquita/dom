import { systemRouter } from "./_core/systemRouter";
import { router } from "./_core/trpc";
import { authRouter } from "./routers/auth";
import { disciplinasRouter } from "./routers/disciplinas";
import { assuntosRouter } from "./routers/assuntos";
import { topicosRouter } from "./routers/topicos";
import { materialsRouter } from "./routers/materials";
import { questionsRouter } from "./routers/questions";
import { avisosRouter } from "./routers/avisos";
import { avisosAlunoRouter } from "./routers/avisosAluno";
import { avisosSegmentacaoRouter } from "./routers/avisosSegmentacao";
import { avisosTemplatesRouter } from "./routers/avisosTemplates";
import { commentsRouter } from "./routers/comments";
import { examsRouter } from "./routers/exams";

/**
 * Sistema DOM - Routers principais
 * 
 * IMPORTANTE: Este sistema usa AUTENTICAÇÃO SIMPLES (email + senha)
 * NÃO usa OAuth.
 */

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  disciplinas: disciplinasRouter,
  assuntos: assuntosRouter,
  topicos: topicosRouter,
  materials: materialsRouter,
  questions: questionsRouter,
  avisos: avisosRouter,
  avisosAluno: avisosAlunoRouter,
  avisosSegmentacao: avisosSegmentacaoRouter,
  avisosTemplates: avisosTemplatesRouter,
  comments: commentsRouter,
  exams: examsRouter,

  // TODO: Adicionar routers de funcionalidades conforme desenvolvimento
  // forum: forumRouter,
  // metas: metasRouter,
  // etc...
});

export type AppRouter = typeof appRouter;
