import { systemRouter } from "./_core/systemRouter";
import { router } from "./_core/trpc";
import { authRouter } from "./routers/auth";

/**
 * Sistema DOM - Routers principais
 * 
 * IMPORTANTE: Este sistema usa AUTENTICAÇÃO SIMPLES (email + senha)
 * NÃO usa OAuth.
 */

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,

  // TODO: Adicionar routers de funcionalidades conforme desenvolvimento
  // disciplinas: disciplinasRouter,
  // materiais: materiaisRouter,
  // questoes: questoesRouter,
  // forum: forumRouter,
  // metas: metasRouter,
  // etc...
});

export type AppRouter = typeof appRouter;
