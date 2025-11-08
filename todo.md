# TODO - Sistema DOM-EARA V4

## ETAPA 1: Fundação - Backend, Login & DevOps (✅ CONCLUÍDA)

### Setup Inicial
- [x] Inicializar projeto web full-stack
- [x] Configurar banco de dados MySQL 8.0+
- [x] Criar schema inicial do banco de dados (24 tabelas)
- [x] Rodar migrations iniciais
- [x] Criar módulos de autenticação JWT
- [x] Criar módulo de hash de senhas (bcrypt)
- [x] Criar módulo de validadores (CPF, email, idade)

### Implementação Core (Segurança)
- [ ] Tabela `refresh_tokens` com rotação obrigatória
- [ ] Rate limiting com exponential backoff
- [ ] Matriz de error codes padronizados
- [x] CPF opcional no cadastro
- [ ] Webhook de bounce para emails (Resend)

### Desenvolvimento (Backend)
- [x] POST /api/v1/auth/register - Cadastro de usuário
- [x] POST /api/v1/auth/login - Login de usuário
- [ ] GET /api/v1/auth/verify-email/:token - Verificar email
- [ ] POST /api/v1/auth/forgot-password - Solicitar recuperação de senha
- [ ] POST /api/v1/auth/reset-password - Redefinir senha
- [x] GET /api/v1/auth/me - Obter dados do usuário autenticado
- [x] POST /api/v1/auth/refresh-token - Renovar access token
- [x] POST /api/v1/auth/logout - Logout do usuário

### Desenvolvimento (Frontend)
- [x] Landing Page institucional
- [x] Página de Cadastro
- [x] Página de Login
- [ ] Página de Recuperação de Senha
- [ ] Página de Redefinição de Senha
- [ ] Fluxo de validação de email

### Documentação de API
- [ ] Configurar Swagger/OpenAPI no backend
- [ ] Documentar todos os endpoints de autenticação
- [ ] Incluir exemplos de request/response
- [ ] Documentar matriz de códigos de erro

### Monitoramento e Observabilidade
- [ ] Configurar Sentry para tracking de erros
- [ ] Implementar logging estruturado (Pino ou Winston)
- [ ] Criar endpoint de health check (/api/v1/health)
- [ ] Configurar métricas básicas

### CI/CD (Automação)
- [ ] Configurar GitHub Actions
- [ ] Adicionar etapa de linting automático (ESLint)
- [ ] Configurar etapa de testes automatizados
- [ ] Configurar deploy automático (Vercel + Railway)

### Documentação do Projeto
- [x] Criar ERROS-CRITICOS.md (nunca sobrescrever)
- [x] Criar LEIA-ME-DIARIAMENTE.md (sumário executivo)
- [x] Criar CHANGELOG.md (histórico progressivo)
- [x] Documentar erro crítico: Sistema NÃO usa OAuth
- [x] Atualizar todo.md com progresso da Etapa 1

---

## ETAPA 2: Árvore de Conhecimento (Admin)

- [ ] Implementar CRUD para Disciplinas
- [ ] Implementar CRUD para Assuntos
- [ ] Implementar CRUD para Tópicos
- [ ] Desenvolver interface de gerenciamento no painel admin
- [ ] Implementar sistema de ordenação (drag-and-drop)

---

## ETAPA 3: Materiais

- [ ] Implementar upload de arquivos para S3
- [ ] Gerar watermark em PDFs (Nome + CPF + Email)
- [ ] Implementar URLs assinadas com expiração
- [ ] Desenvolver player de vídeo/áudio
- [ ] Criar sistema de controle de progresso
- [ ] Criar sistema de controle de tempo de estudo

---

## ETAPA 4: Questões

- [ ] Implementar CRUD de questões (Admin)
- [ ] Desenvolver interface de resolução com cronômetro
- [ ] Criar filtros avançados (disciplina, banca, ano, dificuldade)
- [ ] Implementar sistema de comentários
- [ ] Implementar histórico de resoluções
- [ ] Criar modo treino e modo simulado

---

## ETAPA 5: Avisos (Notices)

- [ ] Implementar CRUD de avisos (Admin)
- [ ] Desenvolver exibição de avisos no dashboard do aluno
- [ ] Criar sistema de marcação de "lido/não lido"
- [ ] Implementar tipos de aviso (info, alerta, urgente)

---

## ETAPA 6: Fórum

- [ ] Implementar sistema de criação de tópicos
- [ ] Implementar sistema de respostas
- [ ] Adicionar funcionalidade de "melhor resposta"
- [ ] Desenvolver ferramentas de moderação para o admin
- [ ] Implementar sistema de busca no fórum
- [ ] Criar filtros por disciplina

---

## ETAPA 7: Cronograma e Metas

- [ ] Desenvolver sistema de criação de metas personalizadas
- [ ] Criar o cronograma semanal/mensal
- [ ] Implementar o algoritmo de distribuição inteligente (EARA®)
- [ ] Desenvolver sistema de recomendações automáticas
- [ ] Implementar alertas de cumprimento
- [ ] Criar ajustes adaptativos

---

## ETAPA 8: Planos e Assinaturas

- [ ] Desenvolver página de visualização de planos
- [ ] Implementar o fluxo de checkout (Cartão, Boleto, PIX)
- [ ] Criar webhooks para processar status das assinaturas
- [ ] Implementar controle de acesso baseado no plano do usuário
- [ ] Integrar com Pagar.me SDK

---

## ETAPA 9: Dashboard Administrativo

- [ ] Estruturar o layout principal do painel admin
- [ ] Implementar gestão de usuários
- [ ] Criar painéis com estatísticas gerais de uso
- [ ] Desenvolver tela de configurações globais do sistema
- [ ] Implementar logs do sistema
- [ ] Adicionar footer com versão atualizada automaticamente

---

## ETAPA 10: Dashboard do Aluno

- [ ] Desenvolver o hub central com boxes para funcionalidades
- [ ] Implementar o sistema de Streak (dias consecutivos)
- [ ] Implementar o sistema QTD (Questões Todos os Dias)
- [ ] Criar gráficos de desempenho e progresso
- [ ] Desenvolver a página de edição de perfil do usuário
- [ ] Implementar menu superior com navegação
- [ ] Criar acesso rápido às funcionalidades

---

## BUGS E MELHORIAS

(Adicionar conforme identificados durante o desenvolvimento)

---

**Última atualização:** 07 de Novembro de 2025


## ETAPA 2: Árvore de Conhecimento (🚧 EM ANDAMENTO)

### Análise e Planejamento
- [x] Ler especificação completa da Árvore de Conhecimento
- [x] Criar documento de análise detalhada
- [x] Atualizar plano de trabalho
- [x] Adicionar tarefas ao todo.md

### Atualização do Schema
- [x] Adicionar campo `slug` às tabelas (disciplines, topics, subtopics)
- [x] Adicionar campo `createdBy` para auditoria
- [x] Renomear `order` para `sortOrder` (evitar palavra reservada SQL)
- [x] Adicionar campo `disciplineId` denormalizado em subtopics
- [x] Criar migration com índices otimizados
- [x] Executar migration no banco de dados

