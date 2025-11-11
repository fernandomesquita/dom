import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';
import KTreeSelector from '@/components/KTreeSelector';

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

  // Form state
  const [uniqueCode, setUniqueCode] = useState('');
  const [statementText, setStatementText] = useState('');
  const [statementImage, setStatementImage] = useState('');
  const [questionType, setQuestionType] = useState<'multiple_choice' | 'true_false'>('multiple_choice');
  
  // Taxonomia (OBRIGATÓRIA)
  const [disciplinaId, setDisciplinaId] = useState('');
  const [disciplinaNome, setDisciplinaNome] = useState('');
  const [assuntoId, setAssuntoId] = useState('');
  const [assuntoNome, setAssuntoNome] = useState('');
  const [topicoId, setTopicoId] = useState('');
  const [topicoNome, setTopicoNome] = useState('');

  // Alternativas (múltipla escolha)
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [optionE, setOptionE] = useState('');
  const [correctOption, setCorrectOption] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');

  // Verdadeiro/Falso
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<boolean>(true);

  // Explicação
  const [explanationText, setExplanationText] = useState('');
  const [explanationImage, setExplanationImage] = useState('');

  // Metadados
  const [examBoard, setExamBoard] = useState('');
  const [examYear, setExamYear] = useState<number | undefined>(undefined);
  const [examInstitution, setExamInstitution] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // Mutation
  const createQuestionMutation = trpc.questions.create.useMutation({
    onSuccess: () => {
      toast.success('Questão criada com sucesso!');
      setLocation('/admin/questoes');
    },
    onError: (error) => {
      toast.error(`Erro ao criar questão: ${error.message}`);
    },
  });

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
      uniqueCode: uniqueCode || undefined,
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

  return (
    <AdminLayout
      title="Criar Nova Questão"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Questões', href: '/admin/questoes' },
        { label: 'Nova Questão' },
      ]}
      actions={
        <Button variant="outline" onClick={() => setLocation('/admin/questoes')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      }
    >
      <div className="max-w-4xl space-y-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>
              Código único e tipo da questão
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="uniqueCode">Código Único (opcional - gerado automaticamente se vazio)</Label>
                <Input
                  id="uniqueCode"
                  placeholder="Deixe vazio para gerar automaticamente"
                  value={uniqueCode}
                  onChange={(e) => setUniqueCode(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="questionType">Tipo de Questão *</Label>
                <Select value={questionType} onValueChange={(v: any) => setQuestionType(v)}>
                  <SelectTrigger id="questionType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                    <SelectItem value="true_false">Verdadeiro/Falso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enunciado */}
        <Card>
          <CardHeader>
            <CardTitle>Enunciado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="statementText">Texto do Enunciado *</Label>
              <Textarea
                id="statementText"
                placeholder="Digite o enunciado da questão..."
                rows={6}
                value={statementText}
                onChange={(e) => setStatementText(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="statementImage">URL da Imagem (opcional)</Label>
              <Input
                id="statementImage"
                placeholder="https://..."
                value={statementImage}
                onChange={(e) => setStatementImage(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Árvore do Conhecimento (OBRIGATÓRIA) */}
        <Card>
          <CardHeader>
            <CardTitle>Árvore do Conhecimento *</CardTitle>
            <CardDescription>
              Selecione Disciplina → Assunto → Tópico (todos obrigatórios)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <KTreeSelector
              disciplinaId={disciplinaId}
              disciplinaNome={disciplinaNome}
              assuntoId={assuntoId}
              assuntoNome={assuntoNome}
              topicoId={topicoId || ''}
              topicoNome={topicoNome || ''}
              onDisciplinaChange={(id, nome) => {
                setDisciplinaId(id);
                setDisciplinaNome(nome);
                setAssuntoId('');
                setAssuntoNome('');
                setTopicoId('');
                setTopicoNome('');
              }}
              onAssuntoChange={(id, nome) => {
                setAssuntoId(id);
                setAssuntoNome(nome);
                setTopicoId('');
                setTopicoNome('');
              }}
              onTopicoChange={(id, nome) => {
                setTopicoId(id);
                setTopicoNome(nome);
              }}
            />
          </CardContent>
        </Card>

        {/* Alternativas (Múltipla Escolha) */}
        {questionType === 'multiple_choice' && (
          <Card>
            <CardHeader>
              <CardTitle>Alternativas</CardTitle>
              <CardDescription>
                Preencha as alternativas (A e B são obrigatórias). Marque a correta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={correctOption} onValueChange={(v: any) => setCorrectOption(v)}>
                {['A', 'B', 'C', 'D', 'E'].map((letter) => (
                  <div key={letter} className="flex items-start gap-4">
                    <RadioGroupItem value={letter} id={`option-${letter}`} className="mt-3" />
                    <div className="flex-1 space-y-2">
                      <Label htmlFor={`text-${letter}`}>
                        Alternativa {letter} {(letter === 'A' || letter === 'B') && '*'}
                      </Label>
                      <Textarea
                        id={`text-${letter}`}
                        placeholder={`Texto da alternativa ${letter}...`}
                        rows={2}
                        value={
                          letter === 'A' ? optionA :
                          letter === 'B' ? optionB :
                          letter === 'C' ? optionC :
                          letter === 'D' ? optionD :
                          optionE
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          if (letter === 'A') setOptionA(value);
                          else if (letter === 'B') setOptionB(value);
                          else if (letter === 'C') setOptionC(value);
                          else if (letter === 'D') setOptionD(value);
                          else setOptionE(value);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* Verdadeiro/Falso */}
        {questionType === 'true_false' && (
          <Card>
            <CardHeader>
              <CardTitle>Resposta Correta</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={trueFalseAnswer ? 'true' : 'false'} 
                onValueChange={(v) => setTrueFalseAnswer(v === 'true')}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="true" />
                  <Label htmlFor="true">Verdadeiro</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="false" />
                  <Label htmlFor="false">Falso</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* Explicação */}
        <Card>
          <CardHeader>
            <CardTitle>Explicação (opcional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="explanationText">Texto da Explicação</Label>
              <Textarea
                id="explanationText"
                placeholder="Explique a resposta correta..."
                rows={4}
                value={explanationText}
                onChange={(e) => setExplanationText(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="explanationImage">URL da Imagem</Label>
              <Input
                id="explanationImage"
                placeholder="https://..."
                value={explanationImage}
                onChange={(e) => setExplanationImage(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Metadados */}
        <Card>
          <CardHeader>
            <CardTitle>Metadados</CardTitle>
            <CardDescription>
              Informações sobre banca, ano e dificuldade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="examBoard">Banca</Label>
                <Input
                  id="examBoard"
                  placeholder="Ex: CESPE"
                  value={examBoard}
                  onChange={(e) => setExamBoard(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="examYear">Ano</Label>
                <Input
                  id="examYear"
                  type="number"
                  placeholder="2024"
                  value={examYear || ''}
                  onChange={(e) => setExamYear(e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="examInstitution">Instituição</Label>
              <Input
                id="examInstitution"
                placeholder="Ex: Polícia Federal"
                value={examInstitution}
                onChange={(e) => setExamInstitution(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Dificuldade *</Label>
              <Select value={difficulty} onValueChange={(v: any) => setDifficulty(v)}>
                <SelectTrigger id="difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Fácil</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="hard">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex justify-end gap-4">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/admin')}
            disabled={createQuestionMutation.isPending}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={createQuestionMutation.isPending}
          >
            {createQuestionMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            <Save className="mr-2 h-4 w-4" />
            Criar Questão
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
