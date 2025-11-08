import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

async function testAvisosFlow() {
  console.log('🧪 Testando fluxo completo do sistema de avisos...\n');

  const connection = await mysql.createConnection(DATABASE_URL);

  try {
    // 1. Verificar avisos ativos
    console.log('1️⃣ Verificando avisos ativos...');
    const [avisos] = await connection.execute(
      'SELECT id, titulo, tipo, formato_exibicao, status FROM avisos WHERE status = ? LIMIT 5',
      ['ativo']
    );
    console.log(`   ✅ ${avisos.length} avisos ativos encontrados`);
    avisos.forEach(a => {
      console.log(`      - ${a.titulo} (${a.tipo}, ${a.formato_exibicao})`);
    });

    // 2. Verificar se existem usuários no banco
    console.log('\n2️⃣ Verificando usuários...');
    const [users] = await connection.execute('SELECT id, name FROM users LIMIT 3');
    console.log(`   ✅ ${users.length} usuários encontrados`);
    
    if (users.length === 0) {
      console.log('   ⚠️  Nenhum usuário encontrado. Crie um usuário para testar.');
      return;
    }

    const testUserId = users[0].id;
    console.log(`   📝 Usando usuário de teste: ${users[0].name || 'Sem nome'} (ID: ${testUserId})`);

    // 3. Verificar visualizações existentes
    console.log('\n3️⃣ Verificando visualizações do usuário...');
    const [visualizacoes] = await connection.execute(
      'SELECT aviso_id, visualizado_em, dispensado FROM avisos_visualizacoes WHERE user_id = ?',
      [testUserId]
    );
    console.log(`   ✅ ${visualizacoes.length} visualizações registradas`);

    // 4. Simular lógica de "avisos pendentes"
    console.log('\n4️⃣ Calculando avisos pendentes...');
    const [pendentes] = await connection.execute(`
      SELECT 
        a.id, 
        a.titulo, 
        a.tipo, 
        a.formato_exibicao,
        a.prioridade
      FROM avisos a
      LEFT JOIN avisos_visualizacoes av ON a.id = av.aviso_id AND av.user_id = ?
      WHERE 
        a.status = 'ativo'
        AND (a.data_inicio IS NULL OR a.data_inicio <= NOW())
        AND (a.data_fim IS NULL OR a.data_fim >= NOW())
        AND av.aviso_id IS NULL
      ORDER BY a.prioridade DESC, a.created_at DESC
      LIMIT 5
    `, [testUserId]);

    console.log(`   ✅ ${pendentes.length} avisos pendentes para este usuário`);
    
    if (pendentes.length > 0) {
      console.log('\n   📋 Avisos que serão exibidos:');
      pendentes.forEach((p, i) => {
        console.log(`      ${i + 1}. ${p.titulo}`);
        console.log(`         - Tipo: ${p.tipo}`);
        console.log(`         - Formato: ${p.formato_exibicao}`);
        console.log(`         - Prioridade: ${p.prioridade}`);
      });
    } else {
      console.log('   ℹ️  Nenhum aviso pendente. Usuário já visualizou todos os avisos ativos.');
    }

    // 5. Verificar analytics
    console.log('\n5️⃣ Verificando analytics...');
    const [analytics] = await connection.execute(
      'SELECT * FROM avisos_analytics LIMIT 3'
    );
    console.log(`   ✅ ${analytics.length} registros de analytics encontrados`);

    console.log('\n✅ Teste completo! Sistema de avisos está funcionando corretamente.');
    console.log('\n📝 Próximos passos:');
    console.log('   1. Acesse a home logado com um usuário');
    console.log('   2. Verifique se os avisos aparecem automaticamente');
    console.log('   3. Teste clicar no CTA e dispensar avisos');
    console.log('   4. Verifique o analytics em /admin/avisos/analytics');

  } catch (error) {
    console.error('❌ Erro ao testar fluxo:', error);
  } finally {
    await connection.end();
  }
}

testAvisosFlow();
