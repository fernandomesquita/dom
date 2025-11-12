# ⚠️ Erros Críticos - Sistema DOM-EARA

**Data de Criação:** 10/11/2025  
**Responsável:** Documentação de Erros do Manus AI

---

## 📋 Propósito

Este documento registra erros críticos cometidos durante o desenvolvimento que devem ser evitados no futuro.

---

## ❌ Erro #1: Inventar Informações Não Verificadas

**Data:** 10/11/2025  
**Contexto:** Desenvolvimento de sistema de autenticação e footer

**Erro Cometido:**
- Inventar nome da empresa como "Domínio Operacional Modular" sem verificar
- Assumir que mudanças no banco de desenvolvimento se aplicam automaticamente à produção
- Não verificar se usuário master@dom.com existe em produção antes de tentar login

**Impacto:**
- Footer incorreto exibido no dashboard
- Login falhando em produção por usuário inexistente
- Threads do fórum não encontradas em produção

**Correção Necessária:**
1. Sempre verificar informações reais antes de usar
2. Distinguir claramente entre ambiente dev e produção
3. Fazer push explícito de schema e dados para produção quando necessário

**Lição Aprendida:**
> **NUNCA invente informações.** Se não souber, pergunte ao usuário ou verifique no código/banco de dados existente.

---

## 🔧 Checklist de Prevenção

Antes de implementar qualquer funcionalidade:

- [ ] Verificar informações reais no código existente
- [ ] Confirmar se mudanças afetam dev, produção ou ambos
- [ ] Testar em produção após mudanças no banco de dados
- [ ] Não assumir nomes, textos ou dados sem verificar
- [ ] Perguntar ao usuário quando houver dúvida

---

## 📝 Registro de Erros

### Erro #1: Nome da Empresa Inventado
- **O que foi feito:** Footer com "Domínio Operacional Modular"
- **O que deveria ser:** Verificar footer das outras páginas primeiro
- **Status:** Pendente correção

### Erro #2: Assumir Sincronização Dev → Prod
- **O que foi feito:** Criar usuário master@dom.com apenas no dev local
- **O que deveria ser:** Criar explicitamente em produção via push do schema
- **Status:** Pendente correção

### Erro #3: Threads do Fórum Não Sincronizadas
- **O que foi feito:** Testar criação de threads apenas no dev
- **O que deveria ser:** Verificar que threads criadas no dev não existem em produção
- **Status:** Pendente correção

---

## ✅ Boas Práticas

1. **Sempre verificar antes de assumir**
   - Ler código existente
   - Consultar banco de dados
   - Perguntar ao usuário quando em dúvida

2. **Distinguir ambientes**
   - Dev: Ambiente local de desenvolvimento
   - Produção: Ambiente real acessível aos usuários
   - Mudanças no dev NÃO se aplicam automaticamente à produção

3. **Testar em produção**
   - Após push de schema: testar funcionalidades afetadas
   - Após criar usuários: verificar se existem em produção
   - Após mudanças de UI: verificar em todas as páginas

---

## 📚 Referências

- Documento de autenticação: `DIAGNOSTICO_AUTENTICACAO.md`
- TODO do projeto: `todo.md`
- Changelog: `CHANGELOG.md`
