import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { questoesResolvidas, questoes } from "../../drizzle/schema";
import { eq, and, gte, lte, inArray, sql } from "drizzle-orm";

/**
 * Filtros de segmentação avançada
 */
export interface FiltrosSegmentacao {
  // Filtros básicos
  planos?: string[];
  diasUltimoAcesso?: number;
  
  // Filtros avançados
  disciplinas?: string[]; // IDs de disciplinas
  taxaAcertoMin?: number; // 0-100
  taxaAcertoMax?: number; // 0-100
  questoesResolvidasMin?: number;
  questoesResolvidasMax?: number;
}

/**
 * Calcular usuários elegíveis baseado em filtros de segmentação
 */
export async function calcularUsuariosElegiveis(filtros: FiltrosSegmentacao): Promise<number[]> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Começar com todos os usuários ativos
  let query = db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.ativo, true));

  // Aplicar filtros básicos
  if (filtros.diasUltimoAcesso) {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - filtros.diasUltimoAcesso);
    query = query.where(gte(users.updatedAt, dataLimite)) as any;
  }

  const usuariosBase = await query;
  let usuariosElegiveis = usuariosBase.map(u => u.id);

  // Filtros avançados que requerem joins complexos
  if (filtros.disciplinas && filtros.disciplinas.length > 0) {
    usuariosElegiveis = await filtrarPorDisciplinas(usuariosElegiveis, filtros.disciplinas);
  }

  if (filtros.taxaAcertoMin !== undefined || filtros.taxaAcertoMax !== undefined) {
    usuariosElegiveis = await filtrarPorTaxaAcerto(
      usuariosElegiveis,
      filtros.taxaAcertoMin,
      filtros.taxaAcertoMax
    );
  }

  if (filtros.questoesResolvidasMin !== undefined || filtros.questoesResolvidasMax !== undefined) {
    usuariosElegiveis = await filtrarPorQuestoesResolvidas(
      usuariosElegiveis,
      filtros.questoesResolvidasMin,
      filtros.questoesResolvidasMax
    );
  }

  return usuariosElegiveis;
}

/**
 * Filtrar usuários que resolveram questões de disciplinas específicas
 */
async function filtrarPorDisciplinas(userIds: string[], disciplinas: string[]): Promise<string[]> {
  const db = await getDb();
  if (!db) return userIds;

  const result = await db
    .selectDistinct({ userId: questoesResolvidas.userId })
    .from(questoesResolvidas)
    .innerJoin(questoes, eq(questoesResolvidas.questaoId, questoes.id))
    .where(
      and(
        inArray(questoesResolvidas.userId, userIds),
        inArray(questoes.disciplinaId, disciplinas)
      )
    );

  return result.map(r => r.userId);
}

/**
 * Filtrar usuários por taxa de acerto geral
 */
async function filtrarPorTaxaAcerto(
  userIds: string[],
  min?: number,
  max?: number
): Promise<string[]> {
  const db = await getDb();
  if (!db) return userIds;

  const result = await db
    .select({
      userId: questoesResolvidas.userId,
      total: sql<number>`COUNT(*)`,
      corretas: sql<number>`SUM(CASE WHEN ${questoesResolvidas.correta} = 1 THEN 1 ELSE 0 END)`,
    })
    .from(questoesResolvidas)
    .where(inArray(questoesResolvidas.userId, userIds))
    .groupBy(questoesResolvidas.userId);

  return result
    .filter(r => {
      const taxa = (Number(r.corretas) / Number(r.total)) * 100;
      if (min !== undefined && taxa < min) return false;
      if (max !== undefined && taxa > max) return false;
      return true;
    })
    .map(r => r.userId);
}

/**
 * Filtrar usuários por quantidade de questões resolvidas
 */
async function filtrarPorQuestoesResolvidas(
  userIds: string[],
  min?: number,
  max?: number
): Promise<string[]> {
  const db = await getDb();
  if (!db) return userIds;

  const result = await db
    .select({
      userId: questoesResolvidas.userId,
      total: sql<number>`COUNT(*)`,
    })
    .from(questoesResolvidas)
    .where(inArray(questoesResolvidas.userId, userIds))
    .groupBy(questoesResolvidas.userId);

  return result
    .filter(r => {
      const total = Number(r.total);
      if (min !== undefined && total < min) return false;
      if (max !== undefined && total > max) return false;
      return true;
    })
    .map(r => r.userId);
}

/**
 * Obter estatísticas de segmentação
 */
export async function obterEstatisticasSegmentacao(filtros: FiltrosSegmentacao) {
  const usuariosElegiveis = await calcularUsuariosElegiveis(filtros);
  
  const db = await getDb();
  if (!db) {
    return {
      totalElegiveis: usuariosElegiveis.length,
      porDisciplina: [],
      taxaAcertoMedia: 0,
      questoesResolvidasMedia: 0,
    };
  }

  // Estatísticas por disciplina (se filtrado)
  let porDisciplina: any[] = [];
  if (filtros.disciplinas && filtros.disciplinas.length > 0 && usuariosElegiveis.length > 0) {
    porDisciplina = await db
      .select({
        disciplinaId: questoes.disciplinaId,
        usuarios: sql<number>`COUNT(DISTINCT ${questoesResolvidas.userId})`,
      })
      .from(questoesResolvidas)
      .innerJoin(questoes, eq(questoesResolvidas.questaoId, questoes.id))
      .where(
        and(
          inArray(questoesResolvidas.userId, usuariosElegiveis),
          inArray(questoes.disciplinaId, filtros.disciplinas)
        )
      )
      .groupBy(questoes.disciplinaId);
  }

  // Taxa de acerto média
  let taxaAcertoMedia = 0;
  if (usuariosElegiveis.length > 0) {
    const stats = await db
      .select({
        total: sql<number>`COUNT(*)`,
        corretas: sql<number>`SUM(CASE WHEN ${questoesResolvidas.correta} = 1 THEN 1 ELSE 0 END)`,
      })
      .from(questoesResolvidas)
      .where(inArray(questoesResolvidas.userId, usuariosElegiveis));

    if (stats.length > 0 && Number(stats[0].total) > 0) {
      taxaAcertoMedia = (Number(stats[0].corretas) / Number(stats[0].total)) * 100;
    }
  }

  // Questões resolvidas média
  let questoesResolvidasMedia = 0;
  if (usuariosElegiveis.length > 0) {
    const stats = await db
      .select({
        total: sql<number>`COUNT(*)`,
      })
      .from(questoesResolvidas)
      .where(inArray(questoesResolvidas.userId, usuariosElegiveis));

    if (stats.length > 0) {
      questoesResolvidasMedia = Number(stats[0].total) / usuariosElegiveis.length;
    }
  }

  return {
    totalElegiveis: usuariosElegiveis.length,
    porDisciplina: porDisciplina.map(d => ({
      disciplinaId: d.disciplinaId,
      usuarios: Number(d.usuarios),
    })),
    taxaAcertoMedia: Number(taxaAcertoMedia.toFixed(1)),
    questoesResolvidasMedia: Math.round(questoesResolvidasMedia),
  };
}
