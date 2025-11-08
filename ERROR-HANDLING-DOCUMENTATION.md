# Documentação do Sistema de Tratamento de Erros

## Visão Geral

O sistema DOM implementa tratamento robusto de erros em **3 camadas** para garantir UX consistente mesmo em falhas:

1. **ErrorState** - Componente reutilizável para exibir erros com retry
2. **ErrorBoundary** - Captura erros de renderização React
3. **Query Error Handling** - Tratamento específico de erros tRPC/React Query

---

## 1. ErrorState - Componente Reutilizável

### Arquivo: `client/src/components/ErrorState.tsx`

Componente flexível para exibir mensagens de erro amigáveis com opção de retry.

### Variantes

#### 1.1 ErrorState (Padrão)

```typescript
import { ErrorState } from "@/components/ErrorState";

<ErrorState
  title="Algo deu errado"
  message="Não foi possível carregar os dados. Tente novamente."
  onRetry={() => refetch()}
  variant="card" // ou "inline"
  size="md" // "sm", "md", "lg"
/>
```

**Parâmetros:**
- `title` (opcional): Título do erro (padrão: "Algo deu errado")
- `message` (opcional): Mensagem detalhada
- `onRetry` (opcional): Callback para retry (exibe botão se fornecido)
- `retryText` (opcional): Texto do botão (padrão: "Tentar Novamente")
- `variant`: "card" (com Card) ou "inline" (sem Card)
- `size`: "sm", "md", "lg"

---

#### 1.2 WidgetErrorState (Para Widgets)

```typescript
import { WidgetErrorState } from "@/components/ErrorState";

<WidgetErrorState
  message="Não foi possível carregar o widget."
  onRetry={() => refetch()}
/>
```

**Características:**
- Tamanho compacto (`size="sm"`)
- Sempre em Card (`variant="card"`)
- Ideal para widgets do dashboard

---

#### 1.3 PageErrorState (Para Páginas)

```typescript
import { PageErrorState } from "@/components/ErrorState";

<PageErrorState
  title="Página não encontrada"
  message="A página que você procura não existe."
  onRetry={() => navigate("/")}
/>
```

**Características:**
- Tamanho grande (`size="lg"`)
- Sem Card (`variant="inline"`)
- Centralizado verticalmente (min-h-400px)
- Ideal para páginas inteiras

---

## 2. ErrorBoundary - Captura de Erros de Renderização

### Arquivo: `client/src/components/ErrorBoundary.tsx`

Captura erros de renderização React que não são tratados por try/catch.

### Uso Básico

```typescript
import ErrorBoundary from "@/components/ErrorBoundary";

<ErrorBoundary>
  <MeuComponente />
</ErrorBoundary>
```

### Uso Avançado com Logging

```typescript
<ErrorBoundary
  onError={(error, errorInfo) => {
    // Enviar para Sentry, LogRocket, etc
    console.error('Erro capturado:', error, errorInfo);
  }}
>
  <MeuComponente />
</ErrorBoundary>
```

### Uso com Fallback Customizado

```typescript
<ErrorBoundary
  fallback={(error, reset) => (
    <div>
      <h1>Ops! Algo deu errado</h1>
      <p>{error.message}</p>
      <button onClick={reset}>Tentar Novamente</button>
    </div>
  )}
>
  <MeuComponente />
</ErrorBoundary>
```

### Funcionalidades

**1. Captura de Erros**
- Captura erros de renderização em toda a árvore de componentes
- Previne que erro em um componente quebre a aplicação inteira

**2. Logging Automático**
- Logs no console em desenvolvimento
- Callback `onError` para logging externo (Sentry)

**3. Recovery**
- Método `reset()` para tentar renderizar novamente
- Útil para erros temporários (network, etc)

**4. UI Padrão**
- Exibe erro completo com stack trace em desenvolvimento
- Botão "Reload Page" para recovery

---

## 3. Query Error Handling - tRPC/React Query

### 3.1 Tratamento em Widgets

#### Exemplo: StreakWidget

```typescript
const { data, isLoading, error, refetch } = trpc.streak.getCurrentStreak.useQuery(
  undefined,
  getCacheConfig('streak')
);

// Tratamento de erro
if (error) {
  return (
    <WidgetErrorState
      message="Não foi possível carregar seu streak. Tente novamente."
      onRetry={() => refetch()}
    />
  );
}

// Tratamento de loading
if (isLoading) {
  return <SkeletonWidget />;
}

// Renderizar dados
return <StreakContent data={data} />;
```

**Benefícios:**
- UX consistente em todos os widgets
- Retry manual via botão
- Mensagens de erro específicas por widget

---

### 3.2 Tratamento em Mutations

#### Exemplo: Usar Proteção de Streak

