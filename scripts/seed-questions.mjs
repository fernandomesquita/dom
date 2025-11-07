#!/usr/bin/env node

/**
 * Script de seed: 50 questões de teste
 * Distribui questões entre disciplinas, assuntos e tópicos existentes
 */

import mysql from 'mysql2/promise';
import 'dotenv/config';

// ========================================
// DADOS DE SEED
// ========================================

const EXAM_BOARDS = ['CESPE', 'FCC', 'VUNESP', 'FGV', 'IBFC', 'AOCP', 'IADES'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

// Questões de múltipla escolha (40)
const MULTIPLE_CHOICE_QUESTIONS = [
  {
    statementText: 'Qual é a capital do Brasil?',
    optionA: 'São Paulo',
    optionB: 'Rio de Janeiro',
    optionC: 'Brasília',
    optionD: 'Salvador',
    optionE: 'Belo Horizonte',
    correctOption: 'C',
    explanationText: 'Brasília é a capital federal do Brasil desde 1960.',
    difficulty: 'easy',
  },
  {
    statementText: 'Quem proclamou a independência do Brasil?',
    optionA: 'Dom Pedro I',
    optionB: 'Dom Pedro II',
    optionC: 'Tiradentes',
    optionD: 'Getúlio Vargas',
    optionE: 'Juscelino Kubitschek',
    correctOption: 'A',
    explanationText: 'Dom Pedro I proclamou a independência do Brasil em 7 de setembro de 1822.',
    difficulty: 'easy',
  },
  {
    statementText: 'Qual é o maior país da América do Sul em extensão territorial?',
    optionA: 'Argentina',
    optionB: 'Brasil',
    optionC: 'Peru',
    optionD: 'Colômbia',
    optionE: 'Venezuela',
    correctOption: 'B',
    explanationText: 'O Brasil possui aproximadamente 8,5 milhões de km², sendo o maior país sul-americano.',
    difficulty: 'easy',
  },
  {
    statementText: 'Em que ano foi promulgada a Constituição Federal vigente?',
    optionA: '1985',
    optionB: '1988',
    optionC: '1990',
    optionD: '1992',
    optionE: '1995',
    correctOption: 'B',
    explanationText: 'A Constituição Federal foi promulgada em 5 de outubro de 1988.',
    difficulty: 'medium',
  },
  {
    statementText: 'Qual é o princípio constitucional que garante tratamento igual perante a lei?',
    optionA: 'Legalidade',
    optionB: 'Moralidade',
    optionC: 'Isonomia',
    optionD: 'Publicidade',
    optionE: 'Eficiência',
    correctOption: 'C',
    explanationText: 'O princípio da isonomia (igualdade) está previsto no art. 5º da CF/88.',
    difficulty: 'medium',
  },
  {
    statementText: 'Quantos anos dura o mandato de um Presidente da República no Brasil?',
    optionA: '2 anos',
    optionB: '3 anos',
    optionC: '4 anos',
    optionD: '5 anos',
    optionE: '6 anos',
    correctOption: 'C',
    explanationText: 'O mandato presidencial tem duração de 4 anos, permitida uma reeleição.',
    difficulty: 'easy',
  },
  {
    statementText: 'Qual poder é responsável por fiscalizar as contas públicas?',
    optionA: 'Executivo',
    optionB: 'Legislativo',
    optionC: 'Judiciário',
    optionD: 'Ministério Público',
    optionE: 'Defensoria Pública',
    correctOption: 'B',
    explanationText: 'O Poder Legislativo, com auxílio do Tribunal de Contas, fiscaliza as contas públicas.',
    difficulty: 'medium',
  },
  {
    statementText: 'Qual é a função principal do Supremo Tribunal Federal?',
    optionA: 'Julgar crimes comuns',
    optionB: 'Guardar a Constituição',
    optionC: 'Elaborar leis',
    optionD: 'Fiscalizar o Executivo',
    optionE: 'Administrar o Judiciário',
    correctOption: 'B',
    explanationText: 'O STF é o guardião da Constituição Federal, conforme art. 102 da CF/88.',
    difficulty: 'medium',
  },
  {
    statementText: 'Qual é o número de senadores por estado no Brasil?',
    optionA: '1',
    optionB: '2',
    optionC: '3',
    optionD: '4',
    optionE: '5',
    correctOption: 'C',
    explanationText: 'Cada estado e o Distrito Federal elegem 3 senadores, totalizando 81.',
    difficulty: 'easy',
  },
  {
    statementText: 'Qual é o prazo de validade de um concurso público?',
    optionA: '6 meses',
    optionB: '1 ano',
    optionC: 'Até 2 anos',
    optionD: '3 anos',
    optionE: '5 anos',
    correctOption: 'C',
    explanationText: 'A validade do concurso é de até 2 anos, prorrogável uma vez por igual período (CF/88, art. 37, III).',
    difficulty: 'medium',
  },
];

// Gerar mais 30 questões variadas
for (let i = 11; i <= 40; i++) {
  MULTIPLE_CHOICE_QUESTIONS.push({
    statementText: `Questão de múltipla escolha número ${i} para teste do sistema. Qual é a alternativa correta?`,
    optionA: 'Alternativa A - Incorreta',
    optionB: 'Alternativa B - Incorreta',
    optionC: 'Alternativa C - CORRETA',
    optionD: 'Alternativa D - Incorreta',
    optionE: 'Alternativa E - Incorreta',
    correctOption: 'C',
    explanationText: `Esta é a explicação da questão ${i}. A alternativa C está correta porque atende aos requisitos solicitados no enunciado.`,
    difficulty: DIFFICULTIES[i % 3],
  });
}

// Questões verdadeiro/falso (10)
const TRUE_FALSE_QUESTIONS = [
  {
    statementText: 'A Constituição Federal de 1988 é conhecida como "Constituição Cidadã".',
    trueFalseAnswer: true,
    explanationText: 'Verdadeiro. A CF/88 é chamada de Constituição Cidadã por ampliar direitos e garantias fundamentais.',
    difficulty: 'easy',
  },
  {
    statementText: 'O Brasil é uma monarquia parlamentarista.',
    trueFalseAnswer: false,
    explanationText: 'Falso. O Brasil é uma República Federativa Presidencialista.',
    difficulty: 'easy',
  },
  {
    statementText: 'O voto no Brasil é obrigatório para todos os cidadãos.',
    trueFalseAnswer: false,
    explanationText: 'Falso. O voto é facultativo para analfabetos, maiores de 70 anos e jovens entre 16 e 18 anos.',
    difficulty: 'medium',
  },
  {
    statementText: 'O Ministério Público tem função de defesa da ordem jurídica e dos interesses sociais.',
    trueFalseAnswer: true,
    explanationText: 'Verdadeiro. Conforme art. 127 da CF/88, o MP é instituição permanente essencial à função jurisdicional do Estado.',
    difficulty: 'medium',
  },
  {
    statementText: 'Todos os cargos públicos podem ser preenchidos sem concurso.',
    trueFalseAnswer: false,
    explanationText: 'Falso. A regra é o concurso público, salvo cargos em comissão e funções de confiança.',
    difficulty: 'easy',
  },
  {
    statementText: 'O servidor público estável pode ser demitido a qualquer momento.',
    trueFalseAnswer: false,
    explanationText: 'Falso. A demissão do servidor estável exige processo administrativo ou sentença judicial transitada em julgado.',
    difficulty: 'medium',
  },
  {
    statementText: 'A Defensoria Pública presta assistência jurídica gratuita aos necessitados.',
    trueFalseAnswer: true,
    explanationText: 'Verdadeiro. Conforme art. 134 da CF/88, a Defensoria Pública é instituição essencial à função jurisdicional do Estado.',
    difficulty: 'easy',
  },
  {
    statementText: 'O habeas corpus é remédio constitucional para proteger o direito de locomoção.',
    trueFalseAnswer: true,
    explanationText: 'Verdadeiro. O habeas corpus protege a liberdade de locomoção contra ilegalidade ou abuso de poder.',
    difficulty: 'medium',
  },
  {
    statementText: 'A Lei de Responsabilidade Fiscal aplica-se apenas à União.',
    trueFalseAnswer: false,
    explanationText: 'Falso. A LRF (LC 101/2000) aplica-se a todos os entes federativos: União, Estados, DF e Municípios.',
    difficulty: 'hard',
  },
  {
    statementText: 'O princípio da eficiência foi incluído na CF/88 pela EC 19/98.',
    trueFalseAnswer: true,
    explanationText: 'Verdadeiro. A Emenda Constitucional 19/98 (Reforma Administrativa) incluiu a eficiência no art. 37 da CF/88.',
    difficulty: 'hard',
  },
];

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

function generateUniqueCode() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `Q${timestamp}${random}`;
}

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomYear() {
  return 2015 + Math.floor(Math.random() * 10); // 2015-2024
}

