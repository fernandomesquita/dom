# 📊 ANÁLISE COMPLETA: SCHEMA REAL vs REQUISITOS

**Data:** 2025-11-11 12:30  
**Projeto:** dom-eara-v4  
**Objetivo:** Mapear schema existente vs requisitos do documento

---

## 1️⃣ SCHEMA REAL NO BANCO (DESCRIBE plans)

```sql
+--------------------+-----------------------------------------+------+-----+-------------------+-------+
| Field              | Type                                    | Null | Key | Default           | Extra |
+--------------------+-----------------------------------------+------+-----+-------------------+-------+
| id                 | varchar(36)                             | NO   | PRI | NULL              |       |
| name               | varchar(255)                            | NO   |     | NULL              |       |
| slug               | varchar(255)                            | NO   | UNI | NULL              |       |
| description        | text                                    | YES  |     | NULL              |       |
| category           | enum('Pago','Gratuito')                 | NO   | MUL | NULL              |       |
| entity             | varchar(255)                            | YES  |     | NULL              | ✅    |
| role               | varchar(255)                            | YES  |     | NULL              | ✅    |
| edital_status      | enum('Pré-edital','Pós-edital','N/A')   | NO   | MUL | N/A               | ✅    |
| featured_image_url | text                                    | YES  |     | NULL              |       |
| price              | varchar(50)                             | YES  |     | NULL              |       |
| landing_page_url   | text                                    | YES  |     | NULL              | ✅    |
| duration_days      | int                                     | YES  |     | NULL              | ✅    |
| validity_date      | datetime                                | YES  |     | NULL              |       |
| tags               | json                                    | YES  |     | NULL              |       |
| is_featured        | tinyint(1)                              | NO   | MUL | 0                 |       |
| is_hidden          | tinyint(1)                              | NO   | MUL | 0                 | ✅    |
| mentor_id          | int                                     | YES  |     | NULL              |       |
| created_at         | datetime                                | NO   |     | CURRENT_TIMESTAMP |       |
| updated_at         | datetime                                | NO   |     | CURRENT_TIMESTAMP |       |
+--------------------+-----------------------------------------+------+-----+-------------------+-------+
```

**Total:** 19 campos

---

## 2️⃣ SCHEMA DRIZZLE (drizzle/schema-plans.ts)

```typescript
export const plans = mysqlTable('plans', {
  // Identificação
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  version: varchar('version', { length: 20 }).default('v1.0'),  // ⚠️ NÃO EXISTE NO BANCO
  
  // Imagens e branding
  logoUrl: varchar('logo_url', { length: 500 }),                 // ⚠️ NÃO EXISTE NO BANCO
  featuredImageUrl: varchar('featured_image_url', { length: 500 }).notNull(),
  landingPageUrl: varchar('landing_page_url', { length: 500 }),
  
  // Classificação e contexto
  category: mysqlEnum('category', ['Pago', 'Gratuito']).notNull(),
  editalStatus: editalStatusEnum.default('N/A'),
  entity: varchar('entity', { length: 255 }),
  role: varchar('role', { length: 255 }),
  tags: json('tags').$type<string[]>().default([]),
  
  // Estrutura de conhecimento
  knowledgeRootId: varchar('knowledge_root_id', { length: 36 }).notNull(), // ⚠️ NÃO EXISTE NO BANCO
  
  // Modelo de negócio
  paywallRequired: boolean('paywall_required').default(false),   // ⚠️ NÃO EXISTE NO BANCO
  price: decimal('price', { precision: 10, scale: 2 }),          // ⚠️ TIPO DIFERENTE (varchar no banco)
  validityDate: date('validity_date'),                           // ⚠️ TIPO DIFERENTE (datetime no banco)
  durationDays: int('duration_days'),
  
  // Status e destaque
  status: planStatusEnum.default('Em edição').notNull(),         // ⚠️ NÃO EXISTE NO BANCO
  isFeatured: boolean('is_featured').default(false),
  isHidden: boolean('is_hidden').default(false).notNull(),
  
  // Responsabilidade e auditoria
  mentorId: varchar('mentor_id', { length: 36 }),                // ⚠️ TIPO DIFERENTE (int no banco)
  createdBy: varchar('created_by', { length: 36 }),              // ⚠️ NÃO EXISTE NO BANCO
  updatedBy: varchar('updated_by', { length: 36 }),              // ⚠️ NÃO EXISTE NO BANCO
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp('deleted_at'),                            // ⚠️ NÃO EXISTE NO BANCO
  
  // Metadados adicionais
  customSettings: json('custom_settings'),                       // ⚠️ NÃO EXISTE NO BANCO
});
```

