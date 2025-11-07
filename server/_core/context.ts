import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { extractTokenFromHeader, extractTokenFromCookie, verifyAccessToken } from "./auth";
import { getUserById, getDb } from "../db";

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
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // Tentar extrair token do header Authorization primeiro
    let token = extractTokenFromHeader(opts.req);
    
    // Fallback para cookie se não houver header
    if (!token) {
      token = extractTokenFromCookie(opts.req);
    }

    if (token) {
      // Verificar e decodificar o token
      const payload = verifyAccessToken(token);
      
      if (payload && payload.userId) {
        // Buscar usuário no banco de dados
        user = await getUserById(payload.userId) || null;
      }
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    console.error('[Context] Authentication error:', error);
    user = null;
  }

  const db = await getDb();
  
  if (!db) {
    throw new Error('[Context] Database not available');
  }
  
  return {
    req: opts.req,
    res: opts.res,
    user,
    db,
  };
}
