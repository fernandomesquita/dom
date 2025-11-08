# Análise de Índices do Banco de Dados

## Objetivo
Criar índices nas tabelas mais consultadas para melhorar performance em 10-100x.

## Metodologia
1. Analisar queries nos routers tRPC
2. Identificar colunas usadas em WHERE, JOIN, ORDER BY
3. Criar índices compostos otimizados

---

## Tabelas Analisadas

### 1. `metas` (Tabela de Metas)

**Queries identificadas:**
```sql
-- widgetsRouter.getCronograma
WHERE userId = ? AND prazo = ? AND concluida = false
ORDER BY prazo

-- widgetsRouter.getCronograma (próximas)
WHERE userId = ? AND prazo >= ? AND concluida = false
ORDER BY prazo

-- widgetsRouter.getCronograma (stats)
WHERE userId = ?

-- widgetsRouter.getProgressoSemanal
WHERE userId = ? AND prazo >= ? AND prazo <= ?
```

**Índices recomendados:**
```sql
-- Índice composto para busca por usuário + prazo + status
CREATE INDEX idx_metas_user_prazo_concluida ON metas(userId, prazo, concluida);

-- Índice para busca por usuário (stats gerais)
CREATE INDEX idx_metas_userId ON metas(userId);
```

**Benefício esperado:** 50-100x mais rápido em queries de cronograma

---

### 2. `questoes_resolvidas` (Histórico de Questões)

**Queries identificadas:**
```sql
-- widgetsRouter.getQTD
WHERE userId = ? AND DATE(resolvidaEm) = ?

-- widgetsRouter.getQTD (últimos 7 dias)
WHERE userId = ? AND DATE(resolvidaEm) >= ?
ORDER BY resolvidaEm DESC
```

**Índices recomendados:**
```sql
-- Índice composto para busca por usuário + data
CREATE INDEX idx_questoes_resolvidas_user_data ON questoes_resolvidas(userId, resolvidaEm);

-- Índice para busca por usuário + correta (taxa de acerto)
CREATE INDEX idx_questoes_resolvidas_user_correta ON questoes_resolvidas(userId, correta);
```

**Benefício esperado:** 20-50x mais rápido em queries de QTD

---

### 3. `cronograma` (Cronograma Diário)

**Queries identificadas:**
```sql
-- widgetsRouter.getProgressoSemanal
WHERE userId = ? AND data >= ? AND data <= ?
```

**Índices recomendados:**
```sql
-- Índice composto para busca por usuário + data
CREATE INDEX idx_cronograma_user_data ON cronograma(userId, data);
```

**Benefício esperado:** 30-60x mais rápido em queries de progresso semanal

---

### 4. `materiais_estudados` (Progresso em Materiais)

**Queries identificadas:**
```sql
-- widgetsRouter.getMateriaisAndamento
WHERE userId = ? AND progresso < 100
ORDER BY ultimaVisualizacao DESC

-- widgetsRouter.getRevisoesPendentes
WHERE userId = ? AND progresso = 100 AND ultimaVisualizacao <= ?
ORDER BY ultimaVisualizacao
```

**Índices recomendados:**
```sql
-- Índice composto para materiais em andamento
CREATE INDEX idx_materiais_estudados_user_progresso ON materiais_estudados(userId, progresso, ultimaVisualizacao);
```

**Benefício esperado:** 40-80x mais rápido em queries de materiais

---

### 5. `streak_logs` (Logs de Streak)

**Queries identificadas:**
```sql
-- streakRouter.getCurrentStreak
WHERE userId = ? AND date >= ?
ORDER BY date DESC

-- streakRouter.getHistory
WHERE userId = ? AND date >= ?
ORDER BY date DESC
```

**Índices recomendados:**
```sql
-- Índice composto para busca por usuário + data
CREATE INDEX idx_streak_logs_user_date ON streak_logs(userId, date DESC);
```

**Benefício esperado:** 50-100x mais rápido em queries de streak

---

