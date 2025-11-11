import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não configurada');
  process.exit(1);
}

async function createMasterUser() {
  let connection;
  
  try {
    connection = await mysql.createConnection(DATABASE_URL);
    console.log('✅ Conectado ao banco de dados');

    // Verificar se usuário já existe
    const [existing] = await connection.execute(
      'SELECT id, email, role FROM users WHERE email = ?',
      ['master@dom.com']
    );

    if (existing.length > 0) {
      console.log('⚠️  Usuário master@dom.com já existe:');
      console.log('   ID:', existing[0].id);
      console.log('   Email:', existing[0].email);
      console.log('   Role:', existing[0].role);
      
      // Atualizar role se não for MASTER
      if (existing[0].role !== 'MASTER') {
        await connection.execute(
          'UPDATE users SET role = ? WHERE email = ?',
          ['MASTER', 'master@dom.com']
        );
        console.log('✅ Role atualizado para MASTER');
      }
      
      return;
    }

    // Gerar hash da senha
    const PEPPER = process.env.PASSWORD_PEPPER || 'dom-eara-pepper-2024';
    const passwordWithPepper = 'Adfsl$%%sd4' + PEPPER;
    const hashedPassword = await bcrypt.hash(passwordWithPepper, 12);

    // Inserir usuário
    const userId = uuidv4();
    const now = new Date();

    await connection.execute(
      `INSERT INTO users (
        id, 
        email, 
        nome_completo, 
        cpf, 
        senha_hash, 
        password_version,
        data_nascimento, 
        email_verificado, 
        role, 
        ativo, 
        criado_em, 
        atualizado_em
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        'master@dom.com',
        'Master Admin',
        '00000000000', // CPF fictício
        hashedPassword,
        1,
        '1990-01-01', // Data de nascimento fictícia
        true, // Email já verificado
        'MASTER',
        true,
        now,
        now
      ]
    );

    console.log('✅ Usuário MASTER criado com sucesso!');
    console.log('   ID:', userId);
    console.log('   Email: master@dom.com');
    console.log('   Senha: Adfsl$%%sd4');
    console.log('   Role: MASTER');

    // Verificar se foi criado
    const [created] = await connection.execute(
      'SELECT id, email, nome_completo, role, email_verificado, ativo FROM users WHERE email = ?',
      ['master@dom.com']
    );

    if (created.length > 0) {
      console.log('\n✅ Verificação: Usuário encontrado no banco');
      console.log('   Dados:', JSON.stringify(created[0], null, 2));
    } else {
      console.error('\n❌ ERRO: Usuário não encontrado após inserção!');
    }

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Conexão fechada');
    }
  }
}

createMasterUser().catch(console.error);
