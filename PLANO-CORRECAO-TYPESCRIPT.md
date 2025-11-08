# 📋 Plano de Correção Gradual - Erros TypeScript

**Data:** 2025-11-08  
**Status:** Sistema funcionando parcialmente (Home, Login, NotFound)  
**Objetivo:** Corrigir todos os erros TypeScript e restaurar funcionalidade completa

---

## 🎯 Situação Atual

### ✅ Funcionando
- Sistema base (React + Vite + tRPC)
- Páginas essenciais: Home, Login, NotFound
- Servidor backend rodando normalmente
- Banco de dados funcionando
- Usuários criados:
  - `fernandofmg@gmail.com` (ALUNO)
  - `master@dom.com` (MASTER)

### ⚠️ Problemas Identificados
- **17 erros de TypeScript** impedindo compilação completa
- Componentes com erros não podem ser importados
- App.tsx temporariamente simplificado (apenas 3 rotas)

---

## 📊 Resumo dos Erros

| Arquivo | Erros | Tipo | Prioridade |
|---------|-------|------|------------|
| `CronogramaWidget.tsx` | 3 | Propriedades inexistentes | Alta |
| `OtherWidgets.tsx` | 5 | Tipo RouterObject | Alta |
| `QTDWidget.tsx` | 1 | Tipo RouterObject | Alta |
| `sentry.ts` | 3 | Configuração React Router | Média |
| `ForumCategoria.tsx` | 2 | Tipos de parâmetros | Média |
| `ForumThread.tsx` | 3 | Comparação de tipos + null | Média |
| `MetaNova.tsx` | 2 | Propriedade inexistente | Baixa |

**Total:** 19 erros

---

## 🔧 Plano de Correção (8 Fases)

### **Fase 1: Documentação** ✅
- [x] Criar este documento
- [x] Mapear todos os erros
- [x] Definir ordem de correção
- [x] Documentar estratégia

---

### **Fase 2: CronogramaWidget.tsx** 🔄

**Erros:**
```typescript
// Linha 60: Property 'proximaMeta' does not exist
data.proximaMeta  // ❌

// Linha 83: Property 'title' does not exist  
meta.title  // ❌

// Linha 86: Property 'estimatedTime' does not exist
meta.estimatedTime  // ❌
```

**Correções:**
```typescript
// 1. Usar proximasMetas[0] ao invés de proximaMeta
const proximaMeta = data.proximasMetas?.[0];

// 2. Usar 'titulo' ao invés de 'title'
meta.titulo

// 3. Calcular tempo estimado baseado em valorAlvo
const estimatedTime = meta.valorAlvo * 2; // 2 min por questão, por exemplo
```

**Arquivos afetados:**
- `client/src/components/dashboard/widgets/CronogramaWidget.tsx`

**Teste após correção:**
- [ ] Compilação sem erros
- [ ] Widget renderiza no dashboard
- [ ] Dados exibidos corretamente

---

### **Fase 3: OtherWidgets.tsx e QTDWidget.tsx** 🔄

**Erros:**
```typescript
// Type 'RouterObject' is not an array type (5x em OtherWidgets, 1x em QTDWidget)
Object.values(trpc).map(...)  // ❌

// Property 'stats' does not exist (linha 292)
data.stats  // ❌
```

**Correções:**
```typescript
// 1. Substituir iteração sobre RouterObject por queries individuais
// ANTES:
Object.values(trpc.feature).map(...)

// DEPOIS:
const query1 = trpc.feature.query1.useQuery();
const query2 = trpc.feature.query2.useQuery();
const data = [query1.data, query2.data].filter(Boolean);

// 2. Verificar estrutura de retorno do endpoint
// Adicionar 'stats' ao tipo de retorno ou remover uso
```

**Arquivos afetados:**
- `client/src/components/dashboard/widgets/OtherWidgets.tsx`
- `client/src/components/dashboard/widgets/QTDWidget.tsx`

**Teste após correção:**
- [ ] Compilação sem erros
- [ ] Widgets renderizam no dashboard
- [ ] Dados carregam corretamente

---

### **Fase 4: Sentry (sentry.ts)** 🔄

**Erros:**
```typescript
// Linha 49: Tipo incorreto para ReactRouterOptions
useEffect: React.useEffect  // ❌

// Linha 50: 'React' refers to a UMD global
React.useEffect  // ❌

// Linha 229: Property 'startTransaction' does not exist
Sentry.startTransaction  // ❌
```

**Correções:**
```typescript
// 1. Remover integração React Router (não estamos usando react-router)
// Sentry funciona sem essa integração específica

// 2. Importar useEffect diretamente
import { useEffect } from 'react';

// 3. Atualizar para API nova do Sentry
// startTransaction foi deprecado, usar startSpan
Sentry.startSpan({ name: 'transaction' }, () => {
  // código
});
```

**Arquivos afetados:**
- `client/src/lib/sentry.ts`

**Teste após correção:**
- [ ] Compilação sem erros
- [ ] Sentry inicializa corretamente
- [ ] Erros são capturados

---

### **Fase 5: Páginas de Fórum** 🔄

**Erros em ForumCategoria.tsx:**
```typescript
// Linhas 147, 149: Argument of type 'string[]' is not assignable to 'string'
setCategoria(categorias)  // ❌ categorias é string[]
```

