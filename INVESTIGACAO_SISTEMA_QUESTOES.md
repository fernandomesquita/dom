# 🔍 INVESTIGAÇÃO - SISTEMA DE QUESTÕES

**Data:** 09/11/2025  
**Tempo:** 20 minutos  
**Objetivo:** Mapear estrutura existente antes de criar especificação técnica

---

## 📊 RESUMO EXECUTIVO

**Sistema de Questões: 85% COMPLETO** ✅

O sistema já possui infraestrutura robusta implementada:
- ✅ **Banco de dados:** 9 tabelas (schema completo)
- ✅ **Backend:** 23 procedures tRPC (16 questions + 7 exams)
- ✅ **Frontend:** 4 páginas + 6 componentes
- ⚠️ **Rotas:** Apenas 1 rota registrada (`/questoes`)
- ✅ **Seed:** 50 questões de teste prontas

**Principais gaps:**
1. Rotas de exames não registradas em App.tsx
2. Página Questions.tsx pode não estar totalmente integrada
3. Sistema precisa de testes e validação

---

## 🗄️ BANCO DE DADOS

### Tabelas Encontradas (9 tabelas)

**Arquivo:** `drizzle/schema-questions.ts` (424 linhas)

1. **`questions`** - Tabela principal de questões
   - 26 campos (uniqueCode, statementText, options A-E, correctOption, etc)
   - Integração com árvore de conhecimento (disciplinaId, assuntoId, topicoId)
   - Suporte para múltipla escolha e verdadeiro/falso
   - Metadados: banca, ano, instituição, dificuldade
   - Sinalizações: isOutdated, isAnnulled
   - 9 índices (simples + compostos)

2. **`questionAttempts`** - Tentativas de resolução
   - userId, questionId, selectedOption, isCorrect, timeSpent
   - source: practice, exam, notebook
   - examAttemptId (referência para simulados)
   - 4 índices (userIdx, questionIdx, userDateIdx, userQuestionIdx)

3. **`questionFlags`** - Sistema de moderação
   - flagType: outdated, annulled, error, duplicate
   - status: pending, approved, rejected
   - reviewedBy, reviewedAt, reviewNotes

4. **`questionComments`** - Comentários nas questões
   - Profundidade limitada (1 nível de resposta)
   - parentId (self-join)
   - likesCount, isOfficial, isEdited

5. **`commentLikes`** - Curtidas em comentários
   - Índice único (commentId + userId)

6. **`userNotebooks`** - Cadernos personalizados
   - notebookType: review, mistakes, favorites
   - personalNotes, color, order
   - Índice único (userId + questionId + notebookType)

7. **`exams`** - Simulados
   - title, description, totalQuestions, timeLimit, passingScore
   - isPublic, planIds (JSON array)
   - scheduledFor, closesAt

8. **`examQuestions`** - Questões dos simulados
   - examId, questionId, order

9. **`examAttempts`** - Tentativas de simulados
   - userId, examId, startedAt, finishedAt
   - score, totalQuestions, correctAnswers
   - status: in_progress, completed, abandoned

### Estrutura

**Qualidade:** ⭐⭐⭐⭐⭐ (EXCELENTE)
- Schema bem documentado
- Índices otimizados para performance
- Referências de integridade (foreign keys)
- Suporte para casos de uso avançados (moderação, cadernos, comentários)

### Status no Banco

✅ **Tabelas criadas no banco de dados:**
- 5 tabelas de questions (confirmado via `SHOW TABLES`)
- 3 tabelas de exams (confirmado via `SHOW TABLES`)
- **Total:** 8 tabelas (falta confirmar commentLikes)

✅ **Dados de teste:**
- **50 questões** inseridas (confirmado via `SELECT COUNT(*)`)
- Script de seed: `scripts/seed-questions.mjs`
- Distribuição: 40 múltipla escolha + 10 verdadeiro/falso

---

## 🔧 BACKEND (tRPC)

### Routers Encontrados

