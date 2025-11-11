import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface MaterialVoteButtonsProps {
  materialId: number;
  initialUpvotes: number;
  initialUserVote?: 'up' | 'down' | null;
}

export function MaterialVoteButtons({ 
  materialId, 
  initialUpvotes,
  initialUserVote = null
}: MaterialVoteButtonsProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(initialUserVote);
  const utils = trpc.useUtils();
  
  const voteMutation = trpc.admin.materials_v1.voteMaterial.useMutation({
    onSuccess: (data) => {
      setUpvotes(data.upvotes);
      setUserVote(data.userVote);
      toast.success(data.userVote === 'up' ? 'Voto positivo registrado!' : data.userVote === 'down' ? 'Voto negativo registrado!' : 'Voto removido!');
      // Invalidar query para atualizar estatísticas
      utils.admin.materials_v1.getById.invalidate({ id: materialId });
    },
    onError: (error) => {
      toast.error(`Erro ao votar: ${error.message}`);
    }
  });

  const handleVote = (voteType: 'up' | 'down') => {
    voteMutation.mutate({ materialId, voteType });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={userVote === 'up' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleVote('up')}
        disabled={voteMutation.isPending}
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>
      
      <span className="text-sm font-medium min-w-[2ch] text-center">
        {upvotes}
      </span>
      
      <Button
        variant={userVote === 'down' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleVote('down')}
        disabled={voteMutation.isPending}
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>
    </div>
  );
}
