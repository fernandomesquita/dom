# 🎯 E10: DASHBOARD DO ALUNO - PLANO DE TRABALHO

**Data de Criação:** 08 de Janeiro de 2025  
**Estimativa Total:** 18-22 dias úteis (3.5-4.5 semanas)  
**Complexidade:** ALTA (Fachada do App - Experiência Principal)

---

## 📊 RESUMO EXECUTIVO

### Objetivo
Criar o **coração da plataforma DOM** - uma experiência de engajamento que transforma o estudo em algo motivador e recompensador. O aluno deve querer entrar na plataforma todos os dias porque **gosta**, não porque precisa.

### Princípios Fundamentais
1. **Um Objetivo, Uma Ação** 🎯 - Zero sobrecarga cognitiva
2. **Motivação Contínua** 🔥 - Sistema de streaks e gamificação sutil
3. **Transparência Total** 📊 - O aluno sempre sabe onde está
4. **Personalização sem Fricção** 🎨 - Interface adaptável

### Escopo
- **Backend:** 15+ endpoints tRPC, 8 tabelas novas, sistema de telemetria
- **Frontend:** 1 página principal + 8 widgets + 4 componentes core
- **Integrações:** Metas, Questões, Materiais, Avisos, Gamificação
- **Performance:** Cache inteligente, views materializadas, otimizações

---

## 🏗️ ARQUITETURA VISUAL

### Hierarquia de Informação
```
NÍVEL 1: CTA Principal (Botão animado de meta) ⭐⭐⭐
         ↓
NÍVEL 2: Streak + Estatísticas do Dia ⭐⭐⭐
         ↓
NÍVEL 3: Próxima Ação Sugerida ⭐⭐
         ↓
NÍVEL 4: Widgets de Informação ⭐
         ↓
NÍVEL 5: Links de Acesso Rápido
```

### Estrutura da Página
```
┌─────────────────────────────────────────────┐
│ HEADER FIXO (Sticky)                        │
│ - Logo + Navegação                          │
│ - Streak em destaque 🔥                     │
│ - Avatar + Notificações                     │
└─────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────┐
│ HERO SECTION                                │
│ - Mensagem contextual (Bom dia, Fernando!)  │
│ - CTA Principal ANIMADO (Iniciar Meta)      │
│ - Mini-estatísticas do dia                  │
└─────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────┐
│ SISTEMA DE AVISOS (Carrossel)               │
│ - 4 tipos: Info / Importante / Urgente /    │
│   Individual                                │
└─────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────┐
│ GRID DE WIDGETS (Personalizável)            │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│ │Cronograma│ │   QTD    │ │  Streak  │    │
│ └──────────┘ └──────────┘ └──────────┘    │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│ │Progresso │ │Materiais │ │ Revisões │    │
│ └──────────┘ └──────────┘ └──────────┘    │
└─────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────┐
│ ACESSO RÁPIDO (Links principais)            │
└─────────────────────────────────────────────┘
```

---

## 📅 ROADMAP DE DESENVOLVIMENTO (5 FASES)

### FASE 1: FUNDAÇÃO E INFRAESTRUTURA (4-5 dias)
**Objetivo:** Setup completo + estrutura base + integrações críticas

#### Backend (2.5 dias)
- [ ] **Schema do Banco (8 tabelas novas):**
  - [ ] `widget_configs` - Configuração de widgets por usuário
  - [ ] `streak_logs` - Histórico de streaks
  - [ ] `streak_protections` - Proteções de streak usadas
  - [ ] `telemetry_events` - Eventos de telemetria
  - [ ] `dashboard_customizations` - Customizações do dashboard
  - [ ] `daily_summaries` - Resumos diários agregados
  - [ ] `gamification_xp` - XP e níveis
  - [ ] `gamification_achievements` - Conquistas desbloqueadas

