# Arquitetura do Sistema DOM-EARA V4

**Autor:** Manus AI  
**Data:** 2025-01-07

---

## Visão Geral

O Sistema DOM-EARA V4 é uma plataforma de mentoria para concursos públicos construída com arquitetura moderna de full-stack TypeScript. O sistema utiliza tRPC para comunicação type-safe entre frontend e backend, Drizzle ORM para acesso ao banco de dados MySQL/TiDB e React 19 com Tailwind 4 para interface do usuário.

A arquitetura é modular, com cada funcionalidade principal (Materiais, Metas, Questões, Fórum) implementada como módulo independente com seu próprio schema, routers e páginas frontend.

---

## Stack Tecnológico

### Frontend
- **React 19:** Biblioteca UI com suporte a Server Components e Actions
- **Tailwind CSS 4:** Framework CSS utility-first
- **shadcn/ui:** Componentes React acessíveis e customizáveis
- **Wouter:** Router leve para React (alternativa ao react-router-dom)
- **TanStack Query (via tRPC):** Gerenciamento de estado assíncrono
- **Vite:** Build tool e dev server

### Backend
- **Node.js 22:** Runtime JavaScript
- **Express 4:** Framework web minimalista
- **tRPC 11:** Framework RPC type-safe
- **Drizzle ORM:** ORM TypeScript-first para SQL
- **JWT (jsonwebtoken):** Autenticação via tokens
- **bcryptjs:** Hashing de senhas

### Banco de Dados
- **MySQL 8.0+ / TiDB:** Banco relacional com suporte a JSON e índices otimizados

### Infraestrutura
- **Manus Platform:** Plataforma de hospedagem e deployment
- **S3 (via Manus):** Armazenamento de arquivos (PDFs, imagens, vídeos)
- **Socket.IO:** WebSocket para comunicação real-time (opcional)

---

## Estrutura de Diretórios

```
/home/ubuntu/dom-eara-v4/
├── client/                    # Frontend React
│   ├── public/                # Assets estáticos
│   └── src/
│       ├── pages/             # Páginas da aplicação
│       ├── components/        # Componentes reutilizáveis
│       ├── contexts/          # React contexts
│       ├── hooks/             # Custom hooks
│       ├── lib/               # Utilitários (trpc.ts)
│       ├── App.tsx            # Roteamento principal
│       ├── main.tsx           # Entry point
│       └── index.css          # Estilos globais
├── server/                    # Backend Express + tRPC
│   ├── _core/                 # Infraestrutura base
│   │   ├── auth.ts            # JWT generation/verification
│   │   ├── context.ts         # tRPC context
│   │   ├── trpc.ts            # tRPC setup
│   │   ├── env.ts             # Environment variables
│   │   └── index.ts           # Express server
│   ├── routers/               # tRPC routers
│   │   ├── metasPlanos.ts
│   │   ├── metasMetas.ts
│   │   ├── metasBatchImport.ts
│   │   ├── metasAnalytics.ts
│   │   ├── ktree.ts
│   │   ├── materials.ts
│   │   └── ...
│   ├── helpers/               # Business logic helpers
│   │   ├── metasNumeracao.ts
│   │   ├── metasRevisao.ts
│   │   └── metasDistribuicao.ts
│   ├── db.ts                  # Database connection
│   └── routers.ts             # Router registry
├── drizzle/                   # Database schema
│   ├── schema.ts              # Main schema
│   ├── schema-metas.ts        # Metas module schema
│   ├── schema-materials-v4.ts # Materials module schema
│   ├── schema-questions.ts    # Questions module schema
│   ├── schema-forum.ts        # Forum module schema
│   ├── schema-avisos.ts       # Notices module schema
│   └── migrations/            # SQL migrations
├── scripts/                   # Utility scripts
│   ├── seed-metas.mjs
│   ├── seed-materials.mjs
│   └── ...
├── docs/                      # Documentation
│   ├── MODULO-METAS.md
│   ├── HISTORICO-COMPLETO.md
│   ├── ARQUITETURA.md
│   ├── DECISOES-CRITICAS.md
│   └── ...
├── todo.md                    # Task tracking
├── CHANGELOG.md               # Version history
├── package.json               # Dependencies
├── drizzle.config.ts          # Drizzle configuration
├── tsconfig.json              # TypeScript configuration
└── vite.config.ts             # Vite configuration
```

---

## Fluxo de Dados

### 1. Requisição do Cliente

```
[Cliente React] → [tRPC Client] → [HTTP Request] → [Express Server] → [tRPC Router] → [Procedure] → [Database]
```

