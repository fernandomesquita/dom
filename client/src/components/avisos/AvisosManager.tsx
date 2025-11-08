import { useEffect, useState } from 'react';
import { useAvisos } from '@/hooks/useAvisos';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/_core/hooks/useAuth';
import { AvisoModal } from './AvisoModal';
import { AvisoBanner } from './AvisoBanner';
import { showAvisoToast } from './AvisoToast';
import { toast } from 'sonner';

/**
 * Componente orquestrador que gerencia a exibição automática de avisos
 * baseado no formato configurado (modal, banner, toast)
 */
export function AvisosManager() {
  const { user } = useAuth();
  const {
    avisoAtual,
    marcarComoVisto,
    dispensarAviso,
    registrarCliqueCTA,
    proximoAviso,
    refetch,
  } = useAvisos();

  // WebSocket para notificações em tempo real
  const { on, off, isConnected } = useSocket({
    userId: user?.id,
    autoConnect: true,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [bannerAviso, setBannerAviso] = useState<any | null>(null);
  const [avisosExibidos, setAvisosExibidos] = useState<Set<string>>(new Set());

  // Exibir aviso automaticamente quando houver um novo
  useEffect(() => {
    if (!avisoAtual || avisosExibidos.has(avisoAtual.id)) {
      return;
    }

    // Marcar como visualizado
    marcarComoVisto(avisoAtual.id);

    // Exibir baseado no formato
    switch (avisoAtual.formato) {
      case 'modal':
        setModalOpen(true);
        break;

      case 'banner':
        setBannerAviso(avisoAtual);
        break;

      case 'toast':
        showAvisoToast(avisoAtual, () => {
          registrarCliqueCTA(avisoAtual.id);
        });
        // Toast é automático, avançar para próximo
        proximoAviso();
        break;

      default:
        // Badge não exibe automaticamente, apenas conta
        proximoAviso();
    }

    // Adicionar à lista de exibidos
    setAvisosExibidos(prev => new Set(prev).add(avisoAtual.id));
  }, [avisoAtual, avisosExibidos]);

  // Escutar eventos WebSocket
  useEffect(() => {
    if (!isConnected) return;

    const handleNovoAviso = (data: any) => {
      console.log('[AvisosManager] Novo aviso recebido via WebSocket:', data);
      toast.info('🔔 Nova notificação recebida!');
      // Recarregar avisos
      refetch();
    };

    const handleAvisoAtualizado = (data: any) => {
      console.log('[AvisosManager] Aviso atualizado via WebSocket:', data);
      // Recarregar avisos
      refetch();
    };

    const handleAvisoExcluido = (data: any) => {
      console.log('[AvisosManager] Aviso excluído via WebSocket:', data);
      // Recarregar avisos
      refetch();
    };

    on('novoAviso', handleNovoAviso);
    on('avisoAtualizado', handleAvisoAtualizado);
    on('avisoExcluido', handleAvisoExcluido);

    return () => {
      off('novoAviso', handleNovoAviso);
      off('avisoAtualizado', handleAvisoAtualizado);
      off('avisoExcluido', handleAvisoExcluido);
    };
  }, [isConnected, on, off, refetch]);

  const handleCloseModal = () => {
    setModalOpen(false);
    proximoAviso();
  };

  const handleDismissModal = () => {
    if (avisoAtual) {
      dispensarAviso(avisoAtual.id);
    }
    setModalOpen(false);
    proximoAviso();
  };

  const handleClickCTAModal = () => {
    if (avisoAtual) {
      registrarCliqueCTA(avisoAtual.id);
    }
  };

  const handleDismissBanner = () => {
    if (bannerAviso) {
      dispensarAviso(bannerAviso.id);
      setBannerAviso(null);
      proximoAviso();
    }
  };

  const handleClickCTABanner = () => {
    if (bannerAviso) {
      registrarCliqueCTA(bannerAviso.id);
    }
  };

  return (
    <>
      {/* Modal */}
      {avisoAtual && avisoAtual.formato === 'modal' && (
        <AvisoModal
          aviso={avisoAtual}
          open={modalOpen}
          onClose={handleCloseModal}
          onDismiss={handleDismissModal}
          onClickCTA={handleClickCTAModal}
        />
      )}

      {/* Banner */}
      {bannerAviso && (
        <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto">
            <AvisoBanner
              aviso={bannerAviso}
              onDismiss={handleDismissBanner}
              onClickCTA={handleClickCTABanner}
            />
          </div>
        </div>
      )}

      {/* Toast é renderizado automaticamente pelo Sonner */}
    </>
  );
}
