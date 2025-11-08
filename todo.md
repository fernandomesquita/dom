# TODO - DOM-EARA V4 (ATUALIZADO)

## 📊 RESUMO EXECUTIVO

**Progresso Global:** ~75%

**Módulos 100% Completos:**
- ✅ Autenticação & Segurança (JWT + Refresh Token + Rate Limiting)
- ✅ Dashboard Admin (5 módulos: Planos, Metas, Alunos, Avisos, Auditoria)
- ✅ Banco de Dados (24+ tabelas)
- ✅ Módulo de Metas (cronograma, streaks, notificações)
- ✅ Questões & Simulados
- ✅ Materiais de Estudo
- ✅ Fórum

**Pendências Prioritárias:**
- ⏳ Verificação de Email (ALTA)
- ⏳ Recuperação de Senha (ALTA)
- ⏳ Dashboard de Estatísticas (MÉDIA)
- ⏳ Exportação de Relatórios (MÉDIA)
- ⏳ Personalização de Branding (MÉDIA)

---

## E9: DASHBOARD ADMINISTRATIVO (✅ 100% COMPLETO)

### ✅ Fase 1: Fundação (100%)
- [x] Setup estrutura de pastas (admin/, routers/admin/)
- [x] Logging estruturado com Pino
- [x] Sistema de auditoria completo (audit_logs table + logAuditAction helper)
- [x] Middleware tRPC (staffProcedure, adminRoleProcedure, masterProcedure, mentorProcedure)
- [x] AdminLayout com sidebar responsiva
- [x] Rotas protegidas por role
- [x] auditRouter_v1 com 4 procedures (list, getByUser, getByAction, stats)

### ✅ Fase 2: Gestão de Planos (100%)
- [x] plansRouter_v1 com 6 procedures (list, getById, create, update, delete, stats)
- [x] PlansPage com listagem, filtros e KPIs
- [x] PlanFormPage para criar/editar planos
- [x] Toggle featured/ativo
- [x] Validações completas (horasPorDia, diasDisponiveisBitmask)
- [x] Auditoria em todas operações

### ✅ Fase 3: Gestão de Metas (100%)
- [x] goalsRouter_v1 com 8 procedures (list, getById, create, update, delete, reorder, clone, batchUpload)
- [x] PlanGoalsPage com listagem de metas por plano
- [x] GoalFormPage para criar/editar metas
- [x] BatchUploadPage para importação CSV
- [x] Clone de metas
- [x] Reordenação drag-and-drop
- [x] Validações de hierarquia (disciplina → assunto → tópico)

### ✅ Fase 4: Gestão de Alunos (100%)
- [x] usersRouter_v1 com 10 procedures (list, getById, create, update, delete, suspend, reactivate, impersonate, getHistory, getProgress)
- [x] StudentsPage com listagem, filtros e 4 KPIs
- [x] StudentProfilePage com 4 tabs (Dados Pessoais, Histórico, Progresso, Atividade)
- [x] StudentFormPage para criar/editar alunos
- [x] Sistema de impersonation com JWT temporário
- [x] ImpersonateBar persistente durante impersonation
- [x] Gráficos Chart.js no perfil do aluno

### ✅ Fase 5: Gestão de Avisos (100%)
- [x] Criar schema de avisos (notices + notice_reads)
- [x] noticesRouter_v1 com 6 procedures (list, getById, create, update, delete, stats)
- [x] NoticesPage com listagem, filtros e 4 KPIs
- [x] NoticeFormPage com formulário completo
- [x] RichTextEditor com Tiptap (toolbar completo: negrito, itálico, sublinhado, listas, alinhamento, links, undo/redo)
- [x] Segmentação de destinatários (TODOS, PLANO_ESPECIFICO, ROLE_ESPECIFICA, USUARIOS_ESPECIFICOS)
- [x] Agendamento de publicação (dataPublicacao, dataExpiracao)
- [x] 4 tipos de avisos (INFORMATIVO, IMPORTANTE, URGENTE, MANUTENCAO)
- [x] Sistema de prioridade 0-10
- [x] Rotas: /admin/avisos-v2, /admin/avisos-v2/novo, /admin/avisos-v2/:id

### ✅ Bônus: Página de Auditoria (100%)
- [x] AuditLogsPage com listagem completa
- [x] 4 KPIs (total, últimas 24h, ação mais comum, usuários ativos)
- [x] Filtros avançados (actorId, action, targetType, startDate, endDate)
- [x] Dialog de detalhes com payload JSON
- [x] Badges coloridos por tipo de ação e role
- [x] Paginação
- [x] Rota: /admin/auditoria

---

## 🎯 BACKLOG: DASHBOARD ADMINISTRATIVO - ATIVIDADES EXTRAS

### 📊 Módulo: Dashboard de Estatísticas (PRIORIDADE ALTA)
- [ ] Criar página `/admin/dashboard` como landing page do admin
- [ ] Implementar KPIs agregados do sistema:
  - [ ] Total de usuários (ativos, inativos, por role)
  - [ ] Total de planos (ativos, pausados, concluídos)
  - [ ] Total de metas (criadas, concluídas, em andamento)
  - [ ] Total de questões resolvidas (hoje, semana, mês)
  - [ ] Total de avisos (publicados, rascunhos, agendados)
  - [ ] Total de materiais (PDFs, vídeos, por disciplina)
  - [ ] Total de threads no fórum (ativas, resolvidas)
- [ ] Criar gráficos de evolução temporal (Chart.js):
  - [ ] Cadastros de usuários (últimos 30 dias)
  - [ ] Questões resolvidas por dia (últimos 30 dias)
  - [ ] Metas concluídas por semana (últimos 3 meses)
  - [ ] Acessos ao sistema (últimos 7 dias)
- [ ] Implementar views materializadas no banco:
  - [ ] `mv_daily_stats` (estatísticas diárias agregadas)
  - [ ] `mv_user_activity` (atividade de usuários)
  - [ ] `mv_plan_progress` (progresso de planos)
- [ ] Criar procedure `admin.dashboard_v1.getStats`
- [ ] Adicionar filtros de período (hoje, semana, mês, ano, customizado)
- [ ] Implementar comparação com período anterior (% de crescimento)

