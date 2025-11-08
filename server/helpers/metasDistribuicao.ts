/**
 * Helper de Distribuição Automática de Metas
 * Implementa a lógica de redistribuição de metas pendentes
 * 
 * Regras críticas:
 * 1. Histórico é imutável (metas concluídas nunca mudam)
 * 2. Futuro é flexível (metas pendentes podem ser redistribuídas)
 * 3. Metas fixas têm prioridade absoluta
 * 4. Revisões não movem (mas podem realocar se necessário)
 * 5. Redistribuição é incremental (só afeta metas pendentes)
 */

import { addDays, format, parseISO, differenceInDays, isWeekend, getDay } from 'date-fns';

interface PlanoEstudo {
  id: string;
  horasPorDia: number; // Decimal (ex: 3.5)
  diasDisponiveisBitmask: number; // Bitmask dos dias disponíveis
  dataInicio: string; // ISO date
}

interface Meta {
  id: string;
  planoId: string;
  displayNumber: string;
  tipo: 'ESTUDO' | 'QUESTOES' | 'REVISAO';
  duracaoPlanejadaMin: number;
  scheduledDate: string;
  scheduledOrder: number;
  status: string;
  fixed: boolean;
  omitted: boolean;
}

/**
 * Verificar se dia está disponível no plano
 * Bitmask: Dom(64) Sáb(32) Sex(16) Qui(8) Qua(4) Ter(2) Seg(1)
 */
function isDayAvailable(date: Date, bitmask: number): boolean {
  const dayOfWeek = getDay(date); // 0=Dom, 1=Seg, ..., 6=Sáb
  const dayBit = 1 << dayOfWeek; // Converte para bit
  return (bitmask & dayBit) !== 0;
}

/**
 * Obter próximo dia disponível
 */
function getNextAvailableDay(startDate: Date, bitmask: number): Date {
  let current = startDate;
  let attempts = 0;
  
  while (attempts < 14) { // Máximo 2 semanas
    if (isDayAvailable(current, bitmask)) {
      return current;
    }
    current = addDays(current, 1);
    attempts++;
  }
  
  throw new Error('Nenhum dia disponível encontrado nos próximos 14 dias');
}

/**
 * Calcular capacidade disponível de um dia (em minutos)
 */
async function getAvailableCapacity(
  db: any,
  planoId: string,
  date: string,
  horasPorDia: number
): Promise<number> {
  // Capacidade total do dia
  const capacidadeTotalMin = Math.round(horasPorDia * 60);
  
  // Buscar metas já agendadas para este dia (fixas + não omitidas)
  const result = await db.query(
    `SELECT SUM(duracao_planejada_min) as usado
     FROM metas
     WHERE plano_id = ? 
       AND scheduled_date = ? 
       AND omitted = false
       AND status IN ('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA')`,
    [planoId, date]
  );
  
  const usado = result[0]?.usado || 0;
  return Math.max(0, capacidadeTotalMin - usado);
}

/**
 * Validar se metas fixas cabem no dia
 */
export async function validateFixedMetasForDay(
  db: any,
  planoId: string,
  date: string,
  horasPorDia: number
): Promise<{ valid: boolean; message?: string }> {
  const result = await db.query(
    `SELECT SUM(duracao_planejada_min) as total_fixas
     FROM metas
     WHERE plano_id = ?
       AND scheduled_date = ?
       AND fixed = true
       AND omitted = false`,
    [planoId, date]
  );
  
  const totalFixas = result[0]?.total_fixas || 0;
  const capacidadeTotalMin = Math.round(horasPorDia * 60);
  
  if (totalFixas > capacidadeTotalMin) {
    return {
      valid: false,
      message: `Metas fixas (${totalFixas}min) excedem capacidade do dia (${capacidadeTotalMin}min)`,
    };
  }
  
  return { valid: true };
}

/**
 * Obter primeira data com metas pendentes
 * Otimização: evita buscar todas as metas
 */
export async function getFirstPendingMetaDate(
  db: any,
  planoId: string
): Promise<string | null> {
  const result = await db.query(
    `SELECT MIN(scheduled_date) as first_date
     FROM metas
     WHERE plano_id = ?
       AND status = 'PENDENTE'
       AND omitted = false`,
    [planoId]
  );
  
  return result[0]?.first_date || null;
}

/**
 * Distribuir metas pendentes
 * Redistribui todas as metas pendentes respeitando:
 * - Capacidade diária
 * - Metas fixas
 * - Dias disponíveis
 * - Ordem original (order_key)
 */
