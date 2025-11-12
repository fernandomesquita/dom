-- Script para criar as 12 tabelas restantes
-- Gerado em 09/11/2025

SET FOREIGN_KEY_CHECKS=0;

-- Tabela: gamification_achievements

CREATE TABLE `gamification_achievements` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `achievement_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icon` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rarity` enum('comum','raro','epico','lendario') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'comum',
  `xp_reward` int(11) NOT NULL DEFAULT '0',
  `unlocked_at` datetime NOT NULL,
  `viewed_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_user_id` (`user_id`),
  KEY `idx_achievement_id` (`achievement_id`),
  UNIQUE KEY `unique_user_achievement` (`user_id`,`achievement_id`),
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `idx_gamification_achievements_user_achievement` (`user_id`,`achievement_id`),
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- Tabela: gamification_xp

CREATE TABLE `gamification_xp` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_xp` int(11) NOT NULL DEFAULT '0',
  `current_level` int(11) NOT NULL DEFAULT '1',
  `xp_for_next_level` int(11) NOT NULL DEFAULT '100',
  `last_xp_gain` datetime DEFAULT NULL,
  `last_level_up` datetime DEFAULT NULL,
  `total_metas_concluidas` int(11) NOT NULL DEFAULT '0',
  `total_questoes_resolvidas` int(11) NOT NULL DEFAULT '0',
  `total_materiais_lidos` int(11) NOT NULL DEFAULT '0',
  `total_revisoes_concluidas` int(11) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `user_id` (`user_id`),
  KEY `idx_gamification_xp_user_id` (`user_id`),
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- Tabela: material_ratings

CREATE TABLE `material_ratings` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `material_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_user_material` (`user_id`,`material_id`),
  KEY `idx_material_id` (`material_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_rating` (`rating`),
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  CONSTRAINT `fk_2000` FOREIGN KEY (`material_id`) REFERENCES `materiais` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_2001` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- Tabela: material_votes

CREATE TABLE `material_votes` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `material_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vote_type` enum('up','down') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_user_material` (`user_id`,`material_id`),
  KEY `idx_material_id` (`material_id`),
  KEY `idx_user_id` (`user_id`),
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  CONSTRAINT `fk_2002` FOREIGN KEY (`material_id`) REFERENCES `materiais` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_2003` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- Tabela: metas_materiais

CREATE TABLE `metas_materiais` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `meta_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `material_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_meta_material` (`meta_id`,`material_id`),
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_2` (`material_id`),
  CONSTRAINT `fk_2004` FOREIGN KEY (`meta_id`) REFERENCES `metas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_2005` FOREIGN KEY (`material_id`) REFERENCES `materiais` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- Tabela: metas_questoes

CREATE TABLE `metas_questoes` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `meta_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `questao_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_meta_questao` (`meta_id`,`questao_id`),
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_2` (`questao_id`),
  CONSTRAINT `fk_2006` FOREIGN KEY (`meta_id`) REFERENCES `metas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_2007` FOREIGN KEY (`questao_id`) REFERENCES `questoes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- Tabela: notice_reads

CREATE TABLE `notice_reads` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notice_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lido` tinyint(1) NOT NULL DEFAULT '1',
  `lido_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_notice_id` (`notice_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_unique_read` (`notice_id`,`user_id`),
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- Tabela: planos_estudo

CREATE TABLE `planos_estudo` (
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
  KEY `idx_planos_usuario` (`usuario_id`),
  KEY `idx_planos_status` (`status`),
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_2` (`criado_por_id`),
  CONSTRAINT `fk_2008` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_2009` FOREIGN KEY (`criado_por_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- Tabela: streak_logs

CREATE TABLE `streak_logs` (
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
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `idx_streak_logs_user_date` (`user_id`,`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- Tabela: streak_protections

CREATE TABLE `streak_protections` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('diaria','semanal','mensal') COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantidade` int(11) NOT NULL DEFAULT '0',
  `quantidade_usada` int(11) NOT NULL DEFAULT '0',
  `data_expiracao` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_user_id` (`user_id`),
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `idx_streak_protections_user_id` (`user_id`),
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- Tabela: telemetry_events

CREATE TABLE `telemetry_events` (
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
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `event_id` (`event_id`),
  KEY `idx_telemetry_events_user_timestamp` (`user_id`,`timestamp`),
  KEY `idx_telemetry_events_widget_category` (`widget`,`category`,`timestamp`),
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- Tabela: widget_configs

CREATE TABLE `widget_configs` (
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
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `idx_widget_configs_user_type` (`user_id`,`widget_type`),
  KEY `idx_widget_configs_user_position` (`user_id`,`position`),
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



SET FOREIGN_KEY_CHECKS=1;
