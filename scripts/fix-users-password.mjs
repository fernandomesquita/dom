import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const DATABASE_URL = process.env.DATABASE_URL;
const PASSWORD_PEPPER = process.env.PASSWORD_PEPPER || 'dom-eara-default-pepper-change-in-production';
const BCRYPT_ROUNDS = 12;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não configurada');
  process.exit(1);
}

/**
 * Função de hash compatível com o sistema
 */
async function hashPassword(password) {
  const peppered = password + PASSWORD_PEPPER;
  return await bcrypt.hash(peppered, BCRYPT_ROUNDS);
}

async function fixUsersPasswords() {
  console.log('🔄 Conectando ao banco de dados...');
  
  const connection = await mysql.createConnection(DATABASE_URL);

  try {
    const senha = 'Adfsl$%%sd4';
    console.log('🔄 Gerando hash com pepper...');
    const senhaHash = await hashPassword(senha);

    console.log('🔄 Atualizando senha do usuário fernandofmg@gmail.com...');
    await connection.execute(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE email = ?',
      [senhaHash, 'fernandofmg@gmail.com']
    );

    console.log('🔄 Atualizando senha do usuário master@dom.com...');
    await connection.execute(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE email = ?',
      [senhaHash, 'master@dom.com']
    );

    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('✅ SENHAS ATUALIZADAS COM SUCESSO');
    console.log('═══════════════════════════════════════════');
    console.log('');
    console.log('👤 USUÁRIO 1:');
    console.log('   📧 Email: fernandofmg@gmail.com');
    console.log('   🔑 Senha: Adfsl$%%sd4');
    console.log('');
    console.log('👤 USUÁRIO 2:');
    console.log('   📧 Email: master@dom.com');
    console.log('   🔑 Senha: Adfsl$%%sd4');
    console.log('');
    console.log('═══════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Erro ao atualizar senhas:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

fixUsersPasswords();
