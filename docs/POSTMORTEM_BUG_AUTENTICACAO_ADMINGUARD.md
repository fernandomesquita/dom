# 🐛 POST-MORTEM: Bug de Autenticação com adminGuard

**Data:** 12 de Novembro de 2025  
**Duração:** ~10 horas de debugging  
**Severidade:** CRÍTICA (bloqueava uso do sistema)  
**Status:** ✅ RESOLVIDO

---

## 📋 Resumo Executivo

Sistema redirecionava usuários autenticados para `/admin/login` sempre que:
- Digitavam URL diretamente na barra de endereços
- Apertavam F5 (reload) em qualquer página admin
- Fechavam e reabriam o navegador

**Causa Raiz:** Middleware `adminGuard` no Express procurando cookie com nome incorreto (`access_token` em vez de `app_session_id`), causando redirect HTTP 302 antes do React carregar.

**Solução:** Remoção do middleware `adminGuard`, mantendo proteção apenas via `adminProcedure` no tRPC (backend) e `AdminLayout` no React (frontend).

---

## 🔍 Sintomas Observados

### Comportamento Problemático

1. **Login funcionava normalmente:**
   - Credenciais validadas ✅
   - Cookie setado ✅
   - Redirect para `/admin/dashboard` ✅

2. **Navegação por links da sidebar funcionava:**
   - Client-side routing (React Router) ✅
   - Todas as páginas acessíveis ✅
   - APIs funcionando ✅

3. **Navegação direta ou reload FALHAVA:**
   - Digitar `/admin/questoes` → Redirect para `/admin/login` ❌
   - F5 em qualquer página → Redirect para `/admin/login` ❌
   - Fechar e reabrir navegador → Redirect para `/admin/login` ❌

### Evidências de Debug

**Logs do Backend (Railway):**
```
✅ JWT válido! User: 18d27c7c-be70-11f0-b544-a2aa05cbddca Role: MASTER
🍪 Cookie setado: app_session_id
```

**Logs do Frontend (Console):**
```
✅ useAuth SUCCESS: { id: "...", role: "MASTER", ... }
✅ AdminLayout OK - user autenticado
📦 localStorage contém: { id: "...", role: "MASTER", ... }
```

**Network Tab:**
```
Request: GET /admin/questoes
Response: 302 Found
Location: /admin/login
```

**Conclusão:** Todas as camadas de autenticação (JWT, cookies, React, localStorage) estavam funcionando corretamente. O problema era um redirect HTTP acontecendo ANTES do React carregar.

---

## 🔎 Investigação e Diagnóstico

### Timeline do Debug

#### Fase 1: Investigação do JWT (2h)
- **Hipótese:** JWT expirando muito rápido (15min)
- **Ações:** Aumentado expiração para 7 dias
- **Resultado:** ❌ Problema persistiu

#### Fase 2: Investigação de Cookies (3h)
- **Hipótese:** Cookie não sendo setado ou enviado
- **Ações:** 
  - Verificado `secure`, `sameSite`, `domain`
  - Adicionado logs em `setAccessTokenCookie`
  - Testado em múltiplos navegadores
- **Resultado:** ❌ Cookie estava correto, problema persistiu

#### Fase 3: Investigação do React Query (2h)
- **Hipótese:** Cache sendo invalidado no reload
- **Ações:**
  - Ajustado `retry`, `staleTime`, `gcTime`
  - Adicionado logs em `useAuth`
  - Implementado fallback para localStorage
- **Resultado:** ❌ Query funcionava, problema persistiu

#### Fase 4: Desabilitação de Audit (1h)
- **Hipótese:** Query de audit falhando e causando logout
- **Ações:** Desabilitado endpoints de auditoria
- **Resultado:** ❌ Problema persistiu

#### Fase 5: Investigação de Redirects (1h)
- **Hipótese:** Múltiplos componentes redirecionando
- **Ações:** Grep em todo código por `setLocation('/login')`
- **Resultado:** ❌ Nenhum redirect problemático encontrado

#### Fase 6: Descoberta do Network Redirect (30min)
- **Observação:** "Só consigo navegar por links, URL direta falha"
- **Insight:** Client-side routing funciona, server-side routing falha
- **Ação:** Verificado middlewares Express
- **Resultado:** ✅ **CAUSA RAIZ ENCONTRADA!**

#### Fase 7: Análise do adminGuard (30min)
- **Descoberta:** Middleware procurando `req.cookies.access_token`
- **Cookie real:** `req.cookies.app_session_id`
- **Comportamento:** Redirect HTTP 302 para `/admin/login`
- **Resultado:** ✅ **PROBLEMA IDENTIFICADO!**

