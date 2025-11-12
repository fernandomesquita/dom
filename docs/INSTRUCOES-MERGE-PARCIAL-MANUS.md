# 📋 INSTRUÇÕES PARA MANUS - MERGE PARCIAL E PRÓXIMOS PASSOS

**Data:** 11/11/2025  
**Branch Atual:** `refactor/plans-page`  
**Objetivo:** Fazer merge parcial do trabalho concluído e preparar próxima iteração

---

## 🎯 RESUMO EXECUTIVO

**O que está funcionando:**
- ✅ Endpoint `admin.plans_v1.listNew` funcionando
- ✅ Frontend exibindo 5 planos corretamente
- ✅ Dados completos (nome, categoria, duração, etc)

**O que ainda falta:**
- ⚠️ Edição de planos retorna 404
- ⚠️ Filtros não implementados
- ⚠️ Busca não implementada

**Decisão:** Fazer merge do que funciona, continuar resto em nova branch.

---

## 📦 PARTE 1: PREPARAÇÃO PARA MERGE

### PASSO 1: Verificar Status Atual

```bash
# 1. Ver branch atual:
git branch
# Deve mostrar: * refactor/plans-page

# 2. Ver status:
git status
# Deve mostrar: "nothing to commit, working tree clean"
# Se tiver arquivos não commitados, commitar primeiro!

# 3. Ver últimos commits:
git log --oneline -5
# Confirmar que todos os commits estão certos
```

---

### PASSO 2: Atualizar Branch com Main

```bash
# 1. Baixar últimas mudanças do remoto:
git fetch origin

# 2. Ver se main teve atualizações:
git log origin/main --oneline -5

# 3. Se main teve mudanças, fazer rebase:
git rebase origin/main

# Se houver conflitos:
# - Resolver conflitos manualmente
# - git add <arquivos-resolvidos>
# - git rebase --continue
```

---

### PASSO 3: Salvar Documentação

```bash
# 1. Criar pasta docs se não existir:
mkdir -p docs

# 2. Baixar e salvar documentos do Claude:
# - SAGA-CORRECAO-PLANOS-11-11-2025.md
# - DECISOES-ARQUITETURAIS-PLANOS.md

# 3. Adicionar ao repositório:
git add docs/SAGA-CORRECAO-PLANOS-11-11-2025.md
git add docs/DECISOES-ARQUITETURAIS-PLANOS.md

# 4. Commit da documentação:
git commit -m "docs: adiciona saga de correção e decisões arquiteturais de planos"
```

---

### PASSO 4: Adicionar Comentários no Código

**Arquivo:** `server/routers/plans_v1.ts`

**No endpoint antigo `list`, adicionar:**

```typescript
/**
 * ⚠️ SISTEMA ANTIGO - EM PROCESSO DE DEPRECAÇÃO
 * 
 * Este endpoint lê da tabela `metas_planos_estudo` (antiga).
 * NÃO MODIFICAR sem consultar docs/DECISOES-ARQUITETURAIS-PLANOS.md
 * 
 * Sistema novo: admin.plans_v1.listNew
 * Tabela nova: plans
 * Data de criação do novo: 11/11/2025
 * 
 * @deprecated Use admin.plans_v1.listNew quando possível
 * @see docs/DECISOES-ARQUITETURAIS-PLANOS.md
 * @see docs/SAGA-CORRECAO-PLANOS-11-11-2025.md
 */
export const list = adminProcedure
  .input(...)
  .query(async ({ input }) => {
    // ... código antigo ...
  }),
```

**No endpoint novo `listNew`, adicionar:**

