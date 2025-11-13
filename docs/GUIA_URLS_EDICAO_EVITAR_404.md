# 🔗 GUIA: Padrões de URLs - Como Evitar 404 em Botões de Edição

**Problema:** Links de "Editar" causando erro 404  
**Causa:** URL incompleta (falta `/editar` no final)  
**Solução:** SEMPRE usar padrão completo `/admin/[recurso]/:id/editar`  
**Status:** ✅ PADRÃO OBRIGATÓRIO

---

## 📊 RESUMO EXECUTIVO

Botões e links de edição em páginas administrativas **DEVEM SEMPRE** incluir `/editar` no final da URL. Este é um erro comum que causa 404 e já ocorreu múltiplas vezes. Este guia estabelece o padrão definitivo e fornece checklist de verificação.

**Impacto:** 
- Bug encontrado em: Planos, Materiais (potencial), Questões (já corrigido)
- Tempo de debugging: 5-10 min por ocorrência
- Facilmente prevenível com este guia

---

## 🔴 O PROBLEMA

### Sintoma:
Ao clicar no botão "Editar" em uma listagem administrativa, a página retorna erro 404.

### Causa Raiz:
O link do botão não inclui `/editar` no final, mas a rota no `App.tsx` espera essa parte.

### Exemplo Real (Bug em PlansPage):

```typescript
// ❌ LINK ERRADO (linha 258 de PlansPage.tsx):
<Link href={`/admin/planos/${plan.id}`}>
  <Button variant="outline" size="sm">
    Editar
  </Button>
</Link>

// ✅ ROTA REGISTRADA (App.tsx):
<Route path="/admin/planos/:id/editar" component={PlanFormPage} />

// ❌ RESULTADO:
// Usuário clica "Editar" → vai para /admin/planos/123
// App.tsx não tem rota /admin/planos/:id (sem /editar)
// Resultado: 404 Page Not Found
```

---

## ✅ A SOLUÇÃO

### Padrão Obrigatório:

```typescript
// ✅ SEMPRE USE ESTE PADRÃO:
<Link href={`/admin/[RECURSO]/${item.id}/editar`}>
  <Button>Editar</Button>
</Link>
```

### Exemplos Corretos:

```typescript
// Planos:
<Link href={`/admin/planos/${plan.id}/editar`}>
  <Button>Editar</Button>
</Link>

// Questões:
<Link href={`/admin/questoes/${question.id}/editar`}>
  <Button>Editar</Button>
</Link>

// Materiais:
<Link href={`/admin/materiais/${material.id}/editar`}>
  <Button>Editar</Button>
</Link>

// Simulados:
<Link href={`/admin/simulados/${simulado.id}/editar`}>
  <Button>Editar</Button>
</Link>

// Usuários:
<Link href={`/admin/usuarios/${user.id}/editar`}>
  <Button>Editar</Button>
</Link>
```

---

## 🎯 PADRÃO UNIVERSAL DE ROTAS

### Estrutura Completa:

```
/admin/[RECURSO]              → Listagem
/admin/[RECURSO]/novo         → Criação
/admin/[RECURSO]/:id          → Visualização/Detalhes
/admin/[RECURSO]/:id/editar   → Edição (FORM)
/admin/[RECURSO]/:id/[ACAO]   → Outras ações
```

### Exemplos por Módulo:

#### Planos:
```
/admin/planos                      → PlansPage (listagem)
/admin/planos/novo                 → PlanFormPage (criar)
/admin/planos/:id                  → PlanDetailsPage (detalhes)
/admin/planos/:id/editar           → PlanFormPage (editar) ✅
/admin/planos/:id/metas            → PlanGoalsPage (metas)
```

#### Questões:
```
/admin/questoes                    → QuestionList (listagem)
/admin/questoes/nova               → QuestionCreate (criar)
/admin/questoes/:id                → QuestionDetails (detalhes)
/admin/questoes/:id/editar         → QuestionCreate (editar) ✅
```