**Arquivos:**
- `server/routers/questions.ts` (34.365 bytes)
- `server/routers/exams.ts` (12.617 bytes)

### Procedures do `questionsRouter` (16 procedures)

**CRUD Básico:**
1. ✅ `list` - Listar questões com filtros avançados (protectedProcedure)
2. ✅ `getById` - Buscar questão por ID (protectedProcedure)
3. ✅ `create` - Criar questão (adminProcedure)
4. ✅ `update` - Atualizar questão (adminProcedure)
5. ✅ `delete` - Deletar questão (adminProcedure)

**Resolução:**
6. ✅ `submitAnswer` - Submeter resposta (protectedProcedure)

**Moderação:**
7. ✅ `flagQuestion` - Sinalizar questão (protectedProcedure)
8. ✅ `reviewFlag` - Revisar sinalização (adminProcedure)

**Cadernos:**
9. ✅ `addToNotebook` - Adicionar ao caderno (protectedProcedure)
10. ✅ `getNotebookQuestions` - Listar questões do caderno (protectedProcedure)
11. ✅ `removeFromNotebook` - Remover do caderno (protectedProcedure)

**Estatísticas:**
12. ✅ `getUserStats` - Estatísticas do usuário (protectedProcedure)
13. ✅ `getNodeStatistics` - Estatísticas por nó da árvore (protectedProcedure)
14. ✅ `getEvolution` - Evolução temporal (protectedProcedure)
15. ✅ `compareWithClass` - Comparar com turma (protectedProcedure)

**Admin:**
16. ✅ `bulkImport` - Importação em massa (adminProcedure)

### Procedures do `examsRouter` (7 procedures)

**CRUD:**
1. ✅ `create` - Criar simulado (protectedProcedure)
2. ✅ `getById` - Buscar simulado (protectedProcedure)

**Execução:**
3. ✅ `start` - Iniciar simulado (protectedProcedure)
4. ✅ `submitAnswer` - Submeter resposta (protectedProcedure)
5. ✅ `finish` - Finalizar simulado (protectedProcedure)

**Histórico:**
6. ✅ `getAttempt` - Buscar tentativa (protectedProcedure)
7. ✅ `listMyAttempts` - Listar minhas tentativas (protectedProcedure)

### Registro no AppRouter

✅ **Routers registrados em `server/routers.ts`:**
```typescript
import { questionsRouter } from "./routers/questions";
import { examsRouter } from "./routers/exams";

export const appRouter = router({
  questions: questionsRouter,
  exams: examsRouter,
  // ... outros routers
});
```

### Qualidade

**Completude:** ⭐⭐⭐⭐⭐ (100%)
- Todas as procedures essenciais implementadas
- Filtros avançados (disciplina, assunto, tópico, banca, ano, dificuldade)
- Estatísticas completas (usuário, nó, evolução, comparação)
- Sistema de cadernos (review, mistakes, favorites)
- Moderação (flags + review)
- Importação em massa

---

## 🎨 FRONTEND (React)

### Páginas Encontradas (4 páginas)

**Diretório:** `client/src/pages/`

1. ✅ **`Questions.tsx`** (10.050 bytes)
   - Página principal de listagem de questões
   - Provavelmente integra com `trpc.questions.list`

2. ✅ **`Exams.tsx`** (8.501 bytes)
   - Página de listagem de simulados
   - Provavelmente integra com `trpc.exams.*`

3. ✅ **`ExamViewer.tsx`** (13.724 bytes)
   - Visualizador de simulado em execução
   - Interface de resolução de questões do simulado

4. ✅ **`ExamReport.tsx`** (12.009 bytes)
   - Relatório de desempenho do simulado
   - Estatísticas e análise de resultados

### Componentes Encontrados (6 componentes)

**Diretório:** `client/src/components/questions/`

1. ✅ **`QuestionCard.tsx`** (12K)
   - Card de exibição de questão
   - Provavelmente mostra enunciado, opções, resposta

