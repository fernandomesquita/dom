/**
 * Sistema de Notificações Push - Módulo de Metas
 * 
 * Envia notificações automáticas para:
 * 1. Lembrar metas do dia (8h e 14h)
 * 2. Alertar prazos (1 dia antes)
 * 3. Parabenizar por streaks (3, 7, 15 dias consecutivos)
 */

import cron from 'node-cron';
import { getDb } from '../db';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { notifyOwner } from '../_core/notification';

// ==================== TIPOS ====================

interface MetaNotificacao {
  userId: number;
  metaId: number;
  numero: string;
  tipo: string;
  disciplina: string;
  assunto: string;
  duracaoMin: number;
}

interface StreakInfo {
  userId: number;
  diasConsecutivos: number;
  ultimaConclusao: Date;
}

// ==================== HELPERS ====================

/**
 * Busca metas pendentes do dia para um usuário
 */
async function buscarMetasDoDia(userId: number): Promise<MetaNotificacao[]> {
  const db = await getDb();
  if (!db) return [];

  const hoje = new Date().toISOString().split('T')[0];

  const metas = await db.execute(sql`
    SELECT 
      m.id as metaId,
      m.numero,
      m.tipo,
      m.duracao_planejada_min as duracaoMin,
      d.nome as disciplina,
      a.nome as assunto
    FROM metas_cronograma m
    INNER JOIN metas_planos_estudo p ON m.plano_id = p.id
    LEFT JOIN disciplinas d ON m.ktree_disciplina_id = d.id
    LEFT JOIN assuntos a ON m.ktree_assunto_id = a.id
    WHERE p.user_id = ${userId}
      AND m.scheduled_date = ${hoje}
      AND m.status = 'PENDENTE'
    ORDER BY m.scheduled_order ASC
  `);

  return metas.rows as any[];
}

/**
 * Busca metas com prazo próximo (1 dia antes)
 */
async function buscarMetasComPrazoProximo(userId: number): Promise<MetaNotificacao[]> {
  const db = await getDb();
  if (!db) return [];

  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  const amanhaStr = amanha.toISOString().split('T')[0];

  const metas = await db.execute(sql`
    SELECT 
      m.id as metaId,
      m.numero,
      m.tipo,
      m.duracao_planejada_min as duracaoMin,
      d.nome as disciplina,
      a.nome as assunto
    FROM metas_cronograma m
    INNER JOIN metas_planos_estudo p ON m.plano_id = p.id
    LEFT JOIN disciplinas d ON m.ktree_disciplina_id = d.id
    LEFT JOIN assuntos a ON m.ktree_assunto_id = a.id
    WHERE p.user_id = ${userId}
      AND m.scheduled_date = ${amanhaStr}
      AND m.status = 'PENDENTE'
      AND m.tipo != 'REVISAO'
    ORDER BY m.scheduled_order ASC
  `);

  return metas.rows as any[];
}

/**
 * Calcula streak de conclusões consecutivas
 */
