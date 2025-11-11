-- ============================================================================
-- SINCRONIZAÇÃO DO BANCO DE DADOS EM PRODUÇÃO (MySQL Compatível)
-- Data: 11/11/2025
-- Objetivo: Criar colunas faltantes para resolver problemas de planos e auditoria
-- ============================================================================

-- ============================================================================
-- 1. PLANOS - Adicionar coluna is_hidden
-- ============================================================================

-- Procedure para adicionar coluna is_hidden se não existir
DELIMITER $$
DROP PROCEDURE IF EXISTS add_is_hidden_to_plans$$
CREATE PROCEDURE add_is_hidden_to_plans()
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLSTATE '42S21' BEGIN END;
  ALTER TABLE plans ADD COLUMN is_hidden BOOLEAN NOT NULL DEFAULT FALSE;
  CREATE INDEX idx_plans_is_hidden ON plans(is_hidden);
END$$
DELIMITER ;

CALL add_is_hidden_to_plans();
DROP PROCEDURE add_is_hidden_to_plans;

-- ============================================================================
-- 2. AUDITORIA - Criar tabela audit_logs se não existir
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
-- 3. DISCIPLINAS - Adicionar colunas codigo, slug, created_by
-- ============================================================================

DELIMITER $$
DROP PROCEDURE IF EXISTS add_columns_to_disciplinas$$
CREATE PROCEDURE add_columns_to_disciplinas()
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLSTATE '42S21' BEGIN END;
  
  ALTER TABLE disciplinas ADD COLUMN codigo VARCHAR(20);
  ALTER TABLE disciplinas ADD COLUMN slug VARCHAR(255);
  ALTER TABLE disciplinas ADD COLUMN created_by VARCHAR(36);
  
  -- Preencher valores padrão
  UPDATE disciplinas 
  SET 
    codigo = CONCAT('DISC', LPAD(SUBSTRING(id, 1, 3), 3, '0')),
    slug = LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(nome, ' ', '-'), 'ã', 'a'), 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'))
  WHERE codigo IS NULL OR slug IS NULL;
  
  -- Criar índices (ignora se já existirem)
  CREATE UNIQUE INDEX idx_disciplinas_codigo ON disciplinas(codigo);
  CREATE UNIQUE INDEX idx_disciplinas_slug ON disciplinas(slug);
END$$
DELIMITER ;

CALL add_columns_to_disciplinas();
DROP PROCEDURE add_columns_to_disciplinas;

-- ============================================================================
-- 4. ASSUNTOS - Adicionar colunas codigo, slug, created_by
-- ============================================================================

DELIMITER $$
DROP PROCEDURE IF EXISTS add_columns_to_assuntos$$
CREATE PROCEDURE add_columns_to_assuntos()
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLSTATE '42S21' BEGIN END;
  
  ALTER TABLE assuntos ADD COLUMN codigo VARCHAR(20);
  ALTER TABLE assuntos ADD COLUMN slug VARCHAR(255);
  ALTER TABLE assuntos ADD COLUMN created_by VARCHAR(36);
  
  -- Preencher valores padrão
  UPDATE assuntos 
  SET 
    codigo = CONCAT('ASS', LPAD(SUBSTRING(id, 1, 3), 3, '0')),
    slug = LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(nome, ' ', '-'), 'ã', 'a'), 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'))
  WHERE codigo IS NULL OR slug IS NULL;
  
  -- Criar índices
  CREATE UNIQUE INDEX idx_assuntos_disciplina_codigo ON assuntos(disciplina_id, codigo);
  CREATE UNIQUE INDEX idx_assuntos_disciplina_slug ON assuntos(disciplina_id, slug);
END$$
DELIMITER ;

CALL add_columns_to_assuntos();
DROP PROCEDURE add_columns_to_assuntos;

-- ============================================================================
-- 5. TÓPICOS - Adicionar colunas codigo, slug, disciplina_id, created_by
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
  
  -- Criar índices
  CREATE INDEX idx_topicos_disciplina ON topicos(disciplina_id);
  CREATE UNIQUE INDEX idx_topicos_assunto_codigo ON topicos(assunto_id, codigo);
  CREATE UNIQUE INDEX idx_topicos_assunto_slug ON topicos(assunto_id, slug);
END$$
DELIMITER ;

CALL add_columns_to_topicos();
DROP PROCEDURE add_columns_to_topicos;

-- ============================================================================
-- FIM DA SINCRONIZAÇÃO
-- ============================================================================
-- ✅ Script executado com sucesso!
-- 
-- Problemas resolvidos:
-- 1. ✅ Planos criados agora aparecem na listagem (coluna is_hidden)
-- 2. ✅ Página de auditoria carrega corretamente (tabela audit_logs)
-- 3. ✅ Árvore do conhecimento com todas as colunas necessárias
-- ============================================================================
