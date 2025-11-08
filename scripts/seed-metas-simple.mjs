/**
 * Seed Simplificado de Metas
 * Cria tabelas e insere dados de teste
 */

import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não configurada');
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);

console.log('🌱 Iniciando seed simplificado de metas...\n');

// Dropar tabelas antigas
console.log('🗑️ Removendo tabelas antigas...');

try {
  await connection.query('DROP TABLE IF EXISTS metas');
  await connection.query('DROP TABLE IF EXISTS planos_estudo');
  console.log('✅ Tabelas antigas removidas\n');
} catch (err) {
  console.log('⚠️ Tabelas antigas não existiam\n');
}

// Criar tabelas
console.log('📋 Criando tabelas...');

await connection.query(`
  CREATE TABLE IF NOT EXISTS planos_estudo (
    id VARCHAR(36) PRIMARY KEY,
    usuario_id VARCHAR(36) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    horas_por_dia DECIMAL(4,2) NOT NULL,
    dias_disponiveis_bitmask INT NOT NULL DEFAULT 31,
    data_inicio DATE NOT NULL,
    data_fim DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'ativo',
    criado_por_id VARCHAR(36) NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_planos_usuario (usuario_id),
    INDEX idx_planos_status (status)
  )
`);

await connection.query(`
  CREATE TABLE IF NOT EXISTS metas (
    id VARCHAR(36) PRIMARY KEY,
    plano_id VARCHAR(36) NOT NULL,
    meta_number_base INT NOT NULL,
    meta_number_suffix INT,
    display_number VARCHAR(20) NOT NULL,
    order_key VARCHAR(20) NOT NULL,
    ktree_disciplina_id VARCHAR(36) NOT NULL,
    ktree_assunto_id VARCHAR(36) NOT NULL,
    ktree_topico_id VARCHAR(36),
    ktree_subtopico_id VARCHAR(36),
    tipo VARCHAR(20) NOT NULL,
    duracao_planejada_min INT NOT NULL,
    duracao_real_sec INT DEFAULT 0,
    scheduled_date DATE NOT NULL,
    scheduled_order INT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDENTE',
    concluded_at_utc TIMESTAMP NULL,
    orientacoes_estudo TEXT,
    fixed BOOLEAN DEFAULT FALSE,
    auto_generated BOOLEAN DEFAULT FALSE,
    parent_meta_id VARCHAR(36),
    omitted BOOLEAN DEFAULT FALSE,
    omission_reason VARCHAR(50),
    row_hash VARCHAR(64),
    criado_por_id VARCHAR(36) NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_metas_plan_schedule (plano_id, scheduled_date, scheduled_order),
    INDEX idx_metas_plan_status (plano_id, status, omitted)
  )
`);

console.log('✅ Tabelas criadas\n');

// Buscar usuário
const [users] = await connection.query('SELECT id FROM users LIMIT 1');
if (users.length === 0) {
  console.error('❌ Nenhum usuário encontrado');
  process.exit(1);
}
const userId = users[0].id;
console.log(`✅ Usuário: ${userId}\n`);

// Criar plano
const planoId = uuidv4();
const hoje = new Date().toISOString().split('T')[0];
const fimAno = new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0];

await connection.query(
  `INSERT INTO metas_planos_estudo (id, usuario_id, titulo, descricao, horas_por_dia, dias_disponiveis_bitmask, data_inicio, data_fim, status, criado_por_id)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    planoId,
    userId,
    'Preparação EARA 2025',
    'Plano completo de estudos para aprovação no concurso EARA 2025',
    4.5,
    62, // Segunda a Sexta
    hoje,
    fimAno,
    'ativo',
    userId
  ]
);

console.log(`✅ Plano criado: ${planoId}\n`);

// Criar 10 metas de exemplo
const disciplinas = ['Dir. Constitucional', 'Dir. Administrativo', 'Dir. Penal', 'Português', 'RLM'];
const tipos = ['ESTUDO', 'QUESTOES', 'REVISAO'];

let dataAtual = new Date();
dataAtual.setDate(dataAtual.getDate() - 5);

for (let i = 1; i <= 10; i++) {
  const disciplina = disciplinas[i % disciplinas.length];
  const tipo = tipos[i % tipos.length];
  const status = i <= 5 ? 'CONCLUIDA' : 'PENDENTE';
  
  // Pular fins de semana
  while (dataAtual.getDay() === 0 || dataAtual.getDay() === 6) {
    dataAtual.setDate(dataAtual.getDate() + 1);
  }
  
  const metaId = uuidv4();
  const displayNumber = `#${String(i).padStart(3, '0')}`;
  const orderKey = String(i).padStart(6, '0') + '/0000';
  const duracaoMin = tipo === 'ESTUDO' ? 60 : 30;
  const duracaoRealSec = status === 'CONCLUIDA' ? duracaoMin * 60 : 0;
  
  await connection.query(
    `INSERT INTO metas_cronograma (
      id, plano_id, meta_number_base, meta_number_suffix, display_number, order_key,
      ktree_disciplina_id, ktree_assunto_id, tipo, duracao_planejada_min, duracao_real_sec,
      scheduled_date, scheduled_order, status, concluded_at_utc,
      orientacoes_estudo, fixed, auto_generated, omitted, criado_por_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      metaId,
      planoId,
      i,
      null,
      displayNumber,
      orderKey,
      disciplina,
      `Assunto ${i}`,
      tipo,
      duracaoMin,
      duracaoRealSec,
      dataAtual.toISOString().split('T')[0],
      1,
      status,
      status === 'CONCLUIDA' ? dataAtual.toISOString() : null,
      `Estudar ${disciplina} - ${tipo}`,
      false,
      false,
      false,
      userId
    ]
  );
  
  if (i % 2 === 0) {
    dataAtual.setDate(dataAtual.getDate() + 1);
  }
}

console.log('✅ 10 metas criadas\n');

await connection.end();

console.log('✅ Seed concluído com sucesso!');
console.log('📊 Resumo: 1 plano + 10 metas (5 concluídas, 5 pendentes)');
