# 📖 LEIA-ME DIARIAMENTE - SISTEMA DOM-EARA V4

**⚠️ LEIA ESTE ARQUIVO TODOS OS DIAS ANTES DE COMEÇAR O DESENVOLVIMENTO**

Este é um sumário executivo dos erros críticos e decisões arquiteturais que você **DEVE** conhecer antes de fazer qualquer alteração no projeto.

---

## 🚨 Erros Críticos Ativos

### 1. ❌ SISTEMA NÃO USA OAUTH

**O QUE VOCÊ PRECISA SABER:**
- ✅ Sistema usa **AUTENTICAÇÃO SIMPLES** (email + senha)
- ✅ JWT com access token (15min) + refresh token (7 dias)
- ❌ **NUNCA** reative arquivos `oauth.ts` ou `sdk.ts`
- ❌ **NUNCA** use `registerOAuthRoutes()`

**ARQUIVOS CRÍTICOS:**
- `server/_core/auth.ts` - Sistema JWT
- `server/routers/auth.ts` - Endpoints de autenticação
- `server/_core/context.ts` - Lê JWT dos cookies

**DETALHES COMPLETOS:** Ver `ERROS-CRITICOS.md` → ERRO-001

---

## 🏗️ Decisões Arquiteturais Importantes

### Autenticação
- **Método:** JWT (access + refresh tokens)
- **Storage:** Cookies HTTP-only
- **Validações:** CPF (opcional), idade mínima 18 anos, força de senha
- **Hash:** bcrypt com 12 rounds + pepper

### Banco de Dados
- **SGBD:** MySQL 8.0+
- **ORM:** Drizzle
- **Tabelas:** 24 tabelas (ver `drizzle/schema.ts`)
- **Convenção:** camelCase para colunas

### API
- **Framework:** tRPC 11
- **Serialização:** SuperJSON (suporta Date, Map, Set)
- **Rotas:** `/api/trpc/*`

---

## 📋 Checklist Diário

Antes de começar o desenvolvimento hoje, confirme:

- [ ] Li o arquivo `ERROS-CRITICOS.md` completo
- [ ] Entendi que o sistema **NÃO usa OAuth**
- [ ] Verifiquei o `todo.md` para ver tarefas pendentes
- [ ] Li o `CHANGELOG.md` para ver últimas mudanças
- [ ] Entendi a estrutura do banco de dados (`drizzle/schema.ts`)

---

## 🔗 Links Rápidos

- **Erros Críticos Completos:** `ERROS-CRITICOS.md`
- **Changelog:** `CHANGELOG.md`
- **TODO:** `todo.md`
- **Documentação Original:** Arquivos `ESPECIFICACAO-*.md` em `/home/ubuntu/upload/`

---

## 🆘 Em Caso de Dúvida

1. **Primeiro:** Leia `ERROS-CRITICOS.md`
2. **Segundo:** Consulte a especificação original do projeto
3. **Terceiro:** Verifique o `CHANGELOG.md` para ver se há contexto
4. **Quarto:** Pergunte antes de fazer mudanças arquiteturais

---

**Última atualização:** 07/11/2025  
**Versão do projeto:** 3cb59a47 (Etapa 1 - Fundação completa)