```typescript
/**
 * ✅ SISTEMA NOVO - ESTRUTURA CORRETA
 * 
 * Este endpoint lê da tabela `plans` (nova estrutura).
 * Schema: drizzle/schema-plans.ts
 * 
 * Diferenças do sistema antigo:
 * - Campos: name (não titulo), created_at (não criado_em)
 * - Tabela: plans (não metas_planos_estudo)
 * - Estrutura: normalizada e com soft delete
 * 
 * @created 11/11/2025
 * @see docs/DECISOES-ARQUITETURAIS-PLANOS.md
 */
export const listNew = staffProcedure
  .input(...)
  .query(async ({ input }) => {
    // ... código novo ...
  }),
```

**Commitar:**

```bash
git add server/routers/plans_v1.ts
git commit -m "docs: adiciona comentários explicativos em endpoints de planos"
```

---

### PASSO 5: Atualizar README.md

**Adicionar seção sobre Planos:**

```markdown
## 📚 Documentação de Módulos Críticos

### Sistema de Planos ⚠️

O sistema de planos possui arquitetura complexa com dois sistemas paralelos.

**ANTES de modificar qualquer código relacionado a planos:**
- 📄 Leia: [Decisões Arquiteturais - Planos](docs/DECISOES-ARQUITETURAIS-PLANOS.md)
- 📄 Leia: [Saga de Correção - 11/11/2025](docs/SAGA-CORRECAO-PLANOS-11-11-2025.md)

**Arquivos críticos:**
- `server/routers/plans_v1.ts` - Endpoints (antigo + novo)
- `server/routers/plansAdmin.ts` - CRUD de planos
- `drizzle/schema-plans.ts` - Schema da tabela plans
- `client/src/pages/admin/PlansPage.tsx` - Interface

**Não subestime estes avisos!** Sistema levou 4h de debugging.
```

**Commitar:**

```bash
git add README.md
git commit -m "docs: adiciona avisos sobre sistema de planos no README"
```

---

## 🔀 PARTE 2: EXECUTAR O MERGE

### PASSO 6: Criar Commit Final de Preparação

```bash
# 1. Ver todos os arquivos modificados:
git status

# 2. Se tudo estiver commitado, criar tag:
git tag -a v1.0.0-plans-list -m "feat: lista de planos funcionando com estrutura nova"

# 3. Ver a tag criada:
git tag -l
```

---

### PASSO 7: Fazer Merge para Main

```bash
# 1. Mudar para branch main:
git checkout main

# 2. Puxar últimas atualizações:
git pull origin main

# 3. Fazer merge da branch refactor/plans-page:
git merge refactor/plans-page --no-ff

# --no-ff cria commit de merge explícito (recomendado)

# 4. Se houver conflitos:
# - Resolver manualmente
# - git add <arquivos-resolvidos>
# - git commit (para finalizar merge)
```

---

### PASSO 8: Revisar Merge

```bash
# 1. Ver histórico de commits:
git log --oneline --graph -10

# 2. Ver diferenças entre main antiga e nova:
git diff HEAD~5 HEAD

# 3. Confirmar que tudo está correto:
git status
# Deve mostrar: "Your branch is ahead of 'origin/main' by X commits"
```

---

### PASSO 9: Push para Remoto

```bash
# 1. Push da branch main:
git push origin main

# 2. Push da tag:
git push origin v1.0.0-plans-list

# 3. Push da branch refactor (para preservar histórico):
git push origin refactor/plans-page

# 4. Confirmar no GitHub/GitLab:
# Ver se merge aparece corretamente
```

---

## 🌿 PARTE 3: CRIAR NOVA BRANCH PARA PRÓXIMOS PASSOS

### PASSO 10: Branch para Correção de Edição

```bash
# 1. A partir da main atualizada:
git checkout main
git pull origin main

# 2. Criar nova branch:
git checkout -b fix/plans-edit-404

# 3. Confirmar branch:
git branch
# Deve mostrar: * fix/plans-edit-404

# 4. Push da branch nova:
git push -u origin fix/plans-edit-404
```

---

### PASSO 11: Atualizar Branch Antiga (Opcional)

Se quiser preservar branch `refactor/plans-page` atualizada:

