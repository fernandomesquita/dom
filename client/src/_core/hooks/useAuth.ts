import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: 3,  // ✅ Tenta 3 vezes antes de desistir
    retryDelay: 1000,  // ✅ Aguarda 1s entre tentativas
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,  // ✅ Cache por 5 minutos
    gcTime: 10 * 60 * 1000,  // ✅ Mantém em cache 10 minutos (gcTime é o novo nome de cacheTime)
    onSuccess: (data) => {
      console.log('✅ useAuth SUCCESS:', data);
    },
    onError: (error) => {
      console.error('❌ useAuth ERROR:', error);
    },
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        return;
      }
      throw error;
    } finally {
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
      // Redirecionar para login após logout
      window.location.href = getLoginUrl();
    }
  }, [logoutMutation, utils]);

  const state = useMemo(() => {
    let userData = meQuery.data;
    
    // ✅ SE query não tem dados E não está loading, tenta localStorage
    if (!userData && !meQuery.isLoading) {
      const cached = localStorage.getItem("manus-runtime-user-info");
      if (cached && cached !== "null" && cached !== "undefined") {
        try {
          userData = JSON.parse(cached);
          console.log('📦 Usando dados do localStorage:', userData);
        } catch (e) {
          console.error('❌ Erro ao ler localStorage:', e);
        }
      }
    }
    
    // ✅ Salva novos dados quando disponíveis
    if (meQuery.data) {
      localStorage.setItem(
        "manus-runtime-user-info",
        JSON.stringify(meQuery.data)
      );
    }
    
    console.log('🔍 useAuth state:', {
      data: meQuery.data,
      userData,
      loading: meQuery.isLoading,
      error: meQuery.error,
    });
    
    return {
      user: userData ?? null,
      loading: meQuery.isLoading || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(userData),
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || logoutMutation.isPending) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    state.user,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
