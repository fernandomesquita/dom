#!/usr/bin/env node

/**
 * Script para criar todas as 8 tabelas do módulo de questões
 * Executa SQL direto no banco de dados
 */

import mysql from 'mysql2/promise';
import 'dotenv/config';

const SQL_STATEMENTS = [
  // 1. questions (já criada, mas incluída para completude)
  `CREATE TABLE IF NOT EXISTS \`questions\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`uniqueCode\` VARCHAR(20) NOT NULL UNIQUE,
    \`disciplinaId\` VARCHAR(36) NULL,
    \`assuntoId\` VARCHAR(36) NULL,
    \`topicoId\` VARCHAR(36) NULL,
    \`statementText\` TEXT NOT NULL,
    \`statementImage\` VARCHAR(500) NULL,
    \`questionType\` ENUM('multiple_choice', 'true_false') NOT NULL,
    \`optionA\` TEXT NULL,
    \`optionB\` TEXT NULL,
    \`optionC\` TEXT NULL,
    \`optionD\` TEXT NULL,
    \`optionE\` TEXT NULL,
    \`correctOption\` ENUM('A', 'B', 'C', 'D', 'E') NULL,
    \`trueFalseAnswer\` BOOLEAN NULL,
    \`explanationText\` TEXT NULL,
    \`explanationImage\` VARCHAR(500) NULL,
    \`examBoard\` VARCHAR(100) NULL,
    \`examYear\` INT NULL,
    \`examInstitution\` VARCHAR(255) NULL,
    \`difficulty\` ENUM('easy', 'medium', 'hard') NULL,
    \`isOutdated\` BOOLEAN DEFAULT FALSE,
    \`isAnnulled\` BOOLEAN DEFAULT FALSE,
    \`flagReason\` TEXT NULL,
    \`isActive\` BOOLEAN NOT NULL DEFAULT TRUE,
    \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updatedAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX \`uniqueCodeIdx\` (\`uniqueCode\`),
    INDEX \`disciplinaIdx\` (\`disciplinaId\`),
    INDEX \`assuntoIdx\` (\`assuntoId\`),
    INDEX \`topicoIdx\` (\`topicoId\`),
    INDEX \`typeIdx\` (\`questionType\`),
    INDEX \`activeIdx\` (\`isActive\`),
    INDEX \`disciplinaAssuntoIdx\` (\`disciplinaId\`, \`assuntoId\`),
    INDEX \`disciplinaDifficultyIdx\` (\`disciplinaId\`, \`difficulty\`),
    INDEX \`examBoardYearIdx\` (\`examBoard\`, \`examYear\`),
    FOREIGN KEY (\`disciplinaId\`) REFERENCES \`disciplinas\`(\`id\`) ON DELETE SET NULL,
    FOREIGN KEY (\`assuntoId\`) REFERENCES \`assuntos\`(\`id\`) ON DELETE SET NULL,
    FOREIGN KEY (\`topicoId\`) REFERENCES \`topicos\`(\`id\`) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // 2. exams (criar antes de examAttempts)
  `CREATE TABLE IF NOT EXISTS \`exams\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`title\` VARCHAR(255) NOT NULL,
    \`description\` TEXT NULL,
    \`totalQuestions\` INT NOT NULL,
    \`timeLimit\` INT NULL,
    \`passingScore\` INT NULL,
    \`isPublic\` BOOLEAN DEFAULT FALSE,
    \`planIds\` TEXT NULL,
    \`scheduledFor\` TIMESTAMP NULL,
    \`closesAt\` TIMESTAMP NULL,
    \`isActive\` BOOLEAN DEFAULT TRUE,
    \`createdBy\` VARCHAR(36) NOT NULL,
    \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updatedAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX \`createdByIdx\` (\`createdBy\`),
    INDEX \`scheduledIdx\` (\`scheduledFor\`),
    INDEX \`activeIdx\` (\`isActive\`),
    FOREIGN KEY (\`createdBy\`) REFERENCES \`users\`(\`id\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // 3. examAttempts
  `CREATE TABLE IF NOT EXISTS \`examAttempts\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`examId\` INT NOT NULL,
    \`userId\` VARCHAR(36) NOT NULL,
    \`score\` INT NOT NULL,
    \`correctCount\` INT NOT NULL,
    \`wrongCount\` INT NOT NULL,
    \`skippedCount\` INT NOT NULL,
    \`timeSpent\` INT NOT NULL,
    \`status\` ENUM('in_progress', 'completed', 'abandoned') NOT NULL DEFAULT 'in_progress',
    \`startedAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`completedAt\` TIMESTAMP NULL,
    INDEX \`examIdx\` (\`examId\`),
    INDEX \`userIdx\` (\`userId\`),
    INDEX \`statusIdx\` (\`status\`),
    INDEX \`scoreIdx\` (\`score\`),
    FOREIGN KEY (\`examId\`) REFERENCES \`exams\`(\`id\`) ON DELETE CASCADE,
    FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // 4. questionAttempts
  `CREATE TABLE IF NOT EXISTS \`questionAttempts\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`userId\` VARCHAR(36) NOT NULL,
    \`questionId\` INT NOT NULL,
    \`selectedOption\` ENUM('A', 'B', 'C', 'D', 'E') NULL,
    \`trueFalseAnswer\` BOOLEAN NULL,
    \`isCorrect\` BOOLEAN NOT NULL,
    \`timeSpent\` INT NULL,
    \`source\` ENUM('practice', 'exam', 'notebook') NOT NULL,
    \`examAttemptId\` INT NULL,
    \`attemptedAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX \`userIdx\` (\`userId\`),
    INDEX \`questionIdx\` (\`questionId\`),
    INDEX \`examIdx\` (\`examAttemptId\`),
    INDEX \`userDateIdx\` (\`userId\`, \`attemptedAt\`),
    INDEX \`userQuestionIdx\` (\`userId\`, \`questionId\`),
    FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
    FOREIGN KEY (\`questionId\`) REFERENCES \`questions\`(\`id\`) ON DELETE CASCADE,
    FOREIGN KEY (\`examAttemptId\`) REFERENCES \`examAttempts\`(\`id\`) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // 5. questionFlags
  `CREATE TABLE IF NOT EXISTS \`questionFlags\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`questionId\` INT NOT NULL,
    \`userId\` VARCHAR(36) NOT NULL,
    \`flagType\` ENUM('outdated', 'annulled', 'error', 'duplicate') NOT NULL,
    \`reason\` TEXT NOT NULL,
    \`status\` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    \`reviewedBy\` VARCHAR(36) NULL,
    \`reviewedAt\` TIMESTAMP NULL,
    \`reviewNotes\` TEXT NULL,
    \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX \`questionIdx\` (\`questionId\`),
    INDEX \`statusIdx\` (\`status\`),
    INDEX \`userIdx\` (\`userId\`),
    FOREIGN KEY (\`questionId\`) REFERENCES \`questions\`(\`id\`) ON DELETE CASCADE,
    FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
    FOREIGN KEY (\`reviewedBy\`) REFERENCES \`users\`(\`id\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // 6. questionComments
  `CREATE TABLE IF NOT EXISTS \`questionComments\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`questionId\` INT NOT NULL,
    \`userId\` VARCHAR(36) NOT NULL,
    \`parentId\` INT NULL,
    \`content\` TEXT NOT NULL,
    \`images\` TEXT NULL,
    \`isOfficial\` BOOLEAN DEFAULT FALSE,
    \`likesCount\` INT DEFAULT 0,
    \`isEdited\` BOOLEAN DEFAULT FALSE,
    \`isActive\` BOOLEAN DEFAULT TRUE,
    \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updatedAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX \`questionIdx\` (\`questionId\`),
    INDEX \`parentIdx\` (\`parentId\`),
    INDEX \`userIdx\` (\`userId\`),
    INDEX \`activeIdx\` (\`isActive\`),
    FOREIGN KEY (\`questionId\`) REFERENCES \`questions\`(\`id\`) ON DELETE CASCADE,
    FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
    FOREIGN KEY (\`parentId\`) REFERENCES \`questionComments\`(\`id\`) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // 7. commentLikes
  `CREATE TABLE IF NOT EXISTS \`commentLikes\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`commentId\` INT NOT NULL,
    \`userId\` VARCHAR(36) NOT NULL,
    \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE INDEX \`commentUserIdx\` (\`commentId\`, \`userId\`),
    FOREIGN KEY (\`commentId\`) REFERENCES \`questionComments\`(\`id\`) ON DELETE CASCADE,
    FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // 8. userNotebooks
  `CREATE TABLE IF NOT EXISTS \`userNotebooks\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`userId\` VARCHAR(36) NOT NULL,
    \`questionId\` INT NOT NULL,
    \`notebookType\` ENUM('review', 'mistakes', 'favorites') NOT NULL,
    \`personalNotes\` TEXT NULL,
    \`color\` VARCHAR(7) NULL,
    \`order\` INT DEFAULT 0,
    \`addedAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX \`userTypeIdx\` (\`userId\`, \`notebookType\`),
    INDEX \`questionIdx\` (\`questionId\`),
    UNIQUE INDEX \`uniqueNotebook\` (\`userId\`, \`questionId\`, \`notebookType\`),
    FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
    FOREIGN KEY (\`questionId\`) REFERENCES \`questions\`(\`id\`) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // 9. examQuestions
  `CREATE TABLE IF NOT EXISTS \`examQuestions\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`examId\` INT NOT NULL,
    \`questionId\` INT NOT NULL,
    \`order\` INT NOT NULL,
    INDEX \`examIdx\` (\`examId\`),
    INDEX \`questionIdx\` (\`questionId\`),
    INDEX \`orderIdx\` (\`examId\`, \`order\`),
    FOREIGN KEY (\`examId\`) REFERENCES \`exams\`(\`id\`) ON DELETE CASCADE,
    FOREIGN KEY (\`questionId\`) REFERENCES \`questions\`(\`id\`) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
];

async function main() {
  console.log('🗄️  Conectando ao banco de dados...\n');
  
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    console.log('📝 Criando 8 tabelas do módulo de questões...\n');
    
    for (let i = 0; i < SQL_STATEMENTS.length; i++) {
      const tableName = [
        'questions',
        'exams',
        'examAttempts',
        'questionAttempts',
        'questionFlags',
        'questionComments',
        'commentLikes',
        'userNotebooks',
        'examQuestions',
      ][i];
      
      console.log(`   ${i + 1}/9 Criando ${tableName}...`);
      await connection.query(SQL_STATEMENTS[i]);
      console.log(`   ✅ ${tableName} criada`);
    }
    
    console.log('\n✅ Todas as 8 tabelas criadas com sucesso!');
    console.log('\n📊 Resumo:');
    console.log('   - questions (tabela principal)');
    console.log('   - questionAttempts (histórico de resoluções)');
    console.log('   - questionFlags (sistema de moderação)');
    console.log('   - questionComments (comentários)');
    console.log('   - commentLikes (curtidas)');
    console.log('   - userNotebooks (cadernos personalizados)');
    console.log('   - exams (simulados)');
    console.log('   - examQuestions (questões dos simulados)');
    console.log('   - examAttempts (tentativas de simulados)');
    
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

main();
