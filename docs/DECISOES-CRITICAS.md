# Decisões Críticas e Erros Corrigidos - DOM-EARA v4

## 📋 Decisões de Arquitetura

### 1. Renomeação de Tabelas do Módulo de Metas (Novembro 2025)

**Problema Identificado:**
Conflito de nomenclatura entre dois módulos distintos:
- **Módulo de Gamificação**: Usa tabela `metas` para armazenar conquistas/objetivos do usuário (questões resolvidas, materiais assistidos, horas de estudo)
- **Módulo de Cronograma de Metas**: Precisava criar tabela `metas` para armazenar metas de estudo individuais com revisão espaçada

**Impacto:**
- Impossibilidade de criar tabelas do módulo de cronograma
- Erro `Unknown column 'plano_id' in 'field list'` ao tentar inserir dados
- Conflito semântico: mesma palavra para conceitos diferentes

**Decisão Tomada:**
Renomear tabelas do **Módulo de Cronograma de Metas** para evitar conflito:

| Nome Original | Nome Novo | Justificativa |
|--------------|-----------|---------------|
| `planos_estudo` | `metas_planos_estudo` | Prefixo `metas_` indica pertencimento ao módulo de cronograma |
| `metas` | `metas_cronograma` | Diferencia "metas de estudo" (cronograma) de "metas de gamificação" (conquistas) |
| `metas_log_conclusao` | `metas_cronograma_log_conclusao` | Mantém consistência de prefixo |
| `metas_log_omissao` | `metas_cronograma_log_omissao` | Mantém consistência de prefixo |
| `metas_log_redistribuicao` | `metas_cronograma_log_redistribuicao` | Mantém consistência de prefixo |
| `metas_materiais` | `metas_cronograma_materiais` | Mantém consistência de prefixo |
| `metas_questoes` | `metas_cronograma_questoes` | Mantém consistência de prefixo |
| `metas_revisoes` | `metas_cronograma_revisoes` | Mantém consistência de prefixo |

**Arquivos Afetados:**
1. `drizzle/schema-metas.ts` - Definições de schema Drizzle
2. `server/routers/metasPlanos.ts` - Queries SQL
3. `server/routers/metasMetas.ts` - Queries SQL  
4. `server/routers/metasBatchImport.ts` - Queries SQL
5. `server/routers/metasAnalytics.ts` - Queries SQL
6. `server/helpers/metasNumeracao.ts` - Queries SQL
7. `server/helpers/metasRevisao.ts` - Queries SQL
8. `server/helpers/metasDistribuicao.ts` - Queries SQL
9. `scripts/seed-metas.mjs` - Script de seed
10. `docs/MODULO-METAS.md` - Documentação técnica

**Ações Necessárias:**
- [ ] Atualizar schema Drizzle (`drizzle/schema-metas.ts`)
- [ ] Atualizar todos os routers (4 arquivos)
- [ ] Atualizar todos os helpers (3 arquivos)
- [ ] Atualizar scripts de seed
- [ ] Atualizar documentação técnica
- [ ] Executar `pnpm db:push` para aplicar mudanças
- [ ] Testar todos os endpoints tRPC
- [ ] Validar frontend (páginas continuam funcionando)

**Alternativas Consideradas:**
1. ❌ Renomear tabela `metas` do módulo de gamificação → Rejeitado (módulo já em produção, breaking change)
2. ❌ Usar schema/database separado → Rejeitado (complexidade desnecessária, dificulta joins)
3. ✅ Renomear tabelas do módulo de cronograma → **Escolhido** (módulo novo, sem impacto em produção)

**Referências:**
- Issue: Conflito de nomenclatura detectado durante seed de dados
- Data: Novembro 2025
- Responsável: Sistema de IA Manus

---

## 🐛 Erros Críticos Corrigidos

### 1. Erro de Schema não Sincronizado (Novembro 2025)

**Erro:**
```
Error: Unknown column 'plano_id' in 'field list'
```

**Causa Raiz:**
- Schema Drizzle definido em `drizzle/schema-metas.ts` não foi aplicado ao banco de dados
- Comando `pnpm db:push` não executado após criação do schema
- Tabela `metas` antiga do módulo de gamificação estava presente no banco

**Solução:**
1. Renomear tabelas para evitar conflito (ver decisão acima)
2. Executar `pnpm db:push` para sincronizar schema
3. Criar script de seed simplificado com `CREATE TABLE IF NOT EXISTS`

**Prevenção Futura:**
- Sempre executar `pnpm db:push` após modificar schemas
- Usar nomes de tabelas únicos e descritivos
- Documentar conflitos de nomenclatura

---

### 2. Erro de Importação de Materiais (Novembro 2025)

**Erro:**
```
Error: Cannot find module '@/components/ui/dialog'
```

**Causa Raiz:**
- Componente Dialog do shadcn/ui não estava instalado
- Frontend tentando usar componente não disponível

**Solução:**
```bash
pnpm dlx shadcn@latest add dialog
```

**Prevenção Futura:**
- Verificar dependências de componentes shadcn/ui antes de usar
- Manter lista de componentes instalados em documentação

---

## 📝 Lições Aprendidas

### 1. Nomenclatura de Tabelas
- **Sempre usar prefixos** para agrupar tabelas de um módulo
- **Evitar nomes genéricos** como `metas`, `users`, `items`
- **Documentar semântica** de cada tabela no schema

### 2. Sincronização de Schema
- **Nunca assumir** que schema está sincronizado
- **Sempre executar** `pnpm db:push` após mudanças
- **Validar estrutura** com `DESCRIBE table` antes de inserir dados

### 3. Seed de Dados
- **Criar tabelas no seed** com `CREATE TABLE IF NOT EXISTS` para ambientes limpos
- **Validar foreign keys** antes de inserir dados relacionados
- **Usar transações** para garantir atomicidade

---

## 🔄 Histórico de Mudanças

| Data | Mudança | Motivo | Impacto |
|------|---------|--------|---------|
| Nov 2025 | Renomeação de tabelas do módulo de metas | Conflito com módulo de gamificação | Alto - Requer atualização de 10+ arquivos |
| Nov 2025 | Criação de script de seed simplificado | Facilitar testes e demonstrações | Médio - Melhora DX |
| Nov 2025 | Integração com módulo de materiais | Vincular metas a materiais existentes | Médio - Nova funcionalidade |

---

## ⚠️ Avisos para Desenvolvedores

### Ao Adicionar Novos Módulos:
1. **Verifique conflitos de nomenclatura** com tabelas existentes
2. **Use prefixos descritivos** para agrupar tabelas relacionadas
3. **Documente decisões** neste arquivo
4. **Execute `pnpm db:push`** após definir schemas
5. **Crie seeds de teste** para validar estrutura

### Ao Modificar Schemas Existentes:
1. **Nunca renomeie tabelas** em produção sem migration strategy
2. **Use ALTER TABLE** para mudanças não-destrutivas
3. **Crie backups** antes de mudanças estruturais
4. **Teste em ambiente de desenvolvimento** primeiro
5. **Atualize documentação** após cada mudança

---

## 📚 Referências

- [Drizzle ORM - Schema Declaration](https://orm.drizzle.team/docs/sql-schema-declaration)
- [MySQL - Naming Conventions](https://dev.mysql.com/doc/refman/8.0/en/identifier-case-sensitivity.html)
- [Database Design Best Practices](https://www.sqlshack.com/learn-sql-naming-conventions/)
