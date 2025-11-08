import { z } from "zod";
import { router, protectedProcedure } from "../../_core/trpc";
import { getDb } from "../../db";
import { gamificationXp, gamificationAchievements } from "../../../drizzle/schema-dashboard";
import { eq } from "drizzle-orm";

/**
 * E10: Gamification Router
 * 
 * 4 procedures:
 * 1. getXP - Obter XP e nível do usuário
 * 2. addXP - Adicionar XP (usado internamente)
 * 3. getAchievements - Listar conquistas
 * 4. unlockAchievement - Desbloquear conquista
 */

// Definição de conquistas disponíveis
const ACHIEVEMENTS = [
  {
    id: "primeira_meta",
    title: "Primeira Meta",
    description: "Complete sua primeira meta",
    icon: "target",
    rarity: "comum" as const,
    xpReward: 50,
  },
  {
    id: "streak_7",
    title: "Semana Completa",
    description: "Mantenha um streak de 7 dias",
    icon: "flame",
    rarity: "raro" as const,
    xpReward: 200,
  },
  {
    id: "streak_30",
    title: "Mês Dedicado",
    description: "Mantenha um streak de 30 dias",
    icon: "trophy",
    rarity: "epico" as const,
    xpReward: 1000,
  },
  {
    id: "questoes_100",
    title: "Centenário",
    description: "Resolva 100 questões",
    icon: "brain",
    rarity: "raro" as const,
    xpReward: 300,
  },
  {
    id: "questoes_1000",
    title: "Mestre das Questões",
    description: "Resolva 1000 questões",
    icon: "crown",
    rarity: "lendario" as const,
    xpReward: 5000,
  },
  {
    id: "taxa_acerto_90",
    title: "Precisão Cirúrgica",
    description: "Alcance 90% de acerto em 50 questões",
    icon: "crosshair",
    rarity: "epico" as const,
    xpReward: 800,
  },
  {
    id: "materiais_10",
    title: "Leitor Voraz",
    description: "Complete 10 materiais",
    icon: "book",
    rarity: "comum" as const,
    xpReward: 100,
  },
  {
    id: "revisoes_50",
    title: "Revisor Dedicado",
    description: "Complete 50 revisões",
    icon: "refresh-cw",
    rarity: "raro" as const,
    xpReward: 400,
  },
  {
    id: "forum_10_posts",
    title: "Participativo",
    description: "Crie 10 posts no fórum",
    icon: "message-square",
    rarity: "comum" as const,
    xpReward: 150,
  },
  {
    id: "nivel_10",
    title: "Veterano",
    description: "Alcance o nível 10",
    icon: "star",
    rarity: "epico" as const,
    xpReward: 1500,
  },
];

// Fórmula de XP por nível: 100 * (level ^ 1.5)
function calculateXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