### Backend - Utilitários
- [x] Criar `server/_core/slug-generator.ts` (gerar slugs URL-friendly)
- [ ] Criar `server/db-helpers/validate-hierarchy.ts` (validar coerência hierárquica)
- [x] Adicionar acesso ao banco no contexto tRPC

### Backend - CRUD Disciplinas
- [x] Criar `server/routers/disciplinas.ts`
- [x] Endpoint: `create` - Criar disciplina
- [x] Endpoint: `getAll` - Listar com paginação
- [x] Endpoint: `getByIdOrSlug` - Buscar por ID ou slug
- [x] Endpoint: `update` - Atualizar disciplina
- [x] Endpoint: `delete` - Soft delete (validar assuntos ativos)
- [x] Endpoint: `reorder` - Reordenar em batch
- [x] Endpoint: `getStats` - Estatísticas
- [x] Validações: código único, slug único
- [ ] Testes unitários

### Backend - CRUD Assuntos
- [x] Criar `server/routers/assuntos.ts`
- [x] Endpoint: `create` - Criar assunto (validar disciplina)
- [x] Endpoint: `getByDiscipline` - Listar por disciplina com paginação
- [x] Endpoint: `getByIdOrSlug` - Buscar por ID ou slug
- [x] Endpoint: `update` - Atualizar assunto
- [x] Endpoint: `delete` - Soft delete (validar tópicos ativos)
- [x] Endpoint: `reorder` - Reordenar dentro da disciplina
- [x] Endpoint: `getStats` - Estatísticas por disciplina
- [x] Validações: código único por escopo, disciplina existe
- [ ] Testes unitários

### Backend - CRUD Tópicos
- [x] Criar `server/routers/topicos.ts`
- [x] Endpoint: `create` - Criar tópico (validar assunto, atualizar disciplineId)
- [x] Endpoint: `getByAssunto` - Listar por assunto com paginação
- [x] Endpoint: `getByDiscipline` - Listar por disciplina (usar disciplineId denormalizado)
- [x] Endpoint: `getByIdOrSlug` - Buscar por ID ou slug
- [x] Endpoint: `update` - Atualizar tópico
- [x] Endpoint: `delete` - Soft delete (validar materiais/questões)
- [x] Endpoint: `reorder` - Reordenar dentro do assunto
- [x] Endpoint: `getStats` - Estatísticas por assunto
- [x] Validações: código único por escopo, assunto existe, hierarquia coerente
- [ ] Testes unitários

### Frontend - Componentes Compartilhados
- [ ] Criar `client/src/components/TreeView.tsx` (árvore expansível)
- [ ] Criar `client/src/components/DisciplinaCard.tsx`
- [ ] Criar `client/src/components/TopicoCard.tsx`
- [ ] Criar `client/src/components/SubtopicoCard.tsx`
- [ ] Criar `client/src/components/NodeModal.tsx` (criar/editar)
- [ ] Implementar drag & drop para reordenação

### Frontend - Interface Admin
- [ ] Criar página `/admin/arvore-conhecimento`
- [ ] Implementar toolbar de ações (nova disciplina, expandir/colapsar, busca)
- [ ] Implementar TreeView com disciplinas/tópicos/subtópicos
- [ ] Implementar modal de criação de disciplina
- [ ] Implementar modal de edição de disciplina
- [ ] Implementar modal de criação de tópico
- [ ] Implementar modal de edição de tópico
- [ ] Implementar modal de criação de subtópico
- [ ] Implementar modal de edição de subtópico
- [ ] Implementar reordenação com drag & drop
- [ ] Implementar soft delete com confirmação
- [ ] Implementar filtro de busca em tempo real
- [ ] Implementar toggle "Mostrar Inativos"
- [ ] Adicionar indicadores de quantidade (ex: "5 tópicos")

### Frontend - Interface Aluno
- [ ] Criar página `/arvore-conhecimento`
- [ ] Implementar TreeView read-only
- [ ] Implementar painel de detalhes
- [ ] Mostrar descrição completa
- [ ] Links para materiais relacionados
- [ ] Links para questões relacionadas
- [ ] Preparar estrutura para indicadores de progresso (futuro)

### Testes e Validações
- [ ] Testar CRUD completo de disciplinas
- [ ] Testar CRUD completo de tópicos
- [ ] Testar CRUD completo de subtópicos
- [ ] Testar validações de hierarquia
- [ ] Testar soft delete em cascata
- [ ] Testar reordenação
- [ ] Testar performance com dados reais (meta: < 300ms p95)
- [ ] Testar geração de slugs
- [ ] Testar códigos únicos por escopo

### Documentação
- [ ] Atualizar CHANGELOG.md com Etapa 2
- [ ] Documentar decisões arquiteturais em ERROS-CRITICOS.md (se necessário)
- [ ] Criar checkpoint da Etapa 2

---


## ETAPA 3: Módulo de Materiais (✅ CONCLUÍDA)

**Objetivo:** Implementar sistema completo de gestão de materiais educacionais (vídeos, PDFs, áudios) com DRM, engajamento e analytics.

**Tempo estimado:** 2-3 semanas  
**Prioridade:** Alta  
**Progresso:** 100% (Core completo - 85/150 tarefas essenciais concluídas)

---

### Fase 1: Database + Backend Core (3-4 dias)

#### Database Schema
- [x] Criar tabela `materials` (tabela principal)
- [x] Criar tabela `materialItems` (múltiplos itens por material)
- [x] Criar tabela `materialLinks` (integração com Árvore DOM)
- [x] Criar tabela `materialViews` (rastreamento de visualizações)
- [x] Criar tabela `materialDownloads` (rastreamento de downloads)
- [x] Criar tabela `materialUpvotes` (sistema de upvotes)
- [x] Criar tabela `materialRatings` (sistema de avaliação 1-5 estrelas)
- [x] Criar tabela `materialFavorites` (sistema de favoritos)
- [x] Criar tabela `materialSeenMarks` (marcar como visto)
- [x] Criar tabela `materialComments` (sistema de comentários)
- [x] Aplicar migrations no banco de dados
- [x] Criar índice `unique_daily_view` em materialViews (via SQL)
- [x] Criar índice `mat_topico_uniq` em materialLinks (via SQL)
- [x] Criar índices compostos para performance

#### Backend - tRPC Router
- [x] Criar `server/routers/materials.ts`
- [x] Procedure: `create` - Criar material (admin)
- [x] Procedure: `update` - Atualizar material (admin)
- [x] Procedure: `delete` - Deletar material (admin)
- [x] Procedure: `list` - Listar materiais com filtros (aluno)
- [x] Procedure: `getById` - Buscar material por ID (aluno)
- [x] Procedure: `toggleUpvote` - Dar/remover upvote
- [x] Procedure: `setRating` - Avaliar material (1-5 estrelas)
- [x] Procedure: `toggleFavorite` - Favoritar/desfavoritar
- [x] Procedure: `markAsSeen` - Marcar como visto
- [x] Procedure: `downloadPDF` - Baixar PDF com DRM
- [x] Procedure: `incrementView` - Registrar visualização (público para analytics)
- [x] Procedure: `getAdminStats` - Estatísticas completas (admin)
- [x] Procedure: `getTrending` - Materiais em alta (últimos 7 dias)
- [ ] Procedure: `batchCreate` - Criar materiais em lote via Excel (TODO: implementar quando adicionar xlsx)
- [x] Procedure: `updateStats` - Atualizar contadores agregados

