#!/usr/bin/env node

/**
 * Script rápido: Criar árvore básica (disciplinas, assuntos, tópicos)
 * Para permitir seed de questões
 */

import mysql from 'mysql2/promise';
import 'dotenv/config';
import { nanoid } from 'nanoid';

const DISCIPLINAS = [
  { codigo: 'DIR-CONST', nome: 'Direito Constitucional', cor: '#4F46E5' },
  { codigo: 'DIR-ADM', nome: 'Direito Administrativo', cor: '#10B981' },
  { codigo: 'PORT', nome: 'Língua Portuguesa', cor: '#F59E0B' },
  { codigo: 'RACIOCINIO', nome: 'Raciocínio Lógico', cor: '#EF4444' },
  { codigo: 'INFORMATICA', nome: 'Informática', cor: '#8B5CF6' },
];

const ASSUNTOS = {
  'DIR-CONST': ['Princípios Fundamentais', 'Direitos e Garantias', 'Organização do Estado'],
  'DIR-ADM': ['Princípios da Administração', 'Atos Administrativos', 'Licitações'],
  'PORT': ['Gramática', 'Interpretação de Texto', 'Redação Oficial'],
  'RACIOCINIO': ['Lógica Proposicional', 'Raciocínio Quantitativo', 'Sequências'],
  'INFORMATICA': ['Hardware', 'Software', 'Redes e Internet'],
};

const TOPICOS = {
  'Princípios Fundamentais': ['República', 'Federação', 'Separação de Poderes'],
  'Direitos e Garantias': ['Direitos Individuais', 'Direitos Sociais', 'Remédios Constitucionais'],
  'Organização do Estado': ['União', 'Estados', 'Municípios'],
  'Princípios da Administração': ['LIMPE', 'Legalidade', 'Impessoalidade'],
  'Atos Administrativos': ['Conceito', 'Atributos', 'Classificação'],
  'Licitações': ['Lei 8.666/93', 'Modalidades', 'Fases'],
  'Gramática': ['Morfologia', 'Sintaxe', 'Pontuação'],
  'Interpretação de Texto': ['Compreensão', 'Inferência', 'Coesão'],
  'Redação Oficial': ['Padrão Ofício', 'Correspondências', 'Atos Normativos'],
  'Lógica Proposicional': ['Proposições', 'Conectivos', 'Tabela Verdade'],
  'Raciocínio Quantitativo': ['Porcentagem', 'Razão e Proporção', 'Regra de Três'],
  'Sequências': ['Numéricas', 'Alfabéticas', 'Figuras'],
  'Hardware': ['Componentes', 'Periféricos', 'Armazenamento'],
  'Software': ['Sistemas Operacionais', 'Aplicativos', 'Utilitários'],
  'Redes e Internet': ['Protocolos', 'Segurança', 'Navegadores'],
};

async function main() {
  console.log('🌱 Criando árvore básica de conhecimento...\n');
  
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    // Buscar usuário admin (owner)
    const [users] = await connection.query('SELECT id FROM users LIMIT 1');
    const createdBy = users[0]?.id || null;
    
    console.log('📚 Inserindo disciplinas...\n');
    
    const disciplinaIds = {};
    
    for (const disc of DISCIPLINAS) {
      const id = nanoid();
      const slug = disc.codigo.toLowerCase();
      
      await connection.query(
        `INSERT INTO disciplinas (id, codigo, slug, nome, cor_hex, sort_order, ativo, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, disc.codigo, slug, disc.nome, disc.cor, 0, true, createdBy]
      );
      
      disciplinaIds[disc.codigo] = id;
      console.log(`   ✅ ${disc.nome}`);
    }
    
    console.log('\n📖 Inserindo assuntos...\n');
    
    const assuntoIds = {};
    
    for (const [discCodigo, assuntos] of Object.entries(ASSUNTOS)) {
      const disciplinaId = disciplinaIds[discCodigo];
      
      for (const assuntoNome of assuntos) {
        const id = nanoid();
        const slug = assuntoNome.toLowerCase().replace(/\s+/g, '-');
        
        await connection.query(
          `INSERT INTO assuntos (id, disciplina_id, codigo, slug, nome, sort_order, ativo, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, disciplinaId, `ASS-${id.substring(0, 6)}`, slug, assuntoNome, 0, true, createdBy]
        );
        
        assuntoIds[assuntoNome] = id;
      }
    }
    
    console.log(`   ✅ ${Object.keys(assuntoIds).length} assuntos inseridos`);
    
    console.log('\n📝 Inserindo tópicos...\n');
    
    let topicoCount = 0;
    
    for (const [assuntoNome, topicos] of Object.entries(TOPICOS)) {
      const assuntoId = assuntoIds[assuntoNome];
      
      if (!assuntoId) continue;
      
      // Buscar disciplinaId do assunto
      const [assuntoData] = await connection.query(
        'SELECT disciplina_id FROM assuntos WHERE id = ?',
        [assuntoId]
      );
      const disciplinaId = assuntoData[0]?.disciplina_id;
      
      for (const topicoNome of topicos) {
        const id = nanoid();
        const slug = topicoNome.toLowerCase().replace(/\s+/g, '-');
        
        await connection.query(
          `INSERT INTO topicos (id, assunto_id, disciplina_id, codigo, slug, nome, sort_order, ativo, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, assuntoId, disciplinaId, `TOP-${id.substring(0, 6)}`, slug, topicoNome, 0, true, createdBy]
        );
        
        topicoCount++;
      }
    }
    
    console.log(`   ✅ ${topicoCount} tópicos inseridos`);
    
    console.log('\n✅ Árvore básica criada com sucesso!\n');
    
    // Estatísticas
    const [discCount] = await connection.query('SELECT COUNT(*) as total FROM disciplinas');
    const [assCount] = await connection.query('SELECT COUNT(*) as total FROM assuntos');
    const [topCount] = await connection.query('SELECT COUNT(*) as total FROM topicos');
    
    console.log('📊 Resumo:');
    console.log(`   - Disciplinas: ${discCount[0].total}`);
    console.log(`   - Assuntos: ${assCount[0].total}`);
    console.log(`   - Tópicos: ${topCount[0].total}`);
    
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

main();
