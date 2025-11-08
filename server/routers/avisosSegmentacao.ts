import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { avisosSegmentacao } from "../../drizzle/schema-avisos";
import { users } from "../../drizzle/schema";
import { eq, and, sql, gte, lte } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

/**
 * Router de Segmentação de Avisos (Admin)
 * Procedures para calcular alcance e gerenciar segmentação
 */

export const avisosSegmentacaoRouter = router({
  /**
   * CALCULAR ALCANCE
   * Calcular quantos alunos serão impactados pela segmentação
   */
  calcularAlcance: protectedProcedure
    .input(
      z.object({
        tipoSegmentacao: z.enum(["todos", "plano", "engajamento", "progresso", "desempenho", "individual", "custom"]),
        criterios: z.object({
          // Plano
          planos: z.array(z.string()).optional(),
          incluirGratuito: z.boolean().optional(),
          // Engajamento
          tipo: z.enum(["ativos", "inativos", "novos"]).optional(),
          dias: z.number().int().min(1).optional(),
          // Progresso
          minPercentual: z.number().min(0).max(100).optional(),
          maxPercentual: z.number().min(0).max(100).optional(),
          // Desempenho
          mediaMinima: z.number().min(0).max(100).optional(),
          questoesMinimas: z.number().int().min(1).optional(),
          // Individual
          alunoIds: z.array(z.string()).optional(),
          // Custom
          query: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let totalAlunos = 0;
      let alunosIds: string[] = [];

      switch (input.tipoSegmentacao) {
        case "todos":
          // Todos os usuários
          const todosAlunos = await db.select({ id: users.id }).from(users);
          totalAlunos = todosAlunos.length;
          alunosIds = todosAlunos.map(u => u.id);
          break;

        case "plano":
          // Filtrar por plano (campo não existe ainda, placeholder)
          // TODO: Implementar quando tivermos tabela de planos
          totalAlunos = 0;
          alunosIds = [];
          break;

        case "engajamento":
          // Filtrar por engajamento (ativos, inativos, novos)
          if (input.criterios.tipo === "ativos" && input.criterios.dias) {
            const dataLimite = new Date();
            dataLimite.setDate(dataLimite.getDate() - input.criterios.dias);
            
            // Usuários que fizeram login nos últimos X dias
            const alunosAtivos = await db
              .select({ id: users.id })
              .from(users)
              .where(gte(users.lastSignedIn, dataLimite));
            
            totalAlunos = alunosAtivos.length;
            alunosIds = alunosAtivos.map(u => u.id);
          } else if (input.criterios.tipo === "novos" && input.criterios.dias) {
            const dataLimite = new Date();
            dataLimite.setDate(dataLimite.getDate() - input.criterios.dias);
            
            // Usuários criados nos últimos X dias
            const alunosNovos = await db
              .select({ id: users.id })
              .from(users)
              .where(gte(users.createdAt, dataLimite));
            
            totalAlunos = alunosNovos.length;
            alunosIds = alunosNovos.map(u => u.id);
          }
          break;

        case "progresso":
          // Filtrar por progresso (% de conclusão de questões/materiais)
          // TODO: Implementar quando tivermos métricas de progresso
          totalAlunos = 0;
          alunosIds = [];
          break;

        case "desempenho":
          // Filtrar por desempenho (média de acertos, questões resolvidas)
          // TODO: Implementar quando tivermos estatísticas de desempenho
          totalAlunos = 0;
          alunosIds = [];
          break;

        case "individual":
          // Lista específica de IDs
          if (input.criterios.alunoIds && input.criterios.alunoIds.length > 0) {
            totalAlunos = input.criterios.alunoIds.length;
            alunosIds = input.criterios.alunoIds;
          }
          break;

        case "custom":
          // Query customizada (placeholder)
          // TODO: Implementar query builder seguro
          totalAlunos = 0;
          alunosIds = [];
          break;
      }

      return {
        totalAlunos,
        alunosIds: alunosIds.slice(0, 100), // Retornar apenas primeiros 100 IDs para preview
      };
    }),

  /**
   * PREVIEW SEGMENTAÇÃO
   * Buscar dados detalhados dos alunos elegíveis (para preview)
   */
  previewSegmentacao: protectedProcedure
    .input(
      z.object({
        tipoSegmentacao: z.enum(["todos", "plano", "engajamento", "progresso", "desempenho", "individual", "custom"]),
        criterios: z.object({
          planos: z.array(z.string()).optional(),
          incluirGratuito: z.boolean().optional(),
          tipo: z.enum(["ativos", "inativos", "novos"]).optional(),
          dias: z.number().int().min(1).optional(),
          minPercentual: z.number().min(0).max(100).optional(),
          maxPercentual: z.number().min(0).max(100).optional(),
          mediaMinima: z.number().min(0).max(100).optional(),
          questoesMinimas: z.number().int().min(1).optional(),
          alunoIds: z.array(z.string()).optional(),
          query: z.string().optional(),
        }),
        limit: z.number().int().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Reutilizar lógica de calcularAlcance
      const { alunosIds } = await ctx.caller.avisosSegmentacao.calcularAlcance({
        tipoSegmentacao: input.tipoSegmentacao,
        criterios: input.criterios,
      });

      if (alunosIds.length === 0) {
        return { alunos: [], total: 0 };
      }

      // Buscar dados dos alunos
      const alunos = await db
        .select({
          id: users.id,
          nome: users.nomeCompleto,
          email: users.email,
          criadoEm: users.createdAt,
          ultimoAcesso: users.lastSignedIn,
        })
        .from(users)
        .where(sql`${users.id} IN (${sql.join(alunosIds.slice(0, input.limit).map(id => sql`${id}`), sql`, `)})`)
        .limit(input.limit);

      return {
        alunos,
        total: alunosIds.length,
      };
    }),

  /**
   * SALVAR SEGMENTAÇÃO
   * Salvar critérios de segmentação para um aviso
   */
  salvarSegmentacao: protectedProcedure
    .input(
      z.object({
        avisoId: z.string().uuid(),
        tipoSegmentacao: z.enum(["todos", "plano", "engajamento", "progresso", "desempenho", "individual", "custom"]),
        criterios: z.object({
          planos: z.array(z.string()).optional(),
          incluirGratuito: z.boolean().optional(),
          tipo: z.enum(["ativos", "inativos", "novos"]).optional(),
          dias: z.number().int().min(1).optional(),
          minPercentual: z.number().min(0).max(100).optional(),
          maxPercentual: z.number().min(0).max(100).optional(),
          mediaMinima: z.number().min(0).max(100).optional(),
          questoesMinimas: z.number().int().min(1).optional(),
          alunoIds: z.array(z.string()).optional(),
          query: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Calcular alcance
      const { totalAlunos, alunosIds } = await ctx.caller.avisosSegmentacao.calcularAlcance({
        tipoSegmentacao: input.tipoSegmentacao,
        criterios: input.criterios,
      });

      const segmentacaoId = uuidv4();
      const agora = new Date();

      // Inserir ou atualizar segmentação
      await db
        .insert(avisosSegmentacao)
        .values({
          id: segmentacaoId,
          avisoId: input.avisoId,
          tipoSegmentacao: input.tipoSegmentacao,
          criterios: input.criterios as any,
          alunosElegiveisCacheIds: alunosIds as any,
          totalAlunosImpactados: totalAlunos,
          cacheGeradoEm: agora,
        })
        .onDuplicateKeyUpdate({
          set: {
            tipoSegmentacao: input.tipoSegmentacao,
            criterios: input.criterios as any,
            alunosElegiveisCacheIds: alunosIds as any,
            totalAlunosImpactados: totalAlunos,
            cacheGeradoEm: agora,
          },
        });

      return {
        id: segmentacaoId,
        totalAlunos,
      };
    }),
});