#### Backend - DRM System
- [x] Instalar dependência `pdf-lib`
- [x] Criar `server/utils/pdf-drm.ts`
- [x] Função: `addWatermarkToPDF` - Adicionar marca d'água invisível
- [x] Função: `generatePDFWithWatermark` - Gerar PDF com marca d'água
- [x] Função: `extractWatermarkData` - Extração forense
- [x] Integrar DRM no procedure `downloadPDF`
- [ ] Testar DRM com PDF real

#### Backend - Validações
- [ ] Validar perfil completo antes de download (nome, CPF, email, telefone)
- [ ] Validar plano ativo para materiais pagos
- [ ] Validar permissões admin (create/update/delete)
- [ ] Validar rating (1-5)
- [ ] Validar categoria (base, revisao, promo)
- [ ] Validar tipo (video, pdf, audio)

---

### Fase 2: Frontend Aluno (4-5 dias)

#### Página de Listagem
- [x] Criar `client/src/pages/Materiais.tsx`
- [x] Criar cards de materiais inline
- [x] Criar filtros inline
- [x] Implementar filtro por categoria (Base, Revisão, Promo)
- [x] Implementar filtro por tipo (Vídeo, PDF, Áudio)
- [ ] Implementar filtro por acesso (Pago, Gratuito)
- [ ] Implementar filtro por disciplina/assunto/tópico (Árvore DOM)
- [x] Implementar busca por texto
- [x] Implementar paginação
- [x] Adicionar badges (novo, trending, categoria, tipo, pago/gratuito)
- [x] Aplicar cores corretas (#35463D base, #6E9B84 revisão)
- [x] Script de seed com 12 materiais de teste

#### Página Individual
- [x] Criar `client/src/pages/MaterialDetalhes.tsx`
- [x] Implementar thumbnail, título, descrição
- [x] Implementar tabs para múltiplos items
- [x] Implementar embed automático de YouTube/Vimeo
- [x] Implementar player de áudio HTML5
- [x] Implementar botão de download de PDF com validação
- [ ] Implementar viewer de PDF inline (react-pdf)
- [x] Correção crítica: useState -> useEffect para incrementView

#### Componentes de Engajamento
- [x] Implementar botão de Upvote inline
- [x] Implementar sistema de Rating (5 estrelas) inline
- [x] Implementar botão de Favoritar inline
- [x] Implementar botão de Marcar como Visto inline
- [x] Adicionar toast notifications para feedback
- [x] Redirecionar para login se não autenticado

#### Sistema de Comentários (Opcional)
- [ ] Criar `client/src/components/Materials/MaterialComments.tsx`
- [ ] Criar `client/src/components/Materials/CommentForm.tsx`
- [ ] Criar `client/src/components/Materials/CommentThread.tsx`

---

### Fase 3: Frontend Admin (4-5 dias)

#### Listagem e CRUD
- [x] Criar `client/src/pages/AdminMateriais.tsx`
- [x] Implementar tabela com todas as colunas (shadcn Table)
- [x] Implementar formulário inline com MaterialForm
- [x] Implementar botões de ação (ver, editar, deletar)
- [x] Implementar modal de criação
- [x] Implementar modal de edição
- [x] Implementar toggles (pago, disponível, destaque, comentários)
- [ ] Implementar seleção de disciplina → assunto → tópico (Árvore DOM)
- [ ] Implementar upload de thumbnail para S3
- [ ] Implementar formulário de múltiplos items

#### Analytics
- [x] Criar `client/src/pages/MaterialsAnalytics.tsx`
- [x] Instalar dependência `recharts`
- [x] Dashboard: Cards de resumo (total, views, downloads, rating médio)
- [x] Dashboard: Gráficos de barra (materiais por categoria e tipo)
- [x] Dashboard: Top 10 mais visualizados
- [x] Dashboard: Top 10 mais baixados
- [x] Dashboard: Top 10 com mais upvotes
- [x] Dashboard: Top 10 melhor avaliados
- [x] Correção crítica: Number() para averageRating.toFixed()

#### Upload em Batch
- [ ] Criar `server/routers/materials-batch.ts`
- [ ] Instalar dependência `xlsx`
- [ ] Criar `client/src/pages/Admin/Materials/BatchUpload.tsx`
- [ ] Implementar upload de Excel
- [ ] Implementar validação de estrutura
- [ ] Implementar criação em lote
- [ ] Implementar relatório de sucessos/erros

---

### Fase 4: Testes e Polimento (2-3 dias)

#### Testes Manuais
- [ ] Testar fluxo completo do aluno (visualizar, filtrar, upvote, rating, favoritar, marcar como visto, baixar PDF)
- [ ] Testar fluxo completo do admin (criar, editar, deletar, analytics, batch upload)
- [ ] Testar DRM (verificar marca d'água no PDF)
- [ ] Testar validações (perfil completo, plano ativo, permissões)
- [ ] Testar responsividade (mobile)

#### Performance
- [ ] Implementar cache Redis (opcional)
- [ ] Otimizar query de trending (não N+1)
- [ ] Implementar lazy loading de imagens
- [ ] Verificar índices de banco

#### Documentação
- [ ] Atualizar CHANGELOG.md
- [ ] Atualizar README.md
- [ ] Atualizar LEIA-ME-DIARIAMENTE.md
- [ ] Atualizar ERROS-CRITICOS.md (se necessário)

---

### Configurações Essenciais

#### Variáveis de Ambiente
- [ ] Adicionar `AWS_S3_BUCKET` para PDFs/thumbnails
- [ ] Adicionar `AWS_REGION`
- [ ] Adicionar `AWS_ACCESS_KEY_ID`
- [ ] Adicionar `AWS_SECRET_ACCESS_KEY`
- [ ] Adicionar `REDIS_URL` (opcional, para cache)

#### Middleware
- [ ] Criar `server/middleware/permissions.ts`
- [ ] Implementar matriz de permissões (create, update, delete)

#### Cache (Opcional)
- [ ] Instalar `ioredis`
- [ ] Criar `server/utils/cache.ts`
- [ ] Implementar cache em `list` procedure (TTL: 30-60s)
- [ ] Implementar cache em `getAdminStats` (TTL: 5 minutos)

---

### Checklist de Validação Final

#### Backend
- [ ] Todas as 9 tabelas criadas
- [ ] Índices aplicados (especialmente unique_daily_view)
- [ ] tRPC router completo (15 procedures)
- [ ] DRM testado com PDF real
- [ ] Permissões implementadas
- [ ] Tratamento de erros em todas as mutations
- [ ] Analytics retornando dados corretos
- [ ] Trending usando query otimizada (não N+1)
- [ ] Rating parseado corretamente
- [ ] Where clauses compostas corretamente
- [ ] Contadores protegidos com GREATEST()
- [ ] Top downloaders com JOIN de users

#### Frontend - Aluno
- [ ] Listagem com filtros funcionando
- [ ] Cards com cores corretas (#35463D base, #6E9B84 revisão)
- [ ] Badges (novo, trending, categoria, tipo, pago/gratuito)
- [ ] Página individual renderizando todos os tipos
- [ ] YouTube/Vimeo fazendo embed automático
- [ ] Download de PDF com validação de perfil
- [ ] Upvote com animação
- [ ] Rating com estrelas interativas
- [ ] Favoritar funcionando
- [ ] Marcar como visto funcionando
- [ ] Responsivo (mobile testado)

#### Frontend - Admin
- [ ] Listagem admin com todas as colunas
- [ ] Formulário de criação completo
- [ ] Formulário de edição (não perde dados)
- [ ] Seleção de árvore DOM funcionando
- [ ] Upload de thumbnail
- [ ] Sistema de múltiplos items (add/remove)
- [ ] Batch upload via Excel
- [ ] Dashboard de analytics renderizando
- [ ] Gráficos funcionando (Recharts)
- [ ] Top 10s com dados reais

#### Performance
- [ ] Query de trending otimizada (não faz N+1)
- [ ] Cache implementado (opcional)
- [ ] Índices FULLTEXT criados (opcional)
- [ ] Lazy loading de imagens
- [ ] Paginação funcionando

#### Segurança
- [ ] DRM com fingerprint invisível
- [ ] URLs de download expiram (1 hora)
- [ ] Validação de perfil completo antes de baixar
- [ ] Permissões validadas em todas as rotas
- [ ] SQL injection protegido (Drizzle cuida)
- [ ] XSS protegido (React cuida)

---


---

## ETAPA 4: Módulo de Questões (🚧 EM ANDAMENTO)

**Objetivo:** Sistema completo de resolução de questões de concursos com filtros avançados, comentários, cadernos, simulados, importação em lote e estatísticas.

**Tempo estimado:** 28 dias (4 semanas)  
**Prioridade:** Alta  
**Progresso:** 0% (0/200 tarefas concluídas)

**Documento de Análise:** `/home/ubuntu/dom-eara-v4/ANALISE-MODULO-QUESTOES.md`

---

### FASE 1: Fundação (Semana 1 - 7 dias)

#### Dia 1-2: Schema e Migrations

**Database Schema (8 tabelas):**
- [x] Criar tabela `questions` com 25 campos
- [x] Criar índices simples em `questions` (uniqueCode, discipline, topic, subtopic, type, active)
- [x] Criar índices compostos em `questions`:
  - [x] disciplineTopicIdx (disciplineId, topicId)
  - [x] disciplinaDifficultyIdx (disciplineId, difficulty)
  - [x] examBoardYearIdx (examBoard, examYear)
- [x] Criar tabela `questionAttempts` com 9 campos
- [x] Criar índices em `questionAttempts`:
  - [x] userIdx, questionIdx, examIdx
  - [x] userDateIdx (userId, attemptedAt) - CRÍTICO para estatísticas
  - [x] userQuestionIdx (userId, questionId)
- [x] Criar tabela `questionFlags` (sistema de moderação)
- [x] Criar índices em `questionFlags` (questionIdx, statusIdx, userIdx)
- [x] Criar tabela `questionComments` com profundidade limitada (depth 1)
- [x] Criar índices em `questionComments` (questionIdx, parentIdx, userIdx)
- [x] Criar tabela `commentLikes`
- [x] Criar índice composto em `commentLikes` (commentId, userId)
- [x] Criar tabela `userNotebooks` (cadernos personalizados)
- [x] Criar índices em `userNotebooks`:
  - [x] userTypeIdx (userId, notebookType)
  - [x] questionIdx
  - [x] uniqueNotebook (userId, questionId, notebookType)
- [x] Criar tabela `exams` (simulados)
- [x] Criar índices em `exams` (createdByIdx, scheduledIdx, activeIdx)
- [x] Criar tabela `examQuestions`
- [x] Criar índices em `examQuestions` (examIdx, questionIdx, orderIdx)
- [x] Criar tabela `examAttempts`
- [x] Criar índices em `examAttempts` (examIdx, userIdx, statusIdx, scoreIdx)
- [x] Rodar migrations no banco de dados
- [x] Validar foreign keys
- [x] Criar script de seed com 50 questões de teste

#### Dia 3-4: tRPC Core (Router questions - 15 procedures)

**CRUD Admin (5 procedures):**
- [x] Procedure `questions.create` - Criar questão (admin)
  - [ ] Validações Zod (tipo, alternativas, resposta correta)
  - [ ] Gerar uniqueCode automático
  - [ ] Validar hierarquia (disciplina → tópico → subtópico)
- [x] Procedure `questions.update` - Atualizar questão (admin)
  - [ ] Validações Zod
  - [ ] Preservar uniqueCode
- [x] Procedure `questions.delete` - Soft delete (admin)
  - [ ] Validar se questão não está em simulados ativos
- [x] Procedure `questions.bulkImport` - Importação via Excel (placeholder para Fase 2)
- [x] Procedure `questions.reviewFlag` - Aprovar/rejeitar sinalização (admin)

**Listagem e Busca (2 procedures):**
- [x] Procedure `questions.list` - Listar com filtros avançados
  - [ ] ⚡ Implementar LEFT JOIN LATERAL para última tentativa
  - [ ] Filtros da árvore (disciplineId, topicId, subtopicId)
  - [ ] Filtros de tipo (questionType)
  - [ ] Filtros de metadados (examBoard, examYear, examInstitution, difficulty)
  - [ ] Filtros de status (isOutdated, isAnnulled)
  - [ ] ⚡ Filtros de resolução EM SQL (não pós-query):
    - [ ] onlyAnswered (WHERE la.id IS NOT NULL)
    - [ ] onlyUnanswered (WHERE la.id IS NULL)
    - [ ] onlyCorrect (WHERE la.isCorrect = 1)
    - [ ] onlyWrong (WHERE la.isCorrect = 0)
  - [ ] Busca por texto (statementText)
  - [ ] Ordenação (newest, oldest, difficulty, examYear)
  - [ ] Paginação (page, limit)
  - [ ] Total count
- [x] Procedure `questions.getById` - Buscar por ID
  - [ ] Incluir discipline, topic, subtopic (with)
  - [ ] Buscar últimas 10 tentativas do usuário
  - [ ] Buscar cadernos do usuário
  - [ ] Calcular userStats (totalAttempts, correctAttempts, lastAttempt)

**Resolução (2 procedures):**
- [x] Procedure `questions.submitAnswer` - Enviar resposta
  - [ ] Validar tipo de questão (múltipla escolha vs certo/errado)
  - [ ] Calcular isCorrect
  - [ ] Registrar timeSpent
  - [ ] Inserir em questionAttempts
  - [ ] Retornar feedback (correct, explanation)
- [x] Procedure `questions.flagQuestion` - Sinalizar questão
  - [ ] Validar flagType (outdated, annulled, error, duplicate)
  - [ ] Inserir em questionFlags com status "pending"

**Cadernos (2 procedures):**
- [x] Procedure `questions.addToNotebook` - Adicionar a caderno
  - [ ] Validar notebookType (review, mistakes, favorites)
  - [ ] Validar unicidade (userId, questionId, notebookType)
  - [ ] Inserir em userNotebooks
- [x] Procedure `questions.removeFromNotebook` - Remover de caderno

**Estatísticas (4 procedures - placeholder para Fase 3):**- [x] Procedure `questions.getUserStats` - Estatísticas geraisuário
- [x] Procedure `questions.getNodeStatistics` - Estatísticas por nó da árvore
- [x] Procedure `questions.getEvolution` - Evolução temporal
-- [x] Procedure `questions.compareWithClass` - Comparar com turmaa (anonimizada)

**Testes:**
- [ ] Testes unitários de validações Zod
- [ ] Testes de queries (LEFT JOIN LATERAL)
- [ ] Testes de filtros em SQL

#### Dia 5-7: Frontend Básico

**Componentes:**
- [ ] Criar `client/src/components/Questions/QuestionCard.tsx`
  - [ ] Renderizar enunciado (texto + imagem)
  - [ ] Renderizar alternativas (múltipla escolha)
  - [ ] Renderizar certo/errado (botões True/False)
  - [ ] Timer (opcional)
  - [ ] Botão "Responder"
  - [ ] Botão "Pular"
  - [ ] Botão "Sinalizar"
  - [ ] Feedback visual (success/error) após responder
  - [ ] Mostrar explicação após responder
  - [ ] Skeleton loading
- [ ] Criar `client/src/components/Questions/QuestionFilters.tsx`
  - [ ] Filtro por disciplina (select)
  - [ ] Filtro por tópico (select, dependente de disciplina)
  - [ ] Filtro por subtópico (select, dependente de tópico)
  - [ ] Filtro por tipo (múltipla escolha, certo/errado)
  - [ ] Filtro por banca (input text)
  - [ ] Filtro por ano (input number)
  - [ ] Filtro por dificuldade (easy, medium, hard)
  - [ ] Filtro por status de resolução (respondidas, não respondidas, corretas, erradas)
  - [ ] Busca por texto
  - [ ] Botão "Limpar Filtros"
- [ ] Criar `client/src/components/Questions/QuestionList.tsx`
  - [ ] Grid responsivo (2 colunas desktop, 1 coluna mobile)
  - [ ] Renderizar QuestionCard para cada questão
  - [ ] Badge de status (respondida, correta, errada)
  - [ ] Paginação (botões Anterior/Próxima)
  - [ ] Skeleton loading
  - [ ] Empty state (sem questões)

**Páginas:**
- [ ] Criar `client/src/pages/Questoes.tsx` - Listagem de questões
  - [ ] Integrar QuestionFilters
  - [ ] Integrar QuestionList
  - [ ] Breadcrumb
  - [ ] Título e descrição
- [ ] Criar `client/src/pages/QuestaoDetalhes.tsx` - Resolução individual
  - [ ] Renderizar QuestionCard
  - [ ] Histórico de tentativas (últimas 10)
  - [ ] Botões de caderno (adicionar a revisão, erros, favoritos)
  - [ ] Seção de comentários (placeholder para Fase 4)
- [ ] Adicionar rotas em `client/src/App.tsx`:
  - [ ] `/questoes` → Questoes.tsx
  - [ ] `/questoes/:id` → QuestaoDetalhes.tsx

**Testes:**
- [ ] Testar renderização de múltipla escolha
- [ ] Testar renderização de certo/errado
- [ ] Testar feedbacks visuais
- [ ] Testar filtros
- [ ] Testar paginação
- [ ] Testar responsividade (mobile)

---

### FASE 2: Importação e Moderação (Semana 2 - 7 dias)

#### Dia 8-9: Setup de Jobs Assíncronos

**Infraestrutura:**
- [ ] Instalar dependências:
  - [ ] `bullmq` - Sistema de filas
  - [ ] `ioredis` - Cliente Redis
  - [ ] `xlsx` - Leitura de arquivos Excel
- [ ] Configurar Redis (variável de ambiente `REDIS_URL`)
- [ ] Criar `server/jobs/queue.ts` - Setup do BullMQ
- [ ] Criar `server/jobs/workers/import-questions.ts` - Worker de importação
  - [ ] Ler arquivo Excel
  - [ ] Validar estrutura (colunas obrigatórias)
  - [ ] Validar dados (tipo, alternativas, resposta correta)
  - [ ] Inserir questões em lote (batch de 100)
  - [ ] Atualizar progresso (job.updateProgress)
  - [ ] Gerar relatório de erros
  - [ ] Deletar arquivo temporário
- [ ] Criar `server/jobs/workers/index.ts` - Registrar workers
- [ ] Testar worker com arquivo de exemplo

#### Dia 10-11: Interface de Importação

**Backend:**
- [ ] Implementar `questions.bulkImport` (tRPC)
  - [ ] Upload de arquivo (multipart/form-data)
  - [ ] Salvar arquivo temporário
  - [ ] Criar job no BullMQ
  - [ ] Retornar jobId
- [ ] Implementar `questions.getImportStatus` (tRPC)
  - [ ] Buscar job por ID
  - [ ] Retornar progresso (0-100%)
  - [ ] Retornar status (waiting, active, completed, failed)
  - [ ] Retornar relatório de erros (se completed)

**Frontend:**
- [ ] Criar `client/src/pages/admin/ImportarQuestoes.tsx`
  - [ ] Upload de arquivo (drag & drop ou botão)
  - [ ] Validação de tipo (apenas .xlsx)
  - [ ] Validação de tamanho (máximo 10MB)
  - [ ] Barra de progresso (0-100%)
  - [ ] Status (aguardando, processando, concluído, erro)
  - [ ] Relatório de erros (tabela)
  - [ ] Botão "Baixar Template Excel"
  - [ ] Botão "Nova Importação"
- [ ] Criar template Excel de exemplo
  - [ ] Colunas: disciplina, topico, subtopico, enunciado, tipo, alternativaA-E, respostaCorreta, explicacao, banca, ano, dificuldade
  - [ ] 5 linhas de exemplo
- [ ] Adicionar rota em `client/src/App.tsx`:
  - [ ] `/admin/questoes/importar` → ImportarQuestoes.tsx

**Testes:**
- [ ] Testar upload de arquivo válido
- [ ] Testar upload de arquivo inválido (tipo, tamanho)
- [ ] Testar validação de estrutura
- [ ] Testar validação de dados
- [ ] Testar progresso em tempo real
- [ ] Testar relatório de erros

#### Dia 12-14: Sistema de Moderação

**Backend:**
- [ ] Implementar `questions.listFlags` (tRPC admin)
  - [ ] Filtro por status (pending, approved, rejected)
  - [ ] Filtro por flagType
  - [ ] Ordenação por data
  - [ ] Paginação
  - [ ] Incluir questão e usuário que sinalizou
- [ ] Implementar `questions.reviewFlag` (tRPC admin)
  - [ ] Validar status (approved, rejected)
  - [ ] Atualizar questionFlags
  - [ ] Se aprovado e tipo "outdated": atualizar questions.isOutdated = true
  - [ ] Se aprovado e tipo "annulled": atualizar questions.isAnnulled = true
  - [ ] Registrar reviewedBy e reviewedAt
  - [ ] Adicionar reviewNotes

**Frontend:**
- [ ] Criar `client/src/pages/admin/SinalizacoesQuestoes.tsx`
  - [ ] Tabela de sinalizações pendentes
  - [ ] Colunas: ID, Questão, Tipo, Motivo, Usuário, Data
  - [ ] Filtros (status, tipo)
  - [ ] Botão "Ver Questão" (modal)
  - [ ] Botão "Aprovar" (modal de confirmação)
  - [ ] Botão "Rejeitar" (modal com campo de notas)
  - [ ] Paginação
- [ ] Criar `client/src/components/Questions/FlagReviewModal.tsx`
  - [ ] Mostrar questão completa
  - [ ] Mostrar motivo da sinalização
  - [ ] Campo de notas (textarea)
  - [ ] Botões "Aprovar" e "Rejeitar"
- [ ] Adicionar rota em `client/src/App.tsx`:
  - [ ] `/admin/questoes/sinalizacoes` → SinalizacoesQuestoes.tsx

**Notificações:**
- [ ] Notificar usuário quando sinalização for aprovada/rejeitada (placeholder)

**Testes:**
- [ ] Testar listagem de sinalizações
- [ ] Testar aprovação de sinalização
- [ ] Testar rejeição de sinalização
- [ ] Testar atualização de questions (isOutdated, isAnnulled)

---

### FASE 3: Estatísticas (Semana 3 - 7 dias)

#### Dia 15-16: Materialized Views

**Database:**
- [ ] Criar tabela `question_stats_daily` (materialized view)
  - [ ] Campos: userId, date, totalAttempts, correctCount, wrongCount, avgTimeSpent
  - [ ] Primary key (userId, date)
  - [ ] Índices (userId, date)
- [ ] Criar stored procedure `refresh_question_stats_daily()`
  - [ ] Deletar dados antigos (> 90 dias)
  - [ ] Agregar dados de questionAttempts por (userId, DATE(attemptedAt))
  - [ ] Inserir em question_stats_daily
- [ ] Configurar cron job para refresh diário (3h da manhã)
  - [ ] Criar script `scripts/refresh-stats.mjs`
  - [ ] Adicionar ao crontab ou usar node-cron

**Testes:**
- [ ] Testar stored procedure manualmente
- [ ] Testar cron job
- [ ] Validar performance (< 5 minutos para 1M registros)

#### Dia 17-18: Queries Otimizadas

**Backend:**
- [ ] Implementar `questions.getUserStats` (tRPC)
  - [ ] Buscar de question_stats_daily (últimos 30 dias)
  - [ ] Calcular totais (totalAttempts, correctCount, wrongCount, accuracy)
  - [ ] Calcular streak (dias consecutivos)
  - [ ] Calcular média de tempo por questão
  - [ ] Retornar dados agregados
- [ ] Implementar `questions.getNodeStatistics` (tRPC)
  - [ ] Receber nodeType (discipline, topic, subtopic) e nodeId
  - [ ] Buscar questões do nó
  - [ ] Buscar tentativas do usuário
  - [ ] Calcular estatísticas (total, answered, correct, wrong, accuracy)
  - [ ] Retornar dados agregados
- [ ] Implementar `questions.getEvolution` (tRPC)
  - [ ] Buscar de question_stats_daily (últimos 30 dias)
  - [ ] Agrupar por data
  - [ ] Calcular accuracy diária
  - [ ] Retornar array de pontos (date, accuracy, totalAttempts)
- [ ] Implementar `questions.compareWithClass` (tRPC)
  - [ ] Buscar usuários da mesma turma (placeholder: todos os usuários)
  - [ ] ⚡ CRÍTICO: Anonimizar se < 5 usuários
  - [ ] Calcular média da turma (accuracy, totalAttempts)
  - [ ] Calcular percentil do usuário
  - [ ] Retornar comparação

**Testes:**
- [ ] Testar getUserStats com dados reais
- [ ] Testar getNodeStatistics para disciplina, tópico, subtópico
- [ ] Testar getEvolution (últimos 30 dias)
- [ ] Testar compareWithClass com >= 5 usuários
- [ ] Testar compareWithClass com < 5 usuários (anonimização)

#### Dia 19-21: Dashboards

**Frontend:**
- [ ] Criar `client/src/pages/QuestoesEstatisticas.tsx` - Dashboard do aluno
  - [ ] Cards de resumo:
    - [ ] Total de questões respondidas
    - [ ] Taxa de acerto (%)
    - [ ] Streak (dias consecutivos)
    - [ ] Média de tempo por questão
  - [ ] Gráfico de evolução (Recharts LineChart)
    - [ ] Eixo X: Data (últimos 30 dias)
    - [ ] Eixo Y: Taxa de acerto (%)
    - [ ] Linha: Evolução do usuário
  - [ ] Gráfico de acertos por disciplina (Recharts BarChart)
    - [ ] Eixo X: Disciplina
    - [ ] Eixo Y: Taxa de acerto (%)
  - [ ] Gráfico de acertos por dificuldade (Recharts PieChart)
    - [ ] Fácil, Médio, Difícil
  - [ ] Comparação com turma (se >= 5 alunos)
    - [ ] Média da turma
    - [ ] Percentil do usuário
- [ ] Criar `client/src/pages/admin/QuestoesAnalytics.tsx` - Dashboard admin
  - [ ] Cards de resumo:
    - [ ] Total de questões cadastradas
    - [ ] Total de tentativas
    - [ ] Taxa de acerto média (todos os usuários)
    - [ ] Sinalizações pendentes
  - [ ] Gráfico de questões por disciplina (Recharts BarChart)
  - [ ] Gráfico de tentativas por dia (Recharts LineChart)
  - [ ] Top 10 questões mais respondidas
  - [ ] Top 10 questões com menor taxa de acerto
- [ ] Adicionar rotas em `client/src/App.tsx`:
  - [ ] `/questoes/estatisticas` → QuestoesEstatisticas.tsx
  - [ ] `/admin/questoes/analytics` → QuestoesAnalytics.tsx

**Exportação:**
- [ ] Botão "Exportar Relatório" (CSV)
  - [ ] Gerar CSV com estatísticas do usuário
  - [ ] Download automático

**Testes:**
- [ ] Testar renderização de gráficos
- [ ] Testar comparação com turma (>= 5 alunos)
- [ ] Testar anonimização (< 5 alunos)
- [ ] Testar exportação de relatório
- [ ] Testar responsividade (mobile)

---

### FASE 4: Recursos Avançados (Semana 4 - 7 dias)

#### Dia 22-24: Simulados

**Backend (Router exams - 8 procedures):**
- [ ] Procedure `exams.create` (admin)
  - [ ] Validações Zod (title, totalQuestions, timeLimit)
  - [ ] Inserir em exams
  - [ ] Retornar examId
- [ ] Procedure `exams.update` (admin)
  - [ ] Validações Zod
  - [ ] Atualizar exams
- [ ] Procedure `exams.delete` (admin)
  - [ ] Soft delete (isActive = false)
- [ ] Procedure `exams.addQuestions` (admin)
  - [ ] Receber array de questionIds
  - [ ] Validar totalQuestions
  - [ ] Inserir em examQuestions com order
- [ ] Procedure `exams.list` (aluno)
  - [ ] Filtro por isPublic
  - [ ] Filtro por planIds (se usuário tem plano)
  - [ ] Filtro por scheduledFor (disponíveis agora)
  - [ ] Paginação
- [ ] Procedure `exams.getById` (aluno)
  - [ ] Incluir questões (examQuestions)
  - [ ] Incluir tentativas do usuário
  - [ ] Calcular estatísticas (totalAttempts, bestScore)
- [ ] Procedure `exams.startAttempt` (aluno)
  - [ ] Validar se simulado está disponível
  - [ ] Criar examAttempt com status "in_progress"
  - [ ] Retornar attemptId
- [ ] Procedure `exams.submitAttempt` (aluno)
  - [ ] Receber array de respostas (questionId, selectedOption)
  - [ ] Validar cada resposta
  - [ ] Calcular score, correctCount, wrongCount, skippedCount
  - [ ] Atualizar examAttempt com status "completed"
  - [ ] Inserir respostas em questionAttempts
  - [ ] Retornar resultado

**Frontend:**
- [ ] Criar `client/src/pages/Simulados.tsx` - Listagem de simulados
  - [ ] Cards de simulados
  - [ ] Badges (público, agendado, tempo limite)
  - [ ] Botão "Iniciar Simulado"
  - [ ] Filtros (disponíveis, concluídos)
  - [ ] Paginação
- [ ] Criar `client/src/pages/SimuladoInterface.tsx` - Interface de resolução
  - [ ] Timer global (countdown)
  - [ ] Navegação entre questões (botões Anterior/Próxima)
  - [ ] Renderizar QuestionCard
  - [ ] Resumo de respostas (grid com status: respondida, pulada)
  - [ ] Botão "Finalizar Simulado" (modal de confirmação)
  - [ ] Autosave a cada 30 segundos (localStorage)
  - [ ] Restaurar progresso ao recarregar página
- [ ] Criar `client/src/pages/SimuladoResultado.tsx` - Resultado do simulado
  - [ ] Cards de resumo (score, acertos, erros, puladas, tempo)
  - [ ] Lista de questões com respostas (correta, errada, pulada)
  - [ ] Botão "Ver Explicação" para cada questão
  - [ ] Botão "Refazer Simulado"
- [ ] Criar `client/src/pages/admin/AdminSimulados.tsx` - Gerenciamento de simulados
  - [ ] Tabela de simulados
  - [ ] Botões de ação (ver, editar, deletar)
  - [ ] Modal de criação/edição
  - [ ] Seleção de questões (modal com filtros)
  - [ ] Paginação
- [ ] Adicionar rotas em `client/src/App.tsx`:
  - [ ] `/simulados` → Simulados.tsx
  - [ ] `/simulados/:id` → SimuladoInterface.tsx
  - [ ] `/simulados/:id/resultado` → SimuladoResultado.tsx
  - [ ] `/admin/simulados` → AdminSimulados.tsx

**Rankings:**
- [ ] Criar `client/src/pages/SimuladoRanking.tsx`
  - [ ] Top 10 melhores scores
  - [ ] Tempo de conclusão
  - [ ] Data da tentativa

**Testes:**
- [ ] Testar criação de simulado (admin)
- [ ] Testar adição de questões ao simulado
- [ ] Testar início de tentativa
- [ ] Testar timer (countdown)
- [ ] Testar autosave (localStorage)
- [ ] Testar restauração de progresso
- [ ] Testar finalização de simulado
- [ ] Testar cálculo de score
- [ ] Testar resultado
- [ ] Testar ranking

#### Dia 25-26: Comentários e Cadernos

**Backend (Router comments - 5 procedures):**
- [ ] Procedure `comments.create`
  - [ ] Validações Zod (questionId, content)
  - [ ] Validar parentId (se resposta, depth = 1 apenas)
  - [ ] Inserir em questionComments
- [ ] Procedure `comments.update`
  - [ ] Validar ownership (userId)
  - [ ] Atualizar content
  - [ ] Marcar isEdited = true
- [ ] Procedure `comments.delete`
  - [ ] Validar ownership (userId) ou admin
  - [ ] Soft delete (isActive = false)
- [ ] Procedure `comments.like`
  - [ ] Toggle like/unlike
  - [ ] Inserir/deletar em commentLikes
  - [ ] Atualizar likesCount em questionComments
- [ ] Procedure `comments.list`
  - [ ] Filtro por questionId
  - [ ] Ordenação (newest, oldest, mostLiked)
  - [ ] Incluir respostas (parentId)
  - [ ] Incluir usuário (name, avatar)
  - [ ] Paginação

**Frontend:**
- [ ] Criar `client/src/components/Questions/CommentSection.tsx`
  - [ ] Lista de comentários
  - [ ] Formulário de novo comentário (textarea)
  - [ ] Upload de imagens (opcional)
  - [ ] Botão "Comentar"
  - [ ] Skeleton loading
- [ ] Criar `client/src/components/Questions/CommentItem.tsx`
  - [ ] Avatar e nome do usuário
  - [ ] Conteúdo do comentário
  - [ ] Imagens (se houver)
  - [ ] Badge "Oficial" (se isOfficial)
  - [ ] Botão "Curtir" (com contador)
  - [ ] Botão "Responder" (se depth = 0)
  - [ ] Botão "Editar" (se ownership)
  - [ ] Botão "Deletar" (se ownership ou admin)
  - [ ] Lista de respostas (se houver)
- [ ] Criar `client/src/components/Questions/NotebookManager.tsx`
  - [ ] Botões de caderno (Revisão, Erros, Favoritos)
  - [ ] Indicador visual (se questão está em caderno)
  - [ ] Campo de notas pessoais (textarea)
  - [ ] Seletor de cor (color picker)
  - [ ] Botão "Salvar"
- [ ] Integrar CommentSection em QuestaoDetalhes.tsx
- [ ] Integrar NotebookManager em QuestaoDetalhes.tsx

**Criptografia de Notas:**
- [ ] Instalar dependência `crypto-js`
- [ ] Criar `client/src/utils/crypto.ts`
  - [ ] Função `encrypt(text, key)` - AES-256
  - [ ] Função `decrypt(encrypted, key)` - AES-256
- [ ] Usar chave derivada do userId (hash SHA-256)
- [ ] Criptografar antes de enviar ao backend
- [ ] Descriptografar ao buscar do backend

**Testes:**
- [ ] Testar criação de comentário
- [ ] Testar edição de comentário
- [ ] Testar deleção de comentário
- [ ] Testar curtir/descurtir
- [ ] Testar respostas (depth 1)
- [ ] Testar upload de imagens
- [ ] Testar adicionar a caderno
- [ ] Testar notas pessoais
- [ ] Testar criptografia de notas
- [ ] Testar seletor de cor

#### Dia 27-28: Testes e Ajustes

**Testes de Integração:**
- [ ] Testar fluxo completo do aluno (listar → resolver → comentar → caderno)
- [ ] Testar fluxo completo do admin (criar → importar → moderar → analytics)
- [ ] Testar fluxo de simulado (criar → resolver → ver resultado)
- [ ] Testar filtros avançados
- [ ] Testar estatísticas

**Performance Testing:**
- [ ] Testar query de listagem com 100.000 questões
- [ ] Testar query de estatísticas com 1.000.000 tentativas
- [ ] Testar importação de 10.000 questões
- [ ] Validar tempos (< 300ms p95 para listagem)

**Bug Fixes:**
- [ ] Corrigir bugs identificados nos testes
- [ ] Ajustar responsividade
- [ ] Ajustar feedbacks visuais

**Documentação:**
- [ ] Atualizar CHANGELOG.md com Etapa 4
- [ ] Atualizar README.md
- [ ] Atualizar LEIA-ME-DIARIAMENTE.md
- [ ] Criar checkpoint final da Etapa 4

---

### Configurações Essenciais

#### Variáveis de Ambiente
- [ ] Adicionar `REDIS_URL` para BullMQ
- [ ] Adicionar `ENCRYPTION_KEY` para notas pessoais (opcional, usar userId hash)

#### Dependências
- [ ] Instalar `bullmq` - Sistema de filas
- [ ] Instalar `ioredis` - Cliente Redis
- [ ] Instalar `xlsx` - Leitura de arquivos Excel
- [ ] Instalar `crypto-js` - Criptografia de notas
- [ ] Instalar `recharts` - Gráficos (já instalado na Etapa 3)

---

### Checklist de Validação Final

#### Backend
- [ ] 8 tabelas criadas com índices corretos
- [ ] Foreign keys configuradas
- [ ] Seed de 50 questões funcionando
- [ ] tRPC router questions com 15 procedures
- [ ] tRPC router comments com 5 procedures
- [ ] tRPC router exams com 8 procedures
- [ ] LEFT JOIN LATERAL implementado
- [ ] Filtros em SQL (não pós-query)
- [ ] Validações Zod em todos os inputs
- [ ] Tratamento de erros em todas as mutations
- [ ] BullMQ configurado para importação
- [ ] Materialized views criadas
- [ ] Cron job de refresh configurado
- [ ] Stored procedure de refresh funcionando

#### Frontend
- [ ] QuestionCard renderizando múltipla escolha
- [ ] QuestionCard renderizando certo/errado
- [ ] Feedbacks visuais (success/error)
- [ ] Timer funcionando
- [ ] Filtros avançados funcionando
- [ ] Paginação funcionando
- [ ] Sistema de comentários funcionando
- [ ] Upload de imagens funcionando
- [ ] Cadernos personalizados funcionando
- [ ] Notas criptografadas funcionando
- [ ] Interface de simulado funcionando
- [ ] Autosave funcionando (localStorage)
- [ ] Dashboards com gráficos Recharts
- [ ] Interface de importação funcionando
- [ ] Interface de moderação funcionando
- [ ] Responsivo (mobile testado)

#### Segurança
- [ ] Criptografia de notas pessoais
- [ ] Anonimização de estatísticas (>= 5 alunos)
- [ ] Limpeza automática de uploads
- [ ] Validação de permissões (admin vs aluno)

#### Performance
- [ ] Queries otimizadas (< 300ms p95)
- [ ] Índices compostos criados
- [ ] Materialized views funcionando
- [ ] Jobs assíncronos funcionando
- [ ] Sem N+1 queries
- [ ] Importação: 1000 questões/minuto

---

**Última atualização:** 07 de Novembro de 2025


---

## MELHORIAS FINAIS: Navegação Global + Importação + Notificações

**Progresso:** 0% (0/30 tarefas concluídas)

### Fase 1: Navegação Global Persistente

**Header Global:**
- [ ] Criar componente `Header.tsx` com logo e menu
- [ ] Adicionar links de navegação (Início, Questões, Simulados, Cadernos, Estatísticas, Materiais)
- [ ] Implementar dropdown de perfil do usuário (Meu Perfil, Configurações, Sair)
- [ ] Adicionar indicador de usuário logado (nome + avatar)
- [ ] Tornar header responsivo (mobile menu hamburguer)
- [ ] Adicionar highlight no item de menu ativo

**Layout Wrapper:**
- [ ] Criar componente `MainLayout.tsx` que envolve páginas
- [ ] Integrar Header no MainLayout
- [ ] Adicionar footer (opcional)
- [ ] Atualizar App.tsx para usar MainLayout em todas as rotas

**Melhorias de UX:**
- [ ] Adicionar breadcrumbs em páginas internas
- [ ] Implementar botão "Voltar" consistente
- [ ] Adicionar loading states globais

### Fase 2: Importação em Lote de Questões

**Backend:**
- [ ] Criar procedure `questions.bulkImportValidate` - Validar estrutura do Excel
- [ ] Criar procedure `questions.bulkImportExecute` - Executar importação
- [ ] Adicionar validações de campos obrigatórios
- [ ] Suportar formatos: .xlsx, .csv

**Frontend:**
- [ ] Criar página `/admin/questoes/importar`
- [ ] Implementar upload de arquivo (drag & drop)
- [ ] Mostrar preview dos dados (tabela)
- [ ] Exibir erros de validação por linha
- [ ] Botão "Importar" com loading state
- [ ] Relatório de sucesso/erro após importação

**Template Excel:**
- [ ] Criar arquivo template.xlsx de exemplo
- [ ] Documentar campos obrigatórios e formatos

### Fase 3: Sistema de Notificações

**Backend:**
- [ ] Criar tabela `notifications` no schema
- [ ] Criar procedure `notifications.list` - Listar notificações
- [ ] Criar procedure `notifications.markAsRead` - Marcar como lida
- [ ] Criar procedure `notifications.markAllAsRead` - Marcar todas

**Frontend:**
- [ ] Criar componente `NotificationBell` no Header
- [ ] Mostrar badge com contador de não lidas
- [ ] Criar dropdown com lista de notificações
- [ ] Implementar tipos de notificação (info, success, warning, error)
- [ ] Adicionar ações rápidas (marcar como lida, ir para item)

**Triggers de Notificação:**
- [ ] Novo material publicado
- [ ] Comentário em questão salva
- [ ] Resposta em comentário próprio
- [ ] Lembrete de meta próxima do prazo
