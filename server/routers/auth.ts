import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { 
  generateAccessToken, 
  generateRefreshToken, 
  generateSessionId,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  clearAuthCookies,
  verifyRefreshToken,
} from "../_core/auth";
import { hashPassword, verifyPassword, validatePasswordStrength } from "../_core/password";
import { validarCPF, validarEmail, validarIdadeMinima } from "../_core/validators";
import { 
  createUser, 
  getUserByEmail, 
  getUserById, 
  getUserByCpf,
  updateUser,
} from "../db";

/**
 * Sistema DOM - Router de Autenticação Simples
 * 
 * IMPORTANTE: Este sistema NÃO usa OAuth.
 * Implementa autenticação com email e senha.
 * 
 * Endpoints:
 * - POST /api/v1/auth/register - Cadastro de usuário
 * - POST /api/v1/auth/login - Login de usuário
 * - POST /api/v1/auth/refresh-token - Renovar access token
 * - POST /api/v1/auth/logout - Logout do usuário
 * - GET /api/v1/auth/me - Obter dados do usuário autenticado
 */

export const authRouter = router({
  /**
   * Cadastro de novo usuário
   */
  register: publicProcedure
    .input(
      z.object({
        nomeCompleto: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
        email: z.string().email("Email inválido"),
        senha: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
        dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
        cpf: z.string().optional(),
        telefone: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Validar email
      if (!validarEmail(input.email)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email inválido",
        });
      }

      // Validar CPF se fornecido
      if (input.cpf && !validarCPF(input.cpf)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "CPF inválido",
        });
      }

      // Validar idade mínima (18 anos)
      const dataNascimento = new Date(input.dataNascimento);
      if (!validarIdadeMinima(dataNascimento)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Você deve ter pelo menos 18 anos para se cadastrar",
        });
      }

      // Validar força da senha
      const senhaValidacao = validatePasswordStrength(input.senha);
      if (!senhaValidacao.valid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: senhaValidacao.errors.join(", "),
        });
      }

      // Verificar se email já existe
      const existingUserByEmail = await getUserByEmail(input.email);
      if (existingUserByEmail) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email já cadastrado",
        });
      }

      // Verificar se CPF já existe (se fornecido)
      if (input.cpf) {
        const existingUserByCpf = await getUserByCpf(input.cpf);
        if (existingUserByCpf) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "CPF já cadastrado",
          });
        }
      }

      // Hash da senha
      const passwordHash = await hashPassword(input.senha);

      // Criar usuário
      const userId = uuidv4();
      await createUser({
        id: userId,
        nomeCompleto: input.nomeCompleto,
        email: input.email,
        passwordHash,
        dataNascimento: dataNascimento,
        cpf: input.cpf || null,
        telefone: input.telefone || null,
        emailVerificado: false, // TODO: Implementar verificação de email
        role: "ALUNO",
        ativo: true,
      });

      // Buscar usuário criado
      const user = await getUserById(userId);
      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar usuário",
        });
      }

      // Gerar tokens
      const sessionId = generateSessionId();
      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        sessionId,
      });
      const refreshToken = generateRefreshToken({
        userId: user.id,
        sessionId,
      });

      // Definir cookies
      setAccessTokenCookie(ctx.res, accessToken);
      setRefreshTokenCookie(ctx.res, refreshToken);

      // TODO: Salvar refresh token no banco de dados
      // TODO: Enviar email de verificação

      return {
        success: true,
        message: "Usuário cadastrado com sucesso",
        user: {
          id: user.id,
          nomeCompleto: user.nomeCompleto,
          email: user.email,
          role: user.role,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      };
    }),

  /**
   * Login de usuário
   */
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email("Email inválido"),
        senha: z.string().min(1, "Senha é obrigatória"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Buscar usuário por email
      const user = await getUserByEmail(input.email);
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email ou senha incorretos",
        });
      }

      // Verificar se usuário está ativo
      if (!user.ativo) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Conta desativada. Entre em contato com o suporte.",
        });
      }

      // Verificar senha
      const senhaValida = await verifyPassword(input.senha, user.passwordHash);
      if (!senhaValida) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email ou senha incorretos",
        });
      }

      // Gerar tokens
      const sessionId = generateSessionId();
      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        sessionId,
      });
      const refreshToken = generateRefreshToken({
        userId: user.id,
        sessionId,
      });

      // Definir cookies
      setAccessTokenCookie(ctx.res, accessToken);
      setRefreshTokenCookie(ctx.res, refreshToken);

      // TODO: Salvar refresh token no banco de dados
      // TODO: Implementar rate limiting

      return {
        success: true,
        message: "Login realizado com sucesso",
        user: {
          id: user.id,
          nomeCompleto: user.nomeCompleto,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      };
    }),

  /**
   * Obter dados do usuário autenticado (ou null se não autenticado)
   */
  me: publicProcedure.query(({ ctx }) => {
    if (!ctx.user) {
      return null;
    }
    return {
      id: ctx.user.id,
      nomeCompleto: ctx.user.nomeCompleto,
      email: ctx.user.email,
      cpf: ctx.user.cpf,
      dataNascimento: ctx.user.dataNascimento,
      telefone: ctx.user.telefone,
      role: ctx.user.role,
      avatarUrl: ctx.user.avatarUrl,
      emailVerificado: ctx.user.emailVerificado,
      createdAt: ctx.user.createdAt,
    };
  }),

  /**
   * Logout do usuário
   */
  logout: publicProcedure.mutation(({ ctx }) => {
    clearAuthCookies(ctx.res);
    // TODO: Revogar refresh token no banco de dados
    return {
      success: true,
      message: "Logout realizado com sucesso",
    };
  }),

  /**
   * Renovar access token usando refresh token
   */
  refreshToken: publicProcedure
    .input(
      z.object({
        refreshToken: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verificar refresh token
      const payload = verifyRefreshToken(input.refreshToken);
      if (!payload) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Refresh token inválido ou expirado",
        });
      }

      // TODO: Verificar se refresh token está revogado no banco de dados

      // Buscar usuário
      const user = await getUserById(payload.userId);
      if (!user || !user.ativo) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuário não encontrado ou inativo",
        });
      }

      // Gerar novo access token
      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        sessionId: payload.sessionId,
      });

      // Definir cookie
      setAccessTokenCookie(ctx.res, accessToken);

      return {
        success: true,
        accessToken,
      };
    }),
});
