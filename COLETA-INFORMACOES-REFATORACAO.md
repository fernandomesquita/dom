# 📋 COLETA COMPLETA DE INFORMAÇÕES - REFATORAÇÃO PLANOS

**Data:** 2025-11-11 12:00  
**Projeto:** dom-eara-v4  
**Objetivo:** Refatoração do sistema de planos

---

## ===============================
## SEÇÃO 1: INVENTÁRIO DE TABELAS
## ===============================

### 1.1 Tabelas relacionadas a planos:

```
+----------------------------+
| Tables_in_railway (%plan%) |
+----------------------------+
| metas_planos_estudo        |
| plan_disciplines           |
| plan_enrollments           |
| planos                     |
| planos_estudo              |
| plans                      |
+----------------------------+
```

**Total:** 6 tabelas

---

### 1.2 Estrutura COMPLETA - metas_planos_estudo:

```
Field                      Type          Null  Key  Default             Extra
id                         varchar(36)   NO    PRI  NULL                
usuario_id                 varchar(36)   NO    MUL  NULL                
titulo                     varchar(255)  NO         NULL                
descricao                  text          YES        NULL                
horas_por_dia              decimal(4,2)  NO         NULL                
dias_disponiveis_bitmask   int           NO         31                  
data_inicio                date          NO         NULL                
data_fim                   date          YES        NULL                
status                     varchar(20)   NO    MUL  ativo               
criado_por_id              varchar(36)   NO         NULL                
criado_em                  timestamp     NO         CURRENT_TIMESTAMP   DEFAULT_GENERATED
atualizado_em              timestamp     NO         CURRENT_TIMESTAMP   DEFAULT_GENERATED on update
```

**Campos:** 12  
**PK:** id (varchar 36)  
**FK:** usuario_id → users.id

---

### 1.3 Estrutura COMPLETA - plans:

```
Field                Type                                     Null  Key  Default             Extra
id                   varchar(36)                              NO    PRI  NULL                
name                 varchar(255)                             NO         NULL                
slug                 varchar(255)                             NO    UNI  NULL                
description          text                                     YES        NULL                
category             enum('Pago','Gratuito')                  NO    MUL  NULL                
entity               varchar(255)                             YES        NULL                
role                 varchar(255)                             YES        NULL                
edital_status        enum('Pré-edital','Pós-edital','N/A')   NO    MUL  N/A                 
featured_image_url   text                                     YES        NULL                
price                varchar(50)                              YES        NULL                
landing_page_url     text                                     YES        NULL                
duration_days        int                                      YES        NULL                
validity_date        datetime                                 YES        NULL                
tags                 json                                     YES        NULL                
is_featured          tinyint(1)                               NO    MUL  0                   
is_hidden            tinyint(1)                               NO    MUL  0                   
mentor_id            int                                      YES        NULL                
created_at           datetime                                 NO         CURRENT_TIMESTAMP   DEFAULT_GENERATED
updated_at           datetime                                 NO         CURRENT_TIMESTAMP   DEFAULT_GENERATED on update
```

**Campos:** 19  
**PK:** id (varchar 36)  
**Unique:** slug

---

### 1.4 Estrutura COMPLETA - planos_estudo:

```
Field                      Type          Null  Key  Default             Extra
id                         varchar(36)   NO    PRI  NULL                
usuario_id                 varchar(36)   NO    MUL  NULL                
titulo                     varchar(255)  NO         NULL                
descricao                  text          YES        NULL                
horas_por_dia              decimal(4,2)  NO         NULL                
dias_disponiveis_bitmask   int           NO         31                  
data_inicio                date          NO         NULL                
data_fim                   date          YES        NULL                
status                     varchar(20)   NO    MUL  ativo               
criado_por_id              varchar(36)   NO         NULL                
criado_em                  timestamp     NO         CURRENT_TIMESTAMP   DEFAULT_GENERATED
atualizado_em              timestamp     NO         CURRENT_TIMESTAMP   DEFAULT_GENERATED on update
```

**Campos:** 12  
**IDÊNTICA a metas_planos_estudo**

---

### 1.5 Estrutura COMPLETA - planos:

