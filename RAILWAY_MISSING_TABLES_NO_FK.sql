-- Script para criar as 34 tabelas faltantes no Railway
-- Gerado automaticamente em 09/11/2025

SET FOREIGN_KEY_CHECKS=0;

-- Tabela: avisos_analytics

CREATE TABLE `avisos_analytics` (
  `aviso_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `total_enviados` int(11) NOT NULL DEFAULT '0'
  `total_visualizados` int(11) NOT NULL DEFAULT '0'
  `total_dismissados` int(11) NOT NULL DEFAULT '0'
  `total_cliques_cta` int(11) NOT NULL DEFAULT '0'
  `taxa_visualizacao` int(11) NOT NULL DEFAULT '0'
  `taxa_dismiss` int(11) NOT NULL DEFAULT '0'
  `taxa_conversao` int(11) NOT NULL DEFAULT '0'
  `tempo_medio_visualizacao` int(11) NOT NULL DEFAULT '0'
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  KEY `idx_analytics_taxa_vis` (`taxa_visualizacao`)
  KEY `idx_analytics_taxa_conv` (`taxa_conversao`)
  PRIMARY KEY (`aviso_id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: avisos_fila_entrega

CREATE TABLE `avisos_fila_entrega` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `aviso_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `aluno_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendente'
  `tentativas` int(11) NOT NULL DEFAULT '0'
  `max_tentativas` int(11) NOT NULL DEFAULT '3'
  `erro_mensagem` text COLLATE utf8mb4_unicode_ci DEFAULT NULL
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  `processado_em` timestamp NULL DEFAULT NULL
  UNIQUE KEY `unique_fila_entrega` (`aviso_id`,`aluno_id`)
  KEY `idx_fila_status` (`status`)
  KEY `idx_fila_aviso` (`aviso_id`)
  KEY `idx_fila_aluno` (`aluno_id`)
  KEY `idx_fila_tentativas` (`tentativas`)
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: avisos_segmentacao

CREATE TABLE `avisos_segmentacao` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `aviso_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `tipo_segmentacao` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL
  `criterios` json NOT NULL
  `alunos_elegiveis_cache` json DEFAULT NULL
  `total_alunos_impactados` int(11) DEFAULT NULL
  `cache_gerado_em` timestamp NULL DEFAULT NULL
  UNIQUE KEY `unique_segmentacao_aviso` (`aviso_id`)
  KEY `idx_segmentacao_aviso` (`aviso_id`)
  KEY `idx_segmentacao_tipo` (`tipo_segmentacao`)
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: avisos_templates

CREATE TABLE `avisos_templates` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `nome` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL
  `descricao` text COLLATE utf8mb4_unicode_ci DEFAULT NULL
  `tipo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL
  `conteudo_template` text COLLATE utf8mb4_unicode_ci NOT NULL
  `variaveis_disponiveis` json DEFAULT NULL
  `criado_por` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  `usado_count` int(11) NOT NULL DEFAULT '0'
  KEY `idx_templates_tipo` (`tipo`)
  KEY `idx_templates_nome` (`nome`)
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: avisos_tipos

CREATE TABLE `avisos_tipos` (
  `id` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL
  `nome` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL
  `cor` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL
  `icone` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL
  `prioridade` int(11) NOT NULL
  `dismissavel_padrao` tinyint(1) NOT NULL DEFAULT '1'
  `formato_exibicao_padrao` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: avisos_visualizacoes

CREATE TABLE `avisos_visualizacoes` (
  `aviso_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `aluno_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `visualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  `dispositivo` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  `dismissado` tinyint(1) NOT NULL DEFAULT '0'
  `dismissado_em` timestamp NULL DEFAULT NULL
  `clicou_cta` tinyint(1) NOT NULL DEFAULT '0'
  `clicou_cta_em` timestamp NULL DEFAULT NULL
  `tempo_visualizacao` int(11) NOT NULL DEFAULT '0'
  `total_visualizacoes` int(11) NOT NULL DEFAULT '1'
  `ultima_visualizacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  PRIMARY KEY (`aviso_id`,`aluno_id`) /*T![clustered_index] CLUSTERED */
  KEY `idx_visualizacoes_aviso` (`aviso_id`)
  KEY `idx_visualizacoes_aluno` (`aluno_id`)
  KEY `idx_visualizacoes_dismissado` (`dismissado`)
  KEY `idx_visualizacoes_cta` (`clicou_cta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: daily_summaries

CREATE TABLE `daily_summaries` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
  `user_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
  `date` datetime NOT NULL
  `metas_planejadas` int(11) NOT NULL DEFAULT '0'
  `metas_concluidas` int(11) NOT NULL DEFAULT '0'
  `metas_em_andamento` int(11) NOT NULL DEFAULT '0'
  `questoes_resolvidas` int(11) NOT NULL DEFAULT '0'
  `questoes_corretas` int(11) NOT NULL DEFAULT '0'
  `questoes_erradas` int(11) NOT NULL DEFAULT '0'
  `tempo_estudo` int(11) NOT NULL DEFAULT '0'
  `tempo_questoes` int(11) NOT NULL DEFAULT '0'
  `tempo_materiais` int(11) NOT NULL DEFAULT '0'
  `materiais_acessados` int(11) NOT NULL DEFAULT '0'
  `materiais_concluidos` int(11) NOT NULL DEFAULT '0'
  `revisoes_pendentes` int(11) NOT NULL DEFAULT '0'
  `revisoes_concluidas` int(11) NOT NULL DEFAULT '0'
  `posts_created` int(11) NOT NULL DEFAULT '0'
  `replies_created` int(11) NOT NULL DEFAULT '0'
  `xp_ganho` int(11) NOT NULL DEFAULT '0'
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  UNIQUE KEY `unique_user_date` (`user_id`,`date`)
  KEY `idx_user_id` (`user_id`)
  KEY `idx_date` (`date`)
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
  KEY `idx_daily_summaries_user_date` (`user_id`,`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: dashboard_customizations

CREATE TABLE `dashboard_customizations` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
  `user_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
  `theme` enum('light','dark','auto') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'light'
  `compact_mode` tinyint(1) NOT NULL DEFAULT '0'
  `hero_message` text COLLATE utf8mb4_unicode_ci DEFAULT NULL
  `show_motivational_quotes` tinyint(1) NOT NULL DEFAULT '1'
  `notify_streak_risk` tinyint(1) NOT NULL DEFAULT '1'
  `notify_daily_goals` tinyint(1) NOT NULL DEFAULT '1'
  `notify_achievements` tinyint(1) NOT NULL DEFAULT '1'
  `show_xp_bar` tinyint(1) NOT NULL DEFAULT '1'
  `show_leaderboard` tinyint(1) NOT NULL DEFAULT '1'
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
  UNIQUE KEY `user_id` (`user_id`)
  KEY `idx_dashboard_customizations_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: forum_categorias

CREATE TABLE `forum_categorias` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `nome` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL
  `descricao` text COLLATE utf8mb4_unicode_ci DEFAULT NULL
  `icone` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  `cor` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  `ordem` int(11) NOT NULL DEFAULT '0'
  `ativa` tinyint(1) NOT NULL DEFAULT '1'
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  `is_fixed` tinyint(1) NOT NULL DEFAULT '0'
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: forum_categories

CREATE TABLE `forum_categories` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `nome` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL
  `descricao` text COLLATE utf8mb4_unicode_ci DEFAULT NULL
  `icone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  `cor` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  `ordem` int(11) NOT NULL DEFAULT '0'
  `is_ativa` tinyint(1) DEFAULT '1'
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  KEY `idx_categories_ordem` (`ordem`)
  KEY `idx_categories_ativa` (`is_ativa`)
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: forum_domain_whitelist

CREATE TABLE `forum_domain_whitelist` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `dominio` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
  `adicionado_por_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
  UNIQUE KEY `dominio` (`dominio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: forum_message_edits

CREATE TABLE `forum_message_edits` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `mensagem_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `editor_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `conteudo_antigo` text COLLATE utf8mb4_unicode_ci NOT NULL
  `conteudo_novo` text COLLATE utf8mb4_unicode_ci NOT NULL
  `editado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  KEY `idx_msg_edits_msg` (`mensagem_id`,`editado_em`)
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: forum_message_upvotes

CREATE TABLE `forum_message_upvotes` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `mensagem_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `usuario_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  KEY `idx_upvotes_mensagem` (`mensagem_id`)
  KEY `idx_upvotes_usuario` (`usuario_id`)
  UNIQUE KEY `unique_upvote` (`mensagem_id`,`usuario_id`)
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: forum_messages

CREATE TABLE `forum_messages` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `thread_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `autor_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `conteudo` text COLLATE utf8mb4_unicode_ci NOT NULL
  `mensagem_pai_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  `nivel_aninhamento` int(11) DEFAULT '0'
  `upvotes` int(11) DEFAULT '0'
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  `editado_em` timestamp NULL DEFAULT NULL
  `status` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT 'ativo'
  `motivo_delecao` text COLLATE utf8mb4_unicode_ci DEFAULT NULL
  `moderador_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  `is_resposta_oficial` tinyint(1) DEFAULT '0'
  `deletado_por_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  KEY `idx_messages_thread` (`thread_id`,`criado_em`)
  KEY `idx_messages_autor` (`autor_id`)
  KEY `idx_messages_pai` (`mensagem_pai_id`)
  KEY `idx_messages_status` (`status`)
  KEY `idx_messages_criado_em` (`criado_em`)
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: forum_moderation_queue

CREATE TABLE `forum_moderation_queue` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `tipo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL
  `item_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `autor_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `conteudo` text COLLATE utf8mb4_unicode_ci NOT NULL
  `motivo_suspeito` text COLLATE utf8mb4_unicode_ci NOT NULL
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'pendente'
  `moderador_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  `motivo_humano` text COLLATE utf8mb4_unicode_ci DEFAULT NULL
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  `processado_em` timestamp NULL DEFAULT NULL
  KEY `idx_moderation_status` (`status`)
  KEY `idx_moderation_autor` (`autor_id`)
  KEY `idx_moderation_criado_em` (`criado_em`)
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: forum_notifications

CREATE TABLE `forum_notifications` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `usuario_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `tipo` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL
  `thread_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `mensagem_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  `remetente_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  `conteudo` text COLLATE utf8mb4_unicode_ci NOT NULL
  `is_lida` tinyint(1) DEFAULT '0'
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  `aviso_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  KEY `idx_notifications_usuario` (`usuario_id`,`is_lida`,`criado_em`)
  KEY `idx_notifications_tipo` (`tipo`)
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: forum_thread_edits

CREATE TABLE `forum_thread_edits` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `thread_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `editor_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `titulo_antigo` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  `titulo_novo` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  `conteudo_antigo` text COLLATE utf8mb4_unicode_ci DEFAULT NULL
  `conteudo_novo` text COLLATE utf8mb4_unicode_ci DEFAULT NULL
  `editado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  KEY `idx_thread_edits_thread` (`thread_id`,`editado_em`)
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: forum_thread_favorites

CREATE TABLE `forum_thread_favorites` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `thread_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `usuario_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  KEY `idx_favorites_usuario` (`usuario_id`,`criado_em`)
  UNIQUE KEY `unique_favorite` (`thread_id`,`usuario_id`)
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: forum_thread_followers

CREATE TABLE `forum_thread_followers` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `thread_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `usuario_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  KEY `idx_followers_thread` (`thread_id`)
  KEY `idx_followers_usuario` (`usuario_id`)
  UNIQUE KEY `unique_follow` (`thread_id`,`usuario_id`)
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: forum_threads

CREATE TABLE `forum_threads` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `titulo` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL
  `conteudo` text COLLATE utf8mb4_unicode_ci NOT NULL
  `autor_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `categoria_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `tags` json DEFAULT NULL
  `is_pinned` tinyint(1) DEFAULT '0'
  `is_locked` tinyint(1) DEFAULT '0'
  `visualizacoes` int(11) DEFAULT '0'
  `total_mensagens` int(11) DEFAULT '0'
  `ultima_atividade` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  `editado_em` timestamp NULL DEFAULT NULL
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'ativo'
  `deletado_por_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  `motivo_delecao` text COLLATE utf8mb4_unicode_ci DEFAULT NULL
  KEY `idx_threads_autor` (`autor_id`)
  KEY `idx_threads_categoria` (`categoria_id`)
  KEY `idx_threads_ultima_atividade` (`ultima_atividade`)
  KEY `idx_threads_status` (`status`)
  KEY `idx_threads_criado_em` (`criado_em`)
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: forum_upvotes

CREATE TABLE `forum_upvotes` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `resposta_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  KEY `idx_resposta_id` (`resposta_id`)
  KEY `idx_user_id` (`user_id`)
  UNIQUE KEY `unique_vote` (`resposta_id`,`user_id`)
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: forum_user_suspensions

CREATE TABLE `forum_user_suspensions` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `usuario_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `moderador_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `motivo` text COLLATE utf8mb4_unicode_ci NOT NULL
  `dias_suspensao` int(11) NOT NULL
  `inicio_suspensao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  `fim_suspensao` timestamp NOT NULL
  `is_ativa` tinyint(1) DEFAULT '1'
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  KEY `idx_suspensions_usuario` (`usuario_id`)
  KEY `idx_suspensions_ativa` (`is_ativa`)
  KEY `idx_suspensions_fim` (`fim_suspensao`)
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: gamification_achievements

CREATE TABLE `gamification_achievements` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
  `user_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
  `achievement_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
  `description` text COLLATE utf8mb4_unicode_ci DEFAULT NULL
  `icon` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  `rarity` enum('comum','raro','epico','lendario') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'comum'
  `xp_reward` int(11) NOT NULL DEFAULT '0'
  `unlocked_at` datetime NOT NULL
  `viewed_at` datetime DEFAULT NULL
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  KEY `idx_user_id` (`user_id`)
  KEY `idx_achievement_id` (`achievement_id`)
  UNIQUE KEY `unique_user_achievement` (`user_id`,`achievement_id`)
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
  KEY `idx_gamification_achievements_user_achievement` (`user_id`,`achievement_id`)
  KEY `` (`user_id`,`achievement_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: gamification_xp

CREATE TABLE `gamification_xp` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
  `user_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
  `total_xp` int(11) NOT NULL DEFAULT '0'
  `current_level` int(11) NOT NULL DEFAULT '1'
  `xp_for_next_level` int(11) NOT NULL DEFAULT '100'
  `last_xp_gain` datetime DEFAULT NULL
  `last_level_up` datetime DEFAULT NULL
  `total_metas_concluidas` int(11) NOT NULL DEFAULT '0'
  `total_questoes_resolvidas` int(11) NOT NULL DEFAULT '0'
  `total_materiais_lidos` int(11) NOT NULL DEFAULT '0'
  `total_revisoes_concluidas` int(11) NOT NULL DEFAULT '0'
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
  UNIQUE KEY `user_id` (`user_id`)
  KEY `idx_gamification_xp_user_id` (`user_id`)
  KEY `` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: material_ratings

CREATE TABLE `material_ratings` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `material_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `rating` int(11) NOT NULL
  `comment` text COLLATE utf8mb4_unicode_ci DEFAULT NULL
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  KEY `idx_user_material` (`user_id`,`material_id`)
  KEY `idx_material_id` (`material_id`)
  KEY `idx_user_id` (`user_id`)
  KEY `idx_rating` (`rating`)
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: material_votes

CREATE TABLE `material_votes` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `material_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `vote_type` enum('up','down') COLLATE utf8mb4_unicode_ci NOT NULL
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  KEY `idx_user_material` (`user_id`,`material_id`)
  KEY `idx_material_id` (`material_id`)
  KEY `idx_user_id` (`user_id`)
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: metas_materiais

CREATE TABLE `metas_materiais` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `meta_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `material_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  UNIQUE KEY `unique_meta_material` (`meta_id`,`material_id`)
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
  KEY `fk_2` (`material_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: metas_questoes

CREATE TABLE `metas_questoes` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `meta_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `questao_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  UNIQUE KEY `unique_meta_questao` (`meta_id`,`questao_id`)
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
  KEY `fk_2` (`questao_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: notice_reads

CREATE TABLE `notice_reads` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `notice_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `lido` tinyint(1) NOT NULL DEFAULT '1'
  `lido_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  KEY `idx_notice_id` (`notice_id`)
  KEY `idx_user_id` (`user_id`)
  KEY `idx_unique_read` (`notice_id`,`user_id`)
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: planos_estudo

CREATE TABLE `planos_estudo` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `usuario_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `titulo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
  `descricao` text COLLATE utf8mb4_unicode_ci DEFAULT NULL
  `horas_por_dia` decimal(4,2) NOT NULL
  `dias_disponiveis_bitmask` int(11) NOT NULL DEFAULT '31'
  `data_inicio` date NOT NULL
  `data_fim` date DEFAULT NULL
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ativo'
  `criado_por_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  KEY `idx_planos_usuario` (`usuario_id`)
  KEY `idx_planos_status` (`status`)
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
  KEY `fk_2` (`criado_por_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: streak_logs

CREATE TABLE `streak_logs` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
  `user_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
  `date` datetime NOT NULL
  `metas_completas` int(11) NOT NULL DEFAULT '0'
  `questoes_resolvidas` int(11) NOT NULL DEFAULT '0'
  `tempo_estudo` int(11) NOT NULL DEFAULT '0'
  `streak_ativo` tinyint(1) NOT NULL DEFAULT '1'
  `protecao_usada` tinyint(1) NOT NULL DEFAULT '0'
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  KEY `idx_user_date` (`user_id`,`date`)
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
  KEY `idx_streak_logs_user_date` (`user_id`,`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: streak_protections

CREATE TABLE `streak_protections` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
  `user_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
  `tipo` enum('diaria','semanal','mensal') COLLATE utf8mb4_unicode_ci NOT NULL
  `quantidade` int(11) NOT NULL DEFAULT '0'
  `quantidade_usada` int(11) NOT NULL DEFAULT '0'
  `data_expiracao` datetime DEFAULT NULL
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  KEY `idx_user_id` (`user_id`)
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
  KEY `idx_streak_protections_user_id` (`user_id`)
  KEY `` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: telemetry_events

CREATE TABLE `telemetry_events` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
  `event_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
  `user_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
  `session_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
  `widget` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL
  `category` enum('engagement','conversion','error','performance') COLLATE utf8mb4_unicode_ci NOT NULL
  `properties` json DEFAULT NULL
  `metadata` json DEFAULT NULL
  `timestamp` datetime NOT NULL
  `timezone` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  `duration` int(11) DEFAULT NULL
  `user_agent` text COLLATE utf8mb4_unicode_ci DEFAULT NULL
  `viewport` json DEFAULT NULL
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  KEY `idx_user_timestamp` (`user_id`,`timestamp`)
  KEY `idx_widget_action` (`widget`,`action`)
  KEY `idx_session` (`session_id`)
  KEY `idx_category` (`category`)
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
  UNIQUE KEY `event_id` (`event_id`)
  KEY `idx_telemetry_events_user_timestamp` (`user_id`,`timestamp`)
  KEY `idx_telemetry_events_widget_category` (`widget`,`category`,`timestamp`)
  KEY `` (`widget`,`category`,`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: widget_configs

CREATE TABLE `widget_configs` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
  `user_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
  `widget_type` enum('cronograma','qtd','streak','progresso_semanal','materiais','revisoes','plano','comunidade') COLLATE utf8mb4_unicode_ci NOT NULL
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  `position` int(11) NOT NULL DEFAULT '0'
  `is_visible` tinyint(1) NOT NULL DEFAULT '1'
  `is_expanded` tinyint(1) NOT NULL DEFAULT '1'
  `config` json DEFAULT NULL
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  UNIQUE KEY `unique_user_widget` (`user_id`,`widget_type`)
  KEY `idx_user_id` (`user_id`)
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
  KEY `idx_widget_configs_user_type` (`user_id`,`widget_type`)
  KEY `idx_widget_configs_user_position` (`user_id`,`position`)
  KEY `` (`user_id`,`position`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS=1;
