import { drizzle } from 'drizzle-orm/mysql2';
import { forumCategories } from '../drizzle/schema-forum.ts';
import { randomUUID } from 'crypto';

/**
 * Seed de Categorias Iniciais do Fórum
 */

const db = drizzle(process.env.DATABASE_URL);

const categorias = [
  {
    id: randomUUID(),
    nome: 'Geral',
    descricao: 'Discussões gerais sobre concursos públicos',
    icone: '💬',
    cor: '#3B82F6',
    ordem: 1,
  },
  {
    id: randomUUID(),
    nome: 'Dúvidas de Estudo',
    descricao: 'Tire suas dúvidas sobre matérias e conteúdos',
    icone: '❓',
    cor: '#10B981',
    ordem: 2,
  },
  {
    id: randomUUID(),
    nome: 'Estratégias',
    descricao: 'Compartilhe e discuta estratégias de estudo',
    icone: '🎯',
    cor: '#F59E0B',
    ordem: 3,
  },
  {
    id: randomUUID(),
    nome: 'Simulados',
    descricao: 'Discussões sobre simulados e provas anteriores',
    icone: '📝',
    cor: '#8B5CF6',
    ordem: 4,
  },
  {
    id: randomUUID(),
    nome: 'Motivação',
    descricao: 'Compartilhe sua jornada e motive outros concurseiros',
    icone: '💪',
    cor: '#EF4444',
    ordem: 5,
  },
  {
    id: randomUUID(),
    nome: 'Editais',
    descricao: 'Discussões sobre editais e concursos abertos',
    icone: '📢',
    cor: '#06B6D4',
    ordem: 6,
  },
];

async function seed() {
  console.log('🌱 Iniciando seed de categorias do fórum...');

  try {
    for (const categoria of categorias) {
      await db.insert(forumCategories).values(categoria);
      console.log(`✅ Categoria criada: ${categoria.nome}`);
    }

    console.log('✅ Seed concluído com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    process.exit(1);
  }
}

seed();
