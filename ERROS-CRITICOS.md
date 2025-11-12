# 🚨 ERROS CRÍTICOS - SISTEMA DOM-EARA V4

**⚠️ ATENÇÃO: ESTE ARQUIVO NUNCA DEVE SER SOBRESCRITO, APENAS ADICIONADO.**

Este documento registra todos os erros críticos, decisões arquiteturais importantes e armadilhas que devem ser evitadas durante o desenvolvimento do sistema DOM-EARA V4. Leia este arquivo antes de fazer qualquer alteração significativa no projeto.

---

## 📋 Índice de Erros Críticos

1. [ERRO-001: Sistema NÃO usa OAuth](#erro-001-sistema-não-usa-oauth)
2. [Adicionar novos erros aqui conforme descobertos]

---

## ERRO-001: Sistema NÃO usa OAuth

**Data:** 07/11/2025  
**Severidade:** 🔴 CRÍTICA  
**Categoria:** Arquitetura / Autenticação

### Descrição do Erro

O template padrão do Manus vem configurado com **OAuth (Manus OAuth)** como sistema de autenticação. Porém, o sistema DOM-EARA V4 foi **explicitamente projetado para usar AUTENTICAÇÃO SIMPLES** com email e senha, conforme especificado na documentação do projeto.

### Por que isso é crítico?

- ❌ OAuth é incompatível com os requisitos do projeto
- ❌ O sistema precisa de controle total sobre cadastro de usuários (CPF, data de nascimento, etc.)
- ❌ OAuth não permite validações customizadas (idade mínima, CPF brasileiro, etc.)
- ❌ O fluxo de autenticação OAuth é diferente do fluxo esperado pelos usuários finais

### O que foi feito para corrigir?

1. **Removido OAuth completamente:**
   - Arquivo `server/_core/sdk.ts` renomeado para `.disabled`
   - Arquivo `server/_core/oauth.ts` renomeado para `.disabled`
   - Linha `registerOAuthRoutes(app)` comentada em `server/_core/index.ts`

2. **Implementado autenticação simples:**
   - Criado `server/_core/auth.ts` com JWT (access token + refresh token)
   - Criado `server/_core/password.ts` com bcrypt para hash de senhas
   - Criado `server/_core/validators.ts` com validações de CPF, email e idade
   - Atualizado `server/_core/context.ts` para ler JWT dos cookies em vez de OAuth

3. **Criado routers de autenticação:**
   - `server/routers/auth.ts` com endpoints: register, login, logout, me, refreshToken

4. **Atualizado frontend:**
   - Páginas de Login e Cadastro customizadas (sem OAuth)
   - Integração com tRPC para chamadas de autenticação

### Como evitar este erro no futuro?

✅ **SEMPRE verifique este arquivo antes de:**
- Fazer alterações em autenticação
- Adicionar novos endpoints de auth
- Modificar o contexto do tRPC
- Atualizar o template base

✅ **NUNCA:**
- Reative arquivos `.disabled` relacionados ao OAuth
- Use `registerOAuthRoutes()` no servidor
- Importe funções de `server/_core/sdk.ts` ou `oauth.ts`
- Assuma que o sistema usa OAuth só porque o template original usa

✅ **LEMBRE-SE:**
- Este sistema usa **JWT com cookies** para autenticação
- Access token expira em **15 minutos**
- Refresh token expira em **7 dias**
- Senhas são hasheadas com **bcrypt (12 rounds + pepper)**
- CPF é **opcional** no cadastro
- Idade mínima é **18 anos**

### Arquivos afetados

```
server/_core/auth.ts          ← Sistema JWT (criado)
server/_core/password.ts      ← Hash de senhas (criado)
server/_core/validators.ts    ← Validações (criado)
server/_core/context.ts       ← Lê JWT em vez de OAuth (modificado)
server/_core/index.ts         ← OAuth desabilitado (modificado)
server/_core/sdk.ts.disabled  ← OAuth desabilitado (renomeado)
server/_core/oauth.ts.disabled ← OAuth desabilitado (renomeado)
server/routers/auth.ts        ← Endpoints de autenticação (criado)
server/db.ts                  ← Funções de usuário customizadas (modificado)
drizzle/schema.ts             ← Schema de users customizado (modificado)
```

### Referências

- Especificação: `ESPECIFICACAO-GLOBAL-SISTEMA-DOM(1).md` - Seção "Autenticação Simples"
- Especificação: `E1-ESPECIFICACAO-TECNICA-BACKEND-LP-LOGIN(1).md` - Seção "Sistema de Autenticação"

---

## Template para Novos Erros

```markdown
## ERRO-XXX: [Título do Erro]

**Data:** DD/MM/YYYY  
**Severidade:** 🔴 CRÍTICA / 🟡 ALTA / 🟢 MÉDIA  
**Categoria:** [Categoria]

### Descrição do Erro
[Descreva o erro em detalhes]

### Por que isso é crítico?
- [Razão 1]
- [Razão 2]

### O que foi feito para corrigir?
1. [Ação 1]
2. [Ação 2]

### Como evitar este erro no futuro?
✅ **SEMPRE:**
- [Ação preventiva 1]

✅ **NUNCA:**
- [Ação a evitar 1]

### Arquivos afetados
```
[lista de arquivos]
```

### Referências
- [Link ou documento]
```

---

## 📝 Notas Importantes

- Este arquivo deve ser lido **DIARIAMENTE** antes de começar o desenvolvimento
- Novos erros críticos devem ser documentados **IMEDIATAMENTE** após descobertos
- Use o template acima para manter consistência
- Mantenha a ordem cronológica (mais recente no topo do índice)
- Sempre adicione links para documentos de referência

---

**Última atualização:** 07/11/2025  
**Próxima revisão obrigatória:** Antes de qualquer modificação em autenticação ou arquitetura core


---

## ERRO-002: NÃO Inventar Tabelas, Colunas ou Features sem Permissão

**Data:** 10/11/2025  
**Severidade:** 🔴 CRÍTICA  
**Categoria:** Processo de Desenvolvimento / Governança

### Descrição do Erro

Durante o desenvolvimento, **NUNCA** crie tabelas, colunas, features, rotas ou funcionalidades novas sem **PERGUNTAR EXPLICITAMENTE AO USUÁRIO** antes. Mesmo que pareça uma adição lógica ou útil, sempre confirme primeiro.

### Por que isso é crítico?

- ❌ Pode criar funcionalidades que não serão usadas (código morto)
- ❌ Pode conflitar com planos futuros do usuário
- ❌ Pode introduzir complexidade desnecessária no banco de dados
- ❌ Pode gerar migrações que não podem ser revertidas facilmente
- ❌ Pode criar dependências técnicas não desejadas
- ❌ Pode aumentar o escopo sem aprovação

### Exemplos de Situações que REQUEREM Confirmação

1. **Banco de Dados:**
   - ❌ Criar nova tabela (ex: `achievements`, `badges`, `notifications`)
   - ❌ Adicionar nova coluna em tabela existente (ex: `users.avatar_url`, `metas.streak`)
   - ❌ Alterar tipo de coluna (ex: `VARCHAR(50)` → `VARCHAR(255)`)
   - ❌ Adicionar índice ou constraint

2. **Backend:**
   - ❌ Criar novo router tRPC (ex: `achievementsRouter`, `gamificationRouter`)
   - ❌ Adicionar novo procedure (ex: `getAchievements`, `calculateStreak`)
   - ❌ Integrar API externa (ex: Pagar.me, SendGrid, AWS S3)

3. **Frontend:**
   - ❌ Criar nova página/rota (ex: `/conquistas`, `/ranking`)
   - ❌ Adicionar novo componente complexo (ex: `AchievementCard`, `LeaderboardTable`)
   - ❌ Implementar nova feature de UI (ex: sistema de notificações, chat ao vivo)

4. **Features de Produto:**
   - ❌ Sistema de gamificação (XP, níveis, badges)
   - ❌ Sistema de notificações push
   - ❌ Sistema de ranking/leaderboard
   - ❌ Sistema de chat/mensagens
   - ❌ Integração com redes sociais

### O que fazer ANTES de implementar algo novo?

1. **Perguntar ao usuário:**
   ```
   "Você gostaria que eu implementasse [FEATURE]? Isso incluiria:
   - Tabela X no banco com colunas A, B, C
   - Router Y com procedures P1, P2, P3
   - Página Z com componentes C1, C2, C3
   
   Posso prosseguir?"
   ```

2. **Esperar confirmação explícita** antes de criar qualquer código

3. **Documentar a decisão** no CHANGELOG ou README

### Exceções (Quando NÃO precisa perguntar)

✅ **Pode implementar SEM perguntar:**
- Correções de bugs óbvios (ex: erro 404, typo, validação quebrada)
- Ajustes de layout/CSS para melhorar UX
- Refatoração de código existente (sem mudar comportamento)
- Adição de comentários/documentação
- Otimizações de performance (sem mudar API)
- Testes unitários/integração

### Como evitar este erro?

1. **Sempre leia o contexto completo** antes de sugerir features
2. **Pergunte "Isso foi solicitado pelo usuário?"** antes de implementar
3. **Se não foi explicitamente pedido, PERGUNTE primeiro**
4. **Documente todas as decisões** de arquitetura no README

### Checklist antes de criar algo novo

- [ ] O usuário pediu explicitamente esta feature?
- [ ] Esta feature está documentada nos requisitos?
- [ ] Já confirmei com o usuário que posso implementar?
- [ ] Tenho certeza de que não estou inventando funcionalidades?

**🚨 REGRA DE OURO: "Quando em dúvida, PERGUNTE ao usuário."**

---
