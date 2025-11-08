import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface UseSocketOptions {
  userId?: number;
  autoConnect?: boolean;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, data: any) => void;
  on: (event: string, handler: (data: any) => void) => void;
  off: (event: string, handler?: (data: any) => void) => void;
}

let socketInstance: Socket | null = null;

/**
 * Hook para gerenciar conexão WebSocket com Socket.IO
 */
export function useSocket(options: UseSocketOptions = {}): UseSocketReturn {
  const { userId, autoConnect = true } = options;
  const [isConnected, setIsConnected] = useState(false);

  // Criar ou reutilizar instância do socket
  useEffect(() => {
    if (!autoConnect) return;

    // Reutilizar socket existente ou criar novo
    if (!socketInstance) {
      const socketUrl = window.location.origin;
      socketInstance = io(socketUrl, {
        path: "/socket.io/",
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity,
      });

      console.log("[Socket.IO] Conectando ao servidor WebSocket...");
    }

    const socket = socketInstance;

    // Event listeners
    const handleConnect = () => {
      console.log("[Socket.IO] Conectado ao servidor");
      setIsConnected(true);

      // Autenticar se userId fornecido
      if (userId) {
        socket.emit("authenticate", userId);
      }
    };

    const handleDisconnect = () => {
      console.log("[Socket.IO] Desconectado do servidor");
      setIsConnected(false);
    };

    const handleConnectError = (error: Error) => {
      console.error("[Socket.IO] Erro de conexão:", error);
      setIsConnected(false);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    // Conectar se já não estiver conectado
    if (!socket.connected) {
      socket.connect();
    } else {
      setIsConnected(true);
      if (userId) {
        socket.emit("authenticate", userId);
      }
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
    };
  }, [userId, autoConnect]);

  const connect = useCallback(() => {
    if (socketInstance && !socketInstance.connected) {
      socketInstance.connect();
    }
  }, []);

  const disconnect = useCallback(() => {
    if (socketInstance && socketInstance.connected) {
      socketInstance.disconnect();
    }
  }, []);

  const emit = useCallback((event: string, data: any) => {
    if (socketInstance && socketInstance.connected) {
      socketInstance.emit(event, data);
    } else {
      console.warn("[Socket.IO] Tentativa de emitir evento sem conexão ativa");
    }
  }, []);

  const on = useCallback((event: string, handler: (data: any) => void) => {
    if (socketInstance) {
      socketInstance.on(event, handler);
    }
  }, []);

  const off = useCallback((event: string, handler?: (data: any) => void) => {
    if (socketInstance) {
      if (handler) {
        socketInstance.off(event, handler);
      } else {
        socketInstance.off(event);
      }
    }
  }, []);

  return {
    socket: socketInstance,
    isConnected,
    connect,
    disconnect,
    emit,
    on,
    off,
  };
}
