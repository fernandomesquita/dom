# Testes E2E com Playwright

**Sistema DOM - Documentação de Testes End-to-End**  
**Última Atualização:** 2025-01-08

---

## 📚 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura de Testes](#estrutura-de-testes)
3. [Configuração](#configuração)
4. [Executando Testes](#executando-testes)
5. [Escrevendo Testes](#escrevendo-testes)
6. [Fixtures e Helpers](#fixtures-e-helpers)
7. [CI/CD](#cicd)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

Suite completa de testes E2E usando Playwright para validar fluxos críticos do Sistema DOM antes de produção.

### Cobertura Atual

**Total de Testes:** 33+

**Módulos Testados:**
- ✅ Autenticação (8 testes)
- ✅ Dashboard do Aluno (25 testes)
- ⏳ Dashboard Admin (pendente)
- ⏳ Fluxos principais (pendente)

### Tecnologias

- **Playwright** 1.56.1
- **TypeScript** 5.7.3
- **Chromium** 141.0.7390.37

---

## 📁 Estrutura de Testes

```
tests/
├── e2e/                    # Testes E2E
│   ├── auth.spec.ts        # Autenticação (8 testes)
│   └── dashboard-aluno.spec.ts  # Dashboard do Aluno (25 testes)
├── fixtures/               # Fixtures reutilizáveis
│   └── auth.ts             # Fixtures de autenticação
└── utils/                  # Utilitários (vazio por enquanto)

playwright.config.ts        # Configuração do Playwright
playwright-report/          # Relatórios HTML (gerado)
```

---

## ⚙️ Configuração

### Instalação

```bash
# Instalar Playwright
pnpm add -D @playwright/test

# Instalar browsers
pnpm exec playwright install chromium
```

### Configuração do Playwright

**Arquivo:** `playwright.config.ts`

```typescript
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
```

### Variáveis de Ambiente

**Arquivo:** `.env.test` (criar se não existir)

```bash
# Base URL do sistema
BASE_URL=http://localhost:3000

# Credenciais de admin (opcional)
ADMIN_EMAIL=admin@dom.com
ADMIN_PASSWORD=admin123
```

---

## 🚀 Executando Testes

### Comandos Disponíveis

```bash
# Executar todos os testes (headless)
pnpm test:e2e

# Executar com UI interativa
pnpm test:e2e:ui

# Executar com browser visível
pnpm test:e2e:headed

# Executar em modo debug
pnpm test:e2e:debug

# Ver relatório HTML
pnpm test:e2e:report
```

### Executar Testes Específicos

```bash
# Executar apenas testes de autenticação
pnpm test:e2e tests/e2e/auth.spec.ts

# Executar apenas testes do dashboard
pnpm test:e2e tests/e2e/dashboard-aluno.spec.ts

# Executar teste específico por nome
pnpm test:e2e --grep "deve fazer login"
```

### Executar em Diferentes Browsers

```bash
# Chromium (padrão)
pnpm test:e2e --project=chromium

# Firefox (descomentar no config primeiro)
pnpm test:e2e --project=firefox

# Webkit/Safari (descomentar no config primeiro)
pnpm test:e2e --project=webkit
```

---

## ✍️ Escrevendo Testes

### Estrutura Básica

```typescript
import { test, expect } from '../fixtures/auth';

test.describe('Módulo X', () => {
  test('deve fazer Y', async ({ page }) => {
    // Arrange
    await page.goto('/rota');
    
    // Act
    await page.click('button');
    
    // Assert
    await expect(page.locator('text=Sucesso')).toBeVisible();
  });
});
```

### Usando Fixtures de Autenticação

```typescript
// Teste com usuário autenticado
test('deve acessar dashboard', async ({ authenticatedPage: page }) => {
  // Já está autenticado como aluno
  await expect(page).toHaveURL('/dashboard');
});

// Login manual
test('deve fazer login', async ({ loginAsAluno, page }) => {
  await loginAsAluno();
  await expect(page).toHaveURL('/dashboard');
});
```

### Boas Práticas

**1. Use data-testid para seletores estáveis**

```typescript
// ❌ Ruim: seletor frágil
await page.click('.btn-primary');

// ✅ Bom: seletor estável
await page.click('[data-testid="submit-button"]');
```

**2. Aguarde elementos antes de interagir**

```typescript
// ❌ Ruim: pode falhar se elemento não estiver visível
await page.click('button');

// ✅ Bom: aguarda elemento estar visível
await expect(page.locator('button')).toBeVisible();
await page.click('button');
```

**3. Use expect ao invés de waitFor quando possível**

```typescript
// ❌ Ruim: timeout fixo
await page.waitForTimeout(5000);

// ✅ Bom: aguarda condição específica
await expect(page.locator('text=Carregado')).toBeVisible();
```

**4. Organize testes em describe blocks**

```typescript
test.describe('Módulo X', () => {
  test.beforeEach(async ({ page }) => {
    // Setup compartilhado
  });
  
  test.describe('Funcionalidade Y', () => {
    test('caso 1', async ({ page }) => {});
    test('caso 2', async ({ page }) => {});
  });
});
```

**5. Use test.skip para testes pendentes**

```typescript
test.skip('funcionalidade futura', async ({ page }) => {
  // TODO: Implementar quando funcionalidade estiver pronta
});
```

---

## 🔧 Fixtures e Helpers

### Fixture: authenticatedPage

Página já autenticada como aluno.

```typescript
test('teste com auth', async ({ authenticatedPage: page }) => {
  // Já está autenticado
});
```

### Helper: loginAsAluno

Função para fazer login como aluno.

```typescript
test('teste com login manual', async ({ loginAsAluno, page }) => {
  await loginAsAluno();
  // Agora está autenticado
});
```

### Helper: loginAsAdmin

Função para fazer login como admin.

```typescript
test('teste admin', async ({ loginAsAdmin, page }) => {
  await loginAsAdmin();
  await expect(page).toHaveURL('/admin');
});
```

### Credenciais de Teste

```typescript
import { TEST_CREDENTIALS } from '../fixtures/auth';

// Aluno
TEST_CREDENTIALS.aluno.email    // joao@dom.com
TEST_CREDENTIALS.aluno.senha    // senha123

// Admin
TEST_CREDENTIALS.admin.email    // admin@dom.com
TEST_CREDENTIALS.admin.senha    // admin123
```

---

## 🔄 CI/CD

### GitHub Actions (Exemplo)

**Arquivo:** `.github/workflows/e2e.yml`

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps chromium
      
      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          BASE_URL: http://localhost:3000
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Executar Localmente como CI

```bash
# Simular ambiente de CI
CI=true pnpm test:e2e
```

---

## 🐛 Troubleshooting

### Problema: Testes falhando com timeout

**Solução 1:** Aumentar timeout no teste

```typescript
test('teste lento', async ({ page }) => {
  test.setTimeout(60000); // 60s
  // ...
});
```

**Solução 2:** Aumentar timeout global

```typescript
// playwright.config.ts
export default defineConfig({
  timeout: 60 * 1000, // 60s
});
```

### Problema: Elemento não encontrado

**Solução:** Usar waitForSelector

```typescript
await page.waitForSelector('[data-testid="elemento"]', { timeout: 10000 });
await page.click('[data-testid="elemento"]');
```

### Problema: Teste flaky (falha intermitente)

**Solução 1:** Aguardar networkidle

```typescript
await page.goto('/rota');
await page.waitForLoadState('networkidle');
```

**Solução 2:** Usar retry

```typescript
test('teste flaky', async ({ page }) => {
  test.setTimeout(60000);
  
  // Playwright vai tentar até 3x
  await expect(async () => {
    await page.click('button');
    await expect(page.locator('text=Sucesso')).toBeVisible();
  }).toPass({ timeout: 30000 });
});
```

### Problema: Servidor não está rodando

**Solução:** Iniciar servidor antes dos testes

```bash
# Terminal 1
pnpm dev

# Terminal 2
pnpm test:e2e
```

Ou configurar webServer no `playwright.config.ts`:

```typescript
export default defineConfig({
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

### Problema: Credenciais de teste não funcionam

**Solução:** Popular banco com seed script

```bash
node scripts/seed-dashboard-simple.mjs
```

### Problema: Screenshots/vídeos não estão sendo gerados

**Solução:** Verificar configuração

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    screenshot: 'only-on-failure', // ou 'on'
    video: 'retain-on-failure',    // ou 'on'
  },
});
```

---

## 📊 Relatórios

### Relatório HTML

Após executar os testes, gere o relatório HTML:

```bash
pnpm test:e2e:report
```

Abrirá automaticamente no browser em `http://localhost:9323`

### Relatório JSON

Gerado automaticamente em `playwright-report/results.json`

Útil para integração com ferramentas de CI/CD.

### Screenshots

Salvos em `test-results/` quando testes falham.

### Vídeos

Salvos em `test-results/` quando testes falham.

---

## 📈 Métricas

### Cobertura Atual

| Módulo | Testes | Status |
|--------|--------|--------|
| Autenticação | 8 | ✅ Completo |
| Dashboard Aluno | 25 | ✅ Completo |
| Dashboard Admin | 0 | ⏳ Pendente |
| Fluxos Principais | 0 | ⏳ Pendente |
| **Total** | **33** | **~40%** |

### Próximos Passos

1. **Adicionar testes do Dashboard Admin** (15-20 testes)
   - Gestão de planos
   - Gestão de metas
   - Gestão de usuários
   - Gestão de avisos
   - Auditoria

2. **Adicionar testes de fluxos principais** (10-15 testes)
   - Criação de meta
   - Conclusão de meta
   - Resolução de questão
   - Criação de simulado
   - Visualização de material

3. **Adicionar testes de edge cases** (10-15 testes)
   - Validações de formulário
   - Limites de rate limiting
   - Comportamento offline
   - Erros de rede

4. **Configurar CI/CD** (GitHub Actions)
   - Rodar testes em PRs
   - Gerar relatórios
   - Notificar falhas

---

## 🎯 Metas de Cobertura

**Objetivo:** 80% de cobertura dos fluxos críticos

**Prioridade ALTA:**
- ✅ Login/Logout
- ✅ Dashboard do Aluno
- ⏳ Gestão de Metas (Admin)
- ⏳ Resolução de Questões

**Prioridade MÉDIA:**
- ⏳ Gestão de Planos (Admin)
- ⏳ Gestão de Usuários (Admin)
- ⏳ Simulados

**Prioridade BAIXA:**
- ⏳ Fórum
- ⏳ Materiais
- ⏳ Estatísticas

---

## 📚 Recursos

- [Playwright Docs](https://playwright.dev/docs/intro)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-test)
- [Debugging](https://playwright.dev/docs/debug)

---

**Última atualização:** 2025-01-08  
**Autor:** Manus AI
