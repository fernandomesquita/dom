import { systemRouter } from "./_core/systemRouter";
import { ktreeRouter } from "./routers/ktree";
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
import { avisosTemplatesRouter } from './routers/avisosTemplates';
import { agendamentosRouter } from './routers/agendamentos';
import { commentsRouter } from "./routers/comments";
import { examsRouter } from "./routers/exams";
import { forumCategoriesRouter } from './routers/forumCategories';
import { forumThreadsRouter } from './routers/forumThreads';
import { forumMessagesRouter } from './routers/forumMessages';
import { forumModerationRouter } from './routers/forumModeration';
import { forumNotificationsRouter } from './routers/forumNotifications';
import { metasPlanosRouter } from './routers/metasPlanos';
import { metasMetasRouter } from './routers/metasMetas';
import { metasBatchImportRouter } from './routers/metasBatchImport';
import { metasAnalyticsRouter } from './routers/metasAnalytics';

/**
 * Sistema DOM - Routers principais
 * 
 * IMPORTANTE: Este sistema usa AUTENTICAÇÃO SIMPLES (email + senha)
 * NÃO usa OAuth.
 */

export const appRouter = router({
  ktree: ktreeRouter,
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
  agendamentos: agendamentosRouter,
  comments: commentsRouter,
  exams: examsRouter,

  // Fórum
  forumCategories: forumCategoriesRouter,
  forumThreads: forumThreadsRouter,
  forumMessages: forumMessagesRouter,
  forumModeration: forumModerationRouter,
  forumNotifications: forumNotificationsRouter,

  // Módulo de Metas
  metasPlanos: metasPlanosRouter,
  metasMetas: metasMetasRouter,
  metasBatchImport: metasBatchImportRouter,
  metasAnalytics: metasAnalyticsRouter,

  // TODO: Adicionar routers de funcionalidades conforme desenvolvimento
});

export type AppRouter = typeof appRouter;
