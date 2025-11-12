import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || (ctx.user.role !== 'MASTER' && ctx.user.role !== 'ADMINISTRATIVO')) {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);

/**
 * Middleware para staff (todos exceto ALUNO)
 * Permite acesso a: MASTER, ADMINISTRATIVO, MENTOR, PROFESSOR
 */
const requireStaff = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ 
      code: "UNAUTHORIZED", 
      message: "Você precisa estar autenticado" 
    });
  }

  if (ctx.user.role === 'ALUNO') {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: "Acesso restrito a membros da equipe" 
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const staffProcedure = t.procedure.use(requireStaff);

/**
 * Middleware para administradores (MASTER + ADMINISTRATIVO)
 */
const requireAdminRole = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ 
      code: "UNAUTHORIZED", 
      message: "Você precisa estar autenticado" 
    });
  }

  const allowedRoles = ['MASTER', 'ADMINISTRATIVO'];
  if (!allowedRoles.includes(ctx.user.role)) {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: "Acesso restrito a administradores" 
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const adminRoleProcedure = t.procedure.use(requireAdminRole);

/**
 * Middleware para Master (apenas MASTER)
 */
const requireMaster = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ 
      code: "UNAUTHORIZED", 
      message: "Você precisa estar autenticado" 
    });
  }

  if (ctx.user.role !== 'MASTER') {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: "Acesso restrito ao Master" 
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const masterProcedure = t.procedure.use(requireMaster);

/**
 * Middleware para mentores (MASTER + ADMINISTRATIVO + MENTOR)
 */
const requireMentor = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ 
      code: "UNAUTHORIZED", 
      message: "Você precisa estar autenticado" 
    });
  }

  const allowedRoles = ['MASTER', 'ADMINISTRATIVO', 'MENTOR'];
  if (!allowedRoles.includes(ctx.user.role)) {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: "Acesso restrito a mentores" 
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const mentorProcedure = t.procedure.use(requireMentor);