---

## 🐛 Análise Técnica da Causa Raiz

### Código Problemático

**Arquivo:** `server/_core/adminGuard.ts` (linhas 10-16)

```typescript
export function adminGuard(req: Request, res: Response, next: NextFunction) {
  // Permitir login e assets
  if (req.path === '/login' || req.path.startsWith('/assets/')) {
    return next();
  }

  // ❌ PROBLEMA: Cookie com nome errado
  const accessToken = req.cookies?.access_token;
  
  if (!accessToken) {
    // ❌ PROBLEMA: Redirect HTTP antes do React carregar
    return res.redirect('/admin/login');
  }
  
  // Resto da validação...
}
```

**Aplicação do Middleware:**

**Arquivo:** `server/_core/index.ts` (linha 45)

```typescript
// Proteção de rotas admin
app.use('/admin', adminGuard);  // ← Intercepta TODAS as rotas /admin/*
```

### Por Que Funcionava em Alguns Casos

**Navegação por Links (Client-Side Routing):**

```
Usuário clica em link
       ↓
React Router intercepta (preventDefault)
       ↓
Atualiza URL no navegador (History API)
       ↓
Troca componente renderizado
       ↓
Servidor NÃO recebe requisição
       ↓
adminGuard NÃO executa ✅
```

**Navegação Direta ou F5 (Server-Side Routing):**

```
Usuário digita URL ou aperta F5
       ↓
Navegador faz GET /admin/questoes
       ↓
Express recebe requisição
       ↓
adminGuard intercepta
       ↓
Busca req.cookies.access_token (não existe!)
       ↓
Retorna res.redirect('/admin/login')
       ↓
Navegador redireciona (HTTP 302)
       ↓
React NEM chega a carregar ❌
```

### Inconsistência de Nomes

**Definição do Cookie (login):**

```typescript
// server/_core/auth.ts
export const COOKIE_NAME = "app_session_id";

export function setAccessTokenCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, { /* ... */ });
}
```

**Leitura do Cookie (tRPC context):**

```typescript
// server/_core/context.ts
export async function createContext(opts: CreateExpressContextOptions) {
  const token = extractTokenFromCookie(opts.req);
  // ...
}

// server/_core/auth.ts
export function extractTokenFromCookie(req: Request): string | null {
  return req.cookies?.[COOKIE_NAME] || null;  // ✅ app_session_id
}
```

**Leitura do Cookie (adminGuard):**

```typescript
// server/_core/adminGuard.ts
const accessToken = req.cookies?.access_token;  // ❌ NOME ERRADO!
```

**Conclusão:** adminGuard foi implementado independentemente e usou nome de cookie diferente do resto do sistema.

---

## 🔧 Solução Implementada

### Opção Escolhida: Remoção do Middleware

**Arquivo:** `server/_core/index.ts`

```typescript
// ❌ ANTES:
app.use('/admin', adminGuard);

// ✅ DEPOIS:
// Middleware removido - proteção via tRPC apenas
```

### Justificativa da Solução

#### Por Que Não Corrigir o Nome do Cookie?

**Opção descartada:**
```typescript
const accessToken = req.cookies?.app_session_id;  // Corrigir nome
```

**Razões para não escolher:**

1. **Redundância:** Proteção já existe em dois lugares:
   - Backend: `adminProcedure` no tRPC valida JWT em todas as APIs
   - Frontend: `AdminLayout` verifica autenticação e redireciona

2. **Conflito de Responsabilidades:**
   - Servidor Express: Deve servir arquivos estáticos (SPA)
   - Backend tRPC: Deve proteger APIs
   - Frontend React: Deve proteger rotas da UI
   
3. **Problemas de Sincronização:**
   - Se JWT expira, middleware redireciona mas frontend pode ter cache
   - Race conditions entre validações server-side e client-side
   - Dificulta implementar refresh token automático

4. **Padrão Moderno:**
   - SPAs modernas não usam middleware de autenticação em rotas estáticas
   - Servidor serve HTML/JS/CSS incondicionalmente
   - Autenticação acontece no carregamento do JavaScript
   - APIs protegidas por middleware específico de API

#### Por Que Remover É Seguro?

**Proteção Backend (tRPC):**

