/**
 * Seed de Templates Padrão
 * Popula banco com templates reutilizáveis
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { avisosTemplates } from '../drizzle/schema-avisos.ts';
import { v4 as uuidv4 } from 'uuid';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não configurada');
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

console.log('🌱 Iniciando seed de templates...\n');

const templates = [
  {
    id: uuidv4(),
    nome: 'Boas-vindas Novo Aluno',
    descricao: 'Mensagem de boas-vindas para novos alunos',
    tipo: 'informativo',
    conteudoTemplate: `Olá {{primeiroNome}}! 👋

Seja muito bem-vindo(a) à plataforma DOM-EARA! Estamos muito felizes em tê-lo(a) conosco nessa jornada rumo à aprovação.

Aqui você encontrará:
✅ Banco de questões organizado por disciplina
✅ Materiais de estudo estruturados
✅ Cronograma inteligente personalizado
✅ Acompanhamento de progresso em tempo real

Seu email cadastrado: {{email}}
Plano atual: {{plano}}

Comece agora mesmo explorando nossa árvore de conhecimento e resolva suas primeiras questões!

Bons estudos! 📚`,
    variaveisDisponiveis: ['{{primeiroNome}}', '{{email}}', '{{plano}}'],
    criadoPor: '1', // Admin
    usadoCount: 0,
  },
  {
    id: uuidv4(),
    nome: 'Lembrete de Estudo Diário',
    descricao: 'Lembrete para manter consistência nos estudos',
    tipo: 'importante',
    conteudoTemplate: `Olá {{primeiroNome}}! ⏰

Não esqueça de dedicar um tempo aos seus estudos hoje!

A consistência é a chave para o sucesso em concursos públicos. Mesmo que sejam apenas 30 minutos, manter o ritmo diário faz toda a diferença.

💡 Dica: Comece resolvendo 10 questões da sua disciplina mais desafiadora.

Vamos juntos nessa! 💪`,
    variaveisDisponiveis: ['{{primeiroNome}}'],
    criadoPor: '1',
    usadoCount: 0,
  },
  {
    id: uuidv4(),
    nome: 'Parabéns por Meta Atingida',
    descricao: 'Parabenizar aluno por atingir meta de questões',
    tipo: 'urgente',
    conteudoTemplate: `Parabéns, {{nome}}! 🎉

Você acaba de atingir uma meta importante na sua jornada de estudos!

Seu desempenho tem sido excepcional e isso demonstra sua dedicação e comprometimento com a aprovação.

Continue assim! O sucesso é construído dia após dia, questão após questão.

Estamos orgulhosos do seu progresso! 🏆`,
    variaveisDisponiveis: ['{{nome}}'],
    criadoPor: '1',
    usadoCount: 0,
  },
  {
    id: uuidv4(),
    nome: 'Promoção Plano Premium',
    descricao: 'Oferta especial de upgrade para plano premium',
    tipo: 'premium',
    conteudoTemplate: `{{primeiroNome}}, temos uma oferta especial para você! 🌟

Upgrade para o Plano Premium e desbloqueie:

✨ Acesso ilimitado a todas as questões
✨ Materiais exclusivos em PDF
✨ Simulados completos
✨ Suporte prioritário
✨ Estatísticas avançadas de desempenho

Plano atual: {{plano}}

Aproveite esta oportunidade e acelere sua aprovação!`,
    variaveisDisponiveis: ['{{primeiroNome}}', '{{plano}}'],
    criadoPor: '1',
    usadoCount: 0,
  },
  {
    id: uuidv4(),
    nome: 'Atualização de Conteúdo',
    descricao: 'Notificar sobre novos materiais ou questões',
    tipo: 'informativo',
    conteudoTemplate: `Novidades na plataforma, {{primeiroNome}}! 📢

Acabamos de adicionar novos conteúdos que podem te ajudar:

📚 Novos materiais de estudo
❓ Banco de questões atualizado
📊 Novos simulados disponíveis

Acesse agora e aproveite todo o conteúdo novo para turbinar seus estudos!

Data de inscrição: {{dataInscricao}}`,
    variaveisDisponiveis: ['{{primeiroNome}}', '{{dataInscricao}}'],
    criadoPor: '1',
    usadoCount: 0,
  },
];

try {
  // Inserir templates
  for (const template of templates) {
    await db.insert(avisosTemplates).values(template);
    console.log(`✅ Template criado: ${template.nome}`);
  }

  console.log(`\n🎉 Seed concluído! ${templates.length} templates criados.`);
} catch (error) {
  console.error('❌ Erro ao executar seed:', error);
  process.exit(1);
} finally {
  await connection.end();
}
