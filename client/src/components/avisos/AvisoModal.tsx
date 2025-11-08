import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AvisoModalProps {
  aviso: {
    id: string;
    tipo: 'informativo' | 'importante' | 'urgente' | 'individual' | 'premium';
    titulo: string;
    conteudo: string;
    imagemUrl?: string | null;
    ctaTexto?: string | null;
    ctaUrl?: string | null;
    dispensavel: boolean;
  };
  open: boolean;
  onClose: () => void;
  onDismiss?: () => void;
  onClickCTA?: () => void;
}

export function AvisoModal({ aviso, open, onClose, onDismiss, onClickCTA }: AvisoModalProps) {
  const handleCTA = () => {
    if (onClickCTA) {
      onClickCTA();
    }
    if (aviso.ctaUrl) {
      window.open(aviso.ctaUrl, '_blank');
    }
    onClose();
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
    onClose();
  };

  // Definir ícone e cor baseado no tipo
  const getTipoConfig = () => {
    switch (aviso.tipo) {
      case 'urgente':
        return {
          icon: <AlertCircle className="h-6 w-6" />,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          badge: 'destructive' as const,
        };
      case 'importante':
        return {
          icon: <AlertTriangle className="h-6 w-6" />,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          badge: 'default' as const,
        };
      case 'premium':
        return {
          icon: <Info className="h-6 w-6" />,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          badge: 'secondary' as const,
        };
      case 'individual':
        return {
          icon: <Info className="h-6 w-6" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          badge: 'secondary' as const,
        };
      default:
        return {
          icon: <Info className="h-6 w-6" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          badge: 'outline' as const,
        };
    }
  };

  const config = getTipoConfig();

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        {/* Header com ícone e badge */}
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className={`${config.bgColor} ${config.borderColor} border p-2 rounded-lg`}>
              <div className={config.color}>
                {config.icon}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <DialogTitle className="text-lg">{aviso.titulo}</DialogTitle>
                <Badge variant={config.badge} className="text-xs">
                  {aviso.tipo.toUpperCase()}
                </Badge>
              </div>
            </div>
            {aviso.dispensavel && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Imagem (se houver) */}
        {aviso.imagemUrl && (
          <div className="w-full rounded-lg overflow-hidden border">
            <img
              src={aviso.imagemUrl}
              alt={aviso.titulo}
              className="w-full h-auto object-cover max-h-[200px]"
            />
          </div>
        )}

        {/* Conteúdo */}
        <DialogDescription className="text-sm text-foreground whitespace-pre-wrap">
          {aviso.conteudo}
        </DialogDescription>

        {/* Footer com CTAs */}
        <DialogFooter className="flex-col sm:flex-row gap-2">
          {aviso.dispensavel && (
            <Button variant="outline" onClick={handleDismiss} className="w-full sm:w-auto">
              Dispensar
            </Button>
          )}
          {aviso.ctaTexto && (
            <Button onClick={handleCTA} className="w-full sm:w-auto">
              {aviso.ctaTexto}
            </Button>
          )}
          {!aviso.ctaTexto && !aviso.dispensavel && (
            <Button onClick={onClose} className="w-full sm:w-auto">
              Entendi
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
