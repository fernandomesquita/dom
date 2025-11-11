import { useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MaterialFavoriteButtonProps {
  materialId: number;
  initialIsFavorite?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
}

export function MaterialFavoriteButton({
  materialId,
  initialIsFavorite = false,
  variant = "ghost",
  size = "default",
  showText = false,
}: MaterialFavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const utils = trpc.useUtils();

  const favoriteMutation = trpc.admin.materials_v1.toggleFavorite.useMutation({
    onSuccess: (data) => {
      setIsFavorite(data.isFavorite);
      
      if (data.action === 'added') {
        toast.success("Material adicionado aos favoritos! ❤️");
      } else {
        toast.success("Material removido dos favoritos");
      }

      // Invalidar queries para atualizar contadores
      utils.admin.materials_v1.getById.invalidate({ id: materialId });
      utils.admin.materials_v1.listFavorites.invalidate();
      utils.admin.materials_v1.getFavoritesCount.invalidate();
    },
    onError: (error) => {
      toast.error("Erro ao favoritar material", {
        description: error.message,
      });
    },
  });

  const handleToggle = () => {
    favoriteMutation.mutate({ materialId });
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={favoriteMutation.isPending}
      className={cn(
        "transition-all",
        isFavorite && "text-red-500 hover:text-red-600"
      )}
    >
      {favoriteMutation.isPending ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <>
          <Heart
            className={cn(
              "h-5 w-5 transition-all",
              isFavorite && "fill-current"
            )}
          />
          {showText && (
            <span className="ml-2">
              {isFavorite ? "Favoritado" : "Favoritar"}
            </span>
          )}
        </>
      )}
    </Button>
  );
}