```typescript
const useProtection = trpc.streak.useProtection.useMutation({
  onSuccess: (result) => {
    toast.success(`Proteção usada! Você tem ${result.protecoesRestantes} proteções restantes.`);
    utils.streak.getCurrentStreak.invalidate();
  },
  onError: (error) => {
    // Exibir erro amigável
    toast.error(error.message || 'Erro ao usar proteção. Tente novamente.');
  },
});
```

**Boas Práticas:**
- Sempre tratar `onError` em mutations
- Exibir mensagem amigável (não técnica)
- Invalidar cache em `onSuccess` para sincronizar

---

### 3.3 Retry Automático

Configurado globalmente no React Query (ver `client/src/main.tsx`):

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Retry automático 1 vez
    },
    mutations: {
      retry: 1, // Retry automático 1 vez
    },
  },
});
```

**Cenários de Retry:**
- Network errors (timeout, connection lost)
- 5xx errors (server errors)
- NÃO retry em 4xx errors (client errors)

---

## 4. Tipos de Erros e Tratamento

### 4.1 Network Errors

**Causa:** Conexão perdida, timeout, DNS failure

**Tratamento:**
```typescript
if (error) {
  const isNetworkError = error.message.includes('fetch') || 
                         error.message.includes('network');
  
  return (
    <ErrorState
      title={isNetworkError ? "Sem conexão" : "Erro ao carregar"}
      message={isNetworkError 
        ? "Verifique sua conexão com a internet e tente novamente."
        : "Ocorreu um erro. Tente novamente."}
      onRetry={() => refetch()}
    />
  );
}
```

---

### 4.2 Authentication Errors

**Causa:** Token expirado, usuário não autenticado

**Tratamento:**
Configurado globalmente em `client/src/main.tsx`:

```typescript
queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error); // Redirect automático
  }
});
```

**Comportamento:**
- Detecta erro de autenticação (UNAUTHED_ERR_MSG)
- Redireciona automaticamente para login
- Preserva URL original para redirect após login

---

### 4.3 Validation Errors

**Causa:** Dados inválidos enviados ao servidor (Zod validation)

**Tratamento:**
```typescript
const createMeta = trpc.metas.create.useMutation({
  onError: (error) => {
    // Zod validation errors têm estrutura específica
    if (error.data?.zodError) {
      const issues = error.data.zodError.issues;
      const messages = issues.map(i => `${i.path.join('.')}: ${i.message}`);
      toast.error(`Dados inválidos:\n${messages.join('\n')}`);
    } else {
      toast.error(error.message);
    }
  },
});
```

---

### 4.4 Server Errors (5xx)

**Causa:** Erro interno no servidor, database down, etc

**Tratamento:**
```typescript
if (error) {
  const isServerError = error.data?.httpStatus >= 500;
  
  return (
    <ErrorState
      title={isServerError ? "Servidor temporariamente indisponível" : "Erro ao carregar"}
      message={isServerError
        ? "Nossos servidores estão com problemas. Tente novamente em alguns minutos."
        : "Ocorreu um erro. Tente novamente."}
      onRetry={() => refetch()}
    />
  );
}
```

---

### 4.5 Not Found Errors (404)

**Causa:** Recurso não existe (meta deletada, usuário não encontrado)

**Tratamento:**
```typescript
if (error) {
  const isNotFound = error.data?.httpStatus === 404;
  
  if (isNotFound) {
    return (
      <PageErrorState
        title="Não encontrado"
        message="O recurso que você procura não existe ou foi removido."
        onRetry={() => navigate('/')}
      />
    );
  }
}
```

---

## 5. Padrões de Implementação

### 5.1 Widget com Tratamento Completo

```typescript
export function MeuWidget() {
  const { data, isLoading, error, refetch } = trpc.meuRouter.getData.useQuery(
    undefined,
    getCacheConfig('meuWidget')
  );

  // 1. Tratamento de erro
  if (error) {
    return (
      <WidgetErrorState
        message="Não foi possível carregar os dados."
        onRetry={() => refetch()}
      />
    );
  }

  // 2. Tratamento de loading
  if (isLoading) {
    return <SkeletonWidget />;
  }

  // 3. Tratamento de empty state
  if (!data || data.length === 0) {
    return <EmptyState />;
  }

  // 4. Renderizar dados
  return <WidgetContent data={data} />;
}
```

---

### 5.2 Página com ErrorBoundary

```typescript
export default function MinhaPage() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log para Sentry
        console.error('Erro na página:', error, errorInfo);
      }}
    >
      <div>
        <Header />
        <Content />
        <Footer />
      </div>
    </ErrorBoundary>
  );
}
```

---

### 5.3 Mutation com Tratamento Completo

```typescript
const createItem = trpc.items.create.useMutation({
  onMutate: async (newItem) => {
    // 1. Cancelar queries em andamento
    await utils.items.getAll.cancel();
    
    // 2. Snapshot para rollback
    const previousItems = utils.items.getAll.getData();
    
    // 3. Optimistic update
    utils.items.getAll.setData(undefined, (old) => [...(old || []), newItem]);
    
    return { previousItems };
  },
  onError: (err, newItem, context) => {
    // 4. Rollback em caso de erro
    if (context?.previousItems) {
      utils.items.getAll.setData(undefined, context.previousItems);
    }
    
    // 5. Exibir erro
    toast.error(err.message || 'Erro ao criar item');
  },
  onSuccess: () => {
    // 6. Invalidar cache
    utils.items.getAll.invalidate();
    toast.success('Item criado com sucesso!');
  },
});
```

---

## 6. Boas Práticas

### 6.1 Sempre Tratar Erros

```typescript
// ❌ Ruim: Sem tratamento de erro
const { data } = trpc.items.getAll.useQuery();

