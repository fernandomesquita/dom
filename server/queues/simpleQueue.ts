/**
 * Sistema de Filas Simples em Memória
 * Alternativa leve ao BullMQ para processar jobs assíncronos
 */

interface Job<T = any> {
  id: string;
  name: string;
  data: T;
  attempts: number;
  maxAttempts: number;
  status: 'waiting' | 'active' | 'completed' | 'failed';
  createdAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  error?: string;
  result?: any;
}

interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  total: number;
}

type JobHandler<T = any> = (job: Job<T>) => Promise<any>;

class SimpleQueue {
  private jobs: Map<string, Job> = new Map();
  private handlers: Map<string, JobHandler> = new Map();
  private processing: boolean = false;
  private concurrency: number = 5;
  private activeJobs: number = 0;

  constructor(concurrency: number = 5) {
    this.concurrency = concurrency;
  }

  /**
   * Registrar handler para um tipo de job
   */
  registerHandler(jobName: string, handler: JobHandler) {
    this.handlers.set(jobName, handler);
  }

  /**
   * Adicionar job à fila
   */
  async addJob<T>(name: string, data: T, options?: { maxAttempts?: number }): Promise<Job<T>> {
    const job: Job<T> = {
      id: `${name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      data,
      attempts: 0,
      maxAttempts: options?.maxAttempts || 3,
      status: 'waiting',
      createdAt: new Date(),
    };

    this.jobs.set(job.id, job);
    console.log(`[Queue] Job ${job.id} (${name}) adicionado à fila`);

    // Iniciar processamento se não estiver rodando
    if (!this.processing) {
      this.startProcessing();
    }

    return job;
  }

  /**
   * Iniciar processamento da fila
   */
  private async startProcessing() {
    if (this.processing) return;
    this.processing = true;

    console.log('[Queue] Iniciando processamento da fila');

    while (this.processing) {
      // Verificar se há jobs pendentes e capacidade disponível
      const waitingJobs = Array.from(this.jobs.values())
        .filter(job => job.status === 'waiting')
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

      if (waitingJobs.length === 0 || this.activeJobs >= this.concurrency) {
        // Aguardar um pouco antes de verificar novamente
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Se não há jobs ativos e não há jobs pendentes, parar processamento
        if (this.activeJobs === 0 && waitingJobs.length === 0) {
          this.processing = false;
          console.log('[Queue] Processamento finalizado (fila vazia)');
          break;
        }
        continue;
      }

      // Processar próximo job
      const job = waitingJobs[0];
      this.processJob(job);
    }
  }

  /**
   * Processar um job individual
   */
  private async processJob(job: Job) {
    const handler = this.handlers.get(job.name);
    if (!handler) {
      console.error(`[Queue] Handler não encontrado para job ${job.name}`);
      job.status = 'failed';
      job.error = `Handler não encontrado para job ${job.name}`;
      return;
    }

    job.status = 'active';
    job.processedAt = new Date();
    job.attempts++;
    this.activeJobs++;

    console.log(`[Queue] Processando job ${job.id} (tentativa ${job.attempts}/${job.maxAttempts})`);

    try {
      const result = await handler(job);
      job.result = result;
      job.status = 'completed';
      job.completedAt = new Date();
      console.log(`[Queue] Job ${job.id} completado com sucesso`);
    } catch (error: any) {
      console.error(`[Queue] Erro ao processar job ${job.id}:`, error.message);
      
      if (job.attempts >= job.maxAttempts) {
        job.status = 'failed';
        job.error = error.message;
        console.error(`[Queue] Job ${job.id} falhou após ${job.attempts} tentativas`);
      } else {
        // Retry com backoff exponencial
        const delay = Math.pow(2, job.attempts) * 1000; // 2s, 4s, 8s
        console.log(`[Queue] Reprocessando job ${job.id} em ${delay}ms`);
        
        setTimeout(() => {
          job.status = 'waiting';
          if (this.processing) {
            this.processJob(job);
          }
        }, delay);
      }
    } finally {
      this.activeJobs--;
    }
  }

  /**
   * Obter estatísticas da fila
   */
  getStats(): QueueStats {
    const jobs = Array.from(this.jobs.values());
    return {
      waiting: jobs.filter(j => j.status === 'waiting').length,
      active: jobs.filter(j => j.status === 'active').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length,
      total: jobs.length,
    };
  }

  /**
   * Obter jobs recentes por status
   */
  getRecentJobs(status: Job['status'], limit: number = 20): Job[] {
    return Array.from(this.jobs.values())
      .filter(job => job.status === status)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  /**
   * Limpar jobs antigos
   */
  cleanOldJobs(maxAge: number = 24 * 60 * 60 * 1000) {
    const now = Date.now();
    let cleaned = 0;

    for (const [id, job] of this.jobs.entries()) {
      if (job.status === 'completed' || job.status === 'failed') {
        const age = now - job.createdAt.getTime();
        if (age > maxAge) {
          this.jobs.delete(id);
          cleaned++;
        }
      }
    }

    console.log(`[Queue] ${cleaned} jobs antigos removidos`);
    return cleaned;
  }

  /**
   * Pausar processamento
   */
  pause() {
    this.processing = false;
    console.log('[Queue] Processamento pausado');
  }

  /**
   * Retomar processamento
   */
  resume() {
    if (!this.processing) {
      this.startProcessing();
    }
  }
}

// Instância global da fila
export const queue = new SimpleQueue(5);

// Limpar jobs antigos a cada hora
setInterval(() => {
  queue.cleanOldJobs();
}, 60 * 60 * 1000);
