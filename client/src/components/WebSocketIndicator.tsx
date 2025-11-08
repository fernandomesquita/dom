import { useSocket } from "@/hooks/useSocket";
import { useAuth } from "@/_core/hooks/useAuth";
import { Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Indicador visual de conexão WebSocket
 * Exibe um ícone no canto da tela mostrando o status da conexão
 */
export function WebSocketIndicator() {
  const { user } = useAuth();
  const { isConnected } = useSocket({
    userId: user?.id,
    autoConnect: true,
  });

  if (!user) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium shadow-lg transition-all",
        isConnected
          ? "bg-green-100 text-green-800 border border-green-200"
          : "bg-red-100 text-red-800 border border-red-200"
      )}
      title={isConnected ? "Conectado ao servidor" : "Desconectado do servidor"}
    >
      {isConnected ? (
        <>
          <Wifi className="h-3 w-3" />
          <span>Conectado</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          <span>Desconectado</span>
        </>
      )}
      <div
        className={cn(
          "h-2 w-2 rounded-full",
          isConnected ? "bg-green-600 animate-pulse" : "bg-red-600"
        )}
      />
    </div>
  );
}
