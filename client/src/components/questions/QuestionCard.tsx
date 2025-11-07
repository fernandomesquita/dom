/**
 * QuestionCard - Componente para exibir uma questão
 * Suporta múltipla escolha e verdadeiro/falso
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Clock, Flag, BookmarkPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CommentSection } from './CommentSection';

interface Question {
  id: number;
  uniqueCode: string;
  statementText: string;
  statementImage?: string | null;
  questionType: 'multiple_choice' | 'true_false';
  optionA?: string | null;
  optionB?: string | null;
  optionC?: string | null;
  optionD?: string | null;
  optionE?: string | null;
  difficulty?: 'easy' | 'medium' | 'hard' | null;
  examBoard?: string | null;
  examYear?: number | null;
}

interface AnswerFeedback {
  isCorrect: boolean;
  correctAnswer: string | boolean | null;
  explanation?: string | null;
  explanationImage?: string | null;
}

interface QuestionCardProps {
  question: Question;
  onSubmit: (answer: string | boolean) => Promise<AnswerFeedback>;
  onFlag?: () => void;
  onAddToNotebook?: () => void;
  showTimer?: boolean;
  disabled?: boolean;
}

const DIFFICULTY_COLORS = {
  easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const DIFFICULTY_LABELS = {
  easy: 'Fácil',
  medium: 'Média',
  hard: 'Difícil',
};

export function QuestionCard({
  question,
  onSubmit,
  onFlag,
  onAddToNotebook,
  showTimer = false,
  disabled = false,
}: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());

  // Timer
  useState(() => {
    if (!showTimer) return;
    
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  });

  const handleSubmit = async () => {
    if (isSubmitting || disabled) return;
    
    const answer = question.questionType === 'multiple_choice' 
      ? selectedAnswer 
      : trueFalseAnswer;
    
    if (answer === null) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await onSubmit(answer);
      setFeedback(result);
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isAnswered = feedback !== null;

  return (
    <div>
    <Card className="w-full">
      <CardHeader className="space-y-4">
        {/* Header com metadados */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="font-mono">
              {question.uniqueCode}
            </Badge>
            
            {question.difficulty && (
              <Badge className={DIFFICULTY_COLORS[question.difficulty]}>
                {DIFFICULTY_LABELS[question.difficulty]}
              </Badge>
            )}
            
            {question.examBoard && (
              <Badge variant="secondary">
                {question.examBoard}
                {question.examYear && ` ${question.examYear}`}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {showTimer && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="font-mono">{formatTime(timeSpent)}</span>
              </div>
            )}
            
            {onFlag && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onFlag}
                disabled={disabled}
              >
                <Flag className="h-4 w-4" />
              </Button>
            )}
            
            {onAddToNotebook && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onAddToNotebook}
                disabled={disabled}
              >
                <BookmarkPlus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Enunciado */}
        <div className="space-y-4">
          <p className="text-lg leading-relaxed">{question.statementText}</p>
          
          {question.statementImage && (
            <img
              src={question.statementImage}
              alt="Imagem da questão"
              className="max-w-full h-auto rounded-lg border"
            />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Alternativas - Múltipla Escolha */}
        {question.questionType === 'multiple_choice' && (
          <RadioGroup
            value={selectedAnswer || ''}
            onValueChange={setSelectedAnswer}
            disabled={isAnswered || disabled}
            className="space-y-3"
          >
            {['A', 'B', 'C', 'D', 'E'].map((option) => {
              const optionText = question[`option${option}` as keyof Question];
              if (!optionText) return null;
              
              const isCorrect = feedback?.correctAnswer === option;
              const isSelected = selectedAnswer === option;
              const showResult = isAnswered;
              
              return (
                <div
                  key={option}
                  className={cn(
                    'flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors',
                    showResult && isCorrect && 'border-green-500 bg-green-50 dark:bg-green-950',
                    showResult && isSelected && !isCorrect && 'border-red-500 bg-red-50 dark:bg-red-950',
                    !showResult && 'hover:bg-accent cursor-pointer'
                  )}
                >
                  <RadioGroupItem value={option} id={`option-${option}`} />
                  <Label
                    htmlFor={`option-${option}`}
                    className="flex-1 cursor-pointer font-normal leading-relaxed"
                  >
                    <span className="font-semibold mr-2">{option})</span>
                    {optionText as string}
                  </Label>
                  
                  {showResult && isCorrect && (
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </RadioGroup>
        )}

        {/* Alternativas - Verdadeiro/Falso */}
        {question.questionType === 'true_false' && (
          <div className="space-y-3">
            {[
              { value: true, label: 'Verdadeiro' },
              { value: false, label: 'Falso' },
            ].map((option) => {
              const isCorrect = feedback?.correctAnswer === option.value;
              const isSelected = trueFalseAnswer === option.value;
              const showResult = isAnswered;
              
              return (
                <button
                  key={option.value.toString()}
                  onClick={() => !isAnswered && !disabled && setTrueFalseAnswer(option.value)}
                  disabled={isAnswered || disabled}
                  className={cn(
                    'w-full flex items-center justify-between p-4 rounded-lg border-2 transition-colors text-left',
                    showResult && isCorrect && 'border-green-500 bg-green-50 dark:bg-green-950',
                    showResult && isSelected && !isCorrect && 'border-red-500 bg-red-50 dark:bg-red-950',
                    !showResult && isSelected && 'border-primary bg-accent',
                    !showResult && !isSelected && 'hover:bg-accent',
                    (isAnswered || disabled) && 'cursor-not-allowed opacity-60'
                  )}
                >
                  <span className="font-medium">{option.label}</span>
                  
                  {showResult && isCorrect && (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div
            className={cn(
              'p-4 rounded-lg border-2',
              feedback.isCorrect
                ? 'border-green-500 bg-green-50 dark:bg-green-950'
                : 'border-red-500 bg-red-50 dark:bg-red-950'
            )}
          >
            <div className="flex items-start gap-3">
              {feedback.isCorrect ? (
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              
              <div className="flex-1 space-y-2">
                <p className="font-semibold">
                  {feedback.isCorrect ? 'Resposta Correta!' : 'Resposta Incorreta'}
                </p>
                
                {feedback.explanation && (
                  <p className="text-sm leading-relaxed">{feedback.explanation}</p>
                )}
                
                {feedback.explanationImage && (
                  <img
                    src={feedback.explanationImage}
                    alt="Explicação"
                    className="max-w-full h-auto rounded-lg border mt-2"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        {!isAnswered && (
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              disabled ||
              (question.questionType === 'multiple_choice' && !selectedAnswer) ||
              (question.questionType === 'true_false' && trueFalseAnswer === null)
            }
            className="w-full"
          >
            {isSubmitting ? 'Enviando...' : 'Confirmar Resposta'}
          </Button>
        )}
      </CardFooter>
    </Card>

    {/* Seção de comentários (aparece após responder) */}
    {feedback && (
      <div className="mt-6">
        <CommentSection
          questionId={question.id}
          currentUserId={undefined} // TODO: Pegar do useAuth quando integrado
        />
      </div>
    )}
  </div>
  );
}