- [ ] **Views Materializadas (Performance):**
  - [ ] `v_dashboard_aluno` - Agregação de dados do dashboard
  - [ ] `v_streak_status` - Status de streak em tempo real
  - [ ] `v_daily_progress` - Progresso diário agregado

- [ ] **Routers tRPC (15+ procedures):**
  - [ ] `dashboardRouter` (5 procedures):
    - [ ] `getSummary` - Resumo completo do dashboard
    - [ ] `getDailyStats` - Estatísticas do dia
    - [ ] `getHeroData` - Dados do Hero Section
    - [ ] `getQuickActions` - Ações rápidas sugeridas
    - [ ] `getCustomization` - Configurações do usuário
  - [ ] `widgetsRouter` (8 procedures):
    - [ ] `getCronograma` - Widget Cronograma
    - [ ] `getQTD` - Widget QTD
    - [ ] `getStreak` - Widget Streak
    - [ ] `getProgressoSemanal` - Widget Progresso Semanal
    - [ ] `getMateriaisAndamento` - Widget Materiais
    - [ ] `getRevisoesPendentes` - Widget Revisões
    - [ ] `reorderWidgets` - Reordenar widgets
    - [ ] `updateWidgetConfig` - Atualizar configuração de widget
  - [ ] `streakRouter` (4 procedures):
    - [ ] `getCurrentStreak` - Streak atual
    - [ ] `useProtection` - Usar proteção de streak
    - [ ] `getHistory` - Histórico de streaks
    - [ ] `getLeaderboard` - Ranking de streaks
  - [ ] `telemetryRouter` (2 procedures):
    - [ ] `trackEvent` - Rastrear evento
    - [ ] `batchTrackEvents` - Rastrear eventos em lote

#### Frontend (1.5 dias)
- [ ] **Estrutura de Arquivos:**
  - [ ] Criar `/client/src/pages/Dashboard.tsx`
  - [ ] Criar `/client/src/components/dashboard/` (6 componentes)
  - [ ] Criar `/client/src/components/widgets/` (8 widgets)
  - [ ] Criar `/client/src/hooks/dashboard/` (5 hooks)
  - [ ] Criar `/client/src/lib/dashboard/` (helpers)

- [ ] **Sistema de Cache (React Query):**
  - [ ] Configurar estratégias de cache por widget
  - [ ] Implementar invalidação inteligente
  - [ ] Criar hook `useDashboardWidget`

- [ ] **Sistema de Telemetria:**
  - [ ] Implementar hook `useTelemetry`
  - [ ] Configurar batch de eventos (5s)
  - [ ] Integrar com backend

**Entrega Fase 1:**
- ✅ Schema do banco completo
- ✅ Views materializadas criadas
- ✅ 15+ procedures tRPC funcionando
- ✅ Estrutura de arquivos criada
- ✅ Sistema de cache configurado
- ✅ Sistema de telemetria funcionando

---

### FASE 2: HEADER E HERO SECTION (3-4 dias)
**Objetivo:** Criar a primeira impressão e CTA principal

#### Header Fixo (1 dia)
- [ ] **Componente `DashboardHeader.tsx`:**
  - [ ] Logo + Navegação
  - [ ] Streak em destaque (animado) 🔥
  - [ ] Avatar + Dropdown
  - [ ] Notificações (badge)
  - [ ] Responsivo (mobile menu)

- [ ] **Funcionalidades:**
  - [ ] Sticky header (fixed)
  - [ ] Animação de scroll (hide/show)
  - [ ] Transição suave entre estados
  - [ ] Integração com `streakRouter`

#### Hero Section (2-3 dias)
- [ ] **Componente `HeroSection.tsx`:**
  - [ ] Mensagem contextual (Bom dia, Fernando!)
  - [ ] CTA Principal ANIMADO (Framer Motion)
  - [ ] Mini-estatísticas do dia (3 cards)
  - [ ] Próxima ação sugerida

