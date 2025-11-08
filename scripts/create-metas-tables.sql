-- Criar tabelas do módulo de metas
DROP TABLE IF EXISTS metas_revisoes;
DROP TABLE IF EXISTS metas_questoes;
DROP TABLE IF EXISTS metas_materiais;
DROP TABLE IF EXISTS metas_log_redistribuicao;
DROP TABLE IF EXISTS metas_log_omissao;
DROP TABLE IF EXISTS metas_log_conclusao;
DROP TABLE IF EXISTS metas;
DROP TABLE IF EXISTS planos_estudo;

CREATE TABLE planos_estudo (
  id VARCHAR(36) PRIMARY KEY,
  usuario_id VARCHAR(36) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  horas_por_dia DECIMAL(4,2) NOT NULL,
  dias_disponiveis_bitmask INT NOT NULL DEFAULT 31,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'ativo',
  criado_por_id VARCHAR(36) NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_planos_usuario (usuario_id),
  INDEX idx_planos_status (status),
  FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (criado_por_id) REFERENCES users(id)
);

CREATE TABLE metas (
  id VARCHAR(36) PRIMARY KEY,
  plano_id VARCHAR(36) NOT NULL,
  meta_number_base INT NOT NULL,
  meta_number_suffix INT,
  display_number VARCHAR(20) NOT NULL,
  order_key VARCHAR(20) NOT NULL,
  ktree_disciplina_id VARCHAR(36) NOT NULL,
  ktree_assunto_id VARCHAR(36) NOT NULL,
  ktree_topico_id VARCHAR(36),
  ktree_subtopico_id VARCHAR(36),
  tipo VARCHAR(20) NOT NULL,
  incidencia VARCHAR(20) DEFAULT 'NA',
  duracao_planejada_min INT NOT NULL,
  duracao_real_sec INT DEFAULT 0,
  scheduled_date DATE NOT NULL,
  scheduled_order INT NOT NULL,
  scheduled_at_utc TIMESTAMP NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDENTE',
  concluded_at_utc TIMESTAMP NULL,
  orientacoes_estudo TEXT,
  fixed BOOLEAN DEFAULT FALSE,
  fixed_rule_json JSON,
  auto_generated BOOLEAN DEFAULT FALSE,
  parent_meta_id VARCHAR(36),
  review_config_json JSON,
  sequence_label VARCHAR(10),
  original_meta_id VARCHAR(36),
  omitted BOOLEAN DEFAULT FALSE,
  omission_reason VARCHAR(50),
  omitted_at TIMESTAMP NULL,
  row_hash VARCHAR(64),
  criado_por_id VARCHAR(36) NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_metas_plan_schedule (plano_id, scheduled_date, scheduled_order),
  INDEX idx_metas_plan_status (plano_id, status, omitted),
  INDEX idx_metas_plan_order (plano_id, order_key),
  INDEX idx_metas_parent (parent_meta_id),
  INDEX idx_metas_concluded (concluded_at_utc),
  UNIQUE KEY unique_display_number (plano_id, display_number),
  UNIQUE KEY unique_order_key (plano_id, order_key),
  FOREIGN KEY (plano_id) REFERENCES planos_estudo(id) ON DELETE CASCADE,
  FOREIGN KEY (criado_por_id) REFERENCES users(id)
);

CREATE TABLE metas_log_conclusao (
  id VARCHAR(36) PRIMARY KEY,
  meta_id VARCHAR(36) NOT NULL,
  duracao_real_sec INT NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_log_conclusao_meta (meta_id),
  FOREIGN KEY (meta_id) REFERENCES metas(id) ON DELETE CASCADE
);

CREATE TABLE metas_log_omissao (
  id VARCHAR(36) PRIMARY KEY,
  meta_id VARCHAR(36) NOT NULL,
  motivo VARCHAR(500) NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_log_omissao_meta (meta_id),
  FOREIGN KEY (meta_id) REFERENCES metas(id) ON DELETE CASCADE
);

CREATE TABLE metas_log_redistribuicao (
  id VARCHAR(36) PRIMARY KEY,
  meta_id VARCHAR(36) NOT NULL,
  data_original DATE NOT NULL,
  data_nova DATE NOT NULL,
  motivo VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_log_redistribuicao_meta (meta_id),
  FOREIGN KEY (meta_id) REFERENCES metas(id) ON DELETE CASCADE
);

CREATE TABLE metas_materiais (
  id VARCHAR(36) PRIMARY KEY,
  meta_id VARCHAR(36) NOT NULL,
  material_id INT NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_metas_materiais_meta (meta_id),
  INDEX idx_metas_materiais_material (material_id),
  UNIQUE KEY unique_meta_material (meta_id, material_id),
  FOREIGN KEY (meta_id) REFERENCES metas(id) ON DELETE CASCADE
);

CREATE TABLE metas_questoes (
  id VARCHAR(36) PRIMARY KEY,
  meta_id VARCHAR(36) NOT NULL,
  questao_id INT NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_metas_questoes_meta (meta_id),
  INDEX idx_metas_questoes_questao (questao_id),
  UNIQUE KEY unique_meta_questao (meta_id, questao_id),
  FOREIGN KEY (meta_id) REFERENCES metas(id) ON DELETE CASCADE
);

CREATE TABLE metas_revisoes (
  id VARCHAR(36) PRIMARY KEY,
  meta_id VARCHAR(36) NOT NULL,
  revisao_numero INT NOT NULL,
  data_prevista DATE NOT NULL,
  data_realizada DATE,
  proxima_revisao_id VARCHAR(36),
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_metas_revisoes_meta (meta_id),
  INDEX idx_metas_revisoes_proxima (proxima_revisao_id),
  FOREIGN KEY (meta_id) REFERENCES metas(id) ON DELETE CASCADE,
  FOREIGN KEY (proxima_revisao_id) REFERENCES metas(id)
);