### 2. Resposta do Servidor

```
[Database] → [Procedure] → [tRPC Router] → [HTTP Response] → [tRPC Client] → [React Query Cache] → [UI Update]
```

### 3. Autenticação

```
[Login Form] → [auth.login procedure] → [Validate credentials] → [Generate JWT] → [Set HTTP-only cookie] → [Return user data]
```

### 4. Autorização

```
[Protected Procedure] → [Extract JWT from cookie] → [Verify JWT] → [Fetch user from DB] → [Inject ctx.user] → [Execute procedure]
```

---

## Módulos do Sistema

### 1. Módulo de Autenticação

**Responsabilidade:** Gerenciar login, logout, refresh tokens e sessões.

**Componentes:**
- `server/_core/auth.ts`: Geração e verificação de JWT
- `server/_core/password.ts`: Hashing de senhas com bcrypt
- `server/_core/validators.ts`: Validação de CPF, email, idade
- `client/src/pages/Login.tsx`: Interface de login
- `client/src/pages/Cadastro.tsx`: Interface de cadastro

**Fluxo:**
1. Usuário submete email + senha
2. Backend valida credenciais e gera JWT (access + refresh)
3. Tokens armazenados em cookies HTTP-only
4. Frontend redireciona para dashboard
5. Requisições subsequentes incluem cookies automaticamente

**Decisões de Arquitetura:**
- JWT em vez de OAuth para simplificar MVP
- Access token curto (15min) + refresh token longo (7 dias)
- Cookies HTTP-only para segurança contra XSS

### 2. Módulo de Árvore de Conhecimento

**Responsabilidade:** Hierarquia Disciplinas → Assuntos → Tópicos.

**Componentes:**
- `drizzle/schema.ts`: Tabelas `disciplinas`, `assuntos`, `topicos`
- `server/routers/disciplinas.ts`: CRUD de disciplinas (8 endpoints)
- `server/routers/assuntos.ts`: CRUD de assuntos (8 endpoints)
- `server/routers/topicos.ts`: CRUD de tópicos (9 endpoints)
- `server/_core/slug-generator.ts`: Geração de slugs URL-friendly

**Fluxo:**
1. Admin cria disciplina (ex: "Direito Constitucional")
2. Sistema gera código único (ex: "DIR001") e slug (ex: "direito-constitucional")
3. Admin cria assuntos dentro da disciplina
4. Admin cria tópicos dentro dos assuntos
5. Sistema mantém denormalização (tópico.disciplinaId) para queries otimizadas

**Decisões de Arquitetura:**
- Código único POR ESCOPO (assunto.codigo único dentro da disciplina)
- Slug único POR ESCOPO (assunto.slug único dentro da disciplina)
- Denormalização de `disciplinaId` em `topicos` para performance
- Soft delete para preservar integridade referencial

### 3. Módulo de Materiais V4.0

**Responsabilidade:** Gerenciar PDFs, vídeos, áudios com DRM e engajamento.

**Componentes:**
- `drizzle/schema-materials-v4.ts`: 10 tabelas (materials, materialItems, materialLinks, etc.)
- `server/routers/materials.ts`: 15 procedures (7 admin + 8 aluno)
- `server/utils/pdf-drm.ts`: Sistema de marca d'água invisível
- `client/src/pages/Materiais.tsx`: Listagem pública
- `client/src/pages/MaterialDetalhes.tsx`: Detalhes + player
- `client/src/pages/AdminMateriais.tsx`: CRUD admin
- `client/src/pages/MaterialsAnalytics.tsx`: Analytics

**Fluxo:**
1. Admin cria material (título, descrição, categoria, tipo)
2. Admin vincula material à Árvore de Conhecimento (disciplina → assunto → tópico)
3. Aluno acessa listagem pública (sem autenticação para SEO)
4. Aluno clica em material e visualiza detalhes
5. Sistema registra visualização (de-duplicado por dia)
6. Aluno baixa PDF → sistema adiciona marca d'água invisível com dados do usuário
7. Aluno interage (upvote, rating, favoritar, marcar como visto)

**Decisões de Arquitetura:**
- Procedures públicos para visualização + protegidos para engajamento
- DRM invisível com cor quase branca (98%), fonte pequena (4-6pt), opacidade baixa (15-30%)
- Marca d'água apenas em materiais pagos
- De-duplicação de visualizações por dia (unique index em materialViews)

### 4. Módulo de Metas (Cronograma de Estudos)

