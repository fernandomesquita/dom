import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Componente ErrorState Reutilizável
 * 
 * Exibe mensagem de erro amigável com opção de retry.
 * Usado em widgets, páginas e qualquer lugar que precise de tratamento de erro.
 */

interface ErrorStateProps {
  /**
   * Título do erro (opcional)
   * @default "Algo deu errado"
   */
  title?: string;

  /**
   * Mensagem de erro detalhada (opcional)
   * @default "Não foi possível carregar os dados. Tente novamente."
   */
  message?: string;

  /**
   * Callback para retry (opcional)
   * Se fornecido, exibe botão "Tentar Novamente"
   */
  onRetry?: () => void;

  /**
   * Texto do botão de retry (opcional)
   * @default "Tentar Novamente"
   */
  retryText?: string;

  /**
   * Variante do componente (opcional)
   * - "card": Exibe dentro de um Card (para widgets)
   * - "inline": Exibe sem Card (para seções de página)
   * @default "card"
   */
  variant?: "card" | "inline";

  /**
   * Tamanho do componente (opcional)
   * - "sm": Pequeno (para widgets compactos)
   * - "md": Médio (padrão)
   * - "lg": Grande (para páginas inteiras)
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
}

export function ErrorState({
  title = "Algo deu errado",
  message = "Não foi possível carregar os dados. Tente novamente.",
  onRetry,
  retryText = "Tentar Novamente",
  variant = "card",
  size = "md",
}: ErrorStateProps) {
  const sizeClasses = {
    sm: {
      icon: "h-8 w-8",
      title: "text-sm",
      message: "text-xs",
      padding: "py-4",
    },
    md: {
      icon: "h-12 w-12",
      title: "text-base",
      message: "text-sm",
      padding: "py-6",
    },
    lg: {
      icon: "h-16 w-16",
      title: "text-lg",
      message: "text-base",
      padding: "py-8",
    },
  };

  const classes = sizeClasses[size];

  const content = (
    <div className={`text-center ${classes.padding}`}>
      {/* Ícone de Erro */}
      <div className="flex justify-center mb-4">
        <div className="rounded-full bg-destructive/10 p-3">
          <AlertCircle className={`${classes.icon} text-destructive`} />
        </div>
      </div>

      {/* Título */}
      <h3 className={`font-semibold ${classes.title} mb-2`}>{title}</h3>

      {/* Mensagem */}
      <p className={`text-muted-foreground ${classes.message} mb-4 max-w-sm mx-auto`}>
        {message}
      </p>

      {/* Botão de Retry */}
      {onRetry && (
        <Button
          variant="outline"
          size={size === "sm" ? "sm" : "default"}
          onClick={onRetry}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          {retryText}
        </Button>
      )}
    </div>
  );

  if (variant === "card") {
    return (
      <Card className="border-destructive/20">
        <CardContent className="p-0">{content}</CardContent>
      </Card>
    );
  }

  return content;
}

/**
 * Variante compacta para widgets
 */
export function WidgetErrorState({
  onRetry,
  message,
}: {
  onRetry?: () => void;
  message?: string;
}) {
  return (
    <ErrorState
      title="Erro ao carregar"
      message={message}
      onRetry={onRetry}
      variant="card"
      size="sm"
    />
  );
}

/**
 * Variante para páginas inteiras
 */
export function PageErrorState({
  onRetry,
  title,
  message,
}: {
  onRetry?: () => void;
  title?: string;
  message?: string;
}) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <ErrorState
        title={title}
        message={message}
        onRetry={onRetry}
        variant="inline"
        size="lg"
      />
    </div>
  );
}