async function calcularStreak(userId: number): Promise<StreakInfo | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.execute(sql`
    SELECT 
      DATE(lc.concluded_at) as data_conclusao
    FROM metas_cronograma_log_conclusoes lc
    INNER JOIN metas_cronograma m ON lc.meta_id = m.id
    INNER JOIN metas_planos_estudo p ON m.plano_id = p.id
    WHERE p.user_id = ${userId}
    GROUP BY DATE(lc.concluded_at)
    ORDER BY data_conclusao DESC
    LIMIT 30
  `);

  if (!result.rows.length) return null;

  let diasConsecutivos = 0;
  let dataEsperada = new Date();
  dataEsperada.setHours(0, 0, 0, 0);

  for (const row of result.rows as any[]) {
    const dataConclusao = new Date(row.data_conclusao);
    dataConclusao.setHours(0, 0, 0, 0);

    if (dataConclusao.getTime() === dataEsperada.getTime()) {
      diasConsecutivos++;
      dataEsperada.setDate(dataEsperada.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    userId,
    diasConsecutivos,
    ultimaConclusao: new Date((result.rows[0] as any).data_conclusao),
  };
}

// ==================== NOTIFICAÇÕES ====================

/**
 * Envia lembrete de metas do dia (8h e 14h)
 */
async function enviarLembreteMetasDoDia() {
  const db = await getDb();
  if (!db) return;

  console.log('[MetasNotificações] Enviando lembretes de metas do dia...');

  // Buscar todos os usuários com metas pendentes hoje
  const usuarios = await db.execute(sql`
    SELECT DISTINCT p.user_id
    FROM metas_planos_estudo p
    INNER JOIN metas_cronograma m ON m.plano_id = p.id
    WHERE m.scheduled_date = CURDATE()
      AND m.status = 'PENDENTE'
  `);

  for (const usuario of usuarios.rows as any[]) {
    const metas = await buscarMetasDoDia(usuario.user_id);
    
    if (metas.length === 0) continue;

    const totalMinutos = metas.reduce((sum, m) => sum + m.duracaoMin, 0);
    const totalHoras = Math.floor(totalMinutos / 60);
    const totalMinutosRestantes = totalMinutos % 60;

    const mensagem = `
📚 **Metas de Hoje**

Você tem ${metas.length} meta(s) pendente(s) para hoje:

${metas.map((m, i) => `${i + 1}. ${m.numero} - ${m.disciplina} › ${m.assunto} (${m.duracaoMin}min)`).join('\n')}

⏱️ Tempo total: ${totalHoras}h${totalMinutosRestantes}min

Acesse /metas/hoje para começar!
    `.trim();

    // Enviar notificação (integração com sistema de avisos)
    await notifyOwner({
      title: `📚 ${metas.length} meta(s) pendente(s) hoje`,
      content: mensagem,
    });
  }

  console.log(`[MetasNotificações] Lembretes enviados para ${usuarios.rows.length} usuário(s)`);
}

/**
 * Envia alerta de prazo próximo (1 dia antes)
 */
async function enviarAlertaPrazoProximo() {
  const db = await getDb();
  if (!db) return;

  console.log('[MetasNotificações] Enviando alertas de prazo próximo...');

  // Buscar todos os usuários com metas amanhã
  const usuarios = await db.execute(sql`
    SELECT DISTINCT p.user_id
    FROM metas_planos_estudo p
    INNER JOIN metas_cronograma m ON m.plano_id = p.id
    WHERE m.scheduled_date = DATE_ADD(CURDATE(), INTERVAL 1 DAY)
      AND m.status = 'PENDENTE'
      AND m.tipo != 'REVISAO'
  `);

  for (const usuario of usuarios.rows as any[]) {
    const metas = await buscarMetasComPrazoProximo(usuario.user_id);
    
    if (metas.length === 0) continue;

    const mensagem = `
⚠️ **Prazo Próximo**

Você tem ${metas.length} meta(s) agendada(s) para amanhã:

${metas.map((m, i) => `${i + 1}. ${m.numero} - ${m.disciplina} › ${m.assunto}`).join('\n')}

Prepare-se para não perder o ritmo!
    `.trim();

    await notifyOwner({
      title: `⚠️ ${metas.length} meta(s) amanhã`,
      content: mensagem,
    });
  }

  console.log(`[MetasNotificações] Alertas enviados para ${usuarios.rows.length} usuário(s)`);
}

/**
 * Envia parabenização por streak (3, 7, 15 dias consecutivos)
 */
async function enviarParabensStreak() {
  const db = await getDb();
  if (!db) return;

  console.log('[MetasNotificações] Verificando streaks...');

  // Buscar todos os usuários com planos ativos
  const usuarios = await db.execute(sql`
    SELECT DISTINCT user_id
    FROM metas_planos_estudo
    WHERE status = 'ATIVO'
  `);

  for (const usuario of usuarios.rows as any[]) {
    const streak = await calcularStreak(usuario.user_id);
    
    if (!streak || streak.diasConsecutivos === 0) continue;

    // Enviar parabenização apenas em marcos específicos
    const marcos = [3, 7, 15, 30, 60, 90, 180, 365];
    if (!marcos.includes(streak.diasConsecutivos)) continue;

    const emoji = streak.diasConsecutivos >= 30 ? '🏆' : 
                  streak.diasConsecutivos >= 15 ? '🥇' :
                  streak.diasConsecutivos >= 7 ? '🥈' : '🥉';

    const mensagem = `
${emoji} **Parabéns pelo Streak!**

Você concluiu metas por ${streak.diasConsecutivos} dias consecutivos!

Continue assim e você alcançará seus objetivos! 💪
    `.trim();

    await notifyOwner({
      title: `${emoji} Streak de ${streak.diasConsecutivos} dias!`,
      content: mensagem,
    });

    console.log(`[MetasNotificações] Parabenização enviada para usuário ${usuario.user_id} (streak: ${streak.diasConsecutivos} dias)`);
  }
}

// ==================== AGENDAMENTO ====================

/**
 * Inicializa o scheduler de notificações
 */
export function iniciarSchedulerMetasNotificacoes() {
  console.log('[MetasNotificações] Iniciando scheduler de notificações...');

  // Lembrete de metas do dia às 8h
  cron.schedule('0 8 * * *', async () => {
    try {
      await enviarLembreteMetasDoDia();
    } catch (error) {
      console.error('[MetasNotificações] Erro ao enviar lembrete 8h:', error);
    }
  }, {
    timezone: 'America/Sao_Paulo',
  });

  // Lembrete de metas do dia às 14h
  cron.schedule('0 14 * * *', async () => {
    try {
      await enviarLembreteMetasDoDia();
    } catch (error) {
      console.error('[MetasNotificações] Erro ao enviar lembrete 14h:', error);
    }
  }, {
    timezone: 'America/Sao_Paulo',
  });

  // Alerta de prazo próximo às 20h (1 dia antes)
  cron.schedule('0 20 * * *', async () => {
    try {
      await enviarAlertaPrazoProximo();
    } catch (error) {
      console.error('[MetasNotificações] Erro ao enviar alerta de prazo:', error);
    }
  }, {
    timezone: 'America/Sao_Paulo',
  });

  // Verificação de streaks às 22h
  cron.schedule('0 22 * * *', async () => {
    try {
      await enviarParabensStreak();
    } catch (error) {
      console.error('[MetasNotificações] Erro ao verificar streaks:', error);
    }
  }, {
    timezone: 'America/Sao_Paulo',
  });

  console.log('[MetasNotificações] Scheduler iniciado com sucesso!');
  console.log('  - Lembrete de metas: 8h e 14h');
  console.log('  - Alerta de prazo: 20h');
  console.log('  - Verificação de streaks: 22h');
}

// ==================== EXPORTAÇÃO ====================

export default {
  iniciarSchedulerMetasNotificacoes,
  enviarLembreteMetasDoDia,
  enviarAlertaPrazoProximo,
  enviarParabensStreak,
};
