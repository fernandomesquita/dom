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
-- Dumping data for table `__drizzle_migrations`
--

LOCK TABLES `__drizzle_migrations` WRITE;
/*!40000 ALTER TABLE `__drizzle_migrations` DISABLE KEYS */;
/*!40000 ALTER TABLE `__drizzle_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assinaturas`
--

DROP TABLE IF EXISTS `assinaturas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assinaturas` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `plano_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('ATIVA','CANCELADA','EXPIRADA','SUSPENSA','PENDENTE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDENTE',
  `data_inicio` date NOT NULL,
  `data_fim` date NOT NULL,
  `renovacao_automatica` tinyint(1) NOT NULL DEFAULT '1',
  `pagarme_subscription_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_plano_id` (`plano_id`),
  KEY `idx_status` (`status`),
  KEY `idx_data_fim` (`data_fim`),
  KEY `idx_pagarme_sub` (`pagarme_subscription_id`),
  KEY `idx_assinaturas_user_status` (`user_id`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assinaturas`
--

LOCK TABLES `assinaturas` WRITE;
/*!40000 ALTER TABLE `assinaturas` DISABLE KEYS */;
/*!40000 ALTER TABLE `assinaturas` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `assuntos`
--

LOCK TABLES `assuntos` WRITE;
/*!40000 ALTER TABLE `assuntos` DISABLE KEYS */;
INSERT INTO `assuntos` VALUES ('dd9c3d01-5d2b-4712-835f-5f8b7daafa07','ca2f75d4-2a13-43cf-a601-3a4e94b5c5d6','DADM-ATOS','atos-administrativos','Atos administrativos','',100,1,'10d27c7c-be70-11f0-b544-a2aa05cbddca','2025-11-11 12:46:43','2025-11-11 12:46:43'),('faa5fe72-498a-438a-b91a-44d29ad24a5d','39073999-54d3-41f6-b69f-adf2f88530b8','DC-DGF','direitos-e-garantias-fundamentais','Direitos e garantias fundamentais','',100,1,'10d27c7c-be70-11f0-b544-a2aa05cbddca','2025-11-11 04:09:19','2025-11-11 04:09:19');
/*!40000 ALTER TABLE `assuntos` ENABLE KEYS */;
UNLOCK TABLES;

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
  KEY `idx_audit_created` (`criado_em`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `avisos`
--

LOCK TABLES `avisos` WRITE;
/*!40000 ALTER TABLE `avisos` DISABLE KEYS */;
/*!40000 ALTER TABLE `avisos` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `avisos_agendamentos`
--

LOCK TABLES `avisos_agendamentos` WRITE;
/*!40000 ALTER TABLE `avisos_agendamentos` DISABLE KEYS */;
/*!40000 ALTER TABLE `avisos_agendamentos` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `avisos_agendamentos_logs`
--

LOCK TABLES `avisos_agendamentos_logs` WRITE;
/*!40000 ALTER TABLE `avisos_agendamentos_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `avisos_agendamentos_logs` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `avisos_analytics`
--

LOCK TABLES `avisos_analytics` WRITE;
/*!40000 ALTER TABLE `avisos_analytics` DISABLE KEYS */;
/*!40000 ALTER TABLE `avisos_analytics` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `avisos_fila_entrega`
--

LOCK TABLES `avisos_fila_entrega` WRITE;
/*!40000 ALTER TABLE `avisos_fila_entrega` DISABLE KEYS */;
/*!40000 ALTER TABLE `avisos_fila_entrega` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `avisos_segmentacao`
--

LOCK TABLES `avisos_segmentacao` WRITE;
/*!40000 ALTER TABLE `avisos_segmentacao` DISABLE KEYS */;
/*!40000 ALTER TABLE `avisos_segmentacao` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `avisos_templates`
--

LOCK TABLES `avisos_templates` WRITE;
/*!40000 ALTER TABLE `avisos_templates` DISABLE KEYS */;
/*!40000 ALTER TABLE `avisos_templates` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `avisos_tipos`
--

LOCK TABLES `avisos_tipos` WRITE;
/*!40000 ALTER TABLE `avisos_tipos` DISABLE KEYS */;
/*!40000 ALTER TABLE `avisos_tipos` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `avisos_visualizacoes`
--

LOCK TABLES `avisos_visualizacoes` WRITE;
/*!40000 ALTER TABLE `avisos_visualizacoes` DISABLE KEYS */;
/*!40000 ALTER TABLE `avisos_visualizacoes` ENABLE KEYS */;
UNLOCK TABLES;

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
  CONSTRAINT `commentLikes_commentId_questionComments_id_fk` FOREIGN KEY (`commentId`) REFERENCES `questionComments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commentLikes`
--

LOCK TABLES `commentLikes` WRITE;
/*!40000 ALTER TABLE `commentLikes` DISABLE KEYS */;
/*!40000 ALTER TABLE `commentLikes` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `cronograma`
--

LOCK TABLES `cronograma` WRITE;
/*!40000 ALTER TABLE `cronograma` DISABLE KEYS */;
/*!40000 ALTER TABLE `cronograma` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `daily_summaries`
--

LOCK TABLES `daily_summaries` WRITE;
/*!40000 ALTER TABLE `daily_summaries` DISABLE KEYS */;
/*!40000 ALTER TABLE `daily_summaries` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `dashboard_customizations`
--

LOCK TABLES `dashboard_customizations` WRITE;
/*!40000 ALTER TABLE `dashboard_customizations` DISABLE KEYS */;
/*!40000 ALTER TABLE `dashboard_customizations` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `disciplinas`
--

LOCK TABLES `disciplinas` WRITE;
/*!40000 ALTER TABLE `disciplinas` DISABLE KEYS */;
INSERT INTO `disciplinas` VALUES ('39073999-54d3-41f6-b69f-adf2f88530b8','DIREITOCONSTITUCIONA','direito-constitucional','Direito Constitucional','','#4F46E5','',100,1,'10d27c7c-be70-11f0-b544-a2aa05cbddca','2025-11-11 03:46:00','2025-11-11 03:46:00'),('ca2f75d4-2a13-43cf-a601-3a4e94b5c5d6','DIREITOADMINISTRATIV','direito-administrativo','Direito Administrativo','','#e548ab','',100,1,'10d27c7c-be70-11f0-b544-a2aa05cbddca','2025-11-11 12:45:52','2025-11-11 12:45:52');
/*!40000 ALTER TABLE `disciplinas` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `estatisticas_diarias`
--

LOCK TABLES `estatisticas_diarias` WRITE;
/*!40000 ALTER TABLE `estatisticas_diarias` DISABLE KEYS */;
/*!40000 ALTER TABLE `estatisticas_diarias` ENABLE KEYS */;
UNLOCK TABLES;

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
  CONSTRAINT `examAttempts_examId_exams_id_fk` FOREIGN KEY (`examId`) REFERENCES `exams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `examAttempts`
--

LOCK TABLES `examAttempts` WRITE;
/*!40000 ALTER TABLE `examAttempts` DISABLE KEYS */;
/*!40000 ALTER TABLE `examAttempts` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `examQuestions`
--

LOCK TABLES `examQuestions` WRITE;
/*!40000 ALTER TABLE `examQuestions` DISABLE KEYS */;
/*!40000 ALTER TABLE `examQuestions` ENABLE KEYS */;
UNLOCK TABLES;

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
  KEY `activeIdx` (`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exams`
--

LOCK TABLES `exams` WRITE;
/*!40000 ALTER TABLE `exams` DISABLE KEYS */;
/*!40000 ALTER TABLE `exams` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `forum_categorias`
--

LOCK TABLES `forum_categorias` WRITE;
/*!40000 ALTER TABLE `forum_categorias` DISABLE KEYS */;
/*!40000 ALTER TABLE `forum_categorias` ENABLE KEYS */;
UNLOCK TABLES;

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
  `tipoEara` enum('ESTUDO','APLICACAO','REVISAO','ADAPTACAO') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_ativa` tinyint(1) DEFAULT '1',
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_categories_ordem` (`ordem`),
  KEY `idx_categories_ativa` (`is_ativa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forum_categories`
--

LOCK TABLES `forum_categories` WRITE;
/*!40000 ALTER TABLE `forum_categories` DISABLE KEYS */;
INSERT INTO `forum_categories` VALUES ('9f333791-be47-11f0-b544-a2aa05cbddca','ESTUDO','Dúvidas teóricas, conceitos, legislação e teoria','📖','#3B82F6',1,'ESTUDO',1,'2025-11-10 15:12:07','2025-11-10 15:12:07'),('9f333bed-be47-11f0-b544-a2aa05cbddca','APLICAÇÃO','Resolução de questões e dúvidas práticas sobre como aplicar o conhecimento','✏️','#10B981',2,'APLICACAO',1,'2025-11-10 15:12:07','2025-11-10 15:12:07'),('9f333c92-be47-11f0-b544-a2aa05cbddca','REVISÃO','Fixação do conteúdo, técnicas de memorização, resumos e mapas mentais','🔄','#F59E0B',3,'REVISAO',1,'2025-11-10 15:12:07','2025-11-10 15:12:07'),('9f333d10-be47-11f0-b544-a2aa05cbddca','ADAPTAÇÃO','Registros, estatísticas, crescimento, evolução e dúvidas sobre planejamento','📈','#8B5CF6',4,'ADAPTACAO',1,'2025-11-10 15:12:07','2025-11-10 15:12:07');
/*!40000 ALTER TABLE `forum_categories` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `forum_domain_whitelist`
--

LOCK TABLES `forum_domain_whitelist` WRITE;
/*!40000 ALTER TABLE `forum_domain_whitelist` DISABLE KEYS */;
/*!40000 ALTER TABLE `forum_domain_whitelist` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `forum_message_edits`
--

LOCK TABLES `forum_message_edits` WRITE;
/*!40000 ALTER TABLE `forum_message_edits` DISABLE KEYS */;
/*!40000 ALTER TABLE `forum_message_edits` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `forum_message_upvotes`
--

LOCK TABLES `forum_message_upvotes` WRITE;
/*!40000 ALTER TABLE `forum_message_upvotes` DISABLE KEYS */;
/*!40000 ALTER TABLE `forum_message_upvotes` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `forum_messages`
--

LOCK TABLES `forum_messages` WRITE;
/*!40000 ALTER TABLE `forum_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `forum_messages` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `forum_moderation_queue`
--

LOCK TABLES `forum_moderation_queue` WRITE;
/*!40000 ALTER TABLE `forum_moderation_queue` DISABLE KEYS */;
/*!40000 ALTER TABLE `forum_moderation_queue` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `forum_notifications`
--

LOCK TABLES `forum_notifications` WRITE;
/*!40000 ALTER TABLE `forum_notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `forum_notifications` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `forum_respostas`
--

LOCK TABLES `forum_respostas` WRITE;
/*!40000 ALTER TABLE `forum_respostas` DISABLE KEYS */;
/*!40000 ALTER TABLE `forum_respostas` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `forum_thread_edits`
--

LOCK TABLES `forum_thread_edits` WRITE;
/*!40000 ALTER TABLE `forum_thread_edits` DISABLE KEYS */;
/*!40000 ALTER TABLE `forum_thread_edits` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `forum_thread_favorites`
--

LOCK TABLES `forum_thread_favorites` WRITE;
/*!40000 ALTER TABLE `forum_thread_favorites` DISABLE KEYS */;
/*!40000 ALTER TABLE `forum_thread_favorites` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `forum_thread_followers`
--

LOCK TABLES `forum_thread_followers` WRITE;
/*!40000 ALTER TABLE `forum_thread_followers` DISABLE KEYS */;
/*!40000 ALTER TABLE `forum_thread_followers` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `forum_threads`
--

LOCK TABLES `forum_threads` WRITE;
/*!40000 ALTER TABLE `forum_threads` DISABLE KEYS */;
INSERT INTO `forum_threads` VALUES ('0c007c0b-511c-44bf-942b-cce6d37d9110','asdfadfasf','adfasdfasdfasdfaafsdf','275e32d2-e8a9-41ac-b866-59c121946867','9f333791-be47-11f0-b544-a2aa05cbddca',NULL,0,0,1,0,'2025-11-10 18:51:08','2025-11-10 18:51:08',NULL,'ativo',NULL,NULL),('3b3755b7-ef43-4766-a0f8-29c3e734436e','testestestest','testestestesttestestesste','275e32d2-e8a9-41ac-b866-59c121946867','9f333791-be47-11f0-b544-a2aa05cbddca',NULL,0,0,1,0,'2025-11-11 15:11:22','2025-11-11 15:11:22',NULL,'ativo',NULL,NULL),('491d08e8-58d1-468f-a0a6-c1cdc62b3126','asdfasdfas','dfasdfasdfasdasdfasdfs','275e32d2-e8a9-41ac-b866-59c121946867','9f333791-be47-11f0-b544-a2aa05cbddca',NULL,0,0,1,0,'2025-11-10 18:51:57','2025-11-10 18:51:57',NULL,'ativo',NULL,NULL),('5a4e7a49-e06f-4fb6-abbf-7255c9329ef7','Como estudar blablabla','Teste 1 de conteúdo para sabermos se está funcionando','f2f37fab-a82a-482f-a00a-7bebaf186301','9f333791-be47-11f0-b544-a2aa05cbddca',NULL,0,0,0,0,'2025-11-10 17:57:24','2025-11-10 17:57:24',NULL,'ativo',NULL,NULL),('5c44a684-2789-4b41-8983-c6a086089254','testestestes','testestsetsetestestests','10d27c7c-be70-11f0-b544-a2aa05cbddca','9f333791-be47-11f0-b544-a2aa05cbddca',NULL,0,0,1,0,'2025-11-11 15:21:06','2025-11-11 15:21:06',NULL,'ativo',NULL,NULL),('63f74430-4d77-495f-bcfe-6545d0688640','tratalalalalala','aslkdfalksdfja aslkdjf alsdfk sldkfjas ldfkajs dflaksdjf aslkdfja f','f2f37fab-a82a-482f-a00a-7bebaf186301','9f333791-be47-11f0-b544-a2aa05cbddca',NULL,0,0,0,0,'2025-11-10 17:58:14','2025-11-10 17:58:14',NULL,'ativo',NULL,NULL),('be4c4e1a-bd6a-4a68-9a65-4addb2022ba7','asdfasdfasdfasdf','asdfasdfasdfasdfasdfasdfasdf','275e32d2-e8a9-41ac-b866-59c121946867','9f333791-be47-11f0-b544-a2aa05cbddca',NULL,0,0,1,0,'2025-11-10 19:54:21','2025-11-10 19:54:21',NULL,'ativo',NULL,NULL),('c8b84248-9994-4432-a50d-a447246ae88b','sadfasdfasf','asdfasf adf asd fas df asdf as dfas dfas','f2f37fab-a82a-482f-a00a-7bebaf186301','9f333791-be47-11f0-b544-a2aa05cbddca',NULL,0,0,1,0,'2025-11-10 18:11:21','2025-11-10 18:11:21',NULL,'ativo',NULL,NULL),('caac87e9-7733-4361-ba7a-ff306dfafbb1','asdfasdfasdf','asdfasdfasdfasdfasdf','275e32d2-e8a9-41ac-b866-59c121946867','9f333791-be47-11f0-b544-a2aa05cbddca',NULL,0,0,1,0,'2025-11-10 19:30:58','2025-11-10 19:30:58',NULL,'ativo',NULL,NULL),('d7f117d2-8a34-47f1-a73a-4f0b47d2877c','testestesteste','testestestestesteste','275e32d2-e8a9-41ac-b866-59c121946867','9f333791-be47-11f0-b544-a2aa05cbddca',NULL,0,0,1,0,'2025-11-11 14:10:08','2025-11-11 14:10:08',NULL,'ativo',NULL,NULL),('e82c8cc5-caad-4cc1-a55c-f13bad8334ad','sadfasdfasdf','asdfasdfasdfasdfasdf','275e32d2-e8a9-41ac-b866-59c121946867','9f333791-be47-11f0-b544-a2aa05cbddca',NULL,0,0,1,0,'2025-11-10 18:50:40','2025-11-10 18:50:40',NULL,'ativo',NULL,NULL);
/*!40000 ALTER TABLE `forum_threads` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `forum_topicos`
--

LOCK TABLES `forum_topicos` WRITE;
/*!40000 ALTER TABLE `forum_topicos` DISABLE KEYS */;
/*!40000 ALTER TABLE `forum_topicos` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `forum_upvotes`
--

LOCK TABLES `forum_upvotes` WRITE;
/*!40000 ALTER TABLE `forum_upvotes` DISABLE KEYS */;
/*!40000 ALTER TABLE `forum_upvotes` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `forum_user_suspensions`
--

LOCK TABLES `forum_user_suspensions` WRITE;
/*!40000 ALTER TABLE `forum_user_suspensions` DISABLE KEYS */;
/*!40000 ALTER TABLE `forum_user_suspensions` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `gamification_achievements`
--

LOCK TABLES `gamification_achievements` WRITE;
/*!40000 ALTER TABLE `gamification_achievements` DISABLE KEYS */;
/*!40000 ALTER TABLE `gamification_achievements` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `gamification_xp`
--

LOCK TABLES `gamification_xp` WRITE;
/*!40000 ALTER TABLE `gamification_xp` DISABLE KEYS */;
/*!40000 ALTER TABLE `gamification_xp` ENABLE KEYS */;
UNLOCK TABLES;

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
  KEY `materiais_owner_id_users_id_fk` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `materiais`
--

LOCK TABLES `materiais` WRITE;
/*!40000 ALTER TABLE `materiais` DISABLE KEYS */;
/*!40000 ALTER TABLE `materiais` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `materiais_acessos`
--

LOCK TABLES `materiais_acessos` WRITE;
/*!40000 ALTER TABLE `materiais_acessos` DISABLE KEYS */;
/*!40000 ALTER TABLE `materiais_acessos` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `materiais_estudados`
--

LOCK TABLES `materiais_estudados` WRITE;
/*!40000 ALTER TABLE `materiais_estudados` DISABLE KEYS */;
/*!40000 ALTER TABLE `materiais_estudados` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `materialComments`
--

LOCK TABLES `materialComments` WRITE;
/*!40000 ALTER TABLE `materialComments` DISABLE KEYS */;
/*!40000 ALTER TABLE `materialComments` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `materialDownloads`
--

LOCK TABLES `materialDownloads` WRITE;
/*!40000 ALTER TABLE `materialDownloads` DISABLE KEYS */;
/*!40000 ALTER TABLE `materialDownloads` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `materialFavorites`
--

LOCK TABLES `materialFavorites` WRITE;
/*!40000 ALTER TABLE `materialFavorites` DISABLE KEYS */;
/*!40000 ALTER TABLE `materialFavorites` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `materialItems`
--

LOCK TABLES `materialItems` WRITE;
/*!40000 ALTER TABLE `materialItems` DISABLE KEYS */;
/*!40000 ALTER TABLE `materialItems` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `materialLinks`
--

LOCK TABLES `materialLinks` WRITE;
/*!40000 ALTER TABLE `materialLinks` DISABLE KEYS */;
/*!40000 ALTER TABLE `materialLinks` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `materialRatings`
--

LOCK TABLES `materialRatings` WRITE;
/*!40000 ALTER TABLE `materialRatings` DISABLE KEYS */;
/*!40000 ALTER TABLE `materialRatings` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `materialSeenMarks`
--

LOCK TABLES `materialSeenMarks` WRITE;
/*!40000 ALTER TABLE `materialSeenMarks` DISABLE KEYS */;
/*!40000 ALTER TABLE `materialSeenMarks` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `materialUpvotes`
--

LOCK TABLES `materialUpvotes` WRITE;
/*!40000 ALTER TABLE `materialUpvotes` DISABLE KEYS */;
/*!40000 ALTER TABLE `materialUpvotes` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `materialViews`
--

LOCK TABLES `materialViews` WRITE;
/*!40000 ALTER TABLE `materialViews` DISABLE KEYS */;
/*!40000 ALTER TABLE `materialViews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `material_ratings`
--

DROP TABLE IF EXISTS `material_ratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_ratings` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `material_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` int NOT NULL,
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_material` (`user_id`,`material_id`),
  KEY `idx_material_id` (`material_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_rating` (`rating`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_ratings`
--

LOCK TABLES `material_ratings` WRITE;
/*!40000 ALTER TABLE `material_ratings` DISABLE KEYS */;
/*!40000 ALTER TABLE `material_ratings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `material_votes`
--

DROP TABLE IF EXISTS `material_votes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_votes` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `material_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `vote_type` enum('up','down') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_material` (`user_id`,`material_id`),
  KEY `idx_material_id` (`material_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_votes`
--

LOCK TABLES `material_votes` WRITE;
/*!40000 ALTER TABLE `material_votes` DISABLE KEYS */;
/*!40000 ALTER TABLE `material_votes` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `materials`
--

LOCK TABLES `materials` WRITE;
/*!40000 ALTER TABLE `materials` DISABLE KEYS */;
/*!40000 ALTER TABLE `materials` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `metas`
--

LOCK TABLES `metas` WRITE;
/*!40000 ALTER TABLE `metas` DISABLE KEYS */;
/*!40000 ALTER TABLE `metas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `metas_batch_imports`
--

DROP TABLE IF EXISTS `metas_batch_imports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `metas_batch_imports` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `plano_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_rows` int NOT NULL,
  `created_count` int NOT NULL,
  `duplicated_count` int NOT NULL,
  `invalid_count` int NOT NULL,
  `errors` json DEFAULT NULL,
  `uploaded_by_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `metas_batch_imports`
--

LOCK TABLES `metas_batch_imports` WRITE;
/*!40000 ALTER TABLE `metas_batch_imports` DISABLE KEYS */;
/*!40000 ALTER TABLE `metas_batch_imports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `metas_cronograma`
--

DROP TABLE IF EXISTS `metas_cronograma`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `metas_cronograma` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `plano_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `meta_number_base` int NOT NULL,
  `meta_number_suffix` int DEFAULT NULL,
  `display_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_key` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ktree_disciplina_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ktree_assunto_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ktree_topico_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ktree_subtopico_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `incidencia` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'NA',
  `duracao_planejada_min` int NOT NULL,
  `duracao_real_sec` int DEFAULT '0',
  `scheduled_date` date NOT NULL,
  `scheduled_order` int NOT NULL,
  `scheduled_at_utc` timestamp NULL DEFAULT NULL,
  `status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDENTE',
  `concluded_at_utc` timestamp NULL DEFAULT NULL,
  `orientacoes_estudo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `fixed` tinyint(1) DEFAULT '0',
  `auto_generated` tinyint(1) DEFAULT '0',
  `parent_meta_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `omitted` tinyint(1) DEFAULT '0',
  `omission_reason` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `row_hash` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `criado_por_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `fixed_rule_json` json DEFAULT NULL,
  `review_config_json` json DEFAULT NULL,
  `sequence_label` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `original_meta_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `omitted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_mcron_display_number` (`plano_id`,`display_number`),
  KEY `idx_mcron_plan_schedule` (`plano_id`,`scheduled_date`,`scheduled_order`),
  KEY `idx_mcron_plan_status` (`plano_id`,`status`,`omitted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `metas_cronograma`
--

LOCK TABLES `metas_cronograma` WRITE;
/*!40000 ALTER TABLE `metas_cronograma` DISABLE KEYS */;
/*!40000 ALTER TABLE `metas_cronograma` ENABLE KEYS */;
UNLOCK TABLES;

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
  KEY `metas_cronograma_materiais_material_id_materiais_id_fk` (`material_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `metas_cronograma_materiais`
--

LOCK TABLES `metas_cronograma_materiais` WRITE;
/*!40000 ALTER TABLE `metas_cronograma_materiais` DISABLE KEYS */;
/*!40000 ALTER TABLE `metas_cronograma_materiais` ENABLE KEYS */;
UNLOCK TABLES;

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
  KEY `metas_cronograma_questoes_questao_id_questoes_id_fk` (`questao_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `metas_cronograma_questoes`
--

LOCK TABLES `metas_cronograma_questoes` WRITE;
/*!40000 ALTER TABLE `metas_cronograma_questoes` DISABLE KEYS */;
/*!40000 ALTER TABLE `metas_cronograma_questoes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `metas_materiais`
--

DROP TABLE IF EXISTS `metas_materiais`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `metas_materiais` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `meta_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `material_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_meta_material` (`meta_id`,`material_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `metas_materiais`
--

LOCK TABLES `metas_materiais` WRITE;
/*!40000 ALTER TABLE `metas_materiais` DISABLE KEYS */;
/*!40000 ALTER TABLE `metas_materiais` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `metas_planos_estudo`
--

DROP TABLE IF EXISTS `metas_planos_estudo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `metas_planos_estudo` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuario_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `titulo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `horas_por_dia` decimal(4,2) NOT NULL,
  `dias_disponiveis_bitmask` int NOT NULL DEFAULT '31',
  `data_inicio` date NOT NULL,
  `data_fim` date DEFAULT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ativo',
  `criado_por_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_mplanos_usuario` (`usuario_id`),
  KEY `idx_mplanos_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `metas_planos_estudo`
--

LOCK TABLES `metas_planos_estudo` WRITE;
/*!40000 ALTER TABLE `metas_planos_estudo` DISABLE KEYS */;
INSERT INTO `metas_planos_estudo` VALUES ('161a16b6-0d28-432f-8417-8ce5304943ba','10d27c7c-be70-11f0-b544-a2aa05cbddca','teste Câmara dos Deputados ',NULL,4.00,62,'2025-11-11',NULL,'ATIVO','10d27c7c-be70-11f0-b544-a2aa05cbddca','2025-11-11 04:04:09','2025-11-11 04:04:09'),('173c4b1b-cee5-40c1-9e6a-f7456f0d804d','10d27c7c-be70-11f0-b544-a2aa05cbddca','Teste - Câmara dos DeputaCâmara dos Deputados',NULL,2.50,62,'2025-11-11',NULL,'ATIVO','10d27c7c-be70-11f0-b544-a2aa05cbddca','2025-11-11 15:48:24','2025-11-11 15:48:24'),('2a7a57ce-e631-4450-b8ed-3a953a1e8fd3','10d27c7c-be70-11f0-b544-a2aa05cbddca','TEste plano 1',NULL,4.00,62,'2025-11-11',NULL,'ATIVO','10d27c7c-be70-11f0-b544-a2aa05cbddca','2025-11-11 12:40:23','2025-11-11 12:40:23'),('39ef0ec2-89f9-4ce8-abda-28731ecc8ac3','10d27c7c-be70-11f0-b544-a2aa05cbddca','teste Câmara dos Deputados ',NULL,4.00,62,'2025-11-11',NULL,'ATIVO','10d27c7c-be70-11f0-b544-a2aa05cbddca','2025-11-11 04:04:42','2025-11-11 04:04:42'),('5b26e4f9-6877-4544-851d-81ee6658429b','10d27c7c-be70-11f0-b544-a2aa05cbddca','Teste 2 Câmara dos Deputados ',NULL,4.00,62,'2025-11-11',NULL,'ATIVO','10d27c7c-be70-11f0-b544-a2aa05cbddca','2025-11-11 14:21:52','2025-11-11 14:21:52'),('8760398e-d02b-4cc5-8404-b3babb8d4a0b','10d27c7c-be70-11f0-b544-a2aa05cbddca','Teste 1 Câmara dos Deputados ',NULL,4.00,62,'2025-11-11',NULL,'ATIVO','10d27c7c-be70-11f0-b544-a2aa05cbddca','2025-11-11 04:38:06','2025-11-11 04:38:06'),('97234487-18d2-4721-8a8f-fbe9af2b3dc0','10d27c7c-be70-11f0-b544-a2aa05cbddca','teste',NULL,4.00,62,'2025-11-11',NULL,'ATIVO','10d27c7c-be70-11f0-b544-a2aa05cbddca','2025-11-11 03:24:07','2025-11-11 03:24:07'),('a3d9fcfe-1920-4e9d-ac4a-ac13e2f85064','10d27c7c-be70-11f0-b544-a2aa05cbddca','teste2',NULL,4.00,62,'2025-11-11',NULL,'ATIVO','10d27c7c-be70-11f0-b544-a2aa05cbddca','2025-11-11 03:24:19','2025-11-11 03:24:19'),('b676a055-5244-4fea-a2f5-5558cfc7af30','10d27c7c-be70-11f0-b544-a2aa05cbddca','Câmara dos Deputados - Analista de Registro e Redação - Pré-edital',NULL,4.00,62,'2025-11-11',NULL,'ATIVO','10d27c7c-be70-11f0-b544-a2aa05cbddca','2025-11-11 03:44:39','2025-11-11 03:44:39'),('e58405d1-e0b2-4ae6-8ca6-8d4503d30612','10d27c7c-be70-11f0-b544-a2aa05cbddca','Teste Câmara dos Deputados ',NULL,4.00,62,'2025-11-11',NULL,'ATIVO','10d27c7c-be70-11f0-b544-a2aa05cbddca','2025-11-11 14:21:36','2025-11-11 14:21:36'),('f421164b-7832-42a2-bed8-e1ee5eeff1c7','10d27c7c-be70-11f0-b544-a2aa05cbddca','Teste Câmara dos Deputados ',NULL,4.00,62,'2025-11-11',NULL,'ATIVO','10d27c7c-be70-11f0-b544-a2aa05cbddca','2025-11-11 15:17:22','2025-11-11 15:17:22');
/*!40000 ALTER TABLE `metas_planos_estudo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `metas_questoes`
--

DROP TABLE IF EXISTS `metas_questoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `metas_questoes` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `meta_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `questao_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_meta_questao` (`meta_id`,`questao_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `metas_questoes`
--

LOCK TABLES `metas_questoes` WRITE;
/*!40000 ALTER TABLE `metas_questoes` DISABLE KEYS */;
/*!40000 ALTER TABLE `metas_questoes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notice_reads`
--

DROP TABLE IF EXISTS `notice_reads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notice_reads` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `notice_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `lido` tinyint(1) NOT NULL DEFAULT '1',
  `lido_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notice_id` (`notice_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_unique_read` (`notice_id`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notice_reads`
--

LOCK TABLES `notice_reads` WRITE;
/*!40000 ALTER TABLE `notice_reads` DISABLE KEYS */;
/*!40000 ALTER TABLE `notice_reads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notices`
--

DROP TABLE IF EXISTS `notices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notices` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `titulo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `conteudo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('INFO','ALERTA','URGENTE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INFO',
  `publicado` tinyint(1) NOT NULL DEFAULT '0',
  `data_publicacao` timestamp NULL DEFAULT NULL,
  `created_by` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_publicado` (`publicado`),
  KEY `idx_data_publicacao` (`data_publicacao`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notices`
--

LOCK TABLES `notices` WRITE;
/*!40000 ALTER TABLE `notices` DISABLE KEYS */;
/*!40000 ALTER TABLE `notices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pagamentos`
--

DROP TABLE IF EXISTS `pagamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagamentos` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `assinatura_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `status` enum('PENDENTE','PAGO','CANCELADO','ESTORNADO','FALHOU') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDENTE',
  `metodo_pagamento` enum('CREDIT_CARD','BOLETO','PIX') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `pagarme_transaction_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pagarme_charge_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `data_vencimento` date DEFAULT NULL,
  `data_pagamento` timestamp NULL DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_assinatura_id` (`assinatura_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_pagarme_transaction` (`pagarme_transaction_id`),
  KEY `idx_pagarme_charge` (`pagarme_charge_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagamentos`
--

LOCK TABLES `pagamentos` WRITE;
/*!40000 ALTER TABLE `pagamentos` DISABLE KEYS */;
/*!40000 ALTER TABLE `pagamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plan_disciplines`
--

DROP TABLE IF EXISTS `plan_disciplines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plan_disciplines` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `plan_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `discipline_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_plan_discipline` (`plan_id`,`discipline_id`),
  KEY `idx_plan_id` (`plan_id`),
  KEY `idx_discipline_id` (`discipline_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plan_disciplines`
--

LOCK TABLES `plan_disciplines` WRITE;
/*!40000 ALTER TABLE `plan_disciplines` DISABLE KEYS */;
/*!40000 ALTER TABLE `plan_disciplines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plan_enrollments`
--

DROP TABLE IF EXISTS `plan_enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plan_enrollments` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `plan_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('Ativo','Expirado','Cancelado','Suspenso') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Ativo',
  `enrolled_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` datetime DEFAULT NULL,
  `progress_percentage` int NOT NULL DEFAULT '0',
  `custom_settings` json DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_plan` (`user_id`,`plan_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_plan_id` (`plan_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plan_enrollments`
--

LOCK TABLES `plan_enrollments` WRITE;
/*!40000 ALTER TABLE `plan_enrollments` DISABLE KEYS */;
/*!40000 ALTER TABLE `plan_enrollments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `planos`
--

DROP TABLE IF EXISTS `planos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `planos` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `preco` decimal(10,2) NOT NULL,
  `duracao_meses` int NOT NULL,
  `recursos` json NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `destaque` tinyint(1) NOT NULL DEFAULT '0',
  `ordem` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ativo` (`ativo`),
  KEY `idx_ordem` (`ordem`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `planos`
--

LOCK TABLES `planos` WRITE;
/*!40000 ALTER TABLE `planos` DISABLE KEYS */;
/*!40000 ALTER TABLE `planos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `planos_estudo`
--

DROP TABLE IF EXISTS `planos_estudo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `planos_estudo` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuario_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `titulo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `horas_por_dia` decimal(4,2) NOT NULL,
  `dias_disponiveis_bitmask` int NOT NULL DEFAULT '31',
  `data_inicio` date NOT NULL,
  `data_fim` date DEFAULT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ativo',
  `criado_por_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_planos_usuario` (`usuario_id`),
  KEY `idx_planos_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `planos_estudo`
--

LOCK TABLES `planos_estudo` WRITE;
/*!40000 ALTER TABLE `planos_estudo` DISABLE KEYS */;
/*!40000 ALTER TABLE `planos_estudo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plans`
--

DROP TABLE IF EXISTS `plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plans` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `category` enum('Pago','Gratuito') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `edital_status` enum('Pré-edital','Pós-edital','N/A') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'N/A',
  `featured_image_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `price` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `landing_page_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `duration_days` int DEFAULT NULL,
  `validity_date` datetime DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `is_hidden` tinyint(1) NOT NULL DEFAULT '0',
  `mentor_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_category` (`category`),
  KEY `idx_edital_status` (`edital_status`),
  KEY `idx_is_featured` (`is_featured`),
  KEY `idx_is_hidden` (`is_hidden`),
  KEY `idx_plans_is_hidden` (`is_hidden`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plans`
--

LOCK TABLES `plans` WRITE;
/*!40000 ALTER TABLE `plans` DISABLE KEYS */;
/*!40000 ALTER TABLE `plans` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `progresso_assuntos`
--

LOCK TABLES `progresso_assuntos` WRITE;
/*!40000 ALTER TABLE `progresso_assuntos` DISABLE KEYS */;
/*!40000 ALTER TABLE `progresso_assuntos` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `progresso_disciplinas`
--

LOCK TABLES `progresso_disciplinas` WRITE;
/*!40000 ALTER TABLE `progresso_disciplinas` DISABLE KEYS */;
/*!40000 ALTER TABLE `progresso_disciplinas` ENABLE KEYS */;
UNLOCK TABLES;

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
  KEY `userQuestionIdx` (`userId`,`questionId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questionAttempts`
--

LOCK TABLES `questionAttempts` WRITE;
/*!40000 ALTER TABLE `questionAttempts` DISABLE KEYS */;
/*!40000 ALTER TABLE `questionAttempts` ENABLE KEYS */;
UNLOCK TABLES;

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
  CONSTRAINT `questionComments_parentId_questionComments_id_fk` FOREIGN KEY (`parentId`) REFERENCES `questionComments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questionComments`
--

LOCK TABLES `questionComments` WRITE;
/*!40000 ALTER TABLE `questionComments` DISABLE KEYS */;
/*!40000 ALTER TABLE `questionComments` ENABLE KEYS */;
UNLOCK TABLES;

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
  KEY `userIdx` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questionFlags`
--

LOCK TABLES `questionFlags` WRITE;
/*!40000 ALTER TABLE `questionFlags` DISABLE KEYS */;
/*!40000 ALTER TABLE `questionFlags` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES (1,'QMHU387Y5U88P','39073999-54d3-41f6-b69f-adf2f88530b8','faa5fe72-498a-438a-b91a-44d29ad24a5d','d94da65d-0e43-4091-bb95-9ec581bb35a1','Teste Questão',NULL,'true_false',NULL,NULL,NULL,NULL,NULL,NULL,1,'TEst resposta',NULL,'Cebraspe',2024,'Agente da PF','medium',0,0,NULL,1,'2025-11-11 04:45:17','2025-11-11 04:45:17');
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questoes`
--

DROP TABLE IF EXISTS `questoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questoes` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `enunciado` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `alternativas` json NOT NULL,
  `gabarito` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `disciplina_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `assunto_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `topico_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `banca` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ano` int DEFAULT NULL,
  `dificuldade` enum('FACIL','MEDIO','DIFICIL') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `explicacao` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_disciplina_id` (`disciplina_id`),
  KEY `idx_assunto_id` (`assunto_id`),
  KEY `idx_topico_id` (`topico_id`),
  KEY `idx_banca` (`banca`),
  KEY `idx_ano` (`ano`),
  KEY `idx_dificuldade` (`dificuldade`),
  KEY `idx_ativo` (`ativo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questoes`
--

LOCK TABLES `questoes` WRITE;
/*!40000 ALTER TABLE `questoes` DISABLE KEYS */;
/*!40000 ALTER TABLE `questoes` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `questoes_resolvidas`
--

LOCK TABLES `questoes_resolvidas` WRITE;
/*!40000 ALTER TABLE `questoes_resolvidas` DISABLE KEYS */;
/*!40000 ALTER TABLE `questoes_resolvidas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token_hash` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `revoked` tinyint(1) NOT NULL DEFAULT '0',
  `dispositivo_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_token_hash` (`token_hash`),
  UNIQUE KEY `token_hash` (`token_hash`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
INSERT INTO `refresh_tokens` VALUES ('05dd7e1b-a0c3-4b98-8e5e-3afaa7579054','10d27c7c-be70-11f0-b544-a2aa05cbddca','2b165e076ebaf49361168c6c7d82b8fbe299c07776d0d80e975088a2058914c3','2025-11-18 01:28:31',0,NULL,'::ffff:100.64.0.4','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','2025-11-11 01:28:31'),('07ce3d1d-98a2-490b-a9f7-be53295ecfed','10d27c7c-be70-11f0-b544-a2aa05cbddca','85b7a0170784b6147f46a31dc5f6cd3105a8a780bd77ae0a950dec6953f79183','2025-11-18 01:16:35',0,NULL,'::ffff:100.64.0.2','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','2025-11-11 01:16:35'),('1619169d-2e34-46df-b377-942abc6eeed9','f2f37fab-a82a-482f-a00a-7bebaf186301','8616a4736f166c3f28cf920b186f0e402d42a070664e8d6733e50294344fd608','2025-11-17 17:56:02',0,NULL,'::ffff:100.64.0.2','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-10 17:56:01'),('1788e550-b521-48d8-afa5-1fb3da95d1f1','10d27c7c-be70-11f0-b544-a2aa05cbddca','193b8ee28e181aa5b6c0a8625a6d103eb6db971c48c542a99791a2f12f2b4433','2025-11-18 14:30:35',0,NULL,'::ffff:100.64.0.2','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-11 14:30:34'),('18f3e85a-5548-4da5-a5af-337eced4d8c9','10d27c7c-be70-11f0-b544-a2aa05cbddca','fbc0c956a225197ebaf410501f8a7615dcb19127e9e9693ff122f83c57650026','2025-11-17 23:54:59',0,NULL,'::ffff:100.64.0.2','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','2025-11-10 23:54:58'),('1a6c18f3-06bf-4ddd-bcbf-de87ffbb6eeb','10d27c7c-be70-11f0-b544-a2aa05cbddca','01a450e573c212f8160e38156c4ef680a17e6c57722f0a8f63627831041134b4','2025-11-18 12:48:13',0,NULL,'::ffff:100.64.0.3','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-11 12:48:13'),('1c5529e2-ec41-41f8-9b94-dd3887691603','10d27c7c-be70-11f0-b544-a2aa05cbddca','1036c7adb53c2e1c5b92409212a91a5416a425fc72bd1f635317f4f363f37637','2025-11-18 04:10:07',0,NULL,'::ffff:100.64.0.7','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','2025-11-11 04:10:06'),('1fdbcc9c-1a08-4619-9def-43dc06dce5b3','f2f37fab-a82a-482f-a00a-7bebaf186301','c88ab1c55235f068ae9ec4f58c8cb255f698e7d41740f9e3084bd394b9b7df3f','2025-11-17 18:11:07',0,NULL,'::ffff:100.64.0.2','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-10 18:11:06'),('263d1b37-e145-466b-b219-73e2ced1d0fe','f2f37fab-a82a-482f-a00a-7bebaf186301','a92eed329db391c3a58eb5e6bee341e936fc0b950ca303ce2d659c759978441e','2025-11-17 17:04:10',0,NULL,'::ffff:100.64.0.4','Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1','2025-11-10 17:04:10'),('2c983a19-8069-448a-9476-f4a152f91153','10d27c7c-be70-11f0-b544-a2aa05cbddca','102d4314e4c481bf7cfdc7e11d0ebd3c4d41bcd5bf24dbc398a6a6db54d95a85','2025-11-18 12:45:00',0,NULL,'::ffff:100.64.0.3','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-11 12:44:59'),('353df158-9629-4d4f-90c7-c83934d7eda6','10d27c7c-be70-11f0-b544-a2aa05cbddca','aa731b70ab2ef3c210a2f7c1f8ba57b4103e31c8be344a9e2ca33a860d7fc0b7','2025-11-17 23:55:43',0,NULL,'::ffff:100.64.0.5','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','2025-11-10 23:55:42'),('3825fdfa-f4ce-4311-a852-699455df8a3e','10d27c7c-be70-11f0-b544-a2aa05cbddca','336ca5a2c4cde1ad6ee1b9d1b9f330f0138294b68b9d9d36f135ab857035ff04','2025-11-18 15:19:09',0,NULL,'::ffff:100.64.0.4','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-11 15:19:09'),('3b12ac38-7fd4-4452-a44b-36442fba8dc2','10d27c7c-be70-11f0-b544-a2aa05cbddca','93068b476f6ba011f8d92c1659dd37eb1bb37aaaba8d2aa659c7f175711dbcbf','2025-11-18 03:26:52',0,NULL,'::ffff:100.64.0.7','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','2025-11-11 03:26:52'),('3c1b3250-5b85-44f0-9628-5687c0e9dcb0','10d27c7c-be70-11f0-b544-a2aa05cbddca','139a33a536d2e6be12badd30d0413e12363d35342a9fc457b8bba4d0f49615ad','2025-11-18 03:46:55',0,NULL,'::ffff:100.64.0.6','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','2025-11-11 03:46:55'),('44d421ef-35f7-479b-b161-65bb2dd0905e','10d27c7c-be70-11f0-b544-a2aa05cbddca','e8d1dee780be39c2389b43a5361f144f136f5e55902ee6ace1c8a7987a9f0812','2025-11-18 04:37:34',0,NULL,'::ffff:100.64.0.2','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-11 04:37:33'),('497bb271-eb00-4bae-8a41-d84ef3d50550','10d27c7c-be70-11f0-b544-a2aa05cbddca','bf4a26b71f295141fd05b1e257e5b0dd1a685b3f15c2c240799fd40ae7a4e1b0','2025-11-18 03:23:08',0,NULL,'::ffff:100.64.0.5','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','2025-11-11 03:23:07'),('4c65061c-f6de-48b8-8132-610de977c8d6','10d27c7c-be70-11f0-b544-a2aa05cbddca','b443554f63b555eaf3bba806e3510398146d9e0dedcb5b49b921e8125c4f1820','2025-11-17 23:06:46',0,NULL,'::ffff:100.64.0.2','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','2025-11-10 23:06:45'),('4e143b44-a063-4ec4-aee8-401ef895acd1','10d27c7c-be70-11f0-b544-a2aa05cbddca','09a1fdc6a6af356a3f9020ab9919414c13f9e053d37fc92dfb756f0391e5b452','2025-11-17 23:03:48',0,NULL,'::ffff:100.64.0.2','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','2025-11-10 23:03:47'),('4f78070e-4663-412c-b363-7529fa09238f','275e32d2-e8a9-41ac-b866-59c121946867','e3bfc00c38e99beb5ec632a6520af3ff76f2284f37c4566c94e635fdf8c3e403','2025-11-17 19:54:05',0,NULL,'::ffff:100.64.0.2','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-10 19:54:04'),('52fc3fe5-eb7b-4b96-b998-6482a8c46916','f2f37fab-a82a-482f-a00a-7bebaf186301','5faf54c37c631e0a8fa2d0ae8f35bed85a87d2d8c8b85077bd84d913bda8f5cf','2025-11-17 17:30:06',0,NULL,'::ffff:100.64.0.4','Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1','2025-11-10 17:30:05'),('5737df41-d81f-49c9-83b7-dbae842de239','10d27c7c-be70-11f0-b544-a2aa05cbddca','36c6f4ad04f78d843ff1e89fc8415d4e82fdf01efd377d3b0282e4d224a048c6','2025-11-18 03:48:04',0,NULL,'::ffff:100.64.0.9','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','2025-11-11 03:48:03'),('5910e827-b2a7-4b92-8ad8-d282b40952ed','10d27c7c-be70-11f0-b544-a2aa05cbddca','29628afe22701eba6094786800e7f19325512d9bff7a4a2315a239811b2c297c','2025-11-18 01:29:51',0,NULL,'::ffff:100.64.0.4','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','2025-11-11 01:29:51'),('59776aae-c823-4be9-8a26-bd9cbd20d5e1','10d27c7c-be70-11f0-b544-a2aa05cbddca','d895ab14042a6c84924ee7e156b6f6534b5298cb15fffadda059726a447cb8ef','2025-11-18 15:20:25',0,NULL,'::ffff:100.64.0.4','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-11 15:20:24'),('6637f0d1-1ad5-459e-82f3-bb1e2f765d17','10d27c7c-be70-11f0-b544-a2aa05cbddca','62b76c76ba3cc54ffa78c44c173176b77d88ad5af6e9b40e1e4dc9005a2d9921','2025-11-18 02:46:51',0,NULL,'::ffff:100.64.0.3','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','2025-11-11 02:46:51'),('730128fe-99c9-4d40-a4cd-f5a5a4bbde4a','10d27c7c-be70-11f0-b544-a2aa05cbddca','ca3b368764f2bc9bda173579d11312b61aafb510e8ef523142fe700307d99f36','2025-11-18 12:04:55',0,NULL,'::ffff:100.64.0.2','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-11 12:04:55'),('75351e81-e9b7-4418-bd45-7b38010fa15a','10d27c7c-be70-11f0-b544-a2aa05cbddca','8b208c1bda24f01326050ed2674c39a38e6e99e7816867c5e91c16836a9f294b','2025-11-17 22:47:16',0,NULL,'::ffff:100.64.0.7','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','2025-11-10 22:47:16'),('761cb241-adae-40d5-ac15-ede6ee59a305','10d27c7c-be70-11f0-b544-a2aa05cbddca','6e4f8012f1ef0c15c62830368f2ca41b7063e1e9ddff048592fa5377cd7f602b','2025-11-18 02:38:38',0,NULL,'::ffff:100.64.0.3','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','2025-11-11 02:38:38'),('79ea9362-ddb3-4a8d-9d2b-c450167dc0a7','10d27c7c-be70-11f0-b544-a2aa05cbddca','a14d42ffd853330e83b022e3a67363401996939c02a80fccbbdadd529d9e30e3','2025-11-18 03:49:24',0,NULL,'::ffff:100.64.0.3','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','2025-11-11 03:49:23'),('7dc0deeb-3716-4fc5-82fb-ee3e22f2600b','10d27c7c-be70-11f0-b544-a2aa05cbddca','c2b032e51fd0026aa4848b646d9567349b01b89ce7a96529c6014de79fcdcaf5','2025-11-18 15:48:07',0,NULL,'::ffff:100.64.0.2','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-11 15:48:06'),('903ae3d0-db82-4137-8626-957c566e39de','10d27c7c-be70-11f0-b544-a2aa05cbddca','0f5a49b37788fc333c2b685be8bbab3de9904af127cb7af1fc16c25ce204da43','2025-11-18 03:46:54',0,NULL,'::ffff:100.64.0.6','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','2025-11-11 03:46:53'),('921aa59c-032b-4e67-ad24-23d2195247f0','275e32d2-e8a9-41ac-b866-59c121946867','d5ab89a1d71c876be0b4f6b13fac92caddd10f8dfdf691f29ed34e8cde043343','2025-11-18 14:09:02',0,NULL,'::ffff:100.64.0.4','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-11 14:09:01'),('960956aa-9a57-480e-aebd-ae983acf368d','10d27c7c-be70-11f0-b544-a2aa05cbddca','33ec0be21a3cc5b4ee535c1a2c6a4aa62425000c5b04ff6b9a0161ab78d8d8ad','2025-11-17 23:04:23',0,NULL,'::ffff:100.64.0.2','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','2025-11-10 23:04:22'),('9a11e90b-9c09-4e26-ad09-9a527f4cb873','10d27c7c-be70-11f0-b544-a2aa05cbddca','81543ad07882e6bedbfc0179b62ca27092253a3dfa6a38ae7f3a8ed7757b0568','2025-11-17 23:56:18',0,NULL,'::ffff:100.64.0.5','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','2025-11-10 23:56:18'),('9c637488-14ac-45b6-aa44-de0fb8d20c2b','10d27c7c-be70-11f0-b544-a2aa05cbddca','a94de811f3b7d72ef7c403c85f0d594036ca7b2f42c7326ab0086b1d268ebdde','2025-11-18 01:26:36',0,NULL,'::ffff:100.64.0.2','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','2025-11-11 01:26:36'),('9dcb8601-362d-46a6-a875-5819c3746ee4','10d27c7c-be70-11f0-b544-a2aa05cbddca','65cd43188ecabecb717ef33b963966d566a79de3759d902f374a98440dab0cfb','2025-11-17 20:23:35',0,NULL,'::ffff:100.64.0.3','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-10 20:23:34'),('a014e1d6-6d14-428b-88a4-9daa7c219791','10d27c7c-be70-11f0-b544-a2aa05cbddca','7da0b1074f00252226efa998e1923cc5b8adf70fca8525742f0d09c70029392d','2025-11-17 23:56:56',0,NULL,'::ffff:100.64.0.5','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','2025-11-10 23:56:56'),('af9ea5e5-4e7b-451c-b69e-b0fbf1873d7d','10d27c7c-be70-11f0-b544-a2aa05cbddca','5951d1258c89c3c49ccb70fd6a7fac3e91d3f7f7de14b6c7e26996493486eac5','2025-11-17 23:37:07',0,NULL,'::ffff:100.64.0.6','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','2025-11-10 23:37:06'),('b1b874f3-9e97-42eb-bbd4-53e656c121fd','275e32d2-e8a9-41ac-b866-59c121946867','c015b894252ad27b0cad954d82e21c2926398dfea5b468c4220ab590cfe14f7d','2025-11-18 00:06:47',0,NULL,'::ffff:100.64.0.4','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','2025-11-11 00:06:47'),('b1ecd98d-39fa-4d87-a4d0-5719a980a98a','275e32d2-e8a9-41ac-b866-59c121946867','84c8c8b58d43273d9476a85a4c4672fa49bc334f8d8ca67093e6e94e5b1fabe5','2025-11-17 19:44:31',0,NULL,'::ffff:100.64.0.5','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-10 19:44:30'),('b3958ca8-abb7-4763-b9e9-a9fcbedacfbe','10d27c7c-be70-11f0-b544-a2aa05cbddca','e9c8490d57beed64b72a5b20e341a68c6525fb4a7b70d64307dfca6e77d3ce30','2025-11-17 23:17:27',0,NULL,'::ffff:100.64.0.3','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','2025-11-10 23:17:27'),('b94f6767-5b44-42a5-b562-06ea2a002d39','275e32d2-e8a9-41ac-b866-59c121946867','9f75f56d43adaf52db042c125c0b9fef3f9f491051b1d0759d5d525564dada8a','2025-11-17 19:26:57',0,NULL,'::ffff:100.64.0.2','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-10 19:26:56'),('b9f7309c-7a30-4687-ae89-fbac31b54170','f2f37fab-a82a-482f-a00a-7bebaf186301','916bef289115e2f0c2c2f34a483401a84563c1d44f8ef6eda90e4b5f543b1e0c','2025-11-17 15:21:49',0,NULL,'::ffff:100.64.0.3','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-10 15:21:49'),('c2e73c85-3108-4afc-90e2-dec318ce4985','275e32d2-e8a9-41ac-b866-59c121946867','6607e69ad558683f6827bd0c4b5394a46da31cc82955a11eb40ab63573739d00','2025-11-18 15:11:02',0,NULL,'::ffff:100.64.0.3','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-11 15:11:01'),('c356d61a-cd64-4a73-a57d-0b4f876d76bb','f2f37fab-a82a-482f-a00a-7bebaf186301','c06e33f1148f7e5c92f803475bebdcdafca063f79128542babfd2256fb3d5cf1','2025-11-17 15:01:54',0,NULL,'::ffff:100.64.0.2','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-10 15:01:54'),('c3d5a005-b69f-4099-97c5-2035b4f9080b','10d27c7c-be70-11f0-b544-a2aa05cbddca','a10fcd2cf8d7e93164841f7bbb034a9e88270460d250850197da9143c77c2914','2025-11-18 12:40:11',0,NULL,'::ffff:100.64.0.2','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-11 12:40:11'),('c4930848-98f7-4311-b4dd-44fd142ce76f','f2f37fab-a82a-482f-a00a-7bebaf186301','16cefc4d0a84e9e300863ffd2e1187a1e8f5bf66a2c173bb2ca990bc001e3356','2025-11-17 17:28:42',0,NULL,'::ffff:100.64.0.3','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-10 17:28:41'),('c65e92dc-ad3a-47ad-8407-cb9f9056c032','10d27c7c-be70-11f0-b544-a2aa05cbddca','71ec4d6b6b53bf004bcde16c8a20c101df7651c26da05a6b5498b4555a14d544','2025-11-18 03:44:56',0,NULL,'::ffff:100.64.0.6','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','2025-11-11 03:44:56'),('c7563f5f-8ee8-4abe-8889-f81328b84339','10d27c7c-be70-11f0-b544-a2aa05cbddca','f2911e6933408ba88431258bc25ae20f67f9b32fa2b823734af7bb514cc66dba','2025-11-18 01:36:37',0,NULL,'::ffff:100.64.0.6','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','2025-11-11 01:36:37'),('cd5032a4-98e7-4d25-803c-82967ac20ac2','f2f37fab-a82a-482f-a00a-7bebaf186301','d52f4889570e3eb0f94340fb1d9662c7093ed3ce06916b8dd00f1e44bd4f525f','2025-11-17 16:08:20',0,NULL,'::ffff:100.64.0.2','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-10 16:08:19'),('cfda3264-0523-402f-8e80-00514acf2f74','10d27c7c-be70-11f0-b544-a2aa05cbddca','69fe59b2f9c44e794e691b343addb9960d231a3018f768b95ab3822431f15857','2025-11-18 03:19:27',0,NULL,'::ffff:100.64.0.3','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','2025-11-11 03:19:27'),('d1184eea-bac2-48fb-948a-10a24245fed3','10d27c7c-be70-11f0-b544-a2aa05cbddca','49bb3bdaa27a8cf963a0799b6313f6d3f1fb10b7a99dddcbb525f58012b5e5a4','2025-11-18 01:46:38',0,NULL,'::ffff:100.64.0.5','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','2025-11-11 01:46:38'),('d4ee9ecf-0469-413a-80f8-e945c3694158','10d27c7c-be70-11f0-b544-a2aa05cbddca','5e2c6260a1e0b19205ca57262cf6c476b7b38cbe5820881fb3e46f25bc7d0456','2025-11-18 04:39:53',0,NULL,'::ffff:100.64.0.2','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-11 04:39:53'),('d4f79358-2401-449e-9a6a-08ef65dacb68','10d27c7c-be70-11f0-b544-a2aa05cbddca','f09895af96825988893ab54788b002db1c46a64c0679a37a962b6ccf83eef2e1','2025-11-18 03:44:10',0,NULL,'::ffff:100.64.0.2','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','2025-11-11 03:44:09'),('d9925c0d-edfd-450f-bab2-0ebdd7f82208','10d27c7c-be70-11f0-b544-a2aa05cbddca','0d1a09d668b5ca61896b0bbacad57f6f8b50c0e90279ce2e5f1e4acd9266372b','2025-11-18 04:04:31',0,NULL,'::ffff:100.64.0.4','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','2025-11-11 04:04:30'),('dbaa7198-24d1-4279-accf-ba9cda480dd1','f2f37fab-a82a-482f-a00a-7bebaf186301','7bd788ec2c8b11e99216ae209ec1a5b1f397cd64e464c4ab4fde99af354f0357','2025-11-17 19:05:27',0,NULL,'::ffff:100.64.0.2','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-10 19:05:26'),('dbf42433-91de-4115-a23c-8fe36486c2ca','275e32d2-e8a9-41ac-b866-59c121946867','102807b55b95c70ba8a1d336dd52c498aa48812ab0fccfd396ce78f43526d10d','2025-11-17 18:49:04',0,NULL,'::ffff:100.64.0.6','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-10 18:49:04'),('e3d86135-cce4-43d2-80e6-d4056523cc54','10d27c7c-be70-11f0-b544-a2aa05cbddca','4724f84c334bd42d6375aa054392cc85f7c9a13a36b4564b75440da610b8a1a2','2025-11-18 02:36:50',0,NULL,'::ffff:100.64.0.2','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','2025-11-11 02:36:50'),('f01dcc39-54e3-45e9-84b1-9ca3cd470cb1','10d27c7c-be70-11f0-b544-a2aa05cbddca','ae1530276b24196a164e281e2e1bfca245bface209e12677e99d233359636094','2025-11-18 01:30:27',0,NULL,'::ffff:100.64.0.2','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','2025-11-11 01:30:26'),('f08c0074-c1ee-430c-b39c-4652e207ce78','10d27c7c-be70-11f0-b544-a2aa05cbddca','6325fe28e4164c2fce57e6428009d2459bb4fdeff9782762a86d92e2dce9d79b','2025-11-18 03:36:53',0,NULL,'::ffff:100.64.0.4','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','2025-11-11 03:36:53'),('f12efd73-a0c2-4cda-ae71-30f2df82edf9','10d27c7c-be70-11f0-b544-a2aa05cbddca','8ca152c359d03223469267c435f89955bfddd11aa8e5a42d12fd56b57ed7a1e6','2025-11-18 15:21:29',0,NULL,'::ffff:100.64.0.4','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-11 15:21:29'),('f45b448d-c746-4342-a3ac-baa381287ff8','10d27c7c-be70-11f0-b544-a2aa05cbddca','cd3b1990bc4f30a74ba9fe87a70b628343746d0bd9c11a56267814d6ce7c1c5d','2025-11-18 04:32:25',0,NULL,'::ffff:100.64.0.9','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-11 04:32:25'),('f6953e9d-de19-4222-b07c-cc3b8edb919f','10d27c7c-be70-11f0-b544-a2aa05cbddca','3aff9e167bfc7e01abb0c1e8923dc9c07404eed4e0da51302043e70e597f9167','2025-11-18 04:03:55',0,NULL,'::ffff:100.64.0.4','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','2025-11-11 04:03:55'),('f9820a98-832d-40f5-b587-bf4e2c0dc784','10d27c7c-be70-11f0-b544-a2aa05cbddca','e551a2e0e189f7cad9db68d0db9b94dc2c9ef36830025970999a51cf0a3668b5','2025-11-18 15:16:21',0,NULL,'::ffff:100.64.0.4','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-11 15:16:20'),('feba8141-1b3a-44b9-9775-8fc6d73c8181','10d27c7c-be70-11f0-b544-a2aa05cbddca','4093b913f9801a96c5c9acd9d64a35234711006d5e9f46e294c170482cf66784','2025-11-18 04:20:08',0,NULL,'::ffff:100.64.0.8','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','2025-11-11 04:20:08');
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `streak_logs`
--

DROP TABLE IF EXISTS `streak_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `streak_logs` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` datetime NOT NULL,
  `metas_completas` int NOT NULL DEFAULT '0',
  `questoes_resolvidas` int NOT NULL DEFAULT '0',
  `tempo_estudo` int NOT NULL DEFAULT '0',
  `streak_ativo` tinyint(1) NOT NULL DEFAULT '1',
  `protecao_usada` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_date` (`user_id`,`date`),
  KEY `idx_streak_logs_user_date` (`user_id`,`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `streak_logs`
--

LOCK TABLES `streak_logs` WRITE;
/*!40000 ALTER TABLE `streak_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `streak_logs` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `streak_protections`
--

LOCK TABLES `streak_protections` WRITE;
/*!40000 ALTER TABLE `streak_protections` DISABLE KEYS */;
/*!40000 ALTER TABLE `streak_protections` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `streak_questoes`
--

LOCK TABLES `streak_questoes` WRITE;
/*!40000 ALTER TABLE `streak_questoes` DISABLE KEYS */;
/*!40000 ALTER TABLE `streak_questoes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `telemetry_events`
--

DROP TABLE IF EXISTS `telemetry_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `telemetry_events` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `session_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `widget` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('engagement','conversion','error','performance') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `properties` json DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `timestamp` datetime NOT NULL,
  `timezone` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration` int DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `viewport` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `event_id` (`event_id`),
  KEY `idx_user_timestamp` (`user_id`,`timestamp`),
  KEY `idx_widget_action` (`widget`,`action`),
  KEY `idx_session` (`session_id`),
  KEY `idx_category` (`category`),
  KEY `idx_telemetry_events_user_timestamp` (`user_id`,`timestamp`),
  KEY `idx_telemetry_events_widget_category` (`widget`,`category`,`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `telemetry_events`
--

LOCK TABLES `telemetry_events` WRITE;
/*!40000 ALTER TABLE `telemetry_events` DISABLE KEYS */;
/*!40000 ALTER TABLE `telemetry_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tokens`
--

DROP TABLE IF EXISTS `tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tokens` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('EMAIL_VERIFICATION','PASSWORD_RESET') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `used` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tokens_token_unique` (`token`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_token` (`token`),
  KEY `idx_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tokens`
--

LOCK TABLES `tokens` WRITE;
/*!40000 ALTER TABLE `tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `tokens` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `topicos`
--

LOCK TABLES `topicos` WRITE;
/*!40000 ALTER TABLE `topicos` DISABLE KEYS */;
INSERT INTO `topicos` VALUES ('6db5db3a-8d44-4b80-a89d-5ff17daa7c75','dd9c3d01-5d2b-4712-835f-5f8b7daafa07','ca2f75d4-2a13-43cf-a601-3a4e94b5c5d6','DADM-ATOS-PODERPOL','poder-de-policia','Poder de polícia','',100,1,'10d27c7c-be70-11f0-b544-a2aa05cbddca','2025-11-11 12:47:13','2025-11-11 12:47:13'),('d94da65d-0e43-4091-bb95-9ec581bb35a1','faa5fe72-498a-438a-b91a-44d29ad24a5d','39073999-54d3-41f6-b69f-adf2f88530b8','SADFASDFASDFAS','remedios-constitucionais','Remédios constitucionais','',100,1,'10d27c7c-be70-11f0-b544-a2aa05cbddca','2025-11-11 04:42:03','2025-11-11 04:42:03');
/*!40000 ALTER TABLE `topicos` ENABLE KEYS */;
UNLOCK TABLES;

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
  KEY `questionIdx` (`questionId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userNotebooks`
--

LOCK TABLES `userNotebooks` WRITE;
/*!40000 ALTER TABLE `userNotebooks` DISABLE KEYS */;
/*!40000 ALTER TABLE `userNotebooks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome_completo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cpf` varchar(14) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_version` int NOT NULL DEFAULT '1',
  `data_nascimento` date NOT NULL,
  `email_verificado` tinyint(1) NOT NULL DEFAULT '0',
  `role` enum('ALUNO','PROFESSOR','MENTOR','ADMINISTRATIVO','MASTER') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ALUNO',
  `avatar_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `forum_banned` tinyint(1) NOT NULL DEFAULT '0',
  `forum_banned_until` timestamp NULL DEFAULT NULL,
  `forum_banned_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_cpf_unique` (`cpf`),
  KEY `idx_email` (`email`),
  KEY `idx_cpf` (`cpf`),
  KEY `idx_role` (`role`),
  KEY `idx_ativo` (`ativo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('10d27c7c-be70-11f0-b544-a2aa05cbddca','Administrador Master',NULL,'master@dom.com','$2b$12$Mgp9ECT750hp.zOpedTTBuGrCCvXTZk453bUTLv0DGrBFna2W.8xm',1,'1990-01-01',1,'MASTER',NULL,NULL,1,'2025-11-10 20:01:37','2025-11-10 20:06:00',0,NULL,NULL),('275e32d2-e8a9-41ac-b866-59c121946867','Fernando Mesquita','01188032127','alunoteste@dom.com','$2b$12$0SSyxPnde4KCUM7i6xx2Fe50hlBEU6DtogZc30QG6vDe.G2hxd2AC',1,'1985-03-19',0,'ALUNO',NULL,NULL,1,'2025-11-10 18:49:04','2025-11-10 18:49:04',0,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `webhooks_pagarme`
--

LOCK TABLES `webhooks_pagarme` WRITE;
/*!40000 ALTER TABLE `webhooks_pagarme` DISABLE KEYS */;
/*!40000 ALTER TABLE `webhooks_pagarme` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `widget_configs`
--

DROP TABLE IF EXISTS `widget_configs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `widget_configs` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `widget_type` enum('cronograma','qtd','streak','progresso_semanal','materiais','revisoes','plano','comunidade') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `position` int NOT NULL DEFAULT '0',
  `is_visible` tinyint(1) NOT NULL DEFAULT '1',
  `is_expanded` tinyint(1) NOT NULL DEFAULT '1',
  `config` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_widget` (`user_id`,`widget_type`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_widget_configs_user_type` (`user_id`,`widget_type`),
  KEY `idx_widget_configs_user_position` (`user_id`,`position`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `widget_configs`
--

LOCK TABLES `widget_configs` WRITE;
/*!40000 ALTER TABLE `widget_configs` DISABLE KEYS */;
/*!40000 ALTER TABLE `widget_configs` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-11 11:57:59
