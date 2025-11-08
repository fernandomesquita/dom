import { z } from "zod";
import { router, protectedProcedure } from "../../_core/trpc";
import { getDb } from "../../db";
import { widgetConfigs } from "../../../drizzle/schema-dashboard";
import { metas, questoesResolvidas, cronograma, estatisticasDiarias, materiais, materiaisEstudados, planos, assinaturas, forumTopicos } from "../../../drizzle/schema";
import { streakLogs, streakProtections } from "../../../drizzle/schema-dashboard";
import { eq, and, gte, lte, desc, sql, count } from "drizzle-orm";

/**
 * E10: Dashboard do Aluno - Widgets Router
 * 
 * 8 procedures:
 * 1. getCronograma - Widget Cronograma
 * 2. getQTD - Widget QTD (Questões do Dia)
 * 3. getStreak - Widget Streak
 * 4. getProgressoSemanal - Widget Progresso Semanal
 * 5. getMateriaisAndamento - Widget Materiais em Andamento
 * 6. getRevisoesPendentes - Widget Revisões Pendentes
 * 7. reorderWidgets - Reordenar widgets
 * 8. updateWidgetConfig - Atualizar configuração de widget
 */

export const widgetsRouter = router({
  /**
   * 1. getCronograma - Widget Cronograma
   * Retorna a meta de hoje e próximas metas
   */
  getCronograma: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const hojeString = hoje.toISOString().split('T')[0];

    // Buscar meta de hoje
    const metasHoje = await db
      .select()
      .from(metas)
      .where(
        and(
          eq(metas.userId, ctx.user.id),
          eq(metas.prazo, hojeString),
          eq(metas.concluida, false)
        )
      )
      .limit(1);

    // Buscar próxima meta (após hoje)
    const proximasMetas = await db
      .select()
      .from(metas)
      .where(
        and(
          eq(metas.userId, ctx.user.id),
          gte(metas.prazo, hojeString),
          eq(metas.concluida, false)
        )
      )
      .orderBy(metas.prazo)
      .limit(5);

    // Contar total e concluídas
    const [stats] = await db
      .select({
        total: sql<number>`COUNT(*)`,
        concluidas: sql<number>`SUM(CASE WHEN ${metas.concluida} = true THEN 1 ELSE 0 END)`,
      })
      .from(metas)
      .where(eq(metas.userId, ctx.user.id));

    return {
      metaHoje: metasHoje[0] || null,
      proximasMetas: proximasMetas.slice(1), // Excluir a primeira (meta de hoje)
      totalMetas: stats?.total || 0,
      metasConcluidas: stats?.concluidas || 0,
    };
  }),

  /**
   * 2. getQTD - Widget QTD (Questões do Dia)
   * Retorna estatísticas de questões do dia
   */
  getQTD: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const hojeString = hoje.toISOString().split('T')[0];

    // Buscar questões resolvidas hoje
    const [statsHoje] = await db
      .select({
        total: sql<number>`COUNT(*)`,
        corretas: sql<number>`SUM(CASE WHEN ${questoesResolvidas.correta} = true THEN 1 ELSE 0 END)`,
      })
      .from(questoesResolvidas)
      .where(
        and(
          eq(questoesResolvidas.userId, ctx.user.id),
          gte(questoesResolvidas.dataResolucao, hoje)
        )
      );

    const questoesHoje = statsHoje?.total || 0;
    const corretasHoje = statsHoje?.corretas || 0;
    const taxaAcerto = questoesHoje > 0 ? Math.round((corretasHoje / questoesHoje) * 100) : 0;

    // Buscar últimos 7 dias do cronograma diário
    const seteDiasAtras = new Date(hoje);
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 6);
    const seteDiasAtrasString = seteDiasAtras.toISOString().split('T')[0];

    const ultimos7DiasData = await db
      .select()
      .from(cronograma)
      .where(
        and(
          eq(cronograma.userId, ctx.user.id),
          gte(cronograma.data, seteDiasAtrasString)
        )
      )
      .orderBy(cronograma.data);

    // Mapear para formato do gráfico
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const ultimos7Dias = [];
    for (let i = 6; i >= 0; i--) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - i);
      const dataString = data.toISOString().split('T')[0];
      const registro = ultimos7DiasData.find(r => r.data === dataString);
      ultimos7Dias.push({
        dia: diasSemana[data.getDay()],
        questoes: registro?.questoesResolvidas || 0,
      });
    }

    return {
      questoesResolvidas: questoesHoje,
      metaDiaria: 20, // TODO: Buscar da configuração do usuário
      taxaAcerto,
      ultimos7Dias,
    };
  }),

  /**
   * 3. getStreak - Widget Streak
   * Retorna dados do streak atual
   */
  getStreak: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const seteDiasAtras = new Date(hoje);
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 6);

    // Buscar últimos 7 dias de streak
    const ultimos7DiasData = await db
      .select()
      .from(streakLogs)
      .where(
        and(
          eq(streakLogs.userId, ctx.user.id),
          gte(streakLogs.date, seteDiasAtras)
        )
      )
      .orderBy(streakLogs.date);

    // Calcular dias consecutivos
    let diasConsecutivos = 0;
    const dataAtual = new Date(hoje);
    while (true) {
      const dataString = dataAtual.toISOString().split('T')[0];
      const registro = ultimos7DiasData.find(r => {
        const rDate = new Date(r.date);
        return rDate.toISOString().split('T')[0] === dataString;
      });
      if (registro && registro.streakAtivo) {
        diasConsecutivos++;
        dataAtual.setDate(dataAtual.getDate() - 1);
      } else {
        break;
      }
    }

    // Verificar se está em risco (não estudou hoje)
    const hojeString = hoje.toISOString().split('T')[0];
    const estudouHoje = ultimos7DiasData.some(r => {
      const rDate = new Date(r.date);
      return rDate.toISOString().split('T')[0] === hojeString && r.streakAtivo;
    });
    const emRisco = !estudouHoje && diasConsecutivos > 0;

    // Contar proteções disponíveis
    const [protecoesCount] = await db
      .select({ count: count() })
      .from(streakProtections)
      .where(
        and(
          eq(streakProtections.userId, ctx.user.id),
          sql`${streakProtections.quantidade} > ${streakProtections.quantidadeUsada}`
        )
      );

    // Mapear últimos 7 dias
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const ultimos7Dias = [];
    for (let i = 6; i >= 0; i--) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - i);
      const dataString = data.toISOString().split('T')[0];
      const registro = ultimos7DiasData.find(r => {
        const rDate = new Date(r.date);
        return rDate.toISOString().split('T')[0] === dataString;
      });
      ultimos7Dias.push({
        dia: diasSemana[data.getDay()],
        ativo: registro?.streakAtivo || false,
      });
    }

    return {
      diasConsecutivos,
      emRisco,
      protecoesDisponiveis: protecoesCount?.count || 0,
      ultimos7Dias,
      ranking: [], // TODO: Implementar ranking global
    };
  }),

  /**
   * 4. getProgressoSemanal - Widget Progresso Semanal
   * Retorna progresso da semana atual
   */
  getProgressoSemanal: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    // Semana atual (últimos 7 dias)
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - 6);
    const inicioSemanaString = inicioSemana.toISOString().split('T')[0];
    const hojeString = hoje.toISOString().split('T')[0];

    // Semana anterior (7-13 dias atrás)
    const inicioSemanaAnterior = new Date(hoje);
    inicioSemanaAnterior.setDate(hoje.getDate() - 13);
    const fimSemanaAnterior = new Date(hoje);
    fimSemanaAnterior.setDate(hoje.getDate() - 7);
    const inicioSemanaAnteriorString = inicioSemanaAnterior.toISOString().split('T')[0];
    const fimSemanaAnteriorString = fimSemanaAnterior.toISOString().split('T')[0];

    // Estatísticas da semana atual
    const [statsSemanaAtual] = await db
      .select({
        questoesResolvidas: sql<number>`SUM(${estatisticasDiarias.questoesResolvidas})`,
        tempoEstudo: sql<number>`SUM(${estatisticasDiarias.tempoEstudo})`,
      })
      .from(estatisticasDiarias)
      .where(
        and(
          eq(estatisticasDiarias.userId, ctx.user.id),
          gte(estatisticasDiarias.data, inicioSemanaString),
          lte(estatisticasDiarias.data, hojeString)
        )
      );

    // Estatísticas da semana anterior
    const [statsSemanaAnterior] = await db
      .select({
        questoesResolvidas: sql<number>`SUM(${estatisticasDiarias.questoesResolvidas})`,
        tempoEstudo: sql<number>`SUM(${estatisticasDiarias.tempoEstudo})`,
      })
      .from(estatisticasDiarias)
      .where(
        and(
          eq(estatisticasDiarias.userId, ctx.user.id),
          gte(estatisticasDiarias.data, inicioSemanaAnteriorString),
          lte(estatisticasDiarias.data, fimSemanaAnteriorString)
        )
      );

    // Metas da semana
    const [metasStats] = await db
      .select({
        total: sql<number>`COUNT(*)`,
        concluidas: sql<number>`SUM(CASE WHEN ${metas.concluida} = true THEN 1 ELSE 0 END)`,
      })
      .from(metas)
      .where(
        and(
          eq(metas.userId, ctx.user.id),
          gte(metas.prazo, inicioSemanaString),
          lte(metas.prazo, hojeString)
        )
      );

    // Tempo planejado vs realizado
    const [tempoStats] = await db
      .select({
        planejado: sql<number>`SUM(${cronograma.tempoPlanejado})`,
        realizado: sql<number>`SUM(${cronograma.tempoRealizado})`,
      })
      .from(cronograma)
      .where(
        and(
          eq(cronograma.userId, ctx.user.id),
          gte(cronograma.data, inicioSemanaString),
          lte(cronograma.data, hojeString)
        )
      );

    const metasTotal = metasStats?.total || 0;
    const metasConcluidas = metasStats?.concluidas || 0;
    const questoesAtual = statsSemanaAtual?.questoesResolvidas || 0;
    const questoesAnterior = statsSemanaAnterior?.questoesResolvidas || 0;
    const tempoAtual = statsSemanaAtual?.tempoEstudo || 0;
    const tempoAnterior = statsSemanaAnterior?.tempoEstudo || 0;
    const tempoPlanejado = tempoStats?.planejado || 0;
    const tempoRealizado = tempoStats?.realizado || 0;

    return {
      metas: {
        concluidas: metasConcluidas,
        total: metasTotal,
        percentual: metasTotal > 0 ? Math.round((metasConcluidas / metasTotal) * 100) : 0,
      },
      questoes: {
        resolvidas: questoesAtual,
        total: 140, // Meta semanal: 20 questões/dia * 7 dias
        percentual: Math.round((questoesAtual / 140) * 100),
      },
      tempo: {
        estudado: tempoRealizado || tempoAtual,
        planejado: tempoPlanejado || 420, // 1h/dia * 7 dias = 420min
        percentual: tempoPlanejado > 0 ? Math.round(((tempoRealizado || tempoAtual) / tempoPlanejado) * 100) : 0,
      },
      comparacaoSemanaAnterior: {
        metas: metasConcluidas - (metasConcluidas > 0 ? Math.floor(metasConcluidas * 0.8) : 0), // Simulado
        questoes: questoesAnterior > 0 ? questoesAtual - questoesAnterior : 0,
        tempo: tempoAnterior > 0 ? tempoAtual - tempoAnterior : 0,
      },
      mediaPlatforma: {
        metas: 5, // TODO: Calcular média real da plataforma
        questoes: 100,
        tempo: 300,
      },
    };
  }),

  /**
   * 5. getMateriaisAndamento - Widget Materiais em Andamento
   * Retorna materiais que o usuário está lendo
   */
  getMateriaisAndamento: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Buscar materiais em andamento (progresso < 100%)
    const materiaisData = await db
      .select({
        id: materiais.id,
        titulo: materiais.titulo,
        tipo: materiais.tipo,
        progresso: materiaisEstudados.progresso,
        ultimaVisualizacao: materiaisEstudados.ultimaVisualizacao,
      })
      .from(materiaisEstudados)
      .innerJoin(materiais, eq(materiaisEstudados.materialId, materiais.id))
      .where(
        and(
          eq(materiaisEstudados.userId, ctx.user.id),
          sql`${materiaisEstudados.progresso} < 100`
        )
      )
      .orderBy(desc(materiaisEstudados.ultimaVisualizacao))
      .limit(5);

    return {
      materiais: materiaisData,
      total: materiaisData.length,
    };
  }),

  /**
   * 6. getRevisoesPendentes - Widget Revisões Pendentes
   * Retorna revisões programadas
   */
  getRevisoesPendentes: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Buscar materiais para revisão (concluídos há mais de 7 dias)
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

    const revisoesData = await db
      .select({
        id: materiais.id,
        titulo: materiais.titulo,
        tipo: materiais.tipo,
        ultimaVisualizacao: materiaisEstudados.ultimaVisualizacao,
      })
      .from(materiaisEstudados)
      .innerJoin(materiais, eq(materiaisEstudados.materialId, materiais.id))
      .where(
        and(
          eq(materiaisEstudados.userId, ctx.user.id),
          eq(materiaisEstudados.progresso, 100),
          lte(materiaisEstudados.ultimaVisualizacao, seteDiasAtras)
        )
      )
      .orderBy(materiaisEstudados.ultimaVisualizacao)
      .limit(5);

    return {
      revisoes: revisoesData,
      total: revisoesData.length,
    };
  }),

  /**
   * 7. getPlanoAtual - Widget Plano
   * Retorna informações do plano atual do usuário
   */
  getPlanoAtual: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Buscar assinatura ativa do usuário
    const assinaturaAtiva = await db
      .select({
        id: assinaturas.id,
        status: assinaturas.status,
        dataInicio: assinaturas.dataInicio,
        dataFim: assinaturas.dataFim,
        renovacaoAutomatica: assinaturas.renovacaoAutomatica,
        planoNome: planos.nome,
        planoDescricao: planos.descricao,
        planoPreco: planos.preco,
        planoDuracao: planos.duracaoMeses,
        planoFeatured: planos.featured,
      })
      .from(assinaturas)
      .innerJoin(planos, eq(assinaturas.planoId, planos.id))
      .where(
        and(
          eq(assinaturas.userId, ctx.user.id),
          eq(assinaturas.status, 'ATIVA')
        )
      )
      .limit(1);

    if (assinaturaAtiva.length === 0) {
      return {
        temPlano: false,
        plano: null,
      };
    }

    const assinatura = assinaturaAtiva[0];
    const hoje = new Date();
    const dataFim = new Date(assinatura.dataFim);
    const diasRestantes = Math.ceil((dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

    return {
      temPlano: true,
      plano: {
        nome: assinatura.planoNome,
        descricao: assinatura.planoDescricao,
        preco: assinatura.planoPreco,
        duracao: assinatura.planoDuracao,
        featured: assinatura.planoFeatured,
        dataInicio: assinatura.dataInicio,
        dataFim: assinatura.dataFim,
        diasRestantes,
        renovacaoAutomatica: assinatura.renovacaoAutomatica,
      },
    };
  }),

  /**
   * 8. getUltimasDiscussoes - Widget Comunidade
   * Retorna últimas discussões do fórum
   */
  getUltimasDiscussoes: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Buscar últimas 5 discussões do fórum
    const discussoes = await db
      .select()
      .from(forumTopicos)
      .where(eq(forumTopicos.ativo, true))
      .orderBy(desc(forumTopicos.updatedAt))
      .limit(5);

    return {
      discussoes,
      total: discussoes.length,
    };
  }),

  /**
   * 7. reorderWidgets - Reordenar widgets
   * Permite o usuário reordenar os widgets do dashboard
   */
  reorderWidgets: protectedProcedure
    .input(
      z.object({
        widgets: z.array(
          z.object({
            widgetType: z.enum([
              "cronograma",
              "qtd",
              "streak",
              "progresso_semanal",
              "materiais",
              "revisoes",
              "plano",
              "comunidade",
            ]),
            position: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userId = ctx.user.id;

      // Atualizar posição de cada widget
      for (const widget of input.widgets) {
        await db
          .update(widgetConfigs)
          .set({ position: widget.position })
          .where(
            and(
              eq(widgetConfigs.userId, userId),
              eq(widgetConfigs.widgetType, widget.widgetType)
            )
          );
      }

      return { success: true };
    }),

  /**
   * 8. updateWidgetConfig - Atualizar configuração de widget
   * Permite customizar título, visibilidade e outras configs do widget
   */
  updateWidgetConfig: protectedProcedure
    .input(
      z.object({
        widgetType: z.enum([
          "cronograma",
          "qtd",
          "streak",
          "progresso_semanal",
          "materiais",
          "revisoes",
          "plano",
          "comunidade",
        ]),
        title: z.string().optional(),
        isVisible: z.boolean().optional(),
        isExpanded: z.boolean().optional(),
        config: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userId = ctx.user.id;
      const { widgetType, ...updates } = input;

      // Verificar se já existe configuração
      const [existing] = await db
        .select()
        .from(widgetConfigs)
        .where(
          and(
            eq(widgetConfigs.userId, userId),
            eq(widgetConfigs.widgetType, widgetType)
          )
        )
        .limit(1);

      if (existing) {
        // Atualizar
        await db
          .update(widgetConfigs)
          .set(updates)
          .where(
            and(
              eq(widgetConfigs.userId, userId),
              eq(widgetConfigs.widgetType, widgetType)
            )
          );
      } else {
        // Criar
        await db.insert(widgetConfigs).values({
          id: `wc_${userId}_${widgetType}_${Date.now()}`,
          userId,
          widgetType,
          position: 0,
          ...updates,
        });
      }

      return { success: true };
    }),

  /**
   * 9. getWidgetConfigs - Obter configurações de todos os widgets
   * Retorna as configurações de todos os widgets do usuário
   */
  getWidgetConfigs: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const userId = ctx.user.id;

    const configs = await db
      .select()
      .from(widgetConfigs)
      .where(eq(widgetConfigs.userId, userId))
      .orderBy(widgetConfigs.position);

    // Se não houver configs, criar padrões
    if (configs.length === 0) {
      const defaultWidgets = [
        { widgetType: "cronograma" as const, position: 0 },
        { widgetType: "qtd" as const, position: 1 },
        { widgetType: "streak" as const, position: 2 },
        { widgetType: "progresso_semanal" as const, position: 3 },
        { widgetType: "materiais" as const, position: 4 },
        { widgetType: "revisoes" as const, position: 5 },
        { widgetType: "plano" as const, position: 6 },
        { widgetType: "comunidade" as const, position: 7 },
      ];

      for (const widget of defaultWidgets) {
        await db.insert(widgetConfigs).values({
          id: `wc_${userId}_${widget.widgetType}_${Date.now()}`,
          userId,
          widgetType: widget.widgetType,
          position: widget.position,
          isVisible: true,
          isExpanded: true,
        });
      }

      // Buscar novamente
      return await db
        .select()
        .from(widgetConfigs)
        .where(eq(widgetConfigs.userId, userId))
        .orderBy(widgetConfigs.position);
    }

    return configs;
  }),
});
