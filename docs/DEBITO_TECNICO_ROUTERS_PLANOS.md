# 🔧 DÉBITO TÉCNICO: Routers de Planos

**Status:** 🟡 ATIVO  
**Prioridade:** Média  
**Estimativa:** 40-60 minutos  
**Criado em:** 13 de Novembro de 2025  
**Responsável:** A definir

---

## 📊 RESUMO EXECUTIVO

O sistema atualmente usa uma arquitetura de routers inconsistente para planos. `admin.plans_v1` foi criado para gerenciar instâncias de planos de usuários (`metas_planos_estudo`), mas o procedure `getById` foi adaptado temporariamente para buscar templates de planos (`plans`). Esta mistura funciona, mas cria confusão e deve ser refatorada.

**Impacto:** 🟡 Médio (funciona, mas confuso para manutenção)  
**Risco:** 🟡 Médio (pode causar bugs em features futuras)

---

## 🔴 O PROBLEMA

### Arquitetura Atual (Inconsistente):

```typescript
// admin.plans_v1 (plansRouter_v1.ts):
{
  list: → metas_planos_estudo ✅ (correto)
  getById: → plans ⚠️ (HACK temporário)
  create: → metas_planos_estudo ✅ (correto)
  update: → metas_planos_estudo ✅ (correto)
}

// plansAdmin (plansAdmin.ts):
{
  create: → plans ✅ (correto)
  update: → plans ✅ (correto)
  listAll: → plans ✅ (correto)
  getById: ❌ NÃO EXISTE
}
```

### Frontend Atual (Mix de Routers):

```typescript
// PlanFormPage.tsx - Usa AMBOS os routers:
const { data } = trpc.admin.plans_v1.getById.useQuery()     // ⚠️ Hack
const createMutation = trpc.plansAdmin.create.useMutation() // ✅ Correto
const updateMutation = trpc.plansAdmin.update.useMutation() // ✅ Correto
```

---

## 🎯 CONTEXTO

### Dois Tipos de Planos:

**1. Templates de Planos (Tabela: `plans`)**
- Criados por: Admin
- Contexto: Catálogo de planos disponíveis para assinatura
- Exemplos: "Plano TRF - R$ 299", "Plano Gratuito Câmara"
- Campos: name, slug, category, price, description, etc.

**2. Instâncias de Planos (Tabela: `metas_planos_estudo`)**
- Criados por: Sistema (quando usuário assina)
- Contexto: Plano específico de um usuário com cronograma
- Relacionamento: usuario_id + plano_id (FK para plans)
- Campos: titulo, horasPorDia, dataInicio, status, etc.

### Fluxo Correto:

```
1. Admin cria TEMPLATE (plans)
   └─ Router: plansAdmin ou admin.planTemplates_v1 (futuro)
   
2. Usuário ASSINA template (metas_planos_estudo)
   └─ Router: admin.plans_v1
   └─ Relaciona: user_id + plan_id
```

---

## ⚠️ POR QUE É UM PROBLEMA?

### Confusão de Nomenclatura:
```typescript
// Nome sugere uma coisa, faz outra:
admin.plans_v1.getById()  // Espera-se plans, mas busca metas_planos_estudo
                          // (exceto getById que foi hackeado)
```

### Manutenção Difícil:
- Desenvolvedor precisa saber qual router usar
- Não é óbvio qual tabela cada procedure acessa
- Pode causar bugs ao adicionar novas features

### Código Espalhado:
```typescript
// Frontend precisa saber 2 routers diferentes:
import { trpc } from './trpc';

// Para getById: usa admin.plans_v1
trpc.admin.plans_v1.getById

// Para create/update: usa plansAdmin
trpc.plansAdmin.create
trpc.plansAdmin.update
```

---

## ✅ SOLUÇÃO IDEAL

### Nova Arquitetura (Limpa):

