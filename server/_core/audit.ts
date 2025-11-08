import { nanoid } from 'nanoid';
import { auditLogs, type InsertAuditLog } from '../../drizzle/schema';
import { getDb } from '../db';
import { logger } from './logger';

/**
 * Ações auditáveis do sistema
 */
export const AuditAction = {
  // Planos
  CREATE_PLAN: 'CREATE_PLAN',
  UPDATE_PLAN: 'UPDATE_PLAN',
  DELETE_PLAN: 'DELETE_PLAN',
  TOGGLE_PLAN_ACTIVE: 'TOGGLE_PLAN_ACTIVE',
  SET_PLAN_FEATURED: 'SET_PLAN_FEATURED',
  
  // Metas
  CREATE_GOAL: 'CREATE_GOAL',
  UPDATE_GOAL: 'UPDATE_GOAL',
  DELETE_GOAL: 'DELETE_GOAL',
  REORDER_GOALS: 'REORDER_GOALS',
  CLONE_GOAL: 'CLONE_GOAL',
  BATCH_UPLOAD_GOALS: 'BATCH_UPLOAD_GOALS',
  
  // Usuários
  CREATE_USER: 'CREATE_USER',
  UPDATE_USER: 'UPDATE_USER',
  DELETE_USER: 'DELETE_USER',
  SUSPEND_USER: 'SUSPEND_USER',
  REACTIVATE_USER: 'REACTIVATE_USER',
  IMPERSONATE_USER: 'IMPERSONATE_USER',
  
  // Matrículas
  ASSIGN_PLAN: 'ASSIGN_PLAN',
  REMOVE_PLAN: 'REMOVE_PLAN',
  
  // Avisos
  CREATE_NOTICE: 'CREATE_NOTICE',
  UPDATE_NOTICE: 'UPDATE_NOTICE',
  DELETE_NOTICE: 'DELETE_NOTICE',
  PUBLISH_NOTICE: 'PUBLISH_NOTICE',
  
  // Personalização
  UPDATE_COLORS: 'UPDATE_COLORS',
  UPDATE_TYPOGRAPHY: 'UPDATE_TYPOGRAPHY',
  UPDATE_BRANDING: 'UPDATE_BRANDING',
  
  // Autenticação
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  LOGOUT_ALL: 'LOGOUT_ALL',
  REFRESH_TOKEN: 'REFRESH_TOKEN',
  
  // Sistema
  FEATURE_SET: 'FEATURE_SET',
} as const;

export type AuditActionType = typeof AuditAction[keyof typeof AuditAction];

/**
 * Tipos de recursos auditáveis
 */
export const TargetType = {
  PLAN: 'PLAN',
  GOAL: 'GOAL',
  USER: 'USER',
  ENROLLMENT: 'ENROLLMENT',
  NOTICE: 'NOTICE',
  SETTINGS: 'SETTINGS',
  AUTH: 'AUTH',
  SYSTEM: 'SYSTEM',
} as const;

export type TargetTypeValue = typeof TargetType[keyof typeof TargetType];

/**
 * Interface para dados de auditoria
 */
export interface AuditData {
  actorId: string;
  actorRole: 'MASTER' | 'ADMINISTRATIVO' | 'MENTOR' | 'PROFESSOR' | 'ALUNO';
  action: AuditActionType;
  targetType: TargetTypeValue;
  targetId?: string;
  payload?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Registra uma ação auditável no banco de dados
 * 
 * @param data - Dados da ação auditável
 * @returns Promise<void>
 * 
 * @example
 * await logAuditAction({
 *   actorId: ctx.user.id,
 *   actorRole: ctx.user.role,
 *   action: AuditAction.CREATE_PLAN,
 *   targetType: TargetType.PLAN,
 *   targetId: newPlan.id,
 *   payload: { plan_name: newPlan.name, category: newPlan.category },
 *   ipAddress: ctx.req.ip,
 *   userAgent: ctx.req.get('user-agent')
 * });
 */
export async function logAuditAction(data: AuditData): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      logger.warn('Database not available for audit logging');
      return;
    }

    const auditLog: InsertAuditLog = {
      id: nanoid(),
      actorId: data.actorId,
      actorRole: data.actorRole,
      action: data.action,
      targetType: data.targetType,
      targetId: data.targetId || null,
      payload: data.payload || null,
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
    };

    await db.insert(auditLogs).values(auditLog);

    logger.info({
      audit: true,
      actor_id: data.actorId,
      actor_role: data.actorRole,
      action: data.action,
      target_type: data.targetType,
      target_id: data.targetId,
    }, `Audit: ${data.action}`);
  } catch (error) {
    // Não falhar a operação principal se auditoria falhar
    logger.error({ error: String(error) }, 'Failed to log audit action');
  }
}

/**
 * Helper para extrair IP do request
 */
export function getClientIp(req: any): string | undefined {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    undefined
  );
}

/**
 * Helper para extrair User-Agent do request
 */
export function getUserAgent(req: any): string | undefined {
  return req.headers['user-agent'] || undefined;
}
