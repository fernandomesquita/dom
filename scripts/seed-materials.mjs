import mysql from 'mysql2/promise';

/**
 * Script de seed para popular materiais de teste
 * 
 * Cria 12 materiais de exemplo com diferentes categorias, tipos e estatísticas
 */

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não configurada');
  process.exit(1);
}

const materials = [
  {
    title: 'Português Completo - Gramática e Interpretação',
    description: 'Curso completo de português para concursos com foco em gramática, interpretação de texto e redação oficial.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop',
    category: 'base',
    type: 'pdf',
    isPaid: false,
    isAvailable: true,
    isFeatured: true,
    commentsEnabled: true,
    upvotes: 156,
    viewCount: 1240,
    downloadCount: 340,
    favoriteCount: 89,
    rating: '4.8',
    ratingCount: 67,
  },
  {
    title: 'Matemática Financeira - Videoaulas',
    description: 'Aulas em vídeo sobre matemática financeira: juros simples e compostos, descontos, amortização e muito mais.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=300&fit=crop',
    category: 'base',
    type: 'video',
    isPaid: true,
    isAvailable: true,
    isFeatured: true,
    commentsEnabled: true,
    upvotes: 203,
    viewCount: 2100,
    downloadCount: 0,
    favoriteCount: 145,
    rating: '4.9',
    ratingCount: 98,
  },
  {
    title: 'Direito Constitucional - Resumo em Áudio',
    description: 'Resumo completo de Direito Constitucional em formato de podcast para estudar enquanto se desloca.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=400&h=300&fit=crop',
    category: 'revisao',
    type: 'audio',
    isPaid: false,
    isAvailable: true,
    isFeatured: false,
    commentsEnabled: true,
    upvotes: 78,
    viewCount: 560,
    downloadCount: 120,
    favoriteCount: 45,
    rating: '4.5',
    ratingCount: 34,
  },
  {
    title: 'Informática para Concursos - PDF Completo',
    description: 'Material completo de informática: hardware, software, redes, segurança da informação e pacote Office.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop',
    category: 'base',
    type: 'pdf',
    isPaid: false,
    isAvailable: true,
    isFeatured: false,
    commentsEnabled: true,
    upvotes: 92,
    viewCount: 780,
    downloadCount: 210,
    favoriteCount: 56,
    rating: '4.6',
    ratingCount: 45,
  },
  {
    title: 'Raciocínio Lógico - Questões Comentadas',
    description: 'Mais de 500 questões de raciocínio lógico comentadas e resolvidas passo a passo.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=400&h=300&fit=crop',
    category: 'revisao',
    type: 'pdf',
    isPaid: true,
    isAvailable: true,
    isFeatured: false,
    commentsEnabled: true,
    upvotes: 134,
    viewCount: 1100,
    downloadCount: 290,
    favoriteCount: 98,
    rating: '4.7',
    ratingCount: 76,
  },
  {
    title: 'Direito Administrativo - Aulas em Vídeo',
    description: 'Curso completo de Direito Administrativo com teoria, jurisprudência e questões comentadas.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=400&h=300&fit=crop',
    category: 'base',
    type: 'video',
    isPaid: true,
    isAvailable: true,
    isFeatured: false,
    commentsEnabled: true,
    upvotes: 167,
    viewCount: 1890,
    downloadCount: 0,
    favoriteCount: 123,
    rating: '4.8',
    ratingCount: 89,
  },
  {
    title: 'Atualidades 2025 - Resumo Mensal',
    description: 'Resumo completo das principais notícias e acontecimentos de janeiro de 2025.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop',
    category: 'promo',
    type: 'pdf',
    isPaid: false,
    isAvailable: true,
    isFeatured: true,
    commentsEnabled: true,
    upvotes: 245,
    viewCount: 3200,
    downloadCount: 890,
    favoriteCount: 234,
    rating: '4.9',
    ratingCount: 156,
  },
  {
    title: 'Redação Oficial - Modelos e Exemplos',
    description: 'Modelos de ofícios, memorandos, pareceres e outros documentos oficiais com exemplos práticos.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop',
    category: 'revisao',
    type: 'pdf',
    isPaid: false,
    isAvailable: true,
    isFeatured: false,
    commentsEnabled: true,
    upvotes: 67,
    viewCount: 450,
    downloadCount: 145,
    favoriteCount: 34,
    rating: '4.4',
    ratingCount: 28,
  },
  {
    title: 'Estatística Aplicada - Curso Completo',
    description: 'Curso de estatística para concursos: medidas de tendência central, dispersão, probabilidade e inferência.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    category: 'base',
    type: 'video',
    isPaid: true,
    isAvailable: true,
    isFeatured: false,
    commentsEnabled: true,
    upvotes: 89,
    viewCount: 980,
    downloadCount: 0,
    favoriteCount: 67,
    rating: '4.6',
    ratingCount: 54,
  },
  {
    title: 'Legislação Específica - Áudio Resumo',
    description: 'Resumo em áudio das principais leis específicas cobradas em concursos públicos.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=400&h=300&fit=crop',
    category: 'revisao',
    type: 'audio',
    isPaid: false,
    isAvailable: true,
    isFeatured: false,
    commentsEnabled: true,
    upvotes: 45,
    viewCount: 320,
    downloadCount: 89,
    favoriteCount: 23,
    rating: '4.3',
    ratingCount: 19,
  },
  {
    title: 'Ética no Serviço Público - Material Completo',
    description: 'Material completo sobre ética no serviço público: princípios, código de ética e questões comentadas.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop',
    category: 'base',
    type: 'pdf',
    isPaid: false,
    isAvailable: true,
    isFeatured: false,
    commentsEnabled: true,
    upvotes: 56,
    viewCount: 420,
    downloadCount: 123,
    favoriteCount: 34,
    rating: '4.5',
    ratingCount: 31,
  },
  {
    title: 'Simulado Completo - Prova Comentada',
    description: 'Simulado completo com 120 questões de todas as disciplinas, totalmente comentado em vídeo.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
    category: 'promo',
    type: 'video',
    isPaid: true,
    isAvailable: true,
    isFeatured: true,
    commentsEnabled: true,
    upvotes: 312,
    viewCount: 4500,
    downloadCount: 0,
    favoriteCount: 289,
    rating: '5.0',
    ratingCount: 201,
  },
];

