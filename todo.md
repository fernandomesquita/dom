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


## ETAPA 3: Módulo de Materiais (🚧 EM ANDAMENTO)

**Objetivo:** Implementar sistema completo de gestão de materiais educacionais (vídeos, PDFs, áudios) com DRM, engajamento e analytics.

**Tempo estimado:** 2-3 semanas  
**Prioridade:** Alta  
**Progresso:** 0% (0/150 tarefas concluídas)

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
- [ ] Criar `client/src/pages/Admin/Materials/MaterialsAnalytics.tsx`
- [ ] Instalar dependência `recharts`
- [ ] Dashboard: Cards de resumo (total, views, downloads, rating médio)
- [ ] Dashboard: Gráfico de materiais criados por dia (últimos 30 dias)
- [ ] Dashboard: Gráfico de downloads por dia
- [ ] Dashboard: Top 10 mais acessados
- [ ] Dashboard: Top 10 mais baixados
- [ ] Dashboard: Top 10 com mais upvotes
- [ ] Dashboard: Top 10 mais favoritados
- [ ] Dashboard: Top 10 melhor avaliados
- [ ] Dashboard: Top 10 alunos que mais baixaram

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