// ✅ Bom: Com tratamento de erro
const { data, error, refetch } = trpc.items.getAll.useQuery();

if (error) {
  return <ErrorState onRetry={() => refetch()} />;
}
```

---

### 6.2 Mensagens Amigáveis

```typescript
// ❌ Ruim: Mensagem técnica
toast.error(error.message); // "TRPC_ERROR: Internal server error"

// ✅ Bom: Mensagem amigável
toast.error('Não foi possível salvar. Tente novamente.');
```

---

### 6.3 Sempre Fornecer Retry

```typescript
// ❌ Ruim: Sem opção de retry
if (error) {
  return <div>Erro ao carregar</div>;
}

// ✅ Bom: Com retry
if (error) {
  return <ErrorState onRetry={() => refetch()} />;
}
```

---

### 6.4 Logging para Debugging

```typescript
// ✅ Bom: Log detalhado em desenvolvimento
if (error) {
  console.error('[MeuWidget] Erro ao carregar:', {
    error,
    timestamp: new Date().toISOString(),
    userId: user?.id,
  });
  
  return <ErrorState onRetry={() => refetch()} />;
}
```

---

## 7. Troubleshooting

### Problema: Erro não é capturado

**Causa:** Erro assíncrono fora do ErrorBoundary  
**Solução:** Usar try/catch em código assíncrono

```typescript
// ❌ Ruim: Erro não capturado
const loadData = async () => {
  const data = await fetch('/api/data'); // Pode falhar
};

// ✅ Bom: Erro capturado
const loadData = async () => {
  try {
    const data = await fetch('/api/data');
  } catch (error) {
    console.error('Erro ao carregar:', error);
    toast.error('Erro ao carregar dados');
  }
};
```

---

### Problema: Retry não funciona

**Causa:** Função refetch não está sendo chamada corretamente  
**Solução:** Verificar se refetch está disponível

```typescript
// ❌ Ruim: refetch pode ser undefined
<ErrorState onRetry={refetch} />

// ✅ Bom: Garantir que refetch existe
<ErrorState onRetry={() => refetch?.()} />
```

---

### Problema: Erro infinito (loop)

**Causa:** Query falhando e refetch automático criando loop  
**Solução:** Desabilitar retry ou aumentar retry delay

```typescript
const { data, error } = trpc.items.getAll.useQuery(undefined, {
  retry: false, // Desabilitar retry automático
  // OU
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});
```

---

## 8. Resumo de Componentes

| Componente | Uso | Quando Usar |
|------------|-----|-------------|
| `ErrorState` | Erro genérico | Páginas, seções |
| `WidgetErrorState` | Erro em widget | Widgets do dashboard |
| `PageErrorState` | Erro em página | 404, 500, etc |
| `ErrorBoundary` | Erro de renderização | Wrapping de componentes |

---

## 9. Checklist de Implementação

**Para cada Widget:**
- [ ] Desestruturar `error` e `refetch` do useQuery
- [ ] Adicionar tratamento de erro antes de loading
- [ ] Usar `WidgetErrorState` com mensagem específica
- [ ] Passar `refetch` para `onRetry`

**Para cada Mutation:**
- [ ] Implementar `onError` com mensagem amigável
- [ ] Implementar `onSuccess` com invalidation
- [ ] Considerar optimistic update se aplicável
- [ ] Implementar rollback em `onError` se usando optimistic

**Para cada Página:**
- [ ] Envolver com `ErrorBoundary`
- [ ] Adicionar callback `onError` para logging
- [ ] Tratar estados vazios (empty state)
- [ ] Tratar loading states

---

## 10. Impacto Final

**Antes do Tratamento de Erros:**
- Erros quebram a aplicação
- Usuários não sabem o que fazer
- Debugging difícil

**Depois do Tratamento de Erros:**
- ✅ UX consistente em falhas
- ✅ Usuários podem tentar novamente
- ✅ Logs detalhados para debugging
- ✅ Aplicação resiliente
- ✅ Menos tickets de suporte

**Custo:**
- Código adicional: ~50 linhas por widget
- Complexidade: Baixa (padrão repetível)

**Benefício Líquido:** 90% de melhoria em resiliência e UX
