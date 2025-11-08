-- =============================================
-- SISTEMA DE AVISOS - Schema MySQL
-- =============================================

-- Tabela auxiliar: Tipos de Avisos
CREATE TABLE IF NOT EXISTS avisos_tipos (
  id VARCHAR(20) PRIMARY KEY,
  nome VARCHAR(50) NOT NULL,
  cor VARCHAR(7) NOT NULL,
  icone VARCHAR(50) NOT NULL,
  prioridade INT NOT NULL,
  dismissavel_padrao BOOLEAN DEFAULT TRUE NOT NULL,
  formato_exibicao_padrao VARCHAR(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir tipos padrão
INSERT INTO avisos_tipos (id, nome, cor, icone, prioridade, dismissavel_padrao, formato_exibicao_padrao) VALUES
  ('informativo', 'Informativo', '#10B981', 'Info', 3, TRUE, 'toast'),
  ('importante', 'Importante', '#F59E0B', 'AlertCircle', 2, TRUE, 'modal'),
  ('urgente', 'Urgente', '#EF4444', 'AlertTriangle', 1, FALSE, 'modal'),
  ('individual', 'Individual', '#3B82F6', 'Mail', 1, TRUE, 'modal'),
  ('premium', 'Premium', '#8B5CF6', 'Crown', 2, TRUE, 'banner')
ON DUPLICATE KEY UPDATE nome=VALUES(nome);

-- Tabela principal: Avisos
CREATE TABLE IF NOT EXISTS avisos (
  id VARCHAR(36) PRIMARY KEY,
  tipo VARCHAR(20) NOT NULL,
  formato_exibicao VARCHAR(20) NOT NULL,
  
  -- Conteúdo
  titulo VARCHAR(100) NOT NULL,
  subtitulo VARCHAR(150),
  conteudo TEXT NOT NULL,
  
  -- Mídia
  midia_tipo VARCHAR(20),
  midia_url TEXT,
  midia_thumbnail TEXT,
  
  -- CTAs
  cta_texto VARCHAR(50),
  cta_url TEXT,
  cta_estilo VARCHAR(20),
  cta_secundario_texto VARCHAR(50),
  cta_secundario_url TEXT,
  cta_secundario_estilo VARCHAR(20),
  links_adicionais JSON,
  
  -- Comportamento
  prioridade INT DEFAULT 5 NOT NULL,
  dismissavel BOOLEAN DEFAULT TRUE NOT NULL,
  reaparece_pos_dispensar BOOLEAN DEFAULT FALSE NOT NULL,
  frequencia_reexibicao VARCHAR(20),
  limite_exibicoes INT,
  
  -- Agendamento
  data_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  data_fim TIMESTAMP NULL,
  horario_exibicao VARCHAR(20) DEFAULT 'qualquer' NOT NULL,
  
  -- Status
  status VARCHAR(20) DEFAULT 'rascunho' NOT NULL,
  
  -- LGPD
  sensivel BOOLEAN DEFAULT FALSE NOT NULL,
  
  -- A/B Testing
  grupo_teste VARCHAR(10),
  
  -- Auditoria
  criado_por VARCHAR(36),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  
  FOREIGN KEY (tipo) REFERENCES avisos_tipos(id),
  INDEX idx_avisos_status (status),
  INDEX idx_avisos_data_inicio (data_inicio),
  INDEX idx_avisos_data_fim (data_fim),
  INDEX idx_avisos_prioridade (prioridade),
  INDEX idx_avisos_tipo (tipo),
  CHECK (formato_exibicao IN ('modal', 'banner', 'toast', 'badge')),
  CHECK (status IN ('rascunho', 'agendado', 'ativo', 'pausado', 'expirado')),
  CHECK (data_fim IS NULL OR data_fim > data_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: Segmentação de Avisos
CREATE TABLE IF NOT EXISTS avisos_segmentacao (
  id VARCHAR(36) PRIMARY KEY,
  aviso_id VARCHAR(36) NOT NULL,
  tipo_segmentacao VARCHAR(50) NOT NULL,
  criterios JSON NOT NULL,
  alunos_elegiveis_cache JSON,
  total_alunos_impactados INT,
  cache_gerado_em TIMESTAMP NULL,
  
  FOREIGN KEY (aviso_id) REFERENCES avisos(id) ON DELETE CASCADE,
  UNIQUE KEY unique_segmentacao_aviso (aviso_id),
  INDEX idx_segmentacao_aviso (aviso_id),
  INDEX idx_segmentacao_tipo (tipo_segmentacao),
  CHECK (tipo_segmentacao IN ('todos', 'plano', 'engajamento', 'progresso', 'desempenho', 'individual', 'custom'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: Tracking de Visualizações
CREATE TABLE IF NOT EXISTS avisos_visualizacoes (
  aviso_id VARCHAR(36) NOT NULL,
  aluno_id VARCHAR(36) NOT NULL,
  
  -- Primeira visualização
  visualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  dispositivo VARCHAR(20),
  
  -- Interações
  dismissado BOOLEAN DEFAULT FALSE NOT NULL,
  dismissado_em TIMESTAMP NULL,
  clicou_cta BOOLEAN DEFAULT FALSE NOT NULL,
  clicou_cta_em TIMESTAMP NULL,
  tempo_visualizacao INT DEFAULT 0 NOT NULL,
  
  -- Contadores
  total_visualizacoes INT DEFAULT 1 NOT NULL,
  ultima_visualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  
  PRIMARY KEY (aviso_id, aluno_id),
  FOREIGN KEY (aviso_id) REFERENCES avisos(id) ON DELETE CASCADE,
  INDEX idx_visualizacoes_aviso (aviso_id),
  INDEX idx_visualizacoes_aluno (aluno_id),
  INDEX idx_visualizacoes_dismissado (dismissado),
  INDEX idx_visualizacoes_cta (clicou_cta),
  CHECK (dispositivo IN ('mobile', 'desktop', 'tablet'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: Templates de Avisos
CREATE TABLE IF NOT EXISTS avisos_templates (
  id VARCHAR(36) PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  tipo VARCHAR(20) NOT NULL,
  conteudo_template TEXT NOT NULL,
  variaveis_disponiveis JSON,
  criado_por VARCHAR(36),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  usado_count INT DEFAULT 0 NOT NULL,
  
  FOREIGN KEY (tipo) REFERENCES avisos_tipos(id),
  INDEX idx_templates_tipo (tipo),
  INDEX idx_templates_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: Fila de Entrega
CREATE TABLE IF NOT EXISTS avisos_fila_entrega (
  id VARCHAR(36) PRIMARY KEY,
  aviso_id VARCHAR(36) NOT NULL,
  aluno_id VARCHAR(36) NOT NULL,
  status VARCHAR(20) DEFAULT 'pendente' NOT NULL,
  tentativas INT DEFAULT 0 NOT NULL,
  max_tentativas INT DEFAULT 3 NOT NULL,
  erro_mensagem TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  processado_em TIMESTAMP NULL,
  
  FOREIGN KEY (aviso_id) REFERENCES avisos(id) ON DELETE CASCADE,
  UNIQUE KEY unique_fila_entrega (aviso_id, aluno_id),
  INDEX idx_fila_status (status),
  INDEX idx_fila_aviso (aviso_id),
  INDEX idx_fila_aluno (aluno_id),
  INDEX idx_fila_tentativas (tentativas),
  CHECK (status IN ('pendente', 'processando', 'entregue', 'erro'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: Analytics Agregados
CREATE TABLE IF NOT EXISTS avisos_analytics (
  aviso_id VARCHAR(36) PRIMARY KEY,
  total_enviados INT DEFAULT 0 NOT NULL,
  total_visualizados INT DEFAULT 0 NOT NULL,
  total_dismissados INT DEFAULT 0 NOT NULL,
  total_cliques_cta INT DEFAULT 0 NOT NULL,
  taxa_visualizacao INT DEFAULT 0 NOT NULL,
  taxa_dismiss INT DEFAULT 0 NOT NULL,
  taxa_conversao INT DEFAULT 0 NOT NULL,
  tempo_medio_visualizacao INT DEFAULT 0 NOT NULL,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  
  FOREIGN KEY (aviso_id) REFERENCES avisos(id) ON DELETE CASCADE,
  INDEX idx_analytics_taxa_vis (taxa_visualizacao),
  INDEX idx_analytics_taxa_conv (taxa_conversao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
