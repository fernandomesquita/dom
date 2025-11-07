# ANÁLISE - MÓDULO DE QUESTÕES DOM V4

**Data:** 07 de Novembro de 2025  
**Versão da Especificação:** 2.1 Revisada  
**Documento Base:** MODULO_QUESTOES_DOM_V4_REVISADO(1).md (1943 linhas)

---

## 📋 RESUMO EXECUTIVO

O módulo de questões é um sistema completo para resolução de questões de concursos com:

- **8 tabelas principais** no banco de dados
- **Sistema de resolução** com timer e feedbacks visuais
- **Filtros avançados** (disciplina, banca, ano, dificuldade, status de resolução)
- **Comentários** com profundidade limitada (depth 1)
- **Cadernos personalizados** (revisão, erros, favoritos)
- **Simulados completos** com autosave e correção automática
- **Importação em lote** via Excel com jobs assíncronos (BullMQ)
- **Estatísticas** com materialized views para performance
- **Moderação** de sinalizações (desatualizada, anulada, erro, duplicada)

**Tempo Estimado:** 28 dias (4 semanas)

---

## 🗄️ SCHEMA DO BANCO DE DADOS

### Tabelas Principais (8)

1. **questions** - Tabela principal de questões
   - Campos: id, uniqueCode, disciplineId, topicId, subtopicId
   - Conteúdo: statementText, statementImage, questionType
   - Respostas: optionA-E, correctOption, trueFalseAnswer
   - Explicação: explanationText, explanationImage
   - Metadados: examBoard, examYear, examInstitution, difficulty
   - Sinalizações: isOutdated, isAnnulled, flagReason
   - **Índices compostos críticos:**
     - disciplineTopicIdx (disciplineId, topicId)
     - disciplineDifficultyIdx (disciplineId, difficulty)
     - examBoardYearIdx (examBoard, examYear)

2. **questionAttempts** - Histórico de resoluções
   - Campos: userId, questionId, selectedOption, trueFalseAnswer
   - Resultado: isCorrect, timeSpent
   - Contexto: source (practice, exam, notebook), examAttemptId
   - **Índice crítico:** userDateIdx (userId, attemptedAt) para estatísticas temporais

3. **questionFlags** - Sistema de moderação (NOVA)
   - Campos: questionId, userId, flagType, reason
   - Moderação: status (pending, approved, rejected), reviewedBy, reviewedAt, reviewNotes
   - Tipos: outdated, annulled, error, duplicate

4. **questionComments** - Sistema de comentários
   - Campos: questionId, userId, parentId (depth 1 apenas)
   - Conteúdo: content, images (JSON array)
   - Metadados: isOfficial, likesCount, isEdited, isActive

5. **commentLikes** - Curtidas em comentários
   - Campos: commentId, userId

6. **userNotebooks** - Cadernos personalizados
   - Campos: userId, questionId, notebookType (review, mistakes, favorites)
   - Dados: personalNotes (considerar criptografia), color, order
   - **Índice composto:** userTypeIdx (userId, notebookType)

7. **exams** - Simulados
   - Campos: title, description, totalQuestions, timeLimit, passingScore
   - Acesso: isPublic, planIds (JSON array)
   - Agendamento: scheduledFor, closesAt
   - Metadados: isActive, createdBy

8. **examQuestions** - Questões dos simulados
   - Campos: examId, questionId, order

9. **examAttempts** - Tentativas de simulados
   - Campos: examId, userId, score, correctCount, wrongCount, skippedCount
   - Tempo: timeSpent, startedAt, completedAt
   - Status: in_progress, completed, abandoned

---

## 🔧 tRPC PROCEDURES

### Router: questions (15 procedures)

**CRUD Admin (5):**
- `create` - Criar questão com validações
- `update` - Atualizar questão
- `delete` - Soft delete
- `bulkImport` - Importação via Excel (job assíncrono)
- `reviewFlag` - Aprovar/rejeitar sinalização

**Listagem e Busca (2):**
- `list` - Listar com filtros avançados (LEFT JOIN LATERAL otimizado)
- `getById` - Buscar por ID com tentativas e cadernos

**Resolução (2):**
- `submitAnswer` - Enviar resposta
- `flagQuestion` - Sinalizar questão

