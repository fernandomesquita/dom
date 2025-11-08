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
import { plansPublicRouter } from './routers/plansPublic';
import { plansUserRouter } from './routers/plansUser';
import { plansAdminRouter } from './routers/plansAdmin';
import { auditRouter_v1 } from './routers/admin/auditRouter_v1';
import { plansRouter_v1 } from './routers/admin/plansRouter_v1';
import { goalsRouter_v1 } from './routers/admin/goalsRouter_v1';
import { usersRouter_v1 } from './routers/admin/usersRouter_v1';
import { noticesRouter_v1 } from './routers/admin/noticesRouter_v1';
import { dashboardRouter } from './routers/dashboard/dashboardRouter';
import { widgetsRouter } from './routers/dashboard/widgetsRouter';
import { streakRouter } from './routers/dashboard/streakRouter';
import { telemetryRouter } from './routers/dashboard/telemetryRouter';
import { gamificationRouter } from './routers/dashboard/gamificationRouter';

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

  // Módulo de Planos
  plansPublic: plansPublicRouter,
  plansUser: plansUserRouter,
  plansAdmin: plansAdminRouter,
  
  // Admin routers (versionados)
  admin: router({
    audit_v1: auditRouter_v1,
    plans_v1: plansRouter_v1,
    goals_v1: goalsRouter_v1,
    users_v1: usersRouter_v1,
    notices_v1: noticesRouter_v1,
  }),

  // E10: Dashboard do Aluno
  dashboard: dashboardRouter,
  widgets: widgetsRouter,
  streak: streakRouter,
  telemetry: telemetryRouter,
  gamification: gamificationRouter,
});

export type AppRouter = typeof appRouter;