```typescript
// admin.planTemplates_v1 (NOVO - para templates):
{
  list: → plans
  getById: → plans
  create: → plans
  update: → plans
  delete: → plans
}

// admin.userPlans_v1 (RENOMEAR plans_v1):
{
  list: → metas_planos_estudo
  getById: → metas_planos_estudo
  create: → metas_planos_estudo
  update: → metas_planos_estudo
  delete: → metas_planos_estudo
}

// DEPRECAR: plansAdmin (funcionalidade movida para planTemplates_v1)
```

### Frontend Refatorado:

```typescript
// PlanFormPage.tsx (admin edita templates):
const { data } = trpc.admin.planTemplates_v1.getById.useQuery()
const createMutation = trpc.admin.planTemplates_v1.create.useMutation()
const updateMutation = trpc.admin.planTemplates_v1.update.useMutation()

// UserPlansPage.tsx (usuário vê suas instâncias):
const { data } = trpc.admin.userPlans_v1.list.useQuery()
const { data } = trpc.admin.userPlans_v1.getById.useQuery()
```

---

## 📋 PLANO DE REFATORAÇÃO

### Fase 1: Criar Router Novo (20 min)

**Arquivo:** `server/routers/planTemplatesRouter.ts`

```typescript
import { router, staffProcedure } from '../trpc';
import { z } from 'zod';
import { plans } from '../db/schema';
import { eq } from 'drizzle-orm';

const planTemplateSchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  category: z.enum(['Pago', 'Gratuito']),
  editalStatus: z.enum(['Previsto', 'Publicado', 'Pós-edital', 'N/A']),
  entity: z.string().optional(),
  role: z.string().optional(),
  price: z.number().optional(),
  landingPageUrl: z.string().optional(),
  durationDays: z.number().optional(),
  validityDate: z.date().optional(),
  featuredImageUrl: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  disponivel: z.boolean().default(true),
  isHidden: z.boolean().default(false),
  mentorId: z.string().optional(),
});

export const planTemplatesRouter = router({
  // Listar todos os templates
  list: staffProcedure
    .input(z.object({
      page: z.number().default(1),
      pageSize: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const db = ctx.db;
      const offset = (input.page - 1) * input.pageSize;
      
      const items = await db
        .select()
        .from(plans)
        .limit(input.pageSize)
        .offset(offset);
      
      const totalCount = await db
        .select({ count: sql`count(*)` })
        .from(plans);
      
      return {
        items,
        pagination: {
          page: input.page,
          pageSize: input.pageSize,
          totalCount: Number(totalCount[0].count),
          totalPages: Math.ceil(Number(totalCount[0].count) / input.pageSize),
        },
      };
    }),

  // Buscar template por ID
  getById: staffProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const db = ctx.db;
      
      const plan = await db
        .select()
        .from(plans)
        .where(eq(plans.id, input.id))
        .limit(1);
      
      if (!plan[0]) {
        throw new TRPCError({ 
          code: 'NOT_FOUND',
          message: 'Template de plano não encontrado' 
        });
      }
      
      return plan[0];
    }),

  // Criar template
  create: staffProcedure
    .input(planTemplateSchema)
    .mutation(async ({ ctx, input }) => {
      const db = ctx.db;
      
      const result = await db
        .insert(plans)
        .values({
          ...input,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      
      return { id: result.insertId };
    }),

  // Atualizar template
  update: staffProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: planTemplateSchema.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = ctx.db;
      
      await db
        .update(plans)
        .set({
          ...input.data,
          updatedAt: new Date(),
        })
        .where(eq(plans.id, input.id));
      
      return { success: true };
    }),

  // Deletar template
  delete: staffProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const db = ctx.db;
      
      await db
        .delete(plans)
        .where(eq(plans.id, input.id));
      
      return { success: true };
    }),
});
```

---

### Fase 2: Registrar Router (5 min)

**Arquivo:** `server/routers.ts`

```typescript
import { planTemplatesRouter } from './planTemplatesRouter';

export const appRouter = router({
  // ... outros routers
  
  admin: {
    plans_v1: plansRouter_v1,              // Renomear para userPlans_v1
    planTemplates_v1: planTemplatesRouter, // ✅ NOVO
  },
  
  // DEPRECAR eventualmente:
  plansAdmin: plansAdminRouter,
});
```