- [ ] **Lógica de Mensagens Contextuais:**
  - [ ] Saudação por horário (Bom dia, Boa tarde, Boa noite)
  - [ ] Mensagem de motivação aleatória
  - [ ] Mensagem de conquista (se houver)
  - [ ] Mensagem de streak (se quebrou ou está em risco)

- [ ] **CTA Principal (Estados):**
  - [ ] **Estado 1:** "Iniciar Meta de Hoje" (meta pendente)
  - [ ] **Estado 2:** "Continuar Meta" (meta em andamento)
  - [ ] **Estado 3:** "Resolver Questões" (meta concluída)
  - [ ] **Estado 4:** "Revisar Conteúdo" (sem metas)
  - [ ] Animação de pulse/glow
  - [ ] Ícone animado (Lucide)

- [ ] **Mini-Estatísticas do Dia:**
  - [ ] Metas concluídas (X/Y)
  - [ ] Questões resolvidas (X)
  - [ ] Tempo de estudo (Xh Ym)
  - [ ] Ícones + cores + animações

**Entrega Fase 2:**
- ✅ Header fixo funcionando
- ✅ Streak visível e animado
- ✅ Hero Section completo
- ✅ CTA Principal com 4 estados
- ✅ Mensagens contextuais funcionando
- ✅ Mini-estatísticas do dia

---

### FASE 3: SISTEMA DE AVISOS (2 dias)
**Objetivo:** Carrossel de avisos com 4 tipos

#### Componente `AvisosCarousel.tsx` (2 dias)
- [ ] **4 Tipos de Avisos:**
  - [ ] **Informativo** (azul) - Novidades, dicas
  - [ ] **Importante** (amarelo) - Avisos importantes
  - [ ] **Urgente** (vermelho) - Ações urgentes
  - [ ] **Individual** (roxo) - Mensagens personalizadas

- [ ] **Funcionalidades:**
  - [ ] Carrossel automático (5s)
  - [ ] Navegação manual (setas)
  - [ ] Botão "Dispensar" (X)
  - [ ] Botão "Ver Detalhes" (se houver link)
  - [ ] Animação de entrada/saída (Framer Motion)
  - [ ] Responsivo (mobile: stack vertical)

- [ ] **Integração:**
  - [ ] Buscar avisos ativos do `noticesRouter_v1`
  - [ ] Filtrar por destinatários (usuário atual)
  - [ ] Marcar como lido ao dispensar
  - [ ] Telemetria: view, dismiss, click

**Entrega Fase 3:**
- ✅ Carrossel de avisos funcionando
- ✅ 4 tipos de avisos com cores corretas
- ✅ Navegação automática e manual
- ✅ Botão "Dispensar" funcionando
- ✅ Integração com backend completa

---

### FASE 4: WIDGETS PRINCIPAIS (5-6 dias)
**Objetivo:** Implementar os 8 widgets do dashboard

#### Widget 1: Cronograma (1 dia)
- [ ] **Componente `WidgetCronograma.tsx`:**
  - [ ] Exibir meta de hoje (se houver)
  - [ ] Exibir próxima meta (se hoje concluída)
  - [ ] Exibir "Sem metas hoje" (se não houver)
  - [ ] Botão "Ver Cronograma Completo"
  - [ ] Ícone de status (pendente, em andamento, concluída)
  - [ ] Tempo estimado vs tempo real
  - [ ] Barra de progresso (se em andamento)

#### Widget 2: QTD (Questões do Dia) (1 dia)
- [ ] **Componente `WidgetQTD.tsx`:**
  - [ ] Contador de questões resolvidas (X/Y)
  - [ ] Barra de progresso circular
  - [ ] Taxa de acerto (%)
  - [ ] Botão "Resolver Questões"
  - [ ] Gráfico de barras (últimos 7 dias)
  - [ ] Animação de incremento (CountUp)

#### Widget 3: Streak (1 dia)
- [ ] **Componente `WidgetStreak.tsx`:**
  - [ ] Contador de dias consecutivos 🔥
  - [ ] Calendário visual (últimos 7 dias)
  - [ ] Proteções disponíveis (ícone de escudo)
  - [ ] Botão "Usar Proteção" (se em risco)
  - [ ] Mensagem de motivação
  - [ ] Ranking de streaks (top 3)

