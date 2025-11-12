import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { InsertUser, users } from "../drizzle/schema";
import * as schema from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: mysql.Pool | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  const dbUrl = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
  if (!_db && dbUrl) {
    try {
      console.log("[Database] Initializing Drizzle ORM...");
      
      // Criar pool se não existe
      if (!_pool) {
        _pool = mysql.createPool({
          uri: dbUrl,
          connectionLimit: 10,
          waitForConnections: true,
          queueLimit: 0,
          enableKeepAlive: true,
          keepAliveInitialDelay: 0
        });
      }

      // Criar instância Drizzle
      _db = drizzle(_pool, { 
        schema: schema,
        casing: 'snake_case',
        mode: 'default'
      });
      
      console.log("[Database] Drizzle ORM initialized successfully!");
    } catch (error) {
      console.error("[Database] Failed to connect:", error);
      _db = null;
      _pool = null;
    }
  }
  return _db;
}

/**
 * Retorna connection pool MySQL2 para queries SQL diretas
 * Use quando precisar de db.query() raw
 */
export async function getRawDb(): Promise<mysql.Pool | null> {
  const dbUrl = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
  if (!_pool && dbUrl) {
    try {
      console.log("[Database] Creating MySQL2 connection pool...");
      
      _pool = mysql.createPool({
        uri: dbUrl,
        connectionLimit: 10,
        waitForConnections: true,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
      });

      // Testar conexão
      const connection = await _pool.getConnection();
      console.log("[Database] MySQL2 pool created successfully!");
      connection.release();
    } catch (error) {
      console.error("[Database] Failed to create MySQL2 pool:", error);
      _pool = null;
    }
  }
  return _pool;
}

/**
 * Fecha conexões do pool (útil para testes)
 */
export async function closeDb() {
  if (_pool) {
    await _pool.end();
    _pool = null;
    _db = null;
    console.log("[Database] Connection pool closed");
  }
}

/**
 * Cria um novo usuário no banco de dados
 * Sistema DOM usa autenticação simples (email + senha)
 */
export async function createUser(user: InsertUser): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create user: database not available");
    return;
  }

  try {
    await db.insert(users).values(user);
  } catch (error) {
    console.error("[Database] Failed to create user:", error);
    throw error;
  }
}

/**
 * Busca usuário por email
 */
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Busca usuário por ID
 */
export async function getUserById(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Busca usuário por CPF
 */
export async function getUserByCpf(cpf: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.cpf, cpf)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Atualiza dados do usuário
 */
export async function updateUser(id: string, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user: database not available");
    return;
  }

  try {
    await db.update(users).set(data).where(eq(users.id, id));
  } catch (error) {
    console.error("[Database] Failed to update user:", error);
    throw error;
  }
}

// TODO: Adicionar helpers para outras tabelas conforme necessário