**Responsabilidade:** Cronograma de estudos com revisão espaçada e analytics.

**Componentes:**
- `drizzle/schema-metas.ts`: 8 tabelas (metas_planos_estudo, metas_cronograma, etc.)
- `server/routers/metasPlanos.ts`: CRUD de planos (7 endpoints)
- `server/routers/metasMetas.ts`: CRUD de metas (13 endpoints)
- `server/routers/metasBatchImport.ts`: Import via Excel (1 endpoint)
- `server/routers/metasAnalytics.ts`: Analytics (7 endpoints)
- `server/routers/ktree.ts`: Autocomplete de taxonomia (4 endpoints)
- `server/helpers/metasNumeracao.ts`: Numeração sequencial (#001, #001.1)
- `server/helpers/metasRevisao.ts`: Revisão espaçada (1, 7, 30 dias)
- `server/helpers/metasDistribuicao.ts`: Distribuição inteligente
- `client/src/pages/MetasPlanos.tsx`: Listagem de planos
- `client/src/pages/MetasCronograma.tsx`: Calendário mensal
- `client/src/pages/MetasHoje.tsx`: Metas do dia com timer
- `client/src/pages/MetaDetalhes.tsx`: Detalhes da meta
- `client/src/pages/MetasImport.tsx`: Import via Excel
- `client/src/pages/MetasDashboard.tsx`: Analytics admin
- `client/src/pages/MetaNova.tsx`: Criação manual com autocomplete
- `client/src/components/KTreeSelector.tsx`: Autocomplete customizado

**Fluxo:**
1. Aluno cria plano de estudo (horas/dia, dias disponíveis)
2. Aluno importa metas via Excel OU cria manualmente
3. Sistema distribui metas automaticamente respeitando capacidade diária
4. Aluno acessa "Metas de Hoje" e vê cards com timer
5. Aluno conclui meta → sistema gera 3 revisões (1, 7, 30 dias) + marca materiais como vistos
6. Aluno omite meta → sistema redistribui automaticamente
7. Admin acessa dashboard e vê analytics (taxa de conclusão, metas mais omitidas, etc.)

**Decisões de Arquitetura:**
- Prefixo `metas_cronograma_*` para evitar conflito com módulo de gamificação
- Numeração sequencial única (#001, #001.1, #001.1.1) para organização
- Revisão espaçada automática baseada em curva de esquecimento de Ebbinghaus
- Distribuição inteligente com bitmask de dias disponíveis (compacto e eficiente)
- Autocomplete customizado de taxonomia (Popover + ScrollArea + Search)
- Validação de conflitos antecipada (sugere próximo slot disponível)
- Integração com módulo de materiais (auto-update ao concluir meta)

---

## Padrões de Código

### 1. Procedures tRPC

```typescript
// Procedure protegida (requer autenticação)
create: protectedProcedure
  .input(
    z.object({
      planoId: z.string(),
      tipo: z.enum(["ESTUDO", "QUESTOES", "REVISAO"]),
      duracaoPlanejadaMin: z.number().min(15).max(240),
      // ...
    })
  )
  .mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Lógica de negócio
    const meta = await db.insert(metasCronograma).values({
      ...input,
      userId: ctx.user.id,
      status: "PENDENTE",
    });

    return meta;
  }),
```

### 2. Queries Otimizadas

```typescript
// Evitar N+1 queries
const metas = await db
  .select()
  .from(metasCronograma)
  .leftJoin(metasPlanos, eq(metasCronograma.planoId, metasPlanos.id))
  .where(eq(metasCronograma.userId, ctx.user.id));
```

### 3. Validações Zod

```typescript
// Validação de input com mensagens customizadas
const createMetaSchema = z.object({
  tipo: z.enum(["ESTUDO", "QUESTOES", "REVISAO"], {
    errorMap: () => ({ message: "Tipo inválido" }),
  }),
  duracaoPlanejadaMin: z
    .number()
    .min(15, "Duração mínima de 15 minutos")
    .max(240, "Duração máxima de 240 minutos"),
});
```

### 4. Componentes React

```typescript
// Componente com tRPC hooks
export default function MetasHoje() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Query
  const metasQuery = trpc.metasMetas.listByDate.useQuery({
    planoId: "...",
    date: new Date().toISOString().split("T")[0],
  });

  // Mutation
  const completeMutation = trpc.metasMetas.complete.useMutation({
    onSuccess: () => {
      toast.success("Meta concluída!");
      metasQuery.refetch();
    },
  });

  return (
    <div>
      {metasQuery.data?.map((meta) => (
        <Card key={meta.id}>
          <Button onClick={() => completeMutation.mutate({ id: meta.id })}>
            Concluir
          </Button>
        </Card>
      ))}
    </div>
  );
}
```

---

## Segurança

### 1. Autenticação e Autorização

- JWT armazenado em cookies HTTP-only (protege contra XSS)
- Access token curto (15min) + refresh token longo (7 dias)
- Procedures protegidas com `protectedProcedure` (requer autenticação)
- Procedures admin com `adminProcedure` (requer role admin)

### 2. Validação de Inputs

- Todos os inputs validados com Zod
- Validação de CPF, email, idade no backend
- Sanitização de strings para prevenir SQL injection (Drizzle ORM)

### 3. DRM de Materiais

- Marca d'água invisível em PDFs pagos
- Dados do usuário (nome, CPF, email, telefone) embedados no PDF
- Fingerprint SHA-256 único por download
- Rastreamento de downloads com timestamp

### 4. Rate Limiting (Futuro)

- Limitar requisições por IP/usuário para prevenir abuse
- Implementar com middleware Express (express-rate-limit)

---

## Performance

### 1. Queries Otimizadas

- Índices em colunas frequentemente consultadas
- Evitar N+1 queries com JOINs
- Denormalização estratégica (ex: `disciplinaId` em `topicos`)

### 2. Caching (Futuro)

- Cache Redis para queries frequentes (ex: metas do dia)
- TTL de 5 minutos para estatísticas do dashboard
- Invalidar cache ao criar/atualizar/deletar

### 3. Paginação

- Listagens com limit/offset
- Infinite scroll no frontend (futuro)

### 4. Lazy Loading

- Carregar materiais vinculados sob demanda
- Lazy loading de imagens com Intersection Observer

---

## Escalabilidade

### 1. Horizontal Scaling

- Backend stateless (JWT em cookies, sem sessões em memória)
- Múltiplas instâncias do servidor com load balancer

### 2. Database Sharding (Futuro)

- Sharding por `userId` para distribuir carga
- TiDB suporta sharding nativo

### 3. CDN para Assets

- S3 + CloudFront para PDFs, imagens, vídeos
- Cache agressivo com content hashing

---

## Monitoramento e Logs

### 1. Logs Estruturados

- Winston para logging estruturado
- Níveis: error, warn, info, debug
- Logs em JSON para facilitar parsing

### 2. Métricas (Futuro)

- Prometheus para métricas de performance
- Grafana para visualização
- Métricas: latência, throughput, taxa de erro

### 3. Error Tracking (Futuro)

- Sentry para rastreamento de erros
- Alertas automáticos para erros críticos

---

## Testes

### 1. Testes Unitários (Futuro)

- Vitest para testes de helpers e procedures
- Cobertura mínima de 80%

### 2. Testes de Integração (Futuro)

- Testar fluxos completos (criar plano → importar metas → concluir)
- Banco de dados de teste separado

### 3. Testes E2E (Futuro)

- Playwright para testes de interface
- Testar fluxos críticos (login, criação de meta, conclusão)

---

## Deployment

### 1. Ambiente de Desenvolvimento

- Vite dev server (HMR)
- tsx watch para backend (hot reload)
- MySQL local ou TiDB cloud

### 2. Ambiente de Produção

- Build otimizado com Vite
- Node.js server com PM2 (process manager)
- TiDB cloud para banco de dados
- S3 para armazenamento de arquivos
- Manus Platform para hospedagem

### 3. CI/CD (Futuro)

- GitHub Actions para build e testes
- Deploy automático em merge para main
- Rollback automático em caso de erro

---

## Conclusão

A arquitetura do Sistema DOM-EARA V4 foi projetada para ser modular, escalável e segura. Cada módulo é independente, com seu próprio schema, routers e páginas frontend, facilitando manutenção e expansão.

As decisões de arquitetura foram baseadas em trade-offs conscientes entre simplicidade, performance e funcionalidade. O uso de tRPC garante type-safety end-to-end, Drizzle ORM facilita queries SQL otimizadas e React 19 + Tailwind 4 proporcionam interface moderna e responsiva.

O sistema está pronto para escalar horizontalmente, com backend stateless, banco de dados shardable e CDN para assets. Monitoramento, logs e testes serão implementados nas próximas iterações para garantir confiabilidade em produção.

---

**Autor:** Manus AI  
**Data:** 2025-01-07  
**Versão:** 1.0