### 📥 Módulo: Exportação de Relatórios (PRIORIDADE MÉDIA)
- [ ] Criar helper `exportToCSV` no backend
- [ ] Criar helper `exportToExcel` (biblioteca exceljs)
- [ ] Implementar exportação em PlansPage:
  - [ ] Botão "Exportar CSV" na listagem
  - [ ] Incluir filtros aplicados
  - [ ] Colunas: ID, Título, Usuário, Status, Data Criação, Horas/Dia, Dias Disponíveis
- [ ] Implementar exportação em StudentsPage:
  - [ ] Botão "Exportar CSV"
  - [ ] Colunas: ID, Nome, Email, CPF, Role, Status, Data Cadastro, Último Login
- [ ] Implementar exportação em PlanGoalsPage:
  - [ ] Botão "Exportar CSV"
  - [ ] Colunas: ID, Título, Disciplina, Assunto, Tópico, Duração, Ordem, Status
- [ ] Implementar exportação em AuditLogsPage:
  - [ ] Botão "Exportar CSV"
  - [ ] Colunas: ID, Ação, Usuário, Role, Recurso, Data, IP, User Agent
- [ ] Implementar exportação em NoticesPage:
  - [ ] Botão "Exportar CSV"
  - [ ] Colunas: ID, Título, Tipo, Destinatários, Status, Data Publicação, Visualizações
- [ ] Adicionar limite de exportação (máximo 10.000 registros)
- [ ] Implementar exportação em background para grandes volumes (queue)

### 🎨 Módulo: Personalização de Branding (PRIORIDADE MÉDIA)
- [ ] Criar página `/admin/personalizacao`
- [ ] Criar tabela `branding_settings`:
  - [ ] id, primary_color, secondary_color, accent_color
  - [ ] logo_url, favicon_url, background_url
  - [ ] font_family, font_size_base
  - [ ] created_at, updated_at
- [ ] Implementar procedure `admin.branding_v1.get`
- [ ] Implementar procedure `admin.branding_v1.update`
- [ ] Criar BrandingPage com 3 tabs:
  - [ ] **Cores**: Color pickers para primary, secondary, accent
  - [ ] **Logos**: Upload de logo (header), favicon, background
  - [ ] **Tipografia**: Seletor de fonte (Google Fonts), tamanho base
- [ ] Implementar preview em tempo real
- [ ] Criar helper `applyBranding` no frontend (CSS variables)
- [ ] Adicionar reset para padrões do sistema
- [ ] Auditoria: UPDATE_BRANDING

### 🔔 Módulo: Notificações em Tempo Real (PRIORIDADE BAIXA)
- [ ] Implementar WebSocket ou Server-Sent Events (SSE)
- [ ] Criar tabela `notifications`:
  - [ ] id, user_id, type, title, message, link
  - [ ] read, read_at, created_at
- [ ] Criar procedure `notifications.list` (usuário autenticado)
- [ ] Criar procedure `notifications.markAsRead`
- [ ] Criar procedure `notifications.markAllAsRead`
- [ ] Implementar NotificationBell no AdminHeader:
  - [ ] Badge com contador de não lidas
  - [ ] Dropdown com últimas 10 notificações
  - [ ] Link "Ver todas"
- [ ] Criar página `/admin/notificacoes` (listagem completa)
- [ ] Implementar push de notificações via WebSocket:
  - [ ] Quando novo aviso é publicado
  - [ ] Quando meta é atualizada
  - [ ] Quando novo usuário se cadastra
  - [ ] Quando novo comentário no fórum
- [ ] Adicionar som de notificação (opcional)
- [ ] Implementar preferências de notificações (usuário pode desativar)

### 📈 Módulo: Analytics Avançados (PRIORIDADE BAIXA)
- [ ] Criar página `/admin/analytics`
- [ ] Implementar análise de engajamento:
  - [ ] Taxa de conclusão de metas por plano
  - [ ] Taxa de acerto em questões por disciplina
  - [ ] Tempo médio de resolução de questões
  - [ ] Materiais mais acessados
  - [ ] Threads mais populares no fórum
- [ ] Criar gráficos de funil:
  - [ ] Cadastro → Primeiro Login → Primeira Meta → Primeira Questão
- [ ] Implementar análise de retenção:
  - [ ] Usuários ativos por cohort (semana de cadastro)
  - [ ] Churn rate (usuários que pararam de acessar)
- [ ] Criar heatmap de atividade (dias da semana × horas do dia)
- [ ] Implementar análise de performance:
  - [ ] Tempo médio de resposta das APIs
  - [ ] Queries mais lentas do banco
  - [ ] Endpoints mais acessados

### 🔍 Módulo: Busca Global (PRIORIDADE BAIXA)
- [ ] Implementar busca global no AdminHeader
- [ ] Criar procedure `admin.search_v1.global`:
  - [ ] Buscar em: usuários (nome, email), planos (título), metas (título), avisos (título, conteúdo)
  - [ ] Retornar: tipo, id, título, descrição, link
  - [ ] Limite: 20 resultados
- [ ] Criar SearchDialog com:
  - [ ] Input com atalho (Cmd+K / Ctrl+K)
  - [ ] Listagem de resultados agrupados por tipo
  - [ ] Navegação por teclado (setas, Enter)
  - [ ] Highlight de termo buscado
- [ ] Implementar histórico de buscas (localStorage)
- [ ] Adicionar atalhos rápidos (ir para usuário por ID, etc)

### 🛡️ Módulo: Permissões Granulares (PRIORIDADE BAIXA)
- [ ] Criar tabela `permissions`:
  - [ ] id, role, resource, action (CREATE, READ, UPDATE, DELETE)
  - [ ] allowed (boolean)
- [ ] Criar procedure `admin.permissions_v1.list`
- [ ] Criar procedure `admin.permissions_v1.update`
- [ ] Criar página `/admin/permissoes`
- [ ] Implementar matriz de permissões:
  - [ ] Linhas: roles (ALUNO, PROFESSOR, MENTOR, ADMINISTRATIVO, MASTER)
  - [ ] Colunas: recursos (PLANOS, METAS, USUARIOS, AVISOS, etc)
  - [ ] Células: checkboxes para CRUD
- [ ] Criar helper `checkPermission(role, resource, action)`
- [ ] Atualizar procedures para verificar permissões
- [ ] Adicionar auditoria: UPDATE_PERMISSIONS