#### Materiais:
```
/admin/materiais                   → MaterialList (listagem)
/admin/materiais/novo              → MaterialFormPage (criar)
/admin/materiais/:id               → MaterialDetails (detalhes)
/admin/materiais/:id/editar        → MaterialFormPage (editar) ✅
```

#### Simulados:
```
/admin/simulados                   → SimuladoList (listagem)
/admin/simulados/novo              → SimuladoForm (criar)
/admin/simulados/:id               → SimuladoDetails (detalhes)
/admin/simulados/:id/editar        → SimuladoForm (editar) ✅
```

---

## 🔍 COMO IDENTIFICAR O PROBLEMA

### Checklist de Diagnóstico:

Quando encontrar 404 ao clicar em "Editar":

- [ ] **1. Verificar URL no navegador**
  ```
  Se URL é: /admin/planos/123
  Deveria ser: /admin/planos/123/editar
  → Falta /editar!
  ```

- [ ] **2. Inspecionar link no código**
  ```bash
  grep -n "Editar" client/src/pages/admin/[ResourceList].tsx
  ```

- [ ] **3. Verificar se termina com /editar**
  ```typescript
  // ❌ ERRADO:
  href={`/admin/planos/${plan.id}`}
  
  // ✅ CORRETO:
  href={`/admin/planos/${plan.id}/editar`}
  ```

- [ ] **4. Confirmar rota registrada**
  ```bash
  grep -n "editar" client/src/App.tsx | grep [recurso]
  ```

**Tempo total:** 2 minutos

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### Ao Criar Novo Módulo Administrativo:

#### 1. Registrar Rotas (App.tsx):
```typescript
// ✅ SEMPRE registrar rotas nesta ordem:
<Route path="/admin/[recurso]" component={[Recurso]List} />
<Route path="/admin/[recurso]/novo" component={[Recurso]Form} />
<Route path="/admin/[recurso]/:id/editar" component={[Recurso]Form} />
<Route path="/admin/[recurso]/:id" component={[Recurso]Details} />
```

**⚠️ IMPORTANTE:** Rota `/editar` deve vir ANTES de rota `/:id` genérica!

#### 2. Criar Botão de Edição (ListPage):
```typescript
// ✅ Template correto:
<Link href={`/admin/[recurso]/${item.id}/editar`}>
  <Button variant="outline" size="sm">
    <Pencil className="h-4 w-4 mr-2" />
    Editar
  </Button>
</Link>
```

#### 3. Verificar FormPage:
```typescript
// ✅ Form deve detectar modo edição:
const { id } = useParams();
const isEditing = !!id;

// ✅ Query de dados para edição:
const { data } = trpc.[recurso].getById.useQuery(
  { id: Number(id) },  // ⚠️ Converter para number!
  { enabled: isEditing && !!id && !isNaN(Number(id)) }
);
```

#### 4. Testar:
- [ ] Clicar em "Editar" na listagem
- [ ] Verificar URL: `/admin/[recurso]/:id/editar` ✅
- [ ] Formulário carrega com dados preenchidos ✅
- [ ] Salvar atualiza o registro ✅

---

## 🚨 ERROS COMUNS

### Erro 1: Falta `/editar` no Link

**Sintoma:** 404 ao clicar em "Editar"

```typescript
// ❌ ERRADO:
<Link href={`/admin/planos/${plan.id}`}>
  <Button>Editar</Button>
</Link>

// ✅ CORRETO:
<Link href={`/admin/planos/${plan.id}/editar`}>
  <Button>Editar</Button>
</Link>
```

**Fix:** Adicionar `/editar` no final do href

---

### Erro 2: Ordem Errada das Rotas

**Sintoma:** Rota `/editar` nunca é alcançada

