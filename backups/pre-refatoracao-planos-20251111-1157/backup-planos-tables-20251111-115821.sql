mysqldump: [Warning] Using a password on the command line interface can be insecure.
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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-11 11:58:21
