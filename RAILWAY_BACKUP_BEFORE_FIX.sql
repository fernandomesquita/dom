-- MySQL dump 10.13  Distrib 8.0.43, for Linux (x86_64)
--
-- Host: switchback.proxy.rlwy.net    Database: railway
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `__drizzle_migrations`
--

DROP TABLE IF EXISTS `__drizzle_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `__drizzle_migrations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `hash` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30001 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `assinaturas`
--

DROP TABLE IF EXISTS `assinaturas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assinaturas` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `plano_id` varchar(36) NOT NULL,
  `status` enum('ATIVA','CANCELADA','EXPIRADA','SUSPENSA','PENDENTE') NOT NULL DEFAULT 'PENDENTE',
  `data_inicio` date NOT NULL,
  `data_fim` date NOT NULL,
  `renovacao_automatica` tinyint(1) NOT NULL DEFAULT '1',
  `pagarme_subscription_id` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_plano_id` (`plano_id`),
  KEY `idx_status` (`status`),
  KEY `idx_data_fim` (`data_fim`),
  KEY `idx_pagarme_sub` (`pagarme_subscription_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `assuntos`
--

DROP TABLE IF EXISTS `assuntos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assuntos` (
  `id` varchar(36) NOT NULL,
  `disciplina_id` varchar(36) NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `nome` varchar(150) NOT NULL,
  `descricao` text,
  `sort_order` int NOT NULL DEFAULT '0',
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_assuntos_disciplina_codigo` (`disciplina_id`,`codigo`),
  UNIQUE KEY `idx_assuntos_disciplina_slug` (`disciplina_id`,`slug`),
  KEY `idx_assuntos_disciplina` (`disciplina_id`),
  KEY `idx_assuntos_disciplina_sort` (`disciplina_id`,`sort_order`),
  KEY `idx_assuntos_nome` (`nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` varchar(36) NOT NULL,
  `actor_id` varchar(36) NOT NULL,
  `action` varchar(50) NOT NULL,
  `entity` varchar(50) NOT NULL,
  `entity_id` varchar(36) NOT NULL,
  `before_json` json DEFAULT NULL,
  `after_json` json DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `criado_em` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `idx_audit_entity` (`entity`,`entity_id`),
  KEY `idx_audit_actor` (`actor_id`),
  KEY `idx_audit_created` (`criado_em`),
  CONSTRAINT `audit_logs_actor_id_users_id_fk` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `avisos`
--

DROP TABLE IF EXISTS `avisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `avisos` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `formato_exibicao` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `titulo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtitulo` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `conteudo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `midia_tipo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `midia_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `midia_thumbnail` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `cta_texto` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cta_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `cta_estilo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cta_secundario_texto` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cta_secundario_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `cta_secundario_estilo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `links_adicionais` json DEFAULT NULL,
  `prioridade` int NOT NULL DEFAULT '5',
  `dismissavel` tinyint(1) NOT NULL DEFAULT '1',
  `reaparece_pos_dispensar` tinyint(1) NOT NULL DEFAULT '0',
  `frequencia_reexibicao` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `limite_exibicoes` int DEFAULT NULL,
  `data_inicio` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_fim` timestamp NULL DEFAULT NULL,
  `horario_exibicao` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'qualquer',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'rascunho',
  `sensivel` tinyint(1) NOT NULL DEFAULT '0',
  `grupo_teste` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `criado_por` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_avisos_status` (`status`),
  KEY `idx_avisos_data_inicio` (`data_inicio`),
  KEY `idx_avisos_data_fim` (`data_fim`),
  KEY `idx_avisos_prioridade` (`prioridade`),
  KEY `idx_avisos_tipo` (`tipo`),
  CONSTRAINT `fk_1` FOREIGN KEY (`tipo`) REFERENCES `E9go4Z3vKfQ64CyBjNz69u`.`avisos_tipos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `avisos_agendamentos`
--

DROP TABLE IF EXISTS `avisos_agendamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `avisos_agendamentos` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `aviso_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `data_execucao` timestamp NOT NULL,
  `recorrencia` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `timezone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'America/Sao_Paulo',
  `proxima_execucao` timestamp NULL DEFAULT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ativo',
  `segmentacao` json DEFAULT NULL,
  `criado_por` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_agendamentos_aviso` (`aviso_id`),
  KEY `idx_agendamentos_status` (`status`),
  KEY `idx_agendamentos_proxima` (`proxima_execucao`),
  KEY `idx_agendamentos_criado_por` (`criado_por`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `avisos_agendamentos_logs`
--

DROP TABLE IF EXISTS `avisos_agendamentos_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `avisos_agendamentos_logs` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `agendamento_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `aviso_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuarios_alcancados` int NOT NULL DEFAULT '0',
  `erro_mensagem` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `executado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_logs_agendamento` (`agendamento_id`),
  KEY `idx_logs_aviso` (`aviso_id`),
  KEY `idx_logs_status` (`status`),
  KEY `idx_logs_executado` (`executado_em`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `avisos_analytics`
--

DROP TABLE IF EXISTS `avisos_analytics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `avisos_analytics` (
  `aviso_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_enviados` int NOT NULL DEFAULT '0',
  `total_visualizados` int NOT NULL DEFAULT '0',
  `total_dismissados` int NOT NULL DEFAULT '0',
  `total_cliques_cta` int NOT NULL DEFAULT '0',
  `taxa_visualizacao` int NOT NULL DEFAULT '0',
  `taxa_dismiss` int NOT NULL DEFAULT '0',
  `taxa_conversao` int NOT NULL DEFAULT '0',
  `tempo_medio_visualizacao` int NOT NULL DEFAULT '0',
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`aviso_id`),
  KEY `idx_analytics_taxa_vis` (`taxa_visualizacao`),
  KEY `idx_analytics_taxa_conv` (`taxa_conversao`),
  CONSTRAINT `fk_1000` FOREIGN KEY (`aviso_id`) REFERENCES `avisos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `avisos_fila_entrega`
--

DROP TABLE IF EXISTS `avisos_fila_entrega`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `avisos_fila_entrega` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `aviso_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `aluno_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendente',
  `tentativas` int NOT NULL DEFAULT '0',
  `max_tentativas` int NOT NULL DEFAULT '3',
  `erro_mensagem` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `processado_em` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_fila_entrega` (`aviso_id`,`aluno_id`),
  KEY `idx_fila_status` (`status`),
  KEY `idx_fila_aviso` (`aviso_id`),
  KEY `idx_fila_aluno` (`aluno_id`),
  KEY `idx_fila_tentativas` (`tentativas`),
  CONSTRAINT `fk_1001` FOREIGN KEY (`aviso_id`) REFERENCES `avisos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `avisos_segmentacao`
--

DROP TABLE IF EXISTS `avisos_segmentacao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `avisos_segmentacao` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `aviso_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_segmentacao` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `criterios` json NOT NULL,
  `alunos_elegiveis_cache` json DEFAULT NULL,
  `total_alunos_impactados` int DEFAULT NULL,
  `cache_gerado_em` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_segmentacao_aviso` (`aviso_id`),
  KEY `idx_segmentacao_aviso` (`aviso_id`),
  KEY `idx_segmentacao_tipo` (`tipo_segmentacao`),
  CONSTRAINT `fk_1002` FOREIGN KEY (`aviso_id`) REFERENCES `avisos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `avisos_templates`
--

DROP TABLE IF EXISTS `avisos_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `avisos_templates` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `tipo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `conteudo_template` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `variaveis_disponiveis` json DEFAULT NULL,
  `criado_por` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `usado_count` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_templates_tipo` (`tipo`),
  KEY `idx_templates_nome` (`nome`),
  CONSTRAINT `fk_1003` FOREIGN KEY (`tipo`) REFERENCES `avisos_tipos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `avisos_tipos`
--

DROP TABLE IF EXISTS `avisos_tipos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `avisos_tipos` (
  `id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cor` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `icone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `prioridade` int NOT NULL,
  `dismissavel_padrao` tinyint(1) NOT NULL DEFAULT '1',
  `formato_exibicao_padrao` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `avisos_visualizacoes`
--

DROP TABLE IF EXISTS `avisos_visualizacoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `avisos_visualizacoes` (
  `aviso_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `aluno_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `visualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dispositivo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dismissado` tinyint(1) NOT NULL DEFAULT '0',
  `dismissado_em` timestamp NULL DEFAULT NULL,
  `clicou_cta` tinyint(1) NOT NULL DEFAULT '0',
  `clicou_cta_em` timestamp NULL DEFAULT NULL,
  `tempo_visualizacao` int NOT NULL DEFAULT '0',
  `total_visualizacoes` int NOT NULL DEFAULT '1',
  `ultima_visualizacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`aviso_id`,`aluno_id`),
  KEY `idx_visualizacoes_aviso` (`aviso_id`),
  KEY `idx_visualizacoes_aluno` (`aluno_id`),
  KEY `idx_visualizacoes_dismissado` (`dismissado`),
  KEY `idx_visualizacoes_cta` (`clicou_cta`),
  CONSTRAINT `fk_1004` FOREIGN KEY (`aviso_id`) REFERENCES `avisos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `commentLikes`
--

DROP TABLE IF EXISTS `commentLikes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `commentLikes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `commentId` int NOT NULL,
  `userId` varchar(36) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `commentUserIdx` (`commentId`,`userId`),
  KEY `commentLikes_userId_users_id_fk` (`userId`),
  CONSTRAINT `commentLikes_commentId_questionComments_id_fk` FOREIGN KEY (`commentId`) REFERENCES `questionComments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `commentLikes_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cronograma`
