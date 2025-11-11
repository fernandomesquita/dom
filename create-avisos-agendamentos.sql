-- =============================================
-- Criar tabelas de agendamentos de avisos
-- =============================================

-- Tabela: avisos_agendamentos
CREATE TABLE IF NOT EXISTS avisos_agendamentos (
  id VARCHAR(36) PRIMARY KEY,
  aviso_id VARCHAR(36) NOT NULL,
  data_execucao TIMESTAMP NOT NULL,
  recorrencia VARCHAR(20) NOT NULL COMMENT 'unica, diaria, semanal, mensal',
  timezone VARCHAR(50) NOT NULL DEFAULT 'America/Sao_Paulo',
  proxima_execucao TIMESTAMP NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ativo' COMMENT 'ativo, pausado, concluido, cancelado',
  segmentacao JSON NULL,
  criado_por VARCHAR(36) NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_agendamentos_aviso (aviso_id),
  INDEX idx_agendamentos_status (status),
  INDEX idx_agendamentos_proxima (proxima_execucao),
  INDEX idx_agendamentos_criado_por (criado_por)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: avisos_agendamentos_logs
CREATE TABLE IF NOT EXISTS avisos_agendamentos_logs (
  id VARCHAR(36) PRIMARY KEY,
  agendamento_id VARCHAR(36) NOT NULL,
  aviso_id VARCHAR(36) NOT NULL,
  status VARCHAR(20) NOT NULL COMMENT 'sucesso, erro',
  usuarios_alcancados INT NOT NULL DEFAULT 0,
  erro_mensagem TEXT NULL,
  executado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_logs_agendamento (agendamento_id),
  INDEX idx_logs_aviso (aviso_id),
  INDEX idx_logs_status (status),
  INDEX idx_logs_executado (executado_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificar se as tabelas foram criadas
SELECT 'Tabelas criadas com sucesso!' AS resultado;
