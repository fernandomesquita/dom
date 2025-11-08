/**
 * Helper de Numeração de Metas
 * Sistema de numeração única e ordenável
 */

/**
 * Gerar chave de ordenação
 * Garante ordenação correta mesmo com sufixos (#015.10 após #015.9)
 * 
 * @example
 * makeOrderKey(15, 1) → "000015/0001"
 * makeOrderKey(15, null) → "000015/0000"
 */
export function makeOrderKey(base: number, suffix?: number | null): string {
  const b = String(base).padStart(6, '0'); // 000015
  const s = suffix == null ? '0000' : String(suffix).padStart(4, '0'); // 0001
  return `${b}/${s}`; // "000015/0001"
}

/**
 * Formatar número de exibição
 * 
 * @example
 * formatDisplayNumber(15, 1) → "#015.1"
 * formatDisplayNumber(15, null) → "#015"
 */
export function formatDisplayNumber(base: number, suffix?: number | null): string {
  const b = String(base).padStart(3, '0'); // 015
  if (suffix == null) {
    return `#${b}`; // "#015"
  }
  return `#${b}.${suffix}`; // "#015.1"
}

/**
 * Obter próximo número de meta disponível
 * Busca o maior meta_number_base no plano e retorna base+1
 */
export async function getNextMetaNumber(
  db: any,
  planoId: string
): Promise<{ base: number; suffix: null }> {
  const result = await db.query(
    `SELECT MAX(meta_number_base) as max_base FROM metas_cronograma WHERE plano_id = ?`,
    [planoId]
  );

  const maxBase = result[0]?.max_base || 0;
  return {
    base: maxBase + 1,
    suffix: null,
  };
}

/**
 * Obter próximo sufixo para uma meta base
 * Usado quando criando revisões ou sequências
 * 
 * @example
 * // Meta #015 existe
 * getNextSuffix(db, planoId, 15) → 1 (cria #015.1)
 * // Meta #015.1 existe
 * getNextSuffix(db, planoId, 15) → 2 (cria #015.2)
 */
export async function getNextSuffix(
  db: any,
  planoId: string,
  base: number
): Promise<number> {
  const result = await db.query(
    `SELECT MAX(meta_number_suffix) as max_suffix 
     FROM metas_cronograma 
     WHERE plano_id = ? AND meta_number_base = ?`,
    [planoId, base]
  );

  const maxSuffix = result[0]?.max_suffix;
  
  // Se não há sufixo, começar em 1
  if (maxSuffix == null) {
    return 1;
  }
  
  return maxSuffix + 1;
}

/**
 * Parsear display_number para extrair base e suffix
 * 
 * @example
 * parseDisplayNumber("#015") → { base: 15, suffix: null }
 * parseDisplayNumber("#015.1") → { base: 15, suffix: 1 }
 */
export function parseDisplayNumber(displayNumber: string): {
  base: number;
  suffix: number | null;
} {
  // Remove "#" e split por "."
  const clean = displayNumber.replace('#', '');
  const parts = clean.split('.');

  const base = parseInt(parts[0], 10);
  const suffix = parts[1] ? parseInt(parts[1], 10) : null;

  return { base, suffix };
}

/**
 * Validar unicidade de display_number no plano
 */
export async function isDisplayNumberUnique(
  db: any,
  planoId: string,
  displayNumber: string,
  excludeMetaId?: string
): Promise<boolean> {
  let query = `SELECT COUNT(*) as count FROM metas_cronograma WHERE plano_id = ? AND display_number = ?`;
  const params: any[] = [planoId, displayNumber];

  if (excludeMetaId) {
    query += ` AND id != ?`;
    params.push(excludeMetaId);
  }

  const result = await db.query(query, params);
  return result[0].count === 0;
}
