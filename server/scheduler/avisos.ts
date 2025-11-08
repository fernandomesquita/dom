import cron from 'node-cron';
import { getDb } from '../db';
import { avisosAgendamentos, avisosAgendamentosLogs, avisos } from '../../drizzle/schema-avisos';
import { eq, and, lte } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { queue } from '../queues/config';

/**
 * Scheduler de Avisos Agendados
 * Processa avisos agendados usando node-cron
 */

let schedulerTask: cron.ScheduledTask | null = null;

/**
 * Calcular próxima execução baseado em recorrência
 */
function calcularProximaExecucao(
  dataAtual: Date,
  recorrencia: string
): Date | null {
  const proxima = new Date(dataAtual);

  switch (recorrencia) {
    case 'diaria':
      proxima.setDate(proxima.getDate() + 1);
      return proxima;
    
    case 'semanal':
      proxima.setDate(proxima.getDate() + 7);
      return proxima;
    
    case 'mensal':
      proxima.setMonth(proxima.getMonth() + 1);
      return proxima;
    
    case 'unica':
      return null; // Não há próxima execução
    
    default:
      return null;
  }
}

/**
 * Processar avisos agendados que devem ser executados agora
 */
async function processarAgendamentos() {
  const db = await getDb();
  if (!db) {
    console.error('[Scheduler] Database not available');
    return;
  }

  try {
    const agora = new Date();
    
    // Buscar agendamentos ativos cuja próxima execução já passou
    const agendamentosPendentes = await db
      .select()
      .from(avisosAgendamentos)
      .where(
        and(
          eq(avisosAgendamentos.status, 'ativo'),
          lte(avisosAgendamentos.proximaExecucao, agora)
        )
      );

    if (agendamentosPendentes.length === 0) {
      return;
    }

    console.log(
      `[Scheduler] Processando ${agendamentosPendentes.length} agendamentos...`
    );

    for (const agendamento of agendamentosPendentes) {
      try {
        // Buscar aviso
        const [aviso] = await db
          .select()
          .from(avisos)
          .where(eq(avisos.id, agendamento.avisoId))
          .limit(1);

        if (!aviso) {
          console.error(
            `[Scheduler] Aviso ${agendamento.avisoId} não encontrado`
          );
          continue;
        }

        // Disparar job de envio em massa
        await queue.addJob('enviarAvisoEmMassa', {
          avisoId: agendamento.avisoId,
          segmentacao: agendamento.segmentacao || {},
          adminId: agendamento.criadoPor,
        });

        console.log(
          `[Scheduler] Job de envio disparado para aviso ${agendamento.avisoId}`
        );

        // Registrar log de execução
        await db.insert(avisosAgendamentosLogs).values({
          id: uuidv4(),
          agendamentoId: agendamento.id,
          avisoId: agendamento.avisoId,
          status: 'sucesso',
          usuariosAlcancados: 0, // Será atualizado pelo worker
          executadoEm: new Date(),
        });

        // Calcular próxima execução
        const proximaExecucao = calcularProximaExecucao(
          agora,
          agendamento.recorrencia
        );

        if (proximaExecucao) {
          // Atualizar próxima execução
          await db
            .update(avisosAgendamentos)
            .set({ proximaExecucao })
            .where(eq(avisosAgendamentos.id, agendamento.id));
        } else {
          // Marcar como concluído (agendamento único)
          await db
            .update(avisosAgendamentos)
            .set({ status: 'concluido' })
            .where(eq(avisosAgendamentos.id, agendamento.id));
        }
      } catch (error) {
        console.error(
          `[Scheduler] Erro ao processar agendamento ${agendamento.id}:`,
          error
        );

        // Registrar log de erro
        await db.insert(avisosAgendamentosLogs).values({
          id: uuidv4(),
          agendamentoId: agendamento.id,
          avisoId: agendamento.avisoId,
          status: 'erro',
          usuariosAlcancados: 0,
          erroMensagem: error instanceof Error ? error.message : 'Erro desconhecido',
          executadoEm: new Date(),
        });
      }
    }
  } catch (error) {
    console.error('[Scheduler] Erro ao processar agendamentos:', error);
  }
}

/**
 * Iniciar scheduler
 * Executa a cada minuto para verificar agendamentos pendentes
 */
export function iniciarScheduler() {
  if (schedulerTask) {
    console.log('[Scheduler] Já está em execução');
    return;
  }

  // Executar a cada minuto
  schedulerTask = cron.schedule('* * * * *', () => {
    processarAgendamentos();
  });

  console.log('[Scheduler] Iniciado - verificando agendamentos a cada minuto');
}

/**
 * Parar scheduler
 */
export function pararScheduler() {
  if (schedulerTask) {
    schedulerTask.stop();
    schedulerTask = null;
    console.log('[Scheduler] Parado');
  }
}

/**
 * Calcular próximas N execuções de um agendamento
 */
export function calcularProximasExecucoes(
  dataInicio: Date,
  recorrencia: string,
  quantidade: number = 5
): Date[] {
  const execucoes: Date[] = [];
  let dataAtual = new Date(dataInicio);

  for (let i = 0; i < quantidade; i++) {
    execucoes.push(new Date(dataAtual));
    
    const proxima = calcularProximaExecucao(dataAtual, recorrencia);
    if (!proxima) break;
    
    dataAtual = proxima;
  }

  return execucoes;
}
