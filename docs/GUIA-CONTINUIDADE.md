# Guia de Continuidade - Sistema DOM-EARA V4

**Autor:** Manus AI  
**Data:** 2025-01-07  
**Para:** Próxima sessão de desenvolvimento

---

## 🎯 Onde Estamos

### Status Atual do Projeto

O Sistema DOM-EARA V4 está **85% completo** no Módulo de Metas (cronograma de estudos). Os 4 módulos principais estão implementados:

1. ✅ **Fundação** (100%) - Autenticação JWT + banco de dados
2. ✅ **Árvore de Conhecimento** (100%) - Hierarquia Disciplinas → Assuntos → Tópicos
3. ✅ **Materiais V4.0** (100%) - PDFs, vídeos, áudios com DRM e engajamento
4. 🚧 **Metas (Cronograma)** (85%) - Sistema de cronograma de estudos com revisão espaçada

### Checkpoint Atual

**Versão:** `eb5a1a09`  
**Data:** 2025-01-07  
**Progresso:** 85% do Módulo de Metas completo

### O Que Foi Implementado

**Backend (31 procedures tRPC):**
- 5 routers: metasPlanos (7), metasMetas (13), metasBatchImport (1), metasAnalytics (7), ktree (4)
- 3 helpers: metasNumeracao, metasRevisao, metasDistribuicao
- 8 tabelas: metas_planos_estudo, metas_cronograma, metas_cronograma_materiais, metas_cronograma_questoes, 4 tabelas de logs
- Integração com módulo de materiais (auto-update ao concluir meta)

**Frontend (7 páginas):**
- MetasPlanos: Listagem de planos com criação e configuração
- MetasCronograma: Calendário mensal com filtros
- MetasHoje: Cards de metas do dia com timer
- MetaDetalhes: Visualização completa + materiais vinculados
- MetasImport: Upload de Excel com validação
- MetasDashboard: Analytics admin com 7 gráficos
- MetaNova: Criação manual com autocomplete KTree + dialog de materiais + validação de conflitos

**Componentes:**
- KTreeSelector: Autocomplete customizado com Popover + ScrollArea + Search

**Scripts:**
- seed-metas-simple.mjs: 1 plano + 10 metas de teste

### O Que Falta (15%)

**Crítico (deve ser feito AGORA):**
1. Warning visual de conflito na UI (Alert vermelho com AlertTriangle)
2. Botão "Usar Slot Sugerido" que aplica `proximaDataDisponivel`
3. Vincular materiais após criar meta (loop chamando `vincularMaterial`)
4. Seed de taxonomia (disciplinas, assuntos, tópicos)

**Importante (deve ser feito LOGO):**
5. Sistema de notificações push
6. Exportação de relatórios (PDF/Excel)
7. Integração com KTree real (foreign keys)

---

## 📂 Arquivos Importantes

### Documentação (LEIA PRIMEIRO)

| Arquivo | Descrição | Tamanho |
|---------|-----------|---------|
| `docs/GUIA-CONTINUIDADE.md` | Este arquivo - contexto completo para próxima sessão | 15 KB |
| `docs/HISTORICO-COMPLETO.md` | Histórico detalhado de 7 dias de desenvolvimento | 25 KB |
| `docs/ARQUITETURA.md` | Arquitetura completa do sistema | 20 KB |
| `docs/MODULO-METAS.md` | Documentação técnica do Módulo de Metas | 87 KB |
| `docs/DECISOES-CRITICAS.md` | Decisões críticas e erros | 5 KB |
| `CHANGELOG.md` | Histórico de versões | 30 KB |
| `todo.md` | Tarefas pendentes (60+ atividades indispensáveis) | 15 KB |

### Backend

