-- Rollback: Reverter renomeação de tabelas do módulo de cronograma de metas
-- Data: Novembro 2025
-- Uso: Executar apenas se precisar reverter a migração 001_rename_metas_tables.sql

-- ============================================================================
-- FASE 1: DROPAR VIEWS DE COMPATIBILIDADE
-- ============================================================================

DROP VIEW IF EXISTS metas;
DROP VIEW IF EXISTS planos_estudo;
DROP VIEW IF EXISTS metas_log_conclusao;
DROP VIEW IF EXISTS metas_log_omissao;
DROP VIEW IF EXISTS metas_log_redistribuicao;
DROP VIEW IF EXISTS metas_materiais;
DROP VIEW IF EXISTS metas_questoes;
DROP VIEW IF EXISTS metas_revisoes;

-- ============================================================================
-- FASE 2: REVERTER RENOMEAÇÃO DE TABELAS
-- ============================================================================

RENAME TABLE 
  metas_cronograma_revisoes TO metas_revisoes,
  metas_cronograma_questoes TO metas_questoes,
  metas_cronograma_materiais TO metas_materiais,
  metas_cronograma_log_redistribuicao TO metas_log_redistribuicao,
  metas_cronograma_log_omissao TO metas_log_omissao,
  metas_cronograma_log_conclusao TO metas_log_conclusao,
  metas_cronograma TO metas,
  metas_planos_estudo TO planos_estudo;

-- ============================================================================
-- FASE 3: REVERTER FOREIGN KEYS
-- ============================================================================

ALTER TABLE metas
  DROP FOREIGN KEY IF EXISTS fk_mcron_plano,
  ADD CONSTRAINT metas_ibfk_1
    FOREIGN KEY (plano_id) REFERENCES planos_estudo(id)
    ON DELETE CASCADE;

ALTER TABLE metas
  DROP FOREIGN KEY IF EXISTS fk_mcron_criado_por,
  ADD CONSTRAINT metas_ibfk_2
    FOREIGN KEY (criado_por_id) REFERENCES users(id);

ALTER TABLE metas_log_conclusao
  DROP FOREIGN KEY IF EXISTS fk_mcron_log_conclusao_meta,
  ADD CONSTRAINT metas_log_conclusao_ibfk_1
    FOREIGN KEY (meta_id) REFERENCES metas(id)
    ON DELETE CASCADE;

ALTER TABLE metas_log_omissao
  DROP FOREIGN KEY IF EXISTS fk_mcron_log_omissao_meta,
  ADD CONSTRAINT metas_log_omissao_ibfk_1
    FOREIGN KEY (meta_id) REFERENCES metas(id)
    ON DELETE CASCADE;

ALTER TABLE metas_log_redistribuicao
  DROP FOREIGN KEY IF EXISTS fk_mcron_log_redistribuicao_meta,
  ADD CONSTRAINT metas_log_redistribuicao_ibfk_1
    FOREIGN KEY (meta_id) REFERENCES metas(id)
    ON DELETE CASCADE;

ALTER TABLE metas_materiais
  DROP FOREIGN KEY IF EXISTS fk_mcron_materiais_meta,
  ADD CONSTRAINT metas_materiais_ibfk_1
    FOREIGN KEY (meta_id) REFERENCES metas(id)
    ON DELETE CASCADE;

ALTER TABLE metas_questoes
  DROP FOREIGN KEY IF EXISTS fk_mcron_questoes_meta,
  ADD CONSTRAINT metas_questoes_ibfk_1
    FOREIGN KEY (meta_id) REFERENCES metas(id)
    ON DELETE CASCADE;

ALTER TABLE metas_revisoes
  DROP FOREIGN KEY IF EXISTS fk_mcron_revisoes_meta,
  ADD CONSTRAINT metas_revisoes_ibfk_1
    FOREIGN KEY (meta_id) REFERENCES metas(id)
    ON DELETE CASCADE;

ALTER TABLE metas_revisoes
  DROP FOREIGN KEY IF EXISTS fk_mcron_revisoes_proxima,
  ADD CONSTRAINT metas_revisoes_ibfk_2
    FOREIGN KEY (proxima_revisao_id) REFERENCES metas(id);

-- ============================================================================
-- FASE 4: REVERTER ÍNDICES
-- ============================================================================

ALTER TABLE planos_estudo
  DROP INDEX IF EXISTS idx_mplanos_usuario,
  ADD INDEX idx_planos_usuario (usuario_id);

ALTER TABLE planos_estudo
  DROP INDEX IF EXISTS idx_mplanos_status,
  ADD INDEX idx_planos_status (status);

ALTER TABLE metas
  DROP INDEX IF EXISTS idx_mcron_plan_schedule,
  ADD INDEX idx_metas_plan_schedule (plano_id, scheduled_date, scheduled_order);

ALTER TABLE metas
  DROP INDEX IF EXISTS idx_mcron_plan_status,
  ADD INDEX idx_metas_plan_status (plano_id, status, omitted);

ALTER TABLE metas
  DROP INDEX IF EXISTS idx_mcron_plan_order,
  ADD INDEX idx_metas_plan_order (plano_id, order_key);

ALTER TABLE metas
  DROP INDEX IF EXISTS idx_mcron_parent,
  ADD INDEX idx_metas_parent (parent_meta_id);

ALTER TABLE metas
  DROP INDEX IF EXISTS idx_mcron_concluded,
  ADD INDEX idx_metas_concluded (concluded_at_utc);

ALTER TABLE metas
  DROP INDEX IF EXISTS unique_mcron_display_number,
  ADD UNIQUE INDEX unique_display_number (plano_id, display_number);

ALTER TABLE metas
  DROP INDEX IF EXISTS unique_mcron_order_key,
  ADD UNIQUE INDEX unique_order_key (plano_id, order_key);

-- ============================================================================
-- NOTAS DE ROLLBACK
-- ============================================================================
-- 1. Após executar este rollback, o código deve ser revertido para usar nomes antigos
-- 2. Tempo estimado: < 1 minuto para bancos pequenos/médios
-- 3. Verificar com: SHOW TABLES LIKE 'metas%';
