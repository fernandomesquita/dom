/**
 * Seed de Dados de Teste - Módulo de Metas
 * 
 * Cria:
 * - 1 plano de estudo exemplo
 * - 30 metas variadas (ESTUDO, QUESTOES, REVISAO)
 * - Algumas metas concluídas com duração real
 * - Algumas metas omitidas com motivos
 * - Histórico de redistribuições
 * - Revisões geradas automaticamente
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não configurada');
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

console.log('🌱 Iniciando seed de metas...\n');

// Buscar primeiro usuário do sistema
const [users] = await connection.query('SELECT id FROM users LIMIT 1');
if (users.length === 0) {
  console.error('❌ Nenhum usuário encontrado. Execute seed de usuários primeiro.');
  process.exit(1);
}
const userId = users[0].id;
console.log(`✅ Usuário encontrado: ${userId}`);

// Criar plano de estudo
const planoId = uuidv4();
const diasDisponiveis = 0b0111110; // Segunda a Sexta (bits 1-5)
const hoje = new Date().toISOString().split('T')[0];
const fimAno = new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0];

await connection.query(
  `INSERT INTO metas_planos_estudo (id, usuario_id, titulo, descricao, horas_por_dia, dias_disponiveis_bitmask, data_inicio, data_fim, status, criado_por_id, criado_em, atualizado_em)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
  [
    planoId,
    userId,
    'Preparação EARA 2025',
    'Plano completo de estudos para aprovação no concurso EARA 2025, com foco em Direito Constitucional, Administrativo e Penal.',
    4.5, // 4h30min por dia
    diasDisponiveis,
    hoje,
    fimAno,
    'ativo',
    userId
  ]
);

console.log(`✅ Plano criado: ${planoId}\n`);

// Dados de metas
const disciplinas = [
  { nome: 'Direito Constitucional', assuntos: ['Princípios Fundamentais', 'Direitos e Garantias Fundamentais', 'Organização do Estado', 'Poder Legislativo'] },
  { nome: 'Direito Administrativo', assuntos: ['Princípios da Administração', 'Atos Administrativos', 'Licitações e Contratos', 'Servidores Públicos'] },
  { nome: 'Direito Penal', assuntos: ['Princípios do Direito Penal', 'Crimes contra a Pessoa', 'Crimes contra o Patrimônio', 'Crimes contra a Administração'] },
  { nome: 'Direito Processual Penal', assuntos: ['Inquérito Policial', 'Ação Penal', 'Provas', 'Prisões e Medidas Cautelares'] },
  { nome: 'Português', assuntos: ['Interpretação de Texto', 'Gramática', 'Redação Oficial', 'Ortografia'] },
];

const tipos = ['ESTUDO', 'QUESTOES', 'REVISAO'];
const status = ['PENDENTE', 'CONCLUIDA', 'OMITIDA'];

// Gerar 30 metas
const metas = [];
let dataAtual = new Date();
dataAtual.setDate(dataAtual.getDate() - 15); // Começar 15 dias atrás

for (let i = 1; i <= 30; i++) {
  const disciplina = disciplinas[Math.floor(Math.random() * disciplinas.length)];
  const assunto = disciplina.assuntos[Math.floor(Math.random() * disciplina.assuntos.length)];
  
  // Primeiras 10 metas: 70% ESTUDO, 30% QUESTOES
  // Próximas 10 metas: 50% ESTUDO, 30% QUESTOES, 20% REVISAO
  // Últimas 10 metas: 40% ESTUDO, 30% QUESTOES, 30% REVISAO
  let tipo;
  if (i <= 10) {
    tipo = Math.random() < 0.7 ? 'ESTUDO' : 'QUESTOES';
  } else if (i <= 20) {
    const rand = Math.random();
    if (rand < 0.5) tipo = 'ESTUDO';
    else if (rand < 0.8) tipo = 'QUESTOES';
    else tipo = 'REVISAO';
  } else {
    const rand = Math.random();
    if (rand < 0.4) tipo = 'ESTUDO';
    else if (rand < 0.7) tipo = 'QUESTOES';
    else tipo = 'REVISAO';
  }
  
  // Status: metas antigas (1-15) são concluídas ou omitidas, metas recentes (16-30) são pendentes
  let metaStatus;
  if (i <= 15) {
    // 80% concluídas, 20% omitidas
    metaStatus = Math.random() < 0.8 ? 'CONCLUIDA' : 'OMITIDA';
  } else {
    metaStatus = 'PENDENTE';
  }
  
  const duracaoPlanejadaMin = tipo === 'ESTUDO' ? 60 : tipo === 'QUESTOES' ? 30 : 40;
  const duracaoRealSec = metaStatus === 'CONCLUIDA' ? duracaoPlanejadaMin * 60 * (0.8 + Math.random() * 0.4) : null; // 80-120% do planejado
  
  const metaNumberBase = i;
  const metaNumberSuffix = null;
  const displayNumber = `#${String(i).padStart(3, '0')}`;
  const orderKey = String(i).padStart(6, '0') + '/0000';
  
  const rowHash = crypto.createHash('sha256')
    .update(`${disciplina.nome}|${assunto}||${tipo}|${duracaoPlanejadaMin}`)
    .digest('hex');
  
  // Avançar data (pular fins de semana)
  while (dataAtual.getDay() === 0 || dataAtual.getDay() === 6) {
    dataAtual.setDate(dataAtual.getDate() + 1);
  }
  
  const scheduledDate = new Date(dataAtual);
  
  const meta = {
    id: uuidv4(),
    plano_id: planoId,
    meta_number_base: metaNumberBase,
    meta_number_suffix: metaNumberSuffix,
    display_number: displayNumber,
    order_key: orderKey,
    tipo,
    status: metaStatus,
    ktree_disciplina_id: disciplina.nome,
    ktree_assunto_id: assunto,
    ktree_topico_id: null,
    ktree_subtopico_id: null,
    scheduled_date: scheduledDate.toISOString().split('T')[0],
    scheduled_order: 1,
    duracao_planejada_min: duracaoPlanejadaMin,
    duracao_real_sec: duracaoRealSec ? Math.round(duracaoRealSec) : null,
    orientacoes_estudo: tipo === 'ESTUDO' ? `Estudar ${assunto} com foco em teoria e jurisprudência.` : 
                        tipo === 'QUESTOES' ? `Resolver 20 questões sobre ${assunto}.` :
                        `Revisar conceitos principais de ${assunto}.`,
    parent_meta_id: null,
    fixed: false,
    auto_generated: false,
    omitted: metaStatus === 'OMITIDA',
    omission_reason: metaStatus === 'OMITIDA' ? ['Falta de material', 'Muito difícil', 'Sem tempo', 'Cansaço'][Math.floor(Math.random() * 4)] : null,
    row_hash: rowHash,
    concluded_at_utc: metaStatus === 'CONCLUIDA' ? scheduledDate.toISOString() : null,
    criado_por_id: userId,
  };
  
  metas.push(meta);
  
  // Avançar data para próxima meta
  if (i % 3 === 0) {
    dataAtual.setDate(dataAtual.getDate() + 1);
  }
}

// Inserir metas
for (const meta of metas) {
  await connection.query(
    `INSERT INTO metas_cronograma (
      id, plano_id, meta_number_base, meta_number_suffix, display_number, order_key, tipo, status,
      ktree_disciplina_id, ktree_assunto_id, ktree_topico_id, ktree_subtopico_id,
      scheduled_date, scheduled_order, duracao_planejada_min, duracao_real_sec,
      orientacoes_estudo, parent_meta_id, fixed, auto_generated, omitted, omission_reason, row_hash,
      concluded_at_utc, criado_por_id, criado_em, atualizado_em
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [
      meta.id, meta.plano_id, meta.meta_number_base, meta.meta_number_suffix, meta.display_number, meta.order_key, meta.tipo, meta.status,
      meta.ktree_disciplina_id, meta.ktree_assunto_id, meta.ktree_topico_id, meta.ktree_subtopico_id,
      meta.scheduled_date, meta.scheduled_order, meta.duracao_planejada_min, meta.duracao_real_sec,
      meta.orientacoes_estudo, meta.parent_meta_id, meta.fixed, meta.auto_generated, meta.omitted, meta.omission_reason, meta.row_hash,
      meta.concluded_at_utc, meta.criado_por_id
    ]
  );
}

console.log(`✅ ${metas.length} metas criadas\n`);

// Criar logs de conclusão para metas concluídas
const metasConcluidas = metas.filter(m => m.status === 'CONCLUIDA');
for (const meta of metasConcluidas) {
  await connection.query(
    `INSERT INTO metas_cronograma_log_conclusao (id, meta_id, duracao_real_sec, criado_em)
     VALUES (?, ?, ?, ?)`,
    [uuidv4(), meta.id, meta.duracao_real_sec, meta.concluded_at_utc]
  );
}

console.log(`✅ ${metasConcluidas.length} logs de conclusão criados\n`);

// Criar logs de omissão para metas omitidas
const metasOmitidas = metas.filter(m => m.omitted);
for (const meta of metasOmitidas) {
  await connection.query(
    `INSERT INTO metas_cronograma_log_omissao (id, meta_id, motivo, criado_em)
     VALUES (?, ?, ?, NOW())`,
    [uuidv4(), meta.id, meta.omission_reason]
  );
}

console.log(`✅ ${metasOmitidas.length} logs de omissão criados\n`);

// Criar algumas redistribuições (5 metas foram redistribuídas)
const metasParaRedistribuir = metas.slice(10, 15);
for (const meta of metasParaRedistribuir) {
  const dataOriginal = new Date(meta.scheduled_date);
  dataOriginal.setDate(dataOriginal.getDate() - 2);
  
  await connection.query(
    `INSERT INTO metas_cronograma_log_redistribuicao (id, meta_id, data_original, data_nova, motivo, criado_em)
     VALUES (?, ?, ?, ?, ?, NOW())`,
    [
      uuidv4(),
      meta.id,
      dataOriginal.toISOString().split('T')[0],
      meta.scheduled_date,
      'Capacidade excedida'
    ]
  );
}

console.log(`✅ 5 logs de redistribuição criados\n`);

// Criar revisões para algumas metas de ESTUDO concluídas
const metasEstudoConcluidas = metasConcluidas.filter(m => m.tipo === 'ESTUDO').slice(0, 3);
for (const metaOrigem of metasEstudoConcluidas) {
  const intervalos = [1, 7, 30];
  
  for (let i = 0; i < intervalos.length; i++) {
    const dataRevisao = new Date(metaOrigem.concluido_em);
    dataRevisao.setDate(dataRevisao.getDate() + intervalos[i]);
    
    // Pular fins de semana
    while (dataRevisao.getDay() === 0 || dataRevisao.getDay() === 6) {
      dataRevisao.setDate(dataRevisao.getDate() + 1);
    }
    
    const numeroRevisao = i + 1;
    const displayNumber = `${metaOrigem.display_number}.${numeroRevisao}`;
    const orderKey = `${metaOrigem.order_key}.${String(numeroRevisao).padStart(3, '0')}`;
    
    const metaRevisaoId = uuidv4();
    
    const baseNumber = parseInt(metaOrigem.display_number.replace('#', ''));
    const suffixNumber = numeroRevisao;
    
    await connection.query(
      `INSERT INTO metas_cronograma (
        id, plano_id, meta_number_base, meta_number_suffix, display_number, order_key, tipo, status,
        ktree_disciplina_id, ktree_assunto_id, ktree_topico_id, ktree_subtopico_id,
        scheduled_date, scheduled_order, duracao_planejada_min, duracao_real_sec,
        orientacoes_estudo, parent_meta_id, fixed, auto_generated, omitted, omission_reason, row_hash,
        concluded_at_utc, criado_por_id, criado_em, atualizado_em
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        metaRevisaoId,
        planoId,
        baseNumber,
        suffixNumber,
        displayNumber,
        orderKey,
        'REVISAO',
        'PENDENTE',
        metaOrigem.ktree_disciplina_id,
        metaOrigem.ktree_assunto_id,
        metaOrigem.ktree_topico_id,
        null,
        dataRevisao.toISOString().split('T')[0],
        1,
        Math.ceil(metaOrigem.duracao_planejada_min * 0.5),
        null,
        `Revisar conceitos principais de ${metaOrigem.ktree_assunto_id}.`,
        metaOrigem.id,
        false,
        true,
        false,
        null,
        null,
        null,
        userId
      ]
    );
    
    // Criar registro de revisão
    await connection.query(
      `INSERT INTO metas_cronograma_revisoes (id, meta_id, revisao_numero, data_prevista, data_realizada, proxima_revisao_id, criado_em)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        uuidv4(),
        metaOrigem.id,
        numeroRevisao,
        dataRevisao.toISOString().split('T')[0],
        null,
        metaRevisaoId
      ]
    );
  }
}

console.log(`✅ ${metasEstudoConcluidas.length * 3} revisões criadas (3 por meta de estudo concluída)\n`);

await connection.end();

console.log('✅ Seed de metas concluído com sucesso!\n');
console.log('📊 Resumo:');
console.log(`   - 1 plano de estudo`);
console.log(`   - ${metas.length} metas criadas`);
console.log(`   - ${metasConcluidas.length} metas concluídas`);
console.log(`   - ${metasOmitidas.length} metas omitidas`);
console.log(`   - ${metas.length - metasConcluidas.length - metasOmitidas.length} metas pendentes`);
console.log(`   - 5 redistribuições registradas`);
console.log(`   - ${metasEstudoConcluidas.length * 3} revisões agendadas`);
