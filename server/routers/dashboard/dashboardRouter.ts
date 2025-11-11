import { z } from "zod";
import { router, protectedProcedure } from "../../_core/trpc";
import { getDb } from "../../db";
import { dailySummaries, dashboardCustomizations, gamificationXp } from "../../../drizzle/schema-dashboard";
import { questionAttempts } from "../../../drizzle/schema-questions";
import { metas } from "../../../drizzle/schema-metas";
import { eq, and, gte, lte, desc, sql, count } from "drizzle-orm";

/**
 * E10: Dashboard do Aluno - Router Principal
 * 
 * 5 procedures:
 * 1. getSummary - Resumo completo do dashboard
 * 2. getDailyStats - Estatísticas do dia
 * 3. getHeroData - Dados do Hero Section
 * 4. getQuickActions - Ações rápidas sugeridas
 * 5. getCustomization - Configurações do usuário
 */

export const dashboardRouter = router({
  /**
   * 1. getSummary - Resumo completo do dashboard
   * Retorna todos os dados necessários para renderizar o dashboard
   */
  getSummary: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const userId = ctx.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Buscar resumo diário
    const [dailySummary] = await db
      .select()
      .from(dailySummaries)
      .where(
        and(
          eq(dailySummaries.userId, userId),
          eq(dailySummaries.date, today)
        )
      )
      .limit(1);

    // Buscar XP e nível
    const [xpData] = await db
      .select()
      .from(gamificationXp)
      .where(eq(gamificationXp.userId, userId))
      .limit(1);

    // Buscar customizações
    const [customization] = await db
      .select()
      .from(dashboardCustomizations)
      .where(eq(dashboardCustomizations.userId, userId))
      .limit(1);

    return {
      dailySummary: dailySummary || {
        metasPlanejadas: 0,
        metasConcluidas: 0,
        metasEmAndamento: 0,
        questoesResolvidas: 0,
        questoesCorretas: 0,
        questoesErradas: 0,
        tempoEstudo: 0,
        tempoQuestoes: 0,
        tempoMateriais: 0,
        materiaisAcessados: 0,
        materiaisConcluidos: 0,
        revisoesPendentes: 0,
        revisoesConcluidas: 0,
        postsCreated: 0,
        repliesCreated: 0,
        xpGanho: 0,
      },
      xp: xpData || {
        totalXp: 0,
        currentLevel: 1,
        xpForNextLevel: 100,
        totalMetasConcluidas: 0,
        totalQuestoesResolvidas: 0,
        totalMateriaisLidos: 0,
        totalRevisoesConcluidas: 0,
      },
      customization: customization || {
        theme: "light" as const,
        compactMode: false,
        heroMessage: null,
        showMotivationalQuotes: true,
        notifyStreakRisk: true,
        notifyDailyGoals: true,
        notifyAchievements: true,
        showXpBar: true,
        showLeaderboard: true,
      },
    };
  }),

  /**
   * 2. getDailyStats - Estatísticas do dia
   * Retorna estatísticas do dia atual para o Hero Section
   */
  getDailyStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const userId = ctx.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [dailySummary] = await db
      .select()
      .from(dailySummaries)
      .where(
        and(
          eq(dailySummaries.userId, userId),
          eq(dailySummaries.date, today)
        )
      )
      .limit(1);

    if (!dailySummary) {
      return {
        metasConcluidas: 0,
        metasPlanejadas: 0,
        questoesResolvidas: 0,
        tempoEstudo: 0,
        taxaAcerto: 0,
      };
    }

    const taxaAcerto =
      dailySummary.questoesResolvidas > 0
        ? Math.round(
            (dailySummary.questoesCorretas / dailySummary.questoesResolvidas) * 100
          )
        : 0;

    return {
      metasConcluidas: dailySummary.metasConcluidas,
      metasPlanejadas: dailySummary.metasPlanejadas,
      questoesResolvidas: dailySummary.questoesResolvidas,
      tempoEstudo: dailySummary.tempoEstudo,
      taxaAcerto,
    };
  }),

  /**
   * 3. getHeroData - Dados do Hero Section
   * Retorna dados para o Hero Section (mensagem, CTA, mini-stats)
   */
  getHeroData: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const userId = ctx.user.id;
    const userName = ctx.user.name || "Aluno";
    const today = new Date();
    const hour = today.getHours();

    // Saudação por horário
    let greeting = "Bom dia";
    if (hour >= 12 && hour < 18) {
      greeting = "Boa tarde";
    } else if (hour >= 18) {
      greeting = "Boa noite";
    }

    // Buscar resumo diário
    today.setHours(0, 0, 0, 0);
    const [dailySummary] = await db
      .select()
      .from(dailySummaries)
      .where(
        and(
          eq(dailySummaries.userId, userId),
          eq(dailySummaries.date, today)
        )
      )
      .limit(1);

    // Determinar estado do CTA
    let ctaState: "iniciar_meta" | "continuar_meta" | "resolver_questoes" | "revisar_conteudo" = "iniciar_meta";
    let ctaText = "Iniciar Meta de Hoje";
    let ctaIcon = "play";

    if (dailySummary) {
      if (dailySummary.metasEmAndamento > 0) {
        ctaState = "continuar_meta";
        ctaText = "Continuar Meta";
        ctaIcon = "arrow-right";
      } else if (dailySummary.metasConcluidas >= dailySummary.metasPlanejadas && dailySummary.metasPlanejadas > 0) {
        ctaState = "resolver_questoes";
        ctaText = "Resolver Questões";
        ctaIcon = "brain";
      } else if (dailySummary.metasPlanejadas === 0) {
        ctaState = "revisar_conteudo";
        ctaText = "Revisar Conteúdo";
        ctaIcon = "book-open";
      }
    }

    // Mensagem motivacional (aleatória)
    const motivationalMessages = [
      "Você está no caminho certo! Continue assim.",
      "Cada dia é uma nova oportunidade de aprender.",
      "Seu esforço de hoje é o sucesso de amanhã.",
      "A consistência é a chave para a aprovação.",
      "Você é capaz de alcançar seus objetivos!",
    ];
    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

    return {
      greeting: `${greeting}, ${userName}!`,
      motivationalMessage: randomMessage,
      cta: {
        state: ctaState,
        text: ctaText,
        icon: ctaIcon,
      },
      stats: {
        metasConcluidas: dailySummary?.metasConcluidas || 0,
        metasPlanejadas: dailySummary?.metasPlanejadas || 0,
        questoesResolvidas: dailySummary?.questoesResolvidas || 0,
        tempoEstudo: dailySummary?.tempoEstudo || 0,
      },
    };
  }),

  /**
   * 4. getQuickActions - Ações rápidas sugeridas
   * Retorna sugestões de ações baseadas no contexto do usuário
   */
  getQuickActions: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const userId = ctx.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [dailySummary] = await db
      .select()
      .from(dailySummaries)
      .where(
        and(
          eq(dailySummaries.userId, userId),
          eq(dailySummaries.date, today)
        )
      )
      .limit(1);

    const actions: Array<{
      id: string;
      title: string;
      description: string;
      icon: string;
      link: string;
      priority: number;
    }> = [];

    // Sugerir ações baseadas no contexto
    if (!dailySummary || dailySummary.metasConcluidas === 0) {
      actions.push({
        id: "iniciar_meta",
        title: "Iniciar Meta de Hoje",
        description: "Comece sua jornada de estudos",
        icon: "play",
        link: "/metas/cronograma",
        priority: 1,
      });
    }

    if (dailySummary && dailySummary.revisoesPendentes > 0) {
      actions.push({
        id: "fazer_revisao",
        title: "Fazer Revisão",
        description: `${dailySummary.revisoesPendentes} revisões pendentes`,
        icon: "refresh-cw",
        link: "/revisoes",
        priority: 2,
      });
    }

    if (!dailySummary || dailySummary.questoesResolvidas < 10) {
      actions.push({
        id: "resolver_questoes",
        title: "Resolver Questões",
        description: "Pratique com questões do seu concurso",
        icon: "brain",
        link: "/questoes",
        priority: 3,
      });
    }

    if (dailySummary && dailySummary.materiaisAcessados === 0) {
      actions.push({
        id: "acessar_materiais",
        title: "Acessar Materiais",
        description: "Continue seus estudos teóricos",
        icon: "book-open",
        link: "/materiais",
        priority: 4,
      });
    }

    // Ordenar por prioridade
    actions.sort((a, b) => a.priority - b.priority);

    return actions.slice(0, 3); // Retornar apenas as 3 mais importantes
  }),

  /**
   * 5. getCustomization - Configurações do usuário
   * Retorna as preferências de customização do dashboard
   */
  getCustomization: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const userId = ctx.user.id;

    const [customization] = await db
      .select()
      .from(dashboardCustomizations)
      .where(eq(dashboardCustomizations.userId, userId))
      .limit(1);

    if (!customization) {
      // Criar customização padrão se não existir
      const defaultCustomization = {
        id: `cust_${userId}_${Date.now()}`,
        userId,
        theme: "light" as const,
        compactMode: false,
        heroMessage: null,
        showMotivationalQuotes: true,
        notifyStreakRisk: true,
        notifyDailyGoals: true,
        notifyAchievements: true,
        showXpBar: true,
        showLeaderboard: true,
      };

      await db.insert(dashboardCustomizations).values(defaultCustomization);

      return defaultCustomization;
    }

    return customization;
  }),

  /**
   * 6. updateCustomization - Atualizar configurações do usuário
   * Permite o usuário customizar seu dashboard
   */
  updateCustomization: protectedProcedure
    .input(
      z.object({
        theme: z.enum(["light", "dark", "auto"]).optional(),
        compactMode: z.boolean().optional(),
        heroMessage: z.string().nullable().optional(),
        showMotivationalQuotes: z.boolean().optional(),
        notifyStreakRisk: z.boolean().optional(),
        notifyDailyGoals: z.boolean().optional(),
        notifyAchievements: z.boolean().optional(),
        showXpBar: z.boolean().optional(),
        showLeaderboard: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userId = ctx.user.id;

      // Verificar se já existe customização
      const [existing] = await db
        .select()
        .from(dashboardCustomizations)
        .where(eq(dashboardCustomizations.userId, userId))
        .limit(1);

      if (existing) {
        // Atualizar
        await db
          .update(dashboardCustomizations)
          .set(input)
          .where(eq(dashboardCustomizations.userId, userId));
      } else {
        // Criar
        await db.insert(dashboardCustomizations).values({
          id: `cust_${userId}_${Date.now()}`,
          userId,
          theme: input.theme || "light",
          compactMode: input.compactMode || false,
          heroMessage: input.heroMessage || null,
          showMotivationalQuotes: input.showMotivationalQuotes ?? true,
          notifyStreakRisk: input.notifyStreakRisk ?? true,
          notifyDailyGoals: input.notifyDailyGoals ?? true,
          notifyAchievements: input.notifyAchievements ?? true,
          showXpBar: input.showXpBar ?? true,
          showLeaderboard: input.showLeaderboard ?? true,
        });
      }

      return { success: true };
    }),

  /**
   * 7. getStats - Estatísticas gerais do aluno
   * Retorna métricas agregadas para a página de estatísticas
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const userId = ctx.user.id;

    // Total de questões respondidas
    const [questoesResult] = await db
      .select({
        total: count(),
        acertos: sql<number>`SUM(CASE WHEN ${questionAttempts.isCorrect} = 1 THEN 1 ELSE 0 END)`,
        erros: sql<number>`SUM(CASE WHEN ${questionAttempts.isCorrect} = 0 THEN 1 ELSE 0 END)`,
      })
      .from(questionAttempts)
      .where(eq(questionAttempts.userId, userId));

    const totalQuestoes = questoesResult?.total || 0;
    const acertos = Number(questoesResult?.acertos) || 0;
    const erros = Number(questoesResult?.erros) || 0;
    const taxaAcerto = totalQuestoes > 0 ? Math.round((acertos / totalQuestoes) * 100) : 0;

    // Metas cumpridas
    const [metasResult] = await db
      .select({
        cumpridas: sql<number>`SUM(CASE WHEN ${metas.status} = 'CONCLUIDA' THEN 1 ELSE 0 END)`,
        total: count(),
      })
      .from(metas)
      .where(eq(metas.userId, userId));

    const metasCumpridas = Number(metasResult?.cumpridas) || 0;
    const metasTotal = metasResult?.total || 0;

    // Tempo de estudo (soma de tempoEstudo dos dailySummaries)
    const [tempoResult] = await db
      .select({
        total: sql<number>`SUM(${dailySummaries.tempoEstudo})`,
      })
      .from(dailySummaries)
      .where(eq(dailySummaries.userId, userId));

    const tempoEstudo = Math.round((Number(tempoResult?.total) || 0) / 60); // converter minutos para horas

    return {
      totalQuestoes,
      taxaAcerto,
      metasCumpridas,
      metasTotal,
      tempoEstudo,
    };
  }),

  /**
   * 8. getProgressoSemanal - Progresso dos últimos 7 dias
   * Retorna métricas semanais para barras de progresso
   */
  getProgressoSemanal: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const userId = ctx.user.id;
    const hoje = new Date();
    const seteDiasAtras = new Date(hoje);
    seteDiasAtras.setDate(hoje.getDate() - 7);
    seteDiasAtras.setHours(0, 0, 0, 0);

    // Metas cumpridas nos últimos 7 dias
    const [metasResult] = await db
      .select({
        cumpridas: sql<number>`SUM(CASE WHEN ${metas.status} = 'CONCLUIDA' THEN 1 ELSE 0 END)`,
        total: count(),
      })
      .from(metas)
      .where(
        and(
          eq(metas.userId, userId),
          gte(metas.dataInicio, seteDiasAtras)
        )
      );

    const metas = Number(metasResult?.cumpridas) || 0;
    const metasTotal = metasResult?.total || 0;

    // Questões respondidas nos últimos 7 dias
    const [questoesResult] = await db
      .select({
        total: count(),
      })
      .from(questionAttempts)
      .where(
        and(
          eq(questionAttempts.userId, userId),
          gte(questionAttempts.attemptedAt, seteDiasAtras)
        )
      );

    const questoes = questoesResult?.total || 0;
    const questoesTotal = 140; // Meta semanal padrão

    return {
      metas,
      metasTotal,
      questoes,
      questoesTotal,
    };
  }),

  /**
   * 9. getEvolucao30Dias - Evolução dos últimos 30 dias
   * Retorna dados diários para gráficos de linha (acertos vs erros)
   */
  getEvolucao30Dias: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const userId = ctx.user.id;
    const hoje = new Date();
    const trintaDiasAtras = new Date(hoje);
    trintaDiasAtras.setDate(hoje.getDate() - 30);
    trintaDiasAtras.setHours(0, 0, 0, 0);

    // Buscar resumos diários dos últimos 30 dias
    const summaries = await db
      .select({
        date: dailySummaries.date,
        questoesCorretas: dailySummaries.questoesCorretas,
        questoesErradas: dailySummaries.questoesErradas,
        metasConcluidas: dailySummaries.metasConcluidas,
        tempoEstudo: dailySummaries.tempoEstudo,
      })
      .from(dailySummaries)
      .where(
        and(
          eq(dailySummaries.userId, userId),
          gte(dailySummaries.date, trintaDiasAtras)
        )
      )
      .orderBy(dailySummaries.date);

    // Preencher dias faltantes com zeros
    const evolucao = [];
    for (let i = 29; i >= 0; i--) {
      const data = new Date(hoje);
      data.setDate(hoje.getDate() - i);
      data.setHours(0, 0, 0, 0);

      const summary = summaries.find(
        (s) => s.date.getTime() === data.getTime()
      );

      evolucao.push({
        data: data.toISOString().split('T')[0], // YYYY-MM-DD
        acertos: summary?.questoesCorretas || 0,
        erros: summary?.questoesErradas || 0,
        metas: summary?.metasConcluidas || 0,
        tempo: summary?.tempoEstudo || 0,
      });
    }

    return evolucao;
  }),

  /**
   * 10. getDesempenhoPorDificuldade - Desempenho por nível de dificuldade
   * Retorna estatísticas de questões agrupadas por dificuldade
   */
  getDesempenhoPorDificuldade: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const userId = ctx.user.id;

    // Buscar questões com dificuldade
    const result = await db.execute(sql`
      SELECT 
        q.difficulty,
        COUNT(*) as total,
        SUM(CASE WHEN qa.is_correct = 1 THEN 1 ELSE 0 END) as acertos,
        SUM(CASE WHEN qa.is_correct = 0 THEN 1 ELSE 0 END) as erros
      FROM question_attempts qa
      INNER JOIN questions q ON qa.question_id = q.id
      WHERE qa.user_id = ${userId}
      GROUP BY q.difficulty
    `);

    const dificuldades = [
      { nivel: 'facil', label: 'Fácil', total: 0, acertos: 0, erros: 0 },
      { nivel: 'media', label: 'Média', total: 0, acertos: 0, erros: 0 },
      { nivel: 'dificil', label: 'Difícil', total: 0, acertos: 0, erros: 0 },
    ];

    // Processar resultados
    const rows = result as any[];
    rows.forEach((row: any) => {
      const dif = dificuldades.find((d) => d.nivel === row.difficulty);
      if (dif) {
        dif.total = Number(row.total) || 0;
        dif.acertos = Number(row.acertos) || 0;
        dif.erros = Number(row.erros) || 0;
      }
    });

    return dificuldades;
  }),
});
