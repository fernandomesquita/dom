# Mapeamento da Estrutura do Portal DOM-EARA v4

**Autor:** Manus AI  
**Data:** 10/11/2025  
**Versão:** 1.2  
**Última Atualização:** 10/11/2025 - Adicionadas páginas de Simulados Admin e Criação Individual de Questões  

Este documento apresenta a estrutura completa de páginas do portal DOM-EARA v4, mapeando todas as rotas, conexões entre páginas e fluxos de navegação tanto para **alunos** quanto para **administradores**.

---

## 📊 Visão Geral

O portal DOM-EARA v4 está organizado em **duas áreas principais**:

1. **Portal do Aluno** - Interface voltada para estudantes e concurseiros
2. **Dashboard Administrativo** - Interface de gestão para equipe administrativa

**Estatísticas:**
- **Total de páginas:** 64
- **Páginas de aluno:** 27
- **Páginas administrativas:** 37
- **Rotas registradas:** 54+

---

## 🎓 Portal do Aluno

### 1. Autenticação e Cadastro

| Página | Rota | Descrição | Conexões |
|--------|------|-----------|----------|
| **Home** | `/` | Landing page institucional | → `/login`, `/cadastro`, `/planos` |
| **Login** | `/login` | Autenticação de alunos | → `/dashboard` (sucesso)<br>→ `/admin/login` (link equipe) |
| **Cadastro** | `/cadastro` | Registro de novos alunos | → `/login` (após cadastro) |

**Fluxo de autenticação:**
```
Home → Login → Dashboard
  ↓
Cadastro → Login → Dashboard
```

---

### 2. Dashboard Principal

| Página | Rota | Descrição | Conexões |
|--------|------|-----------|----------|
| **Dashboard** | `/dashboard` | Painel principal do aluno com widgets | → `/metas/cronograma`<br>→ `/questoes`<br>→ `/materiais`<br>→ `/forum`<br>→ `/meus-planos`<br>→ `/estatisticas`<br>→ `/perfil` |

**Widgets do Dashboard:**
- Cronograma de Metas (próximas 3 metas)
- Questões do Dia (QTD)
- Streak de Estudos
- Meu Plano (assinatura ativa)
- Comunidade (atividade do fórum)
- Avisos e Notificações

**Navegação principal (Header):**
- Início (`/dashboard`)
- Questões (`/questoes`)
- Simulados (`/simulados`)
- Cadernos (`/notebooks`)
- Estatísticas (`/estatisticas`)
- Materiais (`/materiais`)
- Planos (`/planos`)

---

### 3. Sistema de Planos

| Página | Rota | Descrição | Conexões |
|--------|------|-----------|----------|
| **Todos os Planos** | `/planos` | Listagem de planos disponíveis | → `/planos/:id` (detalhes)<br>→ `/login` (se não autenticado) |
| **Detalhes do Plano** | `/planos/:id` | Informações completas do plano | → `/meus-planos` (após matrícula)<br>← `/planos` (voltar) |
| **Meus Planos** | `/meus-planos` | Planos em que o aluno está matriculado | → `/metas/cronograma` (acessar cronograma)<br>← `/dashboard` |

**Fluxo de matrícula:**
```
/planos → /planos/:id → Botão "Matricular" → /meus-planos
```

---

### 4. Sistema de Metas e Cronograma

| Página | Rota | Descrição | Conexões |
|--------|------|-----------|----------|
| **Cronograma** | `/metas/cronograma`<br>`/metas`<br>`/cronograma` | Calendário de metas do aluno | → `/metas/:id` (detalhes da meta)<br>← `/dashboard` |
| **Detalhes da Meta** | `/metas/:id` | Informações e progresso da meta | → `/materiais` (materiais vinculados)<br>← `/metas/cronograma` |
| **Nova Meta** | `/metas/nova` | Criar meta personalizada | → `/metas/cronograma` (após criar)<br>← `/metas/cronograma` |
| **Importar Metas** | `/metas/importar` | Importar metas via Excel | → `/metas/cronograma` (após importar)<br>← `/metas/cronograma` |
| **Metas de Hoje** | `/metas/hoje` | Metas programadas para hoje | → `/metas/:id` (detalhes)<br>← `/dashboard` |
| **Metas por Plano** | `/metas/planos` | Metas agrupadas por plano | → `/metas/:id` (detalhes)<br>← `/metas/cronograma` |