| Arquivo | Descrição |
|---------|-----------|
| `server/routers/metasPlanos.ts` | CRUD de planos de estudo (7 procedures) |
| `server/routers/metasMetas.ts` | CRUD de metas (13 procedures) |
| `server/routers/metasBatchImport.ts` | Import via Excel (1 procedure) |
| `server/routers/metasAnalytics.ts` | Analytics admin (7 procedures) |
| `server/routers/ktree.ts` | Autocomplete de taxonomia (4 procedures) |
| `server/helpers/metasNumeracao.ts` | Numeração sequencial (#001, #001.1) |
| `server/helpers/metasRevisao.ts` | Revisão espaçada (1, 7, 30 dias) |
| `server/helpers/metasDistribuicao.ts` | Distribuição inteligente |
| `drizzle/schema-metas.ts` | Schema de 8 tabelas |

### Frontend

| Arquivo | Descrição |
|---------|-----------|
| `client/src/pages/MetasPlanos.tsx` | Listagem de planos |
| `client/src/pages/MetasCronograma.tsx` | Calendário mensal |
| `client/src/pages/MetasHoje.tsx` | Metas do dia com timer |
| `client/src/pages/MetaDetalhes.tsx` | Detalhes + materiais vinculados |
| `client/src/pages/MetasImport.tsx` | Upload de Excel |
| `client/src/pages/MetasDashboard.tsx` | Analytics admin |
| `client/src/pages/MetaNova.tsx` | **Criação manual (FOCO DA PRÓXIMA SESSÃO)** |
| `client/src/components/KTreeSelector.tsx` | Autocomplete customizado |

### Scripts

| Arquivo | Descrição |
|---------|-----------|
| `scripts/seed-metas-simple.mjs` | Seed de 1 plano + 10 metas |
| `drizzle/migrations/001_rename_metas_tables.sql` | Migração SQL (renomeação de tabelas) |
| `drizzle/migrations/001_rollback_rename.sql` | Rollback da migração |

---

## 🚀 Próximos Passos Detalhados

### Passo 1: Finalizar UI de Criação de Meta (1-2 horas)

**Objetivo:** Completar os 15% restantes da página MetaNova.

**Arquivo:** `client/src/pages/MetaNova.tsx`

**Tarefas:**

1. **Adicionar Warning Visual de Conflito**
   - Localizar seção de agendamento (card "Agendamento")
   - Adicionar Alert vermelho com ícone AlertTriangle
   - Exibir quando `!cabeNoSlot` (variável já existe no código)
   - Mensagem: "⚠️ Capacidade excedida! {minutosUsados}/{capacidadeMin}min usados"
   - Mostrar próxima data disponível: "Próxima data disponível: {proximaDataDisponivel}"

2. **Adicionar Botão "Usar Slot Sugerido"**
   - Botão dentro do Alert vermelho
   - Texto: "Usar {proximaDataDisponivel}"
   - onClick: `setScheduledDate(proximaDataDisponivel)`
   - Desabilitar botão "Criar Meta" quando houver conflito (opcional)

3. **Vincular Materiais Após Criar**
   - Localizar `onSuccess` da mutation `createMutation`
   - Adicionar loop: `for (const materialId of materiaisSelecionados) { ... }`
   - Chamar: `trpc.metasMetas.vincularMaterial.mutate({ metaId: data.id, materialId })`
   - Toast: "{n} materiais vinculados com sucesso"

**Código de Referência:**

```typescript
// 1. Warning Visual de Conflito
{!cabeNoSlot && proximaDataDisponivel && (
  <Alert variant="destructive" className="mt-4">
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle>Capacidade Excedida!</AlertTitle>
    <AlertDescription>
      {minutosUsados}/{capacidadeMin}min usados. Próxima data disponível: {proximaDataDisponivel}
      <Button 
        variant="outline" 
        size="sm" 
        className="ml-4"
        onClick={() => setScheduledDate(proximaDataDisponivel)}
      >
        Usar {proximaDataDisponivel}
      </Button>
    </AlertDescription>
  </Alert>
)}

// 2. Vincular Materiais Após Criar
const createMutation = trpc.metasMetas.create.useMutation({
  onSuccess: async (data) => {
    toast.success("Meta criada com sucesso!");
    
    // Vincular materiais
    if (materiaisSelecionados.length > 0) {
      for (const materialId of materiaisSelecionados) {
        await trpc.metasMetas.vincularMaterial.mutate({
          metaId: data.id,
          materialId,
        });
      }
      toast.success(`${materiaisSelecionados.length} materiais vinculados!`);
    }
    
    setLocation(`/metas/planos/${planoId}`);
  },
});
```

### Passo 2: Criar Seed de Taxonomia (30 minutos)

**Objetivo:** Popular tabelas `disciplinas`, `assuntos`, `topicos` com dados realistas.

**Arquivo:** `scripts/seed-ktree.mjs`

**Tarefas:**

1. Criar script baseado em `seed-metas-simple.mjs`
2. Popular 10-15 disciplinas (Direito Constitucional, Administrativo, Penal, Civil, Português, Matemática, etc.)
3. Popular 50+ assuntos (5-10 por disciplina)
4. Popular 200+ tópicos (3-5 por assunto)
5. Executar: `node scripts/seed-ktree.mjs`

**Código de Referência:**

```javascript
const disciplinas = [
  { nome: "Direito Constitucional", codigo: "DIR001", cor: "#FF6B6B" },
  { nome: "Direito Administrativo", codigo: "DIR002", cor: "#4ECDC4" },
  { nome: "Direito Penal", codigo: "DIR003", cor: "#45B7D1" },
  // ...
];

for (const disc of disciplinas) {
  await db.execute(`
    INSERT INTO disciplinas (nome, codigo, slug, cor, ativo, sortOrder)
    VALUES (?, ?, ?, ?, 1, ?)
  `, [disc.nome, disc.codigo, slugify(disc.nome), disc.cor, disciplinas.indexOf(disc)]);
}
```

### Passo 3: Testar Fluxo Completo (30 minutos)

**Objetivo:** Validar que tudo funciona end-to-end.

**Tarefas:**

1. Reiniciar servidor: `webdev_restart_server`
2. Acessar `/metas/planos` e criar novo plano
3. Clicar em "Nova Meta" e preencher formulário
4. Selecionar disciplina/assunto/tópico (autocomplete deve funcionar)
5. Selecionar materiais (dialog deve exibir materiais reais)
6. Criar meta e verificar se materiais foram vinculados
7. Acessar `/metas/planos/:planoId/hoje` e verificar se meta aparece
8. Concluir meta e verificar se revisões foram geradas
9. Acessar `/admin/metas/dashboard` e verificar analytics

### Passo 4: Criar Checkpoint Final (5 minutos)

**Objetivo:** Salvar progresso com Módulo de Metas 100% completo.

**Tarefas:**

1. Atualizar `todo.md` marcando tarefas como concluídas
2. Criar checkpoint: `webdev_save_checkpoint` com descrição "Módulo de Metas 100% Completo"
3. Entregar resultados ao usuário com anexo do checkpoint

---

## ⚠️ Problemas Conhecidos

### 1. Servidor Morto por OOM (Out of Memory)

**Sintoma:** Servidor para de responder, tsc e vite são killed.

**Causa:** Compilação TypeScript + Vite HMR consumindo muita memória.

**Solução:** Reiniciar servidor frequentemente com `webdev_restart_server`.

**Prevenção:** Limitar tamanho de arquivos, evitar edições múltiplas sem reiniciar.

### 2. Tabelas Criadas via SQL Direto

**Sintoma:** `pnpm db:push` não cria tabelas.

**Causa:** `schema-metas.ts` não estava em `drizzle.config.ts` inicialmente.

**Solução:** Tabelas foram criadas via `webdev_execute_sql`.

**Impacto:** Migrações futuras podem não funcionar corretamente. Considerar recriar tabelas via Drizzle.

### 3. Conflito de Nomenclatura de Tabelas

**Sintoma:** Tabela `metas` já existia (módulo de gamificação).

**Causa:** Não verificar tabelas existentes antes de criar schema.

**Solução:** Renomear todas as tabelas com prefixo `metas_cronograma_*`.

**Documentação:** `docs/DECISOES-CRITICAS.md`

---

## 📊 Métricas de Progresso

### Módulo de Metas

| Categoria | Completo | Pendente | Total | % |
|-----------|----------|----------|-------|---|
| **Backend** | 31 procedures | 0 | 31 | 100% |
| **Frontend** | 6 páginas | 1 página (15%) | 7 | 85% |
| **Componentes** | 1 | 0 | 1 | 100% |
| **Helpers** | 3 | 0 | 3 | 100% |
| **Scripts** | 1 | 1 (seed ktree) | 2 | 50% |
| **Documentação** | 5 docs | 0 | 5 | 100% |
| **TOTAL** | - | - | - | **85%** |

### Projeto Completo

| Módulo | Status | Progresso |
|--------|--------|-----------|
| Fundação | ✅ Completo | 100% |
| Árvore de Conhecimento | ✅ Completo | 100% |
| Materiais V4.0 | ✅ Completo | 100% |
| **Metas (Cronograma)** | 🚧 Em Desenvolvimento | **85%** |
| Questões | ❌ Não Iniciado | 0% |
| Fórum | ❌ Não Iniciado | 0% |
| Gamificação | ❌ Não Iniciado | 0% |
| **TOTAL** | - | **46%** |

---

## 🎯 Objetivos da Próxima Sessão

### Objetivo Principal

**Completar Módulo de Metas (85% → 100%)**

### Objetivos Secundários

1. Finalizar UI de criação de meta (warning visual + vincular materiais)
2. Criar seed de taxonomia (disciplinas, assuntos, tópicos)
3. Testar fluxo completo end-to-end
4. Criar checkpoint final (Módulo de Metas 100%)

### Tempo Estimado

**2-3 horas** para completar os 15% restantes.

---

## 💡 Dicas para Próxima Sessão

### 1. Leia a Documentação Primeiro

Antes de começar a codificar, leia:
1. `docs/GUIA-CONTINUIDADE.md` (este arquivo)
2. `docs/HISTORICO-COMPLETO.md` (contexto completo)
3. `docs/MODULO-METAS.md` (documentação técnica)

### 2. Reinicie o Servidor Frequentemente

O servidor tem problemas de OOM. Reinicie a cada 30-60 minutos ou após edições grandes.

### 3. Crie Checkpoints Intermediários

Crie checkpoints após cada tarefa concluída. Facilita rollback em caso de erro.

### 4. Teste Incrementalmente

Teste cada funcionalidade após implementar. Não espere até o final para testar tudo.

### 5. Documente Decisões

Se tomar decisões importantes, documente em `docs/DECISOES-CRITICAS.md`.

### 6. Use Código de Referência

Este guia inclui código de referência para as tarefas principais. Use como base.

### 7. Consulte o todo.md

O `todo.md` tem 60+ atividades indispensáveis organizadas por prioridade. Use como roadmap.

---

## 📞 Contato e Suporte

### Documentação Adicional

- **Manus Platform Docs:** https://docs.manus.im
- **tRPC Docs:** https://trpc.io
- **Drizzle ORM Docs:** https://orm.drizzle.team
- **shadcn/ui Docs:** https://ui.shadcn.com

### Arquivos de Log

- **Servidor:** Console do terminal
- **Frontend:** DevTools do navegador
- **Banco de Dados:** Logs do MySQL/TiDB

---

## ✅ Checklist de Início de Sessão

Antes de começar a codificar, verifique:

- [ ] Li `docs/GUIA-CONTINUIDADE.md` completamente
- [ ] Li `docs/HISTORICO-COMPLETO.md` para entender contexto
- [ ] Li `docs/MODULO-METAS.md` para entender arquitetura
- [ ] Verifiquei checkpoint atual (`eb5a1a09`)
- [ ] Servidor está rodando sem erros
- [ ] Banco de dados está acessível
- [ ] Tenho acesso aos arquivos do projeto
- [ ] Entendi os 3 próximos passos (warning visual, seed ktree, testar)

---

## 🎉 Mensagem Final

Você está a **15% de completar o Módulo de Metas**, um dos módulos mais complexos do sistema. O trabalho duro já foi feito:

✅ 31 procedures tRPC implementadas  
✅ 8 tabelas de banco criadas  
✅ 7 páginas frontend desenvolvidas  
✅ 3 helpers de lógica de negócio  
✅ Integração com módulo de materiais  
✅ Autocomplete de taxonomia  
✅ Validação de conflitos  
✅ Documentação extensiva  

Faltam apenas **3 tarefas críticas**:
1. Warning visual de conflito (30 min)
2. Vincular materiais após criar (15 min)
3. Seed de taxonomia (30 min)

**Você consegue!** 🚀

Boa sorte na próxima sessão!

---

**Autor:** Manus AI  
**Data:** 2025-01-07  
**Versão:** 1.0  
**Checkpoint Atual:** `eb5a1a09`  
**Progresso:** 85% do Módulo de Metas