**Erros em ForumThread.tsx:**
```typescript
// Linha 154: Comparação de tipos incompatíveis
user.role === "admin"  // ❌ role é "MASTER" | "ALUNO" etc

// Linhas 188, 190: string[] não assignable a string
setTag(tags)  // ❌

// Linha 224: 'nivelAninhamento' is possibly 'null'
message.nivelAninhamento + 1  // ❌
```

**Correções:**
```typescript
// ForumCategoria.tsx
// Usar apenas primeira categoria ou join
setCategoria(categorias[0] || '');
// OU
setCategoria(categorias.join(','));

// ForumThread.tsx
// 1. Usar enum correto
user.role === "MASTER"  // ✅

// 2. Corrigir tipo de tags
setTag(tags[0] || '');

// 3. Adicionar null check
(message.nivelAninhamento ?? 0) + 1
```

**Arquivos afetados:**
- `client/src/pages/ForumCategoria.tsx`
- `client/src/pages/ForumThread.tsx`

**Teste após correção:**
- [ ] Compilação sem erros
- [ ] Páginas de fórum carregam
- [ ] Funcionalidades funcionam

---

### **Fase 6: MetaNova.tsx e Páginas de Metas** 🔄

**Erros:**
```typescript
// Linha 55: Property 'listByDate' does not exist
trpc.goals.listByDate.useQuery()  // ❌

// Linha 65: No overload matches this call
trpc.goals.something.useQuery(...)  // ❌
```

**Correções:**
```typescript
// 1. Verificar endpoints disponíveis no router
// Usar endpoint correto (provavelmente 'list' com filtro de data)
trpc.goals.list.useQuery({ 
  startDate: date,
  endDate: date 
});

// 2. Corrigir parâmetros do useQuery
// Verificar tipo esperado pelo endpoint
```

**Arquivos afetados:**
- `client/src/pages/MetaNova.tsx`

**Teste após correção:**
- [ ] Compilação sem erros
- [ ] Página de nova meta carrega
- [ ] Criação de meta funciona

---

### **Fase 7: Restaurar App.tsx Completo** 🔄

**Objetivo:** Adicionar gradualmente todas as rotas de volta ao App.tsx

**Estratégia:**
1. Adicionar rotas em grupos após cada fase de correção
2. Testar cada grupo antes de adicionar o próximo
3. Manter ErrorBoundary para capturar erros futuros

**Grupos de rotas:**

**Grupo 1 - Páginas principais** (após Fase 2)
```typescript
- /questoes
- /simulados
- /estatisticas
- /cadernos
- /materiais
```

**Grupo 2 - Fórum** (após Fase 5)
```typescript
- /forum
- /forum/:id
- /forum/categoria/:categoria
- /forum/novo
```

**Grupo 3 - Metas** (após Fase 6)
```typescript
- /metas
- /metas/hoje
- /metas/cronograma
- /metas/planos
- /metas/nova
- /metas/:id
```

**Grupo 4 - Admin** (após todas as correções)
```typescript
- /admin/*
```

**Teste após cada grupo:**
- [ ] Compilação sem erros
- [ ] Todas as rotas carregam
- [ ] Navegação funciona

---

### **Fase 8: Checkpoint Final** 🔄

**Tarefas:**
1. Validar todas as funcionalidades
2. Testar fluxos principais:
   - [ ] Login/Cadastro
   - [ ] Dashboard
   - [ ] Questões
   - [ ] Simulados
   - [ ] Materiais
   - [ ] Fórum
   - [ ] Metas
   - [ ] Admin
3. Criar checkpoint
4. Documentar mudanças
5. Entregar ao usuário

---

## 🔄 Progresso

| Fase | Status | Erros Corrigidos | Tempo Estimado |
|------|--------|------------------|----------------|
| 1. Documentação | ✅ Concluída | - | 10 min |
| 2. CronogramaWidget | 🔄 Em andamento | 0/3 | 15 min |
| 3. OtherWidgets | ⏳ Pendente | 0/6 | 20 min |
| 4. Sentry | ⏳ Pendente | 0/3 | 15 min |
| 5. Fórum | ⏳ Pendente | 0/5 | 20 min |
| 6. Metas | ⏳ Pendente | 0/2 | 10 min |
| 7. App.tsx | ⏳ Pendente | - | 15 min |
| 8. Checkpoint | ⏳ Pendente | - | 10 min |

**Total estimado:** ~2 horas

---

## 📝 Notas Importantes

### Estratégia de Teste
- Após cada correção, verificar compilação TypeScript
- Testar componente isoladamente quando possível
- Validar no navegador antes de prosseguir

### Rollback
- Backup do App.tsx original: `App.tsx.backup`
- Checkpoint anterior disponível: `0255d980`
- Usar `webdev_rollback_checkpoint` se necessário

### Comunicação
- Atualizar este documento após cada fase
- Marcar itens concluídos com ✅
- Documentar problemas inesperados

---

## 🎯 Critérios de Sucesso

- [ ] Zero erros de TypeScript
- [ ] Todas as rotas funcionando
- [ ] Todos os componentes renderizando
- [ ] Navegação fluida
- [ ] Sem erros no console
- [ ] Sistema pronto para deploy

---

**Última atualização:** 2025-11-08 13:05  
**Responsável:** Manus AI Agent  
**Próxima ação:** Iniciar Fase 2 (CronogramaWidget.tsx)
