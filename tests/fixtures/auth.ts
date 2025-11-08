import { test as base } from '@playwright/test';

/**
 * Credenciais de teste
 */
export const TEST_CREDENTIALS = {
  aluno: {
    email: 'joao@dom.com',
    senha: 'senha123',
  },
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@dom.com',
    senha: process.env.ADMIN_PASSWORD || 'admin123',
  },
};

/**
 * Fixture de autenticação
 * Estende o test base do Playwright com helpers de auth
 */
type AuthFixtures = {
  authenticatedPage: any;
  loginAsAluno: () => Promise<void>;
  loginAsAdmin: () => Promise<void>;
};

export const test = base.extend<AuthFixtures>({
  /**
   * Página autenticada (aluno por padrão)
   */
  authenticatedPage: async ({ page }, use) => {
    // Navegar para login
    await page.goto('/login');
    
    // Fazer login
    await page.fill('input[type="email"]', TEST_CREDENTIALS.aluno.email);
    await page.fill('input[type="password"]', TEST_CREDENTIALS.aluno.senha);
    await page.click('button[type="submit"]');
    
    // Aguardar redirect
    await page.waitForURL('/dashboard', { timeout: 10000 });
    
    // Usar página autenticada
    await use(page);
  },
  
  /**
   * Helper para login como aluno
   */
  loginAsAluno: async ({ page }, use) => {
    const login = async () => {
      await page.goto('/login');
      await page.fill('input[type="email"]', TEST_CREDENTIALS.aluno.email);
      await page.fill('input[type="password"]', TEST_CREDENTIALS.aluno.senha);
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard', { timeout: 10000 });
    };
    
    await use(login);
  },
  
  /**
   * Helper para login como admin
   */
  loginAsAdmin: async ({ page }, use) => {
    const login = async () => {
      await page.goto('/login');
      await page.fill('input[type="email"]', TEST_CREDENTIALS.admin.email);
      await page.fill('input[type="password"]', TEST_CREDENTIALS.admin.senha);
      await page.click('button[type="submit"]');
      await page.waitForURL('/admin', { timeout: 10000 });
    };
    
    await use(login);
  },
});

export { expect } from '@playwright/test';
