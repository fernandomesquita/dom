# PRIORIDADES CRÍTICAS - DOM EARA V4

**Autor:** Manus AI  
**Data:** 08 de Novembro de 2025  
**Versão do Projeto:** 0255d980  
**Progresso Global:** ~75%

---

## 📋 RESUMO EXECUTIVO

Este documento lista as **tarefas críticas** do projeto DOM EARA V4 em ordem de prioridade, considerando impacto no negócio, experiência do usuário e viabilidade técnica.

### Status Atual

**Módulos 100% Completos:**
- ✅ Autenticação & Segurança (JWT + Refresh Token + Rate Limiting)
- ✅ Dashboard Admin (Planos, Metas, Alunos, Avisos, Auditoria)
- ✅ Dashboard do Aluno (8 widgets integrados + gamificação)
- ✅ Banco de Dados (32+ tabelas)
- ✅ Módulo de Metas (cronograma, streaks, notificações)
- ✅ Questões & Simulados
- ✅ Materiais de Estudo
- ✅ Fórum

**Módulos Pendentes:**
- ⏳ Verificação de Email (CRÍTICO)
- ⏳ Recuperação de Senha (CRÍTICO)
- ⏳ Otimizações de Performance (ALTO)
- ⏳ Testes Automatizados (MÉDIO)
- ⏳ Documentação Swagger (BAIXO)

---

## 🔴 PRIORIDADE CRÍTICA (Implementar IMEDIATAMENTE)

### 1. Validação de Entrada com Zod em Procedures tRPC

**Impacto:** 🔴 CRÍTICO - Segurança  
**Estimativa:** 2-3 dias  
**Complexidade:** Média

#### Descrição

Atualmente, as procedures tRPC não possuem validação de entrada robusta. Isso representa um risco de segurança crítico, pois dados malformados ou maliciosos podem causar:
- SQL Injection (se não tratados corretamente pelo Drizzle)
- Crashes do servidor (tipos inesperados)
- Corrupção de dados no banco
- Exploits de lógica de negócio

#### Tarefas

1. Instalar `zod` no projeto
2. Criar schemas Zod para cada procedure em:
   - `server/routers/dashboard/dashboardRouter.ts`
   - `server/routers/dashboard/widgetsRouter.ts`
   - `server/routers/dashboard/streakRouter.ts`
   - `server/routers/dashboard/telemetryRouter.ts`
   - `server/routers/dashboard/gamificationRouter.ts`
   - `server/routers/admin/plansRouter_v1.ts`
   - `server/routers/admin/goalsRouter_v1.ts`
   - `server/routers/admin/usersRouter_v1.ts`
   - `server/routers/admin/noticesRouter_v1.ts`
   - `server/routers/admin/auditRouter_v1.ts`
3. Aplicar `.input(schema)` em todas as procedures
4. Adicionar mensagens de erro customizadas
5. Testar com payloads inválidos

#### Exemplo

```typescript
// ANTES (SEM VALIDAÇÃO)
getCronograma: protectedProcedure.query(async ({ ctx }) => {
  // ...
});

// DEPOIS (COM VALIDAÇÃO)
import { z } from 'zod';

const getCronogramaSchema = z.object({
  limit: z.number().int().positive().max(50).optional().default(5),
  disciplinaId: z.string().uuid().optional(),
});

getCronograma: protectedProcedure
  .input(getCronogramaSchema)
  .query(async ({ ctx, input }) => {
    const { limit, disciplinaId } = input;
    // ...
  });
```

#### Benefícios

- ✅ Segurança: Previne ataques de injeção e exploits
- ✅ Confiabilidade: Garante que dados sempre estão no formato esperado
- ✅ DX: Autocomplete e type safety no frontend
- ✅ Documentação: Schemas servem como documentação viva

---

### 2. Adicionar Índices no Banco de Dados

**Impacto:** 🔴 CRÍTICO - Performance  
**Estimativa:** 1 dia  
**Complexidade:** Baixa

#### Descrição

Atualmente, o banco de dados não possui índices otimizados para as queries mais frequentes. Com o crescimento do número de usuários e dados, isso causará:
- Queries lentas (> 1s)
- Timeouts em dashboards
- Sobrecarga do banco
- Experiência ruim do usuário

#### Índices Necessários

**Tabela `metas`:**
```sql
CREATE INDEX idx_metas_user_data ON metas(user_id, data);
CREATE INDEX idx_metas_user_status ON metas(user_id, status);
CREATE INDEX idx_metas_plano ON metas(plano_id);
```