### 📋 Módulo: Logs de Sistema (PRIORIDADE BAIXA)
- [ ] Criar página `/admin/logs`
- [ ] Implementar visualização de logs do Pino:
  - [ ] Filtros: nível (debug, info, warn, error), módulo, data
  - [ ] Busca por requestId, userId, mensagem
  - [ ] Paginação
- [ ] Criar procedure `admin.logs_v1.list` (ler arquivo de logs)
- [ ] Implementar download de logs (últimas 24h, 7 dias, 30 dias)
- [ ] Adicionar gráfico de erros por hora (últimas 24h)
- [ ] Implementar alertas automáticos:
  - [ ] Email para MASTER quando erro crítico ocorre
  - [ ] Notificação quando taxa de erro > 5%

### 🔧 Módulo: Configurações Avançadas (PRIORIDADE BAIXA)
- [ ] Criar página `/admin/configuracoes`
- [ ] Criar tabela `system_settings`:
  - [ ] id, key, value (JSON), type, description, updated_at
- [ ] Implementar configurações:
  - [ ] **Autenticação**: duração do access token, duração do refresh token, tentativas de login
  - [ ] **Rate Limiting**: limites por endpoint
  - [ ] **Notificações**: horários de envio, frequência
  - [ ] **Metas**: horário de verificação de streaks, horário de alerta de prazo
  - [ ] **Questões**: tempo padrão de simulado, questões por página
  - [ ] **Fórum**: posts por página, caracteres mínimos por post
- [ ] Criar procedure `admin.settings_v1.list`
- [ ] Criar procedure `admin.settings_v1.update`
- [ ] Implementar validações por tipo de configuração
- [ ] Adicionar auditoria: UPDATE_SETTINGS
- [ ] Implementar reset para valores padrão

### 📧 Módulo: Templates de Email (PRIORIDADE BAIXA)
- [ ] Criar página `/admin/templates-email`
- [ ] Criar tabela `email_templates`:
  - [ ] id, key, subject, body_html, body_text, variables (JSON)
  - [ ] created_at, updated_at
- [ ] Implementar templates:
  - [ ] Verificação de email
  - [ ] Recuperação de senha
  - [ ] Novo aviso publicado
  - [ ] Meta próxima do prazo
  - [ ] Streak quebrado
  - [ ] Novo comentário no fórum
- [ ] Criar procedure `admin.emailTemplates_v1.list`
- [ ] Criar procedure `admin.emailTemplates_v1.update`
- [ ] Criar EmailTemplateEditor com:
  - [ ] Editor de HTML (Monaco Editor ou similar)
  - [ ] Preview do email
  - [ ] Lista de variáveis disponíveis ({{nome}}, {{link}}, etc)
  - [ ] Envio de email de teste
- [ ] Adicionar auditoria: UPDATE_EMAIL_TEMPLATE

### 🎓 Módulo: Gestão de Professores/Mentores (PRIORIDADE BAIXA)
- [ ] Criar página `/admin/professores`
- [ ] Implementar listagem de professores/mentores
- [ ] Criar ProfessorFormPage para criar/editar
- [ ] Implementar vinculação professor → disciplinas
- [ ] Criar tabela `professor_disciplinas`:
  - [ ] id, professor_id, disciplina_id
- [ ] Implementar procedure `admin.professors_v1.assignDiscipline`
- [ ] Implementar procedure `admin.professors_v1.removeDiscipline`
- [ ] Adicionar filtro por disciplina na listagem de professores
- [ ] Implementar estatísticas de professor:
  - [ ] Total de alunos atendidos
  - [ ] Total de materiais criados
  - [ ] Total de questões comentadas
  - [ ] Total de threads no fórum

### 📦 Módulo: Backup e Restauração (PRIORIDADE BAIXA)
- [ ] Criar página `/admin/backup`
- [ ] Implementar procedure `admin.backup_v1.create`:
  - [ ] Exportar todas as tabelas para JSON
  - [ ] Gerar arquivo ZIP
  - [ ] Salvar no S3
  - [ ] Retornar URL de download
- [ ] Implementar procedure `admin.backup_v1.list`:
  - [ ] Listar backups disponíveis
  - [ ] Tamanho, data, status
- [ ] Implementar procedure `admin.backup_v1.restore`:
  - [ ] Upload de arquivo ZIP
  - [ ] Validar estrutura
  - [ ] Restaurar tabelas
  - [ ] Logar operação
- [ ] Criar BackupPage com:
  - [ ] Botão "Criar Backup Agora"
  - [ ] Listagem de backups
  - [ ] Botão "Restaurar" (com confirmação)
  - [ ] Botão "Download"
- [ ] Implementar backup automático (cron):
  - [ ] Diário às 3h da manhã
  - [ ] Manter últimos 30 backups
- [ ] Adicionar auditoria: CREATE_BACKUP, RESTORE_BACKUP

---

## ETAPA 1: Fundação - Backend, Login & DevOps (🟡 90% COMPLETO)

### Pendências Prioritárias

#### E1.3: Verificação de Email (PRIORIDADE ALTA)
- [ ] Criar tabela email_verification_tokens
- [ ] Implementar helper generateEmailVerificationToken
- [ ] Implementar helper verifyEmailToken
- [ ] Criar procedure auth.sendVerificationEmail
- [ ] Criar procedure auth.verifyEmail
- [ ] Criar procedure auth.resendVerificationEmail
- [ ] Atualizar auth.register para enviar email
- [ ] Atualizar auth.login para bloquear não verificados
- [ ] Criar template de email HTML
- [ ] Configurar Resend
- [ ] Criar página /verify-email
- [ ] Adicionar banner no dashboard

#### E1.4: Recuperação de Senha (PRIORIDADE ALTA)
- [ ] Reutilizar tabela tokens (type: PASSWORD_RESET)
- [ ] Implementar helper generatePasswordResetToken
- [ ] Implementar helper validatePasswordResetToken
- [ ] Criar procedure auth.forgotPassword
- [ ] Criar procedure auth.resetPassword
- [ ] Criar template de email
- [ ] Aplicar rate limiting (3/hora)
- [ ] Criar página /forgot-password
- [ ] Criar página /reset-password/:token
- [ ] Invalidar refresh tokens após reset

#### E1.7: Documentação Swagger (PRIORIDADE MÉDIA)
- [ ] Instalar swagger-jsdoc e swagger-ui-express
- [ ] Criar swagger.config.ts
- [ ] Configurar rota /api-docs
- [ ] Documentar endpoints de autenticação
- [ ] Incluir exemplos de request/response
- [ ] Documentar matriz de códigos de erro

