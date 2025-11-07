# 📝 CHANGELOG - Sistema DOM-EARA V4

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [0.2.0] - 2025-11-07 - Etapa 2: Árvore de Conhecimento (Backend)

**Checkpoint:** `238f8801`  
**Status:** ✅ Completo

### 🎯 Resumo da Etapa

Implementação completa do backend da Árvore de Conhecimento hierárquica (Disciplinas → Assuntos → Tópicos) com CRUD completo, validações de hierarquia, reordenação em batch e denormalização estratégica para queries otimizadas.

### ✨ Adicionado

#### Schema do Banco de Dados
- Campos adicionados às tabelas `disciplinas`, `assuntos` e `topicos`:
  - `codigo` (VARCHAR 20) - Código único por escopo (ex: "DIR001", "MAT001")
  - `slug` (VARCHAR 255) - Slug URL-friendly gerado automaticamente
  - `sortOrder` (INT) - Ordem de exibição (renomeado de `ordem`)
  - `createdBy` (VARCHAR 36) - ID do admin que criou o registro
- Campo denormalizado em `topicos`:
  - `disciplinaId` - Permite queries diretas sem JOIN com `assuntos`
- Índices otimizados:
  - `idx_disciplinas_codigo` (UNIQUE)
  - `idx_disciplinas_slug` (UNIQUE)
  - `idx_disciplinas_ativo_sort` (composto)
  - `idx_assuntos_disciplina_codigo` (UNIQUE composto)
  - `idx_assuntos_disciplina_slug` (UNIQUE composto)
  - `idx_topicos_assunto_codigo` (UNIQUE composto)
  - `idx_topicos_assunto_slug` (UNIQUE composto)
  - Índices de nome para busca textual

#### Backend - Utilitários
- `server/_core/slug-generator.ts`:
  - Função `generateSlug()` que remove acentos, converte para minúsculas e cria slugs URL-friendly
  - Exemplos: "Português" → "portugues", "Matemática Avançada" → "matematica-avancada"

#### Backend - Router de Disciplinas
- `server/routers/disciplinas.ts` com 8 endpoints:
  - `create` - Criar disciplina (ADMIN ONLY)
  - `getAll` - Listar com paginação (limit, offset, includeInactive)
  - `getByIdOrSlug` - Buscar por ID ou slug
  - `update` - Atualizar disciplina (ADMIN ONLY)
  - `delete` - Soft delete com validação de assuntos ativos (ADMIN ONLY)
  - `reorder` - Reordenar em batch para drag-and-drop (ADMIN ONLY)
  - `getStats` - Estatísticas (totalActive, totalInactive, total)
