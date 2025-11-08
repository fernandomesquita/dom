import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AvisoBannerProps {
  aviso: {
    id: string;
    tipo: 'informativo' | 'importante' | 'urgente' | 'individual' | 'premium';
    titulo: string;
    conteudo: string;
    ctaTexto?: string | null;
    ctaUrl?: string | null;
    dispensavel: boolean;
  };
  onDismiss?: () => void;
  onClickCTA?: () => void;
}

export function AvisoBanner({ aviso, onDismiss, onClickCTA }: AvisoBannerProps) {
  const handleCTA = () => {
    if (onClickCTA) {
      onClickCTA();
    }
    if (aviso.ctaUrl) {
      window.open(aviso.ctaUrl, '_blank');
    }
  };

  // Definir variante e ícone baseado no tipo
  const getTipoConfig = () => {
    switch (aviso.tipo) {
      case 'urgente':
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          variant: 'destructive' as const,
          badgeVariant: 'destructive' as const,
        };
      case 'importante':
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          variant: 'default' as const,
          badgeVariant: 'default' as const,
        };
      case 'premium':
        return {
          icon: <Info className="h-5 w-5" />,
          variant: 'default' as const,
          badgeVariant: 'secondary' as const,
        };
      case 'individual':
        return {
          icon: <Info className="h-5 w-5" />,
          variant: 'default' as const,
          badgeVariant: 'secondary' as const,
        };
      default:
        return {
          icon: <Info className="h-5 w-5" />,
          variant: 'default' as const,
          badgeVariant: 'outline' as const,
        };
    }
  };

  const config = getTipoConfig();

  return (
    <Alert variant={config.variant} className="mb-4 relative">
      <div className="flex items-start gap-3">
        {config.icon}
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <AlertTitle className="mb-0">{aviso.titulo}</AlertTitle>
            <Badge variant={config.badgeVariant} className="text-xs">
              {aviso.tipo.toUpperCase()}
            </Badge>
          </div>
          <AlertDescription className="text-sm">
            {aviso.conteudo}
          </AlertDescription>
          {aviso.ctaTexto && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleCTA}
              className="mt-2"
            >
              {aviso.ctaTexto}
            </Button>
          )}
        </div>
        {aviso.dispensavel && onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full absolute top-2 right-2"
            onClick={onDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Alert>
  );
}
