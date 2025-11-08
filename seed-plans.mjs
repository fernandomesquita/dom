/**
 * Script Seed - 10 Planos Mockup para Testes
 * 
 * Execução: node seed-plans.mjs
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { plans } from './drizzle/schema-plans.js';

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
    description: 'Prepare-se para o concurso da EARA com nosso plano completo. Inclui todas as disciplinas, questões comentadas, simulados e acompanhamento personalizado.',
    version: 'v1.0',
    logoUrl: 'https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=EARA',
    featuredImageUrl: 'https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=EARA+Pre-Edital',
    landingPageUrl: null,
    category: 'Gratuito',
    editalStatus: 'Pré-edital',
    entity: 'EARA',
    role: 'Sargento da Aeronáutica',
    tags: JSON.stringify(['EARA', 'Aeronáutica', 'Pré-edital', 'Completo']),
    knowledgeRootId: crypto.randomUUID(),
    paywallRequired: false,
    price: '0.00',
    validityDate: null,
    durationDays: 365,
    status: 'Ativo',
    isFeatured: true,
    mentorId: null,
    createdBy: null,
    updatedBy: null,
    customSettings: JSON.stringify({
      features: ['Questões ilimitadas', 'Simulados semanais', 'Cronograma personalizado', 'Suporte via fórum']
    }),
  },
  {
    id: crypto.randomUUID(),
    name: 'EARA Pós-Edital - Reta Final',
    description: 'Foco total na aprovação! Plano intensivo para quem já tem o edital publicado. Revisões, simulados e estratégias de prova.',
    version: 'v1.0',
    logoUrl: 'https://via.placeholder.com/150x150/10B981/FFFFFF?text=EARA',
    featuredImageUrl: 'https://via.placeholder.com/800x400/10B981/FFFFFF?text=EARA+Pos-Edital',
    landingPageUrl: null,
    category: 'Gratuito',
    editalStatus: 'Pós-edital',
    entity: 'EARA',
    role: 'Sargento da Aeronáutica',
    tags: JSON.stringify(['EARA', 'Aeronáutica', 'Pós-edital', 'Reta Final']),
    knowledgeRootId: crypto.randomUUID(),
    paywallRequired: false,
    price: '0.00',
    validityDate: '2025-12-31',
    durationDays: 180,
    status: 'Ativo',
    isFeatured: false,
    mentorId: null,
    createdBy: null,
    updatedBy: null,
    customSettings: JSON.stringify({
      features: ['Revisões diárias', 'Simulados realistas', 'Cronômetro de prova', 'Análise de desempenho']
    }),
  },
  {
    id: crypto.randomUUID(),
    name: 'Banco do Brasil - Escriturário',
    description: 'Conquiste sua vaga no BB! Plano completo com todas as disciplinas, questões da banca e simulados.',
    version: 'v1.0',
    logoUrl: 'https://via.placeholder.com/150x150/F59E0B/FFFFFF?text=BB',
    featuredImageUrl: 'https://via.placeholder.com/800x400/F59E0B/FFFFFF?text=Banco+do+Brasil',
    landingPageUrl: null,
    category: 'Gratuito',
    editalStatus: 'Pré-edital',
    entity: 'Banco do Brasil',
    role: 'Escriturário',
    tags: JSON.stringify(['Banco do Brasil', 'BB', 'Escriturário', 'Bancário']),
    knowledgeRootId: crypto.randomUUID(),
    paywallRequired: false,
    price: '0.00',
    validityDate: null,
    durationDays: 365,
    status: 'Ativo',
    isFeatured: false,
    mentorId: null,
    createdBy: null,
    updatedBy: null,
    customSettings: JSON.stringify({
      features: ['Questões CESGRANRIO', 'Simulados semanais', 'Videoaulas', 'PDFs resumidos']
    }),
  },
  {
    id: crypto.randomUUID(),
    name: 'Polícia Federal - Agente',
    description: 'Realize o sonho de ser Agente da PF! Plano completo com foco em questões CEBRASPE e simulados.',
    version: 'v1.0',
    logoUrl: 'https://via.placeholder.com/150x150/EF4444/FFFFFF?text=PF',
    featuredImageUrl: 'https://via.placeholder.com/800x400/EF4444/FFFFFF?text=Policia+Federal',
    landingPageUrl: null,
    category: 'Gratuito',
    editalStatus: 'N/A',
    entity: 'Polícia Federal',
    role: 'Agente',
    tags: JSON.stringify(['Polícia Federal', 'PF', 'Agente', 'Federal']),
    knowledgeRootId: crypto.randomUUID(),
    paywallRequired: false,
    price: '0.00',
    validityDate: null,
    durationDays: 365,
    status: 'Ativo',
    isFeatured: false,
    mentorId: null,
    createdBy: null,
    updatedBy: null,
    customSettings: JSON.stringify({
      features: ['Questões CEBRASPE', 'Simulados mensais', 'Fórum exclusivo', 'Cronograma adaptativo']
    }),
  },
  {
    id: crypto.randomUUID(),
    name: 'Receita Federal - Auditor Fiscal',
    description: 'O concurso dos sonhos! Plano premium com todas as disciplinas, questões ESAF/CEBRASPE e mentorias.',
    version: 'v1.0',
    logoUrl: 'https://via.placeholder.com/150x150/8B5CF6/FFFFFF?text=RF',
    featuredImageUrl: 'https://via.placeholder.com/800x400/8B5CF6/FFFFFF?text=Receita+Federal',
    landingPageUrl: null,
    category: 'Pago',
    editalStatus: 'Pré-edital',
    entity: 'Receita Federal',
    role: 'Auditor Fiscal',
    tags: JSON.stringify(['Receita Federal', 'RF', 'Auditor', 'Fiscal']),
    knowledgeRootId: crypto.randomUUID(),
    paywallRequired: true,
    price: '997.00',
    validityDate: null,
    durationDays: 730,
    status: 'Ativo',
    isFeatured: false,
    mentorId: null,
    createdBy: null,
    updatedBy: null,
    customSettings: JSON.stringify({
      features: ['10.000+ questões', 'Mentorias mensais', 'Simulados ilimitados', 'Garantia de 2 anos']
    }),
  },
  {
    id: crypto.randomUUID(),
    name: 'TRF - Técnico Judiciário',
    description: 'Ingresse no Tribunal Regional Federal! Plano com questões FCC e simulados realistas.',
    version: 'v1.0',
    logoUrl: 'https://via.placeholder.com/150x150/06B6D4/FFFFFF?text=TRF',
    featuredImageUrl: 'https://via.placeholder.com/800x400/06B6D4/FFFFFF?text=TRF',
    landingPageUrl: null,
    category: 'Gratuito',
    editalStatus: 'Pré-edital',
    entity: 'TRF',
    role: 'Técnico Judiciário',
    tags: JSON.stringify(['TRF', 'Tribunal', 'Técnico', 'Judiciário']),
    knowledgeRootId: crypto.randomUUID(),
    paywallRequired: false,
    price: '0.00',
    validityDate: null,
    durationDays: 365,
    status: 'Ativo',
    isFeatured: false,
    mentorId: null,
    createdBy: null,
    updatedBy: null,
    customSettings: JSON.stringify({
      features: ['Questões FCC', 'Simulados quinzenais', 'Cronograma 6 meses', 'Fórum de dúvidas']
    }),
  },
  {
    id: crypto.randomUUID(),
    name: 'INSS - Técnico do Seguro Social',
    description: 'Estabilidade e carreira! Plano completo para o concurso do INSS com foco em CEBRASPE.',
    version: 'v1.0',
    logoUrl: 'https://via.placeholder.com/150x150/14B8A6/FFFFFF?text=INSS',
    featuredImageUrl: 'https://via.placeholder.com/800x400/14B8A6/FFFFFF?text=INSS',
    landingPageUrl: null,
    category: 'Gratuito',
    editalStatus: 'N/A',
    entity: 'INSS',
    role: 'Técnico do Seguro Social',
    tags: JSON.stringify(['INSS', 'Previdência', 'Técnico', 'Federal']),
    knowledgeRootId: crypto.randomUUID(),
    paywallRequired: false,
    price: '0.00',
    validityDate: null,
    durationDays: 365,
    status: 'Ativo',
    isFeatured: false,
    mentorId: null,
    createdBy: null,
    updatedBy: null,
    customSettings: JSON.stringify({
      features: ['Questões CEBRASPE', 'Simulados mensais', 'PDFs atualizados', 'Cronograma flexível']
    }),
  },
  {
    id: crypto.randomUUID(),
    name: 'Petrobras - Técnico de Administração',
    description: 'Trabalhe na maior empresa do Brasil! Plano com questões CESGRANRIO e simulados.',
    version: 'v1.0',
    logoUrl: 'https://via.placeholder.com/150x150/16A34A/FFFFFF?text=PB',
    featuredImageUrl: 'https://via.placeholder.com/800x400/16A34A/FFFFFF?text=Petrobras',
    landingPageUrl: null,
    category: 'Pago',
    editalStatus: 'Pré-edital',
    entity: 'Petrobras',
    role: 'Técnico de Administração',
    tags: JSON.stringify(['Petrobras', 'Técnico', 'Administração', 'Estatal']),
    knowledgeRootId: crypto.randomUUID(),
    paywallRequired: true,
    price: '497.00',
    validityDate: null,
    durationDays: 365,
    status: 'Ativo',
    isFeatured: false,
    mentorId: null,
    createdBy: null,
    updatedBy: null,
    customSettings: JSON.stringify({
      features: ['Questões CESGRANRIO', 'Simulados semanais', 'Videoaulas HD', 'Suporte prioritário']
    }),
  },
  {
    id: crypto.randomUUID(),
    name: 'Correios - Carteiro',
    description: 'Comece sua carreira nos Correios! Plano básico com questões e simulados.',
    version: 'v1.0',
    logoUrl: 'https://via.placeholder.com/150x150/F97316/FFFFFF?text=CR',
    featuredImageUrl: 'https://via.placeholder.com/800x400/F97316/FFFFFF?text=Correios',
    landingPageUrl: null,
    category: 'Gratuito',
    editalStatus: 'N/A',
    entity: 'Correios',
    role: 'Carteiro',
    tags: JSON.stringify(['Correios', 'Carteiro', 'Nível Médio', 'Estatal']),
    knowledgeRootId: crypto.randomUUID(),
    paywallRequired: false,
    price: '0.00',
    validityDate: null,
    durationDays: 180,
    status: 'Ativo',
    isFeatured: false,
    mentorId: null,
    createdBy: null,
    updatedBy: null,
    customSettings: JSON.stringify({
      features: ['Questões básicas', 'Simulados mensais', 'Cronograma 3 meses', 'PDFs gratuitos']
    }),
  },
  {
    id: crypto.randomUUID(),
    name: 'Plano Gratuito - Teste',
    description: 'Experimente nossa plataforma! Acesso limitado a questões e materiais básicos.',
    version: 'v1.0',
    logoUrl: 'https://via.placeholder.com/150x150/64748B/FFFFFF?text=FREE',
    featuredImageUrl: 'https://via.placeholder.com/800x400/64748B/FFFFFF?text=Plano+Gratuito',
    landingPageUrl: null,
    category: 'Gratuito',
    editalStatus: 'N/A',
    entity: 'DOM-EARA',
    role: 'Teste',
    tags: JSON.stringify(['Gratuito', 'Teste', 'Demo', 'Básico']),
    knowledgeRootId: crypto.randomUUID(),
    paywallRequired: false,
    price: '0.00',
    validityDate: null,
    durationDays: 30,
    status: 'Ativo',
    isFeatured: false,
    mentorId: null,
    createdBy: null,
    updatedBy: null,
    customSettings: JSON.stringify({
      features: ['100 questões', '1 simulado', 'Cronograma básico', 'Fórum limitado']
    }),
  },
];

// ============================================================================
// INSERIR NO BANCO
// ============================================================================

try {
  console.log('🌱 Iniciando seed de planos...');
  
  for (const plan of mockPlans) {
    await db.insert(plans).values(plan);
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