---

## 3️⃣ REQUISITOS DO DOCUMENTO (linha 167-193)

```typescript
export const planosEstudo = mysqlTable('planos_estudo', {  // ❌ TABELA ERRADA
  // Campos existentes (não mexer)
  id: varchar('id', { length: 36 }).primaryKey(),
  nome: varchar('nome', { length: 255 }).notNull(),        // ❌ No banco é 'name'
  descricao: text('descricao'),                            // ❌ No banco é 'description'
  preco: decimal('preco', { precision: 10, scale: 2 }),    // ❌ No banco é 'price' (varchar)
  ativo: boolean('ativo').notNull().default(true),         // ❌ NÃO EXISTE (temos is_hidden)
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
  
  // Campos novos (adicionar)
  entidade: varchar('entidade', { length: 100 }),          // ✅ JÁ EXISTE como 'entity'
  cargo: varchar('cargo', { length: 100 }),                // ✅ JÁ EXISTE como 'role'
  tipo: mysqlEnum('tipo', ['gratuito', 'pago']),           // ✅ JÁ EXISTE como 'category'
  momento: mysqlEnum('momento', ['pre_edital', ...]),      // ✅ JÁ EXISTE como 'edital_status'
  duracao: int('duracao').notNull().default(365),          // ✅ JÁ EXISTE como 'duration_days'
  disponivel: boolean('disponivel').notNull(),             // ❌ NÃO EXISTE (conceito novo)
  visivel: boolean('visivel').notNull(),                   // ✅ JÁ EXISTE como 'is_hidden' (invertido)
  landingPageUrl: varchar('landing_page_url', ...),        // ✅ JÁ EXISTE
});
```

---

## 4️⃣ MAPEAMENTO: REQUISITOS → SCHEMA REAL

| Requisito (Documento) | Campo Real (Banco) | Status | Observação |
|----------------------|-------------------|--------|------------|
| `entidade` | `entity` | ✅ **EXISTE** | Nome em inglês |
| `cargo` | `role` | ✅ **EXISTE** | Nome em inglês |
| `tipo` | `category` | ✅ **EXISTE** | Enum: 'Pago', 'Gratuito' |
| `momento` | `edital_status` | ✅ **EXISTE** | Enum: 'Pré-edital', 'Pós-edital', 'N/A' |
| `duracao` | `duration_days` | ✅ **EXISTE** | int, nullable |
| `disponivel` | ❌ **FALTA** | ⚠️ **CRIAR** | Controla se aceita matrículas |
| `visivel` | `is_hidden` | ✅ **EXISTE** | Lógica invertida (visivel = !is_hidden) |
| `landingPageUrl` | `landing_page_url` | ✅ **EXISTE** | text, nullable |
| `ativo` | ❌ **FALTA** | ⚠️ **CRIAR?** | Ou usar `is_hidden`? |

---

## 5️⃣ CAMPOS QUE FALTAM NO BANCO (vs Drizzle Schema)

| Campo Drizzle | Existe no Banco? | Ação Necessária |
|---------------|------------------|-----------------|
| `version` | ❌ NÃO | Remover do schema Drizzle OU criar migration |
| `logoUrl` | ❌ NÃO | Remover do schema Drizzle OU criar migration |
| `knowledgeRootId` | ❌ NÃO | Remover do schema Drizzle OU criar migration |
| `paywallRequired` | ❌ NÃO | Remover do schema Drizzle OU criar migration |
| `status` | ❌ NÃO | Remover do schema Drizzle OU criar migration |
| `createdBy` | ❌ NÃO | Remover do schema Drizzle OU criar migration |
| `updatedBy` | ❌ NÃO | Remover do schema Drizzle OU criar migration |
| `deletedAt` | ❌ NÃO | Remover do schema Drizzle OU criar migration |
| `customSettings` | ❌ NÃO | Remover do schema Drizzle OU criar migration |

**Total:** 9 campos no schema Drizzle que NÃO existem no banco!

---

## 6️⃣ INCONSISTÊNCIAS DE TIPO