export async function calculateDistribution(
  db: any,
  plano: PlanoEstudo
): Promise<{
  metasAtualizadas: number;
  diasAfetados: number;
  primeiraData: string;
  ultimaData: string;
}> {
  // 1. Buscar todas as metas pendentes ordenadas por order_key
  const metasPendentes = await db.query(
    `SELECT id, display_number, tipo, duracao_planejada_min, scheduled_date, order_key
     FROM metas
     WHERE plano_id = ?
       AND status = 'PENDENTE'
       AND omitted = false
     ORDER BY order_key ASC`,
    [plano.id]
  );
  
  if (metasPendentes.length === 0) {
    return {
      metasAtualizadas: 0,
      diasAfetados: 0,
      primeiraData: '',
      ultimaData: '',
    };
  }
  
  // 2. Encontrar primeira data disponível (hoje ou data_inicio do plano)
  const hoje = new Date();
  const dataInicio = parseISO(plano.dataInicio);
  let currentDate = hoje > dataInicio ? hoje : dataInicio;
  
  // Garantir que é dia disponível
  currentDate = getNextAvailableDay(currentDate, plano.diasDisponiveisBitmask);
  
  const updates: Array<{ id: string; date: string; order: number }> = [];
  const diasAfetados = new Set<string>();
  
  // 3. Distribuir metas
  for (const meta of metasPendentes) {
    let placed = false;
    let attempts = 0;
    
    while (!placed && attempts < 365) { // Máximo 1 ano
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      
      // Verificar capacidade disponível
      const capacidade = await getAvailableCapacity(
        db,
        plano.id,
        dateStr,
        plano.horasPorDia
      );
      
      if (capacidade >= meta.duracao_planejada_min) {
        // Cabe! Obter próxima ordem disponível no dia
        const orderResult = await db.query(
          `SELECT COALESCE(MAX(scheduled_order), 0) + 1 as next_order
           FROM metas
           WHERE plano_id = ? AND scheduled_date = ?`,
          [plano.id, dateStr]
        );
        
        const nextOrder = orderResult[0].next_order;
        
        updates.push({
          id: meta.id,
          date: dateStr,
          order: nextOrder,
        });
        
        diasAfetados.add(dateStr);
        placed = true;
      } else {
        // Não cabe, tentar próximo dia disponível
        currentDate = addDays(currentDate, 1);
        currentDate = getNextAvailableDay(currentDate, plano.diasDisponiveisBitmask);
      }
      
      attempts++;
    }
    
    if (!placed) {
      throw new Error(`Não foi possível alocar meta ${meta.display_number} após 365 tentativas`);
    }
  }
  
  // 4. Aplicar updates no banco (transação)
  for (const update of updates) {
    await db.query(
      `UPDATE metas_cronograma 
       SET scheduled_date = ?, scheduled_order = ?, atualizado_em = NOW()
       WHERE id = ?`,
      [update.date, update.order, update.id]
    );
  }
  
  // 5. Retornar estatísticas
  const datas = updates.map(u => u.date).sort();
  
  return {
    metasAtualizadas: updates.length,
    diasAfetados: diasAfetados.size,
    primeiraData: datas[0],
    ultimaData: datas[datas.length - 1],
  };
}

/**
 * Redistribuir plano após mudanças
 * Usado quando:
 * - Horas por dia mudaram
 * - Dias disponíveis mudaram
 * - Metas foram omitidas/restauradas
 * - Disciplinas foram ocultadas/exibidas
 */
export async function redistributePlan(
  db: any,
  planoId: string
): Promise<{
  metasAtualizadas: number;
  diasAfetados: number;
}> {
  // 1. Buscar plano
  const planoResult = await db.query(
    `SELECT id, horas_por_dia, dias_disponiveis_bitmask, data_inicio
     FROM metas_planos_estudo
     WHERE id = ?`,
    [planoId]
  );
  
  if (planoResult.length === 0) {
    throw new Error('Plano não encontrado');
  }
  
  const plano: PlanoEstudo = {
    id: planoResult[0].id,
    horasPorDia: parseFloat(planoResult[0].horas_por_dia),
    diasDisponiveisBitmask: planoResult[0].dias_disponiveis_bitmask,
    dataInicio: planoResult[0].data_inicio,
  };
  
  // 2. Executar distribuição
  const result = await calculateDistribution(db, plano);
  
  return {
    metasAtualizadas: result.metasAtualizadas,
    diasAfetados: result.diasAfetados,
  };
}

/**
 * Realocar revisões após mudança de data da meta de estudo
 * Quando uma meta de estudo é movida, suas revisões devem ser realocadas
 */
export async function reallocateReviews(
  db: any,
  metaEstudoId: string,
  novaDataEstudo: string
): Promise<number> {
  // Buscar revisões da meta de estudo
  const revisoes = await db.query(
    `SELECT id, review_config_json
     FROM metas
     WHERE parent_meta_id = ? AND tipo = 'REVISAO'`,
    [metaEstudoId]
  );
  
  let atualizadas = 0;
  
  for (const revisao of revisoes) {
    const config = JSON.parse(revisao.review_config_json);
    const diasApos = config.diasAposEstudo;
    
    // Calcular nova data
    const dataEstudo = parseISO(novaDataEstudo);
    const novaDataRevisao = addDays(dataEstudo, diasApos);
    const novaDataStr = format(novaDataRevisao, 'yyyy-MM-dd');
    
    // Atualizar revisão
    await db.query(
      `UPDATE metas_cronograma 
       SET scheduled_date = ?, atualizado_em = NOW()
       WHERE id = ?`,
      [novaDataStr, revisao.id]
    );
    
    atualizadas++;
  }
  
  return atualizadas;
}