```bash
# 1. Voltar para branch antiga:
git checkout refactor/plans-page

# 2. Fazer merge da main:
git merge main

# 3. Push:
git push origin refactor/plans-page

# 4. Voltar para branch de trabalho:
git checkout fix/plans-edit-404
```

---

## 📝 PARTE 4: CRIAR ISSUES PARA PRÓXIMOS PASSOS

### Issue 1: Corrigir Edição de Planos (404)

**Título:** `[BUG] Edição de planos retorna 404`

**Descrição:**
```markdown
## Problema
Ao clicar em "Editar" na lista de planos, página retorna 404.

## Contexto
- Lista de planos funcionando (merge em 11/11/2025)
- Sistema usando endpoint `admin.plans_v1.listNew`
- Tabela: `plans` (nova estrutura)

## Tarefas
- [ ] Investigar rota de edição no frontend
- [ ] Verificar endpoint de edição no backend
- [ ] Confirmar mapeamento de ID
- [ ] Testar formulário de edição
- [ ] Validar salvamento

## Documentação
Ver: `docs/DECISOES-ARQUITETURAIS-PLANOS.md`

## Branch
`fix/plans-edit-404`
```

---

### Issue 2: Implementar Filtros na Lista

**Título:** `[FEATURE] Adicionar filtros na listagem de planos`

**Descrição:**
```markdown
## Objetivo
Permitir filtrar planos por categoria e status.

## Requisitos
- [ ] Filtro por categoria (Pago/Gratuito)
- [ ] Filtro por status (Pré-edital/Aberto/etc)
- [ ] Múltiplos filtros simultâneos
- [ ] Limpar filtros

## Documentação
Ver: `docs/DECISOES-ARQUITETURAIS-PLANOS.md`

## Branch
`feat/plans-filters`
```

---

### Issue 3: Implementar Busca

**Título:** `[FEATURE] Adicionar busca por nome na lista de planos`

**Descrição:**
```markdown
## Objetivo
Permitir buscar planos por nome/entidade/cargo.

## Requisitos
- [ ] Campo de busca no topo
- [ ] Busca por nome do plano
- [ ] Busca por entidade
- [ ] Busca por cargo
- [ ] Debounce de 300ms

## Documentação
Ver: `docs/DECISOES-ARQUITETURAIS-PLANOS.md`

## Branch
`feat/plans-search`
```

---

## ✅ PARTE 5: CHECKLIST FINAL

### Antes de Considerar Completo:

- [ ] ✅ Branch `refactor/plans-page` mergeada em `main`
- [ ] ✅ Tag `v1.0.0-plans-list` criada e pushed
- [ ] ✅ Documentação salva em `/docs/`
- [ ] ✅ Comentários adicionados nos endpoints
- [ ] ✅ README.md atualizado com avisos
- [ ] ✅ Nova branch `fix/plans-edit-404` criada
- [ ] ✅ Issues criadas para próximos passos
- [ ] ✅ Railway deployou última versão
- [ ] ✅ Lista de planos funcionando em produção
- [ ] ✅ Fernando celebrou a vitória! 🎉

---

## 🔄 FLUXO DE TRABALHO FUTURO

### Para Cada Nova Feature/Bug:

```bash
# 1. Começar da main atualizada:
git checkout main
git pull origin main

# 2. Criar branch específica:
git checkout -b tipo/nome-descritivo
# Exemplos:
# - feat/plans-filters
# - fix/plans-edit-404
# - refactor/plans-performance

# 3. Trabalhar na feature
# ... código ...

# 4. Commits frequentes:
git add .
git commit -m "tipo: descrição curta"

# 5. Push para remoto:
git push -u origin nome-da-branch

# 6. Quando pronto, criar Pull Request:
# - No GitHub/GitLab
# - Request review de Fernando
# - Aguardar aprovação

# 7. Após aprovação, merge:
git checkout main
git merge nome-da-branch --no-ff
git push origin main

# 8. Deletar branch antiga:
git branch -d nome-da-branch
git push origin --delete nome-da-branch
```

