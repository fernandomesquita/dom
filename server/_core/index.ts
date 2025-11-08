import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import cookieParser from "cookie-parser";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
// import { registerOAuthRoutes } from "./oauth"; // OAuth desabilitado - usando autenticação simples
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import "../queues/worker"; // Inicializar worker de filas
import { initializeSocket } from "./socket";
import { iniciarScheduler } from "../scheduler/avisos";
import { iniciarSchedulerMetasNotificacoes } from "../scheduler/metasNotificacoes";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(cookieParser()); // Para ler cookies de autenticação
  // OAuth callback under /api/oauth/callback
  // registerOAuthRoutes(app); // OAuth desabilitado - usando autenticação simples
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  // Inicializar Socket.IO
  initializeSocket(server);

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    console.log('[Server] Worker de filas iniciado');
    console.log('[Server] WebSocket (Socket.IO) iniciado');
    
    // Iniciar scheduler de agendamentos
    iniciarScheduler();
    console.log('[Server] Scheduler de agendamentos iniciado');
    
    // Iniciar scheduler de notificações de metas
    iniciarSchedulerMetasNotificacoes();
    console.log('[Server] Scheduler de notificações de metas iniciado');
  });
}

startServer().catch(console.error);
