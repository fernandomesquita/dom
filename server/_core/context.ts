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

  try {
    // Tentar extrair token do header Authorization primeiro
    let token = extractTokenFromHeader(opts.req);
    
    // Fallback para cookie se não houver header
    if (!token) {
      token = extractTokenFromCookie(opts.req);
    }

    if (token) {
      console.log('🔑 Token encontrado');
      
      // Verificar e decodificar o token
      const payload = verifyAccessToken(token);
      
      if (payload && payload.userId) {
        console.log('✅ Token válido, userId:', payload.userId);
        
        // Buscar usuário no banco de dados
        user = await getUserById(payload.userId) || null;
        
        if (user) {
          console.log('✅ Usuário carregado:', {
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
          console.error('❌ Usuário não encontrado no banco:', payload.userId);
        }
      }
    } else {
      console.log('⚠️ Nenhum token encontrado');
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    requestLogger.warn({ error: String(error) }, 'Authentication error');
    user = null;
  }

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
