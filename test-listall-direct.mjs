#!/usr/bin/env node
/**
 * Script de teste DIRETO do procedure listAll
 * 
 * Executa query SQL diretamente no banco sem passar pelo tRPC
 * Para descobrir se o problema é no banco ou no tRPC
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testListAll() {
  console.log('🔍 ========== TESTE DIRETO DO BANCO ==========\n');
  
  // 1. Conectar no banco
  console.log('1️⃣ Conectando no banco...');
  console.log('   URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@'));
  
  const dbUrl = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
  const connection = await mysql.createConnection(dbUrl);
  
  // 2. Ver qual banco está conectado
  console.log('\n2️⃣ Verificando banco conectado...');
  const [dbInfo] = await connection.execute(`
    SELECT 
      DATABASE() as db_name,
      CURRENT_USER() as db_user,
      @@hostname as db_host
  `);
  console.log('   Banco:', dbInfo[0]);
  
  // 3. Contar registros em 'plans'
  console.log('\n3️⃣ Contando registros em "plans"...');
  try {
    const [plansCount] = await connection.execute('SELECT COUNT(*) as total FROM plans');
    console.log('   Total:', plansCount[0].total);
  } catch (e) {
    console.log('   ❌ ERRO:', e.message);
  }
  
  // 4. Contar registros em 'metas_planos_estudo'
  console.log('\n4️⃣ Contando registros em "metas_planos_estudo"...');
  try {
    const [metasCount] = await connection.execute('SELECT COUNT(*) as total FROM metas_planos_estudo');
    console.log('   Total:', metasCount[0].total);
  } catch (e) {
    console.log('   ❌ ERRO:', e.message);
  }
  
  // 5. Listar primeiros 5 planos (SEM filtro de deleted_at)
  console.log('\n5️⃣ Listando primeiros 5 planos (SEM filtro deleted_at)...');
  try {
    const [allPlans] = await connection.execute(`
      SELECT id, name, slug, category, created_at, deleted_at
      FROM plans 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    console.log('   Resultados:', allPlans.length);
    allPlans.forEach((plan, i) => {
      console.log(`   ${i+1}. ${plan.name} (deleted_at: ${plan.deleted_at})`);
    });
  } catch (e) {
    console.log('   ❌ ERRO:', e.message);
  }
  
  // 6. Listar planos COM filtro deleted_at IS NULL (igual ao código)
  console.log('\n6️⃣ Listando planos COM filtro deleted_at IS NULL...');
  try {
    const [activePlans] = await connection.execute(`
      SELECT id, name, slug, category, created_at, deleted_at
      FROM plans 
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    console.log('   Resultados:', activePlans.length);
    activePlans.forEach((plan, i) => {
      console.log(`   ${i+1}. ${plan.name}`);
    });
  } catch (e) {
    console.log('   ❌ ERRO:', e.message);
  }
  
  // 7. Verificar estrutura da tabela plans
  console.log('\n7️⃣ Verificando estrutura da tabela "plans"...');
  try {
    const [columns] = await connection.execute('DESCRIBE plans');
    console.log('   Colunas:');
    columns.forEach(col => {
      console.log(`   - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
  } catch (e) {
    console.log('   ❌ ERRO:', e.message);
  }
  
  await connection.end();
  
  console.log('\n🔍 ========== FIM DO TESTE ==========\n');
}

testListAll().catch(console.error);