#### Widget 4: Progresso Semanal (1 dia)
- [ ] **Componente `WidgetProgressoSemanal.tsx`:**
  - [ ] Gráfico de barras (7 dias)
  - [ ] Métricas: metas, questões, tempo
  - [ ] Comparação com semana anterior (%)
  - [ ] Média da plataforma (linha tracejada)
  - [ ] Botão "Ver Estatísticas Completas"

#### Widget 5: Materiais em Andamento (0.5 dia)
- [ ] **Componente `WidgetMateriais.tsx`:**
  - [ ] Listagem de materiais em andamento (máx 3)
  - [ ] Progresso de leitura (%)
  - [ ] Thumbnail + título + autor
  - [ ] Botão "Continuar Lendo"
  - [ ] Link "Ver Todos os Materiais"

#### Widget 6: Revisões Pendentes (0.5 dia)
- [ ] **Componente `WidgetRevisoes.tsx`:**
  - [ ] Contador de revisões pendentes
  - [ ] Listagem de revisões (máx 3)
  - [ ] Data de revisão + disciplina
  - [ ] Botão "Revisar Agora"
  - [ ] Link "Ver Todas as Revisões"

#### Widget 7: Plano de Estudos (0.5 dia)
- [ ] **Componente `WidgetPlano.tsx`:**
  - [ ] Nome do plano ativo
  - [ ] Progresso geral (%)
  - [ ] Dias restantes
  - [ ] Botão "Ver Plano Completo"
  - [ ] Gráfico de pizza (disciplinas)

#### Widget 8: Comunidade (0.5 dia)
- [ ] **Componente `WidgetComunidade.tsx`:**
  - [ ] Atividade recente no fórum (máx 3)
  - [ ] Threads populares
  - [ ] Botão "Acessar Fórum"
  - [ ] Badge de notificações

**Entrega Fase 4:**
- ✅ 8 widgets funcionando
- ✅ Integração com backend completa
- ✅ Animações e transições suaves
- ✅ Responsivo (mobile: 1 coluna)
- ✅ Telemetria em todos os widgets

---

### FASE 5: GAMIFICAÇÃO E POLIMENTO (4-5 dias)
**Objetivo:** Sistema de gamificação + otimizações + testes

#### Sistema de Gamificação (2 dias)
- [ ] **XP e Níveis:**
  - [ ] Tabela de XP por ação
  - [ ] Cálculo de nível (fórmula exponencial)
  - [ ] Barra de progresso de nível (header)
  - [ ] Animação de level up (modal)
  - [ ] Histórico de XP

- [ ] **Conquistas (Achievements):**
  - [ ] 20+ conquistas definidas
  - [ ] Sistema de desbloqueio
  - [ ] Modal de conquista desbloqueada
  - [ ] Página de conquistas (/conquistas)
  - [ ] Badge no header (novas conquistas)

- [ ] **Tabela de XP:**
  - [ ] Meta concluída: 50 XP
  - [ ] Questão correta: 10 XP
  - [ ] Questão errada: 2 XP
  - [ ] Material lido: 20 XP
  - [ ] Revisão completa: 30 XP
  - [ ] Streak mantido: 15 XP/dia
  - [ ] Post no fórum: 5 XP
  - [ ] Resposta útil: 10 XP

#### Otimizações (1 dia)
- [ ] **Performance:**
  - [ ] Implementar lazy loading de widgets
  - [ ] Otimizar queries (N+1)
  - [ ] Adicionar índices no banco
  - [ ] Configurar cache Redis
  - [ ] Minificar assets

- [ ] **Acessibilidade:**
  - [ ] Adicionar ARIA labels
  - [ ] Garantir navegação por teclado
  - [ ] Testar com screen reader
  - [ ] Contraste de cores (WCAG AA)

