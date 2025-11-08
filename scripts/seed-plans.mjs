/**
 * Seed de Planos de Estudo
 * 
 * Popula banco com 5 planos exemplo (mix pago/gratuito, pré/pós-edital)
 */

import mysql from 'mysql2/promise';
import { randomUUID } from 'crypto';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não definida');
  process.exit(1);
}

async function main() {
  const connection = await mysql.createConnection(DATABASE_URL);

  try {
    console.log('🌱 Iniciando seed de planos...\n');

    // Limpar tabelas (ordem: enrollments primeiro por FK)
    await connection.execute('DELETE FROM plan_enrollments');
    await connection.execute('DELETE FROM plans');
    console.log('✓ Tabelas limpas');

    // Planos de exemplo
    const plans = [
      {
        id: randomUUID(),
        name: 'Concurso TRF 5ª Região - Analista Judiciário',
        slug: 'trf5-analista-judiciario-2025',
        description: 'Plano completo para aprovação no concurso do TRF 5ª Região. Inclui cronograma de estudos, banco de questões segmentado por disciplina e simulados baseados em provas anteriores.',
        category: 'Pago',
        entity: 'TRF 5ª Região',
        role: 'Analista Judiciário - Área Judiciária',
        editalStatus: 'Pós-edital',
        featuredImageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=600&fit=crop',
        price: 'R$ 497,00',
        landingPageUrl: 'https://exemplo.com/trf5-analista',
        durationDays: 180,
        validityDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        tags: JSON.stringify(['Direito', 'Federal', 'TRF', 'Nível Superior']),
        isFeatured: true,
        isHidden: false,
        mentorId: null,
      },
      {
        id: randomUUID(),
        name: 'Preparação INSS - Técnico do Seguro Social',
        slug: 'inss-tecnico-seguro-social',
        description: 'Plano gratuito de preparação para o concurso do INSS. Materiais organizados por disciplina, questões comentadas e cronograma sugerido de 90 dias.',
        category: 'Gratuito',
        entity: 'INSS',
        role: 'Técnico do Seguro Social',
        editalStatus: 'Pré-edital',
        featuredImageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',
        price: null,
        landingPageUrl: null,
        durationDays: 90,
        validityDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        tags: JSON.stringify(['Previdência', 'Federal', 'INSS', 'Nível Médio']),
        isFeatured: false,
        isHidden: false,
        mentorId: null,
      },
      {
        id: randomUUID(),
        name: 'Polícia Federal - Agente de Polícia Federal',
        slug: 'pf-agente-policia-federal',
        description: 'Preparação completa para o concurso da Polícia Federal. Inclui todas as disciplinas do edital, questões de provas anteriores, simulados cronometrados e orientações sobre prova física.',
        category: 'Pago',
        entity: 'Polícia Federal',
        role: 'Agente de Polícia Federal',
        editalStatus: 'Pós-edital',
        featuredImageUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=800&h=600&fit=crop',
        price: 'R$ 897,00',
        landingPageUrl: 'https://exemplo.com/pf-agente',
        durationDays: 240,
        validityDate: new Date(Date.now() + 240 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        tags: JSON.stringify(['Policial', 'Federal', 'PF', 'Nível Superior', 'Prova Física']),
        isFeatured: false,
        isHidden: false,
        mentorId: null,
      },
      {
        id: randomUUID(),
        name: 'Tribunal de Justiça SP - Escrevente Técnico Judiciário',
        slug: 'tjsp-escrevente-tecnico-judiciario',
        description: 'Plano gratuito de estudos para o concurso do TJ-SP. Materiais de Português, Matemática, Direito Constitucional, Administrativo e Processual Civil. Questões comentadas e simulados.',
        category: 'Gratuito',
        entity: 'TJ-SP',
        role: 'Escrevente Técnico Judiciário',
        editalStatus: 'Pré-edital',
        featuredImageUrl: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800&h=600&fit=crop',
        price: null,
        landingPageUrl: null,
        durationDays: 120,
        validityDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        tags: JSON.stringify(['Judiciário', 'Estadual', 'TJ-SP', 'Nível Médio']),
        isFeatured: false,
        isHidden: false,
        mentorId: null,
      },
      {
        id: randomUUID(),
        name: 'Receita Federal - Auditor Fiscal',
        slug: 'receita-federal-auditor-fiscal',
        description: 'Plano premium para aprovação na Receita Federal. Inclui todas as disciplinas específicas (Contabilidade, Auditoria, Direito Tributário), questões ESAF/CEBRASPE, simulados e mentorias ao vivo.',
        category: 'Pago',
        entity: 'Receita Federal do Brasil',
        role: 'Auditor Fiscal da Receita Federal',
        editalStatus: 'N/A',
        featuredImageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop',
        price: 'R$ 1.297,00',
        landingPageUrl: 'https://exemplo.com/receita-auditor',
        durationDays: 365,
        validityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        tags: JSON.stringify(['Fiscal', 'Federal', 'Receita', 'Nível Superior', 'Alto Salário']),
        isFeatured: false,
        isHidden: false,
        mentorId: null,
      },
    ];

    // Inserir planos
    for (const plan of plans) {
      await connection.execute(
        `INSERT INTO plans (
          id, name, slug, description, category, entity, role, edital_status,
          featured_image_url, price, landing_page_url, duration_days, validity_date,
          tags, is_featured, is_hidden, mentor_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          plan.id,
          plan.name,
          plan.slug,
          plan.description,
          plan.category,
          plan.entity,
          plan.role,
          plan.editalStatus,
          plan.featuredImageUrl,
          plan.price,
          plan.landingPageUrl,
          plan.durationDays,
          plan.validityDate,
          plan.tags,
          plan.isFeatured ? 1 : 0,
          plan.isHidden ? 1 : 0,
          plan.mentorId,
        ]
      );
      console.log(`✓ Plano criado: ${plan.name} (${plan.category})`);
    }

    console.log(`\n✅ Seed concluído! ${plans.length} planos criados.`);
    console.log('\n📊 Resumo:');
    console.log(`  - Pagos: ${plans.filter(p => p.category === 'Pago').length}`);
    console.log(`  - Gratuitos: ${plans.filter(p => p.category === 'Gratuito').length}`);
    console.log(`  - Pré-edital: ${plans.filter(p => p.editalStatus === 'Pré-edital').length}`);
    console.log(`  - Pós-edital: ${plans.filter(p => p.editalStatus === 'Pós-edital').length}`);
    console.log(`  - Em destaque: ${plans.filter(p => p.isFeatured).length}`);

  } catch (error) {
    console.error('❌ Erro no seed:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