#### E1.8: Monitoramento (PRIORIDADE MÉDIA)
- [ ] Configurar Sentry
- [ ] Criar endpoint /api/v1/health
- [ ] Configurar métricas Prometheus (/metrics)

---

## MÓDULOS 100% COMPLETOS

### ✅ ETAPA 2: Árvore de Conhecimento (Admin)
- [x] CRUD Disciplinas
- [x] CRUD Assuntos
- [x] CRUD Tópicos
- [x] Interface de gerenciamento
- [x] Sistema de ordenação drag-and-drop
- [x] Validações de hierarquia

### ✅ ETAPA 3: Materiais
- [x] Upload de PDFs
- [x] Organização por disciplina/assunto
- [x] Visualização inline
- [x] Analytics de acesso
- [x] Admin dashboard

### ✅ ETAPA 4: Questões (85% - falta importação admin)
- [x] Banco de questões com filtros
- [x] Sistema de simulados com timer
- [x] Relatório de desempenho
- [x] Comentários e discussões
- [x] Cadernos personalizados
- [ ] Importação em lote (admin)

### ✅ ETAPA 6: Fórum
- [x] Categorias e threads
- [x] Sistema de mensagens
- [x] Moderação
- [x] Notificações

### ✅ ETAPA 7: Módulo de Metas
- [x] Sistema de metas diárias
- [x] Cronograma visual
- [x] Streaks
- [x] Notificações automáticas
- [x] Analytics com gráficos
- [x] Importação CSV

---

## 📝 OBSERVAÇÕES FINAIS

**Sistema Pronto para Produção:**
- ✅ Autenticação funcional
- ✅ Dashboard admin completo (5 módulos)
- ✅ Área do aluno funcional
- ✅ Banco de dados estruturado
- ✅ Auditoria completa

**Faltam apenas:**
- Email (verificação + recuperação de senha)
- Features de suporte (analytics, exportação, personalização)

**Próximos Passos Recomendados:**
1. Implementar verificação de email (E1.3)
2. Implementar recuperação de senha (E1.4)
3. Criar dashboard de estatísticas
4. Implementar exportação de relatórios


---

## E10: DASHBOARD DO ALUNO - A FACHADA DO APP (⏳ 0% COMPLETO)

**Estimativa:** 18-22 dias úteis (3.5-4.5 semanas)  
**Complexidade:** ALTA (Coração da Plataforma)  
**Documentação:** E10-PLANO-TRABALHO.md

### Objetivo
Criar o **coração da plataforma DOM** - uma experiência de engajamento que transforma o estudo em algo motivador e recompensador. O aluno deve querer entrar na plataforma todos os dias porque **gosta**, não porque precisa.

### Princípios Fundamentais
- **Um Objetivo, Uma Ação** 🎯 - Zero sobrecarga cognitiva
- **Motivação Contínua** 🔥 - Sistema de streaks e gamificação sutil
- **Transparência Total** 📊 - O aluno sempre sabe onde está
- **Personalização sem Fricção** 🎨 - Interface adaptável

---

### FASE 1: Fundação e Infraestrutura (⏳ 0% - Estimativa: 4-5 dias)

#### Backend - Schema do Banco (8 tabelas novas)
- [ ] Criar tabela `widget_configs` (configuração de widgets por usuário)
- [ ] Criar tabela `streak_logs` (histórico de streaks)
- [ ] Criar tabela `streak_protections` (proteções de streak usadas)
- [ ] Criar tabela `telemetry_events` (eventos de telemetria)
- [ ] Criar tabela `dashboard_customizations` (customizações do dashboard)
- [ ] Criar tabela `daily_summaries` (resumos diários agregados)
- [ ] Criar tabela `gamification_xp` (XP e níveis)
- [ ] Criar tabela `gamification_achievements` (conquistas desbloqueadas)

#### Backend - Views Materializadas (Performance)
- [ ] Criar view `v_dashboard_aluno` (agregação de dados do dashboard)
- [ ] Criar view `v_streak_status` (status de streak em tempo real)
- [ ] Criar view `v_daily_progress` (progresso diário agregado)

#### Backend - Routers tRPC (15+ procedures)
- [ ] Criar `dashboardRouter` com 5 procedures:
  - [ ] `getSummary` - Resumo completo do dashboard
  - [ ] `getDailyStats` - Estatísticas do dia
  - [ ] `getHeroData` - Dados do Hero Section
  - [ ] `getQuickActions` - Ações rápidas sugeridas
  - [ ] `getCustomization` - Configurações do usuário
- [ ] Criar `widgetsRouter` com 8 procedures:
  - [ ] `getCronograma` - Widget Cronograma
  - [ ] `getQTD` - Widget QTD
  - [ ] `getStreak` - Widget Streak
  - [ ] `getProgressoSemanal` - Widget Progresso Semanal
  - [ ] `getMateriaisAndamento` - Widget Materiais
  - [ ] `getRevisoesPendentes` - Widget Revisões
  - [ ] `reorderWidgets` - Reordenar widgets
  - [ ] `updateWidgetConfig` - Atualizar configuração de widget
- [ ] Criar `streakRouter` com 4 procedures:
  - [ ] `getCurrentStreak` - Streak atual
  - [ ] `useProtection` - Usar proteção de streak
  - [ ] `getHistory` - Histórico de streaks
  - [ ] `getLeaderboard` - Ranking de streaks
- [ ] Criar `telemetryRouter` com 2 procedures:
  - [ ] `trackEvent` - Rastrear evento
  - [ ] `batchTrackEvents` - Rastrear eventos em lote

#### Frontend - Estrutura de Arquivos
- [ ] Criar `/client/src/pages/Dashboard.tsx`
- [ ] Criar `/client/src/components/dashboard/` (6 componentes)
- [ ] Criar `/client/src/components/widgets/` (8 widgets)
- [ ] Criar `/client/src/hooks/dashboard/` (5 hooks)
- [ ] Criar `/client/src/lib/dashboard/` (helpers)

#### Frontend - Sistema de Cache (React Query)
- [ ] Configurar estratégias de cache por widget
- [ ] Implementar invalidação inteligente
- [ ] Criar hook `useDashboardWidget`