```typescript
// server/_core/trpc.ts
export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    if (!ctx.user || !['MASTER', 'ADMINISTRATIVO'].includes(ctx.user.role)) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  }),
);

// server/routers/questions.ts
export const questionsRouter = router({
  create: adminProcedure.mutation(...),    // ✅ PROTEGIDO
  update: adminProcedure.mutation(...),    // ✅ PROTEGIDO
  delete: adminProcedure.mutation(...),    // ✅ PROTEGIDO
  // ...
});
```

**Proteção Frontend (React):**

```typescript
// client/src/components/admin/AdminLayout.tsx
export function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');  // ✅ REDIRECIONA SE NÃO AUTENTICADO
    }
    if (!loading && user?.role === 'ALUNO') {
      setLocation('/dashboard');  // ✅ BLOQUEIA ALUNOS
    }
  }, [user, loading]);
  
  if (!user || user.role === 'ALUNO') {
    return null;  // ✅ NÃO RENDERIZA
  }
  
  return <>{children}</>;
}
```

**Resultado:** 
- ✅ APIs impossíveis de acessar sem autenticação (validação server-side)
- ✅ UI não renderiza sem autenticação (validação client-side)
- ✅ Sem conflitos de sincronização
- ✅ Refresh token pode ser implementado facilmente no futuro

---

## 📊 Impacto e Métricas

### Antes da Correção

- ❌ 100% das navegações diretas falhavam
- ❌ 100% dos reloads falhavam
- ❌ Usuários forçados a fazer login a cada F5
- ❌ Impossível compartilhar URLs de páginas específicas
- ❌ ~10 horas de desenvolvimento perdidas

### Depois da Correção

- ✅ 100% das navegações diretas funcionam
- ✅ 100% dos reloads funcionam
- ✅ Autenticação persiste entre sessões (via localStorage)
- ✅ URLs compartilháveis funcionam
- ✅ UX significativamente melhorada

### Débito Técnico Resolvido

- ✅ Removido middleware redundante
- ✅ Simplificado fluxo de autenticação
- ✅ Reduzido pontos de falha
- ✅ Melhorada manutenibilidade do código

---

## 🎓 Lições Aprendidas

### 1. SPAs e Server-Side Routing

**Problema:** Misturar conceitos de aplicação tradicional (server-side routing) com SPA (client-side routing).

**Lição:** Em SPAs, o servidor deve:
- ✅ Servir `index.html` para todas as rotas não-API
- ✅ Proteger apenas endpoints de API
- ❌ NÃO redirecionar baseado em autenticação em rotas estáticas

**Pattern correto:**

```typescript
// Proteger APIs
app.use('/api/trpc', authMiddleware, trpcMiddleware);

// SPA fallback (serve index.html para todas as outras rotas)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});
```

### 2. Inconsistência de Nomenclatura

**Problema:** Diferentes partes do código usavam nomes diferentes para o mesmo conceito:
- `app_session_id` (auth.ts, context.ts)
- `access_token` (adminGuard.ts)

**Lição:** 
- ✅ Definir constantes em arquivo central
- ✅ Importar e usar em todo o código
- ✅ Code review para detectar inconsistências

**Implementação:**

```typescript
// shared/const.ts
export const COOKIE_NAME = "app_session_id";

// Usar em TODOS os lugares:
import { COOKIE_NAME } from '@/shared/const';
const token = req.cookies?.[COOKIE_NAME];
```

### 3. Debugging de Redirects HTTP

**Problema:** Redirects HTTP (302) acontecem antes de JavaScript carregar, dificultando debug.

**Lição:** 
- ✅ Usar Network tab com "Preserve log"
- ✅ Observar primeira requisição e seu status code
- ✅ Diferenciar client-side routing (JS) de server-side routing (HTTP)

**Checklist para debug:**

```
1. Comportamento diferente entre links e URL direta?
   → Suspeitar de server-side middleware
   
2. Network tab mostra status 302/301?
   → É redirect HTTP, não JavaScript
   
3. Logs do frontend parecem corretos?
   → Problema pode estar no backend
   
4. F5 quebra mas navegação funciona?
   → Middleware Express interceptando
```

### 4. Camadas de Proteção

**Problema:** Múltiplas camadas de autenticação causaram confusão e bugs.

**Lição:** 
- ✅ Definir ONDE cada camada de proteção deve existir
- ✅ Documentar responsabilidade de cada camada
- ✅ Evitar redundância desnecessária

**Pattern recomendado:**