**Fluxo de criação de meta:**
```
/metas/cronograma → Botão "Nova Meta" → /metas/nova → /metas/cronograma
```

---

### 5. Sistema de Questões

| Página | Rota | Descrição | Conexões |
|--------|------|-----------|----------|
| **Banco de Questões** | `/questoes` | Resolver questões com filtros | → `/questoes?disciplina=X` (filtros)<br>→ `/notebooks` (adicionar ao caderno)<br>← `/dashboard` |
| **Cadernos** | `/notebooks` | Cadernos de revisão (Revisão, Erros, Favoritos) | → `/questoes` (treinar)<br>← `/dashboard` |
| **Estatísticas** | `/estatisticas` | Gráficos de desempenho do aluno | → `/questoes` (treinar)<br>← `/dashboard` |

**Funcionalidades de Questões:**
- Filtros avançados (disciplina, assunto, tópico, dificuldade, banca, ano)
- Sistema de comentários
- Upvote/Downvote
- Adicionar a cadernos
- Sinalizar questão problemática
- Explicação após resposta

**Tipos de Cadernos:**
1. **Revisão** - Questões marcadas para revisar
2. **Erros** - Questões respondidas incorretamente
3. **Favoritos** - Questões favoritadas

---

### 6. Sistema de Simulados

| Página | Rota | Descrição | Conexões |
|--------|------|-----------|----------|
| **Simulados** | `/simulados`<br>`/exams` | Listar e criar simulados | → `/simulados/:id` (iniciar)<br>← `/dashboard` |
| **Fazer Simulado** | `/simulados/:id`<br>`/exams/:id` | Interface de resolução do simulado | → `/simulados/:id/relatorio` (finalizar)<br>← `/simulados` (abandonar) |
| **Relatório** | `/simulados/:id/relatorio`<br>`/exams/:id/report` | Resultado detalhado do simulado | → `/simulados` (novo simulado)<br>→ `/questoes` (treinar)<br>← `/simulados` |

**Fluxo de simulado:**
```
/simulados → Criar Simulado → /simulados/:id → Finalizar → /simulados/:id/relatorio
```

**Funcionalidades:**
- Gerador de simulados com filtros
- Cronômetro em tempo real
- Autosave de respostas
- Correção automática
- Estatísticas detalhadas (acertos, erros, tempo, nota)

---

### 7. Sistema de Materiais

| Página | Rota | Descrição | Conexões |
|--------|------|-----------|----------|
| **Materiais** | `/materiais` | Listagem de materiais de estudo | → `/materiais/:id` (detalhes)<br>→ `/materiais/favoritos` (favoritos)<br>← `/dashboard` |
| **Detalhes do Material** | `/materiais/:id` | Visualização e download de material | → `/materiais` (voltar)<br>→ `/materiais/favoritos` (favoritar)<br>← `/materiais` |
| **Favoritos** | `/materiais/favoritos` | Materiais favoritados pelo aluno | → `/materiais/:id` (detalhes)<br>← `/materiais` |
| **Analytics** | `/materiais/analytics` | Estatísticas de uso de materiais | ← `/materiais` |