**Cadernos (2):**
- `addToNotebook` - Adicionar a caderno
- `removeFromNotebook` - Remover de caderno

**Estatísticas (4):**
- `getUserStats` - Estatísticas do usuário
- `getNodeStatistics` - Estatísticas por nó da árvore
- `getEvolution` - Evolução temporal
- `compareWithClass` - Comparação com turma (anonimizada)

### Router: comments (5 procedures)

- `create` - Criar comentário
- `update` - Editar comentário
- `delete` - Deletar comentário
- `like` - Curtir/descurtir
- `list` - Listar comentários de uma questão

### Router: exams (8 procedures)

**CRUD Admin (4):**
- `create` - Criar simulado
- `update` - Atualizar simulado
- `delete` - Deletar simulado
- `addQuestions` - Adicionar questões ao simulado

**Resolução Aluno (4):**
- `list` - Listar simulados disponíveis
- `getById` - Buscar simulado por ID
- `startAttempt` - Iniciar tentativa
- `submitAttempt` - Finalizar tentativa

---

## 🎨 FRONTEND

### Componentes Principais

1. **QuestionCard** - Card de questão com:
   - Enunciado (texto + imagem)
   - Alternativas (múltipla escolha ou certo/errado)
   - Timer
   - Botões de ação (responder, pular, sinalizar)
   - Feedback visual (success/error)
   - Explicação (após responder)

2. **QuestionFilters** - Filtros avançados:
   - Árvore de conhecimento (disciplina → tópico → subtópico)
   - Tipo de questão
   - Banca, ano, instituição
   - Dificuldade
   - Status de resolução (respondidas, não respondidas, corretas, erradas)

3. **QuestionList** - Lista de questões:
   - Grid responsivo
   - Paginação
   - Skeleton loading
   - Badge de status (respondida, correta, errada)

4. **CommentSection** - Sistema de comentários:
   - Lista de comentários
   - Formulário de novo comentário
   - Upload de imagens
   - Curtir/descurtir
   - Editar/deletar (próprios comentários)

5. **NotebookManager** - Gerenciador de cadernos:
   - Adicionar/remover de cadernos
   - Notas pessoais
   - Cores personalizadas

6. **ExamInterface** - Interface de simulado:
   - Timer global
   - Navegação entre questões
   - Autosave (localStorage)
   - Resumo de respostas
   - Finalizar simulado

7. **StatsCharts** - Gráficos de estatísticas:
   - Evolução temporal (Recharts)
   - Acertos por disciplina
   - Acertos por dificuldade
   - Comparação com média da turma

### Páginas

**Aluno:**
- `/questoes` - Listagem de questões
- `/questoes/:id` - Resolução de questão individual
- `/questoes/cadernos` - Gerenciamento de cadernos
- `/questoes/estatisticas` - Dashboard de estatísticas
- `/simulados` - Listagem de simulados
- `/simulados/:id` - Interface de resolução de simulado

**Admin:**
- `/admin/questoes` - Gerenciamento de questões
- `/admin/questoes/importar` - Importação em lote
- `/admin/questoes/sinalizacoes` - Moderação de sinalizações
- `/admin/simulados` - Gerenciamento de simulados

---

## ⚡ OTIMIZAÇÕES CRÍTICAS

### 1. LEFT JOIN LATERAL para Última Tentativa

**Problema:** N+1 queries ao buscar última tentativa de cada questão

**Solução:**
```sql
LEFT JOIN LATERAL (
  SELECT id, isCorrect 
  FROM questionAttempts 
  WHERE questionId = questions.id 
    AND userId = ?
  ORDER BY attemptedAt DESC 
  LIMIT 1
) la ON TRUE
```

### 2. Filtros em SQL (não pós-query)

**Problema:** Filtrar "apenas questões respondidas" após buscar todas

**Solução:** Aplicar filtros diretamente no WHERE clause:
```sql
WHERE la.id IS NOT NULL -- apenas respondidas
WHERE la.id IS NULL -- apenas não respondidas
WHERE la.isCorrect = 1 -- apenas corretas
WHERE la.isCorrect = 0 -- apenas erradas
```

### 3. Materialized Views para Estatísticas

**Problema:** Queries pesadas de estatísticas executadas em tempo real

