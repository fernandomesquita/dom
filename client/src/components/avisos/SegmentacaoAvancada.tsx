import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, TrendingUp, Target } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface SegmentacaoAvancadaProps {
  onChange: (filtros: FiltrosSegmentacao) => void;
}

export interface FiltrosSegmentacao {
  diasUltimoAcesso?: number;
  disciplinas?: string[];
  taxaAcertoMin?: number;
  taxaAcertoMax?: number;
  questoesResolvidasMin?: number;
  questoesResolvidasMax?: number;
}

/**
 * Componente de filtros avançados de segmentação
 * Permite filtrar usuários por disciplinas, desempenho e atividade
 */
export function SegmentacaoAvancada({ onChange }: SegmentacaoAvancadaProps) {
  const [filtros, setFiltros] = useState<FiltrosSegmentacao>({});
  const [taxaAcerto, setTaxaAcerto] = useState<[number, number]>([0, 100]);
  const [questoesResolvidas, setQuestoesResolvidas] = useState<[number, number]>([0, 1000]);

  // Preview de alcance em tempo real
  const { data: preview, isLoading } = trpc.avisos.previewAlcance.useQuery(filtros, {
    enabled: Object.keys(filtros).length > 0,
  });

  // Atualizar filtros quando inputs mudam
  useEffect(() => {
    const novosFiltros: FiltrosSegmentacao = {};

    if (filtros.diasUltimoAcesso) {
      novosFiltros.diasUltimoAcesso = filtros.diasUltimoAcesso;
    }

    if (taxaAcerto[0] > 0 || taxaAcerto[1] < 100) {
      novosFiltros.taxaAcertoMin = taxaAcerto[0];
      novosFiltros.taxaAcertoMax = taxaAcerto[1];
    }

    if (questoesResolvidas[0] > 0 || questoesResolvidas[1] < 1000) {
      novosFiltros.questoesResolvidasMin = questoesResolvidas[0];
      novosFiltros.questoesResolvidasMax = questoesResolvidas[1];
    }

    onChange(novosFiltros);
  }, [filtros.diasUltimoAcesso, taxaAcerto, questoesResolvidas, onChange]);

  return (
    <div className="space-y-6">
      {/* Preview de Alcance */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Alcance Estimado
          </CardTitle>
          <CardDescription>
            Usuários que receberão este aviso com os filtros atuais
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Calculando alcance...
            </div>
          ) : preview ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-3xl font-bold text-blue-600">
                    {preview.totalElegiveis}
                  </div>
                  <div className="text-sm text-muted-foreground">usuários elegíveis</div>
                </div>
              </div>

              {preview.totalElegiveis > 0 && (
                <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Taxa de Acerto Média</div>
                    <div className="text-lg font-semibold text-green-600">
                      {preview.taxaAcertoMedia}%
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Questões Resolvidas (Média)</div>
                    <div className="text-lg font-semibold text-purple-600">
                      {preview.questoesResolvidasMedia}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Configure os filtros para ver o alcance estimado
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Segmentação</CardTitle>
          <CardDescription>
            Refine o público-alvo com critérios específicos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Último Acesso */}
          <div className="space-y-2">
            <Label htmlFor="diasUltimoAcesso">
              Último Acesso (dias)
              {filtros.diasUltimoAcesso && (
                <Badge variant="secondary" className="ml-2">
                  Últimos {filtros.diasUltimoAcesso} dias
                </Badge>
              )}
            </Label>
            <Input
              id="diasUltimoAcesso"
              type="number"
              min="1"
              placeholder="Ex: 7 (usuários ativos nos últimos 7 dias)"
              value={filtros.diasUltimoAcesso || ''}
              onChange={(e) => {
                const valor = e.target.value ? parseInt(e.target.value) : undefined;
                setFiltros({ ...filtros, diasUltimoAcesso: valor });
              }}
            />
          </div>

          {/* Taxa de Acerto */}
          <div className="space-y-3">
            <Label>
              Taxa de Acerto
              <Badge variant="secondary" className="ml-2">
                {taxaAcerto[0]}% - {taxaAcerto[1]}%
              </Badge>
            </Label>
            <Slider
              min={0}
              max={100}
              step={5}
              value={taxaAcerto}
              onValueChange={setTaxaAcerto}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Questões Resolvidas */}
          <div className="space-y-3">
            <Label>
              Questões Resolvidas
              <Badge variant="secondary" className="ml-2">
                {questoesResolvidas[0]} - {questoesResolvidas[1]}
              </Badge>
            </Label>
            <Slider
              min={0}
              max={1000}
              step={50}
              value={questoesResolvidas}
              onValueChange={setQuestoesResolvidas}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>500</span>
              <span>1000+</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
