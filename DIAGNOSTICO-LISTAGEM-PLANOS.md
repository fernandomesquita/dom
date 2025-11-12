# 🔍 DIAGNÓSTICO COMPLETO: Listagem de Planos Vazia

**Data:** 11 de novembro de 2025 - 19:00  
**Status:** 🔍 **INVESTIGANDO**  
**Hipótese inicial:** Bases diferentes ❌ **DESCARTADA**

---

## 🎯 **PROBLEMA**

Plano criado com sucesso, mas não aparece na listagem.

---

## ✅ **INVESTIGAÇÃO REALIZADA**

### **1. Verificação de Bases/Tabelas Diferentes**

**Resultado:** ❌ **DESCARTADA - Todos usam a mesma tabela `plans`**

**Evidências:**
```typescript
// CREATE (plansAdmin.ts linha 72-97)
await db.insert(plans).values({...});  // ✅ Insere em 'plans'

// LIST (plansAdmin.ts linha 278-284)
const items = await db
  .select()
  .from(plans)  // ✅ Lê de 'plans'
  .where(and(...conditions))
  .orderBy(desc(plans.createdAt));
```

**Conclusão:** CREATE e LIST usam a **MESMA tabela `plans`**.

---

### **2. Verificação de Routers Diferentes**

**Resultado:** ✅ **MESMO ROUTER**

**Evidências:**
```typescript
// Frontend (PlansAdmin.tsx linha 56)
trpc.plansAdmin.listAll.useQuery({});  // ✅ Chama plansAdmin

// Backend (plansAdmin.ts linha 247)
listAll: adminProcedure.query(...)  // ✅ Existe no plansAdmin
```

**Conclusão:** Frontend e backend usam o **MESMO router `plansAdmin`**.

---

### **3. Verificação de Procedures Ausentes**

**Resultado:** ✅ **PROCEDURE EXISTE**

**Procedures no plansAdmin.ts:**
- ✅ `create` (linha 26)
- ✅ `update` (linha 110)
- ✅ `delete` (linha 178)
- ✅ `listAll` (linha 247) ← **EXISTE!**
- ✅ `getById` (linha 195)
- ✅ `setFeatured` (linha 216)
- ✅ `getStats` (linha 309)

**Conclusão:** Todos os procedures necessários **EXISTEM**.

---

## 🔍 **NOVA HIPÓTESE: Filtros ou Soft Delete**

### **Possibilidade 1: Soft Delete**

**Código do listAll (linha 263):**
```typescript
const conditions = [isNull(plans.deletedAt)];
```

**Problema potencial:** Se o plano foi criado com `deletedAt` preenchido, ele não aparece!

**Verificar no CREATE (linha 72-97):**
```typescript
await db.insert(plans).values({
  id: planId,
  name: input.name,
  slug: slug,
  // ... outros campos
  // ❓ deletedAt está sendo definido?
});
```

**Ação:** Verificar se `deletedAt` está sendo inserido como `null` explicitamente.

---

### **Possibilidade 2: Status Filtrado**

**Código do listAll (linha 274):**
```typescript
if (status) conditions.push(eq(plans.status, status));
```

**Problema potencial:** Se o frontend envia um filtro de status que não bate com o plano criado.

**Verificar no CREATE (linha 91):**
```typescript
status: 'Em edição',  // ✅ Plano criado com status 'Em edição'
```

**Verificar no FRONTEND (PlansAdmin.tsx linha 56):**
```typescript
trpc.plansAdmin.listAll.useQuery({});  // ❓ Envia filtro de status?
```

**Ação:** Verificar se frontend está enviando filtro que exclui "Em edição".

---

### **Possibilidade 3: Campos Obrigatórios Faltando**

**Schema do banco (schema-plans.ts):**
```typescript
name: varchar('name', { length: 255 }).notNull(),
slug: varchar('slug', { length: 255 }).notNull(),
category: categoryEnum.notNull(),
editalStatus: editalStatusEnum.notNull().default('N/A'),
```

**Verificar no CREATE:** Se algum campo `notNull` está sendo inserido como `null`.

---

## 🔧 **PRÓXIMOS PASSOS**

### **PASSO 1: Adicionar Logs no CREATE**

**Arquivo:** `server/routers/plansAdmin.ts` (após linha 97)

```typescript
await db.insert(plans).values({
  // ... valores ...
});

// ✅ ADICIONAR VERIFICAÇÃO IMEDIATA:
console.log('✅ [CREATE] Plano inserido com ID:', planId);

const verification = await db
  .select()
  .from(plans)
  .where(eq(plans.id, planId))
  .limit(1);

console.log('🔍 [CREATE] Verificação imediata:', verification);
console.log('🔍 [CREATE] deletedAt:', verification[0]?.deletedAt);
console.log('🔍 [CREATE] status:', verification[0]?.status);
```

---

### **PASSO 2: Adicionar Logs no LIST**

**Arquivo:** `server/routers/plansAdmin.ts` (antes linha 278)

```typescript
listAll: adminProcedure
  .query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const { search, status, category, mentorId, page, pageSize } = input;
    
    // ✅ ADICIONAR LOGS:
    console.log('📋 [LIST] Input recebido:', input);
    console.log('📋 [LIST] Filtros aplicados:', { search, status, category, mentorId });
    
    const conditions = [isNull(plans.deletedAt)];
    
    // ... resto do código ...
    
    const items = await db
      .select()
      .from(plans)
      .where(and(...conditions))
      .orderBy(desc(plans.createdAt))
      .limit(pageSize)
      .offset(offset);
    
    // ✅ ADICIONAR LOGS:
    console.log('📋 [LIST] Resultados encontrados:', items.length);
    console.log('📋 [LIST] Primeiro resultado:', items[0]);
    console.log('📋 [LIST] IDs encontrados:', items.map(i => i.id));
    
    return { items, pagination };
  }),
```

---

### **PASSO 3: Verificar Campos no Banco**

**Para Fernando executar no MySQL Workbench:**

```sql
-- Ver TODOS os planos (incluindo deletados)
SELECT 
  id, 
  name, 
  slug, 
  status, 
  deleted_at, 
  created_at 
FROM plans 
ORDER BY created_at DESC 
LIMIT 5;
```

**Resultado esperado:**
```
| id       | name                  | slug                | status      | deleted_at | created_at          |
|----------|-----------------------|---------------------|-------------|------------|---------------------|
| uuid...  | Câmara dos Deputados  | camara-deputados... | Em edição   | NULL       | 2025-11-11 19:xx:xx |
```

**Se `deleted_at` NÃO for NULL → PROBLEMA ENCONTRADO!**

---

## 📊 **RESUMO TÉCNICO**

### **Descartado:**
- ❌ Bases/tabelas diferentes
- ❌ Routers diferentes
- ❌ Procedures ausentes

### **Investigando:**
- ⏳ Soft delete (`deletedAt` não null)
- ⏳ Filtro de status excluindo "Em edição"
- ⏳ Campos obrigatórios faltando

### **Próxima ação:**
1. Adicionar logs no CREATE e LIST
2. Testar criação de plano
3. Verificar logs no console
4. Verificar dados no banco

---

**Tempo estimado:** 15-20 minutos até identificar causa raiz

---

**FIM DO DOCUMENTO**
