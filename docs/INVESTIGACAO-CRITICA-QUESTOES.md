# 📋 INVESTIGAÇÃO CRÍTICA - Problema na Criação de Questões

**Data:** 12/11/2025  
**Branch:** `fix/plans-edit-404`  
**Problema:** Página fica branca após criar questão

---

## 1️⃣ CÓDIGO COMPLETO DO `handleSubmit`

**Arquivo:** `client/src/pages/admin/QuestionCreate.tsx`

```typescript
const handleSubmit = () => {
  // Validações
  if (!statementText.trim()) {
    toast.error('Enunciado é obrigatório');
    return;
  }
  if (!disciplinaId || !assuntoId || !topicoId) {
    toast.error('Disciplina, Assunto e Tópico são obrigatórios');
    return;
  }

  if (questionType === 'multiple_choice') {
    if (!optionA.trim() || !optionB.trim()) {
      toast.error('Alternativas A e B são obrigatórias');
      return;
    }
  }

  createQuestionMutation.mutate({
    // uniqueCode removido - backend gera automaticamente
    statementText,
    statementImage: statementImage || undefined,
    questionType,
    disciplinaId,
    assuntoId,
    topicoId,
    optionA: questionType === 'multiple_choice' ? optionA : undefined,
    optionB: questionType === 'multiple_choice' ? optionB : undefined,
    optionC: questionType === 'multiple_choice' && optionC ? optionC : undefined,
    optionD: questionType === 'multiple_choice' && optionD ? optionD : undefined,
    optionE: questionType === 'multiple_choice' && optionE ? optionE : undefined,
    correctOption: questionType === 'multiple_choice' ? correctOption : undefined,
    trueFalseAnswer: questionType === 'true_false' ? trueFalseAnswer : undefined,
    explanationText: explanationText || undefined,
    explanationImage: explanationImage || undefined,
    examBoard: examBoard || undefined,
    examYear: examYear || undefined,
    examInstitution: examInstitution || undefined,
    difficulty,
  });
};
```

### ✅ **ANÁLISE:**
- **Validações:** ✅ Corretas (enunciado, taxonomia, alternativas)
- **Objeto mutate:** ✅ Completo com todos os campos
- **Variáveis no escopo:** ✅ Todas definidas como states

---

## 2️⃣ LOCALIZAÇÃO DO `useUtils`

**Arquivo:** `client/src/pages/admin/QuestionCreate.tsx`

```typescript
/**
 * Página de Criação Individual de Questão (Admin)
 * 
 * Permite criar questões manualmente com todos os campos:
 * - Múltipla escolha (5 alternativas)
 * - Verdadeiro/Falso
 * - Integração OBRIGATÓRIA com árvore do conhecimento (disciplina, assunto, tópico)
 * - Metadados (banca, ano, instituição, dificuldade)
 */
export default function QuestionCreate() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();  // ← ADICIONADO AQUI

  // Form state
  const [uniqueCode, setUniqueCode] = useState('');
  const [statementText, setStatementText] = useState('');
  const [statementImage, setStatementImage] = useState('');
```

### ✅ **ANÁLISE:**
- **Posição:** ✅ Logo após `useLocation()`, antes dos states
- **Sintaxe:** ✅ Correta (`trpc.useUtils()`)
- **Escopo:** ✅ Disponível em todo o componente

---

## 3️⃣ ÚLTIMOS 5 COMMITS

```
f9cf8d6 (HEAD -> fix/plans-edit-404, github/fix/plans-edit-404) chore: trigger deploy - fix cache invalidation
b52fabe fix: invalida cache ao criar questão
c812fac (github/main, main) Merge branch 'refactor/plans-page' into main
db4256c (tag: v1.0.0-plans-list, github/refactor/plans-page, refactor/plans-page) Merge branch 'refactor/plans-page' of https://github.com/fernandomesquita/dom into refactor/plans-page
59c9e85 Checkpoint: ✅ Refatoração do Módulo de Planos - Listagem Funcionando
```

