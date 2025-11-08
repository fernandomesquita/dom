import { Trophy, Lock, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";

/**
 * E10: Achievements Dialog
 * 
 * Dialog para exibir todas as conquistas:
 * - Desbloqueadas (com data)
 * - Bloqueadas (com descrição)
 * - Progresso geral
 * - Filtro por raridade
 */

export function AchievementsDialog() {
  const { data, isLoading } = trpc.gamification.getAchievements.useQuery();

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "comum":
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
      case "raro":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300";
      case "epico":
        return "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300";
      case "lendario":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
    }
  };

  const getRarityBadgeVariant = (rarity: string) => {
    switch (rarity) {
      case "lendario":
        return "default";
      case "epico":
        return "secondary";
      case "raro":
        return "outline";
      default:
        return "outline";
    }
  };

  const progressoPercentual = data
    ? (data.totalUnlocked / data.totalAvailable) * 100
    : 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Trophy className="h-4 w-4 mr-2" />
          Conquistas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Suas Conquistas
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-20 bg-muted rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progresso Geral */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Progresso Geral</span>
                <span className="font-semibold">
                  {data?.totalUnlocked}/{data?.totalAvailable}
                </span>
              </div>
              <Progress value={progressoPercentual} className="h-2" />
            </div>

            {/* Lista de Conquistas */}
            <div className="grid grid-cols-1 gap-3">
              {data?.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    achievement.unlocked
                      ? getRarityColor(achievement.rarity)
                      : "bg-muted/50 opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Ícone */}
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                        achievement.unlocked
                          ? "bg-white/50 dark:bg-black/20"
                          : "bg-muted"
                      }`}
                    >
                      {achievement.unlocked ? (
                        <Trophy className="h-6 w-6" />
                      ) : (
                        <Lock className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">
                          {achievement.title}
                        </h4>
                        <Badge
                          variant={getRarityBadgeVariant(achievement.rarity)}
                          className="text-xs"
                        >
                          {achievement.rarity}
                        </Badge>
                        {achievement.unlocked && !achievement.viewed && (
                          <Badge variant="destructive" className="text-xs animate-pulse">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Novo!
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {achievement.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">
                          +{achievement.xpReward} XP
                        </span>
                        {achievement.unlocked && achievement.unlockedAt && (
                          <span className="text-xs text-muted-foreground">
                            Desbloqueada em{" "}
                            {new Date(achievement.unlockedAt).toLocaleDateString("pt-BR")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
