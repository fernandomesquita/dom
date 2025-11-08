-- Migração: Renomear tabelas do módulo de cronograma de metas
-- Data: Novembro 2025
-- Motivo: Conflito com tabela 'metas' do módulo de gamificação
-- Estratégia: Zero-downtime com views de compatibilidade

-- ============================================================================
-- FASE 1: RENOMEAR TABELAS
-- ============================================================================

-- Dropar views antigas se existirem (de migrações anteriores)
DROP VIEW IF EXISTS metas;
DROP VIEW IF EXISTS planos_estudo;
DROP VIEW IF EXISTS metas_log_conclusao;
DROP VIEW IF EXISTS metas_log_omissao;
DROP VIEW IF EXISTS metas_log_redistribuicao;
DROP VIEW IF EXISTS metas_materiais;
DROP VIEW IF EXISTS metas_questoes;
DROP VIEW IF EXISTS metas_revisoes;

-- Renomear tabelas (ordem: dependentes primeiro, principais depois)
RENAME TABLE 
  metas_revisoes TO metas_cronograma_revisoes,
  metas_questoes TO metas_cronograma_questoes,
  metas_materiais TO metas_cronograma_materiais,
  metas_log_redistribuicao TO metas_cronograma_log_redistribuicao,
  metas_log_omissao TO metas_cronograma_log_omissao,
  metas_log_conclusao TO metas_cronograma_log_conclusao,
  metas TO metas_cronograma,
  planos_estudo TO metas_planos_estudo;

-- ============================================================================
-- FASE 2: AJUSTAR FOREIGN KEYS
-- ============================================================================

-- metas_cronograma: FK para metas_planos_estudo
ALTER TABLE metas_cronograma
  DROP FOREIGN KEY IF EXISTS metas_ibfk_1,
  ADD CONSTRAINT fk_mcron_plano
    FOREIGN KEY (plano_id) REFERENCES metas_planos_estudo(id)
    ON DELETE CASCADE;

ALTER TABLE metas_cronograma
  DROP FOREIGN KEY IF EXISTS metas_ibfk_2,
  ADD CONSTRAINT fk_mcron_criado_por
    FOREIGN KEY (criado_por_id) REFERENCES users(id);

-- metas_cronograma_log_conclusao
ALTER TABLE metas_cronograma_log_conclusao
  DROP FOREIGN KEY IF EXISTS metas_log_conclusao_ibfk_1,
  ADD CONSTRAINT fk_mcron_log_conclusao_meta
    FOREIGN KEY (meta_id) REFERENCES metas_cronograma(id)
    ON DELETE CASCADE;

-- metas_cronograma_log_omissao
ALTER TABLE metas_cronograma_log_omissao
  DROP FOREIGN KEY IF EXISTS metas_log_omissao_ibfk_1,
  ADD CONSTRAINT fk_mcron_log_omissao_meta
    FOREIGN KEY (meta_id) REFERENCES metas_cronograma(id)
    ON DELETE CASCADE;

-- metas_cronograma_log_redistribuicao
ALTER TABLE metas_cronograma_log_redistribuicao
  DROP FOREIGN KEY IF EXISTS metas_log_redistribuicao_ibfk_1,
  ADD CONSTRAINT fk_mcron_log_redistribuicao_meta
    FOREIGN KEY (meta_id) REFERENCES metas_cronograma(id)
    ON DELETE CASCADE;

-- metas_cronograma_materiais
ALTER TABLE metas_cronograma_materiais
  DROP FOREIGN KEY IF EXISTS metas_materiais_ibfk_1,
  ADD CONSTRAINT fk_mcron_materiais_meta
    FOREIGN KEY (meta_id) REFERENCES metas_cronograma(id)
    ON DELETE CASCADE;

-- metas_cronograma_questoes
ALTER TABLE metas_cronograma_questoes
  DROP FOREIGN KEY IF EXISTS metas_questoes_ibfk_1,
  ADD CONSTRAINT fk_mcron_questoes_meta
    FOREIGN KEY (meta_id) REFERENCES metas_cronograma(id)
    ON DELETE CASCADE;

-- metas_cronograma_revisoes
ALTER TABLE metas_cronograma_revisoes
  DROP FOREIGN KEY IF EXISTS metas_revisoes_ibfk_1,
  ADD CONSTRAINT fk_mcron_revisoes_meta
    FOREIGN KEY (meta_id) REFERENCES metas_cronograma(id)
    ON DELETE CASCADE;

ALTER TABLE metas_cronograma_revisoes
  DROP FOREIGN KEY IF EXISTS metas_revisoes_ibfk_2,
  ADD CONSTRAINT fk_mcron_revisoes_proxima
    FOREIGN KEY (proxima_revisao_id) REFERENCES metas_cronograma(id);

-- ============================================================================
-- FASE 3: RECRIAR ÍNDICES COM PREFIXO NOVO
-- ============================================================================

-- metas_planos_estudo
ALTER TABLE metas_planos_estudo
  DROP INDEX IF EXISTS idx_planos_usuario,
  ADD INDEX idx_mplanos_usuario (usuario_id);

ALTER TABLE metas_planos_estudo
  DROP INDEX IF EXISTS idx_planos_status,
  ADD INDEX idx_mplanos_status (status);

