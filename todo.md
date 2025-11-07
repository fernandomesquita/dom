# TODO - Sistema DOM-EARA V4

## ETAPA 1: Fundação - Backend, Login & DevOps (EM ANDAMENTO)

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
- [ ] CPF opcional no cadastro
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