#### Testes e QA (1-2 dias)
- [ ] **Testes Unitários:**
  - [ ] Helpers (dashboard.ts, gamification.ts)
  - [ ] Hooks (useDashboardData, useStreak)
  - [ ] Procedures tRPC (mock)

- [ ] **Testes de Integração:**
  - [ ] Fluxo completo: login → dashboard → ação
  - [ ] Invalidação de cache
  - [ ] Telemetria

- [ ] **Testes Manuais:**
  - [ ] Desktop (Chrome, Firefox, Safari)
  - [ ] Mobile (iOS, Android)
  - [ ] Tablet
  - [ ] Performance (Lighthouse)

**Entrega Fase 5:**
- ✅ Sistema de gamificação completo
- ✅ XP e níveis funcionando
- ✅ 20+ conquistas implementadas
- ✅ Otimizações aplicadas
- ✅ Testes passando
- ✅ Dashboard pronto para produção

---

## 📊 ESTIMATIVA DETALHADA

### Breakdown por Fase

| Fase | Descrição | Estimativa (dias) | Complexidade |
|------|-----------|-------------------|--------------|
| 1 | Fundação e Infraestrutura | 4-5 | ALTA |
| 2 | Header e Hero Section | 3-4 | MÉDIA |
| 3 | Sistema de Avisos | 2 | BAIXA |
| 4 | Widgets Principais | 5-6 | ALTA |
| 5 | Gamificação e Polimento | 4-5 | MÉDIA |
| **TOTAL** | **E10 Completa** | **18-22** | **ALTA** |

### Breakdown por Área

| Área | Tarefas | Estimativa (dias) | % do Total |
|------|---------|-------------------|------------|
| Backend | Schema + Routers + Views | 6-7 | 33% |
| Frontend | Componentes + Widgets | 8-10 | 44% |
| Integrações | APIs + Cache + Telemetria | 2-3 | 11% |
| Testes e QA | Unitários + Integração + Manual | 2-2 | 11% |
| **TOTAL** | **E10 Completa** | **18-22** | **100%** |

### Cronograma Sugerido

**Semana 1 (5 dias):**
- Dias 1-2: Fase 1 (Backend - Schema + Routers)
- Dias 3-5: Fase 1 (Frontend - Estrutura + Cache + Telemetria)

**Semana 2 (5 dias):**
- Dias 1-2: Fase 2 (Header Fixo)
- Dias 3-5: Fase 2 (Hero Section + CTA Principal)

**Semana 3 (5 dias):**
- Dias 1-2: Fase 3 (Sistema de Avisos)
- Dias 3-5: Fase 4 (Widgets 1-3: Cronograma, QTD, Streak)

**Semana 4 (5 dias):**
- Dias 1-2: Fase 4 (Widgets 4-8: Progresso, Materiais, Revisões, Plano, Comunidade)
- Dias 3-5: Fase 5 (Gamificação + Otimizações + Testes)

**Buffer:** 2-4 dias para imprevistos e ajustes finais

---

## 🎯 MÉTRICAS DE SUCESSO

### Técnicas
- [ ] Lighthouse Score > 90 (Performance, Accessibility, Best Practices)
- [ ] Tempo de carregamento inicial < 2s
- [ ] Tempo de resposta das APIs < 200ms (p95)
- [ ] Taxa de erro < 0.1%
- [ ] Cobertura de testes > 80%

### Negócio
- [ ] Taxa de engajamento diário > 70% (alunos entram todo dia)
- [ ] Tempo médio na plataforma > 30min/dia
- [ ] Taxa de conclusão de metas > 60%
- [ ] Taxa de retenção (D7) > 80%
- [ ] NPS > 50

### UX
- [ ] Tempo para primeira ação < 5s (aluno sabe o que fazer)
- [ ] Taxa de cliques no CTA principal > 80%
- [ ] Taxa de uso de proteção de streak > 50% (quando disponível)
- [ ] Taxa de customização de widgets > 30%
- [ ] Feedback positivo > 90% (pesquisa de satisfação)

