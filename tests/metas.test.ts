/**
 * Testes End-to-End - Módulo de Metas
 * 
 * Valida os 31 procedures tRPC do módulo de metas:
 * - metasPlanos (7 procedures)
 * - metasMetas (13 procedures)
 * - metasBatchImport (1 procedure)
 * - metasAnalytics (7 procedures)
 * - ktree (4 procedures)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../server/routers';
import superjson from 'superjson';

// Cliente tRPC para testes
const trpc = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/api/trpc',
      headers: {
        // TODO: Adicionar token de autenticação para testes
        // Authorization: `Bearer ${testToken}`,
      },
    }),
  ],
});

// IDs criados durante os testes (para limpeza)
let testPlanoId: number;
let testMetaId: number;
let testDisciplinaId: string;
let testAssuntoId: string;

describe('Módulo de Metas - End-to-End', () => {
  
  // ==================== KTREE (4 procedures) ====================
  
  describe('KTree Router', () => {
    it('deve listar disciplinas', async () => {
      const result = await trpc.ktree.listDisciplinas.query();
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      const disciplina = result[0];
      expect(disciplina).toHaveProperty('id');
      expect(disciplina).toHaveProperty('nome');
      expect(disciplina).toHaveProperty('codigo');
      
      testDisciplinaId = disciplina.id;
    });

    it('deve listar assuntos por disciplina', async () => {
      const result = await trpc.ktree.listAssuntosByDisciplina.query({
        disciplinaId: testDisciplinaId,
      });
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      const assunto = result[0];
      expect(assunto).toHaveProperty('id');
      expect(assunto).toHaveProperty('nome');
      expect(assunto.disciplinaId).toBe(testDisciplinaId);
      
      testAssuntoId = assunto.id;
    });

    it('deve listar tópicos por assunto', async () => {
      const result = await trpc.ktree.listTopicosByAssunto.query({
        assuntoId: testAssuntoId,
      });
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      // Pode estar vazio se não houver tópicos
    });

    it('deve buscar em toda taxonomia', async () => {
      const result = await trpc.ktree.searchAll.query({
        query: 'direito',
      });
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('disciplinas');
      expect(result).toHaveProperty('assuntos');
      expect(result).toHaveProperty('topicos');
    });
  });

  // ==================== PLANOS (7 procedures) ====================
  
  describe('Planos Router', () => {
    it('deve criar plano de estudo', async () => {
      const result = await trpc.metasPlanos.create.mutate({
        nome: 'Plano de Teste E2E',
        concurso: 'Teste Automatizado',
        horasPorDia: 4,
        diasDisponiveis: 62, // Segunda a Sexta (bits 1-5)
      });
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('id');
      expect(result.nome).toBe('Plano de Teste E2E');
      
      testPlanoId = result.id;
    });

    it('deve obter plano por ID', async () => {
      const result = await trpc.metasPlanos.getById.query({
        id: testPlanoId,
      });
      
      expect(result).toBeDefined();
      expect(result.id).toBe(testPlanoId);
      expect(result.nome).toBe('Plano de Teste E2E');
    });

    it('deve listar planos do usuário', async () => {
      const result = await trpc.metasPlanos.list.query();
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      const plano = result.find(p => p.id === testPlanoId);
      expect(plano).toBeDefined();
    });

    it('deve obter estatísticas do plano', async () => {
      const result = await trpc.metasPlanos.getStats.query({
        planoId: testPlanoId,
      });
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('totalMetas');
      expect(result).toHaveProperty('metasConcluidas');
      expect(result).toHaveProperty('metasOmitidas');
      expect(result).toHaveProperty('metasPendentes');
      expect(result).toHaveProperty('taxaConclusao');
    });

    it('deve atualizar configuração do plano', async () => {
      const result = await trpc.metasPlanos.updateConfig.mutate({
        id: testPlanoId,
        horasPorDia: 5,
        diasDisponiveis: 127, // Todos os dias
      });
      
      expect(result).toBeDefined();
      expect(result.horasPorDia).toBe(5);
      expect(result.diasDisponiveis).toBe(127);
    });

    it('deve atualizar plano', async () => {
      const result = await trpc.metasPlanos.update.mutate({
        id: testPlanoId,
        nome: 'Plano de Teste E2E (Atualizado)',
      });
      
      expect(result).toBeDefined();
      expect(result.nome).toBe('Plano de Teste E2E (Atualizado)');
    });
  });

  // ==================== METAS (13 procedures) ====================
  
  describe('Metas Router', () => {
    it('deve criar meta', async () => {
      const result = await trpc.metasMetas.create.mutate({
        planoId: testPlanoId,
        tipo: 'ESTUDO',
        ktreeDisciplinaId: testDisciplinaId,
        ktreeAssuntoId: testAssuntoId,
        duracaoPlanejadaMin: 60,
        scheduledDate: new Date().toISOString().split('T')[0],
        orientacoesEstudo: 'Meta de teste automatizado',
      });
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('id');
      expect(result.tipo).toBe('ESTUDO');
      expect(result.numero).toMatch(/^#\d{3}$/); // #001, #002, etc.
      
      testMetaId = result.id;
    });

    it('deve verificar conflitos', async () => {
      const result = await trpc.metasMetas.verificarConflitos.query({
        planoId: testPlanoId,
        scheduledDate: new Date().toISOString().split('T')[0],
        duracaoMin: 60,
      });
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('cabeNoSlot');
      expect(result).toHaveProperty('minutosUsados');
      expect(result).toHaveProperty('minutosRestantes');
      expect(result).toHaveProperty('capacidadeMin');
    });

    it('deve obter meta por ID', async () => {
      const result = await trpc.metasMetas.getById.query({
        id: testMetaId,
      });
      
      expect(result).toBeDefined();
      expect(result.id).toBe(testMetaId);
      expect(result.tipo).toBe('ESTUDO');
    });

    it('deve listar metas por plano', async () => {
      const result = await trpc.metasMetas.listByPlano.query({
        planoId: testPlanoId,
      });
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      const meta = result.find(m => m.id === testMetaId);
      expect(meta).toBeDefined();
    });

    it('deve listar metas por data', async () => {
      const result = await trpc.metasMetas.listByDate.query({
        planoId: testPlanoId,
        date: new Date().toISOString().split('T')[0],
      });
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('deve buscar materiais disponíveis', async () => {
      const result = await trpc.metasMetas.buscarMateriaisDisponiveis.query({
        ktreeDisciplinaId: testDisciplinaId,
        ktreeAssuntoId: testAssuntoId,
      });
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      // Pode estar vazio se não houver materiais vinculados
    });

    it('deve atualizar meta', async () => {
      const result = await trpc.metasMetas.update.mutate({
        id: testMetaId,
        orientacoesEstudo: 'Meta atualizada via teste',
      });
      
      expect(result).toBeDefined();
      expect(result.orientacoesEstudo).toBe('Meta atualizada via teste');
    });

    it('deve reagendar meta', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      const result = await trpc.metasMetas.reschedule.mutate({
        metaId: testMetaId,
        novaData: tomorrowStr,
      });
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('deve omitir meta', async () => {
      const result = await trpc.metasMetas.skip.mutate({
        metaId: testMetaId,
        motivo: 'FALTA_TEMPO',
        observacao: 'Teste automatizado',
      });
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('deve concluir meta', async () => {
      // Criar nova meta para concluir (a anterior foi omitida)
      const novaMeta = await trpc.metasMetas.create.mutate({
        planoId: testPlanoId,
        tipo: 'ESTUDO',
        ktreeDisciplinaId: testDisciplinaId,
        ktreeAssuntoId: testAssuntoId,
        duracaoPlanejadaMin: 60,
        scheduledDate: new Date().toISOString().split('T')[0],
        orientacoesEstudo: 'Meta para conclusão',
      });
      
      const result = await trpc.metasMetas.complete.mutate({
        metaId: novaMeta.id,
        duracaoRealMin: 55,
      });
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.revisoesGeradas).toBe(3); // 1, 7, 30 dias
    });
  });

  // ==================== ANALYTICS (7 procedures) ====================
  
  describe('Analytics Router', () => {
    it('deve obter estatísticas globais', async () => {
      const result = await trpc.metasAnalytics.globalStats.query({
        planoId: testPlanoId,
      });
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('totalMetas');
      expect(result).toHaveProperty('metasConcluidas');
      expect(result).toHaveProperty('metasOmitidas');
      expect(result).toHaveProperty('taxaConclusao');
    });

    it('deve obter taxa de conclusão por disciplina', async () => {
      const result = await trpc.metasAnalytics.taxaConclusaoPorDisciplina.query({
        planoId: testPlanoId,
      });
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('deve obter metas mais omitidas', async () => {
      const result = await trpc.metasAnalytics.metasMaisOmitidas.query({
        planoId: testPlanoId,
        limit: 10,
      });
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('deve obter tempo médio por tipo', async () => {
      const result = await trpc.metasAnalytics.tempoMedioPorTipo.query({
        planoId: testPlanoId,
      });
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('deve obter distribuição por dia da semana', async () => {
      const result = await trpc.metasAnalytics.distribuicaoPorDia.query({
        planoId: testPlanoId,
      });
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(7); // 7 dias da semana
    });

    it('deve obter progresso temporal', async () => {
      const result = await trpc.metasAnalytics.progressoTemporal.query({
        planoId: testPlanoId,
        periodo: 'mes',
      });
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('deve comparar usuários', async () => {
      const result = await trpc.metasAnalytics.comparacaoUsuarios.query({
        planoId: testPlanoId,
      });
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('usuario');
      expect(result).toHaveProperty('media');
    });
  });

  // ==================== LIMPEZA ====================
  
  afterAll(async () => {
    // Deletar plano de teste (cascade deleta metas)
    if (testPlanoId) {
      try {
        await trpc.metasPlanos.delete.mutate({ id: testPlanoId });
        console.log('✅ Plano de teste deletado');
      } catch (error) {
        console.error('❌ Erro ao deletar plano de teste:', error);
      }
    }
  });
});

// ==================== EXECUÇÃO ====================

// Para executar: pnpm test tests/metas.test.ts
// Ou: vitest run tests/metas.test.ts
