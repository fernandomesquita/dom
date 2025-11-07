# 🎓 Sistema DOM-EARA V4

**Plataforma de Mentoria para Concursos Públicos com Metodologia EARA®**

Sistema completo de gestão de estudos para concursos públicos, incluindo cronograma inteligente, banco de questões, materiais organizados, fórum colaborativo e gamificação.

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação](#instalação)
- [Documentação](#documentação)
- [Status do Desenvolvimento](#status-do-desenvolvimento)
- [Contribuindo](#contribuindo)

---

## 🎯 Sobre o Projeto

O **Sistema DOM-EARA V4** é uma plataforma web full-stack para auxiliar estudantes de concursos públicos a organizarem seus estudos de forma eficiente usando a metodologia proprietária **EARA®** (Estudo, Avaliação, Revisão e Aprofundamento).

### Principais Funcionalidades

- 📚 **Árvore de Conhecimento** - Organização hierárquica de disciplinas, assuntos e tópicos
- 📝 **Banco de Questões** - Milhares de questões organizadas por banca, ano e dificuldade
- 📖 **Materiais de Estudo** - PDFs, vídeos e áudios estruturados
- 📅 **Cronograma Inteligente** - Algoritmo EARA® distribui estudos automaticamente
- 🎯 **Metas Personalizadas** - Defina e acompanhe objetivos
- 🏆 **Gamificação** - Sistema de Streak (QTD) para manter motivação
- 💬 **Fórum Colaborativo** - Tire dúvidas com outros concurseiros
- 💳 **Planos de Assinatura** - FREE, BASIC e PREMIUM

---

## 🛠️ Tecnologias

### Backend
- **Node.js** 22.13.0 + **TypeScript** 5.x
- **Express** 4.x - Servidor HTTP
- **tRPC** 11.x - Type-safe API
- **Drizzle ORM** - ORM para MySQL
- **MySQL** 8.0+ - Banco de dados relacional
- **JWT** - Autenticação stateless
- **bcrypt** - Hash de senhas

### Frontend
- **React** 19.x + **TypeScript**
- **Vite** 7.x - Build tool
- **Tailwind CSS** 4.x - Estilização
- **shadcn/ui** - Componentes UI
- **Wouter** - Roteamento
- **TanStack Query** - Cache e estado

### DevOps (Planejado)
- **GitHub Actions** - CI/CD
- **Sentry** - Error tracking
- **Pino/Winston** - Logging estruturado

---

## 🏗️ Arquitetura

### Autenticação

⚠️ **IMPORTANTE:** Este sistema **NÃO usa OAuth**. Usa autenticação simples com email e senha.

- **Access Token:** JWT com validade de 15 minutos
- **Refresh Token:** JWT com validade de 7 dias
- **Storage:** Cookies HTTP-only
- **Validações:** CPF (opcional), idade mínima 18 anos, força de senha

### Banco de Dados

24 tabelas organizadas em módulos:
- **Autenticação:** users, tokens, refresh_tokens
- **Pagamentos:** planos, assinaturas, pagamentos, webhooks_pagarme
- **Conteúdo:** disciplinas, assuntos, topicos, materiais, questoes
- **Social:** forum_topicos, forum_respostas, notices
- **Gamificação:** estatisticas_diarias, streak_questoes, progresso_disciplinas

Ver `drizzle/schema.ts` para detalhes completos.

---

## 📁 Estrutura do Projeto

```
dom-eara-v4/
├── client/                    # Frontend React
│   ├── public/               # Assets estáticos
│   └── src/
│       ├── _core/            # Hooks e utilitários core
│       ├── components/       # Componentes reutilizáveis
│       ├── pages/            # Páginas da aplicação
│       ├── contexts/         # React contexts
│       ├── lib/              # Bibliotecas (tRPC client)
│       └── App.tsx           # Roteamento principal
├── server/                    # Backend Node.js
│   ├── _core/                # Módulos core (auth, context, etc)
│   ├── routers/              # Routers tRPC
│   └── db.ts                 # Query helpers
├── drizzle/                   # Schema e migrations
│   └── schema.ts             # Definição das tabelas
├── shared/                    # Código compartilhado
├── storage/                   # Helpers S3
├── ERROS-CRITICOS.md         # ⚠️ LEIA ANTES DE MODIFICAR
├── LEIA-ME-DIARIAMENTE.md    # 📖 Sumário executivo
├── CHANGELOG.md              # 📝 Histórico de mudanças
└── todo.md                   # ✅ Tarefas do projeto
```

---

## 🚀 Instalação

### Pré-requisitos

- Node.js 22.13.0+
- MySQL 8.0+
- pnpm 10.4.1+

### Passos

1. **Clone o repositório:**
   ```bash
   git clone <url-do-repositorio>
   cd dom-eara-v4
   ```

2. **Instale as dependências:**
   ```bash
   pnpm install
   ```

3. **Configure as variáveis de ambiente:**
   
   As variáveis são injetadas automaticamente pela plataforma Manus:
   - `DATABASE_URL` - String de conexão MySQL
   - `JWT_SECRET` - Secret para JWT
   - `VITE_APP_TITLE` - Título da aplicação
   - Outras variáveis em `server/_core/env.ts`

4. **Execute as migrations:**
   ```bash
   pnpm db:push
   ```

5. **Inicie o servidor de desenvolvimento:**
   ```bash
   pnpm dev
   ```

6. **Acesse a aplicação:**
   ```
   http://localhost:3000
   ```

---

## 📚 Documentação

### Documentos Obrigatórios (Leia Antes de Desenvolver)

1. **[LEIA-ME-DIARIAMENTE.md](./LEIA-ME-DIARIAMENTE.md)** - Sumário executivo com erros críticos
2. **[ERROS-CRITICOS.md](./ERROS-CRITICOS.md)** - Documentação completa de erros e armadilhas
3. **[CHANGELOG.md](./CHANGELOG.md)** - Histórico de mudanças do projeto
4. **[todo.md](./todo.md)** - Lista de tarefas e progresso

### Especificações Originais

Localizadas em `/home/ubuntu/upload/`:
- `ESPECIFICACAO-GLOBAL-SISTEMA-DOM(1).md` - Visão geral do sistema
- `E1-ESPECIFICACAO-TECNICA-BACKEND-LP-LOGIN(1).md` - Especificação técnica E1
- `ESPECIFICACAO-BANCO-DADOS-COMPLETO(1).md` - Schema do banco
- `ESPECIFICACAO-MASTER-DOM-v2(1).md` - Especificação master
- `PADROES-API-E-CONTRATOS.md` - Padrões de API
- `LGPD-E-COMPLIANCE.md` - Conformidade LGPD

---

## 📊 Status do Desenvolvimento

### ✅ Etapa 1: Fundação (Completa)
- Banco de dados (24 tabelas)
- Autenticação simples (JWT)
- Landing Page, Login e Cadastro

### 🚧 Próximas Etapas
- **Etapa 2:** Dashboard e Perfil do Aluno
- **Etapa 3:** Gestão de Materiais
- **Etapa 4:** Sistema de Questões
- **Etapa 5:** Fórum Colaborativo
- **Etapa 6:** Metas e Cronograma
- **Etapa 7:** Gamificação
- **Etapa 8:** Planos e Pagamentos
- **Etapa 9:** Monitoramento e DevOps
- **Etapa 10:** Testes e Otimizações

Ver [todo.md](./todo.md) para detalhes completos.

---

## 🤝 Contribuindo

### Antes de Contribuir

1. **Leia OBRIGATORIAMENTE:**
   - `LEIA-ME-DIARIAMENTE.md`
   - `ERROS-CRITICOS.md`
   - `CHANGELOG.md`

2. **Verifique o todo.md** para ver tarefas disponíveis

3. **Siga as convenções:**
   - TypeScript strict mode
   - ESLint + Prettier
   - Commits semânticos
   - Nunca sobrescreva `ERROS-CRITICOS.md`

### Fluxo de Trabalho

1. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
2. Faça suas alterações
3. Atualize o `CHANGELOG.md`
4. Atualize o `todo.md`
5. Commit: `git commit -m "feat: adiciona nova funcionalidade"`
6. Push: `git push origin feature/nova-funcionalidade`
7. Abra um Pull Request

---

## 📄 Licença

Este projeto é proprietário. Todos os direitos reservados.

---

## 📞 Contato

Para dúvidas ou suporte, consulte a documentação interna ou entre em contato com a equipe de desenvolvimento.

---

**Última atualização:** 07/11/2025  
**Versão atual:** 0.1.0 (Checkpoint: 3cb59a47)
