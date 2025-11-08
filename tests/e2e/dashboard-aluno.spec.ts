import { test, expect } from '../fixtures/auth';

test.describe('Dashboard do Aluno', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    // Garantir que estamos no dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });
  
  test('deve carregar o dashboard com sucesso', async ({ authenticatedPage: page }) => {
    // Verificar URL
    await expect(page).toHaveURL('/dashboard');
    
    // Verificar header
    await expect(page.locator('text=João Silva')).toBeVisible();
    
    // Verificar XP Bar
    await expect(page.locator('text=/Nível/i')).toBeVisible();
  });
  
  test.describe('CronogramaWidget', () => {
    test('deve exibir meta de hoje', async ({ authenticatedPage: page }) => {
      const widget = page.locator('[data-testid="cronograma-widget"]').first();
      
      // Verificar título do widget
      await expect(widget.locator('text=/Cronograma/i')).toBeVisible();
      
      // Verificar meta de hoje
      await expect(widget.locator('text=/Meta de hoje/i')).toBeVisible();
      
      // Verificar progresso
      await expect(widget.locator('[role="progressbar"]')).toBeVisible();
    });
    
    test('deve exibir próximas metas', async ({ authenticatedPage: page }) => {
      const widget = page.locator('[data-testid="cronograma-widget"]').first();
      
      // Verificar lista de próximas metas
      await expect(widget.locator('text=/Próximas metas/i')).toBeVisible();
    });
  });
  
  test.describe('QTDWidget', () => {
    test('deve exibir questões do dia', async ({ authenticatedPage: page }) => {
      const widget = page.locator('[data-testid="qtd-widget"]').first();
      
      // Verificar título
      await expect(widget.locator('text=/Questões do Dia/i')).toBeVisible();
      
      // Verificar contador
      await expect(widget.locator('text=/\\d+\\/\\d+/')).toBeVisible();
      
      // Verificar taxa de acerto
      await expect(widget.locator('text=/%/')).toBeVisible();
    });
    
    test('deve exibir gráfico de 7 dias', async ({ authenticatedPage: page }) => {
      const widget = page.locator('[data-testid="qtd-widget"]').first();
      
      // Verificar canvas do gráfico
      await expect(widget.locator('canvas')).toBeVisible();
    });
  });
  
  test.describe('StreakWidget', () => {
    test('deve exibir dias consecutivos', async ({ authenticatedPage: page }) => {
      const widget = page.locator('[data-testid="streak-widget"]').first();
      
      // Verificar título
      await expect(widget.locator('text=/Streak/i')).toBeVisible();
      
      // Verificar contador de dias
      await expect(widget.locator('text=/\\d+ dias/i')).toBeVisible();
      
      // Verificar ícone de fogo
      await expect(widget.locator('text=🔥')).toBeVisible();
    });
    
    test('deve exibir proteções disponíveis', async ({ authenticatedPage: page }) => {
      const widget = page.locator('[data-testid="streak-widget"]').first();
      
      // Verificar proteções
      await expect(widget.locator('text=/Proteções/i')).toBeVisible();
    });
    
    test('deve exibir calendário visual', async ({ authenticatedPage: page }) => {
      const widget = page.locator('[data-testid="streak-widget"]').first();
      
      // Verificar calendário (7 dias)
      const dias = widget.locator('[data-testid="streak-day"]');
      await expect(dias).toHaveCount(7);
    });
  });
  
  test.describe('ProgressoSemanalWidget', () => {
    test('deve exibir estatísticas da semana', async ({ authenticatedPage: page }) => {
      const widget = page.locator('[data-testid="progresso-semanal-widget"]').first();
      
      // Verificar título
      await expect(widget.locator('text=/Progresso Semanal/i')).toBeVisible();
      
      // Verificar métricas
      await expect(widget.locator('text=/Metas/i')).toBeVisible();
      await expect(widget.locator('text=/Questões/i')).toBeVisible();
      await expect(widget.locator('text=/Tempo/i')).toBeVisible();
    });
    
    test('deve exibir comparação com semana anterior', async ({ authenticatedPage: page }) => {
      const widget = page.locator('[data-testid="progresso-semanal-widget"]').first();
      
      // Verificar indicadores de crescimento (↑ ou ↓)
      await expect(widget.locator('text=/[↑↓]/')).toBeVisible();
    });
  });
  
  test.describe('MateriaisWidget', () => {
    test('deve exibir materiais em andamento', async ({ authenticatedPage: page }) => {
      const widget = page.locator('[data-testid="materiais-widget"]').first();
      
      // Verificar título
      await expect(widget.locator('text=/Materiais em Andamento/i')).toBeVisible();
      
      // Verificar lista de materiais
      const materiais = widget.locator('[data-testid="material-item"]');
      await expect(materiais.first()).toBeVisible();
    });
    
    test('deve exibir progresso de cada material', async ({ authenticatedPage: page }) => {
      const widget = page.locator('[data-testid="materiais-widget"]').first();
      
      // Verificar barra de progresso
      await expect(widget.locator('[role="progressbar"]').first()).toBeVisible();
    });
  });
  
  test.describe('RevisoesWidget', () => {
    test('deve exibir revisões pendentes', async ({ authenticatedPage: page }) => {
      const widget = page.locator('[data-testid="revisoes-widget"]').first();
      
      // Verificar título
      await expect(widget.locator('text=/Revisões Pendentes/i')).toBeVisible();
      
      // Verificar contador
      await expect(widget.locator('text=/\\d+ revisões?/i')).toBeVisible();
    });
  });
  
  test.describe('PlanoWidget', () => {
    test('deve exibir informações do plano', async ({ authenticatedPage: page }) => {
      const widget = page.locator('[data-testid="plano-widget"]').first();
      
      // Verificar título
      await expect(widget.locator('text=/Seu Plano/i')).toBeVisible();
      
      // Verificar nome do plano
      await expect(widget.locator('text=/Premium/i')).toBeVisible();
      
      // Verificar validade
      await expect(widget.locator('text=/meses? restantes?/i')).toBeVisible();
    });
  });
  
  test.describe('ComunidadeWidget', () => {
    test('deve exibir últimas discussões', async ({ authenticatedPage: page }) => {
      const widget = page.locator('[data-testid="comunidade-widget"]').first();
      
      // Verificar título
      await expect(widget.locator('text=/Comunidade/i')).toBeVisible();
      
      // Verificar lista de discussões
      const discussoes = widget.locator('[data-testid="discussao-item"]');
      await expect(discussoes.first()).toBeVisible();
    });
  });
  
  test.describe('XPBar e Gamificação', () => {
    test('deve exibir XP e nível', async ({ authenticatedPage: page }) => {
      // Verificar XP Bar
      await expect(page.locator('text=/Nível \\d+/i')).toBeVisible();
      await expect(page.locator('text=/\\d+ XP/i')).toBeVisible();
      
      // Verificar barra de progresso
      await expect(page.locator('[data-testid="xp-bar"]')).toBeVisible();
    });
    
    test('deve abrir dialog de conquistas', async ({ authenticatedPage: page }) => {
      // Clicar no botão de conquistas
      await page.click('[aria-label="Ver conquistas"]');
      
      // Verificar dialog
      await expect(page.locator('text=/Conquistas/i')).toBeVisible();
      
      // Verificar lista de conquistas
      await expect(page.locator('[data-testid="achievement-item"]').first()).toBeVisible();
    });
  });
  
  test.describe('Responsividade', () => {
    test('deve funcionar em mobile', async ({ authenticatedPage: page }) => {
      // Mudar viewport para mobile
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Recarregar
      await page.reload();
      
      // Verificar que widgets são exibidos em coluna única
      const widgets = page.locator('[data-testid*="widget"]');
      await expect(widgets.first()).toBeVisible();
    });
  });
  
  test.describe('Loading States', () => {
    test('deve exibir skeletons durante carregamento', async ({ page }) => {
      // Interceptar requests para simular loading
      await page.route('**/api/trpc/**', route => {
        setTimeout(() => route.continue(), 2000);
      });
      
      await page.goto('/dashboard');
      
      // Verificar skeletons
      await expect(page.locator('[data-testid="skeleton"]').first()).toBeVisible();
    });
  });
  
  test.describe('Error States', () => {
    test('deve exibir erro quando query falha', async ({ page }) => {
      // Interceptar requests para simular erro
      await page.route('**/api/trpc/**', route => {
        route.abort('failed');
      });
      
      await page.goto('/dashboard');
      
      // Verificar mensagem de erro
      await expect(page.locator('text=/erro/i').first()).toBeVisible({ timeout: 10000 });
      
      // Verificar botão de retry
      await expect(page.locator('text=/tentar novamente/i').first()).toBeVisible();
    });
  });
});
