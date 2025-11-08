import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { adminRoleProcedure, router, staffProcedure } from "../../_core/trpc";
import { getDb } from "../../db";
import { logAuditAction, AuditAction, TargetType } from "../../_core/audit";
import bcrypt from "bcryptjs";

/**
 * Router de Gestão de Usuários (Admin)
 * Versão: v1
 * 
 * Procedures:
 * - list: Listar usuários com filtros e paginação
 * - getProfile: Obter perfil completo de usuário
 * - create: Criar novo usuário
 * - update: Atualizar dados de usuário
 * - suspend: Suspender conta de usuário
 * - reactivate: Reativar conta suspensa
 * - assignPlan: Atribuir plano a usuário
 * - removePlan: Remover plano de usuário
 * - loginHistory: Histórico de logins
 * - stats: Estatísticas gerais
 */

const userCreateSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  cpf: z.string().optional(),
  senha: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
  role: z.enum(["ALUNO", "PROFESSOR", "MENTOR", "ADMINISTRATIVO", "MASTER"]),
  planos: z.array(z.string()).optional(),
});

const userUpdateSchema = z.object({
  nome: z.string().min(3).optional(),
  email: z.string().email().optional(),
  cpf: z.string().optional(),
  role: z.enum(["ALUNO", "PROFESSOR", "MENTOR", "ADMINISTRATIVO", "MASTER"]).optional(),
});