### 6. `streak_protections` (Proteções de Streak)

**Queries identificadas:**
```sql
-- streakRouter.getCurrentStreak
WHERE userId = ?

-- streakRouter.useProtection
WHERE userId = ?
```

**Índices recomendados:**
```sql
-- Índice simples para busca por usuário
CREATE INDEX idx_streak_protections_userId ON streak_protections(userId);
```

**Benefício esperado:** 10-20x mais rápido

---

### 7. `estatisticas_diarias` (Estatísticas Diárias)

**Queries identificadas:**
```sql
-- widgetsRouter.getProgressoSemanal
WHERE userId = ? AND data >= ? AND data <= ?
```

**Índices recomendados:**
```sql
-- Índice composto para busca por usuário + data
CREATE INDEX idx_estatisticas_diarias_user_data ON estatisticas_diarias(userId, data);
```

**Benefício esperado:** 30-60x mais rápido

---

### 8. `daily_summaries` (Resumos Diários do Dashboard)

**Queries identificadas:**
```sql
-- dashboardRouter.getSummary
WHERE userId = ? AND date = ?

-- dashboardRouter.getDailyStats
WHERE userId = ? AND date = ?
```

**Índices recomendados:**
```sql
-- Índice composto para busca por usuário + data
CREATE INDEX idx_daily_summaries_user_date ON daily_summaries(userId, date);
```

**Benefício esperado:** 40-80x mais rápido

---

### 9. `gamification_xp` (XP e Níveis)

**Queries identificadas:**
```sql
-- gamificationRouter.getXP
WHERE userId = ?

-- gamificationRouter.addXP
WHERE userId = ?
```

**Índices recomendados:**
```sql
-- Índice simples para busca por usuário
CREATE INDEX idx_gamification_xp_userId ON gamification_xp(userId);
```

**Benefício esperado:** 10-20x mais rápido

---

### 10. `gamification_achievements` (Conquistas)

**Queries identificadas:**
```sql
-- gamificationRouter.getAchievements
WHERE userId = ?

-- gamificationRouter.unlockAchievement
WHERE userId = ? AND achievementId = ?
```

**Índices recomendados:**
```sql
-- Índice composto para busca por usuário + conquista
CREATE INDEX idx_gamification_achievements_user_achievement ON gamification_achievements(userId, achievementId);
```

**Benefício esperado:** 20-40x mais rápido

---

### 11. `widget_configs` (Configurações de Widgets)

**Queries identificadas:**
```sql
-- widgetsRouter.getWidgetConfigs
WHERE userId = ?
ORDER BY position

-- widgetsRouter.updateWidgetConfig
WHERE userId = ? AND widgetType = ?
```

**Índices recomendados:**
```sql
-- Índice composto para busca por usuário + tipo
CREATE INDEX idx_widget_configs_user_type ON widget_configs(userId, widgetType);

-- Índice para ordenação por posição
CREATE INDEX idx_widget_configs_user_position ON widget_configs(userId, position);
```

**Benefício esperado:** 30-60x mais rápido

---

### 12. `telemetry_events` (Eventos de Telemetria)

**Queries identificadas:**
```sql
-- telemetryRouter.trackEvent (INSERT apenas)
-- telemetryRouter.batchTrackEvents (INSERT em lote)
```

**Índices recomendados:**
```sql
-- Índice para análise por usuário + data (queries futuras)
CREATE INDEX idx_telemetry_events_user_timestamp ON telemetry_events(userId, timestamp DESC);

-- Índice para análise por widget + categoria
CREATE INDEX idx_telemetry_events_widget_category ON telemetry_events(widget, category, timestamp DESC);
```

**Benefício esperado:** 50-100x mais rápido em queries de analytics (futuras)

---

### 13. `planos` (Planos de Assinatura)

**Queries identificadas:**
```sql
-- widgetsRouter.getPlanoAtual (JOIN)
JOIN planos ON assinaturas.planoId = planos.id
```

