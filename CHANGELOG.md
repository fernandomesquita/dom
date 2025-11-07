# 📝 CHANGELOG - Sistema DOM-EARA V4

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

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

### Etapa 2: Dashboard e Perfil do Aluno
- [ ] Dashboard do aluno com visão geral
- [ ] Página de perfil do usuário
- [ ] Edição de dados pessoais
- [ ] Upload de avatar

### Etapa 3: Gestão de Materiais
- [ ] CRUD de disciplinas, assuntos e tópicos
- [ ] Upload de materiais (PDF, vídeo, áudio)
- [ ] Visualização de materiais
- [ ] Controle de acesso por plano

### Etapa 4: Sistema de Questões
- [ ] CRUD de questões
- [ ] Resolução de questões
- [ ] Estatísticas de desempenho
- [ ] Filtros (banca, ano, dificuldade)

### Etapa 5: Fórum Colaborativo
- [ ] CRUD de tópicos e respostas
- [ ] Sistema de curtidas
- [ ] Busca no fórum
- [ ] Notificações

### Etapa 6: Metas e Cronograma
- [ ] CRUD de metas
- [ ] Geração de cronograma EARA®
- [ ] Acompanhamento de progresso
- [ ] Ajustes automáticos

### Etapa 7: Gamificação
- [ ] Sistema de Streak (QTD)
- [ ] Estatísticas diárias
- [ ] Progresso por disciplina/assunto
- [ ] Badges e conquistas

### Etapa 8: Planos e Pagamentos
- [ ] Integração com Pagar.me
- [ ] Checkout de planos
- [ ] Webhooks de pagamento
- [ ] Gestão de assinaturas

### Etapa 9: Monitoramento e DevOps
- [ ] Swagger/OpenAPI
- [ ] Sentry (error tracking)
- [ ] Logs estruturados
- [ ] CI/CD (GitHub Actions)

### Etapa 10: Testes e Otimizações
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

**Última atualização:** 07/11/2025
