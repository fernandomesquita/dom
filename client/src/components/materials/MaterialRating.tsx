import { useState } from "react";
import { Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MaterialRatingProps {
  materialId: number;
  currentRating: number;
  ratingCount?: number;
  userRating?: number | null;
}

export function MaterialRating({ 
  materialId, 
  currentRating,
  ratingCount = 0,
  userRating = null
}: MaterialRatingProps) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [localUserRating, setLocalUserRating] = useState<number | null>(userRating);
  const utils = trpc.useUtils();
  
  const rateMutation = trpc.admin.materials_v1.rateMaterial.useMutation({
    onSuccess: (data) => {
      setLocalUserRating(data.userRating);
      toast.success(`Avaliação de ${data.userRating} estrela${data.userRating > 1 ? 's' : ''} registrada!`);
      // Invalidar query para atualizar estatísticas
      utils.admin.materials_v1.getById.invalidate({ id: materialId });
    },
    onError: (error) => {
      toast.error(`Erro ao avaliar: ${error.message}`);
    }
  });

  const handleRate = (rating: number) => {
    rateMutation.mutate({ materialId, rating });
  };

  const displayRating = hoveredStar ?? localUserRating ?? 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(null)}
            disabled={rateMutation.isPending}
            className="transition-transform hover:scale-110 disabled:opacity-50"
          >
            <Star
              className={cn(
                "h-5 w-5 transition-colors",
                star <= displayRating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              )}
            />
          </button>
        ))}
      </div>
      
      <div className="text-xs text-muted-foreground">
        {localUserRating ? (
          <span>Sua avaliação: {localUserRating} estrela{localUserRating > 1 ? 's' : ''}</span>
        ) : (
          <span>Clique para avaliar</span>
        )}
      </div>
      
      {ratingCount > 0 && (
        <div className="text-xs text-muted-foreground">
          Média: {currentRating.toFixed(1)} ({ratingCount} avaliação{ratingCount > 1 ? 'ões' : ''})
        </div>
      )}
    </div>
  );
}
