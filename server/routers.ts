import { systemRouter } from "./_core/systemRouter";
import { router } from "./_core/trpc";
import { authRouter } from "./routers/auth";
import { disciplinasRouter } from "./routers/disciplinas";
import { assuntosRouter } from "./routers/assuntos";
import { topicosRouter } from "./routers/topicos";
import { materialsRouter } from "./routers/materials";

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

  // TODO: Adicionar routers de funcionalidades conforme desenvolvimento
  // questoes: questoesRouter,
  // forum: forumRouter,
  // metas: metasRouter,
  // etc...
});

export type AppRouter = typeof appRouter;