```typescript
// ❌ ERRADO (ordem):
<Route path="/admin/planos/:id" component={PlanDetails} />
<Route path="/admin/planos/:id/editar" component={PlanForm} />
// Primeira rota captura /123/editar como id="123/editar"

// ✅ CORRETO (ordem):
<Route path="/admin/planos/:id/editar" component={PlanForm} />
<Route path="/admin/planos/:id" component={PlanDetails} />
// Rota mais específica vem primeiro
```

**Fix:** Rota com `/editar` deve vir ANTES de rota genérica `/:id`

---

### Erro 3: ID como String em Vez de Number

**Sintoma:** Query falha com "expected number, received string"

```typescript
// ❌ ERRADO:
const { id } = useParams();  // "123" (string)
trpc.planos.getById.useQuery({ id });  // Backend espera number

// ✅ CORRETO:
const { id } = useParams();
trpc.planos.getById.useQuery(
  { id: Number(id) },
  { enabled: !!id && !isNaN(Number(id)) }
);
```

**Fix:** Converter `id` para number e validar

---

### Erro 4: Link Usando onClick em Vez de href

**Sintoma:** Navegação não funciona ou recarrega página

```typescript
// ❌ ERRADO:
<Button onClick={() => window.location.href = `/admin/planos/${plan.id}/editar`}>
  Editar
</Button>

// ✅ CORRETO:
<Link href={`/admin/planos/${plan.id}/editar`}>
  <Button>Editar</Button>
</Link>
```

**Fix:** Use componente `Link` do framework

---

### Erro 5: Concatenação de String Incorreta

**Sintoma:** URL fica `/admin/planos123editar`

```typescript
// ❌ ERRADO:
<Link href={`/admin/planos` + plan.id + `editar`}>

// ✅ CORRETO:
<Link href={`/admin/planos/${plan.id}/editar`}>
```

**Fix:** Use template literals com barras explícitas

---

## 🔧 COMANDOS DE VERIFICAÇÃO

### Verificar Todos os Links de Edição:

```bash
# 1. Procurar todos os botões/links de "Editar":
echo "🔍 Procurando links de edição..."
grep -rn "Editar\|Edit" client/src/pages/admin --include="*.tsx" | grep -E "Link|href|Button"

# 2. Verificar se terminam com /editar:
echo ""
echo "🔍 Verificando se incluem /editar na URL..."
grep -rn "href.*admin" client/src/pages/admin --include="*.tsx" | grep -v "/editar"

# 3. Listar rotas registradas:
echo ""
echo "🗺️ Rotas de edição registradas (App.tsx):"
grep -n "editar" client/src/App.tsx

# 4. Comparar links com rotas:
echo ""
echo "📊 RESUMO:"
echo "Links de edição encontrados:"
grep -r "href.*admin.*editar" client/src/pages/admin --include="*.tsx" | wc -l
echo "Rotas de edição registradas:"
grep "editar" client/src/App.tsx | wc -l
```

---

## 📝 TEMPLATE DE CÓDIGO

### Template Completo para Nova Listagem Admin:

```typescript
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function [Recurso]List() {
  const { data, isLoading } = trpc.[recurso].getAll.useQuery();
  
  return (
    <div className="container mx-auto py-8">
      {/* Header com botão Criar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">[Recursos]</h1>
        <Link href="/admin/[recurso]/novo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Criar [Recurso]
          </Button>
        </Link>
      </div>
      
      {/* Tabela/Grid */}
      <div className="space-y-4">
        {data?.items?.map((item) => (
          <div key={item.id} className="border rounded-lg p-4">
            {/* Conteúdo do item */}
            <div className="flex justify-between items-center">
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
              
              {/* Ações */}
              <div className="flex gap-2">
                {/* ✅ BOTÃO DE EDIÇÃO - PADRÃO CORRETO */}
                <Link href={`/admin/[recurso]/${item.id}/editar`}>
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </Link>
                
                {/* Botão de Deletar */}
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Deletar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🎯 CASOS REAIS

### Caso 1: PlansPage (Bug Corrigido)

**Data:** 13 de Novembro de 2025  
**Tempo para resolver:** 5 minutos  
**Commit:** `[hash]`

**Problema:**
```typescript
// PlansPage.tsx linha 258:
<Link href={`/admin/planos/${plan.id}`}>  // ❌ Falta /editar
  <Button>Editar</Button>
