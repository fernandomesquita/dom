import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { extractTokenFromHeader, extractTokenFromCookie, verifyAccessToken } from "./auth";
import { getUserById, getDb } from "../db";
import { logger } from "./logger";
import { nanoid } from "nanoid";
import type { Logger } from "pino";

/**
 * Sistema DOM - Contexto tRPC com Autenticação Simples
 * 
 * IMPORTANTE: Este sistema NÃO usa OAuth.
 * Usa JWT extraído do header Authorization ou cookie.
 */

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  db: NonNullable<Awaited<ReturnType<typeof getDb>>>;
  logger: Logger;
  requestId: string;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  // Gerar ID único para a requisição
  const requestId = nanoid();
  
  // Criar logger com contexto da requisição
  const requestLogger = logger.child({ request_id: requestId });
  
  let user: User | null = null;

  console.log('🔍 ========== CREATE CONTEXT ==========');
  console.log('📋 Cookies recebidos:', opts.req.cookies);
  console.log('📋 Headers Authorization:', opts.req.headers.authorization);
  console.log('📋 Headers Cookie:', opts.req.headers.cookie);

  try {
    // 1. Tentar extrair token do header
    let token = extractTokenFromHeader(opts.req);
    console.log('🔑 Token do header:', token ? 'ENCONTRADO' : 'NÃO ENCONTRADO');
    
    // 2. Fallback para cookie
    if (!token) {
      token = extractTokenFromCookie(opts.req);
      console.log('🍪 Token do cookie:', token ? 'ENCONTRADO' : 'NÃO ENCONTRADO');
      const { COOKIE_NAME } = await import('@shared/const');
      console.log('🍪 Cookie name procurado:', COOKIE_NAME);
      console.log('🍪 Cookie value:', opts.req.cookies?.[COOKIE_NAME]?.substring(0, 20) + '...');
    }
    
    if (token) {
      console.log('✅ Token encontrado, verificando JWT...');
      
      // 3. Verificar e decodificar o token
      const payload = verifyAccessToken(token);
      console.log('🔐 JWT payload:', payload);
      
      if (payload && payload.userId) {
        console.log('🔍 Buscando usuário no banco:', payload.userId);
        
        // 4. Buscar usuário no banco
        user = await getUserById(payload.userId) || null;
        
        if (user) {
          console.log('✅ Usuário encontrado:', {
            id: user.id,
            email: user.email,
            role: user.role,
          });
          requestLogger.info({ 
            user_id: user.id, 
            user_role: user.role,
            user_email: user.email 
          }, 'User authenticated');
        } else {
          console.error('❌ Usuário NÃO encontrado no banco!');
        }
      } else {
        console.error('❌ Payload inválido:', payload);
      }
    } else {
      console.error('❌ NENHUM token encontrado (nem header nem cookie)');
    }
  } catch (error) {
    console.error('❌ ERRO ao criar contexto:', error);
    requestLogger.warn({ error: String(error) }, 'Authentication error');
    user = null;
  }

  console.log('🎯 Context final - user:', user ? `${user.email} (${user.role})` : 'NULL');
  console.log('🔍 ========== FIM CREATE CONTEXT ==========');

  const db = await getDb();
  
  if (!db) {
    requestLogger.error('Database not available');
    throw new Error('[Context] Database not available');
  }
  
  return {
    req: opts.req,
    res: opts.res,
    user,
    db,
    logger: requestLogger,
    requestId,
  };
}
