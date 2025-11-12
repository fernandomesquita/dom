import { toast } from 'sonner';

type AvisoToastProps = {
  id: string;
  tipo: 'informativo' | 'importante' | 'urgente' | 'individual' | 'premium';
  titulo: string;
  conteudo: string;
  ctaTexto: string | null;
  ctaUrl: string | null;
};

export function showAvisoToast(aviso: AvisoToastProps) {
  const variant = aviso.tipo === 'urgente' ? 'error' : aviso.tipo === 'importante' ? 'warning' : 'info';
  
  toast(aviso.titulo, {
    description: aviso.conteudo,
    action: aviso.ctaTexto && aviso.ctaUrl ? {
      label: aviso.ctaTexto,
      onClick: () => window.open(aviso.ctaUrl!, '_blank'),
    } : undefined,
    duration: 5000,
  });
}
