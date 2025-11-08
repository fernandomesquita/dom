import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { ChevronDown, ChevronRight, Search, X } from "lucide-react";

interface KTreeSelectorProps {
  disciplinaId?: string;
  assuntoId?: string;
  topicoId?: string;
  onDisciplinaChange: (id: string, nome: string) => void;
  onAssuntoChange: (id: string, nome: string) => void;
  onTopicoChange: (id: string | null, nome: string | null) => void;
  errors?: {
    disciplina?: string;
    assunto?: string;
    topico?: string;
  };
}

export default function KTreeSelector({
  disciplinaId,
  assuntoId,
  topicoId,
  onDisciplinaChange,
  onAssuntoChange,
  onTopicoChange,
  errors,
}: KTreeSelectorProps) {
  const [disciplinaSearch, setDisciplinaSearch] = useState("");
  const [assuntoSearch, setAssuntoSearch] = useState("");
  const [topicoSearch, setTopicoSearch] = useState("");
  const [disciplinaOpen, setDisciplinaOpen] = useState(false);
  const [assuntoOpen, setAssuntoOpen] = useState(false);
  const [topicoOpen, setTopicoOpen] = useState(false);

  // Queries
  const disciplinasQuery = trpc.ktree.listDisciplinas.useQuery({
    search: disciplinaSearch || undefined,
  });

  const assuntosQuery = trpc.ktree.listAssuntos.useQuery(
    {
      disciplinaId: disciplinaId!,
      search: assuntoSearch || undefined,
    },
    { enabled: !!disciplinaId }
  );

  const topicosQuery = trpc.ktree.listTopicos.useQuery(
    {
      assuntoId: assuntoId!,
      search: topicoSearch || undefined,
    },
    { enabled: !!assuntoId }
  );

  const breadcrumbQuery = trpc.ktree.getBreadcrumb.useQuery(
    {
      disciplinaId,
      assuntoId,
      topicoId: topicoId || undefined,
    },
    { enabled: !!(disciplinaId || assuntoId || topicoId) }
  );

  // Limpar seleções dependentes
  useEffect(() => {
    if (!disciplinaId) {
      onAssuntoChange("", "");
      onTopicoChange(null, null);
    }
  }, [disciplinaId]);

  useEffect(() => {
    if (!assuntoId) {
      onTopicoChange(null, null);
    }
  }, [assuntoId]);

  const breadcrumb = breadcrumbQuery.data;

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      {breadcrumb && (breadcrumb.disciplina || breadcrumb.assunto || breadcrumb.topico) && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            {breadcrumb.disciplina && (
              <>
                <Badge variant="secondary">{breadcrumb.disciplina.nome}</Badge>
                {breadcrumb.assunto && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
              </>
            )}
            {breadcrumb.assunto && (
              <>
                <Badge variant="secondary">{breadcrumb.assunto.nome}</Badge>
                {breadcrumb.topico && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
              </>
            )}
            {breadcrumb.topico && (
              <Badge variant="secondary">{breadcrumb.topico.nome}</Badge>
            )}
          </div>
        </div>
      )}

      {/* Disciplina */}
      <div>
        <Label htmlFor="disciplina">Disciplina *</Label>
        <Popover open={disciplinaOpen} onOpenChange={setDisciplinaOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={disciplinaOpen}
              className="w-full justify-between"
            >
              {breadcrumb?.disciplina?.nome || "Selecione uma disciplina"}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar disciplina..."
                  value={disciplinaSearch}
                  onChange={(e) => setDisciplinaSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <ScrollArea className="h-60">
              <div className="p-2">
                {disciplinasQuery.data?.map((disciplina) => (
                  <Button
                    key={disciplina.id}
                    variant="ghost"
                    className="w-full justify-start h-auto p-2"
                    onClick={() => {
                      onDisciplinaChange(disciplina.id, disciplina.nome);
                      setDisciplinaOpen(false);
                      setDisciplinaSearch("");
                    }}
                  >
                    <div className="text-left">
                      <div className="font-medium">{disciplina.nome}</div>
                      {disciplina.codigo && (
                        <div className="text-xs text-muted-foreground">
                          {disciplina.codigo}
                        </div>
                      )}
                    </div>
                  </Button>
                ))}
                {disciplinasQuery.data?.length === 0 && (
                  <p className="text-center text-muted-foreground py-4 text-sm">
                    Nenhuma disciplina encontrada
                  </p>
                )}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
        {errors?.disciplina && (
          <p className="text-sm text-destructive mt-1">{errors.disciplina}</p>
        )}
      </div>

      {/* Assunto */}
      {disciplinaId && (
        <div>
          <Label htmlFor="assunto">Assunto *</Label>
          <Popover open={assuntoOpen} onOpenChange={setAssuntoOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={assuntoOpen}
                className="w-full justify-between"
                disabled={!disciplinaId}
              >
                {breadcrumb?.assunto?.nome || "Selecione um assunto"}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <div className="p-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar assunto..."
                    value={assuntoSearch}
                    onChange={(e) => setAssuntoSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <ScrollArea className="h-60">
                <div className="p-2">
                  {assuntosQuery.data?.map((assunto) => (
                    <Button
                      key={assunto.id}
                      variant="ghost"
                      className="w-full justify-start h-auto p-2"
                      onClick={() => {
                        onAssuntoChange(assunto.id, assunto.nome);
                        setAssuntoOpen(false);
                        setAssuntoSearch("");
                      }}
                    >
                      <div className="text-left">
                        <div className="font-medium">{assunto.nome}</div>
                        {assunto.codigo && (
                          <div className="text-xs text-muted-foreground">
                            {assunto.codigo}
                          </div>
                        )}
                      </div>
                    </Button>
                  ))}
                  {assuntosQuery.data?.length === 0 && (
                    <p className="text-center text-muted-foreground py-4 text-sm">
                      Nenhum assunto encontrado
                    </p>
                  )}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
          {errors?.assunto && (
            <p className="text-sm text-destructive mt-1">{errors.assunto}</p>
          )}
        </div>
      )}

      {/* Tópico */}
      {assuntoId && (
        <div>
          <Label htmlFor="topico">Tópico (opcional)</Label>
          <div className="flex gap-2">
            <Popover open={topicoOpen} onOpenChange={setTopicoOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={topicoOpen}
                  className="flex-1 justify-between"
                  disabled={!assuntoId}
                >
                  {breadcrumb?.topico?.nome || "Selecione um tópico (opcional)"}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <div className="p-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar tópico..."
                      value={topicoSearch}
                      onChange={(e) => setTopicoSearch(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <ScrollArea className="h-60">
                  <div className="p-2">
                    {topicosQuery.data?.map((topico) => (
                      <Button
                        key={topico.id}
                        variant="ghost"
                        className="w-full justify-start h-auto p-2"
                        onClick={() => {
                          onTopicoChange(topico.id, topico.nome);
                          setTopicoOpen(false);
                          setTopicoSearch("");
                        }}
                      >
                        <div className="text-left">
                          <div className="font-medium">{topico.nome}</div>
                          {topico.codigo && (
                            <div className="text-xs text-muted-foreground">
                              {topico.codigo}
                            </div>
                          )}
                        </div>
                      </Button>
                    ))}
                    {topicosQuery.data?.length === 0 && (
                      <p className="text-center text-muted-foreground py-4 text-sm">
                        Nenhum tópico encontrado
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
            {topicoId && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => onTopicoChange(null, null)}
                title="Remover tópico"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {errors?.topico && (
            <p className="text-sm text-destructive mt-1">{errors.topico}</p>
          )}
        </div>
      )}
    </div>
  );
}
