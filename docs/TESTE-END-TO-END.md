# Teste End-to-End - Módulo de Metas

**Autor:** Manus AI  
**Data:** 2025-01-07  
**Objetivo:** Validar fluxo completo do Módulo de Metas

---

## 🎯 Fluxo de Teste

### 1. Criar Plano de Estudo

**URL:** `/metas/planos`

**Passos:**
1. Clicar em "Novo Plano"
2. Preencher formulário:
   - Nome: "Preparação PCDF 2025"
   - Concurso: "Polícia Civil do Distrito Federal"
   - Horas por dia: 4
   - Dias disponíveis: Segunda a Sexta (5 dias)
3. Clicar em "Criar Plano"

**Resultado Esperado:**
- ✅ Plano criado com sucesso
- ✅ Card do plano aparece na listagem
- ✅ Estatísticas mostram 0 metas, 0% progresso

---

### 2. Criar Meta Manual

**URL:** `/metas/planos/:planoId/nova`

**Passos:**
1. Clicar em "Nova Meta" no card do plano
2. Preencher formulário:
   - Tipo: ESTUDO
   - Disciplina: Direito Constitucional (autocomplete)
   - Assunto: Direitos e Garantias Fundamentais (autocomplete)
   - Tópico: Direitos Individuais e Coletivos (opcional)
   - Duração: 60 minutos
   - Data: Hoje
   - Orientações: "Focar em jurisprudência recente do STF"
3. Clicar em "Selecionar Materiais" (opcional)
4. Selecionar 2-3 materiais da lista
5. Clicar em "Criar Meta"

**Resultado Esperado:**
- ✅ Meta criada com sucesso
- ✅ Toast: "Meta criada com sucesso!"
- ✅ Toast: "3 materiais vinculados!" (se materiais foram selecionados)
- ✅ Formulário limpo
- ✅ Autocomplete funcionou (disciplina → assunto → tópico)
- ✅ Pré-visualização de slot mostrou capacidade correta

---

### 3. Testar Validação de Conflito

**URL:** `/metas/planos/:planoId/nova`

**Passos:**
1. Criar meta com duração de 240 minutos (4 horas)
2. Criar segunda meta no mesmo dia com duração de 120 minutos (2 horas)
3. Observar warning de capacidade excedida

**Resultado Esperado:**
- ✅ Warning vermelho aparece: "⚠ Capacidade excedida! 360/240min"
- ✅ Botão "Usar {proximaData}" aparece
- ✅ Clicar no botão aplica automaticamente a próxima data disponível
- ✅ Warning desaparece após mudar data

---

### 4. Importar Metas via Excel

**URL:** `/metas/importar`

**Passos:**
1. Criar arquivo Excel com colunas:
   - tipo, ktree_disciplina_id, ktree_assunto_id, ktree_topico_id, duracao_planejada_min, scheduled_date, orientacoes_estudo
2. Preencher 10 linhas com metas variadas
3. Fazer upload do arquivo
4. Clicar em "Importar"

**Resultado Esperado:**
- ✅ Arquivo processado
- ✅ Relatório mostra sucessos e erros
- ✅ Metas aparecem no cronograma
- ✅ Validação de KTree funcionou
- ✅ Duplicatas foram detectadas (row_hash)

---

### 5. Visualizar Cronograma

**URL:** `/metas/cronograma`

**Passos:**
1. Acessar página de cronograma
2. Observar metas distribuídas no calendário
3. Filtrar por tipo (ESTUDO, QUESTOES, REVISAO)
4. Filtrar por status (PENDENTE, CONCLUIDA, OMITIDA)
5. Navegar entre meses

**Resultado Esperado:**
- ✅ Calendário exibe metas corretamente
- ✅ Cores diferentes por tipo
- ✅ Filtros funcionam
- ✅ Estatísticas agregadas corretas
- ✅ Navegação entre meses funciona

---

### 6. Concluir Meta

**URL:** `/metas/hoje`

**Passos:**
1. Acessar página "Metas de Hoje"
2. Observar cards de metas do dia
3. Clicar em "Iniciar" em uma meta
4. Timer começa a contar
5. Clicar em "Concluir"
6. Preencher duração real (ex: 55 minutos)
7. Confirmar conclusão

**Resultado Esperado:**
- ✅ Meta marcada como CONCLUIDA
- ✅ Duração real salva
- ✅ Log de conclusão criado
- ✅ Revisões automáticas geradas (1, 7, 30 dias)
- ✅ Materiais vinculados marcados como "vistos"
- ✅ viewCount dos materiais incrementado

---

### 7. Verificar Revisões

**URL:** `/metas/cronograma`

**Passos:**
1. Após concluir meta, verificar calendário
2. Observar revisões geradas nos dias +1, +7, +30

**Resultado Esperado:**
- ✅ 3 revisões criadas automaticamente
- ✅ Tipo: REVISAO
- ✅ Duração: 50% da meta original
- ✅ Numeração: #001.1, #001.2, #001.3
- ✅ Orientações copiadas da meta original

---

### 8. Omitir Meta

**URL:** `/metas/hoje`

**Passos:**
1. Clicar em "Omitir" em uma meta
2. Selecionar motivo (Falta de tempo, Dificuldade, Outro)
3. Preencher observação (opcional)
4. Confirmar omissão

**Resultado Esperado:**
- ✅ Meta marcada como OMITIDA
- ✅ Motivo e observação salvos
- ✅ Log de omissão criado
- ✅ Meta redistribuída automaticamente
- ✅ Nova data calculada respeitando dias disponíveis

---

