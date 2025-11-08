import { Trophy, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";

/**
 * E10: XP Bar (Gamificação)
 * 
 * Barra de XP fixa no topo do dashboard mostrando:
 * - Nível atual
 * - XP atual / XP necessário
 * - Progresso visual
 * - Animação ao ganhar XP
 */

export function XPBar() {
  const { data, isLoading } = trpc.dashboard.getSummary.useQuery();

  if (isLoading || !data) {
    return null;
  }

  const xp = data.xp;
  const progressoPercentual = (xp.totalXp / xp.xpForNextLevel) * 100;

  return (
    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-3">
      <div className="container">
        <div className="flex items-center gap-4">
          {/* Nível */}
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
            <Trophy className="h-5 w-5" />
            <span className="font-bold">Nível {xp.currentLevel}</span>
          </div>

          {/* Barra de XP */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4" />
                <span className="font-medium">XP</span>
              </div>
              <span className="font-semibold">
                {xp.totalXp} / {xp.xpForNextLevel}
              </span>
            </div>
            <Progress
              value={progressoPercentual}
              className="h-2 bg-white/20"
            />
          </div>

          {/* Estatísticas Rápidas */}
          <div className="hidden md:flex items-center gap-4 text-sm">
            <div className="text-center">
              <p className="font-bold">{xp.totalMetasConcluidas}</p>
              <p className="text-xs opacity-80">Metas</p>
            </div>
            <div className="text-center">
              <p className="font-bold">{xp.totalQuestoesResolvidas}</p>
              <p className="text-xs opacity-80">Questões</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