**Tabela `questoes_resolvidas`:**
```sql
CREATE INDEX idx_questoes_user_data ON questoes_resolvidas(user_id, created_at);
CREATE INDEX idx_questoes_user_disciplina ON questoes_resolvidas(user_id, disciplina_id);
```

**Tabela `cronograma`:**
```sql
CREATE INDEX idx_cronograma_user_data ON cronograma(user_id, data);
CREATE INDEX idx_cronograma_user_tipo ON cronograma(user_id, tipo);
```

**Tabela `materiais_estudados`:**
```sql
CREATE INDEX idx_materiais_user_progresso ON materiais_estudados(user_id, progresso);
CREATE INDEX idx_materiais_user_updated ON materiais_estudados(user_id, updated_at);
```

**Tabela `streak_logs`:**
```sql
CREATE INDEX idx_streak_user_data ON streak_logs(user_id, data);
CREATE INDEX idx_streak_user_ativo ON streak_logs(user_id, ativo);
```

**Tabela `estatisticas_diarias`:**
```sql
CREATE INDEX idx_estatisticas_user_data ON estatisticas_diarias(user_id, data);
```

**Tabela `gamification_xp`:**
```sql
CREATE INDEX idx_xp_level ON gamification_xp(level DESC);
CREATE INDEX idx_xp_xp ON gamification_xp(xp DESC);
```

**Tabela `gamification_achievements`:**
```sql
CREATE INDEX idx_achievements_user ON gamification_achievements(user_id, unlocked_at);
```

#### Como Aplicar

1. Criar arquivo `drizzle/migrations/add-indexes.sql`
2. Executar via `webdev_execute_sql`
3. Verificar com `EXPLAIN` se queries estão usando índices
4. Monitorar performance com `SHOW PROFILE`

#### Benefícios

- ✅ Performance: Queries 10-100x mais rápidas
- ✅ Escalabilidade: Suporta milhares de usuários
- ✅ Custo: Reduz carga no banco (menor custo de infra)

---

### 3. Implementar Cache React Query nos Widgets

**Impacto:** 🔴 CRÍTICO - Performance & UX  
**Estimativa:** 1 dia  
**Complexidade:** Baixa

#### Descrição

Atualmente, os widgets fazem queries ao backend **toda vez** que o componente re-renderiza. Isso causa:
- Queries desnecessárias (mesmos dados buscados múltiplas vezes)
- Lentidão ao navegar (cada navegação refetch tudo)
- Sobrecarga no servidor
- Custo de banda desnecessário

#### Implementação

**Configuração Global:**
```typescript
// client/src/main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

**Cache Específico por Widget:**
```typescript
// Widgets que mudam raramente (Plano, Comunidade)
const { data } = trpc.widgets.getPlanoAtual.useQuery(undefined, {
  staleTime: 30 * 60 * 1000, // 30 minutos
});

// Widgets que mudam frequentemente (Cronograma, QTD)
const { data } = trpc.widgets.getCronograma.useQuery(undefined, {
  staleTime: 2 * 60 * 1000, // 2 minutos
});

