/**
 * Script Seed - 10 Planos Mockup (Versão Simplificada)
 * 
 * Usa apenas os campos que existem no banco de dados atual
 * Execução: npx tsx seed-plans-simple.mjs
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não configurada');
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

// ============================================================================
// 10 PLANOS MOCKUP
// ============================================================================

const mockPlans = [
  {
    id: crypto.randomUUID(),
    name: 'EARA Pré-Edital - Plano Completo',
    slug: 'eara-pre-edital-completo',
    description: 'Prepare-se para o concurso da EARA com nosso plano completo. Inclui todas as disciplinas, questões comentadas, simulados e acompanhamento personalizado.',
    category: 'Gratuito',
    entity: 'EARA',
    role: 'Sargento da Aeronáutica',
    edital_status: 'Pré-edital',
    featured_image_url: 'https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=EARA+Pre-Edital',
    price: 'Gratuito',
    landing_page_url: null,
    duration_days: 365,
    validity_date: null,
    tags: JSON.stringify(['EARA', 'Aeronáutica', 'Pré-edital', 'Completo']),
    is_featured: 1,
    is_hidden: 0,
    mentor_id: null,
  },
  {
    id: crypto.randomUUID(),
    name: 'EARA Pós-Edital - Reta Final',
    slug: 'eara-pos-edital-reta-final',
    description: 'Foco total na aprovação! Plano intensivo para quem já tem o edital publicado. Revisões, simulados e estratégias de prova.',
    category: 'Gratuito',
    entity: 'EARA',
    role: 'Sargento da Aeronáutica',
    edital_status: 'Pós-edital',
    featured_image_url: 'https://via.placeholder.com/800x400/10B981/FFFFFF?text=EARA+Pos-Edital',
    price: 'Gratuito',
    landing_page_url: null,
    duration_days: 180,
    validity_date: '2025-12-31 23:59:59',
    tags: JSON.stringify(['EARA', 'Aeronáutica', 'Pós-edital', 'Reta Final']),
    is_featured: 0,
    is_hidden: 0,
    mentor_id: null,
  },
  {
    id: crypto.randomUUID(),
    name: 'Banco do Brasil - Escriturário',
    slug: 'banco-do-brasil-escriturario',
    description: 'Conquiste sua vaga no BB! Plano completo com todas as disciplinas, questões da banca e simulados.',
    category: 'Gratuito',
    entity: 'Banco do Brasil',
    role: 'Escriturário',
    edital_status: 'Pré-edital',
    featured_image_url: 'https://via.placeholder.com/800x400/F59E0B/FFFFFF?text=Banco+do+Brasil',
    price: 'Gratuito',
    landing_page_url: null,
    duration_days: 365,
    validity_date: null,
    tags: JSON.stringify(['Banco do Brasil', 'BB', 'Escriturário', 'Bancário']),
    is_featured: 0,
    is_hidden: 0,
    mentor_id: null,
  },
  {
    id: crypto.randomUUID(),
    name: 'Polícia Federal - Agente',
    slug: 'policia-federal-agente',
    description: 'Realize o sonho de ser Agente da PF! Plano completo com foco em questões CEBRASPE e simulados.',
    category: 'Gratuito',
    entity: 'Polícia Federal',
    role: 'Agente',
    edital_status: 'N/A',
    featured_image_url: 'https://via.placeholder.com/800x400/EF4444/FFFFFF?text=Policia+Federal',
    price: 'Gratuito',
    landing_page_url: null,
    duration_days: 365,
    validity_date: null,
    tags: JSON.stringify(['Polícia Federal', 'PF', 'Agente', 'Federal']),
    is_featured: 0,
    is_hidden: 0,
    mentor_id: null,
  },
  {
    id: crypto.randomUUID(),
    name: 'Receita Federal - Auditor Fiscal',
    slug: 'receita-federal-auditor-fiscal',
    description: 'O concurso dos sonhos! Plano premium com todas as disciplinas, questões ESAF/CEBRASPE e mentorias.',
    category: 'Pago',
    entity: 'Receita Federal',
    role: 'Auditor Fiscal',
    edital_status: 'Pré-edital',
    featured_image_url: 'https://via.placeholder.com/800x400/8B5CF6/FFFFFF?text=Receita+Federal',
    price: 'R$ 997,00',
    landing_page_url: 'https://exemplo.com/receita-federal',
    duration_days: 730,
    validity_date: null,
    tags: JSON.stringify(['Receita Federal', 'RF', 'Auditor', 'Fiscal']),
    is_featured: 0,
    is_hidden: 0,
    mentor_id: null,
  },
  {
    id: crypto.randomUUID(),
    name: 'TRF - Técnico Judiciário',
    slug: 'trf-tecnico-judiciario',
    description: 'Ingresse no Tribunal Regional Federal! Plano com questões FCC e simulados realistas.',
    category: 'Gratuito',
    entity: 'TRF',
    role: 'Técnico Judiciário',
    edital_status: 'Pré-edital',
    featured_image_url: 'https://via.placeholder.com/800x400/06B6D4/FFFFFF?text=TRF',
    price: 'Gratuito',
    landing_page_url: null,
    duration_days: 365,
    validity_date: null,
    tags: JSON.stringify(['TRF', 'Tribunal', 'Técnico', 'Judiciário']),
    is_featured: 0,
    is_hidden: 0,
    mentor_id: null,
  },
  {
    id: crypto.randomUUID(),
    name: 'INSS - Técnico do Seguro Social',
    slug: 'inss-tecnico-seguro-social',
    description: 'Estabilidade e carreira! Plano completo para o concurso do INSS com foco em CEBRASPE.',
    category: 'Gratuito',
    entity: 'INSS',
    role: 'Técnico do Seguro Social',
    edital_status: 'N/A',
    featured_image_url: 'https://via.placeholder.com/800x400/14B8A6/FFFFFF?text=INSS',
    price: 'Gratuito',
    landing_page_url: null,
    duration_days: 365,
    validity_date: null,
    tags: JSON.stringify(['INSS', 'Previdência', 'Técnico', 'Federal']),
    is_featured: 0,
    is_hidden: 0,
    mentor_id: null,
  },
  {
    id: crypto.randomUUID(),
    name: 'Petrobras - Técnico de Administração',
    slug: 'petrobras-tecnico-administracao',
    description: 'Trabalhe na maior empresa do Brasil! Plano com questões CESGRANRIO e simulados.',
    category: 'Pago',
    entity: 'Petrobras',
    role: 'Técnico de Administração',
    edital_status: 'Pré-edital',
    featured_image_url: 'https://via.placeholder.com/800x400/16A34A/FFFFFF?text=Petrobras',
    price: 'R$ 497,00',
    landing_page_url: 'https://exemplo.com/petrobras',
    duration_days: 365,
    validity_date: null,
    tags: JSON.stringify(['Petrobras', 'Técnico', 'Administração', 'Estatal']),
    is_featured: 0,
    is_hidden: 0,
    mentor_id: null,
  },
  {
    id: crypto.randomUUID(),
    name: 'Correios - Carteiro',
    slug: 'correios-carteiro',
    description: 'Comece sua carreira nos Correios! Plano básico com questões e simulados.',
    category: 'Gratuito',
    entity: 'Correios',
    role: 'Carteiro',
    edital_status: 'N/A',
    featured_image_url: 'https://via.placeholder.com/800x400/F97316/FFFFFF?text=Correios',
    price: 'Gratuito',
    landing_page_url: null,
    duration_days: 180,
    validity_date: null,
    tags: JSON.stringify(['Correios', 'Carteiro', 'Nível Médio', 'Estatal']),
    is_featured: 0,
    is_hidden: 0,
    mentor_id: null,
  },
  {
    id: crypto.randomUUID(),
    name: 'Plano Gratuito - Teste',
    slug: 'plano-gratuito-teste',
    description: 'Experimente nossa plataforma! Acesso limitado a questões e materiais básicos.',
    category: 'Gratuito',
    entity: 'DOM-EARA',
    role: 'Teste',
    edital_status: 'N/A',
    featured_image_url: 'https://via.placeholder.com/800x400/64748B/FFFFFF?text=Plano+Gratuito',
    price: 'Gratuito',
    landing_page_url: null,
    duration_days: 30,
    validity_date: null,
    tags: JSON.stringify(['Gratuito', 'Teste', 'Demo', 'Básico']),
    is_featured: 0,
    is_hidden: 0,
    mentor_id: null,
  },
];

// ============================================================================
// INSERIR NO BANCO
// ============================================================================

try {
  console.log('🌱 Iniciando seed de planos...\n');
  
  for (const plan of mockPlans) {
    const query = `
      INSERT INTO plans (
        id, name, slug, description, category, entity, role, edital_status,
        featured_image_url, price, landing_page_url, duration_days, validity_date,
        tags, is_featured, is_hidden, mentor_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await connection.execute(query, [
      plan.id,
      plan.name,
      plan.slug,
      plan.description,
      plan.category,
      plan.entity,
      plan.role,
      plan.edital_status,
      plan.featured_image_url,
      plan.price,
      plan.landing_page_url,
      plan.duration_days,
      plan.validity_date,
      plan.tags,
      plan.is_featured,
      plan.is_hidden,
      plan.mentor_id,
    ]);
    
    console.log(`✅ Plano criado: ${plan.name}`);
  }
  
  console.log('\n🎉 Seed concluído com sucesso!');
  console.log(`📊 Total de planos criados: ${mockPlans.length}`);
  
} catch (error) {
  console.error('❌ Erro ao executar seed:', error);
  process.exit(1);
} finally {
  await connection.end();
}
