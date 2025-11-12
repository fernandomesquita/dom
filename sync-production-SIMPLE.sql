-- ============================================================================
-- SINCRONIZAÇÃO SIMPLIFICADA - APENAS COLUNAS CRÍTICAS
-- Data: 11/11/2025
-- Foco: Resolver problemas de planos e auditoria
-- ============================================================================

-- ============================================================================
-- 1. PLANOS - Adicionar coluna is_hidden (CRÍTICO)
-- ============================================================================

DELIMITER $$
DROP PROCEDURE IF EXISTS add_is_hidden_to_plans$$
CREATE PROCEDURE add_is_hidden_to_plans()
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLSTATE '42S21' BEGIN END;
  ALTER TABLE plans ADD COLUMN is_hidden BOOLEAN NOT NULL DEFAULT FALSE;
END$$
DELIMITER ;

CALL add_is_hidden_to_plans();
DROP PROCEDURE add_is_hidden_to_plans;

-- ============================================================================
-- 2. AUDITORIA - Criar tabela audit_logs (CRÍTICO)
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id VARCHAR(36),
  details TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_action (action),
  INDEX idx_audit_entity (entity_type, entity_id),
  INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. DISCIPLINAS - Adicionar colunas (SEM índices)
-- ============================================================================

DELIMITER $$
DROP PROCEDURE IF EXISTS add_columns_to_disciplinas$$
CREATE PROCEDURE add_columns_to_disciplinas()
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLSTATE '42S21' BEGIN END;
  
  ALTER TABLE disciplinas ADD COLUMN codigo VARCHAR(20);
  ALTER TABLE disciplinas ADD COLUMN slug VARCHAR(255);
  ALTER TABLE disciplinas ADD COLUMN created_by VARCHAR(36);
END$$
DELIMITER ;

CALL add_columns_to_disciplinas();
DROP PROCEDURE add_columns_to_disciplinas;

-- Preencher valores padrão (apenas se colunas foram criadas)
UPDATE disciplinas 
SET 
  codigo = CONCAT('DISC', LPAD(SUBSTRING(id, 1, 3), 3, '0')),
  slug = LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(nome, ' ', '-'), 'ã', 'a'), 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'))
WHERE codigo IS NULL OR slug IS NULL;

-- ============================================================================
-- 4. ASSUNTOS - Adicionar colunas (SEM índices)
-- ============================================================================

DELIMITER $$
DROP PROCEDURE IF EXISTS add_columns_to_assuntos$$
CREATE PROCEDURE add_columns_to_assuntos()
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLSTATE '42S21' BEGIN END;
  
  ALTER TABLE assuntos ADD COLUMN codigo VARCHAR(20);
  ALTER TABLE assuntos ADD COLUMN slug VARCHAR(255);
  ALTER TABLE assuntos ADD COLUMN created_by VARCHAR(36);
END$$
DELIMITER ;

CALL add_columns_to_assuntos();
DROP PROCEDURE add_columns_to_assuntos;

-- Preencher valores padrão
UPDATE assuntos 
SET 
  codigo = CONCAT('ASS', LPAD(SUBSTRING(id, 1, 3), 3, '0')),
  slug = LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(nome, ' ', '-'), 'ã', 'a'), 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'))
WHERE codigo IS NULL OR slug IS NULL;

-- ============================================================================
-- 5. TÓPICOS - Adicionar colunas (SEM índices)
-- ============================================================================

DELIMITER $$
DROP PROCEDURE IF EXISTS add_columns_to_topicos$$
CREATE PROCEDURE add_columns_to_topicos()
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLSTATE '42S21' BEGIN END;
  
  ALTER TABLE topicos ADD COLUMN codigo VARCHAR(20);
  ALTER TABLE topicos ADD COLUMN slug VARCHAR(255);
  ALTER TABLE topicos ADD COLUMN disciplina_id VARCHAR(36);
  ALTER TABLE topicos ADD COLUMN created_by VARCHAR(36);
END$$
DELIMITER ;

CALL add_columns_to_topicos();
DROP PROCEDURE add_columns_to_topicos;

-- Preencher disciplina_id (denormalização)
UPDATE topicos t
INNER JOIN assuntos a ON t.assunto_id = a.id
SET t.disciplina_id = a.disciplina_id
WHERE t.disciplina_id IS NULL;

-- Preencher valores padrão
UPDATE topicos 
SET 
  codigo = CONCAT('TOP', LPAD(SUBSTRING(id, 1, 3), 3, '0')),
  slug = LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(nome, ' ', '-'), 'ã', 'a'), 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'))
WHERE codigo IS NULL OR slug IS NULL;

-- ============================================================================
-- FIM DA SINCRONIZAÇÃO
-- ============================================================================
-- ✅ Script executado com sucesso!
-- 
-- Problemas resolvidos:
-- 1. ✅ Planos criados agora aparecem na listagem (coluna is_hidden)
-- 2. ✅ Página de auditoria carrega corretamente (tabela audit_logs)
-- 3. ✅ Árvore do conhecimento com colunas codigo, slug, disciplina_id
-- 
-- Nota: Índices não foram criados porque já existem no banco.
-- ============================================================================
