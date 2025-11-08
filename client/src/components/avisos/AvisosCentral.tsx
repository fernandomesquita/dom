import { Bell } from "lucide-react";
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
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AvisosCentralProps {
  avisos: Array<{
    id: string;
    tipo: 'informativo' | 'importante' | 'urgente' | 'individual' | 'premium';
    titulo: string;
    conteudo: string;
    criadoEm: Date;
    visualizado?: boolean;
  }>;
  totalNaoLidos: number;
  onClickAviso?: (avisoId: string) => void;
  onMarcarTodosLidos?: () => void;
}

export function AvisosCentral({
  avisos,
  totalNaoLidos,
  onClickAviso,
  onMarcarTodosLidos,
}: AvisosCentralProps) {
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
      <DropdownMenuContent align="end" className="w-[380px]">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {totalNaoLidos > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              onClick={onMarcarTodosLidos}
            >
              Marcar todas como lidas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {avisos.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Nenhuma notificação
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            {avisos.map((aviso) => (
              <DropdownMenuItem
                key={aviso.id}
                className="flex flex-col items-start gap-2 p-3 cursor-pointer"
                onClick={() => onClickAviso?.(aviso.id)}
              >
                <div className="flex items-center gap-2 w-full">
                  <Badge variant={getTipoBadgeVariant(aviso.tipo)} className="text-xs">
                    {aviso.tipo.toUpperCase()}
                  </Badge>
                  {!aviso.visualizado && (
                    <div className="h-2 w-2 rounded-full bg-blue-600" />
                  )}
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
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
