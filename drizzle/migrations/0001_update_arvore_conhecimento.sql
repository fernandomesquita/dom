-- Migration: Atualizar Árvore de Conhecimento para V4.0
-- Data: 07/11/2025
-- Descrição: Adicionar campos slug, codigo, createdBy e renomear ordem para sortOrder

-- ============================================================================
-- 1. DISCIPLINAS
-- ============================================================================

-- Adicionar novos campos
ALTER TABLE disciplinas 
  ADD COLUMN codigo VARCHAR(20) AFTER id,
  ADD COLUMN slug VARCHAR(255) AFTER codigo,
  ADD COLUMN created_by VARCHAR(36) AFTER ativo;

-- Renomear ordem para sortOrder
ALTER TABLE disciplinas 
  CHANGE COLUMN ordem sort_order INT NOT NULL DEFAULT 0;

-- Preencher valores padrão para registros existentes
UPDATE disciplinas 
SET 
  codigo = CONCAT('DISC', LPAD(SUBSTRING(id, 1, 3), 3, '0')),
  slug = LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(nome, ' ', '-'), 'ã', 'a'), 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'))
WHERE codigo IS NULL OR slug IS NULL;

-- Tornar campos obrigatórios após preencher
ALTER TABLE disciplinas 
  MODIFY COLUMN codigo VARCHAR(20) NOT NULL,
  MODIFY COLUMN slug VARCHAR(255) NOT NULL;

-- Criar índices otimizados
CREATE UNIQUE INDEX idx_disciplinas_codigo ON disciplinas(codigo);
CREATE UNIQUE INDEX idx_disciplinas_slug ON disciplinas(slug);
CREATE INDEX idx_disciplinas_ativo_sort ON disciplinas(ativo, sort_order);
CREATE INDEX idx_disciplinas_nome ON disciplinas(nome);

-- ============================================================================
-- 2. ASSUNTOS
-- ============================================================================

-- Adicionar novos campos
ALTER TABLE assuntos 
  ADD COLUMN codigo VARCHAR(20) AFTER id,
  ADD COLUMN slug VARCHAR(255) AFTER codigo,
  ADD COLUMN created_by VARCHAR(36) AFTER ativo;

-- Renomear ordem para sortOrder
ALTER TABLE assuntos 
  CHANGE COLUMN ordem sort_order INT NOT NULL DEFAULT 0;

-- Preencher valores padrão para registros existentes
UPDATE assuntos 
SET 
  codigo = CONCAT('ASS', LPAD(SUBSTRING(id, 1, 3), 3, '0')),
  slug = LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(nome, ' ', '-'), 'ã', 'a'), 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'))
WHERE codigo IS NULL OR slug IS NULL;

-- Tornar campos obrigatórios após preencher
ALTER TABLE assuntos 
  MODIFY COLUMN codigo VARCHAR(20) NOT NULL,
  MODIFY COLUMN slug VARCHAR(255) NOT NULL;

-- Criar índices otimizados
CREATE UNIQUE INDEX idx_assuntos_disciplina_codigo ON assuntos(disciplina_id, codigo);
CREATE UNIQUE INDEX idx_assuntos_disciplina_slug ON assuntos(disciplina_id, slug);
CREATE INDEX idx_assuntos_disciplina_sort ON assuntos(disciplina_id, sort_order);
CREATE INDEX idx_assuntos_nome ON assuntos(nome);

-- ============================================================================
-- 3. TÓPICOS
-- ============================================================================

-- Adicionar novos campos
ALTER TABLE topicos 
  ADD COLUMN codigo VARCHAR(20) AFTER id,
  ADD COLUMN slug VARCHAR(255) AFTER codigo,
  ADD COLUMN disciplina_id VARCHAR(36) AFTER assunto_id,
  ADD COLUMN created_by VARCHAR(36) AFTER ativo;

-- Renomear ordem para sortOrder
ALTER TABLE topicos 
  CHANGE COLUMN ordem sort_order INT NOT NULL DEFAULT 0;

-- Preencher disciplina_id (denormalização) a partir de assuntos
UPDATE topicos t
INNER JOIN assuntos a ON t.assunto_id = a.id
SET t.disciplina_id = a.disciplina_id
WHERE t.disciplina_id IS NULL;

-- Preencher valores padrão para registros existentes
UPDATE topicos 
SET 
  codigo = CONCAT('TOP', LPAD(SUBSTRING(id, 1, 3), 3, '0')),
  slug = LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(nome, ' ', '-'), 'ã', 'a'), 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'))
WHERE codigo IS NULL OR slug IS NULL;

-- Tornar campos obrigatórios após preencher
ALTER TABLE topicos 
  MODIFY COLUMN codigo VARCHAR(20) NOT NULL,
  MODIFY COLUMN slug VARCHAR(255) NOT NULL,
  MODIFY COLUMN disciplina_id VARCHAR(36) NOT NULL;

-- Criar índices otimizados
CREATE INDEX idx_topicos_disciplina ON topicos(disciplina_id);
CREATE UNIQUE INDEX idx_topicos_assunto_codigo ON topicos(assunto_id, codigo);
CREATE UNIQUE INDEX idx_topicos_assunto_slug ON topicos(assunto_id, slug);
CREATE INDEX idx_topicos_assunto_sort ON topicos(assunto_id, sort_order);
CREATE INDEX idx_topicos_nome ON topicos(nome);

-- ============================================================================
-- 4. ATUALIZAR FOREIGN KEYS EM MATERIAIS
-- ============================================================================

-- Adicionar foreign keys com ON DELETE SET NULL
ALTER TABLE materiais
  ADD CONSTRAINT fk_materiais_disciplina 
    FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id) 
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE materiais
  ADD CONSTRAINT fk_materiais_assunto 
    FOREIGN KEY (assunto_id) REFERENCES assuntos(id) 
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE materiais
  ADD CONSTRAINT fk_materiais_topico 
    FOREIGN KEY (topico_id) REFERENCES topicos(id) 
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Criar índices compostos para filtros rápidos
CREATE INDEX idx_materiais_disciplina_ativo ON materiais(disciplina_id, ativo);
CREATE INDEX idx_materiais_assunto_ativo ON materiais(assunto_id, ativo);
CREATE INDEX idx_materiais_topico_ativo ON materiais(topico_id, ativo);

-- ============================================================================
-- 5. ATUALIZAR FOREIGN KEYS EM METAS
-- ============================================================================

ALTER TABLE metas
  ADD CONSTRAINT fk_metas_disciplina 
    FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id) 
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE metas
  ADD CONSTRAINT fk_metas_assunto 
    FOREIGN KEY (assunto_id) REFERENCES assuntos(id) 
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE metas
  ADD CONSTRAINT fk_metas_topico 
    FOREIGN KEY (topico_id) REFERENCES topicos(id) 
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Criar índices para filtros rápidos
CREATE INDEX idx_metas_disciplina ON metas(disciplina_id);
CREATE INDEX idx_metas_assunto ON metas(assunto_id);
CREATE INDEX idx_metas_topico ON metas(topico_id);
CREATE INDEX idx_metas_user_disciplina ON metas(user_id, disciplina_id);