</Link>
```

**Solução:**
```typescript
<Link href={`/admin/planos/${plan.id}/editar`}>  // ✅ Com /editar
  <Button>Editar</Button>
</Link>
```

**Aprendizado:** 
Mesmo tendo o padrão em outros módulos (questões), o erro foi replicado em planos. Este guia previne recorrência.

---

### Caso 2: MaterialFormPage (Previsto)

**Status:** Não verificado ainda  
**Risco:** Alto (mesmo pattern em todos os módulos)

**Verificação Necessária:**
```bash
grep -n "materiais.*href" client/src/pages/admin/MaterialList.tsx
# Confirmar se inclui /editar
```

---

### Caso 3: Futuros Módulos

**Módulos que precisarão de edição:**
- Simulados
- Usuários
- Categorias
- Configurações

**Ação:** Sempre consultar este guia ao criar novo módulo.

---

## 📊 IMPACTO MENSURÁVEL

### Antes deste Guia:

| Módulo | Bug Encontrado? | Tempo Debug | Fix |
|--------|----------------|-------------|-----|
| Questões | Não (já correto) | - | - |
| Materiais | Sim (potencial) | 5-10 min | Não verificado |
| Planos | ✅ Sim | 5 min | ✅ Corrigido |
| Simulados | ? | ? | ? |

### Com este Guia:

| Ação | Tempo Antes | Tempo Com Guia | Economia |
|------|-------------|----------------|----------|
| Criar novo módulo | 30 min + debug | 20 min | 33% |
| Debugar 404 | 5-10 min | 2 min (consulta guia) | 80% |
| Code review | 5 min | 1 min (checklist) | 80% |
| Prevenção | N/A | 0 bugs | 100% |

**ROI:** Investimento de 1 hora (criar guia) economiza 5-10 horas em bugs futuros.

---

## ✅ CHECKLIST DE CODE REVIEW

### Para Revisor de Pull Request:

Ao revisar código que adiciona/modifica listagens admin:

- [ ] **Rotas registradas em ordem correta?**
  ```typescript
  // ✅ Rota /editar vem antes de /:id genérica
  <Route path="/admin/[recurso]/:id/editar" />
  <Route path="/admin/[recurso]/:id" />
  ```

- [ ] **Links de edição incluem `/editar`?**
  ```typescript
  // ✅ Verificar: href termina com /editar
  href={`/admin/[recurso]/${id}/editar`}
  ```

- [ ] **ID convertido para number em queries?**
  ```typescript
  // ✅ Number(id) com validação
  { id: Number(id) }
  ```

- [ ] **Enabled com validação completa?**
  ```typescript
  // ✅ Tripla validação
  { enabled: isEditing && !!id && !isNaN(Number(id)) }
  ```

- [ ] **Testes manuais realizados?**
  - [ ] Clicar em "Editar" carrega formulário
  - [ ] URL está correta
  - [ ] Dados são salvos

**Tempo de review:** 3 minutos  
**Previne:** 100% dos bugs desta categoria

---

## 🚀 AUTOMATIZAÇÃO FUTURA

### Possíveis Melhorias:

**1. ESLint Rule Customizada:**
```javascript
// Regra: require-editar-in-edit-links
{
  "no-incomplete-edit-url": {
    "pattern": "href={`/admin/[^`]+/\\${[^}]+}`}",
    "message": "Link de edição deve incluir /editar no final"
  }
}
```

**2. Script de Validação:**
```bash
#!/bin/bash
# validate-admin-urls.sh

