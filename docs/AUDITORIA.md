# Módulo de Auditoria - Sistema DOM

## 📋 Visão Geral

O módulo de auditoria do Sistema DOM foi projetado para rastrear todas as ações administrativas realizadas no sistema, fornecendo transparência, segurança e capacidade de auditoria completa.

---

## ⚠️ STATUS ATUAL: TEMPORARIAMENTE DESABILITADO

**Data:** 11 de novembro de 2025  
**Commit:** `0359119`  
**Motivo:** Problemas de performance causando lentidão e/ou erros no sistema

### Endpoints Desabilitados

Todos os endpoints de auditoria estão retornando dados vazios temporariamente:

| Endpoint | Retorno Atual |
|----------|---------------|
| `admin.audit_v1.list` | `{ logs: [], pagination: { total: 0 } }` |
| `admin.audit_v1.getByUser` | `[]` |
| `admin.audit_v1.getByAction` | `[]` |
| `admin.audit_v1.stats` | `{ total: 0, last24h: 0, byAction: [], byUser: [] }` |

### Código Original Preservado

O código original foi preservado com prefixo `_original`:
- `_list_original` - Implementação completa do endpoint `list`
- `_getByUser_original` - Implementação completa do endpoint `getByUser`
- `_getByAction_original` - Implementação completa do endpoint `getByAction`
- `_stats_original` - Implementação completa do endpoint `stats`

### Impacto

**O que NÃO funciona:**
- ❌ Interface de visualização de logs de auditoria em `/admin/auditoria`
- ❌ Rastreamento de ações administrativas
- ❌ Estatísticas de uso do sistema
- ❌ Histórico de mudanças por usuário

**O que CONTINUA funcionando:**
- ✅ Logs de aplicação (via logger) no Railway
- ✅ Todas as outras funcionalidades do sistema
- ✅ Sistema de autenticação e autorização

---

## 🏗️ Arquitetura Original

### Tabela: `auditLogs`

```typescript
export const auditLogs = mysqlTable("audit_logs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  actorId: varchar("actorId", { length: 36 }).notNull(),
  actorRole: mysqlEnum("actorRole", ["MASTER", "ADMINISTRATIVO", "MENTOR", "PROFESSOR", "ALUNO"]).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  targetType: varchar("targetType", { length: 50 }),
  targetId: varchar("targetId", { length: 36 }),
  payload: json("payload"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
```

### Endpoints Originais

#### 1. `list` - Listar logs com filtros

**Input:**
```typescript
{
  page: number,
  limit: number,
  actorId?: string,
  action?: string,
  targetType?: string,
  startDate?: string,
  endDate?: string,
  search?: string
}
```

**Output:**
```typescript
{
  logs: AuditLog[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

#### 2. `getByUser` - Logs de um usuário

**Input:**
```typescript
{
  userId: string,
  limit: number
}
```

**Output:**
```typescript
AuditLog[]
```

#### 3. `getByAction` - Logs de uma ação

**Input:**
```typescript
{
  action: string,
  limit: number
}
```

**Output:**
```typescript
AuditLog[]
```

#### 4. `stats` - Estatísticas gerais

**Output:**
```typescript
{
  total: number,
  last24h: number,
  byAction: { action: string, count: number }[],
  byUser: { actorId: string, actorRole: string, count: number }[]
}
```

---

## 🔧 Plano de Reabilitação

### Fase 1: Investigação (2h)

1. **Analisar queries SQL**
   - Executar `EXPLAIN` nas queries mais lentas
   - Identificar full table scans
   - Medir tempo de resposta com diferentes volumes

2. **Identificar gargalos**
   - Falta de índices?
   - Queries complexas demais?
   - Volume de dados muito grande?

### Fase 2: Otimizações (3h)

1. **Banco de Dados**
   ```sql
   -- Índices recomendados
   CREATE INDEX idx_audit_actor_created ON auditLogs(actorId, createdAt DESC);
   CREATE INDEX idx_audit_action_created ON auditLogs(action, createdAt DESC);
   CREATE INDEX idx_audit_target_created ON auditLogs(targetType, createdAt DESC);
   CREATE INDEX idx_audit_created ON auditLogs(createdAt DESC);
   ```

2. **Código**
   - Implementar paginação cursor-based (mais eficiente que offset)
   - Adicionar cache Redis para stats (TTL: 5 minutos)
   - Limitar agregações a períodos específicos
   - Adicionar timeout nas queries (max 5s)

3. **Arquivamento**
   - Implementar soft delete de logs antigos (>90 dias)
   - Considerar particionamento por data

### Fase 3: Testes (1h)

1. **Performance**
   - Criar script de seed com 10k+ logs
   - Testar todos os endpoints
   - Medir tempo de resposta (target: <500ms p95)
   - Verificar uso de memória/CPU

2. **Funcionalidade**
   - Testar filtros
   - Testar paginação
   - Testar stats

### Fase 4: Deploy (30min)

1. **Reabilitar endpoints**
   ```typescript
   // Em server/routers/admin/auditRouter_v1.ts
   // Renomear:
   _list_original → list
   _getByUser_original → getByUser
   _getByAction_original → getByAction
   _stats_original → stats
   ```

2. **Monitoramento**
   - Deploy em staging primeiro
   - Monitorar logs por 24h
   - Deploy em produção se OK

---

## 📊 Métricas de Sucesso

**Performance:**
- ✅ Tempo de resposta < 500ms (p95)
- ✅ Uso de CPU < 50% durante queries
- ✅ Uso de memória estável

**Funcionalidade:**
- ✅ Todos os filtros funcionando
- ✅ Paginação eficiente
- ✅ Stats atualizadas corretamente

**Estabilidade:**
- ✅ Zero erros em 24h de monitoramento
- ✅ Sem impacto em outras funcionalidades

---

## 🔗 Referências

**Arquivos:**
- `server/routers/admin/auditRouter_v1.ts` - Router de auditoria
- `drizzle/schema.ts` - Schema da tabela `auditLogs`
- `client/src/pages/admin/AuditLogsPage.tsx` - Interface de visualização

**Documentação:**
- `docs/DECISOES-CRITICAS.md` (Seção 2) - Decisão de desabilitação
- `todo.md` - Tarefa de reabilitação

**Commits:**
- `0359119` - Desabilitação temporária
- (Futuro) - Reabilitação com otimizações

---

## 💡 Lições Aprendidas

1. **Índices são críticos** - Queries sem índices em tabelas grandes causam lentidão severa
2. **Paginação cursor-based > offset** - Mais eficiente para grandes volumes
3. **Cache é essencial** - Stats não precisam ser calculadas em tempo real
4. **Arquivamento é necessário** - Logs antigos devem ser movidos para storage frio
5. **Monitoramento proativo** - Detectar problemas antes que afetem usuários

---

## 📝 Notas Adicionais

- Logs de aplicação (via logger) continuam funcionando normalmente no Railway
- Sistema de autenticação não é afetado pela desabilitação
- Código original está preservado e pode ser reabilitado a qualquer momento
- Desabilitação é temporária até otimizações serem implementadas
