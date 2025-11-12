-- ============================================
-- MIGRAÇÃO COMPLETA DAS 22 TABELAS
-- Railway MySQL - Schema correto do DEV
-- Data: 2025-11-10 09:24:26
-- ============================================

-- PASSO 1: Desabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';

-- PASSO 2: DROP das tabelas existentes
DROP TABLE IF EXISTS `material_ratings`;
DROP TABLE IF EXISTS `material_votes`;
DROP TABLE IF EXISTS `metas_materiais`;
DROP TABLE IF EXISTS `metas_questoes`;
DROP TABLE IF EXISTS `notice_reads`;
DROP TABLE IF EXISTS `planos_estudo`;
DROP TABLE IF EXISTS `questoes`;
DROP TABLE IF EXISTS `telemetry_events`;
DROP TABLE IF EXISTS `widget_configs`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `plan_enrollments`;
DROP TABLE IF EXISTS `plans`;
DROP TABLE IF EXISTS `streak_logs`;
DROP TABLE IF EXISTS `metas_cronograma`;
DROP TABLE IF EXISTS `metas_planos_estudo`;
DROP TABLE IF EXISTS `metas_batch_imports`;
DROP TABLE IF EXISTS `notices`;
DROP TABLE IF EXISTS `tokens`;
DROP TABLE IF EXISTS `refresh_tokens`;
DROP TABLE IF EXISTS `pagamentos`;
DROP TABLE IF EXISTS `assinaturas`;
DROP TABLE IF EXISTS `planos`;

-- PASSO 3: Criação das tabelas com schema correto (SEM foreign keys)

-- ==========================================
-- Tabela: material_ratings
-- ==========================================
;

-- ==========================================
-- Tabela: material_votes
-- ==========================================
;

-- ==========================================
-- Tabela: metas_materiais
-- ==========================================
;

-- ==========================================
-- Tabela: metas_questoes
-- ==========================================
;

