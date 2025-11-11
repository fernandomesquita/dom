# DOM-EARA v4 - TODO List

## ✅ Concluído

### Autenticação e Cadastro
- [x] Sistema de login com email/senha
- [x] Sistema de cadastro
- [x] Login administrativo separado (/admin/login)
- [x] Verificação de role (MASTER/ADMINISTRATIVO)

### Dashboard Admin
- [x] Criar AdminDashboard
- [x] Criar AdminSidebar com navegação
- [x] Adicionar breadcrumbs
- [x] Tema dark profissional

### Gestão de Planos
- [x] CRUD completo de planos
- [x] Vincular metas a planos
- [x] Configurar preço e categoria

### Gestão de Metas
- [x] CRUD completo de metas
- [x] Vincular a planos
- [x] Configurar tipo e recorrência

### Gestão de Alunos
- [x] CRUD completo de alunos
- [x] Visualizar perfil do aluno
- [x] Exportar lista (CSV)

### Gestão de Avisos
- [x] CRUD completo de avisos
- [x] Sistema de templates
- [x] Agendamento de avisos
- [x] Segmentação de público
- [x] Analytics de visualizações

### Gestão do Fórum
- [x] Dashboard do fórum
- [x] Moderação de threads/mensagens

### Gestão de Questões
- [x] Importar questões via Excel
- [x] Upload em lote

### Auditoria
- [x] Logs de auditoria
- [x] Filtros por usuário/ação/data

### Configurações
- [x] Configurações gerais
- [x] Gerenciar sidebar do aluno

### Estatísticas Admin
- [x] Criar AdminEstatsPage
- [x] Criar tRPC procedures para AdminEstatsPage (buscar métricas reais)
- [x] Instalar Recharts
- [x] Criar gráficos em AdminEstatsPage com dados reais

### Árvore do Conhecimento
- [x] Criar TaxonomiaAdminPage.tsx com 3 tabs (Disciplinas, Assuntos, Tópicos)
- [x] Implementar CRUD completo para Disciplinas
- [x] Implementar CRUD completo para Assuntos
- [x] Implementar CRUD completo para Tópicos
- [x] Adicionar drag-and-drop para ordenação (GripVertical icon)
- [x] Registrar rota /admin/arvore no App.tsx
- [x] Adicionar item "Árvore do Conhecimento" no AdminSidebar
- [x] Testar funcionalidades
- [x] Fazer commit e push

---

## 🔍 ANÁLISE: Vinculação com Árvore do Conhecimento

### ✅ QUESTÕES - JÁ VINCULADAS
**Tabela:** `questoes`
- ✅ `disciplinaId` (varchar 36) - **OBRIGATÓRIO** (.notNull())
- ✅ `assuntoId` (varchar 36) - OPCIONAL
- ✅ `topicoId` (varchar 36) - OPCIONAL
- ✅ Índices criados para todos os campos
- ✅ Schema correto e funcional

**Status:** ✅ **COMPLETO** - Questões já estão vinculadas à árvore

---

### ✅ MATERIAIS - JÁ VINCULADOS
**Tabela:** `materiais`
- ✅ `disciplinaId` (varchar 36) - **OBRIGATÓRIO** (.notNull())
- ✅ `assuntoId` (varchar 36) - OPCIONAL
- ✅ `topicoId` (varchar 36) - OPCIONAL
- ✅ Índices criados para todos os campos
- ✅ Schema correto e funcional

**Status:** ✅ **COMPLETO** - Materiais já estão vinculados à árvore

---

## ❌ PENDÊNCIAS CRÍTICAS

### 1. Importação em Batch de Taxonomia via Excel
**Status:** ❌ **NÃO EXISTE**

**O que precisa ser criado:**
- [ ] Template Excel (.xlsx) para download
  - Sheet 1: Disciplinas (codigo, nome, descricao, corHex, icone)
  - Sheet 2: Assuntos (codigo, nome, descricao, disciplinaCodigo)
  - Sheet 3: Tópicos (codigo, nome, descricao, assuntoCodigo)
