import { Bell, Check, Filter } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function AvisosCentral() {
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [tabAtiva, setTabAtiva] = useState<"nao-lidas" | "todas">("nao-lidas");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [todosAvisos, setTodosAvisos] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Query de avisos pendentes
  const pendentesQuery = trpc.avisosAluno.getPendentes.useQuery();
  
  // Query de histórico completo com paginação
  const historicoQuery = trpc.avisosAluno.getHistorico.useQuery(
    { 
      page: paginaAtual, 
      limit: 20,
      tipo: filtroTipo !== "todos" ? filtroTipo as any : undefined 
    },
    { 
      enabled: tabAtiva === "todas",
      keepPreviousData: true
    }
  );

  // Atualizar lista de avisos quando novos dados chegarem
  useEffect(() => {
    if (historicoQuery.data?.items) {
      if (paginaAtual === 1) {
        // Primeira página: substituir lista
        setTodosAvisos(historicoQuery.data.items);
      } else {
        // Páginas seguintes: adicionar à lista existente
        setTodosAvisos(prev => [...prev, ...historicoQuery.data.items]);
      }
      
      // Verificar se há mais páginas
      const { page, totalPages } = historicoQuery.data.pagination;
      setHasMore(page < totalPages);
    }
  }, [historicoQuery.data, paginaAtual]);

  // Resetar paginação quando filtro mudar
  useEffect(() => {
    setPaginaAtual(1);
    setTodosAvisos([]);
    setHasMore(true);
  }, [filtroTipo, tabAtiva]);

  // Mutations
  const registrarVisualizacaoMutation = trpc.avisosAluno.registrarVisualizacao.useMutation({
    onSuccess: () => {
      pendentesQuery.refetch();
      // Resetar histórico para atualizar
      setPaginaAtual(1);
      setTodosAvisos([]);
      historicoQuery.refetch();
    },
  });

  const dispensarMutation = trpc.avisosAluno.dispensar.useMutation({
    onSuccess: () => {
      pendentesQuery.refetch();
      setPaginaAtual(1);
      setTodosAvisos([]);
      historicoQuery.refetch();
      toast.success("Notificação dispensada");
    },
  });

  const getTipoBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case 'urgente':
        return 'destructive' as const;
      case 'importante':
        return 'default' as const;
      case 'premium':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  const handleClickAviso = (avisoId: string) => {
    registrarVisualizacaoMutation.mutate({ avisoId });
  };

  const handleMarcarTodasLidas = () => {
    const avisosPendentes = pendentesQuery.data || [];
    avisosPendentes.forEach((aviso) => {
      registrarVisualizacaoMutation.mutate({ avisoId: aviso.id });
    });
    toast.success("Todas as notificações foram marcadas como lidas");
  };

  // Detectar scroll no final da lista
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    
    if (bottom && hasMore && !historicoQuery.isFetching && tabAtiva === "todas") {
      setPaginaAtual(prev => prev + 1);
    }
  };

  // Filtrar avisos por tipo (apenas para pendentes)
  const filtrarAvisos = (avisos: any[]) => {
    if (filtroTipo === "todos") return avisos;
    return avisos.filter((a) => a.tipo === filtroTipo);
  };

  const avisosPendentes = filtrarAvisos(pendentesQuery.data || []);
  const totalNaoLidos = avisosPendentes.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {totalNaoLidos > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {totalNaoLidos > 9 ? '9+' : totalNaoLidos}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[420px] p-0">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Notificações</h3>
            {totalNaoLidos > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                onClick={handleMarcarTodasLidas}
              >
                <Check className="h-3 w-3 mr-1" />
                Marcar todas como lidas
              </Button>
            )}
          </div>

          {/* Filtro por tipo */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="informativo">Informativos</SelectItem>
                <SelectItem value="importante">Importantes</SelectItem>
                <SelectItem value="urgente">Urgentes</SelectItem>
                <SelectItem value="individual">Individuais</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={tabAtiva} onValueChange={(v) => setTabAtiva(v as any)} className="w-full">
          <TabsList className="w-full rounded-none border-b">
            <TabsTrigger value="nao-lidas" className="flex-1">
              Não lidas ({totalNaoLidos})
            </TabsTrigger>
            <TabsTrigger value="todas" className="flex-1">
              Todas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nao-lidas" className="m-0">
            {pendentesQuery.isLoading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Carregando...
              </div>
            ) : avisosPendentes.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma notificação não lida
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                {avisosPendentes.map((aviso: any) => (
                  <div
                    key={aviso.id}
                    className="flex flex-col gap-2 p-3 border-b hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => handleClickAviso(aviso.id)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Badge variant={getTipoBadgeVariant(aviso.tipo)} className="text-xs">
                        {aviso.tipo.toUpperCase()}
                      </Badge>
                      <div className="h-2 w-2 rounded-full bg-blue-600" />
                      <span className="text-xs text-muted-foreground ml-auto">
                        {formatDistanceToNow(new Date(aviso.criadoEm), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                    <div className="w-full">
                      <p className="font-medium text-sm">{aviso.titulo}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {aviso.conteudo}
                      </p>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="todas" className="m-0">
            {historicoQuery.isLoading && paginaAtual === 1 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Carregando...
              </div>
            ) : todosAvisos.length === 0 && !historicoQuery.isLoading ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma notificação encontrada
                </p>
              </div>
            ) : (
              <div 
                ref={scrollRef}
                className="h-[400px] overflow-y-auto"
                onScroll={handleScroll}
              >
                {todosAvisos.map((aviso: any) => (
                  <div
                    key={`${aviso.id}-${aviso.visualizadoEm}`}
                    className="flex flex-col gap-2 p-3 border-b hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => handleClickAviso(aviso.id)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Badge variant={getTipoBadgeVariant(aviso.tipo)} className="text-xs">
                        {aviso.tipo.toUpperCase()}
                      </Badge>
                      {!aviso.dismissado && (
                        <Check className="h-3 w-3 text-green-600" />
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {formatDistanceToNow(new Date(aviso.visualizadoEm), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                    <div className="w-full">
                      <p className="font-medium text-sm">{aviso.titulo}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {aviso.conteudo}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Loading indicator ao carregar mais */}
                {historicoQuery.isFetching && paginaAtual > 1 && (
                  <div className="p-4 text-center">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-xs text-muted-foreground mt-2">Carregando mais...</p>
                  </div>
                )}
                
                {/* Mensagem quando não há mais avisos */}
                {!hasMore && todosAvisos.length > 0 && (
                  <div className="p-4 text-center">
                    <p className="text-xs text-muted-foreground">
                      Você viu todas as notificações
                    </p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
