import { useEffect } from 'react';
import { toast } from 'sonner';
import { AlertCircle, AlertTriangle, Info, Sparkles } from 'lucide-react';

interface AvisoToastProps {
  aviso: {
    id: string;
    tipo: 'informativo' | 'importante' | 'urgente' | 'individual' | 'premium';
    titulo: string;
    conteudo: string;
    ctaTexto?: string | null;
    ctaUrl?: string | null;
  };
  onClickCTA?: () => void;
}

export function AvisoToast({ aviso, onClickCTA }: AvisoToastProps) {
  useEffect(() => {
    // Definir ícone baseado no tipo
    const getIcon = () => {
      switch (aviso.tipo) {
        case 'urgente':
          return <AlertCircle className="h-5 w-5 text-red-600" />;
        case 'importante':
          return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
        case 'premium':
          return <Sparkles className="h-5 w-5 text-purple-600" />;
        case 'individual':
          return <Info className="h-5 w-5 text-blue-600" />;
        default:
          return <Info className="h-5 w-5 text-green-600" />;
      }
    };

    // Exibir toast
    toast(aviso.titulo, {
      description: aviso.conteudo,
      icon: getIcon(),
      duration: aviso.tipo === 'urgente' ? 10000 : 5000, // Urgente fica mais tempo
      action: aviso.ctaTexto
        ? {
            label: aviso.ctaTexto,
            onClick: () => {
              if (onClickCTA) {
                onClickCTA();
              }
              if (aviso.ctaUrl) {
                window.open(aviso.ctaUrl, '_blank');
              }
            },
          }
        : undefined,
    });
  }, [aviso, onClickCTA]);

  return null; // Componente não renderiza nada (toast é gerenciado pelo Sonner)
}

// Função helper para exibir toast diretamente
export function showAvisoToast(
  aviso: AvisoToastProps['aviso'],
  onClickCTA?: () => void
) {
  const getIcon = () => {
    switch (aviso.tipo) {
      case 'urgente':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'importante':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'premium':
        return <Sparkles className="h-5 w-5 text-purple-600" />;
      case 'individual':
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Info className="h-5 w-5 text-green-600" />;
    }
  };

  toast(aviso.titulo, {
    description: aviso.conteudo,
    icon: getIcon(),
    duration: aviso.tipo === 'urgente' ? 10000 : 5000,
    action: aviso.ctaTexto
      ? {
          label: aviso.ctaTexto,
          onClick: () => {
            if (onClickCTA) {
              onClickCTA();
            }
            if (aviso.ctaUrl) {
              window.open(aviso.ctaUrl, '_blank');
            }
          },
        }
      : undefined,
  });
}
