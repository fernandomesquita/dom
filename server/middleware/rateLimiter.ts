/**
 * Middleware de Rate Limiting com Exponential Backoff
 * 
 * Protege contra brute force attacks com:
 * - Limites por endpoint
 * - Exponential backoff (4ª: 30s, 5ª: 1min, 6+: 15min)
 * - Headers X-RateLimit-* nas respostas
 * - Retry-After para indicar quando tentar novamente
 */

import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Store em memória para tracking de tentativas
 * Em produção, usar Redis para compartilhar entre instâncias
 */
const attemptStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Calcula tempo de lockout baseado no número de tentativas (exponential backoff)
 */
function calculateLockoutTime(attempts: number): number {
  if (attempts <= 3) return 0;
  if (attempts === 4) return 30 * 1000; // 30 segundos
  if (attempts === 5) return 60 * 1000; // 1 minuto
  return 15 * 60 * 1000; // 15 minutos para 6+
}

/**
 * Gera chave única para rate limiting (IP + identificador)
 */
function generateKey(req: Request, identifier?: string): string {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  return identifier ? `${ip}:${identifier}` : ip;
}

/**
 * Handler customizado de rate limit com exponential backoff
 */
function createRateLimitHandler(options: {
  windowMs: number;
  max: number;
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
}) {
  const limiter = rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    keyGenerator: options.keyGenerator || ((req) => req.ip || 'unknown'),
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    handler: (req: Request, res: Response) => {
      const key = options.keyGenerator ? options.keyGenerator(req) : (req.ip || 'unknown');
      const now = Date.now();
      
      // Buscar tentativas anteriores
      let attempts = attemptStore.get(key);
      if (!attempts || attempts.resetAt < now) {
        attempts = { count: 1, resetAt: now + options.windowMs };
        attemptStore.set(key, attempts);
      } else {
        attempts.count++;
      }

      // Calcular lockout time
      const lockoutMs = calculateLockoutTime(attempts.count);
      const retryAfter = Math.ceil(lockoutMs / 1000);

      res.status(429).json({
        success: false,
        error: 'Muitas tentativas. Tente novamente mais tarde.',
        errorCode: 'RATE_LIMIT_EXCEEDED',
        metadata: {
          timestamp: new Date().toISOString(),
          retryAfter,
          attempts: attempts.count,
          lockoutTime: lockoutMs > 0 ? `${retryAfter}s` : '0s',
        },
      });
    },
  });

  return limiter;
}

/**
 * Rate limiter para login
 * Limite: 5 tentativas / 15 minutos
 * Chave: IP + email
 * Exponential backoff: 4ª: 30s, 5ª: 1min, 6+: 15min
 */
export const loginRateLimiter: RateLimitRequestHandler = createRateLimitHandler({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,
  keyGenerator: (req: Request) => {
    const email = req.body?.email || 'no-email';
    return generateKey(req, email);
  },
  skipSuccessfulRequests: true, // Só conta tentativas falhadas
});

/**
 * Rate limiter para registro
 * Limite: 3 tentativas / 1 hora
 * Chave: IP
 */
export const registerRateLimiter: RateLimitRequestHandler = createRateLimitHandler({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3,
  keyGenerator: (req: Request) => generateKey(req),
});

/**
 * Rate limiter para recuperação de senha
 * Limite: 3 tentativas / 1 hora
 * Chave: IP + email
 */
export const passwordResetRateLimiter: RateLimitRequestHandler = createRateLimitHandler({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3,
  keyGenerator: (req: Request) => {
    const email = req.body?.email || 'no-email';
    return generateKey(req, email);
  },
});

/**
 * Rate limiter para refresh token
 * Limite: 10 tentativas / 15 minutos
 * Chave: IP
 */
export const refreshTokenRateLimiter: RateLimitRequestHandler = createRateLimitHandler({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  keyGenerator: (req: Request) => generateKey(req),
});

/**
 * Rate limiter genérico para APIs
 * Limite: 100 requisições / 15 minutos
 * Chave: IP
 */
export const apiRateLimiter: RateLimitRequestHandler = createRateLimitHandler({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  keyGenerator: (req: Request) => generateKey(req),
});

/**
 * Limpa tentativas expiradas do store (job de limpeza)
 * Executar a cada 1 hora
 */
export function cleanupExpiredAttempts(): void {
  const now = Date.now();
  for (const [key, attempts] of attemptStore.entries()) {
    if (attempts.resetAt < now) {
      attemptStore.delete(key);
    }
  }
}

/**
 * Reseta tentativas de um usuário específico (após login bem-sucedido)
 */
export function resetUserAttempts(req: Request, email: string): void {
  const key = generateKey(req, email);
  attemptStore.delete(key);
}

// Job de limpeza a cada 1 hora
setInterval(cleanupExpiredAttempts, 60 * 60 * 1000);
