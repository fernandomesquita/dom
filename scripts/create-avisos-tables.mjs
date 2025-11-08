import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createAvisosTables() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    console.log('[Avisos] Criando tabelas...');
    
    // Ler arquivo SQL
    const sqlFile = await fs.readFile(path.join(__dirname, 'create-avisos-tables.sql'), 'utf8');
    
    // Dividir em statements individuais
    const statements = sqlFile
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    // Executar cada statement
    for (const statement of statements) {
      try {
        await connection.query(statement);
        const tableName = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1] || 
                         statement.match(/INSERT INTO (\w+)/)?.[1];
        if (tableName) {
          console.log(`✅ ${tableName}`);
        }
      } catch (error) {
        console.error(`❌ Erro ao executar statement:`, error.message);
        console.error(`Statement:`, statement.substring(0, 100));
      }
    }
    
    console.log('\n[Avisos] Tabelas criadas com sucesso!');
    
  } catch (error) {
    console.error('[Avisos] Erro:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

createAvisosTables();