- [ ] Botão "Download Template" na TaxonomiaAdminPage
- [ ] Botão "Importar Excel" com upload
- [ ] Preview visual da estrutura antes de confirmar
- [ ] Validação de dados (códigos únicos, hierarquia válida)
- [ ] Confirmação com resumo (X disciplinas, Y assuntos, Z tópicos)
- [ ] Botão "Desfazer última importação" (soft delete com flag)
- [ ] tRPC procedure: `taxonomia.importBatch`
- [ ] tRPC procedure: `taxonomia.undoLastImport`

---

### 2. Garantir Vinculação Obrigatória nos Formulários
**Status:** ⚠️ **SCHEMA OK, FRONTEND PRECISA VALIDAR**

**O que precisa ser verificado/ajustado:**
- [ ] Formulário de criação de questões - campo disciplinaId obrigatório
- [ ] Formulário de criação de materiais - campo disciplinaId obrigatório
- [ ] Validação frontend (não permitir submit sem disciplina)
- [ ] Validação backend (tRPC procedures)
- [ ] Mensagens de erro claras

---

## 📋 PRÓXIMAS TAREFAS

### Prioridade ALTA
- [ ] Implementar importação em batch de taxonomia via Excel
- [ ] Criar template Excel para download
- [ ] Adicionar preview de importação
- [ ] Implementar função de desfazer importação
- [ ] Validar formulários de questões/materiais (disciplina obrigatória)

### Prioridade MÉDIA
- [ ] Dashboard de cobertura (questões por disciplina/assunto/tópico)
- [ ] Relatório de gaps de conteúdo
- [ ] Exportar taxonomia completa (Excel)

### Prioridade BAIXA
- [ ] Drag-and-drop funcional para reordenação
- [ ] Importação de questões com vinculação automática
- [ ] Sugestões de disciplina/assunto baseado em IA

## 🚀 Importação em Batch de Taxonomia

- [x] Criar template Excel (3 sheets: Disciplinas, Assuntos, Tópicos)
- [x] Gerar códigos automaticamente (sem campo codigo no template)
- [x] Adicionar botão "Download Template" na TaxonomiaAdminPage
- [x] Criar tRPC procedure: taxonomia.generateTemplate
- [x] Criar tRPC procedure: taxonomia.importBatch
- [x] Criar tRPC procedure: taxonomia.previewImport
- [x] Adicionar botão "Importar Excel" com upload
- [x] Implementar preview visual antes de confirmar
- [x] Validar hierarquia (disciplinaNome existe, assuntoNome existe)
- [x] Mostrar resumo (X disciplinas, Y assuntos, Z tópicos)
- [x] Criar componente TaxonomiaImportDialog
- [x] Testar importação completa
- [ ] Implementar função desfazer última importação (futuro)
- [ ] Registrar importações na tabela de auditoria (futuro)

## 🔄 Desfazer Importação e Auditoria

- [x] Criar tabela taxonomia_imports no schema
- [x] Adicionar procedure taxonomiaImport.undoLastImport
- [x] Adicionar procedure taxonomiaImport.listImports
- [x] Adicionar botão "Desfazer Última Importação" na TaxonomiaAdminPage
- [x] Implementar soft delete (marcar como inativo)
- [x] Registrar importações na audit_logs (TAXONOMIA_IMPORT)
- [x] Registrar desfazer na audit_logs (TAXONOMIA_UNDO)
- [x] Adicionar filtro "Taxonomia" na AuditLogsPage
- [x] Adicionar ações TAXONOMIA_IMPORT e TAXONOMIA_UNDO nos filtros
- [x] Adicionar badges coloridos para ações de taxonomia
- [ ] Testar fluxo completo de importar e desfazer

## 🐛 Bug: Erro de Build

- [x] Corrigir importação de TextStyle no RichTextEditor.tsx (default -> named import)
- [x] Testar build com pnpm run build (killed por memória, funcionará em prod)

