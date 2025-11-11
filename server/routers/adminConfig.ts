import { z } from 'zod';
import { router, masterProcedure } from '../_core/trpc';

/**
 * Router de Configurações Admin
 * 
 * Gerencia configurações gerais da plataforma:
 * - Configurações de email (SMTP)
 * - Limites da plataforma
 * - Modo manutenção
 * - Configurações de segurança
 */

// TODO: Criar tabela platform_config no schema
// Para MVP, retornar valores hardcoded

export const adminConfigRouter = router({
  /**
   * Buscar todas as configurações
   */
  getAll: masterProcedure.query(async () => {
    // TODO: Buscar do banco quando tabela existir
    return {
      email: {
        smtpHost: process.env.SMTP_HOST || '',
        smtpPort: parseInt(process.env.SMTP_PORT || '587'),
        smtpUser: process.env.SMTP_USER || '',
        smtpFrom: process.env.SMTP_FROM || 'noreply@dom-eara.com',
      },
      limits: {
        maxUsersPerPlan: 1000,
        maxQuestionsPerExam: 100,
        maxExamDuration: 240, // minutos
        maxFileUploadSize: 10, // MB
      },
      maintenance: {
        enabled: false,
        message: 'Sistema em manutenção. Voltaremos em breve.',
        allowedIps: [],
      },
      security: {
        sessionTimeout: 7 * 24 * 60, // 7 dias em minutos
        passwordMinLength: 8,
        requireEmailVerification: true,
        maxLoginAttempts: 5,
      },
    };
  }),

  /**
   * Atualizar configurações de email
   */
  updateEmail: masterProcedure
    .input(
      z.object({
        smtpHost: z.string(),
        smtpPort: z.number().int().positive(),
        smtpUser: z.string(),
        smtpPassword: z.string().optional(),
        smtpFrom: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      // TODO: Salvar no banco quando tabela existir
      // Por enquanto, apenas validar e retornar sucesso
      return {
        success: true,
        message: 'Configurações de email atualizadas (simulado - implementar persistência)',
      };
    }),

  /**
   * Atualizar limites da plataforma
   */
  updateLimits: masterProcedure
    .input(
      z.object({
        maxUsersPerPlan: z.number().int().positive(),
        maxQuestionsPerExam: z.number().int().positive(),
        maxExamDuration: z.number().int().positive(),
        maxFileUploadSize: z.number().int().positive(),
      })
    )
    .mutation(async ({ input }) => {
      // TODO: Salvar no banco quando tabela existir
      return {
        success: true,
        message: 'Limites atualizados (simulado - implementar persistência)',
      };
    }),

  /**
   * Atualizar modo manutenção
   */
  updateMaintenance: masterProcedure
    .input(
      z.object({
        enabled: z.boolean(),
        message: z.string().optional(),
        allowedIps: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      // TODO: Salvar no banco quando tabela existir
      return {
        success: true,
        message: input.enabled
          ? 'Modo manutenção ativado (simulado - implementar persistência)'
          : 'Modo manutenção desativado (simulado - implementar persistência)',
      };
    }),

  /**
   * Atualizar configurações de segurança
   */
  updateSecurity: masterProcedure
    .input(
      z.object({
        sessionTimeout: z.number().int().positive(),
        passwordMinLength: z.number().int().min(6).max(32),
        requireEmailVerification: z.boolean(),
        maxLoginAttempts: z.number().int().positive(),
      })
    )
    .mutation(async ({ input }) => {
      // TODO: Salvar no banco quando tabela existir
      return {
        success: true,
        message: 'Configurações de segurança atualizadas (simulado - implementar persistência)',
      };
    }),
});