```
Field            Type           Null  Key  Default             Extra
id               varchar(36)    NO    PRI  NULL                
nome             varchar(100)   NO         NULL                
descricao        text           YES        NULL                
preco            decimal(10,2)  NO         NULL                
duracao_meses    int            NO         NULL                
recursos         json           NO         NULL                
ativo            tinyint(1)     NO    MUL  1                   
destaque         tinyint(1)     NO         0                   
ordem            int            NO    MUL  0                   
created_at       timestamp      NO         CURRENT_TIMESTAMP   DEFAULT_GENERATED
updated_at       timestamp      NO         CURRENT_TIMESTAMP   DEFAULT_GENERATED on update
```

**Campos:** 11  
**Propósito:** Planos de assinatura (pricing)

---

### 1.6 Contagem de registros:

```
+---------------------+-------+
| tabela              | total |
+---------------------+-------+
| metas_planos_estudo |    11 |
| plans               |     0 |
| planos_estudo       |     0 |
| planos              |     0 |
+---------------------+-------+
```

**CONCLUSÃO:** Apenas `metas_planos_estudo` tem dados (11 registros)

---

### 1.7 Campos de relacionamento (FK):

```
+---------------------+---------------+------------------------+-----------------------+------------------------+
| TABLE_NAME          | COLUMN_NAME   | CONSTRAINT_NAME        | REFERENCED_TABLE_NAME | REFERENCED_COLUMN_NAME |
+---------------------+---------------+------------------------+-----------------------+------------------------+
| metas_planos_estudo | id            | PRIMARY                | NULL                  | NULL                   |
| plan_disciplines    | discipline_id | unique_plan_discipline | NULL                  | NULL                   |
| plan_disciplines    | id            | PRIMARY                | NULL                  | NULL                   |
| plan_disciplines    | plan_id       | unique_plan_discipline | NULL                  | NULL                   |
| plan_enrollments    | id            | PRIMARY                | NULL                  | NULL                   |
| plan_enrollments    | plan_id       | unique_user_plan       | NULL                  | NULL                   |
| plan_enrollments    | user_id       | unique_user_plan       | NULL                  | NULL                   |
| planos              | id            | PRIMARY                | NULL                  | NULL                   |
| planos_estudo       | id            | PRIMARY                | NULL                  | NULL                   |
| plans               | id            | PRIMARY                | NULL                  | NULL                   |
| plans               | slug          | slug                   | NULL                  | NULL                   |
+---------------------+---------------+------------------------+-----------------------+------------------------+
```

**Observação:** Não há FKs explícitas no banco (relacionamentos via código)

---

## ===============================
## SEÇÃO 2: INVENTÁRIO DE ARQUIVOS
## ===============================

### 2.1 Routers de planos:

```
server/routers/admin/plansRouter_v1.ts
server/routers/plansAdmin.ts
server/routers/plansPublic.ts
server/routers/plansUser.ts
```

**Total:** 4 routers

---

### 2.2 Schemas com planos:

```
drizzle/schema-avisos.ts
drizzle/schema-dashboard.ts
drizzle/schema-metas.ts
drizzle/schema-notices.ts
drizzle/schema-plans.ts
drizzle/schema-questions.ts
drizzle/schema.ts
```

**Total:** 7 schemas mencionam planos

---

### 2.3 Componentes frontend:

```
client/src/pages/AllPlans.tsx
client/src/pages/MetasPlanos.tsx
client/src/pages/MyPlans.tsx
client/src/pages/PlanDashboard.tsx
client/src/pages/PlanDetails.tsx
client/src/pages/admin/PlanFormPage.tsx
client/src/pages/admin/PlanGoalsPage.tsx
client/src/pages/admin/PlansAdmin.tsx
client/src/pages/admin/PlansPage.tsx
```

**Total:** 9 componentes

---

### 2.4 Imports em routers.ts:

```
Linha 28: import { metasPlanosRouter } from './routers/metasPlanos';
Linha 32: import { plansPublicRouter } from './routers/plansPublic';
Linha 33: import { plansUserRouter } from './routers/plansUser';
Linha 34: import { plansAdminRouter } from './routers/plansAdmin';
Linha 36: import { plansRouter_v1 } from './routers/admin/plansRouter_v1';
Linha 86: metasPlanos: metasPlanosRouter,
Linha 92: plansPublic: plansPublicRouter,
Linha 93: plansUser: plansUserRouter,
Linha 94: plansAdmin: plansAdminRouter,
Linha 99: plans_v1: plansRouter_v1,
```

**Routers registrados:**
- `metasPlanos` (namespace raiz)
- `plansPublic` (namespace raiz)
- `plansUser` (namespace raiz)
- `plansAdmin` (namespace raiz)
- `admin.plans_v1` (namespace admin)

---