**Tipos de Materiais:**
- **Vídeos** - YouTube, Vimeo, arquivos locais
- **PDFs** - Com DRM (marca d'água invisível)
- **Áudios** - MP3, arquivos locais

**Funcionalidades:**
- Sistema de upvote/downvote
- Rating (1-5 estrelas)
- Favoritar materiais
- Marcar como visto
- Download com DRM (materiais pagos)
- Comentários

---

### 8. Fórum

| Página | Rota | Descrição | Conexões |
|--------|------|-----------|----------|
| **Fórum** | `/forum` | Listagem de categorias e threads | → `/forum/categoria/:slug` (categoria)<br>→ `/forum/thread/:id` (thread)<br>→ `/forum/novo` (nova discussão)<br>← `/dashboard` |
| **Categoria** | `/forum/categoria/:slug` | Threads de uma categoria | → `/forum/thread/:id` (abrir thread)<br>← `/forum` |
| **Thread** | `/forum/thread/:id` | Discussão completa com respostas | → `/forum` (voltar)<br>← `/forum/categoria/:slug` |
| **Nova Discussão** | `/forum/novo` | Criar nova thread | → `/forum/thread/:id` (após criar)<br>← `/forum` |

**Funcionalidades:**
- Sistema de categorias
- Mensagens aninhadas (depth 1)
- Upvote/Downvote em mensagens
- Moderação (admin)
- Tags de threads

---

### 9. Perfil

| Página | Rota | Descrição | Conexões |
|--------|------|-----------|----------|
| **Perfil** | `/perfil` | Dados pessoais e configurações | → `/dashboard` (voltar)<br>← `/dashboard` |

**Dados editáveis:**
- Nome completo
- Email
- Telefone
- CPF
- Data de nascimento
- Senha

---

## 🔐 Dashboard Administrativo

### 1. Autenticação Admin

| Página | Rota | Descrição | Conexões |
|--------|------|-----------|----------|
| **Login Admin** | `/admin/login` | Autenticação administrativa (tema dark) | → `/admin/dashboard` (sucesso)<br>→ `/login` (link aluno) |

**Verificação de role:**
- Apenas roles `MASTER` e `ADMINISTRATIVO` podem acessar
- Deslogar automático se role inválido
- Visual diferenciado (tema dark profissional)

---

### 2. Dashboard Admin

| Página | Rota | Descrição | Conexões |
|--------|------|-----------|----------|
| **Dashboard** | `/admin`<br>`/admin/dashboard` | Painel principal administrativo | → `/admin/planos`<br>→ `/admin/metas`<br>→ `/admin/alunos`<br>→ `/admin/avisos`<br>→ `/admin/forum`<br>→ `/admin/questoes/importar`<br>→ `/admin/auditoria`<br>→ `/admin/configuracoes`<br>→ `/admin/estatisticas`<br>→ `/admin/simulados` |

**Menu lateral (AdminSidebar):**
- Dashboard
- Planos
- Metas (submenu: Dashboard, Nova Meta, Importar Lote)
- Questões (submenu: Nova Questão, Importar Lote)
- Simulados
- Estatísticas
- Logs de Auditoria
- Fórum
- Árvore do Conhecimento
- Configurações
- Personalização (apenas MASTER)

---

### 3. Gestão de Planos

| Página | Rota | Descrição | Conexões |
|--------|------|-----------|----------|
| **Listar Planos** | `/admin/planos` | Tabela de todos os planos | → `/admin/planos/novo` (criar)<br>→ `/admin/planos/:id/editar` (editar)<br>→ `/admin/planos/:id/metas` (metas)<br>← `/admin/dashboard` |
| **Novo Plano** | `/admin/planos/novo` | Formulário de criação | → `/admin/planos` (após criar)<br>← `/admin/planos` |
| **Editar Plano** | `/admin/planos/:id/editar` | Formulário de edição | → `/admin/planos` (após salvar)<br>← `/admin/planos` |
| **Metas do Plano** | `/admin/planos/:id/metas` | Metas vinculadas ao plano | → `/admin/metas/novo` (criar meta)<br>← `/admin/planos` |

**Funcionalidades:**
- CRUD completo de planos
- Vincular metas ao plano
- Configurar preço, categoria, status do edital
- Marcar como destaque (featured)
- Ocultar/exibir plano

---

### 4. Gestão de Metas

| Página | Rota | Descrição | Conexões |
|--------|------|-----------|----------|
| **Dashboard de Metas** | `/admin/metas` | Visão geral de metas | → `/admin/metas/novo` (criar)<br>→ `/admin/metas/:id/editar` (editar)<br>← `/admin/dashboard` |
| **Nova Meta** | `/admin/metas/novo` | Formulário de criação | → `/admin/metas` (após criar)<br>← `/admin/metas` |
| **Editar Meta** | `/admin/metas/:id/editar` | Formulário de edição | → `/admin/metas` (após salvar)<br>← `/admin/metas` |

**Funcionalidades:**
- CRUD completo de metas
- Vincular a planos
- Configurar tipo (leitura, questões, revisão, vídeo)
- Definir valor-alvo e duração
- Configurar recorrência

---

### 5. Gestão de Alunos

| Página | Rota | Descrição | Conexões |
|--------|------|-----------|----------|
| **Listar Alunos** | `/admin/alunos` | Tabela de todos os alunos | → `/admin/alunos/novo` (criar)<br>→ `/admin/alunos/:id` (perfil)<br>→ `/admin/alunos/:id/editar` (editar)<br>← `/admin/dashboard` |
| **Novo Aluno** | `/admin/alunos/novo` | Formulário de criação | → `/admin/alunos` (após criar)<br>← `/admin/alunos` |
| **Perfil do Aluno** | `/admin/alunos/:id` | Detalhes completos do aluno | → `/admin/alunos/:id/editar` (editar)<br>← `/admin/alunos` |
| **Editar Aluno** | `/admin/alunos/:id/editar` | Formulário de edição | → `/admin/alunos/:id` (após salvar)<br>← `/admin/alunos` |

**Funcionalidades:**
- CRUD completo de alunos
- Visualizar assinaturas ativas
- Visualizar progresso de metas
- Exportar lista de alunos (CSV)
- Impersonation (fazer login como aluno)

---

### 6. Gestão de Avisos

| Página | Rota | Descrição | Conexões |
|--------|------|-----------|----------|
| **Listar Avisos** | `/admin/avisos` | Tabela de avisos | → `/admin/avisos/novo` (criar)<br>→ `/admin/avisos/:id/editar` (editar)<br>→ `/admin/avisos/templates` (templates)<br>→ `/admin/avisos/agendamentos` (agendamentos)<br>→ `/admin/avisos/filas` (filas)<br>→ `/admin/avisos/analytics` (analytics)<br>← `/admin/dashboard` |
| **Novo Aviso** | `/admin/avisos/novo` | Formulário de criação | → `/admin/avisos` (após criar)<br>← `/admin/avisos` |
| **Editar Aviso** | `/admin/avisos/:id/editar` | Formulário de edição | → `/admin/avisos` (após salvar)<br>← `/admin/avisos` |
| **Templates** | `/admin/avisos/templates` | Templates de avisos | → `/admin/avisos/novo` (usar template)<br>← `/admin/avisos` |
| **Agendamentos** | `/admin/avisos/agendamentos` | Avisos agendados | → `/admin/avisos/:id/editar` (editar)<br>← `/admin/avisos` |
| **Filas** | `/admin/avisos/filas` | Fila de entrega de avisos | ← `/admin/avisos` |
| **Analytics** | `/admin/avisos/analytics` | Estatísticas de avisos | ← `/admin/avisos` |

**Tipos de Avisos:**
- Informativo (azul)
- Importante (amarelo)
- Urgente (vermelho)
- Individual (roxo)
- Premium (dourado)

**Formatos de Exibição:**
- Modal (centralizado)
- Banner (topo da página)
- Toast (notificação)

**Funcionalidades:**
- CRUD completo de avisos
- Sistema de templates
- Agendamento de avisos
- Segmentação de público
- Analytics de visualizações e cliques

---

### 7. Gestão do Fórum

| Página | Rota | Descrição | Conexões |
|--------|------|-----------|----------|
| **Dashboard do Fórum** | `/admin/forum` | Visão geral do fórum | → `/admin/forum/moderacao` (moderação)<br>← `/admin/dashboard` |
| **Moderação** | `/admin/forum/moderacao` | Moderar threads e mensagens | → `/forum/thread/:id` (visualizar)<br>← `/admin/forum` |

**Funcionalidades:**
- Visualizar threads recentes
- Moderar mensagens (aprovar/rejeitar)
- Banir usuários
- Deletar threads/mensagens
- Estatísticas do fórum

---

### 8. Gestão de Questões

| Página | Rota | Descrição | Conexões |
|--------|------|-----------|----------|
| **Nova Questão** | `/admin/questoes/nova` | Criação individual de questão | → `/admin/questoes` (após criar)<br>← `/admin/dashboard` |
| **Importar Questões** | `/admin/questoes/importar` | Importação em lote via Excel | ← `/admin/dashboard` |
| **Upload em Lote** | `/admin/questoes/upload` | Upload de múltiplos arquivos | ← `/admin/questoes/importar` |

**Funcionalidades de Nova Questão:**
- Formulário completo com KTreeSelector
- Vinculação obrigatória: Disciplina + Assunto + Tópico
- Suporte a múltipla escolha (5 alternativas) e Verdadeiro/Falso
- Metadados: banca, ano, instituição, dificuldade
- Explicação com texto e imagem
- Conectado ao tRPC (questions.create)

**Funcionalidades de Importação:**
- Importar questões via Excel (template fornecido)
- Preview de questões antes de importar
- Validação de dados
- Relatório de sucessos/erros

---

### 9. Gestão de Simulados

| Página | Rota | Descrição | Conexões |
|--------|------|-----------|----------|
| **Simulados Admin** | `/admin/simulados` | Gerenciar simulados | → Dialog de criação (criar)<br>← `/admin/dashboard` |

**Funcionalidades:**
- Dialog de criação funcional conectado ao tRPC (exams.create)
- Filtros: disciplina, dificuldade, quantidade de questões
- Seleção automática de questões aleatórias
- Configuração de tempo limite e nota mínima
- Listagem de simulados (TODO)
- Edição e exclusão (TODO)

---

### 10. Auditoria

| Página | Rota | Descrição | Conexões |
|--------|------|-----------|----------|
| **Logs de Auditoria** | `/admin/auditoria` | Registro de ações administrativas | ← `/admin/dashboard` |

**Funcionalidades:**
- Visualizar todas as ações administrativas
- Filtrar por usuário, ação, data
- Exportar logs (CSV)
- Detalhes de cada ação (antes/depois)

---

### 11. Configurações

| Página | Rota | Descrição | Conexões |
|--------|------|-----------|----------|
| **Configurações Gerais** | `/admin/configuracoes` | Configurações do sistema | → `/admin/sidebar` (gerenciar sidebar)<br>← `/admin/dashboard` |
| **Gerenciar Sidebar** | `/admin/sidebar` | CRUD de links da sidebar do aluno | ← `/admin/configuracoes` |

**Funcionalidades de Configurações:**
- Nome da plataforma
- Logo
- Cores do tema
- Configurações de email
- Configurações de notificações

**Funcionalidades de Sidebar:**
- CRUD completo de links
- Drag-and-drop para reordenar
- Configurar visibilidade
- Ícones personalizados

---

### 12. Árvore do Conhecimento (Taxonomia)

| Página | Rota | Descrição | Conexões |
|--------|------|-----------|----------|
| **Taxonomia** | `/admin/arvore` | Gestão de Disciplinas, Assuntos e Tópicos | → `/admin/arvore/historico` (histórico)<br>← `/admin/dashboard` |
| **Histórico de Importações** | `/admin/arvore/historico` | Listagem de todas as importações | ← `/admin/arvore` |

**Funcionalidades da Taxonomia:**
- **3 Tabs:** Disciplinas, Assuntos, Tópicos
- CRUD completo para cada nível
- Drag-and-drop para ordenar (GripVertical icon)
- Seletor de cor para disciplinas
- Toggle de status (ativo/inativo)
- Hierarquia visual (disciplina → assunto → tópico)

**Sistema de Importação em Batch:**
- Botão "Download Template" - Gera Excel com 3 sheets
- Botão "Importar Excel" - Abre dialog de importação
- Preview visual com validação de hierarquia
- Resumo: "X disciplinas, Y assuntos, Z tópicos"
- Botão "Confirmar Importação" após preview
- Códigos gerados automaticamente (sem campo no template)
- Registro em audit_logs (TAXONOMIA_IMPORT)

**Função Desfazer:**
- Botão "Desfazer Última Importação" na página principal
- Botão individual "Desfazer" por importação no histórico
- Soft delete (marca como inativo)
- Registro em audit_logs (TAXONOMIA_UNDO)

**Página de Histórico:**
- Tabela com todas as importações
- Colunas: Data, Batch ID, Disciplinas, Assuntos, Tópicos, Status, Ações
- Formatação de datas relativas ("há 2 horas") com date-fns
- Badge colorido de status (Ativo/Desfeito)
- Botão "Ver Histórico" na página principal

**Tabela de Controle:**
- `taxonomia_imports` - Rastreamento de importações
  * id, batch_id, totais, status, imported_by, created_at
  * undone_at, undone_by (para rastrear desfazer)

**Integração com Auditoria:**
- Filtro "Taxonomia" na AuditLogsPage
- Ações: TAXONOMIA_IMPORT, TAXONOMIA_UNDO
- Badges coloridos específicos

---

### 13. Estatísticas Admin

| Página | Rota | Descrição | Conexões |
|--------|------|-----------|----------|
| **Estatísticas** | `/admin/estatisticas` | Métricas da plataforma | ← `/admin/dashboard` |

**Métricas exibidas:**
- Total de usuários e usuários ativos (últimos 30 dias)
- Questões respondidas (total e este mês)
- Metas ativas e concluídas
- Atividade no fórum (threads e posts)

**Gráficos (Recharts):**
1. **Crescimento de Usuários** - LineChart dos últimos 6 meses
2. **Atividade Diária** - LineChart de questões respondidas (últimos 30 dias)

**Tabela:**
- Top 10 usuários mais ativos (questões respondidas + taxa de acerto)

---

## 🔗 Fluxos de Navegação Principais

### Fluxo do Aluno (Primeiro Acesso)

```
1. Home (/) 
   ↓
2. Cadastro (/cadastro)
   ↓
3. Login (/login)
   ↓
4. Dashboard (/dashboard)
   ↓
5. Explorar Planos (/planos)
   ↓
6. Detalhes do Plano (/planos/:id)
   ↓
7. Matricular → Meus Planos (/meus-planos)
   ↓
8. Acessar Cronograma (/metas/cronograma)
   ↓
9. Resolver Questões (/questoes)
   ↓
10. Fazer Simulado (/simulados)
```

### Fluxo do Aluno (Uso Diário)

```
Dashboard (/dashboard)
   ├─→ Ver Metas de Hoje → /metas/hoje
   ├─→ Resolver Questões → /questoes
   ├─→ Fazer Simulado → /simulados
   ├─→ Estudar Materiais → /materiais
   ├─→ Participar do Fórum → /forum
   └─→ Ver Estatísticas → /estatisticas
```

### Fluxo do Admin (Gestão de Planos)

```
Admin Dashboard (/admin/dashboard)
   ↓
Planos (/admin/planos)
   ↓
Novo Plano (/admin/planos/novo)
   ↓
Criar Metas do Plano (/admin/planos/:id/metas)
   ↓
Nova Meta (/admin/metas/novo)
   ↓
Voltar para Planos (/admin/planos)
```

### Fluxo do Admin (Gestão de Avisos)

```
Admin Dashboard (/admin/dashboard)
   ↓
Avisos (/admin/avisos)
   ↓
Novo Aviso (/admin/avisos/novo)
   ├─→ Usar Template (/admin/avisos/templates)
   ├─→ Agendar Aviso (/admin/avisos/agendamentos)
   └─→ Ver Analytics (/admin/avisos/analytics)
```

---

## 📱 Componentes de Layout

### Layouts de Aluno

| Componente | Usado em | Descrição |
|------------|----------|-----------|
| **Header** | Todas as páginas de aluno | Navegação principal + perfil |
| **StudentLayout** | Dashboard, Questões, Materiais, Fórum | Layout com sidebar + header |
| **Footer** | Todas as páginas de aluno | Footer padrão |

### Layouts Admin

| Componente | Usado em | Descrição |
|------------|----------|-----------|
| **AdminLayout** | Todas as páginas admin | Layout com sidebar dark + breadcrumbs |
| **AdminSidebar** | Todas as páginas admin | Menu lateral administrativo |

---

## 🎨 Diferenças Visuais

### Portal do Aluno
- **Tema:** Claro (fundo branco)
- **Cor primária:** Azul (#3b82f6)
- **Navegação:** Header fixo no topo
- **Sidebar:** Lateral esquerda (links úteis)

### Dashboard Admin
- **Tema:** Dark (fundo escuro)
- **Cor primária:** Roxo/Índigo (#8b5cf6)
- **Navegação:** Sidebar fixa à esquerda
- **Breadcrumbs:** Navegação hierárquica

---

## 📊 Estatísticas de Páginas

### Por Categoria

| Categoria | Quantidade | Percentual |
|-----------|------------|------------|
| **Admin** | 33 | 55% |
| **Aluno** | 27 | 45% |
| **Total** | 60 | 100% |

### Por Funcionalidade (Aluno)

| Funcionalidade | Páginas | Rotas |
|----------------|---------|-------|
| Autenticação | 3 | `/`, `/login`, `/cadastro` |
| Dashboard | 1 | `/dashboard` |
| Planos | 3 | `/planos`, `/planos/:id`, `/meus-planos` |
| Metas | 6 | `/metas/*` |
| Questões | 3 | `/questoes`, `/notebooks`, `/estatisticas` |
| Simulados | 3 | `/simulados`, `/simulados/:id`, `/simulados/:id/relatorio` |
| Materiais | 4 | `/materiais`, `/materiais/:id`, `/materiais/favoritos`, `/materiais/analytics` |
| Fórum | 4 | `/forum`, `/forum/categoria/:slug`, `/forum/thread/:id`, `/forum/novo` |
| Perfil | 1 | `/perfil` |

### Por Funcionalidade (Admin)

| Funcionalidade | Páginas | Rotas |
|----------------|---------|-------|
| Autenticação | 1 | `/admin/login` |
| Dashboard | 1 | `/admin/dashboard` |
| Planos | 4 | `/admin/planos/*` |
| Metas | 3 | `/admin/metas/*` |
| Alunos | 4 | `/admin/alunos/*` |
| Avisos | 7 | `/admin/avisos/*` |
| Fórum | 2 | `/admin/forum/*` |
| Questões | 2 | `/admin/questoes/*` |
| Simulados | 1 | `/admin/simulados` |
| Auditoria | 1 | `/admin/auditoria` |
| Configurações | 2 | `/admin/configuracoes`, `/admin/sidebar` |
| Estatísticas | 1 | `/admin/estatisticas` |

---

## 🔐 Controle de Acesso

### Páginas Públicas (sem autenticação)

- `/` - Home
- `/login` - Login de alunos
- `/admin/login` - Login administrativo
- `/cadastro` - Cadastro de alunos
- `/planos` - Listagem de planos
- `/planos/:id` - Detalhes do plano
- `/404` - Página não encontrada

### Páginas Protegidas (requer autenticação)

**Todas as demais páginas** requerem autenticação via JWT.

### Páginas Admin (requer role MASTER ou ADMINISTRATIVO)

**Todas as páginas `/admin/*`** exceto `/admin/login` requerem role `MASTER` ou `ADMINISTRATIVO`.

**Middleware de proteção:**
- `adminGuard.ts` - Middleware Express que verifica role antes de permitir acesso
- Redirect automático para `/admin/login` se não autorizado

---

## 🚀 Próximas Páginas Planejadas

### Portal do Aluno

1. **Verificação de Email** - `/verify-email/:token`
2. **Recuperação de Senha** - `/forgot-password`, `/reset-password/:token`
3. **Configurações** - `/configuracoes`
4. **Notificações** - `/notificacoes`

### Dashboard Admin

1. **Dashboard de Analytics** - `/admin/analytics` (KPIs agregados)
2. **Gestão de Materiais** - `/admin/materiais` (CRUD completo)
3. **Relatórios** - `/admin/relatorios` (exportação avançada)
4. **Personalização** - `/admin/personalizacao` (branding)

---

## 📝 Notas Técnicas

### Roteamento

- **Biblioteca:** Wouter (lightweight router para React)
- **Arquivo principal:** `client/src/App.tsx`
- **Total de rotas registradas:** 50+

### Navegação

- **Hook principal:** `useLocation()` (wouter)
- **Programática:** `setLocation(path)`
- **Links:** `<Link href={path}>` ou `<a href={path}>`

### Proteção de Rotas

- **Autenticação:** Verificada via hook `useAuth()`
- **Redirect:** Automático para `/login` se não autenticado
- **Admin:** Middleware `adminGuard` + verificação de role no frontend

### Estado Global

- **Autenticação:** Context API (`useAuth`)
- **Tema:** Context API (`useTheme`)
- **Queries:** tRPC + React Query

---

## 🎯 Conclusão

O portal DOM-EARA v4 possui uma **estrutura robusta e bem organizada**, com **60 páginas** divididas entre **portal do aluno (27)** e **dashboard administrativo (33)**. A navegação é intuitiva, com fluxos bem definidos e proteção adequada de rotas sensíveis.

**Destaques:**
- ✅ Separação clara entre área de aluno e admin
- ✅ Autenticação diferenciada (Login vs AdminLogin)
- ✅ Proteção de rotas via middleware e hooks
- ✅ Navegação consistente (Header + Sidebar)
- ✅ Fluxos bem definidos para cada funcionalidade
- ✅ 50+ rotas registradas e funcionais

**Próximos passos sugeridos:**
1. Implementar páginas de verificação de email e recuperação de senha
2. Criar dashboard de analytics admin com KPIs agregados
3. Adicionar CRUD completo de materiais no admin
4. Implementar sistema de relatórios avançados

---

**Documento gerado automaticamente por Manus AI**  
**Versão:** 1.0 | **Data:** 10/11/2025
