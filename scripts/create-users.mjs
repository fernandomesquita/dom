import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não configurada');
  process.exit(1);
}

async function createUsers() {
  console.log('🔄 Conectando ao banco de dados...');
  
  const connection = await mysql.createConnection(DATABASE_URL);

  try {
    // Hash da senha (mesma para ambos)
    const senha = 'Adfsl$%%sd4';
    const salt = await bcrypt.genSalt(12);
    const senhaHash = await bcrypt.hash(senha, salt);

    // Usuário 1: Fernando (ALUNO)
    console.log('🔄 Criando usuário fernandofmg@gmail.com...');
    
    const userId1 = uuidv4();
    const query1 = `
      INSERT INTO users (
        id,
        email, 
        password_hash, 
        nome_completo, 
        data_nascimento,
        role, 
        email_verificado,
        ativo,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        password_hash = VALUES(password_hash),
        updated_at = NOW()
    `;

    await connection.execute(query1, [
      userId1,
      'fernandofmg@gmail.com',
      senhaHash,
      'Fernando Martins',
      '1990-01-01', // Data de nascimento padrão
      'ALUNO',
      true, // email já verificado
      true  // ativo
    ]);

    console.log('✅ Usuário Fernando criado com sucesso!');

    // Usuário 2: Master (MASTER)
    console.log('🔄 Criando usuário master@dom.com...');
    
    const userId2 = uuidv4();
    const query2 = `
      INSERT INTO users (
        id,
        email, 
        password_hash, 
        nome_completo, 
        data_nascimento,
        role, 
        email_verificado,
        ativo,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        password_hash = VALUES(password_hash),
        role = VALUES(role),
        updated_at = NOW()
    `;

    await connection.execute(query2, [
      userId2,
      'master@dom.com',
      senhaHash,
      'Master Admin',
      '1990-01-01', // Data de nascimento padrão
      'MASTER',
      true, // email já verificado
      true  // ativo
    ]);

    console.log('✅ Usuário Master criado com sucesso!');
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('✅ USUÁRIOS CRIADOS COM SUCESSO');
    console.log('═══════════════════════════════════════════');
    console.log('');
    console.log('👤 USUÁRIO 1 (ALUNO):');
    console.log('   📧 Email: fernandofmg@gmail.com');
    console.log('   🔑 Senha: Adfsl$%%sd4');
    console.log('   👥 Role: ALUNO');
    console.log('   ✉️  Email verificado: Sim');
    console.log('');
    console.log('👤 USUÁRIO 2 (MASTER):');
    console.log('   📧 Email: master@dom.com');
    console.log('   🔑 Senha: Adfsl$%%sd4');
    console.log('   👥 Role: MASTER');
    console.log('   ✉️  Email verificado: Sim');
    console.log('');
    console.log('═══════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Erro ao criar usuários:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

createUsers();
