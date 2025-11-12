/**
 * Helper de Refresh Tokens com Rotação Obrigatória
 * 
 * Implementa security best practice de single-use refresh tokens:
 * 1. Validar token
 * 2. DELETAR token usado
 * 3. Gerar NOVO access + NOVO refresh
 * 4. Retornar ambos
 * 5. Token antigo inválido
 */

import { createHash, randomBytes, randomUUID } from 'crypto';
import { getDb } from '../db';
import { refreshTokens } from '../../drizzle/schema';
import { eq, and, gt } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { ENV } from '../_core/env';

const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const ACCESS_TOKEN_EXPIRY_MINUTES = 15;

interface TokenPayload {
  userId: string;
  email: string;
  role: 'ALUNO' | 'ADMIN';
}

interface DeviceInfo {
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Gera hash SHA-256 do token para armazenamento seguro
 */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Gera um novo refresh token aleatório
 */
function generateRandomToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Gera um novo access token JWT (15 minutos)
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ENV.jwtSecret, {
    expiresIn: `${ACCESS_TOKEN_EXPIRY_MINUTES}m`,
  });
}

/**
 * Cria um novo refresh token e armazena no banco
 */
export async function createRefreshToken(
  userId: string,
  deviceInfo: DeviceInfo = {}
): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const token = generateRandomToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  await db.insert(refreshTokens).values({
    id: randomUUID(),
    userId,
    tokenHash,
    expiresAt,
    revoked: false,
    dispositivoId: deviceInfo.deviceId,
    ipAddress: deviceInfo.ipAddress,
    userAgent: deviceInfo.userAgent,
  });

  return token;
}

/**
 * Valida refresh token e retorna dados do usuário
 * NÃO deleta o token (isso é feito na rotação)
 */
export async function validateRefreshToken(token: string): Promise<{
  userId: string;
  email: string;
  role: 'ALUNO' | 'ADMIN';
  tokenId: string;
} | null> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const tokenHash = hashToken(token);

  // Buscar token no banco
  const [refreshToken] = await db
    .select()
    .from(refreshTokens)
    .where(
      and(
        eq(refreshTokens.tokenHash, tokenHash),
        eq(refreshTokens.revoked, false),
        gt(refreshTokens.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!refreshToken) {
    return null;
  }

  // Buscar dados do usuário
  const { users } = await import('../../drizzle/schema');
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, refreshToken.userId))
    .limit(1);

  if (!user || !user.ativo) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    tokenId: refreshToken.id,
  };
}

/**
 * Rotaciona refresh token (single-use):
 * 1. Valida token antigo
 * 2. Deleta token antigo
 * 3. Gera novo access token + novo refresh token
 * 4. Retorna ambos
 */
export async function rotateRefreshToken(
  oldToken: string,
  deviceInfo: DeviceInfo = {}
): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
} | null> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Validar token antigo
  const userData = await validateRefreshToken(oldToken);
  if (!userData) {
    return null;
  }

  // Deletar token antigo (single-use)
  const oldTokenHash = hashToken(oldToken);
  await db
    .delete(refreshTokens)
    .where(eq(refreshTokens.tokenHash, oldTokenHash));

  // Gerar novo access token
  const accessToken = generateAccessToken({
    userId: userData.userId,
    email: userData.email,
    role: userData.role,
  });

  // Gerar novo refresh token
  const newRefreshToken = await createRefreshToken(userData.userId, deviceInfo);

  return {
    accessToken,
    refreshToken: newRefreshToken,
    expiresIn: ACCESS_TOKEN_EXPIRY_MINUTES * 60, // em segundos
  };
}

/**
 * Revoga um refresh token específico
 */
export async function revokeRefreshToken(token: string): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const tokenHash = hashToken(token);

  const result = await db
    .update(refreshTokens)
    .set({ revoked: true })
    .where(eq(refreshTokens.tokenHash, tokenHash));

  return true;
}

/**
 * Revoga todos os refresh tokens de um usuário (logout de todos os dispositivos)
 */
export async function revokeAllUserTokens(userId: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db
    .update(refreshTokens)
    .set({ revoked: true })
    .where(eq(refreshTokens.userId, userId));
}

/**
 * Revoga todos os tokens de um dispositivo específico
 */
export async function revokeDeviceTokens(
  userId: string,
  deviceId: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db
    .update(refreshTokens)
    .set({ revoked: true })
    .where(
      and(
        eq(refreshTokens.userId, userId),
        eq(refreshTokens.dispositivoId, deviceId)
      )
    );
}

/**
 * Lista todos os dispositivos ativos de um usuário
 */
export async function listUserDevices(userId: string): Promise<Array<{
  id: string;
  deviceId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  expiresAt: Date;
}>> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const devices = await db
    .select()
    .from(refreshTokens)
    .where(
      and(
        eq(refreshTokens.userId, userId),
        eq(refreshTokens.revoked, false),
        gt(refreshTokens.expiresAt, new Date())
      )
    );

  return devices.map(d => ({
    id: d.id,
    deviceId: d.dispositivoId,
    ipAddress: d.ipAddress,
    userAgent: d.userAgent,
    createdAt: d.createdAt,
    expiresAt: d.expiresAt,
  }));
}

/**
 * Limpa tokens expirados (job de limpeza)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const { lt } = await import('drizzle-orm');
  
  const result = await db
    .delete(refreshTokens)
    .where(lt(refreshTokens.expiresAt, new Date()));

  return 0; // Drizzle não retorna affected rows em delete
}
