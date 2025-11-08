import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { ENV } from './env';
import { COOKIE_NAME } from '@shared/const';

/**
 * Sistema DOM - Autenticação Simples (Email + Senha)
 * 
 * IMPORTANTE: Este sistema NÃO usa OAuth.
 * Usa apenas JWT para gerenciar sessões.
 */

const JWT_SECRET = ENV.jwtSecret;
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutos (security best practice)
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 dias

export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: 'ALUNO' | 'ADMIN';
  sessionId: string;
  deviceId?: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

/**
 * Gera um access token JWT
 */
export function generateAccessToken(payload: Omit<AccessTokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    algorithm: 'HS256',
  });
}

/**
 * Gera um refresh token JWT
 */
export function generateRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
    algorithm: 'HS256',
  });
}

/**
 * Verifica e decodifica um access token
 */
export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    }) as AccessTokenPayload;
    return decoded;
  } catch (error) {
    console.error('[Auth] Failed to verify access token:', error);
    return null;
  }
}

/**
 * Verifica e decodifica um refresh token
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    }) as RefreshTokenPayload;
    return decoded;
  } catch (error) {
    console.error('[Auth] Failed to verify refresh token:', error);
    return null;
  }
}

/**
 * Extrai o token do header Authorization
 */
export function extractTokenFromHeader(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Extrai o token do cookie (fallback)
 */
export function extractTokenFromCookie(req: Request): string | null {
  return req.cookies?.[COOKIE_NAME] || null;
}

/**
 * Define o access token no cookie
 */
export function setAccessTokenCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutos
  });
}

/**
 * Define o refresh token no cookie
 */
export function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie('refresh_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
  });
}

/**
 * Remove os tokens dos cookies (logout)
 */
export function clearAuthCookies(res: Response): void {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
}

/**
 * Gera um ID de sessão único
 */
export function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}
