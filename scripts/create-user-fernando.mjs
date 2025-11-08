import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não configurada');
  process.exit(1);
}

async function createUser() {
  console.log('🔄 Conectando ao banco de dados...');
  
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);

  try {
    // Hash da senha
    const senha = 'Adfsl$%%sd4';
    const salt = await bcrypt.genSalt(12);
    const senhaHash = await bcrypt.hash(senha, salt);

    console.log('🔄 Criando usuário fernandofmg@gmail.com...');

    // Inserir usuário
    const query = `
      INSERT INTO users (
        email, 
        senha_hash, 
        nome_completo, 
        role, 
        email_verificado,
        ativo,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        senha_hash = VALUES(senha_hash),
        updated_at = NOW()
    `;

    await connection.execute(query, [
      'fernandofmg@gmail.com',
      senhaHash,
      'Fernando',
      'ALUNO',
      true, // email já verificado
      true  // ativo
    ]);

    console.log('✅ Usuário criado com sucesso!');
    console.log('');
    console.log('📧 Email: fernandofmg@gmail.com');
    console.log('🔑 Senha: Adfsl$%%sd4');
    console.log('👤 Role: ALUNO');
    console.log('✉️  Email verificado: Sim');
    console.log('');

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

createUser();
