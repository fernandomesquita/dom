-- Migration: Adicionar campo 'disponivel' à tabela plans
-- Data: 2025-11-11
-- Autor: Manus/Jorge

-- ===== ADICIONAR CAMPO DISPONIVEL =====
ALTER TABLE plans
  ADD COLUMN disponivel TINYINT(1) NOT NULL DEFAULT 1 AFTER is_hidden;

-- ===== CRIAR ÍNDICE PARA PERFORMANCE =====
CREATE INDEX idx_plans_disponivel ON plans(disponivel);

-- ===== CRIAR ÍNDICE COMPOSTO (visibilidade + disponibilidade) =====
CREATE INDEX idx_plans_visibility ON plans(is_hidden, disponivel);

-- ===== VALIDAÇÃO =====
-- Verificar estrutura
DESCRIBE plans;

-- Verificar índices
SHOW INDEX FROM plans WHERE Key_name LIKE 'idx_plans%';

-- Contar planos (devem ter disponivel=1)
SELECT 
  COUNT(*) as total,
  SUM(disponivel = 1) as disponiveis,
  SUM(disponivel = 0) as indisponiveis
FROM plans;