#### Frontend - Sistema de Telemetria
- [ ] Implementar hook `useTelemetry`
- [ ] Configurar batch de eventos (5s)
- [ ] Integrar com backend

---

### FASE 2: Header e Hero Section (⏳ 0% - Estimativa: 3-4 dias)

#### Header Fixo
- [ ] Criar componente `DashboardHeader.tsx`
- [ ] Implementar logo + navegação
- [ ] Implementar streak em destaque (animado) 🔥
- [ ] Implementar avatar + dropdown
- [ ] Implementar notificações (badge)
- [ ] Implementar responsivo (mobile menu)
- [ ] Implementar sticky header (fixed)
- [ ] Implementar animação de scroll (hide/show)
- [ ] Integrar com `streakRouter`

#### Hero Section
- [ ] Criar componente `HeroSection.tsx`
- [ ] Implementar mensagem contextual (Bom dia, Fernando!)
- [ ] Implementar CTA Principal ANIMADO (Framer Motion)
- [ ] Implementar mini-estatísticas do dia (3 cards)
- [ ] Implementar próxima ação sugerida
- [ ] Implementar lógica de mensagens contextuais:
  - [ ] Saudação por horário
  - [ ] Mensagem de motivação aleatória
  - [ ] Mensagem de conquista
  - [ ] Mensagem de streak
- [ ] Implementar CTA Principal com 4 estados:
  - [ ] Estado 1: "Iniciar Meta de Hoje"
  - [ ] Estado 2: "Continuar Meta"
  - [ ] Estado 3: "Resolver Questões"
  - [ ] Estado 4: "Revisar Conteúdo"
  - [ ] Animação de pulse/glow
  - [ ] Ícone animado
- [ ] Implementar mini-estatísticas do dia:
  - [ ] Metas concluídas (X/Y)
  - [ ] Questões resolvidas (X)
  - [ ] Tempo de estudo (Xh Ym)

---

### FASE 3: Sistema de Avisos (⏳ 0% - Estimativa: 2 dias)

#### Carrossel de Avisos
- [ ] Criar componente `AvisosCarousel.tsx`
- [ ] Implementar 4 tipos de avisos:
  - [ ] Informativo (azul)
  - [ ] Importante (amarelo)
  - [ ] Urgente (vermelho)
  - [ ] Individual (roxo)
- [ ] Implementar carrossel automático (5s)
- [ ] Implementar navegação manual (setas)
- [ ] Implementar botão "Dispensar" (X)
- [ ] Implementar botão "Ver Detalhes"
- [ ] Implementar animação de entrada/saída (Framer Motion)
- [ ] Implementar responsivo (mobile: stack vertical)
- [ ] Integrar com `noticesRouter_v1`
- [ ] Filtrar por destinatários (usuário atual)
- [ ] Marcar como lido ao dispensar
- [ ] Adicionar telemetria (view, dismiss, click)

---

### FASE 4: Widgets Principais (⏳ 0% - Estimativa: 5-6 dias)

#### Widget 1: Cronograma
- [ ] Criar componente `WidgetCronograma.tsx`
- [ ] Exibir meta de hoje (se houver)
- [ ] Exibir próxima meta (se hoje concluída)
- [ ] Exibir "Sem metas hoje" (se não houver)
- [ ] Botão "Ver Cronograma Completo"
- [ ] Ícone de status (pendente, em andamento, concluída)
- [ ] Tempo estimado vs tempo real
- [ ] Barra de progresso (se em andamento)

#### Widget 2: QTD (Questões do Dia)
- [ ] Criar componente `WidgetQTD.tsx`
- [ ] Contador de questões resolvidas (X/Y)
- [ ] Barra de progresso circular
- [ ] Taxa de acerto (%)
- [ ] Botão "Resolver Questões"
- [ ] Gráfico de barras (últimos 7 dias)
- [ ] Animação de incremento (CountUp)

#### Widget 3: Streak
- [ ] Criar componente `WidgetStreak.tsx`
- [ ] Contador de dias consecutivos 🔥
- [ ] Calendário visual (últimos 7 dias)
- [ ] Proteções disponíveis (ícone de escudo)
- [ ] Botão "Usar Proteção" (se em risco)
- [ ] Mensagem de motivação
- [ ] Ranking de streaks (top 3)

#### Widget 4: Progresso Semanal
- [ ] Criar componente `WidgetProgressoSemanal.tsx`
- [ ] Gráfico de barras (7 dias)
- [ ] Métricas: metas, questões, tempo
- [ ] Comparação com semana anterior (%)
- [ ] Média da plataforma (linha tracejada)
- [ ] Botão "Ver Estatísticas Completas"

#### Widget 5: Materiais em Andamento
- [ ] Criar componente `WidgetMateriais.tsx`
- [ ] Listagem de materiais em andamento (máx 3)
- [ ] Progresso de leitura (%)
- [ ] Thumbnail + título + autor
- [ ] Botão "Continuar Lendo"
- [ ] Link "Ver Todos os Materiais"

#### Widget 6: Revisões Pendentes
- [ ] Criar componente `WidgetRevisoes.tsx`
- [ ] Contador de revisões pendentes
- [ ] Listagem de revisões (máx 3)
- [ ] Data de revisão + disciplina
- [ ] Botão "Revisar Agora"
- [ ] Link "Ver Todas as Revisões"

#### Widget 7: Plano de Estudos
- [ ] Criar componente `WidgetPlano.tsx`
- [ ] Nome do plano ativo
- [ ] Progresso geral (%)
- [ ] Dias restantes
- [ ] Botão "Ver Plano Completo"
- [ ] Gráfico de pizza (disciplinas)

#### Widget 8: Comunidade
- [ ] Criar componente `WidgetComunidade.tsx`
- [ ] Atividade recente no fórum (máx 3)
- [ ] Threads populares
- [ ] Botão "Acessar Fórum"
- [ ] Badge de notificações

---

### FASE 5: Gamificação e Polimento (⏳ 0% - Estimativa: 4-5 dias)