### 9. Visualizar Detalhes da Meta

**URL:** `/metas/:metaId`

**Passos:**
1. Clicar em uma meta no cronograma
2. Observar detalhes completos
3. Verificar materiais vinculados
4. Verificar histórico de logs

**Resultado Esperado:**
- ✅ Informações gerais corretas
- ✅ Datas importantes exibidas
- ✅ Orientações exibidas
- ✅ Materiais vinculados listados com thumbnails
- ✅ Botões de ação funcionam (Concluir, Omitir, Reagendar)

---

### 10. Acessar Analytics Admin

**URL:** `/admin/metas/dashboard`

**Passos:**
1. Acessar dashboard administrativo
2. Observar 7 gráficos/estatísticas
3. Filtrar por período
4. Filtrar por usuário (se admin)

**Resultado Esperado:**
- ✅ Estatísticas globais corretas
- ✅ Taxa de conclusão por disciplina
- ✅ Metas mais omitidas (top 10)
- ✅ Tempo médio por tipo
- ✅ Distribuição por dia da semana
- ✅ Gráficos renderizados corretamente
- ✅ Filtros funcionam

---

## ✅ Checklist de Validação

### Backend (31 procedures tRPC)

- [ ] metasPlanos.create
- [ ] metasPlanos.getById
- [ ] metasPlanos.list
- [ ] metasPlanos.update
- [ ] metasPlanos.delete
- [ ] metasPlanos.getStats
- [ ] metasPlanos.updateConfig
- [ ] metasMetas.create
- [ ] metasMetas.getById
- [ ] metasMetas.listByPlano
- [ ] metasMetas.listByDate
- [ ] metasMetas.update
- [ ] metasMetas.delete
- [ ] metasMetas.complete
- [ ] metasMetas.skip
- [ ] metasMetas.reschedule
- [ ] metasMetas.vincularMaterial
- [ ] metasMetas.desvincularMaterial
- [ ] metasMetas.listarMateriaisVinculados
- [ ] metasMetas.buscarMateriaisDisponiveis
- [ ] metasMetas.verificarConflitos
- [ ] metasBatchImport.importFromExcel
- [ ] metasAnalytics.globalStats
- [ ] metasAnalytics.taxaConclusaoPorDisciplina
- [ ] metasAnalytics.metasMaisOmitidas
- [ ] metasAnalytics.tempoMedioPorTipo
- [ ] metasAnalytics.distribuicaoPorDia
- [ ] metasAnalytics.progressoTemporal
- [ ] metasAnalytics.comparacaoUsuarios
- [ ] ktree.listDisciplinas
- [ ] ktree.listAssuntosByDisciplina
- [ ] ktree.listTopicosByAssunto

### Frontend (7 páginas)

- [ ] MetasPlanos: Listagem e criação de planos
- [ ] MetasCronograma: Calendário mensal com filtros
- [ ] MetasHoje: Cards de metas do dia com timer
- [ ] MetaDetalhes: Visualização completa + materiais
- [ ] MetasImport: Upload de Excel com validação
- [ ] MetasDashboard: Analytics admin com 7 gráficos
- [ ] MetaNova: Criação manual com autocomplete

### Funcionalidades Críticas

- [ ] Autocomplete de KTree (disciplina → assunto → tópico)
- [ ] Validação de conflitos (capacidade excedida)
- [ ] Botão "Usar Slot Sugerido"
- [ ] Vinculação automática de materiais
- [ ] Revisão espaçada automática (1, 7, 30 dias)
- [ ] Redistribuição inteligente ao omitir
- [ ] Numeração sequencial (#001, #001.1)
- [ ] Integração com módulo de materiais
- [ ] Batch import via Excel
- [ ] Analytics agregados

---

## 🐛 Bugs Conhecidos

### 1. Servidor OOM (Out of Memory)

**Sintoma:** Servidor para de responder após 30-60 minutos.

**Workaround:** Reiniciar servidor com `webdev_restart_server`.

### 2. Screenshot Unavailable

**Sintoma:** Screenshot não é capturado no checkpoint.

**Impacto:** Baixo - não afeta funcionalidade.

### 3. Tabelas Criadas via SQL Direto

**Sintoma:** `pnpm db:push` não criou tabelas inicialmente.

**Solução:** Tabelas foram criadas via `webdev_execute_sql`.

**Impacto:** Migrações futuras podem não funcionar corretamente.

---

## 📊 Resultados Esperados

### Métricas de Sucesso

| Métrica | Esperado | Resultado | Status |
|---------|----------|-----------|--------|
| Procedures tRPC funcionando | 31/31 | - | ⏳ |
| Páginas frontend funcionando | 7/7 | - | ⏳ |
| Autocomplete KTree | 100% | - | ⏳ |
| Validação de conflitos | 100% | - | ⏳ |
| Vinculação de materiais | 100% | - | ⏳ |
| Revisão espaçada | 100% | - | ⏳ |
| Redistribuição automática | 100% | - | ⏳ |
| Batch import | 100% | - | ⏳ |
| Analytics | 7/7 | - | ⏳ |

---

## 🎉 Conclusão

Este documento serve como guia para testar o fluxo completo do Módulo de Metas. Após executar todos os testes e validar o checklist, o módulo estará 100% completo e pronto para uso.

**Próximos passos após validação:**
1. Criar checkpoint final (Módulo de Metas 100%)
2. Implementar sistema de notificações push
3. Iniciar próximo módulo (Questões, Fórum ou Gamificação)

---

**Autor:** Manus AI  
**Data:** 2025-01-07  
**Versão:** 1.0