---

### Fase 3: Atualizar Frontend (10 min)

**Arquivo:** `client/src/pages/admin/PlanFormPage.tsx`

```typescript
// ANTES (mix de routers):
const { data } = trpc.admin.plans_v1.getById.useQuery(...)
const createMutation = trpc.plansAdmin.create.useMutation(...)
const updateMutation = trpc.plansAdmin.update.useMutation(...)

// DEPOIS (router único):
const { data } = trpc.admin.planTemplates_v1.getById.useQuery(...)
const createMutation = trpc.admin.planTemplates_v1.create.useMutation(...)
const updateMutation = trpc.admin.planTemplates_v1.update.useMutation(...)
```

**Arquivo:** `client/src/pages/admin/PlansPage.tsx`

```typescript
// Atualizar listagem:
const { data } = trpc.admin.planTemplates_v1.list.useQuery(...)
```

---

### Fase 4: Testar (5 min)

**Checklist de testes:**
- [ ] Listar templates de planos
- [ ] Criar novo template
- [ ] Editar template existente
- [ ] Deletar template
- [ ] Verificar instâncias de usuários não afetadas

---

### Fase 5: Deprecar Router Antigo (5 min)

**Arquivo:** `server/routers/plansAdmin.ts`

```typescript
// Adicionar comentário de depreciação:
/**
 * @deprecated Use admin.planTemplates_v1 instead
 * Este router será removido na v2.0
 */
export const plansAdminRouter = router({
  // ...
});
```

---

## ⏱️ ESTIMATIVA DETALHADA

| Fase | Atividade | Tempo |
|------|-----------|-------|
| 1 | Criar planTemplatesRouter.ts | 20 min |
| 2 | Registrar em routers.ts | 5 min |
| 3 | Atualizar PlanFormPage.tsx | 5 min |
| 3 | Atualizar PlansPage.tsx | 5 min |
| 4 | Testes manuais | 5 min |
| 5 | Deprecar router antigo | 5 min |
| **TOTAL** | | **45 minutos** |

**Buffer:** +15 minutos para imprevistos  
**Total com buffer:** 60 minutos

---

## 🎯 BENEFÍCIOS DO REFACTOR

### Clareza:
```typescript
// Óbvio qual router usar:
admin.planTemplates_v1  // Para templates (admin)
admin.userPlans_v1      // Para instâncias (usuário)
```

### Manutenção:
- ✅ Um router por contexto
- ✅ Nomenclatura clara
- ✅ Fácil entender o código

### Escalabilidade:
- ✅ Adicionar features fica óbvio onde
- ✅ Novos devs entendem rapidamente
- ✅ Evita bugs por confusão

### Performance:
- ✅ Queries otimizadas por contexto
- ✅ Sem hacks ou adaptações

---

## 🚨 RISCOS SE NÃO REFATORAR

### Curto Prazo (Baixo):
- Sistema funciona normalmente
- Confusão apenas para devs

### Médio Prazo (Médio):
- Bugs ao adicionar features
- Tempo extra para entender código
- Onboarding de novos devs mais lento

### Longo Prazo (Alto):
- Código se torna "legacy"
- Refactor fica cada vez mais difícil
- Pode impedir features futuras

---

## 📊 MÉTRICAS DE SUCESSO

**Refactor será considerado bem-sucedido quando:**

- [ ] Zero uso de `plansAdmin` no frontend
- [ ] `admin.planTemplates_v1` cobre 100% dos casos de templates
- [ ] `admin.userPlans_v1` cobre 100% dos casos de instâncias
- [ ] Documentação atualizada
- [ ] Testes passando
- [ ] Zero confusão sobre qual router usar

---

## 🔗 RECURSOS

### Arquivos Envolvidos:

**Backend:**
- `server/routers/planTemplatesRouter.ts` (criar)
- `server/routers/plansRouter_v1.ts` (renomear/limpar)
- `server/routers/plansAdmin.ts` (deprecar)
- `server/routers.ts` (atualizar exports)