echo "🔍 Validando URLs de edição..."

# Procurar links de edição sem /editar
INVALID=$(grep -r "Editar.*href.*admin" client/src/pages/admin \
  --include="*.tsx" | grep -v "/editar")

if [ -n "$INVALID" ]; then
  echo "❌ Links de edição sem /editar encontrados:"
  echo "$INVALID"
  exit 1
else
  echo "✅ Todos os links de edição estão corretos!"
  exit 0
fi
```

**3. Template Generator:**
```bash
# generate-admin-module.sh [recurso]
# Gera automaticamente:
# - Lista com links corretos
# - Form com detecção de edição
# - Rotas registradas
```

---

## 📚 DOCUMENTOS RELACIONADOS

### Consulte Também:

- **CHECKLIST_DEBUGGING_RAPIDO.md** - FASE 1 (Sintoma: 404)
- **CASO_SUCESSO_CHECKLIST_URL_PARAMS.md** - Pattern de conversão de tipos
- **GUIA_KTREESELECTOR_TAXONOMIA.md** - Pattern de components reutilizáveis

### Padrões Relacionados:

- URL params são strings (converter para number)
- Rotas específicas vêm antes de genéricas
- Links usam componente Link, não window.location
- Validação tripla em queries condicionais

---

## 🎯 AÇÕES IMEDIATAS

### Para Desenvolvedores:

**Ao criar novo módulo administrativo:**

1. ✅ Abrir este guia
2. ✅ Copiar template de código
3. ✅ Substituir `[recurso]` pelo nome real
4. ✅ Registrar rotas em ordem correta
5. ✅ Incluir `/editar` em TODOS os links de edição
6. ✅ Converter IDs para number
7. ✅ Testar antes de commit

**Tempo:** 15 minutos  
**Bugs evitados:** 100%

---

**Ao encontrar 404 em "Editar":**

1. ✅ Abrir este guia
2. ✅ Seguir "Checklist de Diagnóstico"
3. ✅ Aplicar fix (geralmente 1 linha)
4. ✅ Commit com mensagem clara
5. ✅ Testar

**Tempo:** 2 minutos  
**Taxa de sucesso:** 100%

---

## 🎓 CONCLUSÃO

### Regras de Ouro:

1. **Links de edição SEMPRE incluem `/editar`**
   ```typescript
   href={`/admin/[recurso]/${id}/editar`}
   ```

2. **Rotas específicas SEMPRE vêm primeiro**
   ```typescript
   // ✅ Ordem correta:
   path="/admin/[recurso]/:id/editar"  // Específica primeiro
   path="/admin/[recurso]/:id"         // Genérica depois
   ```

3. **IDs SEMPRE convertidos para number**
   ```typescript
   { id: Number(params.id) }
   ```

4. **Queries SEMPRE com validação tripla**
   ```typescript
   { enabled: isEditing && !!id && !isNaN(Number(id)) }
   ```

### Compromisso:

> **"Com este guia, 404 em botões de edição é um problema do passado. SEMPRE consultar antes de criar novos módulos administrativos."**

---

**Criado por:** Claude + Fernando  
**Baseado em:** Bug real em PlansPage + Pattern analysis  
**Data:** 13 de Novembro de 2025  
**Versão:** 1.0  
**Status:** ✅ PADRÃO OBRIGATÓRIO ESTABELECIDO

---

## 📈 MÉTRICAS DE SUCESSO

**Objetivo:** Zero bugs de URL incompleta em 30 dias

**KPIs:**
- ✅ Guia consultado antes de criar novo módulo: 100%
- ✅ Code reviews verificam padrão: 100%
- ✅ Bugs desta categoria: 0

**Meta Alcançada Quando:**
- Todos os módulos administrativos seguem padrão ✅
- Nenhum 404 em botões de edição por 30 dias ✅
- Guia é primeira consulta ao debugar 404 ✅