export const usersRouter_v1 = router({
  /**
   * Listar usuários com filtros
   */
  list: staffProcedure
    .input(
      z.object({
        role: z.enum(["ALUNO", "PROFESSOR", "MENTOR", "ADMINISTRATIVO", "MASTER"]).optional(),
        isActive: z.boolean().optional(),
        search: z.string().optional(),
        planoId: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        sortBy: z.enum(["nome", "email", "criado_em"]).default("criado_em"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      })
    )
    .query(async ({ input, ctx }) => {
      const startTime = Date.now();
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível" });

      const { role, isActive, search, planoId, page, limit, sortBy, sortOrder } = input;
      const offset = (page - 1) * limit;

      // Build WHERE clause
      const whereClauses: string[] = [];
      const params: any[] = [];

      if (role) {
        whereClauses.push("u.role = ?");
        params.push(role);
      }

      if (isActive !== undefined) {
        whereClauses.push("u.ativo = ?");
        params.push(isActive ? 1 : 0);
      }

      if (search) {
        whereClauses.push("(u.nome LIKE ? OR u.email LIKE ?)");
        params.push(`%${search}%`, `%${search}%`);
      }

      if (planoId) {
        whereClauses.push("EXISTS (SELECT 1 FROM metas_planos_estudo mpe WHERE mpe.usuario_id = u.id AND mpe.id = ?)");
        params.push(planoId);
      }

      const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

      // Count total
      const countQuery = `SELECT COUNT(*) as total FROM users u ${whereSQL}`;
      const [countResult] = await db.execute(countQuery, params);
      const total = (countResult as any)[0].total;

      // Get users
      const sortColumn = sortBy === "nome" ? "u.nome" : sortBy === "email" ? "u.email" : "u.criado_em";
      const query = `
        SELECT 
          u.id,
          u.nome,
          u.email,
          u.cpf,
          u.role,
          u.ativo,
          u.criado_em,
          u.ultimo_login,
          (SELECT COUNT(*) FROM metas_planos_estudo mpe WHERE mpe.usuario_id = u.id) as total_planos
        FROM users u
        ${whereSQL}
        ORDER BY ${sortColumn} ${sortOrder}
        LIMIT ? OFFSET ?
      `;

      const [users] = await db.execute(query, [...params, limit, offset]);

      const duration = Date.now() - startTime;
      ctx.logger.info({ action: "LIST_USERS", duration_ms: duration, filters: input }, "Listar usuários");

      return {
        users,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    }),

  /**
   * Obter perfil completo de usuário
   */
  getProfile: staffProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível" });

      const query = `
        SELECT 
          u.id,
          u.nome,
          u.email,
          u.cpf,
          u.role,
          u.ativo,
          u.criado_em,
          u.ultimo_login,
          (SELECT COUNT(*) FROM metas_planos_estudo mpe WHERE mpe.usuario_id = u.id) as total_planos,
          (SELECT COUNT(*) FROM metas m WHERE m.plano_id IN (SELECT id FROM metas_planos_estudo WHERE usuario_id = u.id)) as total_metas,
          (SELECT COUNT(*) FROM metas_conclusoes mc WHERE mc.usuario_id = u.id) as metas_concluidas
        FROM users u
        WHERE u.id = ?
      `;

      const [result] = await db.execute(query, [input.userId]);
      const users = result as any[];

      if (users.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado" });
      }

      // Get enrollments
      const enrollmentsQuery = `
        SELECT 
          mpe.id,
          mpe.titulo,
          mpe.status,
          mpe.criado_em,
          (SELECT COUNT(*) FROM metas m WHERE m.plano_id = mpe.id) as total_metas,
          (SELECT COUNT(*) FROM metas_conclusoes mc WHERE mc.usuario_id = ? AND mc.meta_id IN (SELECT id FROM metas WHERE plano_id = mpe.id)) as metas_concluidas
        FROM metas_planos_estudo mpe
        WHERE mpe.usuario_id = ?
        ORDER BY mpe.criado_em DESC
      `;

      const [enrollments] = await db.execute(enrollmentsQuery, [input.userId, input.userId]);

      ctx.logger.info({ action: "GET_USER_PROFILE", userId: input.userId }, "Obter perfil de usuário");

      return {
        user: users[0],
        enrollments,
      };
    }),

  /**
   * Criar novo usuário
   */
  create: adminRoleProcedure
    .input(userCreateSchema)
    .mutation(async ({ input, ctx }) => {
      const startTime = Date.now();
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível" });

      // Check if email already exists
      const [existing] = await db.execute("SELECT id FROM users WHERE email = ?", [input.email]);
      if ((existing as any[]).length > 0) {
        throw new TRPCError({ code: "CONFLICT", message: "Email já cadastrado" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(input.senha, 10);

      // Insert user
      const insertQuery = `
        INSERT INTO users (nome, email, cpf, senha, role, ativo, criado_em)
        VALUES (?, ?, ?, ?, ?, 1, NOW())
      `;

      const [result] = await db.execute(insertQuery, [
        input.nome,
        input.email,
        input.cpf || null,
        hashedPassword,
        input.role,
      ]);

      const userId = (result as any).insertId;

      // Assign plans if provided
      if (input.planos && input.planos.length > 0) {
        for (const planoId of input.planos) {
          await db.execute(
            "INSERT INTO metas_planos_estudo (usuario_id, titulo, status, criado_em) VALUES (?, ?, 'ATIVO', NOW())",
            [userId, `Plano ${planoId}`]
          );
        }
      }

      const duration = Date.now() - startTime;
      ctx.logger.info({ action: "CREATE_USER", duration_ms: duration, userId }, "Criar usuário");

      await logAuditAction({
        actorId: ctx.user!.id,
        actorRole: ctx.user!.role,
        action: AuditAction.CREATE_USER,
        targetType: TargetType.USER,
        targetId: userId.toString(),
        payload: { nome: input.nome, email: input.email, role: input.role },
        req: ctx.req,
      });

      return { success: true, userId };
    }),

  /**
   * Atualizar usuário
   */
  update: adminRoleProcedure
    .input(
      z.object({
        userId: z.string(),
        data: userUpdateSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const startTime = Date.now();
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível" });

      // Check if user exists
      const [existing] = await db.execute("SELECT id, role FROM users WHERE id = ?", [input.userId]);
      if ((existing as any[]).length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado" });
      }

      const existingUser = (existing as any[])[0];

      // Admin cannot edit Master
      if (ctx.user!.role === "ADMINISTRATIVO" && existingUser.role === "MASTER") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Você não pode editar um usuário Master" });
      }

      // Build UPDATE query
      const updates: string[] = [];
      const params: any[] = [];

      if (input.data.nome) {
        updates.push("nome = ?");
        params.push(input.data.nome);
      }

      if (input.data.email) {
        updates.push("email = ?");
        params.push(input.data.email);
      }

      if (input.data.cpf !== undefined) {
        updates.push("cpf = ?");
        params.push(input.data.cpf || null);
      }

      if (input.data.role) {
        updates.push("role = ?");
        params.push(input.data.role);
      }

      if (updates.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Nenhum campo para atualizar" });
      }

      const updateQuery = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
      await db.execute(updateQuery, [...params, input.userId]);

      const duration = Date.now() - startTime;
      ctx.logger.info({ action: "UPDATE_USER", duration_ms: duration, userId: input.userId }, "Atualizar usuário");

      await logAuditAction({
        actorId: ctx.user!.id,
        actorRole: ctx.user!.role,
        action: AuditAction.UPDATE_USER,
        targetType: TargetType.USER,
        targetId: input.userId,
        payload: input.data,
        req: ctx.req,
      });

      return { success: true };
    }),

  /**
   * Suspender usuário
   */
  suspend: adminRoleProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível" });

      // Cannot suspend self
      if (input.userId === ctx.user!.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Você não pode suspender a si mesmo" });
      }

      await db.execute("UPDATE users SET ativo = 0 WHERE id = ?", [input.userId]);

      ctx.logger.info({ action: "SUSPEND_USER", userId: input.userId }, "Suspender usuário");

      await logAuditAction({
        actorId: ctx.user!.id,
        actorRole: ctx.user!.role,
        action: AuditAction.SUSPEND_USER,
        targetType: TargetType.USER,
        targetId: input.userId,
        payload: {},
        req: ctx.req,
      });

      return { success: true };
    }),

  /**
   * Reativar usuário
   */
  reactivate: adminRoleProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível" });

      await db.execute("UPDATE users SET ativo = 1 WHERE id = ?", [input.userId]);

      ctx.logger.info({ action: "REACTIVATE_USER", userId: input.userId }, "Reativar usuário");

      await logAuditAction({
        actorId: ctx.user!.id,
        actorRole: ctx.user!.role,
        action: AuditAction.REACTIVATE_USER,
        targetType: TargetType.USER,
        targetId: input.userId,
        payload: {},
        req: ctx.req,
      });

      return { success: true };
    }),

  /**
   * Histórico de logins
   */
  loginHistory: staffProcedure
    .input(z.object({ userId: z.string(), limit: z.number().min(1).max(100).default(20) }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível" });

      const query = `
        SELECT 
          rt.id,
          rt.ip_address,
          rt.user_agent,
          rt.criado_em as login_at
        FROM refresh_tokens rt
        WHERE rt.usuario_id = ?
        ORDER BY rt.criado_em DESC
        LIMIT ?
      `;

      const [history] = await db.execute(query, [input.userId, input.limit]);

      ctx.logger.info({ action: "GET_LOGIN_HISTORY", userId: input.userId }, "Obter histórico de logins");

      return history;
    }),

  /**
   * Gerar token de impersonação (Ver como Aluno)
   */
  generateImpersonationToken: staffProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível" });

      // Get user data
      const [users] = await db.execute("SELECT id, nome, email, role FROM users WHERE id = ?", [input.userId]);
      if ((users as any[]).length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado" });
      }

      const user = (users as any[])[0];

      // Generate temporary JWT (15 minutes)
      const jwt = require("jsonwebtoken");
      const token = jwt.sign(
        {
          userId: user.id,
          nome: user.nome,
          email: user.email,
          role: user.role,
          impersonatedBy: ctx.user!.id,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "15m" }
      );

      ctx.logger.info({ action: "GENERATE_IMPERSONATION_TOKEN", userId: input.userId, impersonatedBy: ctx.user!.id }, "Gerar token de impersonação");

      await logAuditAction({
        actorId: ctx.user!.id,
        actorRole: ctx.user!.role,
        action: AuditAction.IMPERSONATE_USER,
        targetType: TargetType.USER,
        targetId: input.userId,
        payload: { impersonatedBy: ctx.user!.id },
        req: ctx.req,
      });

      return { token, user };
    }),

  /**
   * Estatísticas gerais
   */
  stats: staffProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível" });

    const query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN ativo = 1 THEN 1 ELSE 0 END) as ativos,
        SUM(CASE WHEN ativo = 0 THEN 1 ELSE 0 END) as suspensos,
        SUM(CASE WHEN role = 'ALUNO' THEN 1 ELSE 0 END) as alunos,
        SUM(CASE WHEN role = 'PROFESSOR' THEN 1 ELSE 0 END) as professores,
        SUM(CASE WHEN role = 'MENTOR' THEN 1 ELSE 0 END) as mentores,
        SUM(CASE WHEN role = 'ADMINISTRATIVO' THEN 1 ELSE 0 END) as administrativos,
        SUM(CASE WHEN role = 'MASTER' THEN 1 ELSE 0 END) as masters
      FROM users
    `;

    const [result] = await db.execute(query);
    const stats = (result as any[])[0];

    ctx.logger.info({ action: "GET_USER_STATS" }, "Obter estatísticas de usuários");

    return stats;
  }),
});