2. ✅ **`QuestionFilters.tsx`** (14K)
   - Filtros avançados de questões
   - Disciplina, assunto, tópico, banca, ano, dificuldade

3. ✅ **`CommentSection.tsx`** (7.4K)
   - Seção de comentários de uma questão

4. ✅ **`CommentItem.tsx`** (6.3K)
   - Item individual de comentário

5. ✅ **`CommentForm.tsx`** (2.2K)
   - Formulário de novo comentário

**Diretório:** `client/src/components/exams/`

6. ✅ **`ExamGenerator.tsx`** (7.6K)
   - Gerador de simulados personalizados

### Qualidade

**Completude:** ⭐⭐⭐⭐ (80%)
- Páginas principais criadas
- Componentes reutilizáveis implementados
- Sistema de comentários completo
- Gerador de simulados

**Gaps identificados:**
- Não confirmado se páginas estão totalmente integradas com tRPC
- Falta validação de fluxo completo (listar → resolver → ver resultado)

---

## 🛣️ ROTAS

### Rotas Registradas em `App.tsx`

**Encontradas:**
1. ✅ `/questoes` → `Questions.tsx`

**NÃO encontradas:**
- ❌ `/exams` ou `/simulados`
- ❌ `/exams/:id` (visualizador)
- ❌ `/exams/:id/report` (relatório)

### Gap Crítico

⚠️ **PROBLEMA:** Páginas de exames existem mas rotas não estão registradas!

**Arquivos existem:**
- `client/src/pages/Exams.tsx`
- `client/src/pages/ExamViewer.tsx`
- `client/src/pages/ExamReport.tsx`

**Mas não há rotas em App.tsx:**
```typescript
// ❌ FALTANDO
<Route path="/exams" component={Exams} />
<Route path="/exams/:id" component={ExamViewer} />
<Route path="/exams/:id/report" component={ExamReport} />
```

---

## 🌱 DADOS DE TESTE (SEED)

### Scripts Encontrados

**Diretório:** `scripts/`

1. ✅ **`seed-questions.mjs`** (12.334 bytes)
   - **50 questões de teste**
   - 40 múltipla escolha + 10 verdadeiro/falso
   - Distribuídas entre disciplinas/assuntos/tópicos
   - Metadados: bancas (CESPE, FCC, VUNESP, FGV, etc)
   - Dificuldades: easy, medium, hard

2. ✅ **`create-all-questions-tables.mjs`** (10.669 bytes)
   - Script de criação de tabelas

3. ✅ **`create-questions-tables.sql`** (9.636 bytes)
   - SQL puro de criação de tabelas

4. ✅ **`reset-questions-schema.mjs`** (1.876 bytes)
   - Script de reset do schema

### Status

✅ **Seed executado com sucesso**
- Confirmado via `SELECT COUNT(*) FROM questions` → **50 questões**
- Tabelas criadas no banco de dados

---

## 📊 AVALIAÇÃO GERAL

### Completude Estimada: **85%**

**O que está COMPLETO:**
- ✅ Schema de banco (100%)
- ✅ Backend procedures (100%)
- ✅ Componentes React (80%)
- ✅ Dados de teste (100%)

**O que está INCOMPLETO:**
- ⚠️ Rotas de exames não registradas (0%)
- ⚠️ Integração frontend-backend não validada (?)
- ⚠️ Testes automatizados (0%)

### Sistema Funciona?

**Resposta:** PARCIAL ✅⚠️

- ✅ **Backend:** Routers registrados, procedures implementadas
- ✅ **Banco:** Tabelas criadas, dados inseridos
- ⚠️ **Frontend:** Páginas existem mas rotas não registradas
- ❌ **Fluxo completo:** Não testado

### Principais Gaps

1. **CRÍTICO:** Rotas de exames não registradas em App.tsx
   - `Exams.tsx`, `ExamViewer.tsx`, `ExamReport.tsx` inacessíveis

