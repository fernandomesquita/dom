# 📊 RELATÓRIO COMPLETO - VERIFICAÇÃO DE ROUTERS DE PLANS

**Data:** 2025-11-11 13:10  
**Projeto:** dom-eara-v4  
**Objetivo:** Mapear TODOS os routers de plans existentes

---

## 1️⃣ ROUTERS ENCONTRADOS (4 arquivos)

```
✅ server/routers/admin/plansRouter_v1.ts    (ANTIGO - tabela metas_planos_estudo)
✅ server/routers/plansAdmin.ts              (NOVO - tabela plans)
✅ server/routers/plansPublic.ts             (NOVO - tabela plans)
✅ server/routers/plansUser.ts               (NOVO - tabela plans)
```

---

## 2️⃣ QUAL TABELA CADA ROUTER USA?

| Router | Tabela | Schema | Status |
|--------|--------|--------|--------|
| `plansRouter_v1.ts` | `metas_planos_estudo` | Antigo | ❌ **OBSOLETO** |
| `plansAdmin.ts` | `plans` | Novo | ✅ **CORRETO** |
| `plansPublic.ts` | `plans` | Novo | ✅ **CORRETO** |
| `plansUser.ts` | `plans` | Novo | ✅ **CORRETO** |

---

## 3️⃣ REGISTRO NO APPROUTER (server/routers.ts)

```typescript
// ✅ ROUTERS NOVOS (tabela plans)
plansPublic: plansPublicRouter,    // ✅ REGISTRADO
plansUser: plansUserRouter,        // ✅ REGISTRADO
plansAdmin: plansAdminRouter,      // ✅ REGISTRADO

// ❌ ROUTER ANTIGO (tabela metas_planos_estudo)
admin: router({
  plans_v1: plansRouter_v1,        // ❌ OBSOLETO
  ...
})
```

**Conclusão:** TODOS os routers estão registrados (3 novos + 1 antigo)

---

## 4️⃣ PROCEDURES DE CADA ROUTER

### **plansPublic.ts** (Público - SEM autenticação)

```typescript
✅ list: publicProcedure          // Listar planos públicos
✅ getById: publicProcedure        // Ver detalhes de um plano
```

**Tabela:** `plans`  
**Filtros:** `isHidden = false`  
**Status:** ✅ **FUNCIONAL**

---

### **plansUser.ts** (Autenticado - usuários logados)

```typescript
✅ enroll: protectedProcedure          // Matricular em plano gratuito
✅ myPlans: protectedProcedure         // Meus planos matriculados
✅ dashboard: protectedProcedure       // Dashboard do aluno
✅ updateSettings: protectedProcedure  // Atualizar configurações
```

**Tabela:** `plans` + `plan_enrollments`  
**Status:** ✅ **FUNCIONAL**

---

### **plansAdmin.ts** (Admin - apenas administradores)

```typescript
✅ create: adminProcedure              // Criar plano
✅ update: adminProcedure              // Atualizar plano
✅ delete: adminProcedure              // Deletar plano
✅ setFeatured: adminProcedure         // Definir plano em destaque
✅ listAll: adminProcedure             // Listar todos os planos (admin)
✅ getStats: adminProcedure            // Estatísticas de planos
✅ linkDiscipline: adminProcedure      // Vincular disciplina
✅ unlinkDiscipline: adminProcedure    // Desvincular disciplina
✅ listDisciplines: adminProcedure     // Listar disciplinas do plano
```

**Tabela:** `plans` + `plan_enrollments` + `plan_disciplines`  
**Status:** ✅ **FUNCIONAL**

---

### **plansRouter_v1.ts** (Admin ANTIGO - OBSOLETO)

```typescript
❌ list: staffProcedure        // Usa tabela metas_planos_estudo
❌ getById: staffProcedure     // Usa tabela metas_planos_estudo
❌ create: staffProcedure      // Usa tabela metas_planos_estudo
❌ update: staffProcedure      // Usa tabela metas_planos_estudo
❌ delete: adminRoleProcedure  // Usa tabela metas_planos_estudo
❌ stats: staffProcedure       // Usa tabela metas_planos_estudo
```

**Tabela:** `metas_planos_estudo` (ANTIGA)  
**Status:** ❌ **OBSOLETO - NÃO USAR**

---

## 5️⃣ ANÁLISE DE PROCEDURES NECESSÁRIAS

### **Requisitos do Documento V2:**