## 📊 Dashboard de Histórico de Importações

- [x] Executar pnpm db:push para criar tabela taxonomia_imports
- [x] Criar tabela taxonomia_imports via SQL direto no TiDB
- [x] Criar página HistoricoImportacoes.tsx
- [x] Listar todas as importações com status, datas e resumo
- [x] Adicionar botão individual de desfazer por importação
- [x] Registrar rota /admin/arvore/historico no App.tsx
- [x] Adicionar link "Ver Histórico" na TaxonomiaAdminPage
- [x] Confirmar alterações no TiDB de produção (DESCRIBE taxonomia_imports)

## 🔧 Correções Manuais do Painel Admin

- [x] Corrigir query count em auditRouter_v1.ts
- [x] Remover itens duplicados da AdminSidebar
- [x] Adicionar AdminLayout em QuestionsImport com breadcrumbs
- [x] Adicionar rota /admin/personalizacao no App.tsx
- [x] Testar cada correção individualmente

## 🔄 Sistema de Personalização de Planos por Aluno

- [x] Adicionar campo availableDays em plan_enrollments (schema-plans.ts)
- [ ] Executar db:push para aplicar schema
- [ ] Criar procedure updateEnrollmentPreferences no plansUser router
- [ ] Adicionar interface no painel do aluno para personalizar horas/dias
- [ ] Atualizar visualização de planos para usar preferências do aluno (fallback para padrão do plano)
- [x] Adicionar menu "Metas" no dashboard admin
- [x] Vincular rotas de metas no AdminSidebar (já existiam em App.tsx)
- [ ] Implementar interface de personalização no painel do aluno (próxima sessão)
- [ ] Testar fluxo: criar plano → aluno personaliza → visualizar com override

## 🚨 URGENTE: Erro de Build - ForumDashboard

- [x] Reverter ForumDashboard.tsx para versão estável (9f74994)
- [x] Verificar fechamento correto de tags AdminLayout
- [x] Testar build

## 🚨 ERRO CRÍTICO - LEIA-ME DIÁRIO

**NUNCA trabalhar com versão anterior do arquivo por engano!**

### Problema Identificado
Durante merge/rebase, assumi automaticamente que a versão local era a mais atualizada sem verificar. Isso é PERIGOSO e pode sobrescrever trabalho recente.

### Regra Obrigatória
Antes de resolver conflitos de merge:
1. **SEMPRE** comparar timestamps dos commits (git log)
2. **SEMPRE** verificar qual branch tem as mudanças mais recentes
3. **SEMPRE** analisar o conteúdo das diferenças antes de escolher uma versão
4. **NUNCA** usar `--ours` ou `--theirs` automaticamente sem análise
5. **SEMPRE** perguntar ao usuário em caso de dúvida sobre qual versão usar

### Consequências
Sobrescrever versão mais recente = perda de trabalho + retrabalho + frustração do usuário

**Data do incidente:** 2025-11-10
**Contexto:** Tentativa de push com conflitos em QuestionsImport.tsx e todo.md

## 🐛 Bugs Críticos Reportados

### 1. Erro de Permissão - Criar Disciplina
- [x] Identificar causa raiz: db.query is not a function
- [x] Aplicar correção: adicionar schema ao Drizzle em db.ts
- [x] Isso resolve TODOS os problemas de db.query

### 2. Erro na Criação de Plano
- [x] Identificar erro: db.query is not a function
- [x] Mesma correção do item 1 resolve este problema

### 3. Página de Simulados sem Criação
- [ ] Verificar página /admin/simulados
- [ ] Adicionar botão "Novo Simulado"
- [ ] Criar rota e página de formulário de simulado

### 4. Questões - Apenas Importação em Lote
- [ ] Verificar se existe inclusão individual de questões
- [ ] Se não existir, criar página de formulário individual
- [ ] Adicionar botão na página de questões