// Widgets em tempo real (Streak)
const { data } = trpc.widgets.getStreak.useQuery(undefined, {
  staleTime: 30 * 1000, // 30 segundos
  refetchInterval: 60 * 1000, // Refetch a cada 1 minuto
});
```

#### Benefícios

- ✅ Performance: Reduz queries em 80-90%
- ✅ UX: Dashboard carrega instantaneamente ao voltar
- ✅ Custo: Reduz carga no servidor
- ✅ Offline: Dados ficam disponíveis em cache

---

### 4. Adicionar Tratamento de Erros nos Widgets

**Impacto:** 🔴 CRÍTICO - UX  
**Estimativa:** 1 dia  
**Complexidade:** Baixa

#### Descrição

Atualmente, se uma query falhar, o widget simplesmente não exibe nada. Isso causa confusão no usuário:
- "Por que meu cronograma está vazio?"
- "Cadê minhas questões do dia?"
- "O sistema está quebrado?"

#### Implementação

**1. Criar Componente ErrorState:**
```typescript
// client/src/components/ErrorState.tsx
export function ErrorState({ 
  title = "Erro ao carregar dados",
  message = "Tente novamente em alguns instantes",
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar Novamente
        </Button>
      )}
    </div>
  );
}
```

**2. Usar nos Widgets:**
```typescript
// client/src/components/dashboard/widgets/CronogramaWidget.tsx
export function CronogramaWidget() {
  const { data, isLoading, error, refetch } = trpc.widgets.getCronograma.useQuery();

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cronograma</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState 
            title="Erro ao carregar cronograma"
            message={error.message}
            onRetry={() => refetch()}
          />
        </CardContent>
      </Card>
    );
  }

  // ... resto do componente
}
```

**3. Adicionar ErrorBoundary:**
```typescript
// client/src/components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // Opcional: enviar para Sentry
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState 
          title="Algo deu errado"
          message="Recarregue a página para tentar novamente"
          onRetry={() => window.location.reload()}
        />
      );
    }

    return this.props.children;
  }
}
```

**4. Envolver Dashboard:**
```typescript
// client/src/pages/Dashboard.tsx
export default function Dashboard() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        <DashboardHeader />
        <HeroSection />
        {/* ... widgets ... */}
      </div>
    </ErrorBoundary>
  );
}
```

#### Benefícios

- ✅ UX: Usuário entende o que aconteceu
- ✅ Recuperação: Botão de retry permite tentar novamente
- ✅ Confiança: Sistema parece mais robusto
- ✅ Debug: Mensagens de erro ajudam a identificar problemas

---

### 5. Verificação de Email

**Impacto:** 🔴 CRÍTICO - Segurança & Compliance  
**Estimativa:** 2-3 dias  
**Complexidade:** Média

#### Descrição

Atualmente, qualquer pessoa pode se cadastrar com qualquer email (mesmo que não seja dela). Isso causa:
- Spam de contas falsas
- Impossibilidade de recuperar senha (email inválido)
- Problemas de compliance (LGPD)
- Baixa qualidade da base de usuários

#### Tarefas

1. Criar tabela `email_verification_tokens`
2. Implementar helper `generateEmailVerificationToken`
3. Implementar helper `verifyEmailToken`
4. Criar procedure `auth.sendVerificationEmail`
5. Criar procedure `auth.verifyEmail`
6. Criar procedure `auth.resendVerificationEmail`
7. Atualizar `auth.register` para enviar email
8. Atualizar `auth.login` para bloquear não verificados
9. Criar template de email HTML
10. Configurar Resend (serviço de email)
11. Criar página `/verify-email`
12. Adicionar banner no dashboard para não verificados

#### Fluxo

1. Usuário se cadastra → email enviado automaticamente
2. Usuário clica no link do email → redireciona para `/verify-email?token=xxx`
3. Frontend chama `auth.verifyEmail` com token
4. Backend valida token e marca email como verificado
5. Usuário é redirecionado para dashboard

#### Benefícios

- ✅ Segurança: Apenas emails reais podem se cadastrar
- ✅ Compliance: Atende LGPD
- ✅ Qualidade: Base de usuários limpa
- ✅ Recuperação: Senha pode ser recuperada

---

### 6. Recuperação de Senha

**Impacto:** 🔴 CRÍTICO - UX  
**Estimativa:** 2 dias  
**Complexidade:** Média

#### Descrição

Atualmente, se um usuário esquecer a senha, **não há como recuperá-la**. Isso causa:
- Usuários presos fora da conta
- Suporte sobrecarregado
- Perda de usuários (abandonam a plataforma)

#### Tarefas

1. Reutilizar tabela `tokens` (type: PASSWORD_RESET)
2. Implementar helper `generatePasswordResetToken`
3. Implementar helper `validatePasswordResetToken`
4. Criar procedure `auth.forgotPassword`
5. Criar procedure `auth.resetPassword`
6. Criar template de email
7. Aplicar rate limiting (3 tentativas/hora)
8. Criar página `/forgot-password`
9. Criar página `/reset-password/:token`
10. Invalidar refresh tokens após reset

#### Fluxo

1. Usuário clica em "Esqueci minha senha" → vai para `/forgot-password`
2. Usuário digita email → backend envia email com link
3. Usuário clica no link → redireciona para `/reset-password?token=xxx`
4. Usuário digita nova senha → backend valida token e atualiza senha
5. Todos os refresh tokens são invalidados (segurança)
6. Usuário é redirecionado para login

#### Benefícios

- ✅ UX: Usuário pode recuperar acesso sozinho
- ✅ Suporte: Reduz tickets de "esqueci minha senha"
- ✅ Retenção: Usuários não abandonam a plataforma
- ✅ Segurança: Tokens expiram em 1h

---

## 🟠 PRIORIDADE ALTA (Implementar em Seguida)

### 7. Skeleton Loading nos Widgets

**Impacto:** 🟠 ALTO - UX  
**Estimativa:** 1 dia  
**Complexidade:** Baixa

#### Descrição

Atualmente, enquanto os widgets carregam, a tela fica em branco. Isso causa:
- Sensação de lentidão
- Usuário não sabe se está carregando ou quebrado
- Experiência ruim em conexões lentas

#### Implementação

**1. Criar Componente WidgetSkeleton:**
```typescript
// client/src/components/WidgetSkeleton.tsx
export function WidgetSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-20 w-full" />
      </CardContent>
    </Card>
  );
}
```

**2. Usar nos Widgets:**
```typescript
export function CronogramaWidget() {
  const { data, isLoading } = trpc.widgets.getCronograma.useQuery();

  if (isLoading) {
    return <WidgetSkeleton />;
  }

  // ... resto do componente
}
```

#### Benefícios

- ✅ UX: Usuário sabe que está carregando
- ✅ Percepção: Sistema parece mais rápido
- ✅ Profissionalismo: Padrão da indústria

---

### 8. Drag-and-Drop de Widgets

**Impacto:** 🟠 ALTO - UX  
**Estimativa:** 2 dias  
**Complexidade:** Média

#### Descrição

Permitir que o usuário reordene os widgets arrastando. Isso aumenta:
- Personalização
- Engajamento
- Satisfação do usuário

#### Implementação

1. Instalar `@dnd-kit/core` e `@dnd-kit/sortable`
2. Envolver grid de widgets com `DndContext`
3. Usar `useSortable` em cada widget
4. Salvar ordem via `widgetsRouter.reorderWidgets`
5. Persistir no banco (`widget_configs.position`)

#### Benefícios

- ✅ UX: Usuário controla seu dashboard
- ✅ Engajamento: Aumenta tempo na plataforma
- ✅ Diferencial: Poucos concorrentes têm isso

---

### 9. Animações de Level Up

**Impacto:** 🟠 ALTO - Engajamento  
**Estimativa:** 1 dia  
**Complexidade:** Baixa

#### Descrição

Quando o usuário sobe de nível ou desbloqueia uma conquista, exibir:
- Confetti animado
- Modal comemorativo
- Som de celebração (opcional)

Isso aumenta **drasticamente** o engajamento e a dopamina do usuário.

#### Implementação

1. Instalar `canvas-confetti`
2. Detectar level up via `gamificationRouter.getXP`
3. Exibir confetti quando `level` aumenta
4. Criar `LevelUpModal` com animação
5. Adicionar som (opcional)

#### Benefícios

- ✅ Engajamento: Usuário quer subir de nível
- ✅ Dopamina: Sensação de conquista
- ✅ Retenção: Usuário volta para ganhar mais XP

---

### 10. Implementar Procedures Mock (streakRouter, telemetryRouter)

**Impacto:** 🟠 ALTO - Funcionalidade  
**Estimativa:** 2-3 dias  
**Complexidade:** Média

#### Descrição

Algumas procedures ainda retornam dados mock:
- `streakRouter.getCurrentStreak` (parcial)
- `streakRouter.useProtection`
- `streakRouter.getHistory`
- `streakRouter.getLeaderboard`
- `telemetryRouter.trackEvent`
- `telemetryRouter.batchTrackEvents`

Isso impede que funcionalidades funcionem corretamente.

#### Tarefas

1. Implementar `getCurrentStreak` com dados reais
2. Implementar `useProtection` (consumir proteção)
3. Implementar `getHistory` (histórico de streaks)
4. Implementar `getLeaderboard` (ranking de streaks)
5. Implementar `trackEvent` (salvar evento)
6. Implementar `batchTrackEvents` (salvar múltiplos eventos)

#### Benefícios

- ✅ Funcionalidade: Sistema funciona 100%
- ✅ Analytics: Podemos rastrear comportamento do usuário
- ✅ Gamificação: Ranking de streaks funciona

---

## 🟡 PRIORIDADE MÉDIA (Implementar Depois)

### 11. Dashboard de Estatísticas (Admin)

**Impacto:** 🟡 MÉDIO - Valor Agregado  
**Estimativa:** 3-4 dias  
**Complexidade:** Alta

Criar página `/admin/dashboard` com KPIs agregados do sistema, gráficos de evolução temporal e views materializadas.

---

### 12. Exportação de Relatórios (Admin)

**Impacto:** 🟡 MÉDIO - Valor Agregado  
**Estimativa:** 2-3 dias  
**Complexidade:** Média

Adicionar botão "Exportar CSV/Excel" nas páginas de listagem (alunos, planos, metas, logs).

---

### 13. Sistema de Conquistas Expandido

**Impacto:** 🟡 MÉDIO - Engajamento  
**Estimativa:** 3-4 dias  
**Complexidade:** Média

Adicionar 20+ conquistas novas, conquistas secretas, conquistas por tempo, por consistência, sociais, etc.

---

### 14. Ranking e Competição

**Impacto:** 🟡 MÉDIO - Engajamento  
**Estimativa:** 2-3 dias  
**Complexidade:** Média

Implementar ranking global de XP, ranking de streaks, ranking por disciplina, sistema de ligas.

---

### 15. Widgets Expandidos

**Impacto:** 🟡 MÉDIO - Funcionalidade  
**Estimativa:** 5-7 dias  
**Complexidade:** Alta

Adicionar funcionalidades extras nos widgets (calendário mensal, filtros, drag-and-drop, heatmap, etc).

---

## 🟢 PRIORIDADE BAIXA (Nice to Have)

### 16. PWA (Progressive Web App)

**Impacto:** 🟢 BAIXO - Conveniência  
**Estimativa:** 2-3 dias  
**Complexidade:** Média

Transformar o site em PWA para permitir instalação no celular.

---

### 17. Testes E2E

**Impacto:** 🟢 BAIXO - Qualidade  
**Estimativa:** 5-7 dias  
**Complexidade:** Alta

Criar testes E2E com Playwright para garantir que funcionalidades críticas não quebrem.

---

### 18. Monitoramento (Sentry)

**Impacto:** 🟢 BAIXO - Observabilidade  
**Estimativa:** 1 dia  
**Complexidade:** Baixa

Integrar Sentry para rastrear erros em produção.

---

### 19. CI/CD Pipeline

**Impacto:** 🟢 BAIXO - Infraestrutura  
**Estimativa:** 2-3 dias  
**Complexidade:** Média

Configurar pipeline de CI/CD com GitHub Actions para deploy automático.

---

### 20. Documentação Swagger

**Impacto:** 🟢 BAIXO - Documentação  
**Estimativa:** 2-3 dias  
**Complexidade:** Média

Criar documentação de API com Swagger para facilitar integração.

---

## 📊 RESUMO DE PRIORIDADES

| Prioridade | Tarefas | Estimativa Total | Impacto |
|------------|---------|------------------|---------|
| 🔴 CRÍTICA | 6 tarefas | 10-13 dias | Segurança, Performance, UX |
| 🟠 ALTA | 5 tarefas | 9-12 dias | UX, Engajamento, Funcionalidade |
| 🟡 MÉDIA | 5 tarefas | 15-21 dias | Valor Agregado, Engajamento |
| 🟢 BAIXA | 5 tarefas | 12-16 dias | Qualidade, Infraestrutura |
| **TOTAL** | **21 tarefas** | **46-62 dias** | **~2-3 meses** |

---

## 🎯 RECOMENDAÇÃO DE EXECUÇÃO

### Sprint 1 (2 semanas) - CRÍTICO
1. Validação de Entrada com Zod
2. Índices no Banco de Dados
3. Cache React Query
4. Tratamento de Erros nos Widgets
5. Verificação de Email
6. Recuperação de Senha

**Resultado:** Sistema seguro, performático e com UX básica.

### Sprint 2 (2 semanas) - ALTO
7. Skeleton Loading
8. Drag-and-Drop de Widgets
9. Animações de Level Up
10. Implementar Procedures Mock

**Resultado:** Sistema completo e engajador.

### Sprint 3 (3-4 semanas) - MÉDIO
11. Dashboard de Estatísticas
12. Exportação de Relatórios
13. Conquistas Expandidas
14. Ranking e Competição
15. Widgets Expandidos

**Resultado:** Sistema com valor agregado e gamificação completa.

### Sprint 4 (2-3 semanas) - BAIXO
16. PWA
17. Testes E2E
18. Monitoramento
19. CI/CD
20. Documentação Swagger

**Resultado:** Sistema production-ready com infraestrutura sólida.

---

## 🚨 BLOQUEADORES CONHECIDOS

### 1. Erro de Build (Exit Code 137 - OOM Killed)

**Status:** Conhecido, não crítico  
**Workaround:** Usar dev server (funciona perfeitamente)  
**Solução:** Aumentar memória do sandbox ou otimizar bundle

### 2. Schema snake_case vs camelCase

**Status:** Resolvido  
**Solução:** Sempre verificar estrutura real da tabela com `DESCRIBE` antes de criar queries

### 3. Seed Script Não Idempotente

**Status:** Resolvido  
**Solução:** Adicionada limpeza automática no início do seed

---

## 📞 CONTATO

Para dúvidas ou esclarecimentos sobre este documento, consulte:
- `E10-DOCUMENTACAO-COMPLETA.md` - Documentação completa da E10
- `CHANGELOG-E10.md` - Histórico detalhado da E10
- `todo.md` - Lista completa de tarefas do projeto

---

**Última atualização:** 08 de Novembro de 2025  
**Versão:** 1.0  
**Autor:** Manus AI