-- ==========================================
-- Tabela: notice_reads
-- ==========================================
CREATE TABLE IF NOT EXISTS `notice_reads` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notice_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lido` tinyint(1) NOT NULL DEFAULT '1',
  `lido_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_notice_id` (`notice_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_unique_read` (`notice_id`,`user_id`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

-- ==========================================
-- Tabela: planos_estudo
-- ==========================================
;

-- ==========================================
-- Tabela: questoes
-- ==========================================
CREATE TABLE IF NOT EXISTS `questoes` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `enunciado` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `alternativas` json NOT NULL,
  `gabarito` varchar(1) COLLATE utf8mb4_unicode_ci NOT NULL,
  `disciplina_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assunto_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `topico_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `banca` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ano` int(11) DEFAULT NULL,
  `dificuldade` enum('FACIL','MEDIO','DIFICIL') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `explicacao` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) ,
  KEY `idx_disciplina_id` (`disciplina_id`),
  KEY `idx_assunto_id` (`assunto_id`),
  KEY `idx_topico_id` (`topico_id`),
  KEY `idx_banca` (`banca`),
  KEY `idx_ano` (`ano`),
  KEY `idx_dificuldade` (`dificuldade`),
  KEY `idx_ativo` (`ativo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

-- ==========================================
-- Tabela: telemetry_events
-- ==========================================
CREATE TABLE IF NOT EXISTS `telemetry_events` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `session_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `widget` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('engagement','conversion','error','performance') COLLATE utf8mb4_unicode_ci NOT NULL,
  `properties` json DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `timestamp` datetime NOT NULL,
  `timezone` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `viewport` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_user_timestamp` (`user_id`,`timestamp`),
  KEY `idx_widget_action` (`widget`,`action`),
  KEY `idx_session` (`session_id`),
  KEY `idx_category` (`category`),
  PRIMARY KEY (`id`) ,
  UNIQUE KEY `event_id` (`event_id`),
  KEY `idx_telemetry_events_user_timestamp` (`user_id`,`timestamp`),
  KEY `idx_telemetry_events_widget_category` (`widget`,`category`,`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

-- ==========================================
-- Tabela: widget_configs
-- ==========================================
CREATE TABLE IF NOT EXISTS `widget_configs` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `widget_type` enum('cronograma','qtd','streak','progresso_semanal','materiais','revisoes','plano','comunidade') COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `position` int(11) NOT NULL DEFAULT '0',
  `is_visible` tinyint(1) NOT NULL DEFAULT '1',
  `is_expanded` tinyint(1) NOT NULL DEFAULT '1',
  `config` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_user_widget` (`user_id`,`widget_type`),
  KEY `idx_user_id` (`user_id`),
  PRIMARY KEY (`id`) ,
  KEY `idx_widget_configs_user_type` (`user_id`,`widget_type`),
  KEY `idx_widget_configs_user_position` (`user_id`,`position`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

-- ==========================================
-- Tabela: users
-- ==========================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome_completo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cpf` varchar(14) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_version` int(11) NOT NULL DEFAULT '1',
  `data_nascimento` date NOT NULL,
  `email_verificado` tinyint(1) NOT NULL DEFAULT '0',
  `role` enum('ALUNO','PROFESSOR','MENTOR','ADMINISTRATIVO','MASTER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ALUNO',
  `avatar_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `forum_banned` tinyint(1) NOT NULL DEFAULT '0',
  `forum_banned_until` timestamp NULL DEFAULT NULL,
  `forum_banned_reason` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`) ,
  UNIQUE KEY `users_cpf_unique` (`cpf`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_cpf` (`cpf`),
  KEY `idx_role` (`role`),
  KEY `idx_ativo` (`ativo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

-- ==========================================
-- Tabela: plan_enrollments
-- ==========================================
;

-- ==========================================
-- Tabela: plans
-- ==========================================
CREATE TABLE IF NOT EXISTS `plans` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` enum('Pago','Gratuito') COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `edital_status` enum('Pré-edital','Pós-edital','N/A') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'N/A',
  `featured_image_url` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `landing_page_url` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration_days` int(11) DEFAULT NULL,
  `validity_date` datetime DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `is_hidden` tinyint(1) NOT NULL DEFAULT '0',
  `mentor_id` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_category` (`category`),
  KEY `idx_edital_status` (`edital_status`),
  KEY `idx_is_featured` (`is_featured`),
  KEY `idx_is_hidden` (`is_hidden`),
  PRIMARY KEY (`id`) ,
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

-- ==========================================
-- Tabela: streak_logs
-- ==========================================
CREATE TABLE IF NOT EXISTS `streak_logs` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` datetime NOT NULL,
  `metas_completas` int(11) NOT NULL DEFAULT '0',
  `questoes_resolvidas` int(11) NOT NULL DEFAULT '0',
  `tempo_estudo` int(11) NOT NULL DEFAULT '0',
  `streak_ativo` tinyint(1) NOT NULL DEFAULT '1',
  `protecao_usada` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_user_date` (`user_id`,`date`),
  PRIMARY KEY (`id`) ,
  KEY `idx_streak_logs_user_date` (`user_id`,`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

-- ==========================================
-- Tabela: metas_cronograma
-- ==========================================
;

-- ==========================================
-- Tabela: metas_planos_estudo
-- ==========================================
;

-- ==========================================
-- Tabela: metas_batch_imports
-- ==========================================
;

-- ==========================================
-- Tabela: notices
-- ==========================================
CREATE TABLE IF NOT EXISTS `notices` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `titulo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `conteudo` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('INFO','ALERTA','URGENTE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INFO',
  `publicado` tinyint(1) NOT NULL DEFAULT '0',
  `data_publicacao` timestamp NULL DEFAULT NULL,
  `created_by` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) ,
  KEY `idx_publicado` (`publicado`),
  KEY `idx_data_publicacao` (`data_publicacao`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

-- ==========================================
-- Tabela: tokens
-- ==========================================
CREATE TABLE IF NOT EXISTS `tokens` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('EMAIL_VERIFICATION','PASSWORD_RESET') COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `used` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) ,
  UNIQUE KEY `tokens_token_unique` (`token`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_token` (`token`),
  KEY `idx_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

-- ==========================================
-- Tabela: refresh_tokens
-- ==========================================
;

-- ==========================================
-- Tabela: pagamentos
-- ==========================================
CREATE TABLE IF NOT EXISTS `pagamentos` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assinatura_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `status` enum('PENDENTE','PAGO','CANCELADO','ESTORNADO','FALHOU') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDENTE',
  `metodo_pagamento` enum('CREDIT_CARD','BOLETO','PIX') COLLATE utf8mb4_unicode_ci NOT NULL,
  `pagarme_transaction_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pagarme_charge_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `data_vencimento` date DEFAULT NULL,
  `data_pagamento` timestamp NULL DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) ,
  KEY `idx_assinatura_id` (`assinatura_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_pagarme_transaction` (`pagarme_transaction_id`),
  KEY `idx_pagarme_charge` (`pagarme_charge_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

-- ==========================================
-- Tabela: assinaturas
-- ==========================================
CREATE TABLE IF NOT EXISTS `assinaturas` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `plano_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('ATIVA','CANCELADA','EXPIRADA','SUSPENSA','PENDENTE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDENTE',
  `data_inicio` date NOT NULL,
  `data_fim` date NOT NULL,
  `renovacao_automatica` tinyint(1) NOT NULL DEFAULT '1',
  `pagarme_subscription_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) ,
  KEY `idx_user_id` (`user_id`),
  KEY `idx_plano_id` (`plano_id`),
  KEY `idx_status` (`status`),
  KEY `idx_data_fim` (`data_fim`),
  KEY `idx_pagarme_sub` (`pagarme_subscription_id`),
  KEY `idx_assinaturas_user_status` (`user_id`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

-- ==========================================
-- Tabela: planos
-- ==========================================
CREATE TABLE IF NOT EXISTS `planos` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `preco` decimal(10,2) NOT NULL,
  `duracao_meses` int(11) NOT NULL,
  `recursos` json NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `destaque` tinyint(1) NOT NULL DEFAULT '0',
  `ordem` int(11) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) ,
  KEY `idx_ativo` (`ativo`),
  KEY `idx_ordem` (`ordem`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

-- PASSO 4: Reabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- FIM DA MIGRAÇÃO
-- Total de tabelas: 22

-- ==========================================
-- CORREÇÃO DAS 4 TABELAS QUE ESTAVAM VAZIAS
-- ==========================================
-- ==========================================
-- Tabela: plan_enrollments
-- ==========================================
CREATE TABLE IF NOT EXISTS `plan_enrollments` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `plan_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('Ativo','Expirado','Cancelado','Suspenso') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Ativo',
  `enrolled_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` datetime DEFAULT NULL,
  `progress_percentage` int(11) NOT NULL DEFAULT '0',
  `custom_settings` json DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_user_plan` (`user_id`,`plan_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_plan_id` (`plan_id`),
  KEY `idx_status` (`status`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

-- ==========================================
-- Tabela: metas_cronograma
-- ==========================================
CREATE TABLE IF NOT EXISTS `metas_cronograma` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `plano_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `meta_number_base` int(11) NOT NULL,
  `meta_number_suffix` int(11) DEFAULT NULL,
  `display_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_key` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ktree_disciplina_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ktree_assunto_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ktree_topico_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ktree_subtopico_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `incidencia` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'NA',
  `duracao_planejada_min` int(11) NOT NULL,
  `duracao_real_sec` int(11) DEFAULT '0',
  `scheduled_date` date NOT NULL,
  `scheduled_order` int(11) NOT NULL,
  `scheduled_at_utc` timestamp NULL DEFAULT NULL,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDENTE',
  `concluded_at_utc` timestamp NULL DEFAULT NULL,
  `orientacoes_estudo` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fixed` tinyint(1) DEFAULT '0',
  `auto_generated` tinyint(1) DEFAULT '0',
  `parent_meta_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `omitted` tinyint(1) DEFAULT '0',
  `omission_reason` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `row_hash` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `criado_por_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `fixed_rule_json` json DEFAULT NULL,
  `review_config_json` json DEFAULT NULL,
  `sequence_label` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `original_meta_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `omitted_at` timestamp NULL DEFAULT NULL,
  KEY `idx_mcron_plan_schedule` (`plano_id`,`scheduled_date`,`scheduled_order`),
  KEY `idx_mcron_plan_status` (`plano_id`,`status`,`omitted`),
  UNIQUE KEY `unique_mcron_display_number` (`plano_id`,`display_number`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

-- ==========================================
-- Tabela: metas_planos_estudo
-- ==========================================
CREATE TABLE IF NOT EXISTS `metas_planos_estudo` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuario_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `titulo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `horas_por_dia` decimal(4,2) NOT NULL,
  `dias_disponiveis_bitmask` int(11) NOT NULL DEFAULT '31',
  `data_inicio` date NOT NULL,
  `data_fim` date DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ativo',
  `criado_por_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_mplanos_usuario` (`usuario_id`),
  KEY `idx_mplanos_status` (`status`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

-- ==========================================
-- Tabela: metas_batch_imports
-- ==========================================
CREATE TABLE IF NOT EXISTS `metas_batch_imports` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `plano_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_rows` int(11) NOT NULL,
  `created_count` int(11) NOT NULL,
  `duplicated_count` int(11) NOT NULL,
  `invalid_count` int(11) NOT NULL,
  `errors` json DEFAULT NULL,
  `uploaded_by_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

