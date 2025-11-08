# Integração com Sentry - Monitoramento de Erros em Produção

## Visão Geral

O sistema DOM está integrado com **Sentry** para monitoramento automático de erros em produção. Todos os erros não tratados são automaticamente capturados e enviados para o Sentry, permitindo debugging rápido e proativo.

---

## Setup Inicial

### 1. Criar Conta no Sentry

1. Acesse [https://sentry.io](https://sentry.io)
2. Crie uma conta gratuita (10.000 eventos/mês grátis)
3. Crie um novo projeto:
   - Platform: **React**
   - Nome: **DOM - Plataforma de Mentoria**

### 2. Configurar DSN

Após criar o projeto, copie o **DSN** (Data Source Name) fornecido pelo Sentry.

Exemplo de DSN:
```
https://abc123def456@o123456.ingest.sentry.io/7890123
```

### 3. Adicionar DSN ao Projeto

Adicione o DSN às variáveis de ambiente:

**Desenvolvimento** (`.env.local`):
```bash
# Sentry (opcional em dev)
VITE_SENTRY_DSN=https://abc123def456@o123456.ingest.sentry.io/7890123
VITE_SENTRY_ENVIRONMENT=development
```

**Produção** (configurar no Manus Dashboard):
```bash
# Sentry (obrigatório em prod)
VITE_SENTRY_DSN=https://abc123def456@o123456.ingest.sentry.io/7890123
VITE_SENTRY_ENVIRONMENT=production
```

⚠️ **Importante:** Se `VITE_SENTRY_DSN` não estiver configurado, o Sentry não será inicializado (apenas warning no console).

---

## Funcionalidades Implementadas

### 1. Captura Automática de Erros

**Erros de Renderização React:**
- Capturados automaticamente pelo `ErrorBoundary`
- Incluem component stack trace
- Exibem UI de erro amigável para o usuário

**Erros de Queries tRPC:**
- Capturados automaticamente em `main.tsx`
- Incluem queryKey e contexto da query
- Filtram erros de autenticação (não enviados para Sentry)

**Erros de Mutations tRPC:**
- Capturados automaticamente em `main.tsx`
- Incluem mutationKey e contexto da mutation
- Filtram erros de autenticação

---

### 2. Filtros Inteligentes

**Erros Ignorados (não enviados para Sentry):**
- ✅ Network errors (timeout, connection lost, fetch failed)
- ✅ Erros de autenticação (UNAUTHED_ERR_MSG)
- ✅ Erros de extensões do browser (chrome-extension://, moz-extension://)
- ✅ Breadcrumbs com informações sensíveis (password, token)

**Por quê filtrar?**
- Reduz ruído no Sentry
- Evita atingir limite de eventos
- Foca em erros reais do código

---

### 3. Contexto Rico

Cada erro enviado para o Sentry inclui:

**Contexto Automático:**
- URL da página
- User agent (browser, OS)
- Timestamp
- Stack trace completo
- Component stack (erros React)

**Contexto Customizado:**
- Query/Mutation key (erros tRPC)
- Tipo de erro (query, mutation, errorBoundary)
- Breadcrumbs (ações do usuário antes do erro)

---

### 4. Performance Monitoring

**Configuração:**
- `tracesSampleRate: 0.1` (10% em produção)
- `tracesSampleRate: 1.0` (100% em desenvolvimento)

**Métricas Coletadas:**
- Tempo de carregamento de páginas
- Tempo de queries/mutations
- Navegação entre rotas
- Renderização de componentes

---

## Uso Avançado

### Capturar Erro Manualmente

```typescript
import { captureError } from "@/lib/sentry";

try {
  // Código que pode falhar
  const result = await complexOperation();
} catch (error) {
  // Capturar erro com contexto adicional
  captureError(error, {
    operation: 'complexOperation',
    userId: user.id,
    timestamp: new Date().toISOString(),
  });
  
  // Exibir erro para o usuário
  toast.error('Operação falhou. Tente novamente.');
}
```

---

### Capturar Mensagem (não erro)

```typescript
import { captureMessage } from "@/lib/sentry";

// Avisar sobre algo inesperado (mas não erro)
captureMessage('Usuário tentou acessar recurso inexistente', 'warning', {
  userId: user.id,
  resourceId: '123',
});
```

---

### Definir Usuário Atual

```typescript
import { setUser } from "@/lib/sentry";

// Após login
setUser({
  id: user.id,
  email: user.email,
  username: user.name,
});

// Após logout
setUser(null);
```

**Benefício:** Todos os erros ficam associados ao usuário, facilitando debugging.

---

### Adicionar Breadcrumb

```typescript
import { addBreadcrumb } from "@/lib/sentry";

// Registrar ação do usuário
addBreadcrumb({
  category: 'user-action',
  message: 'Usuário clicou em "Salvar Meta"',
  level: 'info',
  data: {
    metaId: '123',
    metaTitulo: 'Estudar Direito Constitucional',
  },
});
```

**Benefício:** Entender o que o usuário fez antes do erro.

---

### Performance Monitoring

```typescript
import { startTransaction } from "@/lib/sentry";

// Medir performance de operação
const transaction = startTransaction('load-dashboard', 'http');

// ... código que queremos medir
await loadDashboardData();

transaction.finish();
```

---

## Integração com Componentes

### ErrorBoundary

O `ErrorBoundary` já está integrado com Sentry:

```typescript
import ErrorBoundary from "@/components/ErrorBoundary";

<ErrorBoundary
  onError={(error, errorInfo) => {
    // Logging adicional (opcional)
    console.log('Erro customizado:', error);
  }}
>
  <MeuComponente />
</ErrorBoundary>
```

**Comportamento:**
1. Erro é capturado pelo ErrorBoundary
2. Erro é enviado automaticamente para Sentry (via `captureError`)
3. Callback `onError` é chamado (se fornecido)
4. UI de erro é exibida para o usuário

---

### Widgets com Tratamento de Erro

Todos os 8 widgets do dashboard já tratam erros:

```typescript
const { data, error, refetch } = trpc.widgets.getCronograma.useQuery();

if (error) {
  // Erro é automaticamente enviado para Sentry (via main.tsx)
  return (
    <WidgetErrorState
      message="Não foi possível carregar o cronograma."
      onRetry={() => refetch()}
    />
  );
}
```

**Fluxo:**
1. Query falha
2. Erro é capturado em `main.tsx` (queryClient.getQueryCache().subscribe)
3. Erro é enviado para Sentry (via `captureError`)
4. Widget exibe UI de erro com retry

---

## Dashboard do Sentry

### Acessar Dashboard

1. Login no Sentry: [https://sentry.io](https://sentry.io)
2. Selecionar projeto: **DOM - Plataforma de Mentoria**
3. Ver issues: [https://sentry.io/organizations/seu-org/issues/](https://sentry.io/organizations/seu-org/issues/)

### Informações Disponíveis

**Issues (Erros):**
- Lista de erros agrupados por tipo
- Frequência de ocorrência
- Usuários afetados
- Stack trace completo
- Breadcrumbs (ações antes do erro)
- Contexto customizado

**Performance:**
- Tempo de carregamento de páginas
- Queries/mutations mais lentas
- Navegação entre rotas
- LCP, FID, CLS (Core Web Vitals)

**Releases:**
- Associar erros a versões específicas
- Comparar taxa de erros entre versões
- Rastrear quando bug foi introduzido

---

## Configuração de Alertas

### Criar Alerta de Novo Erro

1. Ir em **Alerts** > **Create Alert**
2. Selecionar **Issues**
3. Configurar condição:
   - "When a new issue is created"
   - "In project DOM"
4. Configurar ação:
   - "Send email to team@dom.com"
   - "Send Slack notification to #bugs"
5. Salvar alerta

### Criar Alerta de Taxa de Erro

1. Ir em **Alerts** > **Create Alert**
2. Selecionar **Metric Alert**
3. Configurar condição:
   - "When error rate exceeds 5%"
   - "In the last 1 hour"
4. Configurar ação:
   - "Send email to team@dom.com"
5. Salvar alerta

---

## Releases e Source Maps

### Configurar Releases

Para associar erros a versões específicas:

1. Instalar Sentry CLI:
```bash
pnpm add -D @sentry/cli
```

2. Adicionar script de release em `package.json`:
```json
{
  "scripts": {
    "sentry:release": "sentry-cli releases new $npm_package_version && sentry-cli releases files $npm_package_version upload-sourcemaps ./dist"
  }
}
```

3. Executar após build:
```bash
pnpm run build
pnpm run sentry:release
```

### Configurar Source Maps

Para ver código original (não minificado) no stack trace:

1. Adicionar plugin Vite em `vite.config.ts`:
```typescript
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig({
  build: {
    sourcemap: true, // Gerar source maps
  },
  plugins: [
    sentryVitePlugin({
      org: "seu-org",
      project: "dom",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
});
```

2. Adicionar `SENTRY_AUTH_TOKEN` ao `.env`:
```bash
SENTRY_AUTH_TOKEN=seu-token-aqui
```

---

## Custos e Limites

### Plano Gratuito

- **10.000 eventos/mês** (erros + transações)
- **1 usuário**
- **90 dias de retenção**
- **Alertas ilimitados**

### Otimizar Uso

**1. Filtrar Erros Conhecidos**
- Network errors (já filtrado)
- Erros de extensões (já filtrado)
- Erros esperados (adicionar filtro em `beforeSend`)

**2. Reduzir Taxa de Amostragem**
```typescript
// Em sentry.ts
tracesSampleRate: 0.05, // 5% em vez de 10%
```

**3. Agrupar Erros Similares**
- Sentry agrupa automaticamente por fingerprint
- Customizar fingerprint se necessário

**4. Desabilitar Session Replay**
- Consome muitos eventos
- Habilitar apenas se necessário

---

## Troubleshooting

### Sentry não está enviando erros

**1. Verificar DSN**
```bash
# Ver se DSN está configurado
echo $VITE_SENTRY_DSN
```

**2. Verificar console**
```
[Sentry] DSN não configurado. Monitoramento desabilitado.
```

**3. Verificar ambiente**
- Sentry só envia erros se DSN estiver configurado
- Em desenvolvimento, pode ser desabilitado propositalmente

---

### Muitos erros sendo enviados

**1. Verificar filtros**
- Editar `beforeSend` em `sentry.ts`
- Adicionar mais condições de filtro

**2. Reduzir taxa de amostragem**
```typescript
tracesSampleRate: 0.01, // 1% em vez de 10%
```

**3. Desabilitar performance monitoring**
```typescript
// Comentar browserTracingIntegration
// integrations: [
//   Sentry.browserTracingIntegration(),
// ],
```

---

### Erros não têm contexto suficiente

**1. Adicionar breadcrumbs**
```typescript
addBreadcrumb({
  category: 'navigation',
  message: 'Usuário navegou para /dashboard',
});
```

**2. Definir usuário**
```typescript
setUser({
  id: user.id,
  email: user.email,
});
```

**3. Adicionar contexto customizado**
```typescript
captureError(error, {
  feature: 'dashboard',
  action: 'load-widgets',
  timestamp: new Date().toISOString(),
});
```

---

## Checklist de Implementação

**Setup Inicial:**
- [ ] Criar conta no Sentry
- [ ] Criar projeto React
- [ ] Copiar DSN
- [ ] Adicionar `VITE_SENTRY_DSN` ao `.env`
- [ ] Adicionar `VITE_SENTRY_ENVIRONMENT=production`

**Integração:**
- [x] Instalar `@sentry/react`
- [x] Criar `client/src/lib/sentry.ts`
- [x] Integrar em `main.tsx`
- [x] Integrar em `ErrorBoundary.tsx`
- [x] Testar captura de erros

**Configuração Avançada:**
- [ ] Configurar releases
- [ ] Configurar source maps
- [ ] Configurar alertas
- [ ] Adicionar `setUser` após login
- [ ] Adicionar breadcrumbs em ações críticas

**Monitoramento:**
- [ ] Verificar dashboard do Sentry diariamente
- [ ] Configurar alertas de email/Slack
- [ ] Revisar performance metrics semanalmente
- [ ] Ajustar filtros conforme necessário

---

## Resumo

**Benefícios:**
- ✅ Captura automática de erros em produção
- ✅ Stack trace completo com contexto
- ✅ Associação de erros a usuários
- ✅ Performance monitoring
- ✅ Alertas em tempo real
- ✅ Dashboard centralizado

**Custo:**
- ✅ Gratuito até 10.000 eventos/mês
- ✅ Sem necessidade de infraestrutura adicional
- ✅ Setup em < 10 minutos

**Impacto:**
- 🚀 Debugging 10x mais rápido
- 🚀 Detecção proativa de bugs
- 🚀 Menos tickets de suporte
- 🚀 Melhor experiência do usuário

---

## Recursos Adicionais

- [Documentação Oficial do Sentry](https://docs.sentry.io/)
- [Sentry React SDK](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Best Practices](https://docs.sentry.io/platforms/javascript/best-practices/)