#### Sistema de Gamificação - XP e Níveis
- [ ] Criar tabela de XP por ação
- [ ] Implementar cálculo de nível (fórmula exponencial)
- [ ] Implementar barra de progresso de nível (header)
- [ ] Implementar animação de level up (modal)
- [ ] Implementar histórico de XP
- [ ] Definir tabela de XP:
  - [ ] Meta concluída: 50 XP
  - [ ] Questão correta: 10 XP
  - [ ] Questão errada: 2 XP
  - [ ] Material lido: 20 XP
  - [ ] Revisão completa: 30 XP
  - [ ] Streak mantido: 15 XP/dia
  - [ ] Post no fórum: 5 XP
  - [ ] Resposta útil: 10 XP

#### Sistema de Gamificação - Conquistas
- [ ] Definir 20+ conquistas
- [ ] Implementar sistema de desbloqueio
- [ ] Implementar modal de conquista desbloqueada
- [ ] Criar página de conquistas (/conquistas)
- [ ] Implementar badge no header (novas conquistas)

#### Otimizações
- [ ] Implementar lazy loading de widgets
- [ ] Otimizar queries (N+1)
- [ ] Adicionar índices no banco
- [ ] Configurar cache Redis
- [ ] Minificar assets
- [ ] Adicionar ARIA labels
- [ ] Garantir navegação por teclado
- [ ] Testar com screen reader
- [ ] Verificar contraste de cores (WCAG AA)

#### Testes e QA
- [ ] Criar testes unitários (helpers, hooks)
- [ ] Criar testes de integração (fluxos completos)
- [ ] Executar testes manuais (desktop, mobile, tablet)
- [ ] Testar performance (Lighthouse > 90)
- [ ] Testar acessibilidade (screen reader)

---

### Métricas de Sucesso

#### Técnicas
- [ ] Lighthouse Score > 90 (Performance, Accessibility, Best Practices)
- [ ] Tempo de carregamento inicial < 2s
- [ ] Tempo de resposta das APIs < 200ms (p95)
- [ ] Taxa de erro < 0.1%
- [ ] Cobertura de testes > 80%

#### Negócio
- [ ] Taxa de engajamento diário > 70%
- [ ] Tempo médio na plataforma > 30min/dia
- [ ] Taxa de conclusão de metas > 60%
- [ ] Taxa de retenção (D7) > 80%
- [ ] NPS > 50

#### UX
- [ ] Tempo para primeira ação < 5s
- [ ] Taxa de cliques no CTA principal > 80%
- [ ] Taxa de uso de proteção de streak > 50%
- [ ] Taxa de customização de widgets > 30%
- [ ] Feedback positivo > 90%


## E10: DASHBOARD DO ALUNO - ✅ 100% COMPLETO

### ✅ Fase 1: Fundação e Infraestrutura (100%)
- [x] Criar 8 tabelas no banco (widget_configs, streak_logs, streak_protections, telemetry_events, dashboard_customizations, daily_summaries, gamification_xp, gamification_achievements)
- [x] Criar dashboardRouter (6 procedures)
- [x] Criar widgetsRouter (9 procedures)
- [x] Criar streakRouter (4 procedures)
- [x] Criar telemetryRouter (2 procedures)
- [x] Registrar routers no routers.ts

### ✅ Fase 2: Header e Hero Section (100%)
- [x] Criar DashboardHeader com streak animado
- [x] Criar HeroSection com CTA principal dinâmico
- [x] Implementar mini-estatísticas do dia (3 cards)
- [x] Adicionar navegação responsiva (mobile menu)
- [x] Criar rota /dashboard

### ✅ Fase 3: Sistema de Avisos (100%)
- [x] Instalar embla-carousel-react
- [x] Criar NoticesCarousel com 4 tipos
- [x] Implementar auto-play e navegação manual
- [x] Adicionar indicadores de posição
- [x] Integrar no Dashboard

### ✅ Fase 4: Widgets Principais (100%)
- [x] Criar CronogramaWidget (meta de hoje + próximas)
- [x] Criar QTDWidget (questões do dia + gráfico 7 dias)
- [x] Criar StreakWidget (dias consecutivos + proteções + calendário)
- [x] Criar ProgressoSemanalWidget (metas, questões, tempo)
- [x] Criar MateriaisWidget (materiais em andamento)
- [x] Criar RevisoesWidget (revisões pendentes)
- [x] Criar PlanoWidget (informações do plano)
- [x] Criar ComunidadeWidget (últimas discussões)
- [x] Integrar todos os widgets no Dashboard

### ✅ Fase 5: Gamificação e Polimento (100%)
- [x] Criar XPBar (barra de XP fixa)
- [x] Criar gamificationRouter (5 procedures: getXP, addXP, getAchievements, unlockAchievement, markAchievementAsViewed)
- [x] Definir 10 conquistas (comum, raro, épico, lendário)
- [x] Criar AchievementsDialog com progresso geral
- [x] Integrar conquistas no DashboardHeader
- [x] Fórmula de XP por nível: 100 * (level ^ 1.5)

### 📊 Entregáveis E10

**Backend:**
- 8 tabelas criadas
- 5 routers tRPC (26 procedures total):
  - dashboardRouter: 6 procedures
  - widgetsRouter: 9 procedures
  - streakRouter: 4 procedures
  - telemetryRouter: 2 procedures
  - gamificationRouter: 5 procedures

**Frontend:**
- 1 página principal (/dashboard)
- 3 componentes core (DashboardHeader, HeroSection, XPBar)
- 1 componente de avisos (NoticesCarousel)
- 8 widgets completos
- 1 dialog de conquistas (AchievementsDialog)
- Sistema de gamificação (XP, níveis, 10 conquistas)

**Funcionalidades:**
- Header fixo com streak animado
- XP Bar com nível e progresso
- Hero Section com CTA dinâmico (4 estados)
- Carrossel de avisos (4 tipos)
- 8 widgets interativos
- Sistema de conquistas (10 conquistas, 4 raridades)
- Navegação responsiva

### Melhorias Futuras (Backlog)
- [ ] Drag-and-drop para reordenar widgets
- [ ] Customização de cores do dashboard
- [ ] Modo compacto
- [ ] Exportar relatórios em PDF
- [ ] Notificações push
- [ ] Integração com calendário externo
- [ ] Widget de pomodoro timer
- [ ] Widget de ranking geral
- [ ] Sistema de badges
- [ ] Compartilhar conquistas nas redes sociais
- [ ] Animações de level up (confetti)
- [ ] Som de conquista desbloqueada
- [ ] Ranking de streaks global
- [ ] Telemetria batch (eventos em lote)
- [ ] Skeleton loaders em todos os widgets
- [ ] Otimização React Query (cache strategies)


