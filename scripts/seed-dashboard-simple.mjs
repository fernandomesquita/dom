import mysql from 'mysql2/promise';
import * as bcrypt from 'bcryptjs';

/**
 * Seed Simplificado - Dashboard do Aluno
 * 
 * Popula apenas dados essenciais para testar o dashboard:
 * - 3 usuários (1 admin, 2 alunos)
 * - Dados de gamificação
 * - 3 avisos
 */

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não configurada');
  process.exit(1);
}

async function main() {
  console.log('🌱 Seed Simplificado - Dashboard do Aluno\n');

  const connection = await mysql.createConnection(DATABASE_URL);

  try {
    // Limpar dados existentes
    console.log('🧹 Limpando dados existentes...');
    await connection.query('DELETE FROM forum_topicos');
    await connection.query('DELETE FROM assinaturas');
    await connection.query('DELETE FROM planos');
    await connection.query('DELETE FROM materiais_estudados');
    await connection.query('DELETE FROM materiais');
    await connection.query('DELETE FROM cronograma');
    await connection.query('DELETE FROM estatisticas_diarias');
    await connection.query('DELETE FROM gamification_achievements');
    await connection.query('DELETE FROM gamification_xp');
    await connection.query('DELETE FROM streak_protections');
    await connection.query('DELETE FROM streak_logs');
    await connection.query('DELETE FROM notice_reads');
    await connection.query('DELETE FROM notices');
    await connection.query("DELETE FROM disciplinas WHERE slug = 'direito-constitucional'");
    await connection.query("DELETE FROM users WHERE email IN ('admin@dom.com', 'joao@dom.com', 'maria@dom.com')");
    console.log('✅ Limpeza concluída\n');

    const hashedPassword = await bcrypt.hash('senha123', 10);

    // 1. Criar usuários
    console.log('👥 Criando usuários...');
    
    const adminId = `user_admin_${Date.now()}`;
    await connection.query(
      `INSERT INTO users (id, nome_completo, email, password_hash, data_nascimento, email_verificado, role, ativo, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [adminId, 'Admin Master', 'admin@dom.com', hashedPassword, '1990-01-01', true, 'MASTER', true]
    );

    const aluno1Id = `user_aluno1_${Date.now()}`;
    await new Promise(resolve => setTimeout(resolve, 10));
    await connection.query(
      `INSERT INTO users (id, nome_completo, email, password_hash, data_nascimento, email_verificado, role, ativo, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [aluno1Id, 'João Silva', 'joao@dom.com', hashedPassword, '1995-05-15', true, 'ALUNO', true]
    );

    const aluno2Id = `user_aluno2_${Date.now()}`;
    await new Promise(resolve => setTimeout(resolve, 10));
    await connection.query(
      `INSERT INTO users (id, nome_completo, email, password_hash, data_nascimento, email_verificado, role, ativo, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [aluno2Id, 'Maria Santos', 'maria@dom.com', hashedPassword, '1998-08-20', true, 'ALUNO', true]
    );

    console.log('✅ 3 usuários criados');
    console.log(`  - Admin: admin@dom.com / senha123`);
    console.log(`  - Aluno 1: joao@dom.com / senha123`);
    console.log(`  - Aluno 2: maria@dom.com / senha123\n`);

    // 2. Criar dados de gamificação para aluno 1
    console.log('🎮 Criando dados de gamificação...');

    // XP do aluno 1
    await connection.query(
      `INSERT INTO gamification_xp (id, user_id, total_xp, current_level, xp_for_next_level, last_xp_gain, total_metas_concluidas, total_questoes_resolvidas, total_materiais_lidos, total_revisoes_concluidas, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, NOW(), NOW())`,
      [`xp_${aluno1Id}`, aluno1Id, 1250, 3, 1837, 15, 87, 5, 23]
    );

    // Streak do aluno 1
    await connection.query(
      `INSERT INTO streak_logs (id, user_id, date, metas_completas, questoes_resolvidas, tempo_estudo, streak_ativo, protecao_usada, created_at) 
       VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, NOW())`,
      [`streak_${aluno1Id}`, aluno1Id, 5, 20, 180, true, false]
    );

    // Proteções do aluno 1
    for (let i = 0; i < 2; i++) {
      await connection.query(
        `INSERT INTO streak_protections (id, user_id, tipo, quantidade, quantidade_usada, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [`protection_${aluno1Id}_${i}`, aluno1Id, 'diaria', 1, 0]
      );
    }

    // Conquistas do aluno 1
    const conquistas = [
      { id: 'primeira_meta', title: 'Primeira Meta', description: 'Complete sua primeira meta', icon: 'target', rarity: 'comum', xpReward: 50 },
      { id: 'streak_7', title: 'Semana Completa', description: 'Mantenha um streak de 7 dias', icon: 'flame', rarity: 'raro', xpReward: 200 },
    ];

    for (const conquista of conquistas) {
      await connection.query(
        `INSERT INTO gamification_achievements (id, user_id, achievement_id, title, description, icon, rarity, xp_reward, unlocked_at, viewed_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NULL)`,
        [
          `ach_${aluno1Id}_${conquista.id}`,
          aluno1Id,
          conquista.id,
          conquista.title,
          conquista.description,
          conquista.icon,
          conquista.rarity,
          conquista.xpReward,
        ]
      );
    }

    console.log('✅ Dados de gamificação criados (Aluno 1)\n');

    
    const disciplinaId = `disc_${Date.now()}`;
    await connection.query(
      `INSERT INTO disciplinas (id, codigo, slug, nome, descricao, ativo, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [disciplinaId, 'DIR_CONST', 'direito-constitucional', 'Direito Constitucional', 'Princípios e normas fundamentais', true]
    );

    const materiais = [
      { id: `mat_${Date.now()}_1`, titulo: 'Princípios Constitucionais', tipo: 'PDF', progresso: 45 },
      { id: `mat_${Date.now()}_2`, titulo: 'Direitos Fundamentais', tipo: 'VIDEO', progresso: 78 },
      { id: `mat_${Date.now()}_3`, titulo: 'Organização do Estado', tipo: 'PDF', progresso: 100 },
      { id: `mat_${Date.now()}_4`, titulo: 'Poder Legislativo', tipo: 'AUDIO', progresso: 30 },
    ];

    for (const material of materiais) {
      await connection.query(
        `INSERT INTO materiais (id, titulo, tipo, disciplina_id, ativo, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [material.id, material.titulo, material.tipo, disciplinaId, true]
      );

      // Adicionar progresso para João
      await connection.query(
        `INSERT INTO materiais_estudados (id, user_id, material_id, progresso, tempo_estudo, ultima_visualizacao, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          `me_${Date.now()}_${material.id}`,
          aluno1Id,
          material.id,
          material.progresso,
          Math.floor(material.progresso * 2), // tempo em minutos
          material.progresso === 100 ? new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) : new Date() // 10 dias atrás se completo
        ]
      );
    }
    console.log(`✅ ${materiais.length} materiais criados\n`);

    // 6. Criar estatísticas diárias (últimos 14 dias)
    console.log('📊 Criando estatísticas diárias...');
    
    for (let i = 0; i < 14; i++) {
      const data = new Date();
      data.setDate(data.getDate() - i);
      const dataString = data.toISOString().split('T')[0];

      const questoesResolvidas = Math.floor(Math.random() * 30) + 10; // 10-40 questões
      const questoesCorretas = Math.floor(questoesResolvidas * (0.6 + Math.random() * 0.3)); // 60-90% acerto
      const tempoEstudo = Math.floor(Math.random() * 120) + 30; // 30-150 minutos

      await connection.query(
        `INSERT INTO estatisticas_diarias (id, user_id, data, questoes_resolvidas, questoes_corretas, tempo_estudo, materiais_estudados, streak_ativo, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          `est_${Date.now()}_${i}`,
          aluno1Id,
          dataString,
          questoesResolvidas,
          questoesCorretas,
          tempoEstudo,
          Math.floor(Math.random() * 3) + 1, // 1-3 materiais
          true
        ]
      );
      await new Promise(resolve => setTimeout(resolve, 5)); // Evitar IDs duplicados
    }
    console.log('✅ 14 dias de estatísticas criadas\n');

    // 7. Criar cronograma (últimos 7 dias)
    console.log('📅 Criando cronograma...');
    
    const atividades = [
      { tipo: 'ESTUDO', atividade: 'Estudar Direito Constitucional', tempoPlanejado: 60 },
      { tipo: 'QUESTOES', atividade: 'Resolver questões de Direito Administrativo', tempoPlanejado: 45 },
      { tipo: 'REVISAO', atividade: 'Revisar Direito Civil', tempoPlanejado: 30 },
    ];

    for (let i = 0; i < 7; i++) {
      const data = new Date();
      data.setDate(data.getDate() - i);
      const dataString = data.toISOString().split('T')[0];

      for (const atividade of atividades) {
        const concluido = Math.random() > 0.3; // 70% de conclusão
        const tempoRealizado = concluido ? atividade.tempoPlanejado + Math.floor(Math.random() * 20) - 10 : 0;

        await connection.query(
          `INSERT INTO cronograma (id, user_id, data, atividade, tipo, disciplina_id, concluido, tempo_planejado, tempo_realizado, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            `cron_${Date.now()}_${i}_${atividade.tipo}`,
            aluno1Id,
            dataString,
            atividade.atividade,
            atividade.tipo,
            disciplinaId,
            concluido,
            atividade.tempoPlanejado,
            tempoRealizado
          ]
        );
        await new Promise(resolve => setTimeout(resolve, 5)); // Evitar IDs duplicados
      }
    }
    console.log('✅ 7 dias de cronograma criados\n');

    // 8. Criar plano e assinatura
    console.log('💳 Criando plano e assinatura...');
    
    const planoId = `plano_${Date.now()}`;
    await connection.query(
      `INSERT INTO planos (id, nome, descricao, preco, duracao_meses, recursos, ativo, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        planoId,
        'Plano Premium',
        'Acesso completo a todos os recursos da plataforma',
        99.90,
        12,
        JSON.stringify(['Banco de questões completo', 'Materiais em PDF e Vídeo', 'Simulados ilimitados', 'Suporte prioritário']),
        true
      ]
    );

    const assinaturaId = `assin_${Date.now()}`;
    const dataInicio = new Date();
    dataInicio.setMonth(dataInicio.getMonth() - 2); // Começou há 2 meses
    const dataFim = new Date();
    dataFim.setMonth(dataFim.getMonth() + 10); // Termina em 10 meses

    await connection.query(
      `INSERT INTO assinaturas (id, user_id, plano_id, status, data_inicio, data_fim, renovacao_automatica, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        assinaturaId,
        aluno1Id,
        planoId,
        'ATIVA',
        dataInicio.toISOString().split('T')[0],
        dataFim.toISOString().split('T')[0],
        true
      ]
    );
    console.log('✅ Plano e assinatura criados\n');

    // 9. Criar discussões do fórum
    console.log('💬 Criando discussões do fórum...');
    
    const topicos = [
      { titulo: 'Como organizar cronograma de estudos?', conteudo: 'Estou com dificuldade para organizar meu cronograma. Alguém tem dicas?' },
      { titulo: 'Melhor estratégia para resolver questões', conteudo: 'Qual a melhor forma de revisar questões erradas?' },
      { titulo: 'Material de Direito Constitucional', conteudo: 'Alguém tem indicação de bom material sobre princípios constitucionais?' },
      { titulo: 'Streak de estudos - como manter?', conteudo: 'Como vocês fazem para manter o streak ativo todos os dias?' },
      { titulo: 'Simulados: quando começar?', conteudo: 'Qual o melhor momento para começar a fazer simulados completos?' },
    ];

    for (let i = 0; i < topicos.length; i++) {
      const topico = topicos[i];
      await connection.query(
        `INSERT INTO forum_topicos (id, user_id, titulo, conteudo, disciplina_id, visualizacoes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          `topic_${Date.now()}_${i}`,
          i % 2 === 0 ? aluno1Id : aluno2Id, // Alternar entre alunos
          topico.titulo,
          topico.conteudo,
          disciplinaId, // Usar disciplina criada anteriormente
          Math.floor(Math.random() * 50) + 10 // 10-60 visualizações
        ]
      );
      await new Promise(resolve => setTimeout(resolve, 5)); // Evitar IDs duplicados
    }
    console.log(`✅ ${topicos.length} discussões criadas\n`);

    console.log('🎉 Seed concluído com sucesso!\n');
    console.log('📈 Resumo:');
    console.log('  - 3 usuários (1 admin, 2 alunos)');
    console.log('  - Gamificação completa para Aluno 1 (João)');
    console.log('    * Nível 3 (1250 XP)');
    console.log('    * Streak de 12 dias');
    console.log('    * 2 proteções disponíveis');
    console.log('    * 2 conquistas desbloqueadas');
    console.log('  - 4 materiais com progresso');
    console.log('  - 14 dias de estatísticas');
    console.log('  - 7 dias de cronograma (21 atividades)');
    console.log('  - 1 plano ativo (Premium - 10 meses restantes)');
    console.log('  - 5 discussões no fórum');
    console.log('\n✅ Banco populado! Acesse /dashboard com:');
    console.log('  📧 joao@dom.com');
    console.log('  🔑 senha123');

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
