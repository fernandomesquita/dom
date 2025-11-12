import { useEffect } from 'react';
import { trpc } from '@/lib/trpc';

/**
 * Hook para renovar access token automaticamente a cada 10 minutos.
 * Previne logout inesperado mantendo a sessão ativa enquanto o usuário
 * estiver usando o sistema.
 * 
 * O refresh ocorre:
 * - A cada 10 minutos (antes do token expirar aos 15min)
 * - Automaticamente em background
 * - Sem interromper a navegação do usuário
 * 
 * Se o refresh falhar (token expirado ou inválido):
 * - Limpa o localStorage
 * - Redireciona para página de login
 */
export function useAutoRefresh() {
  const refreshMutation = trpc.auth.refreshToken.useMutation();
  
  useEffect(() => {
    // Intervalo de 10 minutos (600000ms)
    const REFRESH_INTERVAL = 10 * 60 * 1000;
    
    const interval = setInterval(async () => {
      const refreshToken = localStorage.getItem('refresh_token');
      
      // Se não há refresh token, pular tentativa
      if (!refreshToken) {
        console.warn('[Auth] No refresh token found, skipping auto-refresh');
        return;
      }
      
      try {
        const result = await refreshMutation.mutateAsync({ refreshToken });
        console.log('[Auth] Token refreshed successfully');
        
        // Se o servidor retornou novo refresh token (rotation)
        if (result.tokens?.refreshToken) {
          localStorage.setItem('refresh_token', result.tokens.refreshToken);
        }
      } catch (err) {
        console.error('[Auth] Auto-refresh failed:', err);
        
        // Limpar token inválido
        localStorage.removeItem('refresh_token');
        
        // Redirecionar para login
        window.location.href = '/login';
      }
    }, REFRESH_INTERVAL);
    
    // Cleanup ao desmontar componente
    return () => clearInterval(interval);
  }, [refreshMutation]);
}