---

## ⚠️ RISCOS E MITIGAÇÕES

### Risco 1: Complexidade de Integrações
**Impacto:** ALTO  
**Probabilidade:** MÉDIA  
**Mitigação:**
- Criar mocks para desenvolvimento paralelo
- Definir contratos de API claros
- Testes de integração desde o início

### Risco 2: Performance com Muitos Widgets
**Impacto:** ALTO  
**Probabilidade:** MÉDIA  
**Mitigação:**
- Lazy loading de widgets
- Cache agressivo (React Query)
- Views materializadas no banco
- Paginação e virtualização

### Risco 3: Gamificação Invasiva
**Impacto:** MÉDIO  
**Probabilidade:** BAIXA  
**Mitigação:**
- Gamificação sutil (não invasiva)
- Testes A/B com usuários
- Opção de desativar notificações de conquistas

### Risco 4: Responsividade em Mobile
**Impacto:** ALTO  
**Probabilidade:** BAIXA  
**Mitigação:**
- Mobile-first design
- Testes em dispositivos reais
- Breakpoints bem definidos

### Risco 5: Atraso no Cronograma
**Impacto:** MÉDIO  
**Probabilidade:** MÉDIA  
**Mitigação:**
- Buffer de 2-4 dias
- Priorização clara (MVP primeiro)
- Daily standups para acompanhamento

---

## 📝 CHECKLIST DE ENTREGA

### Backend
- [ ] 8 tabelas novas criadas e migradas
- [ ] 3 views materializadas funcionando
- [ ] 15+ procedures tRPC implementadas
- [ ] Sistema de cache configurado
- [ ] Sistema de telemetria funcionando
- [ ] Testes unitários passando (>80% cobertura)

### Frontend
- [ ] Página `/dashboard` funcionando
- [ ] Header fixo com streak
- [ ] Hero Section com CTA principal (4 estados)
- [ ] Sistema de avisos (carrossel)
- [ ] 8 widgets funcionando
- [ ] Sistema de gamificação (XP + conquistas)
- [ ] Responsivo (desktop, tablet, mobile)
- [ ] Acessibilidade (WCAG AA)
- [ ] Lighthouse Score > 90

### Integrações
- [ ] Integração com `metasRouter`
- [ ] Integração com `questionsRouter`
- [ ] Integração com `materialsRouter`
- [ ] Integração com `noticesRouter_v1`
- [ ] Integração com `forumRouter`
- [ ] Cache invalidation funcionando
- [ ] Telemetria enviando eventos

### Documentação
- [ ] README.md atualizado
- [ ] Documentação de APIs (JSDoc)
- [ ] Guia de uso para alunos
- [ ] Guia de customização (admin)

### Testes
- [ ] Testes unitários (helpers, hooks)
- [ ] Testes de integração (fluxos completos)
- [ ] Testes manuais (desktop, mobile, tablet)
- [ ] Performance testada (Lighthouse)
- [ ] Acessibilidade testada (screen reader)

---

## 🚀 PRÓXIMOS PASSOS

### Após E10
1. **Testes com Usuários Reais** (1 semana)
   - Beta com 50 alunos
   - Coleta de feedback
   - Ajustes finos

2. **Migração dos 600 Alunos** (2 semanas)
   - Importação de dados
   - Onboarding
   - Suporte

3. **Lançamento Público** (1 mês)
   - Marketing
   - Captação de novos alunos
   - Monitoramento

---

## 📞 CONTATO E SUPORTE

**Desenvolvedor:** Manus  
**Product Owner:** Fernando  
**Documentação:** `/docs/E10-DASHBOARD-ALUNO/`  
**Issues:** GitHub Issues  
**Chat:** Slack #e10-dashboard-aluno

---

**Última Atualização:** 08 de Janeiro de 2025  
**Versão do Documento:** 1.0
