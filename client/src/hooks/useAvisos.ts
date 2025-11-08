import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

/**
 * Hook para gerenciar avisos pendentes do usuário
 * Busca avisos automaticamente e fornece métodos para interação
 */
export function useAvisos() {
  const { isAuthenticated } = useAuth();
  const [avisoAtual, setAvisoAtual] = useState<any | null>(null);
  const [avisosPendentes, setAvisosPendentes] = useState<any[]>([]);

  // Buscar avisos pendentes
  const { data: avisos, refetch } = trpc.avisosAluno.getPendentes.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 60000, // Recarregar a cada 1 minuto
  });

  // Mutations
  const registrarVisualizacao = trpc.avisosAluno.registrarVisualizacao.useMutation();
  const dispensar = trpc.avisosAluno.dispensar.useMutation();
  const clicarCTA = trpc.avisosAluno.clicarCTA.useMutation();

  // Atualizar lista de avisos pendentes quando dados mudarem
  useEffect(() => {
    if (avisos && avisos.length > 0) {
      // Ordenar por prioridade (menor número = maior prioridade)
      const avisosOrdenados = [...avisos].sort((a, b) => a.prioridade - b.prioridade);
      setAvisosPendentes(avisosOrdenados);
      
      // Definir primeiro aviso como atual se não houver nenhum
      if (!avisoAtual && avisosOrdenados.length > 0) {
        setAvisoAtual(avisosOrdenados[0]);
      }
    } else {
      setAvisosPendentes([]);
      setAvisoAtual(null);
    }
  }, [avisos]);

  // Registrar visualização de um aviso
  const marcarComoVisto = async (avisoId: string) => {
    try {
      await registrarVisualizacao.mutateAsync({
        avisoId,
        dispositivo: getDispositivo(),
      });
      await refetch();
    } catch (error) {
      console.error('Erro ao registrar visualização:', error);
    }
  };

  // Dispensar aviso
  const dispensarAviso = async (avisoId: string) => {
    try {
      await dispensar.mutateAsync({ avisoId });
      
      // Remover da lista local
      setAvisosPendentes(prev => prev.filter(a => a.id !== avisoId));
      
      // Se era o aviso atual, mostrar próximo
      if (avisoAtual?.id === avisoId) {
        const proximoAviso = avisosPendentes.find(a => a.id !== avisoId);
        setAvisoAtual(proximoAviso || null);
      }
      
      await refetch();
    } catch (error) {
      console.error('Erro ao dispensar aviso:', error);
    }
  };

  // Registrar clique no CTA
  const registrarCliqueCTA = async (avisoId: string) => {
    try {
      await clicarCTA.mutateAsync({ avisoId });
      await refetch();
    } catch (error) {
      console.error('Erro ao registrar clique CTA:', error);
    }
  };

  // Avançar para próximo aviso
  const proximoAviso = () => {
    const indexAtual = avisosPendentes.findIndex(a => a.id === avisoAtual?.id);
    if (indexAtual < avisosPendentes.length - 1) {
      setAvisoAtual(avisosPendentes[indexAtual + 1]);
    } else {
      setAvisoAtual(null);
    }
  };

  return {
    // Estado
    avisoAtual,
    avisosPendentes,
    totalPendentes: avisosPendentes.length,
    
    // Métodos
    marcarComoVisto,
    dispensarAviso,
    registrarCliqueCTA,
    proximoAviso,
    refetch,
  };
}

// Detectar tipo de dispositivo
function getDispositivo(): 'mobile' | 'desktop' | 'tablet' {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}