-- metas_cronograma
ALTER TABLE metas_cronograma
  DROP INDEX IF EXISTS idx_metas_plan_schedule,
  ADD INDEX idx_mcron_plan_schedule (plano_id, scheduled_date, scheduled_order);

ALTER TABLE metas_cronograma
  DROP INDEX IF EXISTS idx_metas_plan_status,
  ADD INDEX idx_mcron_plan_status (plano_id, status, omitted);

ALTER TABLE metas_cronograma
  DROP INDEX IF EXISTS idx_metas_plan_order,
  ADD INDEX idx_mcron_plan_order (plano_id, order_key);

ALTER TABLE metas_cronograma
  DROP INDEX IF EXISTS idx_metas_parent,
  ADD INDEX idx_mcron_parent (parent_meta_id);

ALTER TABLE metas_cronograma
  DROP INDEX IF EXISTS idx_metas_concluded,
  ADD INDEX idx_mcron_concluded (concluded_at_utc);

-- Índices únicos
ALTER TABLE metas_cronograma
  DROP INDEX IF EXISTS unique_display_number,
  ADD UNIQUE INDEX unique_mcron_display_number (plano_id, display_number);

ALTER TABLE metas_cronograma
  DROP INDEX IF EXISTS unique_order_key,
  ADD UNIQUE INDEX unique_mcron_order_key (plano_id, order_key);

-- Índices de logs
ALTER TABLE metas_cronograma_log_conclusao
  DROP INDEX IF EXISTS idx_log_conclusao_meta,
  ADD INDEX idx_mcron_log_conclusao_meta (meta_id);

ALTER TABLE metas_cronograma_log_omissao
  DROP INDEX IF EXISTS idx_log_omissao_meta,
  ADD INDEX idx_mcron_log_omissao_meta (meta_id);

ALTER TABLE metas_cronograma_log_redistribuicao
  DROP INDEX IF EXISTS idx_log_redistribuicao_meta,
  ADD INDEX idx_mcron_log_redistribuicao_meta (meta_id);

-- Índices de vínculos
ALTER TABLE metas_cronograma_materiais
  DROP INDEX IF EXISTS idx_metas_materiais_meta,
  ADD INDEX idx_mcron_materiais_meta (meta_id);

ALTER TABLE metas_cronograma_materiais
  DROP INDEX IF EXISTS idx_metas_materiais_material,
  ADD INDEX idx_mcron_materiais_material (material_id);

ALTER TABLE metas_cronograma_materiais
  DROP INDEX IF EXISTS unique_meta_material,
  ADD UNIQUE INDEX unique_mcron_meta_material (meta_id, material_id);

ALTER TABLE metas_cronograma_questoes
  DROP INDEX IF EXISTS idx_metas_questoes_meta,
  ADD INDEX idx_mcron_questoes_meta (meta_id);

ALTER TABLE metas_cronograma_questoes
  DROP INDEX IF EXISTS idx_metas_questoes_questao,
  ADD INDEX idx_mcron_questoes_questao (questao_id);

ALTER TABLE metas_cronograma_questoes
  DROP INDEX IF EXISTS unique_meta_questao,
  ADD UNIQUE INDEX unique_mcron_meta_questao (meta_id, questao_id);

-- Índices de revisões
ALTER TABLE metas_cronograma_revisoes
  DROP INDEX IF EXISTS idx_metas_revisoes_meta,
  ADD INDEX idx_mcron_revisoes_meta (meta_id);

ALTER TABLE metas_cronograma_revisoes
  DROP INDEX IF EXISTS idx_metas_revisoes_proxima,
  ADD INDEX idx_mcron_revisoes_proxima (proxima_revisao_id);

-- ============================================================================
-- FASE 4: CRIAR VIEWS DE COMPATIBILIDADE TEMPORÁRIAS
-- ============================================================================
-- Estas views permitem que código antigo continue funcionando durante a transição
-- DEVEM SER REMOVIDAS após atualização completa do código

CREATE VIEW planos_estudo AS SELECT * FROM metas_planos_estudo;
CREATE VIEW metas AS SELECT * FROM metas_cronograma;
CREATE VIEW metas_log_conclusao AS SELECT * FROM metas_cronograma_log_conclusao;
CREATE VIEW metas_log_omissao AS SELECT * FROM metas_cronograma_log_omissao;
CREATE VIEW metas_log_redistribuicao AS SELECT * FROM metas_cronograma_log_redistribuicao;
CREATE VIEW metas_materiais AS SELECT * FROM metas_cronograma_materiais;
CREATE VIEW metas_questoes AS SELECT * FROM metas_cronograma_questoes;
CREATE VIEW metas_revisoes AS SELECT * FROM metas_cronograma_revisoes;

-- ============================================================================
-- NOTAS DE MIGRAÇÃO
-- ============================================================================
-- 1. Esta migração é IDEMPOTENTE (pode ser executada múltiplas vezes)
-- 2. Views de compatibilidade devem ser removidas após atualização do código
-- 3. Para rollback, executar: drizzle/migrations/001_rollback_rename.sql
-- 4. Testar com: SELECT * FROM metas LIMIT 1; (deve funcionar via view)
-- 5. Após atualização: DROP VIEW metas, planos_estudo, etc.