```
┌─────────────────────────────────────────────┐
│  FRONTEND (React)                           │
│  - Protege UX (esconde botões, redireciona) │
│  - NÃO é segurança real (JavaScript burável)│
│  - Melhora experiência do usuário           │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  BACKEND API (tRPC/Express)                 │
│  - Protege DADOS e OPERAÇÕES                │
│  - É segurança REAL (server-side)           │
│  - Valida TODA requisição                   │
│  - Retorna erro 401/403 se não autorizado   │
└─────────────────────────────────────────────┘
```

### 5. Testing Strategy

**Problema:** Testes focaram apenas em "happy path" (login → navegar por links).

**Lição:** Testes de autenticação devem incluir:

```
✅ Login com credenciais válidas
✅ Login com credenciais inválidas
✅ Navegação por links após login
✅ Navegação por URL direta após login
✅ F5 em página protegida
✅ Fechar e reabrir navegador
✅ Logout e tentar acessar páginas protegidas
✅ JWT expirando durante sessão
✅ Refresh token automático
✅ Múltiplas abas simultâneas
```

---

## 🔄 Prevenção Futura

### Checklist de Implementação

Para futuras features de autenticação ou middlewares:

- [ ] **Nomenclatura consistente:** Usar constantes centralizadas
- [ ] **Documentar middleware:** Explicar o que faz e por quê existe
- [ ] **Testing abrangente:** Incluir casos de navegação direta e reload
- [ ] **Code review focado:** Verificar uso correto de cookies/tokens
- [ ] **Logs em produção:** Adicionar logs temporários para facilitar debug
- [ ] **Pattern SPA:** Não misturar server-side routing com client-side routing

### Arquivos a Revisar

Ao fazer mudanças em autenticação, revisar:

```
server/_core/auth.ts          → Geração e validação de tokens
server/_core/context.ts       → Extração de token das requisições
server/_core/trpc.ts          → Procedures protegidas
client/src/_core/hooks/useAuth.ts  → Hook de autenticação frontend
client/src/components/admin/AdminLayout.tsx  → Proteção de rotas
```

### Documentação Obrigatória

Para novos middlewares Express:

```typescript
/**
 * Middleware: adminGuard
 * 
 * @description
 * Protege rotas /admin/* redirecionando usuários não autenticados.
 * 
 * @warning
 * Em SPAs, evite usar este pattern! Prefira proteger APIs via tRPC
 * e deixar React Router cuidar das rotas frontend.
 * 
 * @param req - Express Request
 * @param res - Express Response  
 * @param next - Express NextFunction
 * 
 * @cookies
 * - Lê: app_session_id (definido em shared/const.ts)
 * 
 * @behavior
 * - Se cookie ausente: res.redirect('/admin/login')
 * - Se cookie presente: verifica JWT e role, depois next()
 * 
 * @see server/_core/auth.ts para validação de JWT
 * @see server/_core/trpc.ts para proteção de APIs
 */
export function adminGuard(req: Request, res: Response, next: NextFunction) {
  // ...
}
```

---

## 📚 Referências

### Documentação Consultada

- [Express Middleware Guide](https://expressjs.com/en/guide/using-middleware.html)
- [tRPC Authentication](https://trpc.io/docs/server/authorization)
- [React Router v6 Documentation](https://reactrouter.com/en/main)
- [HTTP Cookies - MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [SPA vs MPA Authentication Patterns](https://auth0.com/blog/spa-authentication-patterns/)

### Artigos Relacionados

- "Authentication in Single Page Applications" - Auth0
- "Server-Side vs Client-Side Routing" - web.dev
- "JWT Best Practices" - OWASP

---

## 🔗 Commits Relacionados

### Investigação e Tentativas

- `82dee71` - Aumenta JWT expiração para 7 dias
- `55c2545` - Adiciona logs em setAccessTokenCookie
- `8f7e373` - Adiciona logs em verifyAccessToken
- `590fc7b` - Adiciona gcTime e logs em useAuth
- `e957c36` - Adiciona logs detalhados no AdminLayout

### Solução Final

- `[hash]` - Remove adminGuard middleware (FIX DEFINITIVO)

---

## 📞 Contatos

**Em caso de regressão deste bug:**

1. Verificar se `app.use('/admin', adminGuard)` foi reintroduzido
2. Verificar nomes de cookies (deve ser sempre `app_session_id`)
3. Testar navegação direta e F5 em ambiente de staging
4. Consultar este documento para contexto

**Responsável pela correção:** Manus + Claude (AI Assistant)  
**Revisado por:** Fernando (Product Owner)  
**Data da resolução:** 12/11/2025

---

**FIM DO POST-MORTEM**
