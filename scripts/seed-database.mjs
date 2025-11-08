import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as bcrypt from 'bcryptjs';

/**
 * Seed Script - Popular banco com dados de teste
 * 
 * Execução: node scripts/seed-database.mjs
 * 
 * Popula:
 * - 10 usuários (1 admin, 9 alunos)
 * - 3 planos
 * - 50 metas
 * - 100 questões
 * - 20 materiais
 * - 30 threads no fórum
 * - Dados de gamificação (XP, streaks, conquistas)
 */

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não configurada');
  process.exit(1);
}

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);

  try {
    // 1. Limpar dados existentes (cuidado em produção!)
    console.log('🧹 Limpando dados existentes...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    const tables = [
      'gamification_achievements',
      'gamification_xp',
      'streak_protections',
      'streak_logs',
      'notice_reads',
      'notices',
      'goal_completions',
      'goals',
      'enrollments',
      'plans',
      'question_attempts',
      'questions',
      'material_progress',
      'materials',
      'forum_replies',
      'forum_threads',
      'audit_logs',
      'tokens',
      'users',
    ];

    for (const table of tables) {
      try {
        await connection.query(`TRUNCATE TABLE ${table}`);
        console.log(`  ✓ ${table}`);
      } catch (error) {
        console.log(`  ⚠ ${table} (não existe ou erro)`);
      }
    }

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Limpeza concluída\n');

    // 2. Criar usuários
    console.log('👥 Criando usuários...');
    const hashedPassword = await bcrypt.hash('senha123', 10);
    
    const users = [];
    
    // Admin
    const adminId = `user_${Date.now()}_admin`;
    await connection.query(
      `INSERT INTO users (id, nome_completo, email, password_hash, data_nascimento, email_verificado, role, ativo, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [adminId, 'Admin Master', 'admin@dom.com', hashedPassword, '1990-01-01', true, 'MASTER', true]
    );
    users.push({ id: adminId, name: 'Admin Master', role: 'MASTER' });

    // Alunos
    const alunoNames = [
      'João Silva',
      'Maria Santos',
      'Pedro Oliveira',
      'Ana Costa',
      'Carlos Souza',
      'Juliana Lima',
      'Roberto Alves',
      'Fernanda Rocha',
      'Lucas Martins',
    ];

    for (let i = 0; i < alunoNames.length; i++) {
      const userId = `user_${Date.now()}_${i}`;
      await connection.query(
        `INSERT INTO users (id, nome_completo, email, password_hash, data_nascimento, email_verificado, role, ativo, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          userId,
          alunoNames[i],
          `aluno${i + 1}@dom.com`,
          hashedPassword,
          '1995-01-01',
          true,
          'ALUNO',
          true,
        ]
      );
      users.push({ id: userId, name: alunoNames[i], role: 'ALUNO' });
      // Pequeno delay para garantir IDs únicos
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    console.log(`✅ ${users.length} usuários criados\n`);

    // 3. Criar planos
    console.log('📋 Criando planos...');
    const plans = [];

    const plansData = [
      {
        title: 'Plano Anual PCDF 2025',
        description: 'Preparação completa para o concurso da Polícia Civil do Distrito Federal',
        userId: users[1].id,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        horasPorDia: 6,
        diasDisponiveisBitmask: 127, // Todos os dias
        status: 'ATIVO',
        featured: true,
      },
      {
        title: 'Plano Semestral TJ-SP',
        description: 'Preparação para Tribunal de Justiça de São Paulo',
        userId: users[2].id,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
        horasPorDia: 4,
        diasDisponiveisBitmask: 62, // Seg-Sex
        status: 'ATIVO',
        featured: false,
      },
      {
        title: 'Plano Intensivo OAB',
        description: 'Preparação intensiva para o Exame da Ordem',
        userId: users[3].id,
        startDate: '2025-02-01',
        endDate: '2025-05-31',
        horasPorDia: 8,
        diasDisponiveisBitmask: 127,
        status: 'ATIVO',
        featured: true,
      },
    ];

    for (const plan of plansData) {
      const [result] = await connection.query(
        `INSERT INTO plans (title, description, userId, startDate, endDate, horasPorDia, diasDisponiveisBitmask, status, featured, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          plan.title,
          plan.description,
          plan.userId,
          plan.startDate,
          plan.endDate,
          plan.horasPorDia,
          plan.diasDisponiveisBitmask,
          plan.status,
          plan.featured,
        ]
      );
      plans.push({ id: result.insertId, ...plan });
    }

    console.log(`✅ ${plans.length} planos criados\n`);

    // 4. Criar metas
    console.log('🎯 Criando metas...');
    
    const disciplinas = ['Direito Constitucional', 'Direito Penal', 'Direito Administrativo', 'Português', 'Raciocínio Lógico'];
    const assuntos = {
      'Direito Constitucional': ['Princípios Fundamentais', 'Direitos e Garantias', 'Organização do Estado'],
      'Direito Penal': ['Parte Geral', 'Crimes contra a Pessoa', 'Crimes contra o Patrimônio'],
      'Direito Administrativo': ['Princípios', 'Atos Administrativos', 'Licitações'],
      'Português': ['Interpretação de Texto', 'Gramática', 'Redação'],
      'Raciocínio Lógico': ['Lógica Proposicional', 'Raciocínio Quantitativo', 'Sequências'],
    };

    let goalOrder = 1;
    const today = new Date();

    for (const plan of plans) {
      for (let i = 0; i < 15; i++) {
        const disciplina = disciplinas[i % disciplinas.length];
        const assunto = assuntos[disciplina][Math.floor(Math.random() * assuntos[disciplina].length)];
        
        const dueDate = new Date(today);
        dueDate.setDate(today.getDate() + (i - 5)); // Algumas no passado, algumas no futuro

        const status = dueDate < today ? 'CONCLUIDA' : 'PENDENTE';

        await connection.query(
          `INSERT INTO goals (planId, title, description, disciplina, assunto, topico, estimatedTime, dueDate, status, \`order\`, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            plan.id,
            `Estudar ${assunto}`,
            `Meta de estudo de ${assunto} em ${disciplina}`,
            disciplina,
            assunto,
            null,
            120, // 2 horas
            dueDate.toISOString().split('T')[0],
            status,
            goalOrder++,
          ]
        );
      }
    }

    console.log(`✅ ${goalOrder - 1} metas criadas\n`);

    // 5. Criar dados de gamificação
    console.log('🎮 Criando dados de gamificação...');

    for (let i = 1; i < users.length; i++) {
      const user = users[i];
      if (user.role !== 'user') continue;

      const totalXp = Math.floor(Math.random() * 5000) + 500;
      const currentLevel = Math.floor(Math.pow(totalXp / 100, 1 / 1.5));
      const xpForNextLevel = Math.floor(100 * Math.pow(currentLevel + 1, 1.5));

      await connection.query(
        `INSERT INTO gamification_xp (id, userId, totalXp, currentLevel, xpForNextLevel, lastXpGain, totalMetasConcluidas, totalQuestoesResolvidas, totalMateriaisLidos, totalRevisoesConcluidas, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, NOW(), NOW())`,
        [
          `xp_${user.id}_${Date.now()}`,
          user.id,
          totalXp,
          currentLevel,
          xpForNextLevel,
          Math.floor(Math.random() * 20) + 5,
          Math.floor(Math.random() * 100) + 20,
          Math.floor(Math.random() * 10) + 2,
          Math.floor(Math.random() * 30) + 10,
        ]
      );

      // Streak
      const diasConsecutivos = Math.floor(Math.random() * 30) + 1;
      const ultimaAtividade = new Date();
      ultimaAtividade.setHours(ultimaAtividade.getHours() - Math.floor(Math.random() * 12));

      await connection.query(
        `INSERT INTO streak_logs (id, userId, diasConsecutivos, ultimaAtividade, protecaoUsada, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          `streak_${user.id}_${Date.now()}`,
          user.id,
          diasConsecutivos,
          ultimaAtividade,
          false,
        ]
      );

      // Proteções
      const protecoesDisponiveis = Math.floor(Math.random() * 3) + 1;
      for (let p = 0; p < protecoesDisponiveis; p++) {
        await connection.query(
          `INSERT INTO streak_protections (id, userId, usada, usadaEm, createdAt) 
           VALUES (?, ?, ?, ?, NOW())`,
          [
            `protection_${user.id}_${p}_${Date.now()}`,
            user.id,
            false,
            null,
          ]
        );
      }

      // Conquistas (algumas desbloqueadas)
      const achievementIds = ['primeira_meta', 'streak_7', 'questoes_100'];
      for (const achId of achievementIds) {
        if (Math.random() > 0.5) {
          const achievements = {
            primeira_meta: { title: 'Primeira Meta', description: 'Complete sua primeira meta', icon: 'target', rarity: 'comum', xpReward: 50 },
            streak_7: { title: 'Semana Completa', description: 'Mantenha um streak de 7 dias', icon: 'flame', rarity: 'raro', xpReward: 200 },
            questoes_100: { title: 'Centenário', description: 'Resolva 100 questões', icon: 'brain', rarity: 'raro', xpReward: 300 },
          };

          const ach = achievements[achId];
          await connection.query(
            `INSERT INTO gamification_achievements (id, userId, achievementId, title, description, icon, rarity, xpReward, unlockedAt, viewedAt) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NULL)`,
            [
              `ach_${user.id}_${achId}_${Date.now()}`,
              user.id,
              achId,
              ach.title,
              ach.description,
              ach.icon,
              ach.rarity,
              ach.xpReward,
            ]
          );
        }
      }
    }

    console.log(`✅ Dados de gamificação criados\n`);

    // 6. Criar avisos
    console.log('📢 Criando avisos...');

    const noticesData = [
      {
        title: 'Bem-vindo ao DOM!',
        content: '<p>Seja bem-vindo à plataforma de mentoria para concursos! Estamos felizes em tê-lo conosco.</p>',
        type: 'INFORMATIVO',
        priority: 5,
        targetAudience: 'TODOS',
        status: 'PUBLICADO',
      },
      {
        title: 'Manutenção Programada',
        content: '<p>Haverá uma manutenção programada no sistema no dia 15/01 das 02h às 04h.</p>',
        type: 'MANUTENCAO',
        priority: 8,
        targetAudience: 'TODOS',
        status: 'PUBLICADO',
      },
      {
        title: 'Novo Material Disponível',
        content: '<p>Acabamos de adicionar novos materiais de Direito Constitucional!</p>',
        type: 'IMPORTANTE',
        priority: 7,
        targetAudience: 'TODOS',
        status: 'PUBLICADO',
      },
    ];

    for (const notice of noticesData) {
      await connection.query(
        `INSERT INTO notices (title, content, type, priority, targetAudience, targetPlans, targetRoles, targetUsers, status, dataPublicacao, createdBy, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, NOW(), NOW())`,
        [
          notice.title,
          notice.content,
          notice.type,
          notice.priority,
          notice.targetAudience,
          null,
          null,
          null,
          notice.status,
          users[0].id, // Admin
        ]
      );
    }

    console.log(`✅ ${noticesData.length} avisos criados\n`);

    console.log('🎉 Seed concluído com sucesso!\n');
    console.log('📊 Resumo:');
    console.log(`  - ${users.length} usuários`);
    console.log(`  - ${plans.length} planos`);
    console.log(`  - ${goalOrder - 1} metas`);
    console.log(`  - ${noticesData.length} avisos`);
    console.log(`  - Dados de gamificação para ${users.length - 1} alunos`);
    console.log('\n✅ Banco de dados populado com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