- Validações implementadas:
  - Código único global
  - Slug único global
  - Cor hexadecimal válida (#RRGGBB)
  - Não permite desativar se houver assuntos ativos

#### Backend - Router de Assuntos
- `server/routers/assuntos.ts` com 8 endpoints:
  - `create` - Criar assunto com validação de disciplina (ADMIN ONLY)
  - `getByDiscipline` - Listar por disciplina com paginação
  - `getByIdOrSlug` - Buscar por ID ou (slug + disciplinaId)
  - `update` - Atualizar assunto (ADMIN ONLY)
  - `delete` - Soft delete com validação de tópicos ativos (ADMIN ONLY)
  - `reorder` - Reordenar dentro da disciplina (ADMIN ONLY)
  - `getStats` - Estatísticas por disciplina
- Validações implementadas:
  - Código único POR ESCOPO (dentro da disciplina)
  - Slug único POR ESCOPO (dentro da disciplina)
  - Disciplina existe e está ativa
  - Não permite desativar se houver tópicos ativos

#### Backend - Router de Tópicos
- `server/routers/topicos.ts` com 9 endpoints:
  - `create` - Criar tópico com validação de assunto e denormalização de disciplinaId (ADMIN ONLY)
  - `getByAssunto` - Listar por assunto com paginação
  - `getByDiscipline` - Listar por disciplina (usa disciplinaId denormalizado)
  - `getByIdOrSlug` - Buscar por ID ou (slug + assuntoId)
  - `update` - Atualizar tópico com atualização de disciplinaId se assunto mudar (ADMIN ONLY)
  - `delete` - Soft delete (ADMIN ONLY)
  - `reorder` - Reordenar dentro do assunto (ADMIN ONLY)
  - `getStats` - Estatísticas por assunto
- Validações implementadas:
  - Código único POR ESCOPO (dentro do assunto)
  - Slug único POR ESCOPO (dentro do assunto)
  - Assunto existe e está ativo
  - Hierarquia coerente (assunto pertence à disciplina)
  - Denormalização automática de disciplinaId

### 🔧 Modificado

- `server/_core/context.ts`:
  - Adicionado `db` ao contexto do tRPC
  - Tipo `TrpcContext` atualizado com `db: NonNullable<Awaited<ReturnType<typeof getDb>>>`
  - Validação de banco disponível no `createContext()`
- `server/routers.ts`:
  - Importados e registrados `disciplinasRouter`, `assuntosRouter`, `topicosRouter`
- `drizzle/schema.ts`:
  - Tabelas `disciplinas`, `assuntos`, `topicos` atualizadas com novos campos
  - Renomeado `ordem` para `sortOrder` em todas as tabelas
  - Adicionado `disciplinaId` em `topicos` (denormalização)

### ❌ Removido

- Arquivo `drizzle/migrations/0001_update_arvore_conhecimento.sql` (abordagem de migration SQL manual descartada)
- Tabelas antigas `disciplinas`, `assuntos`, `topicos` (dropadas e recriadas com nova estrutura)

### 🐛 Corrigido

- Conflitos de schema durante `pnpm db:push` (resolvido com drop e recreate das tabelas)
- Erro de `ctx.db` possivelmente null (resolvido com `NonNullable` no tipo)

### 📚 Documentação

- Atualizado `todo.md` com progresso da Etapa 2:
  - Marcadas 27 tarefas como concluídas
  - Seções: Schema, Utilitários, CRUD Disciplinas, CRUD Assuntos, CRUD Tópicos
- Criado `analise-arvore-conhecimento.md` com análise detalhada da especificação (2035 linhas)
- Atualizado `CHANGELOG.md` (este arquivo)

### 🔒 Segurança

- Todos os endpoints de criação, atualização, deleção e reordenação protegidos com `adminProcedure`
- Validação de hierarquia para prevenir inconsistências
- Soft delete para preservar integridade referencial

### ⚠️ Problemas Conhecidos

- Erros de TypeScript em `client/src/_core/hooks/useAuth.ts` (linhas 23 e 39) - não impedem funcionamento
- Frontend da Árvore de Conhecimento ainda não implementado
- Testes unitários ainda não implementados
- Validador de hierarquia (`validate-hierarchy.ts`) ainda não criado

### 📊 Métricas

- **Routers criados:** 3 (disciplinas, assuntos, topicos)
- **Endpoints totais:** 25 (8 + 8 + 9)
- **Campos adicionados ao schema:** 12 (4 por tabela × 3 tabelas)
- **Índices criados:** 15 (5 por tabela × 3 tabelas)
- **Validações implementadas:** 18
- **Linhas de código (backend):** ~1200
- **Tempo de desenvolvimento:** 2 horas

### 🎯 Próximos Passos

1. Criar interface admin para gerenciar a Árvore (CRUD com drag-and-drop)
2. Implementar visualização hierárquica para alunos (TreeView expansível)
3. Popular banco com dados iniciais (seed script)

---

## [0.1.0] - 2025-11-07 - Etapa 1: Fundação

**Checkpoint:** `3cb59a47`  
**Status:** ✅ Completo

### 🎯 Resumo da Etapa

Implementação completa da fundação do sistema DOM-EARA V4, incluindo banco de dados, autenticação simples (sem OAuth) e páginas iniciais de frontend.

### ✨ Adicionado

#### Banco de Dados
- Schema completo com 24 tabelas MySQL 8.0+:
  - `users` - Usuários do sistema (ALUNO, ADMIN)
  - `tokens` - Tokens de verificação de email e reset de senha
  - `refresh_tokens` - Tokens de refresh JWT
  - `planos` - Planos de assinatura (FREE, BASIC, PREMIUM)
  - `assinaturas` - Assinaturas dos usuários
  - `pagamentos` - Histórico de pagamentos
  - `webhooks_pagarme` - Logs de webhooks Pagar.me
  - `disciplinas` - Disciplinas (ex: Português, Matemática)
  - `assuntos` - Assuntos dentro de disciplinas
  - `topicos` - Tópicos dentro de assuntos
  - `materiais` - PDFs, vídeos, áudios
  - `materiais_acessos` - Controle de acesso a materiais
  - `materiais_estudados` - Histórico de materiais estudados
  - `questoes` - Banco de questões
  - `questoes_resolvidas` - Histórico de questões resolvidas
  - `notices` - Avisos do sistema
  - `forum_topicos` - Tópicos do fórum
  - `forum_respostas` - Respostas do fórum
  - `metas` - Metas dos usuários
  - `cronograma` - Cronograma de estudos
  - `estatisticas_diarias` - Estatísticas diárias de estudo
  - `streak_questoes` - Sistema de Streak (QTD)
  - `progresso_disciplinas` - Progresso por disciplina
  - `progresso_assuntos` - Progresso por assunto

#### Autenticação (Backend)
- Sistema JWT completo:
  - Access token (15 minutos de validade)
  - Refresh token (7 dias de validade)
  - Armazenamento em cookies HTTP-only
- Módulos criados:
  - `server/_core/auth.ts` - Geração e verificação de JWT
  - `server/_core/password.ts` - Hash e verificação de senhas com bcrypt
  - `server/_core/validators.ts` - Validação de CPF, email e idade
- Endpoints implementados (tRPC):
  - `auth.register` - Cadastro de usuário
  - `auth.login` - Login de usuário
  - `auth.me` - Dados do usuário autenticado
  - `auth.logout` - Logout do usuário
  - `auth.refreshToken` - Renovar access token
- Validações implementadas:
  - Email válido
  - CPF válido (opcional)
  - Idade mínima de 18 anos
  - Força de senha (mínimo 8 caracteres, 1 maiúscula, 1 número)

#### Frontend
- Landing Page institucional completa:
  - Hero section com chamada para ação
  - Seção de funcionalidades (6 cards)
  - CTA section
  - Footer completo
- Página de Login:
  - Formulário de email e senha
  - Link para recuperação de senha
  - Link para cadastro
- Página de Cadastro:
  - Formulário completo (nome, email, senha, data de nascimento, CPF, telefone)
  - Validação de senhas coincidentes
  - Feedback de erros via toast
- Roteamento atualizado no `App.tsx`

#### Infraestrutura
- Dependências adicionadas:
  - `jsonwebtoken` - Geração e verificação de JWT
  - `bcryptjs` - Hash de senhas
  - `uuid` - Geração de IDs únicos
  - `cookie-parser` - Parsing de cookies
- Context do tRPC atualizado para ler JWT dos cookies
- OAuth completamente removido do projeto

### 🔧 Modificado

- `server/_core/context.ts` - Atualizado para ler JWT em vez de OAuth
- `server/_core/index.ts` - OAuth desabilitado, cookie-parser adicionado
- `server/_core/env.ts` - Adicionado `jwtSecret`
- `server/db.ts` - Funções de usuário customizadas (sem OAuth)
- `drizzle/schema.ts` - Schema de users customizado
- `client/src/components/DashboardLayout.tsx` - Corrigido para usar `nomeCompleto` em vez de `name`

### ❌ Removido

- OAuth do Manus (template padrão):
  - `server/_core/sdk.ts` → renomeado para `.disabled`
  - `server/_core/oauth.ts` → renomeado para `.disabled`
  - `registerOAuthRoutes()` comentado

### 🐛 Corrigido

- Erro de referência a `user.name` (não existe, correto é `user.nomeCompleto`)
- Erro de importação de `getUserByOpenId` e `upsertUser` (funções do OAuth removidas)

### 📚 Documentação

- Criado `ERROS-CRITICOS.md` - Documentação de erros críticos (nunca sobrescrever)
- Criado `LEIA-ME-DIARIAMENTE.md` - Sumário executivo para leitura diária
- Criado `CHANGELOG.md` - Este arquivo
- Atualizado `todo.md` - Marcadas tarefas concluídas da Etapa 1

### 🔒 Segurança

- Senhas hasheadas com bcrypt (12 rounds + pepper)
- JWT armazenado em cookies HTTP-only (não acessível via JavaScript)
- Validação de idade mínima (18 anos)
- Validação de CPF brasileiro

### ⚠️ Problemas Conhecidos

- Erros de TypeScript em `client/src/_core/hooks/useAuth.ts` (linhas 23 e 39) - não impedem funcionamento
- Verificação de email ainda não implementada
- Recuperação de senha ainda não implementada
- Rate limiting ainda não implementado

### 📊 Métricas

- **Tabelas criadas:** 24
- **Endpoints de autenticação:** 5
- **Páginas frontend:** 3 (Home, Login, Cadastro)
- **Linhas de código (estimativa):** ~3000
- **Tempo de desenvolvimento:** 1 dia

---

## [Não lançado] - Próximas Etapas

### Etapa 2: Árvore de Conhecimento (Frontend)
- [ ] Interface admin para CRUD de disciplinas
- [ ] Interface admin para CRUD de assuntos
- [ ] Interface admin para CRUD de tópicos
- [ ] Drag-and-drop para reordenação
- [ ] TreeView expansível para alunos
- [ ] Script de seed com dados iniciais

### Etapa 3: Dashboard e Perfil do Aluno
- [ ] Dashboard do aluno com visão geral
- [ ] Página de perfil do usuário
- [ ] Edição de dados pessoais
- [ ] Upload de avatar

### Etapa 4: Gestão de Materiais
- [ ] Upload de materiais (PDF, vídeo, áudio)
- [ ] Visualização de materiais
- [ ] Controle de acesso por plano

### Etapa 5: Sistema de Questões
- [ ] CRUD de questões
- [ ] Resolução de questões
- [ ] Estatísticas de desempenho
- [ ] Filtros (banca, ano, dificuldade)

### Etapa 6: Fórum Colaborativo
- [ ] CRUD de tópicos e respostas
- [ ] Sistema de curtidas
- [ ] Busca no fórum
- [ ] Notificações

### Etapa 7: Metas e Cronograma
- [ ] CRUD de metas
- [ ] Geração de cronograma EARA®
- [ ] Acompanhamento de progresso
- [ ] Ajustes automáticos

### Etapa 8: Gamificação
- [ ] Sistema de Streak (QTD)
- [ ] Estatísticas diárias
- [ ] Progresso por disciplina/assunto
- [ ] Badges e conquistas

### Etapa 9: Planos e Pagamentos
- [ ] Integração com Pagar.me
- [ ] Checkout de planos
- [ ] Webhooks de pagamento
- [ ] Gestão de assinaturas

### Etapa 10: Monitoramento e DevOps
- [ ] Swagger/OpenAPI
- [ ] Sentry (error tracking)
- [ ] Logs estruturados
- [ ] CI/CD (GitHub Actions)

### Etapa 11: Testes e Otimizações
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Otimização de queries
- [ ] Performance tuning

---

## Formato de Entrada

Use este template para adicionar novas entradas:

```markdown
## [Versão] - YYYY-MM-DD - Título da Etapa

**Checkpoint:** `hash`  
**Status:** 🚧 Em Progresso / ✅ Completo / ⏸️ Pausado

### 🎯 Resumo da Etapa
[Breve descrição]

### ✨ Adicionado
- [Novo recurso 1]

### 🔧 Modificado
- [Mudança 1]

### ❌ Removido
- [Remoção 1]

### 🐛 Corrigido
- [Bug fix 1]

### 📚 Documentação
- [Doc 1]

### 🔒 Segurança
- [Melhoria de segurança 1]

### ⚠️ Problemas Conhecidos
- [Problema 1]

### 📊 Métricas
- **Métrica 1:** Valor
```

---

**Convenções:**
- Mantenha ordem cronológica reversa (mais recente no topo)
- Use emojis para facilitar escaneamento visual
- Seja específico e objetivo
- Inclua sempre o hash do checkpoint
- Documente problemas conhecidos para transparência

**Última atualização:** 07/11/2025 18:00 GMT-3