2. **ALTO:** Validação de integração frontend-backend
   - Confirmar se `Questions.tsx` chama `trpc.questions.list` corretamente
   - Confirmar se filtros funcionam
   - Confirmar se resolução de questões funciona

3. **MÉDIO:** Sistema de comentários
   - Confirmar se `CommentSection` está integrado
   - Confirmar se curtidas funcionam

4. **BAIXO:** Testes automatizados
   - Nenhum teste encontrado

---

## 🎯 RECOMENDAÇÕES PARA ESPECIFICAÇÃO

### O que NÃO precisa ser especificado (já existe)

- ❌ Schema de banco de dados
- ❌ Procedures tRPC (backend)
- ❌ Componentes React básicos
- ❌ Script de seed

### O que PRECISA ser especificado

1. **Registro de Rotas** (1h)
   - Adicionar rotas de exames em App.tsx
   - Adicionar links no menu de navegação
   - Testar navegação entre páginas

2. **Validação de Integração** (2-3h)
   - Testar fluxo completo de questões
   - Testar fluxo completo de simulados
   - Corrigir bugs de integração

3. **Melhorias de UX** (2-3h)
   - Loading states
   - Error handling
   - Empty states
   - Toast notifications

4. **Testes** (opcional, 4-6h)
   - Testes de procedures
   - Testes de componentes
   - Testes E2E

### Estimativa de Tempo para Completar

**Cenário Mínimo (funcional):** 3-4 horas
- Registro de rotas: 1h
- Validação de integração: 2-3h

**Cenário Completo (polido):** 8-10 horas
- Registro de rotas: 1h
- Validação de integração: 2-3h
- Melhorias de UX: 2-3h
- Testes: 4-6h

---

## 📝 OBSERVAÇÕES IMPORTANTES

1. **Qualidade do código existente é EXCELENTE**
   - Schema bem projetado
   - Procedures completas
   - Componentes reutilizáveis

2. **Sistema está 85% pronto**
   - Infraestrutura robusta
   - Falta apenas "ligar os fios"

3. **Não há necessidade de reescrever nada**
   - Apenas completar integração
   - Adicionar rotas
   - Testar fluxos

4. **Seed com 50 questões é suficiente para testes**
   - Distribuição equilibrada
   - Metadados realistas

5. **Sistema de comentários é sofisticado**
   - Suporta respostas (1 nível)
   - Sistema de curtidas
   - Comentários oficiais

6. **Sistema de cadernos é poderoso**
   - 3 tipos: review, mistakes, favorites
   - Notas pessoais
   - Cores e ordenação

---

## 🔍 ARQUIVOS IMPORTANTES PARA ANÁLISE

### Para entender o sistema:
1. `drizzle/schema-questions.ts` (schema completo)
2. `server/routers/questions.ts` (procedures)
3. `server/routers/exams.ts` (procedures de simulados)
4. `client/src/pages/Questions.tsx` (página principal)
5. `client/src/components/questions/QuestionCard.tsx` (componente principal)

### Para completar integração:
1. `client/src/App.tsx` (adicionar rotas)
2. `client/src/components/dashboard/DashboardHeader.tsx` (adicionar links no menu)

---

## ✅ CONCLUSÃO

**Sistema de Questões está 85% completo e pronto para ser finalizado em 3-4 horas de trabalho focado.**

**Próximos passos:**
1. Registrar rotas de exames em App.tsx
2. Adicionar links no menu de navegação
3. Testar fluxo completo (listar → resolver → ver resultado)
4. Corrigir bugs de integração (se houver)
5. Adicionar loading states e error handling

**Não há necessidade de:**
- Reescrever schema
- Reescrever procedures
- Criar novos componentes do zero

**O trabalho é de INTEGRAÇÃO, não de IMPLEMENTAÇÃO.**

---

**Investigação realizada por:** Fernando + Claude  
**Data:** 09/11/2025  
**Tempo:** 20 minutos  
**Status:** ✅ COMPLETA