export const gamificationRouter = router({
  /**
   * 1. getXP - Obter XP e nível do usuário
   */
  getXP: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const userId = ctx.user.id;

    const [xpData] = await db
      .select()
      .from(gamificationXp)
      .where(eq(gamificationXp.userId, userId))
      .limit(1);

    if (!xpData) {
      // Criar registro inicial
      const initialXP = {
        id: `xp_${userId}_${Date.now()}`,
        userId,
        totalXp: 0,
        currentLevel: 1,
        xpForNextLevel: calculateXPForLevel(2),
        lastXpGain: null,
        lastLevelUp: null,
        totalMetasConcluidas: 0,
        totalQuestoesResolvidas: 0,
        totalMateriaisLidos: 0,
        totalRevisoesConcluidas: 0,
      };

      await db.insert(gamificationXp).values(initialXP);

      return initialXP;
    }

    return xpData;
  }),

  /**
   * 2. addXP - Adicionar XP ao usuário
   * Usado internamente quando o usuário completa ações
   */
  addXP: protectedProcedure
    .input(
      z.object({
        amount: z.number().min(1),
        source: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userId = ctx.user.id;

      // Buscar XP atual
      const [xpData] = await db
        .select()
        .from(gamificationXp)
        .where(eq(gamificationXp.userId, userId))
        .limit(1);

      if (!xpData) {
        throw new Error("XP data not found");
      }

      const newTotalXp = xpData.totalXp + input.amount;
      let newLevel = xpData.currentLevel;
      let leveledUp = false;

      // Verificar se subiu de nível
      while (newTotalXp >= calculateXPForLevel(newLevel + 1)) {
        newLevel++;
        leveledUp = true;
      }

      const xpForNextLevel = calculateXPForLevel(newLevel + 1);

      // Atualizar XP
      await db
        .update(gamificationXp)
        .set({
          totalXp: newTotalXp,
          currentLevel: newLevel,
          xpForNextLevel,
          lastXpGain: new Date(),
          lastLevelUp: leveledUp ? new Date() : xpData.lastLevelUp,
        })
        .where(eq(gamificationXp.userId, userId));

      return {
        success: true,
        newTotalXp,
        newLevel,
        leveledUp,
        xpGained: input.amount,
      };
    }),

  /**
   * 3. getAchievements - Listar conquistas do usuário
   */
  getAchievements: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const userId = ctx.user.id;

    // Buscar conquistas desbloqueadas
    const unlockedAchievements = await db
      .select()
      .from(gamificationAchievements)
      .where(eq(gamificationAchievements.userId, userId));

    // Mapear conquistas disponíveis
    const allAchievements = ACHIEVEMENTS.map((achievement) => {
      const unlocked = unlockedAchievements.find(
        (ua) => ua.achievementId === achievement.id
      );

      return {
        ...achievement,
        unlocked: !!unlocked,
        unlockedAt: unlocked?.unlockedAt || null,
        viewed: unlocked?.viewedAt ? true : false,
      };
    });

    return {
      achievements: allAchievements,
      totalUnlocked: unlockedAchievements.length,
      totalAvailable: ACHIEVEMENTS.length,
    };
  }),

  /**
   * 4. unlockAchievement - Desbloquear conquista
   * Usado internamente quando o usuário atinge um marco
   */
  unlockAchievement: protectedProcedure
    .input(
      z.object({
        achievementId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userId = ctx.user.id;

      // Verificar se conquista existe
      const achievement = ACHIEVEMENTS.find((a) => a.id === input.achievementId);
      if (!achievement) {
        throw new Error("Achievement not found");
      }

      // Verificar se já foi desbloqueada
      const [existing] = await db
        .select()
        .from(gamificationAchievements)
        .where(
          eq(gamificationAchievements.userId, userId)
        )
        .limit(1);

      if (existing) {
        return { success: false, message: "Achievement already unlocked" };
      }

      // Desbloquear conquista
      await db.insert(gamificationAchievements).values({
        id: `ach_${userId}_${input.achievementId}_${Date.now()}`,
        userId,
        achievementId: input.achievementId,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        rarity: achievement.rarity,
        xpReward: achievement.xpReward,
        unlockedAt: new Date(),
        viewedAt: null,
      });

      // Adicionar XP da conquista
      await db
        .update(gamificationXp)
        .set({
          totalXp: gamificationXp.totalXp + achievement.xpReward,
        })
        .where(eq(gamificationXp.userId, userId));

      return {
        success: true,
        achievement,
        xpReward: achievement.xpReward,
      };
    }),

  /**
   * 5. markAchievementAsViewed - Marcar conquista como visualizada
   */
  markAchievementAsViewed: protectedProcedure
    .input(
      z.object({
        achievementId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userId = ctx.user.id;

      await db
        .update(gamificationAchievements)
        .set({
          viewedAt: new Date(),
        })
        .where(
          eq(gamificationAchievements.userId, userId)
        );

      return { success: true };
    }),
});
