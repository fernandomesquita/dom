import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";
import { initSentry, captureError } from "./lib/sentry";

// Inicializar Sentry para monitoramento de erros em produção
initSentry();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes before considering it stale
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      // Retry failed queries 1 time
      retry: 1,
      // Refetch on window focus for fresh data
      refetchOnWindowFocus: true,
      // Don't refetch on mount if data is fresh
      refetchOnMount: false,
      // Don't refetch on reconnect if data is fresh
      refetchOnReconnect: false,
    },
    mutations: {
      // Retry failed mutations 1 time
      retry: 1,
    },
  },
});

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = getLoginUrl();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
    // Enviar erro para Sentry (apenas se não for erro de autenticação)
    if (error instanceof TRPCClientError && error.message !== UNAUTHED_ERR_MSG) {
      captureError(error, {
        type: 'query',
        queryKey: event.query.queryKey,
      });
    }
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
    // Enviar erro para Sentry (apenas se não for erro de autenticação)
    if (error instanceof TRPCClientError && error.message !== UNAUTHED_ERR_MSG) {
      captureError(error, {
        type: 'mutation',
        mutationKey: event.mutation.options.mutationKey,
      });
    }
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

console.log("🔍 [DEBUG] Iniciando renderização...");
const rootElement = document.getElementById("root");
console.log("🔍 [DEBUG] Root element:", rootElement);

if (!rootElement) {
  console.error("❌ [DEBUG] Root element não encontrado!");
  throw new Error("Root element not found");
}

console.log("🔍 [DEBUG] Criando root...");
const root = createRoot(rootElement);

console.log("🔍 [DEBUG] Renderizando App...");
try {
  root.render(
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </trpc.Provider>
  );
  console.log("✅ [DEBUG] App renderizado com sucesso!");
} catch (error) {
  console.error("❌ [DEBUG] Erro ao renderizar:", error);
  throw error;
}
