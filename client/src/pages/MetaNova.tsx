import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { APP_TITLE } from "@/const";
import KTreeSelector from "@/components/KTreeSelector";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Calendar, Clock, Loader2, Plus, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface MetaNovaProps {
  params: { planoId: string };
}

export default function MetaNova({ params }: MetaNovaProps) {
  const { planoId } = params;
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();

  // Form state
  const [tipo, setTipo] = useState<string>("");
  const [disciplinaId, setDisciplinaId] = useState("");
  const [disciplinaNome, setDisciplinaNome] = useState("");
  const [assuntoId, setAssuntoId] = useState("");
  const [assuntoNome, setAssuntoNome] = useState("");
  const [topicoId, setTopicoId] = useState<string | null>(null);
  const [topicoNome, setTopicoNome] = useState<string | null>(null);
  const [duracaoMin, setDuracaoMin] = useState(60);
  const [dataAgendada, setDataAgendada] = useState("");
  const [orientacoes, setOrientacoes] = useState("");
  const [materiaisDialog, setMateriaisDialog] = useState(false);
  const [materiaisSelecionados, setMateriaisSelecionados] = useState<number[]>([]);
  const [materiaisSearch, setMateriaisSearch] = useState("");

  // Queries
  const planoQuery = trpc.metasPlanos.getById.useQuery({ id: planoId });
  // listByDate não existe, usar list com filtro de data
  const metasDoDiaQuery = trpc.metasMetas.list.useQuery(
    { planoId, scheduledDate: dataAgendada } as any,
    { enabled: !!dataAgendada }
  );
  const conflitosQuery = trpc.metasMetas.verificarConflitos.useQuery(
    { planoId, date: dataAgendada, duracaoMin },
    { enabled: !!dataAgendada && duracaoMin > 0 }
  );
  const materiaisQuery = trpc.metasMetas.buscarMateriaisDisponiveis.useQuery(
    {
      ktreeDisciplinaId: disciplinaId || undefined,
      ktreeAssuntoId: assuntoId || undefined,
      ktreeTopicoId: topicoId || undefined,
    } as any,
    { enabled: materiaisDialog && !!disciplinaId }
  );

  const materiaisFiltrados = materiaisQuery.data?.filter((m: any) =>
    materiaisSearch
      ? m.title.toLowerCase().includes(materiaisSearch.toLowerCase()) ||
        m.description?.toLowerCase().includes(materiaisSearch.toLowerCase())
      : true
  ) || [];

  // Mutations
  const vincularMaterialMutation = trpc.metasMetas.vincularMaterial.useMutation();

  const criarMetaMutation = trpc.metasMetas.create.useMutation({
    onSuccess: async (data) => {
      toast.success("Meta criada com sucesso!");

      // Vincular materiais selecionados
      if (materiaisSelecionados.length > 0) {
        try {
          for (const materialId of materiaisSelecionados) {
            await vincularMaterialMutation.mutateAsync({
              metaId: data.id,
              materialId,
            });
          }
          toast.success(`${materiaisSelecionados.length} materiais vinculados!`);
        } catch (error) {
          toast.error("Erro ao vincular materiais");
        }
      }

      // Limpar formulário
      setTipo("");
      setDisciplinaId("");
      setDisciplinaNome("");
      setAssuntoId("");
      setAssuntoNome("");
      setTopicoId(null);
      setTopicoNome(null);
      setDuracaoMin(60);
      setDataAgendada("");
      setOrientacoes("");
      setMateriaisSelecionados([]);
    },
    onError: (error) => {
      toast.error(`Erro ao criar meta: ${error.message}`);
    },
  });

  // Loading states
  if (authLoading || planoQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  if (!planoQuery.data) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Plano não encontrado</CardTitle>
            <CardDescription>O plano solicitado não existe.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const plano = planoQuery.data;

  // Validações inline
  const erros: Record<string, string> = {};
  if (tipo && !["ESTUDO", "QUESTOES", "REVISAO"].includes(tipo)) {
    erros.tipo = "Tipo inválido";
  }
  if (!disciplinaId) {
    erros.disciplina = "Disciplina é obrigatória";
  }
  if (!assuntoId) {
    erros.assunto = "Assunto é obrigatório";
  }
  if (duracaoMin < 15 || duracaoMin > 240) {
    erros.duracao = "Duração deve estar entre 15 e 240 minutos";
  }
  if (dataAgendada) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataSelecionada = new Date(dataAgendada + "T00:00:00");
    if (dataSelecionada < hoje) {
      erros.data = "Data deve ser hoje ou no futuro";
    }
  }
  if (orientacoes && orientacoes.length > 2000) {
    erros.orientacoes = `Orientações muito longas (${orientacoes.length}/2000 caracteres)`;
  }

  const podeSubmeter =
    tipo &&
    disciplinaId &&
    assuntoId &&
    duracaoMin &&
    dataAgendada &&
    Object.keys(erros).length === 0;

  // Calcular pré-visualização do slot
  const metasDoDia = metasDoDiaQuery.data || [];
  const minutosUsados = conflitosQuery.data?.minutosUsados || 0;
  const capacidadeMin = conflitosQuery.data?.capacidadeMin || (plano.horas_por_dia || 0) * 60;
  const minutosRestantes = conflitosQuery.data?.minutosRestantes || capacidadeMin;
  const cabeNoSlot = !conflitosQuery.data?.temConflito;
  const proximaDataDisponivel = conflitosQuery.data?.proximaDataDisponivel;

  const handleSubmit = async (e: React.FormEvent, criarOutra: boolean = false) => {
    e.preventDefault();
    if (!podeSubmeter) return;

    await criarMetaMutation.mutateAsync({
      planoId,
      tipo: tipo as "ESTUDO" | "QUESTOES" | "REVISAO",
      ktreeDisciplinaId: disciplinaId,
      ktreeAssuntoId: assuntoId,
      ktreeTopicoId: topicoId || undefined,
      duracaoPlanejadaMin: duracaoMin,
      scheduledDate: dataAgendada,
      orientacoesEstudo: orientacoes || undefined,
    });

    if (!criarOutra) {
      setLocation(`/metas/planos/${planoId}`);
    }
  };

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => setLocation(`/metas/planos/${planoId}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nova Meta</h1>
          <p className="text-muted-foreground">
            Plano: {plano.titulo}
          </p>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        {/* Tipo de Meta */}
        <Card>
          <CardHeader>
            <CardTitle>Tipo de Meta</CardTitle>
            <CardDescription>Selecione o tipo de atividade</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ESTUDO">📚 Estudo (Teoria)</SelectItem>
                <SelectItem value="QUESTOES">✍️ Questões (Prática)</SelectItem>
                <SelectItem value="REVISAO">🔄 Revisão</SelectItem>
              </SelectContent>
            </Select>
            {erros.tipo && <p className="text-sm text-destructive mt-2">{erros.tipo}</p>}
          </CardContent>
        </Card>

        {/* KTree (Disciplina, Assunto, Tópico) */}
        <Card>
          <CardHeader>
            <CardTitle>Conteúdo (KTree)</CardTitle>
            <CardDescription>
              Selecione disciplina, assunto e tópico da taxonomia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <KTreeSelector
              disciplinaId={disciplinaId}
              assuntoId={assuntoId}
              topicoId={topicoId || undefined}
              onDisciplinaChange={(id, nome) => {
                setDisciplinaId(id);
                setDisciplinaNome(nome);
              }}
              onAssuntoChange={(id, nome) => {
                setAssuntoId(id);
                setAssuntoNome(nome);
              }}
              onTopicoChange={(id, nome) => {
                setTopicoId(id);
                setTopicoNome(nome);
              }}
              errors={erros}
            />
          </CardContent>
        </Card>

        {/* Duração e Data */}
        <Card>
          <CardHeader>
            <CardTitle>Agendamento</CardTitle>
            <CardDescription>Quando e por quanto tempo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="duracao">Duração (minutos) *</Label>
              <div className="flex gap-2">
                <Input
                  id="duracao"
                  type="number"
                  value={duracaoMin}
                  onChange={(e) => setDuracaoMin(parseInt(e.target.value) || 0)}
                  min={15}
                  max={240}
                  step={15}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDuracaoMin(Math.max(15, duracaoMin - 15))}
                >
                  -15
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDuracaoMin(Math.min(240, duracaoMin + 15))}
                >
                  +15
                </Button>
              </div>
              {erros.duracao && (
                <p className="text-sm text-destructive mt-1">{erros.duracao}</p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                <Clock className="inline h-3 w-3" /> {Math.floor(duracaoMin / 60)}h{" "}
                {duracaoMin % 60}min
              </p>
            </div>

            <div>
              <Label htmlFor="data">Data Agendada *</Label>
              <Input
                id="data"
                type="date"
                value={dataAgendada}
                onChange={(e) => setDataAgendada(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
              {erros.data && <p className="text-sm text-destructive mt-1">{erros.data}</p>}
            </div>

            {/* Pré-visualização do Slot */}
            {dataAgendada && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Pré-visualização do Dia
                </h4>
                <div className="text-sm space-y-1">
                  <p>
                    Metas já alocadas: <strong>{metasDoDia.length}</strong>
                  </p>
                  <p>
                    Tempo usado: <strong>{minutosUsados} min</strong> de{" "}
                    <strong>{capacidadeMin} min</strong>
                  </p>
                  <p>
                    Tempo restante: <strong>{minutosRestantes} min</strong>
                  </p>
                  {cabeNoSlot ? (
                    <p className="text-green-600 font-semibold">
                      ✓ Esta meta cabe no slot do dia
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-destructive font-semibold">
                        ⚠ Capacidade excedida! {minutosUsados + duracaoMin}/{capacidadeMin}min
                      </p>
                      {proximaDataDisponivel && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setDataAgendada(proximaDataDisponivel)}
                          className="w-full"
                        >
                          Usar {proximaDataDisponivel}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Orientações */}
        <Card>
          <CardHeader>
            <CardTitle>Orientações de Estudo</CardTitle>
            <CardDescription>Instruções específicas para esta meta (opcional)</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={orientacoes}
              onChange={(e) => setOrientacoes(e.target.value)}
              placeholder="Ex: Focar em jurisprudência recente do STF, fazer resumo esquemático..."
              rows={4}
              maxLength={2000}
            />
            <p className="text-sm text-muted-foreground mt-1">
              {orientacoes.length}/2000 caracteres
            </p>
            {erros.orientacoes && (
              <p className="text-sm text-destructive mt-1">{erros.orientacoes}</p>
            )}
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={!podeSubmeter || criarMetaMutation.isPending}
            className="flex-1"
          >
            {criarMetaMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Criar Meta
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={!podeSubmeter || criarMetaMutation.isPending}
            onClick={(e) => handleSubmit(e, true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Criar e Adicionar Outra
          </Button>
        </div>
      </form>

      {/* Dialog de Materiais */}
      <Dialog open={materiaisDialog} onOpenChange={setMateriaisDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Vincular Materiais</DialogTitle>
            <DialogDescription>
              Selecione os materiais relacionados ao conteúdo desta meta
            </DialogDescription>
          </DialogHeader>
          {!disciplinaId ? (
            <p className="text-muted-foreground py-4">
              Selecione uma disciplina primeiro para ver materiais disponíveis
            </p>
          ) : (
            <>
              <div className="mb-4">
                <Input
                  placeholder="Buscar por título ou descrição..."
                  value={materiaisSearch}
                  onChange={(e) => setMateriaisSearch(e.target.value)}
                />
              </div>
              <ScrollArea className="h-96">
                {materiaisQuery.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : materiaisFiltrados.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum material encontrado para este conteúdo
                  </p>
                ) : (
                  <div className="space-y-2">
                    {materiaisFiltrados?.map((material: any) => (
                      <div
                        key={material.id}
                        className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent cursor-pointer"
                        onClick={() => {
                          setMateriaisSelecionados((prev) =>
                            prev.includes(material.id)
                              ? prev.filter((id) => id !== material.id)
                              : [...prev, material.id]
                          );
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={materiaisSelecionados.includes(material.id)}
                          onChange={() => {}}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{material.title}</div>
                          {material.description && (
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {material.description}
                            </div>
                          )}
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {material.type}
                            </Badge>
                            {material.viewCount > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {material.viewCount} visualizações
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {materiaisSelecionados.length} material(is) selecionado(s)
                </span>
                <Button onClick={() => setMateriaisDialog(false)}>
                  Confirmar Seleção
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
