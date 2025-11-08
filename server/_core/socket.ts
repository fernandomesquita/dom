import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer | null = null;

/**
 * Inicializar Socket.IO no servidor HTTP
 */
export function initializeSocket(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*", // Em produção, configurar domínios específicos
      methods: ["GET", "POST"],
    },
    path: "/socket.io/",
  });

  io.on("connection", (socket) => {
    console.log(`[Socket.IO] Cliente conectado: ${socket.id}`);

    // Autenticação (opcional)
    socket.on("authenticate", (userId: number) => {
      socket.data.userId = userId;
      socket.join(`user:${userId}`);
      console.log(`[Socket.IO] Usuário ${userId} autenticado no socket ${socket.id}`);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket.IO] Cliente desconectado: ${socket.id}`);
    });
  });

  console.log("[Socket.IO] Servidor WebSocket inicializado");
  return io;
}

/**
 * Obter instância do Socket.IO
 */
export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error("Socket.IO não foi inicializado. Chame initializeSocket() primeiro.");
  }
  return io;
}

/**
 * Emitir evento para todos os clientes
 */
export function emitToAll(event: string, data: any) {
  if (io) {
    io.emit(event, data);
    console.log(`[Socket.IO] Evento '${event}' emitido para todos os clientes`);
  }
}

/**
 * Emitir evento para um usuário específico
 */
export function emitToUser(userId: number, event: string, data: any) {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
    console.log(`[Socket.IO] Evento '${event}' emitido para usuário ${userId}`);
  }
}

/**
 * Emitir evento para múltiplos usuários
 */
export function emitToUsers(userIds: number[], event: string, data: any) {
  if (io) {
    userIds.forEach(userId => {
      io!.to(`user:${userId}`).emit(event, data);
    });
    console.log(`[Socket.IO] Evento '${event}' emitido para ${userIds.length} usuários`);
  }
}