// ========================================
// MAIN
// ========================================

async function main() {
  console.log('🌱 Iniciando seed de questões...\n');
  
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    // Buscar disciplinas existentes
    const [disciplinas] = await connection.query('SELECT id FROM disciplinas LIMIT 5');
    
    if (disciplinas.length === 0) {
      console.error('❌ Nenhuma disciplina encontrada. Execute o seed de disciplinas primeiro.');
      process.exit(1);
    }
    
    console.log(`📚 Encontradas ${disciplinas.length} disciplinas\n`);
    
    // Buscar assuntos
      const [assuntos] = await connection.query('SELECT id, disciplina_id as disciplinaId FROM assuntos LIMIT 10');
    
    // Buscar tópicos
      const [topicos] = await connection.query('SELECT id, assunto_id as assuntoId FROM topicos LIMIT 20');
    
    console.log('📝 Inserindo 40 questões de múltipla escolha...\n');
    
    let insertedCount = 0;
    
    // Inserir questões de múltipla escolha
    for (const q of MULTIPLE_CHOICE_QUESTIONS) {
      const uniqueCode = generateUniqueCode();
      const disciplina = randomElement(disciplinas);
      const assunto = assuntos.find(a => a.disciplinaId === disciplina.id) || randomElement(assuntos);
      const topico = topicos.find(t => t.assuntoId === assunto.id) || null;
      
      await connection.query(
        `INSERT INTO questions (
          uniqueCode, disciplinaId, assuntoId, topicoId,
          statementText, questionType,
          optionA, optionB, optionC, optionD, optionE, correctOption,
          explanationText, examBoard, examYear, difficulty, isActive
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uniqueCode,
          disciplina.id,
          assunto.id,
          topico?.id || null,
          q.statementText,
          'multiple_choice',
          q.optionA,
          q.optionB,
          q.optionC,
          q.optionD,
          q.optionE,
          q.correctOption,
          q.explanationText,
          randomElement(EXAM_BOARDS),
          randomYear(),
          q.difficulty,
          true,
        ]
      );
      
      insertedCount++;
      if (insertedCount % 10 === 0) {
        console.log(`   ✅ ${insertedCount} questões inseridas`);
      }
    }
    
    console.log('\n📝 Inserindo 10 questões verdadeiro/falso...\n');
    
    // Inserir questões verdadeiro/falso
    for (const q of TRUE_FALSE_QUESTIONS) {
      const uniqueCode = generateUniqueCode();
      const disciplina = randomElement(disciplinas);
      const assunto = assuntos.find(a => a.disciplinaId === disciplina.id) || randomElement(assuntos);
      const topico = topicos.find(t => t.assuntoId === assunto.id) || null;
      
      await connection.query(
        `INSERT INTO questions (
          uniqueCode, disciplinaId, assuntoId, topicoId,
          statementText, questionType, trueFalseAnswer,
          explanationText, examBoard, examYear, difficulty, isActive
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uniqueCode,
          disciplina.id,
          assunto.id,
          topico?.id || null,
          q.statementText,
          'true_false',
          q.trueFalseAnswer,
          q.explanationText,
          randomElement(EXAM_BOARDS),
          randomYear(),
          q.difficulty,
          true,
        ]
      );
      
      insertedCount++;
    }
    
    console.log(`\n✅ Seed concluído! ${insertedCount} questões inseridas com sucesso.\n`);
    
    // Estatísticas
    const [stats] = await connection.query(`
      SELECT 
        questionType,
        difficulty,
        COUNT(*) as count
      FROM questions
      GROUP BY questionType, difficulty
      ORDER BY questionType, difficulty
    `);
    
    console.log('📊 Estatísticas:');
    console.table(stats);
    
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

main();
