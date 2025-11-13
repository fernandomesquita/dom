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

  console.log('🔐 PROTECTED PROCEDURE - Verificando auth:', {
    hasUser: !!ctx.user,
    userId: ctx.user?.id,
    userRole: ctx.user?.role,
    userEmail: ctx.user?.email,
  });

  if (!ctx.user) {
    console.error('❌ PROTECTED: Usuário não autenticado!');
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  console.log('✅ PROTECTED: Usuário autenticado!');
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

    // ✅ LOG DE DEBUG (remover depois)
    console.log('🔐 adminProcedure:', {
      hasUser: !!ctx.user,
      role: ctx.user?.role,
      email: ctx.user?.email,
    });

    // Verificar se usuário existe
    if (!ctx.user) {
      console.error('❌ Sem usuário no contexto');
      throw new TRPCError({ 
        code: "UNAUTHORIZED", 
        message: "Você precisa estar autenticado" 
      });
    }

    // ✅ MASTER pode TUDO - sem exceções!
    if (ctx.user.role === 'MASTER') {
      console.log('✅ MASTER tem permissão total');
      return next({ ctx: { ...ctx, user: ctx.user } });
    }

    // Outros roles precisam ser ADMINISTRATIVO
    if (ctx.user.role !== 'ADMINISTRATIVO') {
      console.error('❌ Role não permitido:', ctx.user.role);
      throw new TRPCError({ 
        code: "FORBIDDEN", 
        message: NOT_ADMIN_ERR_MSG 
      });
    }

    console.log('✅ ADMINISTRATIVO tem permissão');
    return next({ ctx: { ...ctx, user: ctx.user } });
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