**Frontend:**
- `client/src/pages/admin/PlanFormPage.tsx`
- `client/src/pages/admin/PlansPage.tsx`
- `client/src/pages/student/MyPlans.tsx` (verificar)

### Documentação:
- Este documento (DEBITO_TECNICO_ROUTERS_PLANOS.md)
- GUIA_URLS_EDICAO_EVITAR_404.md (atualizar)

---

## 📝 CHECKLIST DE IMPLEMENTAÇÃO

### Preparação:
- [ ] Criar branch: `refactor/plan-routers-cleanup`
- [ ] Backup do código atual
- [ ] Ler este documento completamente

### Implementação:
- [ ] Fase 1: Criar planTemplatesRouter.ts
- [ ] Fase 2: Registrar router
- [ ] Fase 3: Atualizar frontend
- [ ] Fase 4: Testar todas as operações
- [ ] Fase 5: Deprecar router antigo

### Finalização:
- [ ] Commit com mensagem descritiva
- [ ] Push e criar PR
- [ ] Code review
- [ ] Merge e deploy
- [ ] Atualizar documentação
- [ ] Fechar issue de débito técnico

---

## 🎓 LIÇÕES APRENDIDAS

### O Que Levou a Este Débito:

1. **Nomenclatura ambígua:** `plans_v1` não deixa claro que é para instâncias
2. **Dois routers similares:** `plansAdmin` e `plans_v1` com funções sobrepostas
3. **Hack rápido:** getById adaptado sob pressão de tempo
4. **Falta de specs:** Não havia documento claro sobre arquitetura de planos

### Como Evitar no Futuro:

1. ✅ **Nomear routers claramente:**
   - `planTemplates` em vez de `plans` (genérico)
   - `userPlans` em vez de `metas_planos_estudo` (técnico demais)

2. ✅ **Um router por contexto:**
   - Não criar routers que fazem coisas similares
   - Consolidar funcionalidades relacionadas

3. ✅ **Documentar arquitetura:**
   - Criar docs ANTES de implementar
   - Especificar qual router para qual caso

4. ✅ **Evitar hacks sob pressão:**
   - Se não tem tempo para fazer certo, documentar débito
   - Criar issue imediatamente
   - Estimar refactor

---

## 💬 NOTAS ADICIONAIS

### Por Que Não Foi Feito Correto na Primeira Vez?

**Contexto:** Sessão de debugging de 4+ horas focada em resolver bugs críticos:
- 8 bugs resolvidos
- 5 documentos criados
- 13 commits
- Sistema funcional estabelecido

**Decisão:** Fix rápido (4 min) vs arquitetura correta (60 min)
- Produtividade já alta
- Cabeça cansada após 4h
- Fix funciona perfeitamente
- Refactor pode esperar momento melhor

**Filosofia:** "Make it work, make it right, make it fast"
- ✅ Make it work: Feito (fix rápido)
- 🔄 Make it right: Este documento (próximo passo)
- ⏳ Make it fast: Não necessário (performance ok)

---

## 🎯 PRÓXIMOS PASSOS IMEDIATOS

1. **Criar issue no GitHub:**
   ```markdown
   Title: [Refactor] Separar routers de planos (templates vs instâncias)
   
   Labels: refactor, debt, enhancement
   Priority: Medium
   Estimate: 1 hour
   
   Description: Ver DEBITO_TECNICO_ROUTERS_PLANOS.md
   ```

2. **Adicionar ao backlog:**
   - Prioridade: Média
   - Sprint: Próximo ou +1
   - Assignee: Dev com mais contexto de planos

3. **Alertar equipe:**
   - Avisar sobre mix de routers atual
   - Compartilhar este documento
   - Explicar que funciona, mas será refatorado

---

**Criado por:** Claude + Fernando + Manus  
**Data:** 13 de Novembro de 2025  
**Versão:** 1.0  
**Status:** 🟡 Ativo - Aguardando refactor
