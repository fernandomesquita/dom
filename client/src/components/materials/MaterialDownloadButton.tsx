import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface MaterialDownloadButtonProps {
  materialId: number;
  itemId?: number;
  fileName?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
}

export function MaterialDownloadButton({
  materialId,
  itemId,
  fileName = "material",
  variant = "default",
  size = "default",
  showText = true,
}: MaterialDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const utils = trpc.useUtils();

  const downloadMutation = trpc.admin.materials_v1.downloadMaterial.useMutation({
    onSuccess: (data) => {
      // Iniciar download do arquivo
      const link = document.createElement('a');
      link.href = data.downloadUrl;
      link.download = data.fileName || fileName;
      link.target = '_blank'; // Abrir em nova aba se não for possível download direto
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Download iniciado!", {
        description: `Arquivo: ${data.fileName}`,
      });

      // Invalidar query para atualizar contador
      utils.admin.materials_v1.getById.invalidate({ id: materialId });
      
      setIsDownloading(false);
    },
    onError: (error) => {
      toast.error("Erro ao baixar material", {
        description: error.message,
      });
      setIsDownloading(false);
    },
  });

  const handleDownload = () => {
    setIsDownloading(true);
    downloadMutation.mutate({ materialId, itemId });
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={isDownloading}
    >
      {isDownloading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {showText && "Baixando..."}
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          {showText && "Baixar Material"}
        </>
      )}
    </Button>
  );
}
