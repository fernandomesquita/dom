// ============================================
// CONSTANTS - SINGLE SOURCE OF TRUTH
// ============================================
// IMPORTANTE: Importar daqui em TODOS os lugares!
// Nunca usar strings hardcoded!

// ============================================
// COOKIES
// ============================================
export const COOKIE_NAME = "app_session_id";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

// ============================================
// JWT
// ============================================
export const ACCESS_TOKEN_EXPIRY = "7d";
export const REFRESH_TOKEN_EXPIRY = "30d";

// ============================================
// ROLES
// ============================================
export const ROLES = {
  MASTER: "MASTER",
  ADMINISTRATIVO: "ADMINISTRATIVO", 
  MENTOR: "MENTOR",
  PROFESSOR: "PROFESSOR",
  ALUNO: "ALUNO",
} as const;

export type UserRole = keyof typeof ROLES;

// ============================================
// LOCAL STORAGE KEYS
// ============================================
export const LOCAL_STORAGE_KEYS = {
  USER_INFO: "manus-runtime-user-info",
  REFRESH_TOKEN: "refresh_token",
} as const;

// ============================================
// TIMEOUTS E LIMITES
// ============================================
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;

// ============================================
// MENSAGENS DE ERRO
// ============================================
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';