| Campo | Tipo Drizzle | Tipo Banco | Problema |
|-------|-------------|------------|----------|
| `price` | `decimal(10,2)` | `varchar(50)` | ⚠️ **INCOMPATÍVEL** |
| `validityDate` | `date` | `datetime` | ⚠️ **INCOMPATÍVEL** |
| `mentorId` | `varchar(36)` | `int` | ⚠️ **INCOMPATÍVEL** |

---

## 7️⃣ PROCEDURES EXISTENTES (plansRouter_v1.ts)

```typescript
list: staffProcedure          // ✅ Listagem com filtros
getById: staffProcedure       // ✅ Buscar por ID
create: staffProcedure        // ✅ Criar plano
update: staffProcedure        // ✅ Atualizar plano
delete: adminRoleProcedure    // ✅ Deletar plano
stats: staffProcedure         // ✅ Estatísticas
```

**Total:** 6 procedures (CRUD + stats)

---

## 8️⃣ DIAGNÓSTICO FINAL

### 🔴 PROBLEMAS CRÍTICOS:

1. **Schema Drizzle DESATUALIZADO**
   - 9 campos no código que NÃO existem no banco
   - 3 campos com tipos incompatíveis
   - Schema foi escrito mas migration nunca foi aplicada

2. **Documento DESATUALIZADO**
   - Pede tabela `planos_estudo` (não existe)
   - Usa nomes em português (banco usa inglês)
   - Ignora tabela `plans` que JÁ EXISTE

3. **Banco vs Código DESSINCRONIZADOS**
   - Banco tem 19 campos
   - Schema Drizzle define 28 campos
   - Apenas 19 campos realmente existem

---

## 9️⃣ PLANO DE AÇÃO RECOMENDADO

### OPÇÃO A: CORRIGIR SCHEMA DRIZZLE (RECOMENDADO)

**Ação:** Atualizar `drizzle/schema-plans.ts` para refletir EXATAMENTE o que existe no banco.

**Passos:**
1. Remover campos que não existem no banco
2. Corrigir tipos incompatíveis
3. Manter apenas campos reais
4. Adicionar APENAS campo `disponivel` (novo requisito)

**Tempo:** 30 minutos  
**Risco:** Baixo

---

### OPÇÃO B: CRIAR MIGRATION COMPLETA

**Ação:** Criar migration para adicionar todos os campos do schema Drizzle ao banco.

**Passos:**
1. Criar migration SQL com 9 campos novos
2. Alterar tipos de 3 campos existentes
3. Aplicar migration
4. Testar

**Tempo:** 2-3 horas  
**Risco:** Médio (pode quebrar queries existentes)

---

### OPÇÃO C: HÍBRIDA (MELHOR OPÇÃO)

**Ação:** Corrigir schema Drizzle + adicionar APENAS campos essenciais ao banco.

**Passos:**

1. **Atualizar schema Drizzle** (remover campos inexistentes)
2. **Criar migration mínima** (adicionar APENAS `disponivel`)
3. **Manter campos existentes** (não alterar tipos)
4. **Documentar divergências** (para futuro)

**Campos a adicionar:**
- `disponivel` (boolean, NOT NULL, DEFAULT TRUE)

**Campos a remover do schema:**
- `version`, `logoUrl`, `knowledgeRootId`, `paywallRequired`
- `status`, `createdBy`, `updatedBy`, `deletedAt`, `customSettings`

**Campos a corrigir tipos (no schema, não no banco):**
- `price`: mudar para `varchar(50)` (como está no banco)
- `validityDate`: mudar para `timestamp` (como está no banco)
- `mentorId`: mudar para `int` (como está no banco)

**Tempo:** 1 hora  
**Risco:** Baixo

---

## 🎯 RECOMENDAÇÃO FINAL

**EXECUTAR OPÇÃO C (Híbrida)**

**Justificativa:**
1. ✅ Sincroniza schema Drizzle com banco REAL
2. ✅ Adiciona APENAS campo necessário (`disponivel`)
3. ✅ Não quebra código existente
4. ✅ Baixo risco, rápido de executar
5. ✅ Mantém banco estável

**Próximos passos:**
1. Atualizar `drizzle/schema-plans.ts` (corrigir)
2. Criar migration para adicionar `disponivel`
3. Atualizar routers para usar campos corretos
4. Testar CRUD completo

---

**Aguardando aprovação para executar Opção C.**