**Solução:** Criar tabela `question_stats_daily` atualizada por cron job:
```sql
CREATE TABLE question_stats_daily (
  userId INT,
  date DATE,
  totalAttempts INT,
  correctCount INT,
  wrongCount INT,
  ...
  PRIMARY KEY (userId, date)
);
```

### 4. Jobs Assíncronos para Importação

**Problema:** Importação de 10.000+ questões trava o servidor

**Solução:** BullMQ + Redis para processar em background:
- Upload do arquivo
- Validação assíncrona
- Progress tracking em tempo real
- Relatório de erros ao final

### 5. Índices Compostos Estratégicos

**Problema:** Queries lentas com múltiplos filtros

**Solução:** Criar índices para combinações mais usadas:
- `disciplineTopicIdx` (disciplineId, topicId)
- `disciplineDifficultyIdx` (disciplineId, difficulty)
- `examBoardYearIdx` (examBoard, examYear)
- `userDateIdx` (userId, attemptedAt)

---

## 🔒 SEGURANÇA E LGPD

### 1. Criptografia de Notas Pessoais

Notas em cadernos podem conter dados sensíveis:
```typescript
// Criptografar antes de salvar
const encrypted = encrypt(personalNotes, userKey);
await db.insert(userNotebooks).values({ personalNotes: encrypted });

// Descriptografar ao buscar
const decrypted = decrypt(notebook.personalNotes, userKey);
```

### 2. Anonimização de Estatísticas

Comparação com turma só exibe se >= 5 alunos:
```typescript
if (classUsers.length < 5) {
  return {
    error: "Dados insuficientes para comparação (mínimo 5 alunos)",
    userStats: await getUserStats(ctx.user.id),
    classAverage: null,
  };
}
```

### 3. Limpeza Automática de Uploads

Arquivos temporários de importação devem ser deletados:
```typescript
// Após processar importação
await fs.unlink(tempFilePath);
```

### 4. Rate Limiting

Prevenir abuso de endpoints:
```typescript
// Máximo 100 questões por minuto
rateLimit: {
  "questions.list": { max: 100, window: "1m" },
  "questions.submitAnswer": { max: 60, window: "1m" },
}
```

---

## 📊 PRIORIDADES DE IMPLEMENTAÇÃO

### Fase 1: Fundação (Semana 1)

**Dia 1-2: Schema e Migrations**
- [ ] Criar 8 tabelas com índices
- [ ] Rodar migrations
- [ ] Seed de dados de teste (50 questões)

**Dia 3-4: tRPC Core**
- [ ] Implementar `questions.list` com LEFT JOIN LATERAL
- [ ] Implementar `questions.getById`
- [ ] Implementar `questions.create` (admin)
- [ ] Implementar `questions.submitAnswer`

**Dia 5-7: Frontend Básico**
- [ ] QuestionCard (múltipla escolha + certo/errado)
- [ ] QuestionList com paginação
- [ ] Filtros básicos
- [ ] Feedbacks visuais

### Fase 2: Importação e Moderação (Semana 2)

**Dia 8-9: Setup de Jobs**
- [ ] Instalar BullMQ + Redis
- [ ] Worker de importação
- [ ] Progress tracking

**Dia 10-11: Interface de Importação**
- [ ] Upload de arquivo Excel
- [ ] Validação de template
- [ ] Barra de progresso
- [ ] Relatório de erros

**Dia 12-14: Moderação**
- [ ] Lista de sinalizações pendentes
- [ ] Interface de revisão (aprovar/rejeitar)
- [ ] Notificações

### Fase 3: Estatísticas (Semana 3)

**Dia 15-16: Materialized Views**
- [ ] Criar `question_stats_daily`
- [ ] Procedure de refresh
- [ ] Setup cron job

**Dia 17-18: Queries Otimizadas**
- [ ] getUserStats com materialized view
- [ ] getNodeStatistics
- [ ] getEvolution
- [ ] compareWithClass (anonimizada)

**Dia 19-21: Dashboards**
- [ ] Dashboard do aluno (gráficos Recharts)
- [ ] Dashboard admin (métricas gerais)
- [ ] Exportação de relatórios

### Fase 4: Recursos Avançados (Semana 4)

**Dia 22-24: Simulados**
- [ ] CRUD de exams
- [ ] Interface de resolução
- [ ] Timer + autosave
- [ ] Correção automática
- [ ] Rankings

