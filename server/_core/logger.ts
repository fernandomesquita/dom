import pino from 'pino';

/**
 * Logger estruturado usando Pino
 * 
 * Features:
 * - JSON structured logging
 * - Pretty print em desenvolvimento
 * - Níveis: debug, info, warn, error, fatal
 * - Child loggers para módulos específicos
 */

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
      singleLine: false,
      messageFormat: '{module} {msg}'
    }
  } : undefined,
  base: {
    env: process.env.NODE_ENV || 'development',
    service: 'dom-eara-admin'
  },
  formatters: {
    level: (label) => {
      return { level: label };
    }
  }
});

/**
 * Cria um child logger para um módulo específico
 * 
 * @param module - Nome do módulo (ex: 'plans', 'goals', 'users')
 * @returns Child logger com contexto do módulo
 * 
 * @example
 * const plansLogger = createModuleLogger('plans');
 * plansLogger.info({ action: 'CREATE_PLAN', planId: '123' }, 'Plan created successfully');
 */
export function createModuleLogger(module: string) {
  return logger.child({ module });
}

/**
 * Tipo para campos obrigatórios em logs de ações
 */
export interface ActionLogFields {
  /** ID único da requisição (nanoid) */
  request_id: string;
  /** ID do usuário que executou a ação */
  user_id?: string;
  /** Role do usuário */
  user_role?: string;
  /** Ação executada (ex: CREATE_PLAN, UPDATE_GOAL) */
  action: string;
  /** Status da ação (success ou error) */
  status: 'success' | 'error';
  /** Duração da ação em milissegundos */
  duration_ms?: number;
  /** Dados adicionais da ação */
  payload?: Record<string, any>;
  /** Mensagem de erro (se status = error) */
  error?: string;
}

/**
 * Helper para logar ações com campos padronizados
 * 
 * @example
 * logAction(logger, {
 *   request_id: ctx.requestId,
 *   user_id: ctx.user.id,
 *   user_role: ctx.user.role,
 *   action: 'CREATE_PLAN',
 *   status: 'success',
 *   duration_ms: 142,
 *   payload: { plan_name: 'Plano INSS 2025' }
 * }, 'Plan created successfully');
 */
export function logAction(
  logger: pino.Logger,
  fields: ActionLogFields,
  message: string
) {
  const { status, ...rest } = fields;
  
  if (status === 'success') {
    logger.info(rest, message);
  } else {
    logger.error(rest, message);
  }
}

// Export logger padrão
export default logger;
