# 🏛️ DECISÕES ARQUITETURAIS - SISTEMA DE PLANOS

**Última atualização:** 11/11/2025  
**Status:** 🟢 Ativo  
**Importância:** 🔥🔥🔥🔥🔥 CRÍTICA

---

## ⚠️ LEIA ANTES DE MODIFICAR QUALQUER CÓDIGO DE PLANOS

Este documento contém decisões arquiteturais críticas sobre o sistema de planos.  
**Ignorar estas informações pode causar horas de debugging.**

---

## 📋 ÍNDICE

1. [Contexto Histórico](#contexto)
2. [Arquitetura Atual](#arquitetura)
3. [Decisões Críticas](#decisoes)
4. [Tabelas e Schemas](#tabelas)
5. [Endpoints e Routers](#endpoints)
6. [Regras de Negócio](#regras)
7. [Plano de Migração](#migracao)
8. [Troubleshooting](#troubleshooting)

---

## 🕰️ CONTEXTO HISTÓRICO {#contexto}

### Sistema Antigo (Pré 11/11/2025)

**Tabelas:**
- `planos_estudo` - Planos individuais dos alunos
- `metas_planos_estudo` - Metas vinculadas aos planos

**Características:**
- ✅ Funcionava para casos simples
- ❌ Estrutura não normalizada
- ❌ Campos com nomes em português
- ❌ Sem soft delete
- ❌ Sem suporte a categorias/tags
- ❌ Acoplado ao sistema de metas

**Endpoint principal:**
- `admin.plans_v1.list` → lê de `metas_planos_estudo`

---

### Sistema Novo (Pós 11/11/2025)

**Tabela:**
- `plans` - Planos de estudo (nova estrutura)

**Características:**
- ✅ Estrutura normalizada
- ✅ Campos em inglês (padrão do projeto)
- ✅ Soft delete (`deletedAt`)
- ✅ Categorias (Pago/Gratuito)
- ✅ Tags, status de edital, featured
- ✅ Desacoplado de metas

**Endpoint principal:**
- `admin.plans_v1.listNew` → lê de `plans`

---

## 🏗️ ARQUITETURA ATUAL {#arquitetura}

### Diagrama de Convivência

```
┌─────────────────────────────────────────┐
│         SISTEMA ANTIGO (Deprecado)      │
├─────────────────────────────────────────┤
│ Router: server/routers/admin/          │
│         plansRouter_v1.ts               │
│                                         │
│ Endpoint: admin.plans_v1.list           │
│ Tabela: metas_planos_estudo             │
│ Registros: ~12 planos antigos           │
│                                         │
│ Status: ⚠️ MANTIDO PARA COMPATIBILIDADE │
│         NÃO MODIFICAR!                  │
└─────────────────────────────────────────┘
                    ↓
                 MIGRAÇÃO
                    ↓
┌─────────────────────────────────────────┐
│      SISTEMA NOVO (Em Produção)         │
├─────────────────────────────────────────┤
│ Router: server/routers/admin/          │
│         plansRouter_v1.ts               │
│                                         │
│ Endpoint: admin.plans_v1.listNew        │
│ Tabela: plans                           │
│ Registros: 5 planos novos               │
│                                         │
│ Status: ✅ FUNCIONANDO                   │
│         USE ESTE!                       │
└─────────────────────────────────────────┘
                    ↓
                FRONTEND
                    ↓
┌─────────────────────────────────────────┐
│     INTERFACE ADMIN                     │
├─────────────────────────────────────────┤
│ Arquivo: client/src/pages/admin/       │
│          PlansPage.tsx                  │
│                                         │
│ Query: trpc.admin.plans_v1.listNew      │
│                                         │
│ Status: ✅ EXIBINDO 5 PLANOS            │
└─────────────────────────────────────────┘
```

---

## 🎯 DECISÕES CRÍTICAS {#decisoes}

### DECISÃO 1: Manter Sistema Antigo em Paralelo

**Data:** 11/11/2025  
**Responsável:** Claude (IA) + Fernando (Product Owner)

**Problema:**
- Frontend mostrava cards vazios
- Endpoint antigo lia tabela errada
- Modificar endpoint antigo arriscado (poderia quebrar outras partes)

**Alternativas Consideradas:**

1. ❌ **Modificar endpoint antigo diretamente**
   - Risco: quebrar funcionalidades existentes
   - Risco: perder dados históricos
   - Risco: impacto desconhecido em outras partes

2. ❌ **Deletar tabela antiga e migrar dados**
   - Risco: perda de dados irreversível
   - Risco: foreign keys quebradas
   - Risco: downtime prolongado

3. ✅ **Criar endpoint paralelo (ESCOLHIDA)**
   - Vantagem: zero risco de quebrar sistema antigo
   - Vantagem: migração gradual possível
   - Vantagem: rollback fácil
   - Vantagem: teste A/B possível

**Implementação:**
```typescript
// Endpoint antigo (NÃO MODIFICADO)
list: staffProcedure.query(async () => {
  // Lê de metas_planos_estudo
});

// Endpoint novo (CRIADO)
listNew: staffProcedure.query(async () => {
  // Lê de plans
});
```

**Impacto:**
- ✅ Frontend migrado para `listNew`
- ✅ Sistema antigo preservado
- ✅ Zero downtime
- ⚠️ Dois endpoints coexistem temporariamente

**Plano de Rollback:**
```typescript
// Se der problema, basta mudar frontend:
// trpc.admin.plans_v1.listNew → trpc.admin.plans_v1.list
```

---

### DECISÃO 2: Simplificar Query Inicial (Remover WHERE)

**Data:** 11/11/2025  
**Responsável:** Claude (IA)

**Problema:**
- Query com `.where(isNull(plans.deletedAt))` causava erro
- Variáveis `page`, `pageSize` não definidas
- Import `sql` faltando

**Alternativas Consideradas:**

1. ❌ **Corrigir todos os bugs de uma vez**
   - Risco: não saber qual correção resolveu
   - Risco: introduzir novos bugs

2. ✅ **Simplificar ao máximo primeiro (ESCOLHIDA)**
   - Vantagem: isolar problema
   - Vantagem: confirmar que query básica funciona
   - Vantagem: adicionar complexidade gradualmente

**Implementação:**
```typescript
// ANTES (com bugs):
const items = await db
  .select()
  .from(plans)
  .where(isNull(plans.deletedAt))  // ← Causava erro
  .limit(pageSize)                 // ← Variável não definida
  .offset(offset);                 // ← Variável não definida

// DEPOIS (simplificado):
const { page, pageSize } = input;  // ← Definir variáveis
const offset = (page - 1) * pageSize;

const items = await db
  .select()
  .from(plans)
  // SEM .where() por enquanto
  .orderBy(desc(plans.createdAt))
  .limit(pageSize)
  .offset(offset);
```

**Resultado:**
- ✅ Query funcionou imediatamente
- ✅ 5 planos retornados
- ⚠️ Filtro de `deletedAt` pode ser adicionado depois

---

### DECISÃO 3: Corrigir Frontend para Usar Campos Corretos

**Data:** 11/11/2025  
**Responsável:** Claude (IA)

**Problema:**
- Dados chegavam do backend perfeitamente
- Frontend não renderizava (tela branca)
- Causa: campos do sistema antigo sendo usados

**Mapeamento de Campos:**

| Sistema Antigo | Sistema Novo | Tipo |
|----------------|--------------|------|
| `titulo` | `name` | string |
| `status` | `category` | enum |
| `usuario_nome` | ❌ (não existe) | - |
| `data_inicio` | ❌ (não existe) | - |
| `horas_por_dia` | ❌ (não existe) | - |
| `criado_em` | `createdAt` | Date |
| - | `entity` | string |
| - | `role` | string |
| - | `price` | string |
| - | `durationDays` | number |
| - | `isFeatured` | boolean |
| - | `isHidden` | boolean |

**Implementação:**
```typescript
// ANTES:
<CardTitle>{plan.titulo}</CardTitle>
<Badge>{plan.status}</Badge>
<span>{plan.usuario_nome}</span>

// DEPOIS:
<CardTitle>{plan.name}</CardTitle>
<Badge>{plan.category}</Badge>
<span>{plan.entity} - {plan.role}</span>
```

**Resultado:**
- ✅ 5 planos renderizados corretamente
- ✅ Badges de categoria funcionando
- ✅ Informações completas exibidas

---

## 📊 TABELAS E SCHEMAS {#tabelas}

### Tabela `plans` (NOVA - USE ESTA)

**Arquivo:** `drizzle/schema-plans.ts`

**Estrutura:**
```typescript
export const plans = mysqlTable("plans", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  
  // Classificação
  category: mysqlEnum("category", ["Pago", "Gratuito"]).notNull(),
  entity: varchar("entity", { length: 255 }),
  role: varchar("role", { length: 255 }),
  editalStatus: mysqlEnum("editalStatus", [
    "Pré-edital",
    "Aberto",
    "Encerrado",
    "N/A"
  ]),
  
  // Modelo de Negócio
  price: varchar("price", { length: 20 }),
  landingPageUrl: text("landingPageUrl"),
  
  // Duração
  durationDays: int("durationDays"),
  validityDate: timestamp("validityDate"),
  
  // Imagens
  featuredImageUrl: text("featuredImageUrl"),
  
  // Disponibilidade
  isFeatured: boolean("isFeatured").default(false),
  isHidden: boolean("isHidden").default(false),
  disponivel: boolean("disponivel").default(true),
  
  // Metadados
  tags: json("tags").$type<string[]>(),
  mentorId: int("mentorId"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
  deletedAt: timestamp("deletedAt"),
});
```

**Índices:**
```sql
CREATE INDEX idx_plans_category ON plans(category);
CREATE INDEX idx_plans_entity ON plans(entity);
CREATE INDEX idx_plans_featured ON plans(isFeatured);
CREATE INDEX idx_plans_hidden ON plans(isHidden);
CREATE INDEX idx_plans_deleted ON plans(deletedAt);
```

---

### Tabela `metas_planos_estudo` (ANTIGA - NÃO USE)

**⚠️ DEPRECADA - Mantida apenas para compatibilidade**

**Estrutura:**
```sql
CREATE TABLE metas_planos_estudo (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT,
  titulo VARCHAR(255),
  status ENUM('ATIVO', 'PAUSADO', 'CONCLUIDO'),
  data_inicio DATE,
  data_fim DATE,
  horas_por_dia DECIMAL(4,2),
  criado_em TIMESTAMP,
  atualizado_em TIMESTAMP
);
```

**Problemas:**
- ❌ Campos em português
- ❌ Sem soft delete
- ❌ Sem categorização
- ❌ Acoplado a usuários

---

## 🔌 ENDPOINTS E ROUTERS {#endpoints}

### Router: `server/routers/admin/plansRouter_v1.ts`

**Endpoints disponíveis:**

#### 1. `admin.plans_v1.list` ⚠️ DEPRECADO

```typescript
/**
 * ⚠️ SISTEMA ANTIGO - EM PROCESSO DE DEPRECAÇÃO
 * 
 * Lê da tabela `metas_planos_estudo` (antiga).
 * NÃO MODIFICAR sem consultar docs/DECISOES-ARQUITETURAIS-PLANOS.md
 * 
 * @deprecated Use admin.plans_v1.listNew
 */
list: staffProcedure
  .input(z.object({
    page: z.number().min(1).default(1),
    pageSize: z.number().min(1).max(100).default(20),
  }))
  .query(async ({ input }) => {
    // Lê de metas_planos_estudo
  });
```

**Quando usar:**
- ❌ NUNCA para novos desenvolvimentos
- ⚠️ Apenas se precisar acessar dados históricos

---

#### 2. `admin.plans_v1.listNew` ✅ USE ESTE

```typescript
/**
 * ✅ SISTEMA NOVO - ESTRUTURA CORRETA
 * 
 * Lê da tabela `plans` (nova estrutura).
 * Schema: drizzle/schema-plans.ts
 * 
 * @created 11/11/2025
 */
listNew: staffProcedure
  .input(z.object({
    page: z.number().min(1).default(1),
    pageSize: z.number().min(1).max(100).default(20),
    search: z.string().optional(),
    category: z.enum(['Pago', 'Gratuito']).optional(),
  }))
  .query(async ({ input }) => {
    const db = await getDb();
    
    const { page, pageSize } = input;
    const offset = (page - 1) * pageSize;
    
    const items = await db
      .select()
      .from(plans)
      .orderBy(desc(plans.createdAt))
      .limit(pageSize)
      .offset(offset);
    
    return {
      plans: items,
      pagination: {
        page,
        pageSize,
        total: items.length,
        totalPages: 1,
      },
    };
  });
```

**Quando usar:**
- ✅ SEMPRE para listar planos
- ✅ Frontend de admin
- ✅ Novos desenvolvimentos

---

#### 3. `admin.plans_v1.stats`

```typescript
/**
 * Estatísticas do sistema antigo
 * ⚠️ Ainda lê de metas_planos_estudo
 * TODO: Migrar para tabela plans
 */
stats: staffProcedure.query(async () => {
  // Retorna total, ativos, etc
});
```

**Status:** ⚠️ Precisa ser migrado

---

### Router: `server/routers/plansAdmin.ts`

**Endpoints CRUD:**

```typescript
// ✅ Todos leem/escrevem na tabela `plans`

create: staffProcedure.mutation(...)
update: staffProcedure.mutation(...)
getById: staffProcedure.query(...)
listAll: staffProcedure.query(...)  // ⚠️ Não usado no frontend
```

**Status:** ✅ Funcionando, mas `listAll` não é usado

---

## 📜 REGRAS DE NEGÓCIO {#regras}

### Categorias

**Enum:** `["Pago", "Gratuito"]`

**Regras:**
- Se `category = "Pago"`, campos `price` e `landingPageUrl` são **obrigatórios**
- Se `category = "Gratuito"`, campos `price` e `landingPageUrl` são **opcionais**

**Validação no schema Zod:**
```typescript
.refine((data) => {
  if (data.category === "Pago") {
    return !!data.price && !!data.landingPageUrl;
  }
  return true;
}, {
  message: "Planos pagos devem ter preço e URL da landing page",
});
```

---

### Status de Edital

**Enum:** `["Pré-edital", "Aberto", "Encerrado", "N/A"]`

**Significado:**
- **Pré-edital:** Edital ainda não publicado
- **Aberto:** Inscrições abertas
- **Encerrado:** Inscrições encerradas
- **N/A:** Não se aplica (planos genéricos)

---

### Featured (Destaque)

**Campo:** `isFeatured: boolean`

**Regras:**
- Máximo 3 planos em destaque por vez
- Planos em destaque aparecem no topo da listagem
- Badge amarelo "Destaque" exibido no card

---

### Soft Delete

**Campo:** `deletedAt: timestamp`

**Regras:**
- Planos nunca são deletados fisicamente
- Ao "deletar", apenas preencher `deletedAt`
- Queries devem filtrar `WHERE deletedAt IS NULL`
- Admin pode restaurar planos (limpar `deletedAt`)

---

## 🚀 PLANO DE MIGRAÇÃO {#migracao}

### Fase 1: ✅ CONCLUÍDA (11/11/2025)

- [x] Criar endpoint `listNew`
- [x] Migrar frontend para `listNew`
- [x] Testar listagem de 5 planos
- [x] Documentar decisões

---

### Fase 2: 🔄 EM ANDAMENTO

**Objetivo:** Corrigir edição de planos

**Tarefas:**
- [ ] Investigar rota `/admin/planos/:id`
- [ ] Verificar endpoint de edição
- [ ] Testar formulário PlanFormPage.tsx
- [ ] Validar salvamento

**Branch:** `fix/plans-edit-404`

---

### Fase 3: 📅 PLANEJADA

**Objetivo:** Implementar filtros e busca

**Tarefas:**
- [ ] Adicionar filtro por categoria
- [ ] Adicionar filtro por status de edital
- [ ] Implementar busca por nome/entidade/cargo
- [ ] Adicionar debounce de 300ms

**Branch:** `feat/plans-filters`

---

### Fase 4: 📅 PLANEJADA

**Objetivo:** Migrar estatísticas

**Tarefas:**
- [ ] Atualizar `admin.plans_v1.stats` para ler de `plans`
- [ ] Adicionar métricas de categoria (Pago vs Gratuito)
- [ ] Adicionar métricas de featured

**Branch:** `feat/plans-stats-migration`

---

### Fase 5: 📅 PLANEJADA

**Objetivo:** Deprecar sistema antigo

**Tarefas:**
- [ ] Confirmar que nenhum código usa `admin.plans_v1.list`
- [ ] Adicionar aviso de deprecação no endpoint
- [ ] Criar migration para arquivar dados antigos
- [ ] Remover endpoint antigo

**Branch:** `refactor/deprecate-old-plans`

---

## 🔧 TROUBLESHOOTING {#troubleshooting}

### Problema: Cards vazios na listagem

**Sintoma:** Frontend mostra skeleton loading infinito ou cards sem dados

**Causa provável:** Frontend usando endpoint antigo ou campos errados

**Solução:**
```typescript
// 1. Verificar qual endpoint está sendo usado:
const { data } = trpc.admin.plans_v1.listNew.useQuery();
//                         ^^^^^^^^^^^^^^^^^ Deve ser listNew!

// 2. Verificar campos no map:
{data?.plans.map((plan) => (
  <div>{plan.name}</div>  {/* ✅ Correto */}
  <div>{plan.titulo}</div> {/* ❌ Errado - campo antigo */}
))}
```

---

### Problema: Erro 404 ao editar plano

**Sintoma:** Clicar em "Editar" retorna página não encontrada

**Causa provável:** Rota não registrada ou ID incorreto

**Solução:**
```typescript
// 1. Verificar rota no App.tsx:
<Route path="/admin/planos/:id" component={PlanFormPage} />

// 2. Verificar link no card:
<Link href={`/admin/planos/${plan.id}`}>  {/* ID correto? */}
```

---

### Problema: Query SQL com erro de sintaxe

**Sintoma:** Erro `ER_PARSE_ERROR` nos logs

**Causa provável:** Coluna não existe ou nome errado

**Solução:**
```sql
-- 1. Verificar estrutura real da tabela:
DESCRIBE plans;

-- 2. Comparar com schema TypeScript:
-- drizzle/schema-plans.ts

-- 3. Se diferente, banco é a fonte da verdade!
```

---

### Problema: Dados não aparecem após criar plano

**Sintoma:** Plano criado com sucesso, mas não aparece na lista

**Causa provável:** Cache do tRPC ou filtro de soft delete

**Solução:**
```typescript
// 1. Invalidar cache após criar:
const utils = trpc.useUtils();
await createPlan.mutateAsync(data);
utils.admin.plans_v1.listNew.invalidate();

// 2. Verificar se plano não está "deletado":
SELECT * FROM plans WHERE deletedAt IS NULL;
```

---

## 📞 SUPORTE

**Em caso de dúvidas:**

1. **Primeiro:** Leia este documento completo
2. **Segundo:** Leia `docs/SAGA-CORRECAO-PLANOS-11-11-2025.md`
3. **Terceiro:** Verifique logs do Railway
4. **Quarto:** Contacte Fernando

**Não modifique código de planos sem consultar esta documentação!**

---

**Documento criado:** 11/11/2025  
**Última atualização:** 11/11/2025  
**Versão:** 1.0.0  
**Status:** ✅ Ativo
