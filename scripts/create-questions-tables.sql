-- Script SQL para criar tabelas do Módulo de Questões
-- Executa diretamente no MySQL sem interações do Drizzle

SET FOREIGN_KEY_CHECKS = 0;

-- ========================================
-- TABELA: questions
-- ========================================

CREATE TABLE IF NOT EXISTS `questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `uniqueCode` VARCHAR(20) NOT NULL UNIQUE,
  
  -- Integração com Árvore de Conhecimento
  `disciplinaId` INT NULL,
  `assuntoId` INT NULL,
  `topicoId` INT NULL,
  
  -- Conteúdo
  `statementText` TEXT NOT NULL,
  `statementImage` VARCHAR(500) NULL,
  
  -- Tipo e respostas
  `questionType` ENUM('multiple_choice', 'true_false') NOT NULL,
  `optionA` TEXT NULL,
  `optionB` TEXT NULL,
  `optionC` TEXT NULL,
  `optionD` TEXT NULL,
  `optionE` TEXT NULL,
  `correctOption` ENUM('A', 'B', 'C', 'D', 'E') NULL,
  `trueFalseAnswer` BOOLEAN NULL,
  
  -- Explicação
  `explanationText` TEXT NULL,
  `explanationImage` VARCHAR(500) NULL,
  
  -- Metadados
  `examBoard` VARCHAR(100) NULL,
  `examYear` INT NULL,
  `examInstitution` VARCHAR(255) NULL,
  `difficulty` ENUM('easy', 'medium', 'hard') NULL,
  
  -- Sinalizações
  `isOutdated` BOOLEAN DEFAULT FALSE,
  `isAnnulled` BOOLEAN DEFAULT FALSE,
  `flagReason` TEXT NULL,
  
  -- Status
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices
  INDEX `uniqueCodeIdx` (`uniqueCode`),
  INDEX `disciplinaIdx` (`disciplinaId`),
  INDEX `assuntoIdx` (`assuntoId`),
  INDEX `topicoIdx` (`topicoId`),
  INDEX `typeIdx` (`questionType`),
  INDEX `activeIdx` (`isActive`),
  INDEX `disciplinaAssuntoIdx` (`disciplinaId`, `assuntoId`),
  INDEX `disciplinaDifficultyIdx` (`disciplinaId`, `difficulty`),
  INDEX `examBoardYearIdx` (`examBoard`, `examYear`),
  
  FOREIGN KEY (`disciplinaId`) REFERENCES `disciplinas`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`assuntoId`) REFERENCES `assuntos`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`topicoId`) REFERENCES `topicos`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABELA: questionAttempts
-- ========================================

CREATE TABLE IF NOT EXISTS `questionAttempts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` VARCHAR(36) NOT NULL,
  `questionId` INT NOT NULL,
  
  -- Resposta
  `selectedOption` ENUM('A', 'B', 'C', 'D', 'E') NULL,
  `trueFalseAnswer` BOOLEAN NULL,
  `isCorrect` BOOLEAN NOT NULL,
  `timeSpent` INT NULL,
  
  -- Contexto
  `source` ENUM('practice', 'exam', 'notebook') NOT NULL,
  `examAttemptId` INT NULL,
  
  `attemptedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Índices
  INDEX `userIdx` (`userId`),
  INDEX `questionIdx` (`questionId`),
  INDEX `examIdx` (`examAttemptId`),
  INDEX `userDateIdx` (`userId`, `attemptedAt`),
  INDEX `userQuestionIdx` (`userId`, `questionId`),
  
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`questionId`) REFERENCES `questions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABELA: questionFlags
-- ========================================

CREATE TABLE IF NOT EXISTS `questionFlags` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `questionId` INT NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  
  `flagType` ENUM('outdated', 'annulled', 'error', 'duplicate') NOT NULL,
  `reason` TEXT NOT NULL,
  
  -- Moderação
  `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  `reviewedBy` VARCHAR(36) NULL,
  `reviewedAt` TIMESTAMP NULL,
  `reviewNotes` TEXT NULL,
  
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Índices
  INDEX `questionIdx` (`questionId`),
  INDEX `statusIdx` (`status`),
  INDEX `userIdx` (`userId`),
  
  FOREIGN KEY (`questionId`) REFERENCES `questions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABELA: questionComments
-- ========================================

CREATE TABLE IF NOT EXISTS `questionComments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `questionId` INT NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  
  `parentId` INT NULL,
  
  `content` TEXT NOT NULL,
  `images` TEXT NULL,
  `isOfficial` BOOLEAN DEFAULT FALSE,
  `likesCount` INT DEFAULT 0,
  
  `isEdited` BOOLEAN DEFAULT FALSE,
  `isActive` BOOLEAN DEFAULT TRUE,
  
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices
  INDEX `questionIdx` (`questionId`),
  INDEX `parentIdx` (`parentId`),
  INDEX `userIdx` (`userId`),
  INDEX `activeIdx` (`isActive`),
  
  FOREIGN KEY (`questionId`) REFERENCES `questions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`parentId`) REFERENCES `questionComments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABELA: commentLikes
