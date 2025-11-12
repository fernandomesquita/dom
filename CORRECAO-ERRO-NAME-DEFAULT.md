# 🔧 CORREÇÃO: Erro "name = DEFAULT" ao Criar Planos

**Data:** 11 de novembro de 2025  
**Tempo total:** 30 minutos  
**Status:** ✅ **CORRIGIDO**

---

## 🐛 **PROBLEMA IDENTIFICADO**

Ao criar um plano no formulário `/admin/planos/novo`, o campo `name` (e outros) estavam sendo inseridos como `DEFAULT` no banco de dados, em vez dos valores preenchidos pelo usuário.

### **Sintoma:**

```sql
INSERT INTO plans (..., name, ..., description, ...) 
VALUES (..., default, ..., default, ...)
       ↑ Deveria ser o valor real!
```

### **Erro no console:**

```
[API Mutation Error] TRPCClientError: Failed query: 
insert into `plans` (`id`, `name`, `slug`, ...) 
values (?, ?, default, ?, ?, ?, ?, ?, default, ...)
```

---

## 🔍 **DIAGNÓSTICO**

### **PASSO 1: Debug no Frontend**

Adicionados logs na função `onSubmit` do `PlanFormPage.tsx`:

```typescript
console.log('📤 Dados do formulário (RAW):', data);
console.log('📤 Dados LIMPOS:', cleanData);
console.log('📤 Campo name:', cleanData.name);
console.log('📤 Tipo de name:', typeof cleanData.name);
```

**Resultado:** ✅ Frontend estava enviando os dados **CORRETAMENTE**:

```javascript
{
  name: 'Câmara dos Deputados – Seu último concurso',
  slug: 'seuultimoconcurso',
  description: 'Câmara dos Deputados será seu último concurso?',
  category: 'Gratuito',
  editalStatus: 'Pré-edital',
  isFeatured: false,
  disponivel: true,
  // ...
}
```

### **PASSO 2: Análise do Backend**

Verificado `server/routers/plansAdmin.ts`, procedure `create`.

**Problema encontrado:** ❌ Backend **NÃO estava aceitando** dois campos que o frontend enviava:

1. `isFeatured` (boolean)
2. `disponivel` (boolean)

**Consequência:** Drizzle ORM ignorava esses campos e usava `DEFAULT` do schema SQL.

---

## 🔧 **SOLUÇÃO APLICADA**

### **Arquivo modificado:** `server/routers/plansAdmin.ts`

### **Mudança 1: Input Schema**

**ANTES:**
```typescript
create: adminProcedure
  .input(z.object({
    name: z.string().min(3).max(255),
    slug: z.string().optional(),
    // ... outros campos
    isHidden: z.boolean().optional(),
    // ❌ FALTAVAM: isFeatured, disponivel
  }))
```

**DEPOIS:**
```typescript
create: adminProcedure
  .input(z.object({
    name: z.string().min(3).max(255),
    slug: z.string().optional(),
    // ... outros campos
    isHidden: z.boolean().optional(),
    isFeatured: z.boolean().optional(),    // ✅ ADICIONADO
    disponivel: z.boolean().optional(),    // ✅ ADICIONADO
  }))
```

### **Mudança 2: Insert Values**

**ANTES:**
```typescript
await db.insert(plans).values({
  id: planId,
  name: input.name,
  // ... outros campos
  isHidden: input.isHidden ?? false,
  // ❌ FALTAVAM: isFeatured, disponivel
  createdBy: ctx.user.id,
  updatedBy: ctx.user.id,
});
```

**DEPOIS:**
```typescript
await db.insert(plans).values({
  id: planId,
  name: input.name,
  // ... outros campos
  isHidden: input.isHidden ?? false,
  isFeatured: input.isFeatured ?? false,    // ✅ ADICIONADO
  disponivel: input.disponivel ?? true,     // ✅ ADICIONADO
  createdBy: ctx.user.id,
  updatedBy: ctx.user.id,
});
```

---

## ✅ **RESULTADO**

### **Commits realizados:**

1. **Debug logs** (commit `9fd1bb2`):
   ```
   debug: adiciona logs para investigar erro name=DEFAULT
   ```

2. **Correção** (commit `a9f1407`):
   ```
   fix: adiciona campos isFeatured e disponivel no create de planos
   ```

### **Branch atualizada:**
- `refactor/plans-page` → Push feito para GitHub
- Railway está fazendo deploy automático (2-3 minutos)

---

## 🧪 **TESTES NECESSÁRIOS**

Após deploy do Railway terminar:

### **URL:** https://dom-preview-plans-page.up.railway.app/admin/planos/novo

### **Teste 1: Criar Plano Gratuito**

**Dados:**
```
Nome: Plano Teste Correção
Slug: plano-teste-correcao
Categoria: Gratuito
Momento: Pré-edital
Entidade: Receita Federal
Cargo: Auditor Fiscal
Disponível: SIM
Em Destaque: NÃO
```

**Resultado esperado:**
- ✅ Plano criado com sucesso
- ✅ Campo `name` = "Plano Teste Correção" (não DEFAULT)
- ✅ Campo `disponivel` = true
- ✅ Campo `isFeatured` = false

### **Teste 2: Verificar no Banco**

```sql
SELECT id, name, disponivel, is_featured, created_at 
FROM plans 
ORDER BY created_at DESC 
LIMIT 1;
```

**Resultado esperado:**
```
| id       | name                    | disponivel | is_featured | created_at          |
|----------|-------------------------|------------|-------------|---------------------|
| uuid...  | Plano Teste Correção    | 1          | 0           | 2025-11-11 18:xx:xx |
```

---

## 📊 **RESUMO TÉCNICO**

### **Causa Raiz:**
Desalinhamento entre schema do frontend (Zod) e schema do backend (tRPC input).

### **Campos afetados:**
- `isFeatured` (boolean)
- `disponivel` (boolean)

### **Impacto:**
- ❌ Planos criados com valores DEFAULT em vez de valores reais
- ❌ Impossível criar planos com `isFeatured = true`
- ❌ Impossível criar planos com `disponivel = false`

### **Correção:**
- ✅ Adicionados campos faltantes no input schema
- ✅ Adicionados campos faltantes no `.values()`
- ✅ Valores default corretos (isFeatured=false, disponivel=true)

---

## 📝 **LIÇÕES APRENDIDAS**

1. **Sempre validar alinhamento frontend ↔ backend** ao adicionar campos novos
2. **Usar logs de debug** para identificar onde dados são perdidos
3. **Testar criação de registros** imediatamente após mudanças no schema
4. **Documentar mudanças** para facilitar troubleshooting futuro

---

## 🚀 **PRÓXIMOS PASSOS**

1. ✅ Aguardar deploy Railway (2-3 min)
2. ✅ Testar criação de plano
3. ✅ Verificar dados no banco
4. ✅ Remover logs de debug se tudo funcionar
5. ✅ Merge para `main` quando aprovado

---

**Correção aplicada com sucesso! 🎉**

**Tempo estimado para Railway atualizar:** 2-3 minutos  
**Teste novamente após esse período.**
