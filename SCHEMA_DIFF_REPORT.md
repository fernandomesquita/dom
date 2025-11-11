# 🚨 RELATÓRIO DE DIFERENÇAS DE SCHEMA: DEV vs RAILWAY

**Data:** 10/11/2025  
**Banco DEV:** TiDB Cloud (88 tabelas)  
**Banco RAILWAY:** MySQL 9.4 (90 tabelas)

---

## ❌ RESUMO EXECUTIVO

**22 TABELAS COM PROBLEMAS CRÍTICOS** que causarão erros 500 em produção!

---

## 📊 TABELAS COM PROBLEMAS

### material_ratings
- ❌ **Colunas faltando:** comment
- ⚠️ **Colunas extras:** Nenhuma
- 🔄 **Tipos diferentes:**
  - `id`: DEV=varchar(36) vs PROD=int AUTO_INCREMENT
  - `material_id`: DEV=varchar(36) vs PROD=int
  - `user_id`: DEV=varchar(36) vs PROD=varchar(255)

### material_votes
- 🔄 **Tipos diferentes:**
  - `id`: DEV=varchar(36) vs PROD=int AUTO_INCREMENT
  - `material_id`: DEV=varchar(36) vs PROD=int
  - `user_id`: DEV=varchar(36) vs PROD=varchar(255)
  - `vote_type`: DEV=enum('up','down') vs PROD=enum('upvote','downvote')

### metas_materiais
- ❌ **Colunas faltando:** criado_em
- ⚠️ **Colunas extras:** concluido, created_at, data_conclusao
- 🔄 **Tipos diferentes:**
  - `id`: DEV=varchar(36) vs PROD=int AUTO_INCREMENT
  - `material_id`: DEV=varchar(36) vs PROD=int
  - `meta_id`: DEV=varchar(36) vs PROD=int

### metas_questoes
- ❌ **Colunas faltando:** criado_em
- ⚠️ **Colunas extras:** concluido, created_at, data_conclusao
- 🔄 **Tipos diferentes:**
  - `id`: DEV=varchar(36) vs PROD=int AUTO_INCREMENT
  - `meta_id`: DEV=varchar(36) vs PROD=int
  - `questao_id`: DEV=varchar(36) vs PROD=int

### notice_reads
- ❌ **Colunas faltando:** lido, lido_em
- ⚠️ **Colunas extras:** read_at
- 🔄 **Tipos diferentes:**
  - `id`: DEV=varchar(36) vs PROD=int AUTO_INCREMENT
  - `notice_id`: DEV=varchar(36) vs PROD=int
  - `user_id`: DEV=varchar(36) vs PROD=varchar(255)

### plan_disciplines
- 🔄 **Tipos diferentes:**
  - `created_at`: DEV=datetime vs PROD=timestamp

### plan_enrollments
- ❌ **Colunas faltando:** progress_percentage, status
- ⚠️ **Colunas extras:** created_by, daily_hours, enrollment_status, last_accessed_at
- 🔄 **Tipos diferentes:** created_at, enrolled_at, expires_at, updated_at

### planos_estudo
- ❌ **Colunas faltando:** atualizado_em, criado_em, criado_por_id, dias_disponiveis_bitmask, horas_por_dia, status, titulo, usuario_id
- ⚠️ **Colunas extras:** ativo, created_at, nome, updated_at, user_id
- 🔄 **Tipos diferentes:**
  - `id`: DEV=varchar(36) vs PROD=int AUTO_INCREMENT

### plans
- ❌ **Colunas faltando:** slug
- ⚠️ **Colunas extras:** created_by, custom_settings, deleted_at, knowledge_root_id, logo_url, paywall_required, plan_status, updated_by, version
- 🔄 **Tipos diferentes:** Múltiplos (mentor_id, price, validity_date, etc.)

### questoes
- ❌ **Colunas faltando:** alternativas, ano, ativo, banca, created_at, dificuldade, enunciado, explicacao, gabarito, topico_id, updated_at
- ⚠️ **Colunas extras:** criado_em, fonte, referencia_externa, texto_questao

### refresh_tokens
- 🔄 **Tipos diferentes:**
  - `created_at`: DEV=datetime vs PROD=timestamp
  - `expires_at`: DEV=datetime vs PROD=timestamp

### streak_logs
- 🔄 **Tipos diferentes:**
  - `date`: DEV=datetime vs PROD=date

### telemetry_events
- ❌ **Colunas faltando:** action, category, duration, event_id, metadata, properties, session_id, timestamp, timezone, user_agent, viewport, widget
- ⚠️ **Colunas extras:** event_data, event_type
- 🔄 **Tipos diferentes:**
  - `id`: DEV=varchar(255) vs PROD=int AUTO_INCREMENT

### users
- ❌ **Colunas faltando:** forum_banned, forum_banned_reason, forum_banned_until

### widget_configs
- ❌ **Colunas faltando:** is_expanded, is_visible, title, widget_type
- ⚠️ **Colunas extras:** visible, widget_id

---

## 🎯 CAUSA RAIZ

**Eu criei as 12 tabelas manualmente** ao invés de usar `mysqldump` ou `SHOW CREATE TABLE` do banco dev!

Resultado: **Estruturas inventadas** que não correspondem ao schema real usado pelo código!

---

## ✅ SOLUÇÃO

Recriar **TODAS as 22 tabelas** usando `SHOW CREATE TABLE` do banco dev para garantir 100% de compatibilidade!

---

## 📋 TABELAS QUE PRECISAM SER RECRIADAS

1. material_ratings
2. material_votes
3. metas_materiais
4. metas_questoes
5. notice_reads
6. plan_disciplines
7. plan_enrollments
8. planos_estudo
9. plans
10. questoes
11. refresh_tokens
12. streak_logs
13. telemetry_events
14. users
15. widget_configs

**Total: 15 tabelas críticas!**
