import mysql from 'mysql2/promise';
import { config } from 'dotenv';
import crypto from 'crypto';

config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log('🌱 Iniciando seed de avisos...\n');

// Seed de avisos de teste (um de cada tipo)
const avisos = [
  {
    tipo: 'informativo',
    titulo: 'Novos materiais disponíveis!',
    conteudo: 'Acabamos de adicionar 50 novos PDFs de questões comentadas de Direito Constitucional. Confira agora na seção de materiais!',
    formato: 'toast',
    dispensavel: true,
    prioridade: 3,
    ativo: true,
  },
  {
    tipo: 'importante',
    titulo: 'Manutenção programada',
    conteudo: 'A plataforma ficará em manutenção no dia 15/01 das 02h às 06h. Planeje seus estudos com antecedência!',
    formato: 'banner',
    cta_texto: 'Ver detalhes',
    cta_url: '/manutencao',
    dispensavel: true,
    prioridade: 7,
    ativo: true,
  },
  {
    tipo: 'urgente',
    titulo: 'Prazo final para simulado',
    conteudo: 'Atenção! O simulado mensal termina hoje às 23h59. Não perca a oportunidade de testar seus conhecimentos!',
    formato: 'modal',
    cta_texto: 'Fazer simulado agora',
    cta_url: '/simulados',
    dispensavel: false,
    prioridade: 10,
    ativo: true,
  },
  {
    tipo: 'individual',
    titulo: 'Parabéns pela conquista!',
    conteudo: 'Você completou 30 dias de estudos consecutivos! Continue assim e alcance seus objetivos. 🎉',
    formato: 'modal',
    cta_texto: 'Ver minhas estatísticas',
    cta_url: '/estatisticas',
    dispensavel: true,
    prioridade: 5,
    ativo: true,
  },
  {
    tipo: 'premium',
    titulo: 'Upgrade para Premium',
    conteudo: 'Desbloqueie acesso ilimitado a todos os simulados, materiais exclusivos e suporte prioritário. Aproveite 30% de desconto!',
    formato: 'modal',
    cta_texto: 'Conhecer planos',
    cta_url: '/planos',
    dispensavel: true,
    prioridade: 4,
    ativo: true,
  },
];

try {
  // Inserir avisos
  for (const aviso of avisos) {
    const avisoId = crypto.randomUUID();
    const [result] = await connection.execute(
      `INSERT INTO avisos (
        id, tipo, formato_exibicao, titulo, conteudo, cta_texto, cta_url,
        dismissavel, prioridade, status, criado_em, atualizado_em
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ativo', NOW(), NOW())`,
      [
        avisoId,
        aviso.tipo,
        aviso.formato,
        aviso.titulo,
        aviso.conteudo,
        aviso.cta_texto || null,
        aviso.cta_url || null,
        aviso.dispensavel,
        aviso.prioridade,
      ]
    );

    console.log(`✅ Aviso criado: "${aviso.titulo}" (ID: ${result.insertId})`);
  }

  console.log(`\n🎉 Seed concluído! ${avisos.length} avisos inseridos com sucesso.`);
} catch (error) {
  console.error('❌ Erro ao executar seed:', error);
  process.exit(1);
} finally {
  await connection.end();
}
