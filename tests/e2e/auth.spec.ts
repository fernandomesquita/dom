import { test, expect } from '../fixtures/auth';

test.describe('Autenticação', () => {
  test.describe('Login', () => {
    test('deve fazer login com credenciais válidas', async ({ page }) => {
      await page.goto('/login');
      
      // Preencher formulário
      await page.fill('input[type="email"]', 'joao@dom.com');
      await page.fill('input[type="password"]', 'senha123');
      
      // Submeter
      await page.click('button[type="submit"]');
      
      // Verificar redirect para dashboard
      await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
      
      // Verificar que está autenticado (header deve ter nome do usuário)
      await expect(page.locator('text=João Silva')).toBeVisible();
    });
    
    test('deve mostrar erro com credenciais inválidas', async ({ page }) => {
      await page.goto('/login');
      
      // Preencher com credenciais erradas
      await page.fill('input[type="email"]', 'invalido@dom.com');
      await page.fill('input[type="password"]', 'senhaerrada');
      
      // Submeter
      await page.click('button[type="submit"]');
      
      // Verificar mensagem de erro
      await expect(page.locator('text=/credenciais inválidas/i')).toBeVisible({ timeout: 5000 });
      
      // Verificar que ainda está na página de login
      await expect(page).toHaveURL('/login');
    });
    
    test('deve validar campos obrigatórios', async ({ page }) => {
      await page.goto('/login');
      
      // Tentar submeter sem preencher
      await page.click('button[type="submit"]');
      
      // Verificar validação HTML5
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toHaveAttribute('required', '');
      
      const passwordInput = page.locator('input[type="password"]');
      await expect(passwordInput).toHaveAttribute('required', '');
    });
    
    test('deve redirecionar para dashboard se já autenticado', async ({ authenticatedPage: page }) => {
      // Tentar acessar /login estando autenticado
      await page.goto('/login');
      
      // Deve redirecionar para dashboard
      await expect(page).toHaveURL('/dashboard', { timeout: 5000 });
    });
  });
  
  test.describe('Logout', () => {
    test('deve fazer logout com sucesso', async ({ authenticatedPage: page }) => {
      // Clicar no botão de logout (pode estar em um menu dropdown)
      await page.click('[aria-label="Menu do usuário"]');
      await page.click('text=Sair');
      
      // Verificar redirect para login
      await expect(page).toHaveURL('/login', { timeout: 5000 });
      
      // Tentar acessar dashboard (deve redirecionar para login)
      await page.goto('/dashboard');
      await expect(page).toHaveURL('/login', { timeout: 5000 });
    });
  });
  
  test.describe('Sessão', () => {
    test('deve manter sessão após reload', async ({ authenticatedPage: page }) => {
      // Recarregar página
      await page.reload();
      
      // Verificar que ainda está autenticado
      await expect(page).toHaveURL('/dashboard');
      await expect(page.locator('text=João Silva')).toBeVisible();
    });
    
    test('deve redirecionar para login se não autenticado', async ({ page }) => {
      // Tentar acessar dashboard sem estar autenticado
      await page.goto('/dashboard');
      
      // Deve redirecionar para login
      await expect(page).toHaveURL('/login', { timeout: 5000 });
    });
  });
  
  test.describe('Registro', () => {
    test.skip('deve criar nova conta', async ({ page }) => {
      // TODO: Implementar quando registro estiver disponível
      await page.goto('/register');
      
      await page.fill('input[name="nome"]', 'Novo Usuário');
      await page.fill('input[name="email"]', `novo${Date.now()}@dom.com`);
      await page.fill('input[name="senha"]', 'senha123');
      await page.fill('input[name="confirmarSenha"]', 'senha123');
      
      await page.click('button[type="submit"]');
      
      // Verificar redirect ou mensagem de sucesso
      await expect(page.locator('text=/conta criada/i')).toBeVisible({ timeout: 5000 });
    });
  });
});
