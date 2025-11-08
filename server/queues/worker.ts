import { queue } from './simpleQueue';
import { getDb } from '../db';
import { avisos, avisosSegmentacao, avisosFilaEntrega } from '../../drizzle/schema-avisos';
import { users } from '../../drizzle/schema';
import { eq, and, gte } from 'drizzle-orm';
import type { EnviarAvisoEmMassaJob, ProcessarSegmentacaoJob } from './config';
import { calcularUsuariosElegiveis } from '../helpers/segmentacao';

// Processar job de envio em massa
async function processarEnvioEmMassa(job: any) {
  const { avisoId, segmentacao, adminId } = job.data as EnviarAvisoEmMassaJob;
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  console.log(`[Worker] Processando envio em massa do aviso ${avisoId}`);
  
  // 1. Buscar aviso
  const [aviso] = await db.select().from(avisos).where(eq(avisos.id, avisoId)).limit(1);
  if (!aviso) {
    throw new Error(`Aviso ${avisoId} não encontrado`);
  }

  // 2. Aplicar segmentação para encontrar alunos elegíveis
  const idsElegiveis = await calcularUsuariosElegiveis(segmentacao || {});
  const alunosElegiveis = idsElegiveis.map(id => ({ id }));
  
  console.log(`[Worker] Encontrados ${alunosElegiveis.length} alunos elegíveis`);

  // 3. Inserir na fila de entrega
  const registros = alunosElegiveis.map(aluno => ({
    avisoId,
    alunoId: aluno.id,
    status: 'pendente' as const,
    tentativas: 0,
  }));

  if (registros.length > 0) {
    // Inserir em lotes de 1000
    const batchSize = 1000;
    for (let i = 0; i < registros.length; i += batchSize) {
      const batch = registros.slice(i, i + batchSize);
      await db.insert(avisosFilaEntrega).values(batch);
    }
  }

  // 4. Atualizar segmentação do aviso
  await db.insert(avisosSegmentacao).values({
    avisoId,
    criterios: JSON.stringify(segmentacao),
    alcanceEstimado: alunosElegiveis.length,
    alcanceReal: 0, // Será atualizado conforme entregas
  });

  console.log(`[Worker] Envio em massa concluído: ${alunosElegiveis.length} alunos na fila`);
  
  return {
    avisoId,
    alunosEnfileirados: alunosElegiveis.length,
    segmentacao,
  };
}

// Processar job de segmentação individual
async function processarSegmentacao(job: any) {
  const { avisoId, alunoId } = job.data as ProcessarSegmentacaoJob;
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  console.log(`[Worker] Processando segmentação: aviso ${avisoId} para aluno ${alunoId}`);

  // 1. Verificar se aluno já recebeu este aviso
  const [registro] = await db
    .select()
    .from(avisosFilaEntrega)
    .where(
      and(
        eq(avisosFilaEntrega.avisoId, avisoId),
        eq(avisosFilaEntrega.alunoId, alunoId)
      )
    )
    .limit(1);

  if (registro) {
    console.log(`[Worker] Aluno ${alunoId} já possui este aviso na fila`);
    return { skipped: true, reason: 'already_in_queue' };
  }

  // 2. Inserir na fila de entrega
  await db.insert(avisosFilaEntrega).values({
    avisoId,
    alunoId,
    status: 'pendente',
    tentativas: 0,
  });

  console.log(`[Worker] Aviso ${avisoId} enfileirado para aluno ${alunoId}`);
  
  return {
    avisoId,
    alunoId,
    enfileirado: true,
  };
}

// Registrar handlers
queue.registerHandler('enviarAvisoEmMassa', processarEnvioEmMassa);
queue.registerHandler('processarSegmentacao', processarSegmentacao);

console.log('[Worker] Handlers de avisos registrados');