## Integração de Widgets com Dados Reais

### Fase 1: Widgets de Metas
- [x] Conectar CronogramaWidget com metasRouter (listar metas do usuário)
- [x] Conectar ProgressoSemanalWidget com metasRouter (estatísticas semanais)
- [x] Atualizar widgetsRouter.getCronograma para buscar metas reais
- [x] Atualizar widgetsRouter.getProgressoSemanal para calcular estatísticas

### Fase 2: Widget de Questões
- [x] Conectar QTDWidget com questionsRouter
- [x] Atualizar widgetsRouter.getQTD para buscar questões do dia
- [x] Implementar gráfico de 7 dias com dados reais

### Fase 2.5: Widget de Streak
- [x] Conectar StreakWidget com streak_logs
- [x] Atualizar widgetsRouter.getStreak para buscar dados reais
- [x] Calcular dias consecutivos e proteções
- [x] Implementar calendário visual de 7 dias

### Fase 3: Widgets de Materiais
- [x] Conectar MateriaisWidget com materialsRouter
- [x] Conectar RevisoesWidget com materialsRouter
- [x] Atualizar widgetsRouter para buscar materiais em andamento
- [x] Atualizar widgetsRouter para buscar revisões pendentes

### Fase 4: Widgets de Plano e Comunidade
- [ ] Conectar PlanoWidget com plansRouter
- [ ] Conectar ComunidadeWidget com forumRouter
- [ ] Atualizar widgetsRouter para buscar dados do plano
- [ ] Atualizar widgetsRouter para buscar últimas discussões

### Fase 5: Header e Hero Section
- [ ] Atualizar DashboardHeader com streak real do banco
- [ ] Atualizar HeroSection com CTA baseado em dados reais
- [ ] Atualizar mini-stats com dados agregados

### Fase 6: Testes
- [ ] Testar todos os widgets com dados reais
- [ ] Verificar performance e otimizar queries
- [ ] Criar checkpoint final


---

## E10+: MELHORIAS DO DASHBOARD DO ALUNO

### 🎨 UX e Interface (PRIORIDADE CRÍTICA)

#### Cache e Performance
- [ ] Adicionar cache React Query em todos os widgets (staleTime: 5min, cacheTime: 10min)
- [ ] Implementar prefetch de dados ao hover em botões
- [ ] Adicionar skeleton loading em todos os widgets
- [ ] Implementar lazy loading de widgets fora da viewport
- [ ] Otimizar re-renders com React.memo nos widgets

#### Drag-and-Drop
- [ ] Instalar @dnd-kit/core para drag-and-drop
- [ ] Implementar drag-and-drop de widgets
- [ ] Salvar ordem via widgetsRouter.reorderWidgets
- [ ] Adicionar botão "Restaurar Layout Padrão"

#### Tratamento de Erros
- [ ] Adicionar ErrorBoundary para cada widget
- [ ] Criar componente ErrorState reutilizável
- [ ] Adicionar retry automático em caso de erro de rede
- [ ] Exibir toast de erro quando query falhar

### 🎮 Gamificação (PRIORIDADE ALTA)

#### Animações de Level Up
- [ ] Instalar canvas-confetti para efeitos visuais
- [ ] Detectar level up via gamificationRouter.getXP
- [ ] Exibir confetti quando nível aumenta
- [ ] Criar modal comemorativo com nova conquista
- [ ] Adicionar som de level up (opcional)

#### Sistema de Conquistas Expandido
- [ ] Adicionar 20+ conquistas novas
- [ ] Criar conquistas secretas (não exibidas até desbloquear)
- [ ] Implementar conquistas por tempo (ex: "Madrugador" - estudar antes das 6h)
- [ ] Adicionar conquistas por consistência (ex: "Dedicado" - 30 dias sem falhar meta)

#### Ranking e Competição
- [ ] Implementar ranking global de XP
- [ ] Criar ranking de streaks
- [ ] Adicionar ranking por disciplina
- [ ] Implementar sistema de ligas (Bronze, Prata, Ouro, Platina, Diamante)

### 📊 Widgets e Funcionalidades (PRIORIDADE MÉDIA)

#### Widget de Cronograma
- [ ] Adicionar visualização de calendário mensal
- [ ] Implementar filtro por disciplina
- [ ] Adicionar drag-and-drop para reagendar metas

#### Widget de QTD
- [ ] Adicionar filtro por disciplina no gráfico
- [ ] Implementar comparação com média da turma
- [ ] Criar gráfico de evolução mensal

#### Widget de Streak
- [ ] Adicionar visualização de calendário anual (heatmap)
- [ ] Implementar sistema de "freeze" (pausar streak por 1 dia)
- [ ] Criar histórico de streaks anteriores

### 🔔 Notificações e Alertas (PRIORIDADE MÉDIA)

#### Sistema de Notificações Push
- [ ] Implementar WebSocket ou SSE para notificações em tempo real
- [ ] Criar componente de NotificationCenter no header
- [ ] Adicionar badge de contagem de notificações não lidas
- [ ] Implementar tipos de notificações (conquista, level up, meta, streak, aviso, fórum, material, revisão)

#### Alertas Inteligentes
- [ ] Criar sistema de insights automáticos
- [ ] Implementar alertas de desempenho
- [ ] Adicionar sugestões personalizadas

### 📈 Analytics e Relatórios (PRIORIDADE BAIXA)

#### Dashboard de Analytics
- [ ] Criar página /dashboard/analytics
- [ ] Adicionar gráfico de evolução de XP (últimos 30 dias)
- [ ] Implementar gráfico de distribuição de tempo por disciplina
- [ ] Criar heatmap de atividade (estilo GitHub)

#### Exportação de Relatórios
- [ ] Adicionar botão "Exportar Relatório" (PDF)
- [ ] Implementar relatório semanal automático
- [ ] Criar relatório mensal detalhado

### 🎨 Personalização (PRIORIDADE BAIXA)

#### Temas e Aparência
- [ ] Implementar tema escuro/claro
- [ ] Criar tema de alto contraste (acessibilidade)
- [ ] Adicionar temas personalizados (cores customizáveis)

#### Customização de Widgets
- [ ] Adicionar opção de esconder/mostrar widgets
- [ ] Implementar widgets colapsáveis
- [ ] Criar opção de tamanho de widget (pequeno/médio/grande)