| Procedure | Router Esperado | Existe? | Onde? |
|-----------|----------------|---------|-------|
| `listPublic` | plansPublic | ✅ **SIM** | `plansPublic.list` |
| `enrollFree` | plansUser | ✅ **SIM** | `plansUser.enroll` |
| `myEnrollments` | plansUser | ✅ **SIM** | `plansUser.myPlans` |
| `listAll` (admin) | plansAdmin | ✅ **SIM** | `plansAdmin.listAll` |
| `create` (admin) | plansAdmin | ✅ **SIM** | `plansAdmin.create` |
| `update` (admin) | plansAdmin | ✅ **SIM** | `plansAdmin.update` |
| `delete` (admin) | plansAdmin | ✅ **SIM** | `plansAdmin.delete` |
| `getStats` (admin) | plansAdmin | ✅ **SIM** | `plansAdmin.getStats` |

**Conclusão:** ✅ **TODAS as procedures necessárias JÁ EXISTEM!**

---

## 6️⃣ CAMPO `disponivel` NOS ROUTERS

### **Verificação:**

**plansPublic.list** (linha 30):
```typescript
const conditions = [
  eq(plans.isHidden, false), // ✅ Usa is_hidden
];
```
⚠️ **NÃO usa campo `disponivel`** (ainda)

**plansUser.enroll** (linha 28):
```typescript
and(
  eq(plans.id, planId),
  eq(plans.isHidden, false),
  eq(plans.category, 'Gratuito')
)
```
⚠️ **NÃO usa campo `disponivel`** (ainda)

**plansAdmin.listAll** (precisa verificar):
- Provavelmente NÃO usa `disponivel` ainda

---

## 7️⃣ CENÁRIO IDENTIFICADO

**CENÁRIO B: Routers novos existem mas incompletos**

✅ **Routers corretos existem** (plansPublic, plansUser, plansAdmin)  
✅ **Usam tabela `plans`** (correta)  
✅ **Procedures necessárias existem**  
⚠️ **MAS:** Não usam campo `disponivel` ainda

---

## 8️⃣ PLANO DE AÇÃO RECOMENDADO

### **OPÇÃO A: Atualizar routers existentes (RECOMENDADO)**

**Tempo:** 30 minutos  
**Risco:** Baixo

**Ações:**
1. ✅ Adicionar filtro `disponivel` em `plansPublic.list`
2. ✅ Adicionar filtro `disponivel` em `plansUser.enroll`
3. ✅ Adicionar campo `disponivel` em `plansAdmin.create/update`
4. ✅ Testar procedures

**Arquivos a modificar:**
- `server/routers/plansPublic.ts` (1 linha)
- `server/routers/plansUser.ts` (1 linha)
- `server/routers/plansAdmin.ts` (2 linhas)

---

### **OPÇÃO B: Reescrever plansRouter_v1 (NÃO RECOMENDADO)**

**Tempo:** 2-3 horas  
**Risco:** Alto

**Motivo:** Não faz sentido reescrever router OBSOLETO quando já temos routers CORRETOS funcionando.

---

### **OPÇÃO C: Deletar plansRouter_v1 (FUTURO)**

**Tempo:** 10 minutos  
**Risco:** Médio

**Ações:**
1. Verificar se algum frontend usa `admin.plans_v1`
2. Migrar chamadas para `plansAdmin`
3. Remover registro do appRouter
4. Deletar arquivo

**Status:** ⏸️ **POSTERGAR** (fazer depois da refatoração)

---

## 9️⃣ DECISÃO FINAL

**EXECUTAR OPÇÃO A:**

1. ✅ Atualizar `plansPublic.list` (adicionar filtro `disponivel`)
2. ✅ Atualizar `plansUser.enroll` (adicionar filtro `disponivel`)
3. ✅ Atualizar `plansAdmin.create` (adicionar campo `disponivel`)
4. ✅ Atualizar `plansAdmin.update` (adicionar campo `disponivel`)
5. ✅ Commit e testar

**Motivo:**
- ✅ Routers corretos JÁ EXISTEM
- ✅ Procedures JÁ EXISTEM
- ✅ Apenas falta adicionar campo `disponivel`
- ✅ Rápido, seguro, eficiente

---

## 🔟 FRONTEND - QUAL ROUTER USA?

**Verificar:**
```bash
grep -r "trpc\.plans" client/src/pages/
grep -r "trpc\.admin\.plans_v1" client/src/pages/
```

**Resultado esperado:**
- Se usa `plansAdmin` → ✅ Correto
- Se usa `admin.plans_v1` → ❌ Precisa migrar

---

**AGUARDANDO APROVAÇÃO PARA EXECUTAR OPÇÃO A.**

