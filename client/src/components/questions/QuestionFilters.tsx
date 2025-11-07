/**
 * QuestionFilters - Filtros avançados para questões
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';

export interface QuestionFiltersState {
  disciplinaId?: string;
  assuntoId?: string;
  topicoId?: string;
  questionType?: 'multiple_choice' | 'true_false';
  difficulty?: 'easy' | 'medium' | 'hard';
  examBoard?: string;
  examYear?: number;
  onlyAnswered?: boolean;
  onlyUnanswered?: boolean;
  onlyCorrect?: boolean;
  onlyWrong?: boolean;
  search?: string;
}

interface QuestionFiltersProps {
  filters: QuestionFiltersState;
  onChange: (filters: QuestionFiltersState) => void;
  disciplinas?: Array<{ id: string; nome: string }>;
  assuntos?: Array<{ id: string; nome: string; disciplinaId: string }>;
  topicos?: Array<{ id: string; nome: string; assuntoId: string }>;
  examBoards?: string[];
  examYears?: number[];
}

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Múltipla Escolha' },
  { value: 'true_false', label: 'Verdadeiro/Falso' },
];

const DIFFICULTIES = [
  { value: 'easy', label: 'Fácil' },
  { value: 'medium', label: 'Média' },
  { value: 'hard', label: 'Difícil' },
];

export function QuestionFilters({
  filters,
  onChange,
  disciplinas = [],
  assuntos = [],
  topicos = [],
  examBoards = [],
  examYears = [],
}: QuestionFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof QuestionFiltersState, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onChange({});
  };

  const activeFiltersCount = Object.keys(filters).filter(
    (key) => filters[key as keyof QuestionFiltersState] !== undefined
  ).length;

  // Filtrar assuntos pela disciplina selecionada
  const filteredAssuntos = filters.disciplinaId
    ? assuntos.filter((a) => a.disciplinaId === filters.disciplinaId)
    : assuntos;

  // Filtrar tópicos pelo assunto selecionado
  const filteredTopicos = filters.assuntoId
    ? topicos.filter((t) => t.assuntoId === filters.assuntoId)
    : topicos;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle>Filtros</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
              >
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Recolher' : 'Expandir'}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Busca por texto */}
          <div className="space-y-2">
            <Label htmlFor="search">Buscar no enunciado</Label>
            <Input
              id="search"
              placeholder="Digite palavras-chave..."
              value={filters.search || ''}
              onChange={(e) => updateFilter('search', e.target.value || undefined)}
            />
          </div>

          {/* Árvore de conhecimento */}
          <div className="space-y-4">
            <h4 className="font-medium">Árvore de Conhecimento</h4>
            
            <div className="space-y-2">
              <Label htmlFor="disciplina">Disciplina</Label>
              <Select
                value={filters.disciplinaId || ''}
                onValueChange={(value) => {
                  updateFilter('disciplinaId', value || undefined);
                  updateFilter('assuntoId', undefined);
                  updateFilter('topicoId', undefined);
                }}
              >
                <SelectTrigger id="disciplina">
                  <SelectValue placeholder="Todas as disciplinas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as disciplinas</SelectItem>
                  {disciplinas.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {filters.disciplinaId && (
              <div className="space-y-2">
                <Label htmlFor="assunto">Assunto</Label>
                <Select
                  value={filters.assuntoId || ''}
                  onValueChange={(value) => {
                    updateFilter('assuntoId', value || undefined);
                    updateFilter('topicoId', undefined);
                  }}
                >
                  <SelectTrigger id="assunto">
                    <SelectValue placeholder="Todos os assuntos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os assuntos</SelectItem>
                    {filteredAssuntos.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {filters.assuntoId && (
              <div className="space-y-2">
                <Label htmlFor="topico">Tópico</Label>
                <Select
                  value={filters.topicoId || ''}
                  onValueChange={(value) => updateFilter('topicoId', value || undefined)}
                >
                  <SelectTrigger id="topico">
                    <SelectValue placeholder="Todos os tópicos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os tópicos</SelectItem>
                    {filteredTopicos.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Tipo e Dificuldade */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={filters.questionType || ''}
                onValueChange={(value) => updateFilter('questionType', value || undefined)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os tipos</SelectItem>
                  {QUESTION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Dificuldade</Label>
              <Select
                value={filters.difficulty || ''}
                onValueChange={(value) => updateFilter('difficulty', value || undefined)}
              >
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  {DIFFICULTIES.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Banca e Ano */}
          {(examBoards.length > 0 || examYears.length > 0) && (
            <div className="grid grid-cols-2 gap-4">
              {examBoards.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="examBoard">Banca</Label>
                  <Select
                    value={filters.examBoard || ''}
                    onValueChange={(value) => updateFilter('examBoard', value || undefined)}
                  >
                    <SelectTrigger id="examBoard">
                      <SelectValue placeholder="Todas as bancas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas as bancas</SelectItem>
                      {examBoards.map((board) => (
                        <SelectItem key={board} value={board}>
                          {board}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {examYears.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="examYear">Ano</Label>
                  <Select
                    value={filters.examYear?.toString() || ''}
                    onValueChange={(value) =>
                      updateFilter('examYear', value ? parseInt(value) : undefined)
                    }
                  >
                    <SelectTrigger id="examYear">
                      <SelectValue placeholder="Todos os anos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os anos</SelectItem>
                      {examYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Filtros de resolução */}
          <div className="space-y-3">
            <h4 className="font-medium">Status de Resolução</h4>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="onlyAnswered"
                  checked={filters.onlyAnswered || false}
                  onCheckedChange={(checked) => {
                    updateFilter('onlyAnswered', checked || undefined);
                    if (checked) updateFilter('onlyUnanswered', undefined);
                  }}
                />
                <Label htmlFor="onlyAnswered" className="font-normal cursor-pointer">
                  Apenas respondidas
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="onlyUnanswered"
                  checked={filters.onlyUnanswered || false}
                  onCheckedChange={(checked) => {
                    updateFilter('onlyUnanswered', checked || undefined);
                    if (checked) {
                      updateFilter('onlyAnswered', undefined);
                      updateFilter('onlyCorrect', undefined);
                      updateFilter('onlyWrong', undefined);
                    }
                  }}
                />
                <Label htmlFor="onlyUnanswered" className="font-normal cursor-pointer">
                  Apenas não respondidas
                </Label>
              </div>

              {filters.onlyAnswered && (
                <>
                  <div className="flex items-center space-x-2 ml-6">
                    <Checkbox
                      id="onlyCorrect"
                      checked={filters.onlyCorrect || false}
                      onCheckedChange={(checked) => {
                        updateFilter('onlyCorrect', checked || undefined);
                        if (checked) updateFilter('onlyWrong', undefined);
                      }}
                    />
                    <Label htmlFor="onlyCorrect" className="font-normal cursor-pointer">
                      Apenas acertos
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 ml-6">
                    <Checkbox
                      id="onlyWrong"
                      checked={filters.onlyWrong || false}
                      onCheckedChange={(checked) => {
                        updateFilter('onlyWrong', checked || undefined);
                        if (checked) updateFilter('onlyCorrect', undefined);
                      }}
                    />
                    <Label htmlFor="onlyWrong" className="font-normal cursor-pointer">
                      Apenas erros
                    </Label>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