**Índices recomendados:**
```sql
-- Índice para JOIN
CREATE INDEX idx_planos_id ON planos(id);
```

**Benefício esperado:** 10-20x mais rápido (já deve ter índice por PK)

---

### 14. `assinaturas` (Assinaturas de Usuários)

**Queries identificadas:**
```sql
-- widgetsRouter.getPlanoAtual
WHERE userId = ? AND status = 'ativa'
```

**Índices recomendados:**
```sql
-- Índice composto para busca por usuário + status
CREATE INDEX idx_assinaturas_user_status ON assinaturas(userId, status);
```

**Benefício esperado:** 30-60x mais rápido

---

### 15. `forum_topicos` (Tópicos do Fórum)

**Queries identificadas:**
```sql
-- widgetsRouter.getUltimasDiscussoes
WHERE ativo = true
ORDER BY updatedAt DESC
LIMIT 5
```

**Índices recomendados:**
```sql
-- Índice composto para busca por status + data
CREATE INDEX idx_forum_topicos_ativo_updated ON forum_topicos(ativo, updatedAt DESC);
```

**Benefício esperado:** 20-40x mais rápido

---

### 16. `dashboard_customizations` (Customizações do Dashboard)

**Queries identificadas:**
```sql
-- dashboardRouter.getCustomization
WHERE userId = ?

-- dashboardRouter.updateCustomization
WHERE userId = ?
```

**Índices recomendados:**
```sql
-- Índice simples para busca por usuário
CREATE INDEX idx_dashboard_customizations_userId ON dashboard_customizations(userId);
```

**Benefício esperado:** 10-20x mais rápido

---

## Resumo de Índices a Criar

**Total:** 20 índices em 16 tabelas

### Prioridade CRÍTICA (impacto > 50x):
1. `idx_metas_user_prazo_concluida` - metas(userId, prazo, concluida)
2. `idx_streak_logs_user_date` - streak_logs(userId, date DESC)
3. `idx_telemetry_events_user_timestamp` - telemetry_events(userId, timestamp DESC)

### Prioridade ALTA (impacto 30-50x):
4. `idx_questoes_resolvidas_user_data` - questoes_resolvidas(userId, resolvidaEm)
5. `idx_cronograma_user_data` - cronograma(userId, data)
6. `idx_materiais_estudados_user_progresso` - materiais_estudados(userId, progresso, ultimaVisualizacao)
7. `idx_daily_summaries_user_date` - daily_summaries(userId, date)
8. `idx_estatisticas_diarias_user_data` - estatisticas_diarias(userId, data)
9. `idx_widget_configs_user_type` - widget_configs(userId, widgetType)
10. `idx_assinaturas_user_status` - assinaturas(userId, status)

### Prioridade MÉDIA (impacto 10-30x):
11. `idx_metas_userId` - metas(userId)
12. `idx_questoes_resolvidas_user_correta` - questoes_resolvidas(userId, correta)
13. `idx_streak_protections_userId` - streak_protections(userId)
14. `idx_gamification_xp_userId` - gamification_xp(userId)
15. `idx_gamification_achievements_user_achievement` - gamification_achievements(userId, achievementId)
16. `idx_widget_configs_user_position` - widget_configs(userId, position)
17. `idx_telemetry_events_widget_category` - telemetry_events(widget, category, timestamp DESC)
18. `idx_forum_topicos_ativo_updated` - forum_topicos(ativo, updatedAt DESC)
19. `idx_dashboard_customizations_userId` - dashboard_customizations(userId)

---

## Impacto Estimado

**Performance:**
- Dashboard: 50-100x mais rápido
- Widgets: 30-80x mais rápido
- Gamificação: 20-40x mais rápido

**Tempo de carregamento:**
- Antes: 2-5 segundos
- Depois: 20-100ms

**Custo:**
- Espaço em disco: +10-20% (índices)
- Tempo de INSERT: +5-10% (manutenção de índices)
- **Benefício líquido: 90-95% de melhoria**
