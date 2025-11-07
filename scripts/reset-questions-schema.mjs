#!/usr/bin/env node

/**
 * Script para limpar e recriar schema do módulo de questões
 * 
 * Este script:
 * 1. Dropa as 8 tabelas do módulo de questões (se existirem)
 * 2. Permite que o Drizzle recrie as tabelas do zero
 * 3. NÃO afeta outras tabelas (users, materiais, etc.)
 */

import mysql from 'mysql2/promise';
import 'dotenv/config';

const TABLES_TO_DROP = [
  'examAttempts',
  'examQuestions',
  'exams',
  'userNotebooks',
  'commentLikes',
  'questionComments',
  'questionFlags',
  'questionAttempts',
  'questions',
];

async function main() {
  console.log('🗄️  Conectando ao banco de dados...');
  
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    console.log('\n📋 Verificando tabelas existentes...');
    const [tables] = await connection.query('SHOW TABLES');
    const existingTables = tables.map(row => Object.values(row)[0]);
    console.log(`   Encontradas ${existingTables.length} tabelas`);
    
    console.log('\n🗑️  Dropando tabelas do módulo de questões...');
    
    // Desabilitar foreign key checks temporariamente
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    for (const table of TABLES_TO_DROP) {
      if (existingTables.includes(table)) {
        console.log(`   ❌ Dropando ${table}...`);
        await connection.query(`DROP TABLE IF EXISTS \`${table}\``);
      } else {
        console.log(`   ⏭️  ${table} não existe (pulando)`);
      }
    }
    
    // Reabilitar foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('\n✅ Schema limpo com sucesso!');
    console.log('\n📝 Próximo passo: Execute "pnpm db:push" para recriar as tabelas');
    
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

main();
