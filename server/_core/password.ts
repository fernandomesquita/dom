import bcrypt from 'bcryptjs';

/**
 * Sistema DOM - Utilidades de Senha
 * 
 * Implementa hashing de senhas com bcrypt seguindo as melhores práticas:
 * - 12 rounds (security best practice v2.2)
 * - Pepper adicional (camada extra de segurança)
 * - Versioning para migração futura
 */

const BCRYPT_ROUNDS = 12;
const PASSWORD_PEPPER = process.env.PASSWORD_PEPPER || 'dom-eara-default-pepper-change-in-production';

/**
 * Gera o hash de uma senha
 */
export async function hashPassword(password: string): Promise<string> {
  // Adicionar pepper antes do hash
  const peppered = password + PASSWORD_PEPPER;
  return await bcrypt.hash(peppered, BCRYPT_ROUNDS);
}

/**
 * Verifica se uma senha corresponde ao hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    // Adicionar pepper antes da comparação
    const peppered = password + PASSWORD_PEPPER;
    return await bcrypt.compare(peppered, hash);
  } catch (error) {
    console.error('[Password] Error verifying password:', error);
    return false;
  }
}

/**
 * Valida a força da senha
 * Requisitos:
 * - Mínimo 8 caracteres
 * - Pelo menos 1 letra maiúscula
 * - Pelo menos 1 número
 */
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Senha deve ter no mínimo 8 caracteres');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
