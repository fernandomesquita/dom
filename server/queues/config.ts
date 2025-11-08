import { queue } from './simpleQueue';

// Re-export queue para uso em outros módulos
export { queue };

// Tipos de jobs
export interface EnviarAvisoEmMassaJob {
  avisoId: string;
  segmentacao: {
    planos?: string[];
    nivelEngajamento?: 'baixo' | 'medio' | 'alto';
    taxaAcertoMin?: number;
    taxaAcertoMax?: number;
    diasUltimoAcesso?: number;
  };
  adminId: number;
}

export interface ProcessarSegmentacaoJob {
  avisoId: string;
  alunoId: number;
}

// Adicionar job à fila
export async function adicionarJobEnvioEmMassa(data: EnviarAvisoEmMassaJob) {
  return await queue.addJob('enviarAvisoEmMassa', data, { maxAttempts: 3 });
}

export async function adicionarJobProcessarSegmentacao(data: ProcessarSegmentacaoJob) {
  return await queue.addJob('processarSegmentacao', data, { maxAttempts: 3 });
}

// Obter estatísticas da fila
export async function getQueueStats() {
  return queue.getStats();
}

// Limpar jobs completados/falhados
export async function cleanQueue() {
  queue.cleanOldJobs(24 * 60 * 60 * 1000); // 24 horas
}

// Pausar/Resumir fila
export async function pauseQueue() {
  queue.pause();
}

export async function resumeQueue() {
  queue.resume();
}

// Obter jobs recentes
export async function getRecentJobs(status: 'completed' | 'failed' | 'active' | 'waiting', limit = 20) {
  return queue.getRecentJobs(status, limit);
}