async function seed() {
  let connection;
  
  try {
    console.log('🔌 Conectando ao banco de dados...');
    connection = await mysql.createConnection(DATABASE_URL);
    
    console.log('🗑️  Limpando materiais existentes...');
    await connection.execute('DELETE FROM materialItems WHERE materialId > 0');
    await connection.execute('DELETE FROM materials WHERE id > 0');
    
    console.log('🌱 Inserindo materiais de teste...');
    
    for (const material of materials) {
      // Inserir material
      const [result] = await connection.execute(
        `INSERT INTO materials (
          title, description, thumbnailUrl, category, type, isPaid, isAvailable, 
          isFeatured, commentsEnabled, upvotes, viewCount, downloadCount, 
          favoriteCount, rating, ratingCount, createdBy
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          material.title,
          material.description,
          material.thumbnailUrl,
          material.category,
          material.type,
          material.isPaid,
          material.isAvailable,
          material.isFeatured,
          material.commentsEnabled,
          material.upvotes,
          material.viewCount,
          material.downloadCount,
          material.favoriteCount,
          material.rating,
          material.ratingCount,
          'seed-script', // createdBy
        ]
      );
      
      const materialId = result.insertId;
      
      // Inserir item do material (1 item por material)
      if (material.type === 'video') {
        await connection.execute(
          `INSERT INTO materialItems (materialId, title, type, url, duration, \`order\`)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            materialId,
            material.title,
            material.type,
            'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // URL de exemplo
            3600, // 1 hora
            0,
          ]
        );
      } else if (material.type === 'pdf') {
        await connection.execute(
          `INSERT INTO materialItems (materialId, title, type, url, fileSize, \`order\`)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            materialId,
            material.title,
            material.type,
            'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // PDF de exemplo
            1024000, // 1MB
            0,
          ]
        );
      } else if (material.type === 'audio') {
        await connection.execute(
          `INSERT INTO materialItems (materialId, title, type, url, duration, fileSize, \`order\`)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            materialId,
            material.title,
            material.type,
            'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Áudio de exemplo
            1800, // 30 minutos
            5120000, // 5MB
            0,
          ]
        );
      }
      
      console.log(`  ✅ ${material.title}`);
    }
    
    console.log(`\n✨ Seed concluído! ${materials.length} materiais criados.`);
    
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seed();