**Dia 25-26: Comentários e Cadernos**
- [ ] Sistema de comentários (depth 1)
- [ ] Upload de imagens
- [ ] Cadernos personalizados
- [ ] Notas criptografadas

**Dia 27-28: Testes e Ajustes**
- [ ] Testes de integração
- [ ] Performance testing
- [ ] Bug fixes
- [ ] Documentação

---

## ✅ CHECKLIST DE VALIDAÇÃO

### Backend

- [ ] 8 tabelas criadas com índices corretos
- [ ] Foreign keys configuradas
- [ ] Seed de dados de teste funcionando
- [ ] tRPC router com 15 procedures
- [ ] LEFT JOIN LATERAL implementado
- [ ] Filtros em SQL (não pós-query)
- [ ] Validações Zod em todos os inputs
- [ ] Tratamento de erros em todas as mutations
- [ ] BullMQ configurado para importação
- [ ] Materialized views criadas
- [ ] Cron job de refresh configurado
- [ ] Rate limiting implementado

### Frontend

- [ ] QuestionCard renderizando múltipla escolha
- [ ] QuestionCard renderizando certo/errado
- [ ] Feedbacks visuais (success/error)
- [ ] Timer funcionando
- [ ] Filtros avançados funcionando
- [ ] Paginação funcionando
- [ ] Sistema de comentários funcionando
- [ ] Upload de imagens funcionando
- [ ] Cadernos personalizados funcionando
- [ ] Interface de simulado funcionando
- [ ] Autosave funcionando (localStorage)
- [ ] Dashboards com gráficos Recharts
- [ ] Responsivo (mobile testado)

### Segurança

- [ ] Criptografia de notas pessoais
- [ ] Anonimização de estatísticas (>= 5 alunos)
- [ ] Limpeza automática de uploads
- [ ] Rate limiting configurado
- [ ] Validação de permissões (admin vs aluno)

### Performance

- [ ] Queries otimizadas (< 300ms p95)
- [ ] Índices compostos criados
- [ ] Materialized views funcionando
- [ ] Jobs assíncronos funcionando
- [ ] Sem N+1 queries

---

## 🎯 DECISÕES ARQUITETURAIS

### 1. Por que LEFT JOIN LATERAL?

**Alternativas consideradas:**
- Subselect correlacionado (lento)
- N+1 queries (muito lento)
- Window functions (complexo)

**Escolha:** LEFT JOIN LATERAL é o mais performático no MySQL 8.0+

### 2. Por que Materialized Views?

**Alternativas consideradas:**
- Queries em tempo real (muito lento)
- Cache Redis (complexo de invalidar)
- Tabela de agregação manual (trabalhoso)

**Escolha:** Materialized views com refresh por cron job é o equilíbrio ideal

### 3. Por que BullMQ?

**Alternativas consideradas:**
- Processar síncrono (trava servidor)
- Cron jobs (não tem progress tracking)
- AWS Lambda (custo adicional)

**Escolha:** BullMQ + Redis é a solução padrão da indústria

### 4. Por que Depth 1 em Comentários?

**Alternativas consideradas:**
- Recursão infinita (complexo de renderizar)
- Sem respostas (limitado)

**Escolha:** Depth 1 (comentário → resposta) é o equilíbrio ideal

---

## 📈 MÉTRICAS DE SUCESSO

### Performance

- Query de listagem: < 300ms (p95)
- Query de estatísticas: < 500ms (p95)
- Importação: 1000 questões/minuto
- Refresh de materialized views: < 5 minutos

### Escalabilidade

- Suportar 100.000 questões
- Suportar 1.000.000 tentativas
- Suportar 10.000 usuários simultâneos

### UX

- Feedback visual em < 100ms
- Autosave a cada 30 segundos
- Loading states em todos os componentes
- Skeleton loading em listas

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ Análise completa da especificação (CONCLUÍDO)
2. ⏭️ Criar tarefas detalhadas no todo.md
3. ⏭️ Implementar Fase 1: Schema + tRPC Core
4. ⏭️ Implementar Fase 1: Frontend Básico
5. ⏭️ Validar e testar Fase 1 antes de avançar

**Tempo Estimado Total:** 28 dias (4 semanas)

---

**Documento criado por:** Manus AI Agent  
**Data:** 07 de Novembro de 2025  
**Versão:** 1.0
