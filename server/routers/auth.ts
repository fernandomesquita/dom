import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { 
  generateAccessToken, 
  generateSessionId,
  setAccessTokenCookie,
  clearAuthCookies,
} from "../_core/auth";
import { hashPassword, verifyPassword, validatePasswordStrength } from "../_core/password";
import { validarCPF, validarEmail, validarIdadeMinima } from "../_core/validators";
import { 
  createUser, 
  getUserByEmail, 
  getUserById, 
  getUserByCpf,
} from "../db";
import {
  createRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  listUserDevices,
} from "../helpers/refreshToken";

/**
 * Sistema DOM - Router de Autenticação Simples
 * 
 * IMPORTANTE: Este sistema NÃO usa OAuth.
 * Implementa autenticação com email e senha + refresh token rotation.
 * 
 * Endpoints:
 * - POST /api/v1/auth/register - Cadastro de usuário
 * - POST /api/v1/auth/login - Login de usuário
 * - POST /api/v1/auth/refresh-token - Renovar access token (com rotação)
 * - POST /api/v1/auth/logout - Logout do usuário
 * - POST /api/v1/auth/logout-all - Logout de todos os dispositivos
 * - GET /api/v1/auth/me - Obter dados do usuário autenticado
 * - GET /api/v1/auth/devices - Listar dispositivos ativos
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
        deviceId: z.string().optional(),
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

      // Gerar access token (15 minutos)
      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        sessionId: generateSessionId(),
      });

      // Gerar refresh token (7 dias) e salvar no banco
      const refreshToken = await createRefreshToken(user.id, {
        deviceId: input.deviceId,
        ipAddress: ctx.req.ip,
        userAgent: ctx.req.headers['user-agent'],
      });

      // Definir cookie de access token
      setAccessTokenCookie(ctx.res, accessToken);

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
          expiresIn: 15 * 60, // 15 minutos em segundos
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
        deviceId: z.string().optional(),
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

      // Gerar access token (15 minutos)
      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        sessionId: generateSessionId(),
      });

      // Gerar refresh token (7 dias) e salvar no banco
      const refreshToken = await createRefreshToken(user.id, {
        deviceId: input.deviceId,
        ipAddress: ctx.req.ip,
        userAgent: ctx.req.headers['user-agent'],
      });

      // Definir cookie de access token
      setAccessTokenCookie(ctx.res, accessToken);

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
          expiresIn: 15 * 60, // 15 minutos em segundos
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
   * Logout do usuário (revoga refresh token atual)
   */
  logout: publicProcedure
    .input(
      z.object({
        refreshToken: z.string().optional(),
      }).optional()
    )
    .mutation(async ({ input, ctx }) => {
      // Revogar refresh token se fornecido
      if (input?.refreshToken) {
        await revokeRefreshToken(input.refreshToken);
      }
      
      // Limpar cookies
      clearAuthCookies(ctx.res);
      
      return {
        success: true,
        message: "Logout realizado com sucesso",
      };
    }),

  /**
   * Logout de todos os dispositivos (revoga todos os refresh tokens do usuário)
   */
  logoutAll: protectedProcedure.mutation(async ({ ctx }) => {
    await revokeAllUserTokens(ctx.user.id);
    clearAuthCookies(ctx.res);
    return {
      success: true,
      message: "Logout realizado em todos os dispositivos",
    };
  }),

  /**
   * Renovar access token usando refresh token (COM ROTAÇÃO)
   * 1. Valida token antigo
   * 2. Deleta token antigo
   * 3. Gera novo access + novo refresh
   * 4. Retorna ambos
   */
  refreshToken: publicProcedure
    .input(
      z.object({
        refreshToken: z.string(),
        deviceId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Rotacionar refresh token (single-use)
      const result = await rotateRefreshToken(input.refreshToken, {
        deviceId: input.deviceId,
        ipAddress: ctx.req.ip,
        userAgent: ctx.req.headers['user-agent'],
      });

      if (!result) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Refresh token inválido ou expirado",
        });
      }

      // Definir cookie de access token
      setAccessTokenCookie(ctx.res, result.accessToken);

      return {
        success: true,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
      };
    }),

  /**
   * Listar dispositivos ativos do usuário
   */
  listDevices: protectedProcedure.query(async ({ ctx }) => {
    const devices = await listUserDevices(ctx.user.id);
    return {
      success: true,
      devices: devices.map(d => ({
        id: d.id,
        deviceId: d.deviceId || 'Desconhecido',
        ipAddress: d.ipAddress || 'Desconhecido',
        userAgent: d.userAgent || 'Desconhecido',
        createdAt: d.createdAt,
        expiresAt: d.expiresAt,
      })),
    };
  }),
});
