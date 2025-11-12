-- ============================================================================
-- SINCRONIZAÇÃO DO BANCO DE DADOS EM PRODUÇÃO
-- Data: 11/11/2025
-- Objetivo: Criar colunas faltantes para resolver problemas de planos e auditoria
-- ============================================================================

-- ============================================================================
-- 1. PLANOS - Adicionar coluna is_hidden
-- ============================================================================
-- Problema: Planos criados não aparecem na listagem
-- Solução: Adicionar coluna is_hidden (padrão: false)

ALTER TABLE plans 
  ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_plans_is_hidden ON plans(is_hidden);

-- ============================================================================
-- 2. AUDITORIA - Verificar estrutura da tabela audit_logs
-- ============================================================================
-- Problema: Página de auditoria em branco
-- Solução: Garantir que a tabela existe com todas as colunas necessárias

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
-- 3. ÁRVORE DO CONHECIMENTO - Adicionar colunas codigo, slug, sort_order
-- ============================================================================
-- Nota: Estas colunas são necessárias para o funcionamento completo da árvore
-- Se já existirem, o IF NOT EXISTS evitará erros

-- DISCIPLINAS
ALTER TABLE disciplinas 
  ADD COLUMN IF NOT EXISTS codigo VARCHAR(20),
  ADD COLUMN IF NOT EXISTS slug VARCHAR(255),
  ADD COLUMN IF NOT EXISTS created_by VARCHAR(36);

-- Preencher valores padrão para registros existentes (apenas se colunas foram criadas)
UPDATE disciplinas 
SET 
  codigo = CONCAT('DISC', LPAD(SUBSTRING(id, 1, 3), 3, '0')),
  slug = LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(nome, ' ', '-'), 'ã', 'a'), 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'))
WHERE codigo IS NULL OR slug IS NULL;

-- Renomear ordem para sort_order (se ainda não foi renomeado)
-- ALTER TABLE disciplinas CHANGE COLUMN ordem sort_order INT NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS idx_disciplinas_codigo ON disciplinas(codigo);
CREATE UNIQUE INDEX IF NOT EXISTS idx_disciplinas_slug ON disciplinas(slug);

-- ASSUNTOS
ALTER TABLE assuntos 
  ADD COLUMN IF NOT EXISTS codigo VARCHAR(20),
  ADD COLUMN IF NOT EXISTS slug VARCHAR(255),
  ADD COLUMN IF NOT EXISTS created_by VARCHAR(36);

UPDATE assuntos 
SET 
  codigo = CONCAT('ASS', LPAD(SUBSTRING(id, 1, 3), 3, '0')),
  slug = LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(nome, ' ', '-'), 'ã', 'a'), 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'))
WHERE codigo IS NULL OR slug IS NULL;

-- ALTER TABLE assuntos CHANGE COLUMN ordem sort_order INT NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS idx_assuntos_disciplina_codigo ON assuntos(disciplina_id, codigo);
CREATE UNIQUE INDEX IF NOT EXISTS idx_assuntos_disciplina_slug ON assuntos(disciplina_id, slug);

-- TÓPICOS
ALTER TABLE topicos 
  ADD COLUMN IF NOT EXISTS codigo VARCHAR(20),
  ADD COLUMN IF NOT EXISTS slug VARCHAR(255),
  ADD COLUMN IF NOT EXISTS disciplina_id VARCHAR(36),
  ADD COLUMN IF NOT EXISTS created_by VARCHAR(36);

-- Preencher disciplina_id (denormalização)
UPDATE topicos t
INNER JOIN assuntos a ON t.assunto_id = a.id
SET t.disciplina_id = a.disciplina_id
WHERE t.disciplina_id IS NULL;

UPDATE topicos 
SET 
  codigo = CONCAT('TOP', LPAD(SUBSTRING(id, 1, 3), 3, '0')),
  slug = LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(nome, ' ', '-'), 'ã', 'a'), 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'))
WHERE codigo IS NULL OR slug IS NULL;

-- ALTER TABLE topicos CHANGE COLUMN ordem sort_order INT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_topicos_disciplina ON topicos(disciplina_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_topicos_assunto_codigo ON topicos(assunto_id, codigo);
CREATE UNIQUE INDEX IF NOT EXISTS idx_topicos_assunto_slug ON topicos(assunto_id, slug);

-- ============================================================================
-- FIM DA SINCRONIZAÇÃO
-- ============================================================================
-- Após executar este SQL no Railway, os seguintes problemas serão resolvidos:
-- 1. ✅ Planos criados aparecerão na listagem
-- 2. ✅ Página de auditoria carregará corretamente
-- 3. ✅ Árvore do conhecimento terá todas as colunas necessárias
-- ============================================================================