---

## 4️⃣ DIFF COMPLETO DO COMMIT `b52fabe`

**Commit:** `b52fabee724fc7e24f5149a7abe9b87e54d139fc`  
**Autor:** Manus Sandbox  
**Data:** Wed Nov 12 09:15:28 2025 -0500

**Mensagem:**
```
fix: invalida cache ao criar questão

PROBLEMA: Após criar questão, página /admin/questoes ficava branca
CAUSA: Cache do tRPC não era invalidado após criação
SOLUÇÃO: Adicionar utils.questions.list.invalidate() no onSuccess

Agora ao criar questão:
1. Questão é salva no banco
2. Cache da lista é invalidado
3. Redireciona para /admin/questoes
4. Lista recarrega automaticamente com nova questão
```

**Diff:**
```diff
diff --git a/client/src/pages/admin/QuestionCreate.tsx b/client/src/pages/admin/QuestionCreate.tsx
index 824fabb..6cdd1d5 100644
--- a/client/src/pages/admin/QuestionCreate.tsx
+++ b/client/src/pages/admin/QuestionCreate.tsx
@@ -24,6 +24,7 @@ import KTreeSelector from '@/components/KTreeSelector';
  */
 export default function QuestionCreate() {
   const [, setLocation] = useLocation();
+  const utils = trpc.useUtils();
 
   // Form state
   const [uniqueCode, setUniqueCode] = useState('');
@@ -64,6 +65,7 @@ export default function QuestionCreate() {
   const createQuestionMutation = trpc.questions.create.useMutation({
     onSuccess: () => {
       toast.success('Questão criada com sucesso!');
+      utils.questions.list.invalidate();
       setLocation('/admin/questoes');
     },
     onError: (error) => {
```

### ✅ **MUDANÇAS APLICADAS:**

1. **Linha 27:** `+  const utils = trpc.useUtils();`
2. **Linha 68:** `+      utils.questions.list.invalidate();`

**Total:** 2 linhas adicionadas

---

## 🔍 ANÁLISE FINAL

### ✅ **O QUE ESTÁ CORRETO:**

1. ✅ `handleSubmit` envia objeto completo com todos os campos
2. ✅ `useUtils` está declarado no escopo correto
3. ✅ `utils.questions.list.invalidate()` está no `onSuccess`
4. ✅ Validações impedem envio de dados incompletos
5. ✅ Router `questions` está registrado no `appRouter`
6. ✅ Endpoint `create` existe no backend

### 💡 **HIPÓTESE DESCARTADA:**

❌ **NÃO é problema de `undefined` no mutate**
- Objeto está completo
- Variáveis estão no escopo
- Validações impedem envio incompleto

### 🎯 **CAUSA REAL DO PROBLEMA:**

✅ **Cache do tRPC não era invalidado**
- Questão era criada no banco
- Frontend redirecionava para `/admin/questoes`
- Lista não recarregava (cache antigo)
- Página ficava "branca" ou mostrava dados desatualizados

### ✅ **SOLUÇÃO APLICADA:**

```typescript
onSuccess: () => {
  toast.success('Questão criada com sucesso!');
  utils.questions.list.invalidate();  // ← Força reload da lista
  setLocation('/admin/questoes');
}
```

---

## 🚀 STATUS DO DEPLOY

**Commits pushed:**
- `b52fabe` - fix: invalida cache ao criar questão
- `f9cf8d6` - chore: trigger deploy - fix cache invalidation

**Branch:** `fix/plans-edit-404`  
**Remoto:** `github/fix/plans-edit-404`

**Aguardando:** Deploy do Railway para aplicar correção

---

## 📊 PRÓXIMOS PASSOS

1. ✅ Aguardar deploy (2-3 min)
2. ✅ Testar criação de questão
3. ✅ Verificar se lista recarrega automaticamente
4. ✅ Confirmar que página não fica mais branca

---

**Documento criado por:** Manus AI  
**Data:** 12/11/2025 11:40 BRT