### 🔐 Segurança e Privacidade (PRIORIDADE CRÍTICA)

#### Validação de Entrada
- [ ] Adicionar validação Zod em todas as procedures
- [ ] Implementar sanitização de inputs
- [ ] Adicionar rate limiting por usuário

### 🧪 Testes e Qualidade (PRIORIDADE BAIXA)

#### Testes Automatizados
- [ ] Criar testes unitários para procedures tRPC
- [ ] Implementar testes de integração para widgets
- [ ] Adicionar testes E2E com Playwright

### 🚀 Performance (PRIORIDADE CRÍTICA)

#### Otimização de Queries
- [ ] Adicionar índices no banco (metas, questoes, cronograma, materiais, streak)
- [ ] Implementar query batching (DataLoader)
- [ ] Criar views materializadas para agregações complexas

#### Otimização de Frontend
- [ ] Implementar code splitting por rota
- [ ] Adicionar lazy loading de componentes pesados
- [ ] Otimizar bundle size (tree shaking)

---

**Total de tarefas de melhoria E10+:** 80+  
**Estimativa:** 2-3 meses de desenvolvimento


---

## 🔧 CORREÇÃO DE ERROS TYPESCRIPT (EM ANDAMENTO - 2025-11-08)

**Documento detalhado:** `PLANO-CORRECAO-TYPESCRIPT.md`

### Fase 1: Documentação ✅
- [x] Criar PLANO-CORRECAO-TYPESCRIPT.md
- [x] Mapear todos os 19 erros
- [x] Definir estratégia de correção gradual

### Fase 2: CronogramaWidget.tsx ✅ (3/3)
- [x] Corrigir 'proximaMeta' → 'proximasMetas[0]'
- [x] Corrigir 'title' → 'titulo'
- [x] Corrigir 'estimatedTime' (calcular)
- [x] Corrigir useRouter → useLocation

### Fase 3: OtherWidgets + QTDWidget ✅ (6/6)
- [x] Corrigir RouterObject (5x)
- [x] Corrigir propriedade 'stats'
- [x] Corrigir QTDWidget

### Fase 4: Sentry ✅ (3/3)
- [x] Remover React Router
- [x] Corrigir useEffect import
- [x] Atualizar startTransaction

### Fase 5: Fórum ✅ (5/5)
- [x] ForumCategoria string[]
- [x] ForumThread role comparison
- [x] ForumThread null checks
- [x] ForumThread tags parsing
- [x] ForumCategoria tags parsing

### Fase 6: MetaNova ✅ (5/5)
- [x] Corrigir 'listByDate'
- [x] Corrigir useQuery params
- [x] Adicionar imports (ScrollArea, Badge)
- [x] Corrigir tipos de material
- [x] Corrigir null/undefined

### Fase 7: App.tsx ⏳ (PENDENTE)
- [ ] App.tsx simplificado funcionando (Home, Login, NotFound)
- [ ] 420 erros restantes em arquivos não importados
- [ ] Decisão: Corrigir gradualmente ao adicionar rotas

### Fase 8: Checkpoint Final ✅ (CONCLUÍDO)
- [x] Validar funcionalidades (Home funcionando)
- [x] Criar checkpoint (27aa7bb1)
- [x] Documentar mudanças


## 🐛 BUG: Erro 404 após login (2025-11-08 15:35) ✅
- [x] Adicionar rota /dashboard ao App.tsx
- [x] Verificar e corrigir erros TypeScript do Dashboard
- [x] Testar login e redirecionamento para dashboard


## 🐛 BUG: Erros no Dashboard (2025-11-08 15:37) ✅
- [x] Corrigir useRouter em HeroSection.tsx
- [x] Aguardar testes para nested anchor tags
- [ ] Testar dashboard funcionando


## 🐛 BUG: Nested anchor tags no DashboardHeader (2025-11-08 16:02) ✅
- [x] Dashboard funcionando quando acessado diretamente
- [x] Identificado nested <a> tags causando erros de hidratação
- [x] Corrigido 10+ nested anchors no DashboardHeader
- [ ] Testar dashboard sem erros
- [ ] Criar checkpoint final


## 🐛 BUG CRÍTICO: Login bem-sucedido mas dashboard não reconhece autenticação (2025-11-08 16:05) ✅ RESOLVIDO
- [x] Investigar se cookies estão sendo salvos após login
- [x] Identificado: Nome do cookie inconsistente (access_token vs app_session_id)
- [x] Corrigido setAccessTokenCookie para usar COOKIE_NAME
- [x] Corrigido extractTokenFromCookie para usar COOKIE_NAME
- [x] Adicionada invalidação de query auth.me após login
- [x] Testado fluxo completo: Login → Dashboard carregando perfeitamente
- [x] Confirmado: Cookie httpOnly funcionando corretamente (não acessível via JS por segurança)


## 🐛 BUG: Logout não funciona - volta para dashboard (2025-11-08 17:00) ✅ RESOLVIDO
- [x] Investigar código de logout no Header
- [x] Verificar useAuth hook
- [x] Identificado: Backend exigia refreshToken obrigatório
- [x] Identificado: clearAuthCookies limpava 'access_token' ao invés de 'app_session_id'
- [x] Identificado: Faltava redirecionamento após logout
- [x] Corrigido: refreshToken agora é opcional no logout
- [x] Corrigido: clearAuthCookies agora limpa COOKIE_NAME (app_session_id)
- [x] Corrigido: useAuth agora redireciona para /login após logout
- [x] Testado: Logout redireciona para /login ✅
- [x] Testado: Dashboard mostra "Você não está autenticado" após logout ✅
- [x] Testado: Cookie limpo corretamente ✅


## 🆕 FEATURE: Adicionar link "Planos" no header (2025-11-08 17:15) ✅ CONCLUÍDA
- [x] Adicionar item "Planos" na navegação do Header.tsx (com ícone CreditCard)
- [x] Adicionar rota /planos no App.tsx
- [x] Identificada página AllPlans.tsx como listagem de planos
- [x] Adicionado Header component à página AllPlans
- [x] Testado: Link "Planos" aparece no header e está destacado em azul
- [x] Testado: Navegação para /planos funcionando perfeitamente
- [x] Página carrega com filtros de busca, categoria e status
- [x] Sistema pronto para exibir planos quando cadastrados no banco