--

DROP TABLE IF EXISTS `cronograma`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cronograma` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `data` date NOT NULL,
  `atividade` varchar(255) NOT NULL,
  `tipo` enum('ESTUDO','QUESTOES','REVISAO') NOT NULL,
  `disciplina_id` varchar(36) DEFAULT NULL,
  `concluido` tinyint(1) NOT NULL DEFAULT '0',
  `tempo_planejado` int DEFAULT NULL,
  `tempo_realizado` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_data` (`data`),
  KEY `idx_disciplina_id` (`disciplina_id`),
  KEY `idx_concluido` (`concluido`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `daily_summaries`
--

DROP TABLE IF EXISTS `daily_summaries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_summaries` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` datetime NOT NULL,
  `metas_planejadas` int NOT NULL DEFAULT '0',
  `metas_concluidas` int NOT NULL DEFAULT '0',
  `metas_em_andamento` int NOT NULL DEFAULT '0',
  `questoes_resolvidas` int NOT NULL DEFAULT '0',
  `questoes_corretas` int NOT NULL DEFAULT '0',
  `questoes_erradas` int NOT NULL DEFAULT '0',
  `tempo_estudo` int NOT NULL DEFAULT '0',
  `tempo_questoes` int NOT NULL DEFAULT '0',
  `tempo_materiais` int NOT NULL DEFAULT '0',
  `materiais_acessados` int NOT NULL DEFAULT '0',
  `materiais_concluidos` int NOT NULL DEFAULT '0',
  `revisoes_pendentes` int NOT NULL DEFAULT '0',
  `revisoes_concluidas` int NOT NULL DEFAULT '0',
  `posts_created` int NOT NULL DEFAULT '0',
  `replies_created` int NOT NULL DEFAULT '0',
  `xp_ganho` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_date` (`user_id`,`date`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_date` (`date`),
  KEY `idx_daily_summaries_user_date` (`user_id`,`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dashboard_customizations`
--

DROP TABLE IF EXISTS `dashboard_customizations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dashboard_customizations` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `theme` enum('light','dark','auto') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'light',
  `compact_mode` tinyint(1) NOT NULL DEFAULT '0',
  `hero_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `show_motivational_quotes` tinyint(1) NOT NULL DEFAULT '1',
  `notify_streak_risk` tinyint(1) NOT NULL DEFAULT '1',
  `notify_daily_goals` tinyint(1) NOT NULL DEFAULT '1',
  `notify_achievements` tinyint(1) NOT NULL DEFAULT '1',
  `show_xp_bar` tinyint(1) NOT NULL DEFAULT '1',
  `show_leaderboard` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `idx_dashboard_customizations_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `disciplinas`
--

DROP TABLE IF EXISTS `disciplinas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `disciplinas` (
  `id` varchar(36) NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `descricao` text,
  `cor_hex` varchar(7) NOT NULL DEFAULT '#4F46E5',
  `icone` varchar(50) DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_disciplinas_codigo` (`codigo`),
  UNIQUE KEY `idx_disciplinas_slug` (`slug`),
  KEY `idx_disciplinas_ativo_sort` (`ativo`,`sort_order`),
  KEY `idx_disciplinas_nome` (`nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `estatisticas_diarias`
--

DROP TABLE IF EXISTS `estatisticas_diarias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estatisticas_diarias` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `data` date NOT NULL,
  `questoes_resolvidas` int NOT NULL DEFAULT '0',
  `questoes_corretas` int NOT NULL DEFAULT '0',
  `tempo_estudo` int NOT NULL DEFAULT '0',
  `materiais_estudados` int NOT NULL DEFAULT '0',
  `streak_ativo` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_data` (`user_id`,`data`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_data` (`data`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `examAttempts`
--

DROP TABLE IF EXISTS `examAttempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `examAttempts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `examId` int NOT NULL,
  `userId` varchar(36) NOT NULL,
  `answers` json DEFAULT NULL,
  `score` int DEFAULT '0',
  `correctCount` int DEFAULT '0',
  `wrongCount` int DEFAULT '0',
  `unansweredCount` int DEFAULT '0',
  `timeSpent` int DEFAULT '0',
  `status` enum('in_progress','completed','abandoned') NOT NULL DEFAULT 'in_progress',
  `startedAt` timestamp NOT NULL DEFAULT (now()),
  `completedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `examIdx` (`examId`),
  KEY `userIdx` (`userId`),
  KEY `statusIdx` (`status`),
  KEY `scoreIdx` (`score`),
  CONSTRAINT `examAttempts_examId_exams_id_fk` FOREIGN KEY (`examId`) REFERENCES `exams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `examAttempts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `examQuestions`
--

DROP TABLE IF EXISTS `examQuestions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `examQuestions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `examId` int NOT NULL,
  `questionId` int NOT NULL,
  `orderIndex` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `examIdx` (`examId`),
  KEY `questionIdx` (`questionId`),
  KEY `orderIdx` (`examId`,`orderIndex`),
  CONSTRAINT `examQuestions_examId_exams_id_fk` FOREIGN KEY (`examId`) REFERENCES `exams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `examQuestions_questionId_questions_id_fk` FOREIGN KEY (`questionId`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `exams`
--

DROP TABLE IF EXISTS `exams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exams` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `totalQuestions` int NOT NULL,
  `timeLimit` int DEFAULT NULL,
  `passingScore` int DEFAULT NULL,
  `isPublic` tinyint(1) DEFAULT '0',
  `planIds` text,
  `scheduledFor` timestamp NULL DEFAULT NULL,
  `closesAt` timestamp NULL DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `createdBy` varchar(36) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `createdByIdx` (`createdBy`),
  KEY `scheduledIdx` (`scheduledFor`),
  KEY `activeIdx` (`isActive`),
  CONSTRAINT `exams_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `forum_categorias`
--

DROP TABLE IF EXISTS `forum_categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum_categorias` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `icone` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cor` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ordem` int NOT NULL DEFAULT '0',
  `ativa` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_fixed` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `forum_categories`
--

DROP TABLE IF EXISTS `forum_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum_categories` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `icone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cor` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ordem` int NOT NULL DEFAULT '0',
  `is_ativa` tinyint(1) DEFAULT '1',
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_categories_ordem` (`ordem`),
  KEY `idx_categories_ativa` (`is_ativa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `forum_domain_whitelist`
--

DROP TABLE IF EXISTS `forum_domain_whitelist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum_domain_whitelist` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `dominio` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `adicionado_por_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dominio` (`dominio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `forum_message_edits`
--

DROP TABLE IF EXISTS `forum_message_edits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum_message_edits` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `mensagem_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `editor_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `conteudo_antigo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `conteudo_novo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `editado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_msg_edits_msg` (`mensagem_id`,`editado_em`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `forum_message_upvotes`
--

DROP TABLE IF EXISTS `forum_message_upvotes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum_message_upvotes` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `mensagem_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuario_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_upvote` (`mensagem_id`,`usuario_id`),
  KEY `idx_upvotes_mensagem` (`mensagem_id`),
  KEY `idx_upvotes_usuario` (`usuario_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `forum_messages`
--

DROP TABLE IF EXISTS `forum_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum_messages` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `thread_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `autor_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `conteudo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `mensagem_pai_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nivel_aninhamento` int DEFAULT '0',
  `upvotes` int DEFAULT '0',
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `editado_em` timestamp NULL DEFAULT NULL,
  `status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ativo',
  `motivo_delecao` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `moderador_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_resposta_oficial` tinyint(1) DEFAULT '0',
  `deletado_por_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_messages_thread` (`thread_id`,`criado_em`),
  KEY `idx_messages_autor` (`autor_id`),
  KEY `idx_messages_pai` (`mensagem_pai_id`),
  KEY `idx_messages_status` (`status`),
  KEY `idx_messages_criado_em` (`criado_em`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `forum_moderation_queue`
--

DROP TABLE IF EXISTS `forum_moderation_queue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum_moderation_queue` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `item_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `autor_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `conteudo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `motivo_suspeito` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pendente',
  `moderador_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `motivo_humano` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `processado_em` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_moderation_status` (`status`),
  KEY `idx_moderation_autor` (`autor_id`),
  KEY `idx_moderation_criado_em` (`criado_em`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `forum_notifications`
--

DROP TABLE IF EXISTS `forum_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum_notifications` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuario_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `thread_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `mensagem_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remetente_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `conteudo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_lida` tinyint(1) DEFAULT '0',
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `aviso_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_usuario` (`usuario_id`,`is_lida`,`criado_em`),
  KEY `idx_notifications_tipo` (`tipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `forum_respostas`
--

DROP TABLE IF EXISTS `forum_respostas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum_respostas` (
  `id` varchar(36) NOT NULL,
  `topico_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `conteudo` text NOT NULL,
  `melhor_resposta` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_topico_id` (`topico_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `forum_thread_edits`
--

DROP TABLE IF EXISTS `forum_thread_edits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum_thread_edits` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `thread_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `editor_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `titulo_antigo` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `titulo_novo` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `conteudo_antigo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `conteudo_novo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `editado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_thread_edits_thread` (`thread_id`,`editado_em`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `forum_thread_favorites`
--

DROP TABLE IF EXISTS `forum_thread_favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum_thread_favorites` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `thread_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuario_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_favorite` (`thread_id`,`usuario_id`),
  KEY `idx_favorites_usuario` (`usuario_id`,`criado_em`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `forum_thread_followers`
--

DROP TABLE IF EXISTS `forum_thread_followers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum_thread_followers` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `thread_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuario_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_follow` (`thread_id`,`usuario_id`),
  KEY `idx_followers_thread` (`thread_id`),
  KEY `idx_followers_usuario` (`usuario_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `forum_threads`
--

DROP TABLE IF EXISTS `forum_threads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum_threads` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `titulo` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `conteudo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `autor_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `categoria_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tags` json DEFAULT NULL,
  `is_pinned` tinyint(1) DEFAULT '0',
  `is_locked` tinyint(1) DEFAULT '0',
  `visualizacoes` int DEFAULT '0',
  `total_mensagens` int DEFAULT '0',
  `ultima_atividade` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `editado_em` timestamp NULL DEFAULT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ativo',
  `deletado_por_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `motivo_delecao` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `idx_threads_autor` (`autor_id`),
  KEY `idx_threads_categoria` (`categoria_id`),
  KEY `idx_threads_ultima_atividade` (`ultima_atividade`),
  KEY `idx_threads_status` (`status`),
  KEY `idx_threads_criado_em` (`criado_em`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `forum_topicos`
--

DROP TABLE IF EXISTS `forum_topicos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum_topicos` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `conteudo` text NOT NULL,
  `disciplina_id` varchar(36) DEFAULT NULL,
  `visualizacoes` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_disciplina_id` (`disciplina_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `forum_upvotes`
--

DROP TABLE IF EXISTS `forum_upvotes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum_upvotes` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `resposta_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_vote` (`resposta_id`,`user_id`),
  KEY `idx_resposta_id` (`resposta_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `forum_user_suspensions`
--

DROP TABLE IF EXISTS `forum_user_suspensions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum_user_suspensions` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuario_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `moderador_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `motivo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `dias_suspensao` int NOT NULL,
  `inicio_suspensao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fim_suspensao` timestamp NOT NULL,
  `is_ativa` tinyint(1) DEFAULT '1',
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_suspensions_usuario` (`usuario_id`),
  KEY `idx_suspensions_ativa` (`is_ativa`),
  KEY `idx_suspensions_fim` (`fim_suspensao`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `gamification_achievements`
--

DROP TABLE IF EXISTS `gamification_achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gamification_achievements` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `achievement_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `icon` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rarity` enum('comum','raro','epico','lendario') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'comum',
  `xp_reward` int NOT NULL DEFAULT '0',
  `unlocked_at` datetime NOT NULL,
  `viewed_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_achievement` (`user_id`,`achievement_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_achievement_id` (`achievement_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `gamification_xp`
--

DROP TABLE IF EXISTS `gamification_xp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gamification_xp` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_xp` int NOT NULL DEFAULT '0',
  `current_level` int NOT NULL DEFAULT '1',
  `xp_for_next_level` int NOT NULL DEFAULT '100',
  `last_xp_gain` datetime DEFAULT NULL,
  `last_level_up` datetime DEFAULT NULL,
  `total_metas_concluidas` int NOT NULL DEFAULT '0',
  `total_questoes_resolvidas` int NOT NULL DEFAULT '0',
  `total_materiais_lidos` int NOT NULL DEFAULT '0',
  `total_revisoes_concluidas` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_xp` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `materiais`
--

DROP TABLE IF EXISTS `materiais`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materiais` (
  `id` varchar(36) NOT NULL,
  `tipo` varchar(20) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `url` text NOT NULL,
  `owner_id` varchar(36) NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `materiais_owner_id_users_id_fk` (`owner_id`),
  CONSTRAINT `materiais_owner_id_users_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `materiais_acessos`
--

DROP TABLE IF EXISTS `materiais_acessos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materiais_acessos` (
  `id` varchar(36) NOT NULL,
  `material_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `dispositivo_id` varchar(255) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `idx_material_id` (`material_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `materiais_estudados`
--

DROP TABLE IF EXISTS `materiais_estudados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materiais_estudados` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `material_id` varchar(36) NOT NULL,
  `progresso` int NOT NULL DEFAULT '0',
  `tempo_estudo` int NOT NULL DEFAULT '0',
  `ultima_visualizacao` timestamp NOT NULL DEFAULT (now()),
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_material` (`user_id`,`material_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_material_id` (`material_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `materialComments`
--

DROP TABLE IF EXISTS `materialComments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materialComments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `materialId` int NOT NULL,
  `userId` varchar(36) NOT NULL,
  `parentCommentId` int DEFAULT NULL,
  `content` text NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `materialIdx` (`materialId`),
  KEY `userIdx` (`userId`),
  KEY `parentIdx` (`parentCommentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `materialDownloads`
--

DROP TABLE IF EXISTS `materialDownloads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materialDownloads` (
  `id` int NOT NULL AUTO_INCREMENT,
  `materialId` int NOT NULL,
  `materialItemId` int DEFAULT NULL,
  `userId` varchar(36) NOT NULL,
  `downloadedAt` timestamp NOT NULL DEFAULT (now()),
  `ipAddress` varchar(45) DEFAULT NULL,
  `pdfFingerprint` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `materialIdx` (`materialId`),
  KEY `userIdx` (`userId`),
  KEY `downloadedAtIdx` (`downloadedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `materialFavorites`
--

DROP TABLE IF EXISTS `materialFavorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materialFavorites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `materialId` int NOT NULL,
  `userId` varchar(36) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `userMaterialFavIdx` (`userId`,`materialId`),
  KEY `materialIdx` (`materialId`),
  KEY `userIdx` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `materialItems`
--

DROP TABLE IF EXISTS `materialItems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materialItems` (
  `id` int NOT NULL AUTO_INCREMENT,
  `materialId` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `type` enum('video','pdf','audio') NOT NULL,
  `url` text,
  `filePath` text,
  `duration` int DEFAULT NULL,
  `fileSize` int DEFAULT NULL,
  `order` int NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `materialIdx` (`materialId`),
  KEY `orderIdx` (`order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `materialLinks`
--

DROP TABLE IF EXISTS `materialLinks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materialLinks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `materialId` int NOT NULL,
  `disciplinaId` varchar(36) NOT NULL,
  `assuntoId` varchar(36) NOT NULL,
  `topicoId` varchar(36) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `mat_topico_uniq` (`materialId`,`topicoId`),
  KEY `mat_tree_idx` (`materialId`,`disciplinaId`,`assuntoId`,`topicoId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `materialRatings`
--

DROP TABLE IF EXISTS `materialRatings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materialRatings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `materialId` int NOT NULL,
  `userId` varchar(36) NOT NULL,
  `rating` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userMaterialRatingIdx` (`userId`,`materialId`),
  KEY `materialIdx` (`materialId`),
  KEY `userIdx` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `materialSeenMarks`
--

DROP TABLE IF EXISTS `materialSeenMarks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materialSeenMarks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `materialId` int NOT NULL,
  `userId` varchar(36) NOT NULL,
  `markedAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `userMaterialSeenIdx` (`userId`,`materialId`),
  KEY `materialIdx` (`materialId`),
  KEY `userIdx` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `materialUpvotes`
--

DROP TABLE IF EXISTS `materialUpvotes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materialUpvotes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `materialId` int NOT NULL,
  `userId` varchar(36) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `userMaterialIdx` (`userId`,`materialId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `materialViews`
--

DROP TABLE IF EXISTS `materialViews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materialViews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `materialId` int NOT NULL,
  `userId` varchar(36) NOT NULL,
  `viewedAt` timestamp NOT NULL DEFAULT (now()),
  `ipAddress` varchar(45) DEFAULT NULL,
  `userAgent` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_view` (`userId`,`materialId`),
  KEY `materialIdx` (`materialId`),
  KEY `userIdx` (`userId`),
  KEY `viewedAtIdx` (`viewedAt`),
  KEY `materialTimeIdx` (`materialId`,`viewedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `material_ratings`
--

DROP TABLE IF EXISTS `material_ratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_ratings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `material_id` int NOT NULL,
  `user_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_material_rating` (`user_id`,`material_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `material_votes`
--

DROP TABLE IF EXISTS `material_votes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_votes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `material_id` int NOT NULL,
  `user_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vote_type` enum('upvote','downvote') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_material_vote` (`user_id`,`material_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `materials`
--

DROP TABLE IF EXISTS `materials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materials` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `thumbnailUrl` text NOT NULL,
  `category` enum('base','revisao','promo') NOT NULL,
  `type` enum('video','pdf','audio') NOT NULL,
  `isPaid` tinyint(1) NOT NULL DEFAULT '0',
  `isAvailable` tinyint(1) NOT NULL DEFAULT '1',
  `isFeatured` tinyint(1) NOT NULL DEFAULT '0',
  `commentsEnabled` tinyint(1) NOT NULL DEFAULT '1',
  `upvotes` int NOT NULL DEFAULT '0',
  `viewCount` int NOT NULL DEFAULT '0',
  `downloadCount` int NOT NULL DEFAULT '0',
  `favoriteCount` int NOT NULL DEFAULT '0',
  `rating` decimal(3,2) DEFAULT '0.00',
  `ratingCount` int NOT NULL DEFAULT '0',
  `createdBy` varchar(36) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `categoryIdx` (`category`),
  KEY `typeIdx` (`type`),
  KEY `isPaidIdx` (`isPaid`),
  KEY `isAvailableIdx` (`isAvailable`),
  KEY `isFeaturedIdx` (`isFeatured`),
  KEY `createdAtIdx` (`createdAt`),
  KEY `categoryPaidIdx` (`category`,`isPaid`,`isAvailable`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `metas`
--

DROP TABLE IF EXISTS `metas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `metas` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descricao` text,
  `tipo` enum('QUESTOES','MATERIAIS','HORAS') NOT NULL,
  `valor_alvo` int NOT NULL,
  `valor_atual` int NOT NULL DEFAULT '0',
  `prazo` date NOT NULL,
  `concluida` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_prazo` (`prazo`),
  KEY `idx_concluida` (`concluida`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `metas_batch_imports`
--

DROP TABLE IF EXISTS `metas_batch_imports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `metas_batch_imports` (
  `id` varchar(36) NOT NULL,
  `plano_id` varchar(36) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `total_rows` int NOT NULL,
  `created_count` int NOT NULL,
  `duplicated_count` int NOT NULL,
  `invalid_count` int NOT NULL,
  `errors` json DEFAULT NULL,
  `uploaded_by_id` varchar(36) NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `metas_batch_imports_plano_id_metas_planos_estudo_id_fk` (`plano_id`),
  KEY `metas_batch_imports_uploaded_by_id_users_id_fk` (`uploaded_by_id`),
  CONSTRAINT `metas_batch_imports_plano_id_metas_planos_estudo_id_fk` FOREIGN KEY (`plano_id`) REFERENCES `metas_planos_estudo` (`id`) ON DELETE CASCADE,
  CONSTRAINT `metas_batch_imports_uploaded_by_id_users_id_fk` FOREIGN KEY (`uploaded_by_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `metas_cronograma`
--

DROP TABLE IF EXISTS `metas_cronograma`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `metas_cronograma` (
  `id` varchar(36) NOT NULL,
  `plano_id` varchar(36) NOT NULL,
  `meta_number_base` int NOT NULL,
  `meta_number_suffix` int DEFAULT NULL,
  `display_number` varchar(20) NOT NULL,
  `order_key` varchar(20) NOT NULL,
  `ktree_disciplina_id` varchar(36) NOT NULL,
  `ktree_assunto_id` varchar(36) NOT NULL,
  `ktree_topico_id` varchar(36) DEFAULT NULL,
  `ktree_subtopico_id` varchar(36) DEFAULT NULL,
  `tipo` varchar(20) NOT NULL,
  `incidencia` varchar(20) DEFAULT 'NA',
  `duracao_planejada_min` int NOT NULL,
  `duracao_real_sec` int DEFAULT '0',
  `scheduled_date` date NOT NULL,
  `scheduled_order` int NOT NULL,
  `scheduled_at_utc` timestamp NULL DEFAULT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'PENDENTE',
  `concluded_at_utc` timestamp NULL DEFAULT NULL,
  `orientacoes_estudo` text,
  `fixed` tinyint(1) DEFAULT '0',
  `fixed_rule_json` json DEFAULT NULL,
  `auto_generated` tinyint(1) DEFAULT '0',
  `parent_meta_id` varchar(36) DEFAULT NULL,
  `review_config_json` json DEFAULT NULL,
  `sequence_label` varchar(10) DEFAULT NULL,
  `original_meta_id` varchar(36) DEFAULT NULL,
  `omitted` tinyint(1) DEFAULT '0',
  `omission_reason` varchar(50) DEFAULT NULL,
  `omitted_at` timestamp NULL DEFAULT NULL,
  `row_hash` varchar(64) DEFAULT NULL,
  `criado_por_id` varchar(36) NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT (now()),
  `atualizado_em` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_display_number` (`plano_id`,`display_number`),
  UNIQUE KEY `unique_order_key` (`plano_id`,`order_key`),
  KEY `metas_cronograma_criado_por_id_users_id_fk` (`criado_por_id`),
  KEY `idx_metas_plan_schedule` (`plano_id`,`scheduled_date`,`scheduled_order`),
  KEY `idx_metas_plan_status` (`plano_id`,`status`,`omitted`),
  KEY `idx_metas_plan_order` (`plano_id`,`order_key`),
  KEY `idx_metas_parent` (`parent_meta_id`),
  KEY `idx_metas_concluded` (`concluded_at_utc`),
  CONSTRAINT `metas_cronograma_criado_por_id_users_id_fk` FOREIGN KEY (`criado_por_id`) REFERENCES `users` (`id`),
  CONSTRAINT `metas_cronograma_plano_id_metas_planos_estudo_id_fk` FOREIGN KEY (`plano_id`) REFERENCES `metas_planos_estudo` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `metas_cronograma_materiais`
--

DROP TABLE IF EXISTS `metas_cronograma_materiais`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `metas_cronograma_materiais` (
  `id` varchar(36) NOT NULL,
  `meta_id` varchar(36) NOT NULL,
  `material_id` varchar(36) NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_meta_material` (`meta_id`,`material_id`),
  KEY `metas_cronograma_materiais_material_id_materiais_id_fk` (`material_id`),
  CONSTRAINT `metas_cronograma_materiais_material_id_materiais_id_fk` FOREIGN KEY (`material_id`) REFERENCES `materiais` (`id`) ON DELETE CASCADE,
  CONSTRAINT `metas_cronograma_materiais_meta_id_metas_cronograma_id_fk` FOREIGN KEY (`meta_id`) REFERENCES `metas_cronograma` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `metas_cronograma_questoes`
--

DROP TABLE IF EXISTS `metas_cronograma_questoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `metas_cronograma_questoes` (
  `id` varchar(36) NOT NULL,
  `meta_id` varchar(36) NOT NULL,
  `questao_id` varchar(36) NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_meta_questao` (`meta_id`,`questao_id`),
  KEY `metas_cronograma_questoes_questao_id_questoes_id_fk` (`questao_id`),
  CONSTRAINT `metas_cronograma_questoes_meta_id_metas_cronograma_id_fk` FOREIGN KEY (`meta_id`) REFERENCES `metas_cronograma` (`id`) ON DELETE CASCADE,
  CONSTRAINT `metas_cronograma_questoes_questao_id_questoes_id_fk` FOREIGN KEY (`questao_id`) REFERENCES `questoes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `metas_materiais`
--

DROP TABLE IF EXISTS `metas_materiais`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `metas_materiais` (
  `id` int NOT NULL AUTO_INCREMENT,
  `meta_id` int NOT NULL,
  `material_id` int NOT NULL,
  `concluido` tinyint(1) NOT NULL DEFAULT '0',
  `data_conclusao` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_meta_id` (`meta_id`),
  KEY `idx_material_id` (`material_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `metas_planos_estudo`
--

DROP TABLE IF EXISTS `metas_planos_estudo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `metas_planos_estudo` (
  `id` varchar(36) NOT NULL,
  `usuario_id` varchar(36) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descricao` text,
  `horas_por_dia` decimal(4,2) NOT NULL,
  `dias_disponiveis_bitmask` int NOT NULL DEFAULT '31',
  `data_inicio` date NOT NULL,
  `data_fim` date DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'ativo',
  `criado_por_id` varchar(36) NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT (now()),
  `atualizado_em` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `metas_planos_estudo_criado_por_id_users_id_fk` (`criado_por_id`),
  KEY `idx_planos_usuario` (`usuario_id`),
  KEY `idx_planos_status` (`status`),
  CONSTRAINT `metas_planos_estudo_criado_por_id_users_id_fk` FOREIGN KEY (`criado_por_id`) REFERENCES `users` (`id`),
  CONSTRAINT `metas_planos_estudo_usuario_id_users_id_fk` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `metas_questoes`
--

DROP TABLE IF EXISTS `metas_questoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `metas_questoes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `meta_id` int NOT NULL,
  `questao_id` int NOT NULL,
  `concluido` tinyint(1) NOT NULL DEFAULT '0',
  `data_conclusao` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_meta_id` (`meta_id`),
  KEY `idx_questao_id` (`questao_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notice_reads`
--

DROP TABLE IF EXISTS `notice_reads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notice_reads` (
  `id` int NOT NULL AUTO_INCREMENT,
  `notice_id` int NOT NULL,
  `user_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `read_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_notice` (`user_id`,`notice_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notices`
--

DROP TABLE IF EXISTS `notices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notices` (
  `id` varchar(36) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `conteudo` text NOT NULL,
  `tipo` enum('INFO','ALERTA','URGENTE') NOT NULL DEFAULT 'INFO',
  `publicado` tinyint(1) NOT NULL DEFAULT '0',
  `data_publicacao` timestamp NULL DEFAULT NULL,
  `created_by` varchar(36) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_publicado` (`publicado`),
  KEY `idx_data_publicacao` (`data_publicacao`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pagamentos`
--

DROP TABLE IF EXISTS `pagamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagamentos` (
  `id` varchar(36) NOT NULL,
  `assinatura_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `status` enum('PENDENTE','PAGO','CANCELADO','ESTORNADO','FALHOU') NOT NULL DEFAULT 'PENDENTE',
  `metodo_pagamento` enum('CREDIT_CARD','BOLETO','PIX') NOT NULL,
  `pagarme_transaction_id` varchar(100) DEFAULT NULL,
  `pagarme_charge_id` varchar(100) DEFAULT NULL,
  `data_vencimento` date DEFAULT NULL,
  `data_pagamento` timestamp NULL DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_assinatura_id` (`assinatura_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_pagarme_transaction` (`pagarme_transaction_id`),
  KEY `idx_pagarme_charge` (`pagarme_charge_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `plan_disciplines`
--

DROP TABLE IF EXISTS `plan_disciplines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plan_disciplines` (
  `id` varchar(36) NOT NULL,
  `plan_id` varchar(36) NOT NULL,
  `discipline_id` varchar(36) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_unique_plan_discipline` (`plan_id`,`discipline_id`),
  KEY `idx_plan_disciplines_plan` (`plan_id`),
  KEY `idx_plan_disciplines_discipline` (`discipline_id`),
  CONSTRAINT `plan_disciplines_plan_id_plans_id_fk` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `plan_enrollments`
--

DROP TABLE IF EXISTS `plan_enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plan_enrollments` (
  `id` varchar(36) NOT NULL,
  `plan_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `enrolled_at` timestamp NOT NULL DEFAULT (now()),
  `expires_at` timestamp NULL DEFAULT NULL,
  `last_accessed_at` timestamp NULL DEFAULT NULL,
  `enrollment_status` enum('Ativo','Expirado','Cancelado','Suspenso') NOT NULL DEFAULT 'Ativo',
  `daily_hours` int NOT NULL DEFAULT '4',
  `custom_settings` json DEFAULT (_utf8mb4'{}'),
  `created_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_unique_enrollment` (`plan_id`,`user_id`),
  KEY `plan_enrollments_created_by_users_id_fk` (`created_by`),
  KEY `idx_user_plans` (`user_id`,`enrollment_status`),
  KEY `idx_plan_enrollments` (`plan_id`,`enrollment_status`),
  KEY `idx_expired_enrollments` (`expires_at`),
  CONSTRAINT `plan_enrollments_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `plan_enrollments_plan_id_plans_id_fk` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE,
  CONSTRAINT `plan_enrollments_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `planos`
--

DROP TABLE IF EXISTS `planos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `planos` (
  `id` varchar(36) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `descricao` text,
  `preco` decimal(10,2) NOT NULL,
  `duracao_meses` int NOT NULL,
  `recursos` json NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `destaque` tinyint(1) NOT NULL DEFAULT '0',
  `ordem` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ativo` (`ativo`),
  KEY `idx_ordem` (`ordem`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `planos_estudo`
--

DROP TABLE IF EXISTS `planos_estudo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `planos_estudo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` text COLLATE utf8mb4_unicode_ci,
  `data_inicio` date NOT NULL,
  `data_fim` date NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `plans`
--

DROP TABLE IF EXISTS `plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plans` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `version` varchar(20) DEFAULT 'v1.0',
  `logo_url` varchar(500) DEFAULT NULL,
  `featured_image_url` varchar(500) NOT NULL,
  `landing_page_url` varchar(500) DEFAULT NULL,
  `category` enum('Pago','Gratuito') NOT NULL,
  `edital_status` enum('Pré-edital','Pós-edital','N/A') DEFAULT 'N/A',
  `entity` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `tags` json DEFAULT (_utf8mb4'[]'),
  `knowledge_root_id` varchar(36) NOT NULL,
  `paywall_required` tinyint(1) DEFAULT '0',
  `price` decimal(10,2) DEFAULT NULL,
  `validity_date` date DEFAULT NULL,
  `duration_days` int DEFAULT NULL,
  `plan_status` enum('Ativo','Expirado','Oculto','Em edição') NOT NULL DEFAULT 'Em edição',
  `is_featured` tinyint(1) DEFAULT '0',
  `is_hidden` tinyint(1) NOT NULL DEFAULT '0',
  `mentor_id` varchar(36) DEFAULT NULL,
  `created_by` varchar(36) DEFAULT NULL,
  `updated_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `custom_settings` json DEFAULT (_utf8mb4'{}'),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_unique_featured_plan` (`is_featured`),
  KEY `plans_created_by_users_id_fk` (`created_by`),
  KEY `plans_updated_by_users_id_fk` (`updated_by`),
  KEY `idx_plans_public_list` (`plan_status`,`is_featured`,`category`,`created_at`),
  KEY `idx_plans_entity_role` (`entity`,`role`),
  KEY `idx_plans_mentor` (`mentor_id`),
  KEY `idx_plans_expired` (`validity_date`),
  KEY `idx_plans_knowledge_root` (`knowledge_root_id`),
  CONSTRAINT `plans_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `plans_mentor_id_users_id_fk` FOREIGN KEY (`mentor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `plans_updated_by_users_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `progresso_assuntos`
--

DROP TABLE IF EXISTS `progresso_assuntos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `progresso_assuntos` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `assunto_id` varchar(36) NOT NULL,
  `nivel_dominio` int NOT NULL DEFAULT '0',
  `questoes_resolvidas` int NOT NULL DEFAULT '0',
  `questoes_corretas` int NOT NULL DEFAULT '0',
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_assunto` (`user_id`,`assunto_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_assunto_id` (`assunto_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `progresso_disciplinas`
--

DROP TABLE IF EXISTS `progresso_disciplinas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `progresso_disciplinas` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `disciplina_id` varchar(36) NOT NULL,
  `nivel_dominio` int NOT NULL DEFAULT '0',
  `questoes_resolvidas` int NOT NULL DEFAULT '0',
  `questoes_corretas` int NOT NULL DEFAULT '0',
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_disciplina` (`user_id`,`disciplina_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_disciplina_id` (`disciplina_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `questionAttempts`
--

DROP TABLE IF EXISTS `questionAttempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questionAttempts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` varchar(36) NOT NULL,
  `questionId` int NOT NULL,
  `selectedOption` enum('A','B','C','D','E') DEFAULT NULL,
  `trueFalseAnswer` tinyint(1) DEFAULT NULL,
  `isCorrect` tinyint(1) NOT NULL,
  `timeSpent` int DEFAULT NULL,
  `source` enum('practice','exam','notebook') NOT NULL,
  `examAttemptId` int DEFAULT NULL,
  `attemptedAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `userIdx` (`userId`),
  KEY `questionIdx` (`questionId`),
  KEY `examIdx` (`examAttemptId`),
  KEY `userDateIdx` (`userId`,`attemptedAt`),
  KEY `userQuestionIdx` (`userId`,`questionId`),
  CONSTRAINT `questionAttempts_questionId_questions_id_fk` FOREIGN KEY (`questionId`) REFERENCES `questions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `questionAttempts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `questionComments`
--

DROP TABLE IF EXISTS `questionComments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questionComments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `questionId` int NOT NULL,
  `userId` varchar(36) NOT NULL,
  `parentId` int DEFAULT NULL,
  `content` text NOT NULL,
  `images` text,
  `isOfficial` tinyint(1) DEFAULT '0',
  `likesCount` int DEFAULT '0',
  `isEdited` tinyint(1) DEFAULT '0',
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `questionIdx` (`questionId`),
  KEY `parentIdx` (`parentId`),
  KEY `userIdx` (`userId`),
  KEY `activeIdx` (`isActive`),
  CONSTRAINT `questionComments_parentId_questionComments_id_fk` FOREIGN KEY (`parentId`) REFERENCES `questionComments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `questionComments_questionId_questions_id_fk` FOREIGN KEY (`questionId`) REFERENCES `questions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `questionComments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `questionFlags`
--

DROP TABLE IF EXISTS `questionFlags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questionFlags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `questionId` int NOT NULL,
  `userId` varchar(36) NOT NULL,
  `flagType` enum('outdated','annulled','error','duplicate') NOT NULL,
  `reason` text NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `reviewedBy` varchar(36) DEFAULT NULL,
  `reviewedAt` timestamp NULL DEFAULT NULL,
  `reviewNotes` text,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `questionFlags_reviewedBy_users_id_fk` (`reviewedBy`),
  KEY `questionIdx` (`questionId`),
  KEY `statusIdx` (`status`),
  KEY `userIdx` (`userId`),
  CONSTRAINT `questionFlags_questionId_questions_id_fk` FOREIGN KEY (`questionId`) REFERENCES `questions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `questionFlags_reviewedBy_users_id_fk` FOREIGN KEY (`reviewedBy`) REFERENCES `users` (`id`),
  CONSTRAINT `questionFlags_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uniqueCode` varchar(20) NOT NULL,
  `disciplinaId` varchar(36) DEFAULT NULL,
  `assuntoId` varchar(36) DEFAULT NULL,
  `topicoId` varchar(36) DEFAULT NULL,
  `statementText` text NOT NULL,
  `statementImage` varchar(500) DEFAULT NULL,
  `questionType` enum('multiple_choice','true_false') NOT NULL,
  `optionA` text,
  `optionB` text,
  `optionC` text,
  `optionD` text,
  `optionE` text,
  `correctOption` enum('A','B','C','D','E') DEFAULT NULL,
  `trueFalseAnswer` tinyint(1) DEFAULT NULL,
  `explanationText` text,
  `explanationImage` varchar(500) DEFAULT NULL,
  `examBoard` varchar(100) DEFAULT NULL,
  `examYear` int DEFAULT NULL,
  `examInstitution` varchar(255) DEFAULT NULL,
  `difficulty` enum('easy','medium','hard') DEFAULT NULL,
  `isOutdated` tinyint(1) DEFAULT '0',
  `isAnnulled` tinyint(1) DEFAULT '0',
  `flagReason` text,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `questions_uniqueCode_unique` (`uniqueCode`),
  KEY `uniqueCodeIdx` (`uniqueCode`),
  KEY `disciplinaIdx` (`disciplinaId`),
  KEY `assuntoIdx` (`assuntoId`),
  KEY `topicoIdx` (`topicoId`),
  KEY `typeIdx` (`questionType`),
  KEY `activeIdx` (`isActive`),
  KEY `disciplinaAssuntoIdx` (`disciplinaId`,`assuntoId`),
  KEY `disciplinaDifficultyIdx` (`disciplinaId`,`difficulty`),
  KEY `examBoardYearIdx` (`examBoard`,`examYear`),
  CONSTRAINT `questions_assuntoId_assuntos_id_fk` FOREIGN KEY (`assuntoId`) REFERENCES `assuntos` (`id`) ON DELETE SET NULL,
  CONSTRAINT `questions_disciplinaId_disciplinas_id_fk` FOREIGN KEY (`disciplinaId`) REFERENCES `disciplinas` (`id`) ON DELETE SET NULL,
  CONSTRAINT `questions_topicoId_topicos_id_fk` FOREIGN KEY (`topicoId`) REFERENCES `topicos` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `questoes`
--

DROP TABLE IF EXISTS `questoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questoes` (
  `id` varchar(36) NOT NULL,
  `fonte` varchar(100) DEFAULT NULL,
  `referencia_externa` varchar(100) DEFAULT NULL,
  `disciplina_id` varchar(36) DEFAULT NULL,
  `assunto_id` varchar(36) DEFAULT NULL,
  `texto_questao` text NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `questoes_resolvidas`
--

DROP TABLE IF EXISTS `questoes_resolvidas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questoes_resolvidas` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `questao_id` varchar(36) NOT NULL,
  `resposta` varchar(1) NOT NULL,
  `correta` tinyint(1) NOT NULL,
  `tempo_resolucao` int DEFAULT NULL,
  `data_resolucao` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_questao_id` (`questao_id`),
  KEY `idx_data_resolucao` (`data_resolucao`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `token_hash` varchar(64) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `revoked` tinyint(1) NOT NULL DEFAULT '0',
  `dispositivo_id` varchar(255) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `refresh_tokens_token_hash_unique` (`token_hash`),
  UNIQUE KEY `idx_token_hash` (`token_hash`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `streak_logs`
--

DROP TABLE IF EXISTS `streak_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `streak_logs` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL,
  `metas_completas` int NOT NULL DEFAULT '0',
  `questoes_resolvidas` int NOT NULL DEFAULT '0',
  `tempo_estudo` int NOT NULL DEFAULT '0',
  `streak_ativo` tinyint(1) NOT NULL DEFAULT '1',
  `protecao_usada` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_date` (`user_id`,`date`),
  KEY `idx_user_date` (`user_id`,`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `streak_protections`
--

DROP TABLE IF EXISTS `streak_protections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `streak_protections` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('diaria','semanal','mensal') COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantidade` int NOT NULL DEFAULT '0',
  `quantidade_usada` int NOT NULL DEFAULT '0',
  `data_expiracao` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `streak_questoes`
--

DROP TABLE IF EXISTS `streak_questoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `streak_questoes` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `streak_atual` int NOT NULL DEFAULT '0',
  `melhor_streak` int NOT NULL DEFAULT '0',
  `ultima_data` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `streak_questoes_user_id_unique` (`user_id`),
  UNIQUE KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `telemetry_events`
--

DROP TABLE IF EXISTS `telemetry_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `telemetry_events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `event_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_data` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_event_type` (`event_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tokens`
--

DROP TABLE IF EXISTS `tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tokens` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `token` varchar(500) NOT NULL,
  `type` enum('EMAIL_VERIFICATION','PASSWORD_RESET') NOT NULL,
  `expires_at` timestamp NOT NULL,
  `used` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `tokens_token_unique` (`token`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_token` (`token`),
  KEY `idx_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `topicos`
--

DROP TABLE IF EXISTS `topicos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `topicos` (
  `id` varchar(36) NOT NULL,
  `assunto_id` varchar(36) NOT NULL,
  `disciplina_id` varchar(36) NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `nome` varchar(200) NOT NULL,
  `descricao` text,
  `sort_order` int NOT NULL DEFAULT '0',
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_topicos_assunto_codigo` (`assunto_id`,`codigo`),
  UNIQUE KEY `idx_topicos_assunto_slug` (`assunto_id`,`slug`),
  KEY `idx_topicos_assunto` (`assunto_id`),
  KEY `idx_topicos_disciplina` (`disciplina_id`),
  KEY `idx_topicos_assunto_sort` (`assunto_id`,`sort_order`),
  KEY `idx_topicos_nome` (`nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `userNotebooks`
--

DROP TABLE IF EXISTS `userNotebooks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userNotebooks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` varchar(36) NOT NULL,
  `questionId` int NOT NULL,
  `notebookType` enum('review','mistakes','favorites') NOT NULL,
  `personalNotes` text,
  `color` varchar(7) DEFAULT NULL,
  `order` int DEFAULT '0',
  `addedAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniqueNotebook` (`userId`,`questionId`,`notebookType`),
  KEY `userTypeIdx` (`userId`,`notebookType`),
  KEY `questionIdx` (`questionId`),
  CONSTRAINT `userNotebooks_questionId_questions_id_fk` FOREIGN KEY (`questionId`) REFERENCES `questions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `userNotebooks_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `nome_completo` varchar(255) NOT NULL,
  `cpf` varchar(14) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `password_version` int NOT NULL DEFAULT '1',
  `data_nascimento` date NOT NULL,
  `email_verificado` tinyint(1) NOT NULL DEFAULT '0',
  `role` enum('ALUNO','PROFESSOR','MENTOR','ADMINISTRATIVO','MASTER') NOT NULL DEFAULT 'ALUNO',
  `avatar_url` varchar(500) DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_cpf_unique` (`cpf`),
  KEY `idx_email` (`email`),
  KEY `idx_cpf` (`cpf`),
  KEY `idx_role` (`role`),
  KEY `idx_ativo` (`ativo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `webhooks_pagarme`
--

DROP TABLE IF EXISTS `webhooks_pagarme`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `webhooks_pagarme` (
  `id` varchar(36) NOT NULL,
  `event_type` varchar(100) NOT NULL,
  `event_id` varchar(100) NOT NULL,
  `payload` json NOT NULL,
  `processed` tinyint(1) NOT NULL DEFAULT '0',
  `error_message` text,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `processed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_event_type` (`event_type`),
  KEY `idx_event_id` (`event_id`),
  KEY `idx_processed` (`processed`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `widget_configs`
--

DROP TABLE IF EXISTS `widget_configs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `widget_configs` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `widget_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `position` int NOT NULL,
  `visible` tinyint(1) NOT NULL DEFAULT '1',
  `config` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_widget` (`user_id`,`widget_id`),
  KEY `idx_user_position` (`user_id`,`position`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-10  9:07:27