-- ========================================

CREATE TABLE IF NOT EXISTS `commentLikes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `commentId` INT NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Índice único composto
  UNIQUE INDEX `commentUserIdx` (`commentId`, `userId`),
  
  FOREIGN KEY (`commentId`) REFERENCES `questionComments`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABELA: userNotebooks
-- ========================================

CREATE TABLE IF NOT EXISTS `userNotebooks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` VARCHAR(36) NOT NULL,
  `questionId` INT NOT NULL,
  
  `notebookType` ENUM('review', 'mistakes', 'favorites') NOT NULL,
  
  `personalNotes` TEXT NULL,
  `color` VARCHAR(7) NULL,
  `order` INT DEFAULT 0,
  
  `addedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Índices
  INDEX `userTypeIdx` (`userId`, `notebookType`),
  INDEX `questionIdx` (`questionId`),
  UNIQUE INDEX `uniqueNotebook` (`userId`, `questionId`, `notebookType`),
  
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`questionId`) REFERENCES `questions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABELA: exams
-- ========================================

CREATE TABLE IF NOT EXISTS `exams` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  
  `totalQuestions` INT NOT NULL,
  `timeLimit` INT NULL,
  `passingScore` INT NULL,
  
  `isPublic` BOOLEAN DEFAULT FALSE,
  `planIds` TEXT NULL,
  
  `scheduledFor` TIMESTAMP NULL,
  `closesAt` TIMESTAMP NULL,
  
  `isActive` BOOLEAN DEFAULT TRUE,
  `createdBy` VARCHAR(36) NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices
  INDEX `createdByIdx` (`createdBy`),
  INDEX `scheduledIdx` (`scheduledFor`),
  INDEX `activeIdx` (`isActive`),
  
  FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABELA: examQuestions
-- ========================================

CREATE TABLE IF NOT EXISTS `examQuestions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `examId` INT NOT NULL,
  `questionId` INT NOT NULL,
  `order` INT NOT NULL,
  
  -- Índices
  INDEX `examIdx` (`examId`),
  INDEX `questionIdx` (`questionId`),
  INDEX `orderIdx` (`examId`, `order`),
  
  FOREIGN KEY (`examId`) REFERENCES `exams`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`questionId`) REFERENCES `questions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABELA: examAttempts
-- ========================================

CREATE TABLE IF NOT EXISTS `examAttempts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `examId` INT NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  
  `score` INT NOT NULL,
  `correctCount` INT NOT NULL,
  `wrongCount` INT NOT NULL,
  `skippedCount` INT NOT NULL,
  `timeSpent` INT NOT NULL,
  
  `status` ENUM('in_progress', 'completed', 'abandoned') NOT NULL DEFAULT 'in_progress',
  
  `startedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completedAt` TIMESTAMP NULL,
  
  -- Índices
  INDEX `examIdx` (`examId`),
  INDEX `userIdx` (`userId`),
  INDEX `statusIdx` (`status`),
  INDEX `scoreIdx` (`score`),
  
  FOREIGN KEY (`examId`) REFERENCES `exams`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Adicionar foreign key de examAttemptId em questionAttempts
ALTER TABLE `questionAttempts` 
  ADD CONSTRAINT `fk_examAttemptId` 
  FOREIGN KEY (`examAttemptId`) REFERENCES `examAttempts`(`id`) ON DELETE SET NULL;

SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Tabelas do módulo de questões criadas com sucesso!' AS status;