---

## 🚨 EM CASO DE PROBLEMAS

### Se Merge Dar Conflito:

```bash
# 1. Ver arquivos em conflito:
git status

# 2. Abrir cada arquivo e resolver:
# Procurar por <<<<<<< HEAD
# Escolher qual versão manter
# Remover marcadores de conflito

# 3. Adicionar arquivos resolvidos:
git add <arquivo-resolvido>

# 4. Continuar merge:
git commit

# 5. Se quiser abortar:
git merge --abort
```

---

### Se Precisar Desfazer Merge:

```bash
# ⚠️ CUIDADO: Só fazer se merge não foi pushed ainda!

# 1. Ver histórico:
git log --oneline -5

# 2. Voltar para commit antes do merge:
git reset --hard HEAD~1

# 3. Se já foi pushed:
# NÃO use reset! Use revert:
git revert -m 1 HEAD
git push origin main
```

---

### Se Railway Não Deployar:

```bash
# 1. Ver último commit:
git log -1

# 2. Copiar hash do commit

# 3. No Railway Dashboard:
# - Ver se build está rodando
# - Comparar hash do deploy com hash local
# - Se diferente, aguardar

# 4. Se der erro no build:
# - Ver logs completos no Railway
# - Corrigir erro
# - Commit + push novamente
```

---

## 📞 CONTATOS E SUPORTE

**Em caso de dúvidas sobre:**

### Git/Merge:
1. Primeiro: ler este documento
2. Segundo: `git status` e `git log`
3. Terceiro: contactar Fernando

### Sistema de Planos:
1. Primeiro: ler `/docs/DECISOES-ARQUITETURAIS-PLANOS.md`
2. Segundo: ler `/docs/SAGA-CORRECAO-PLANOS-11-11-2025.md`
3. Terceiro: contactar Fernando

### Deploy/Railway:
1. Primeiro: verificar Railway Dashboard
2. Segundo: ver logs do Railway
3. Terceiro: contactar Fernando

---

## 🎓 BOAS PRÁTICAS

### Commits:

```bash
# ✅ BOM:
git commit -m "feat: adiciona filtro por categoria"
git commit -m "fix: corrige erro 404 na edição"
git commit -m "docs: atualiza README com instruções"

# ❌ RUIM:
git commit -m "mudanças"
git commit -m "fix"
git commit -m "wip"
```

### Branches:

```bash
# ✅ BOM:
feat/plans-filters
fix/plans-edit-404
refactor/plans-performance
docs/architecture-decisions

# ❌ RUIM:
teste
nova-branch
mudancas
manus-dev
```

### Pull Requests:

```markdown
✅ BOM:
Título: [FEAT] Adiciona filtros na listagem de planos
Descrição:
- O que foi feito
- Por que foi feito
- Como testar
- Screenshots (se aplicável)
- Link para documentação

❌ RUIM:
Título: mudanças
Descrição: (vazio)
```

---

## 🎉 MENSAGEM FINAL PARA MANUS

**Parabéns pelo excelente trabalho!** 

Esta foi uma tarefa extremamente complexa e você:
- ✅ Manteve a calma durante 4 horas de debugging
- ✅ Seguiu instruções detalhadas com precisão
- ✅ Fez deploys sem quebrar produção
- ✅ Criou solução elegante (endpoint paralelo)

**Agora:**
1. Faça o merge seguindo este documento
2. Descanse! Você merece!
3. Amanhã continua com a edição

**Não tenha pressa.** O importante funciona. O resto vem depois.

---

**Boa sorte com o merge!** 🚀

Se tiver qualquer dúvida, releia este documento ou contacte Fernando.

---

**Documento criado:** 11/11/2025 21:00 BRT  
**Autor:** Claude (IA)  
**Destinatário:** Manus (Developer)  
**Versão:** 1.0.0  
**Status:** ✅ Pronto para Execução
