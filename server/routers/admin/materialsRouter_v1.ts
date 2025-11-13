import { router, protectedProcedure, adminProcedure } from "../../_core/trpc";
import { z } from "zod";
import { getDb } from "../../db";
import { 
  materials, 
  materialItems,
  materialUpvotes,  // ❗ NÃO é "materialVotes"!
  materialRatings,
  materialFavorites,
  materialViews,
  materialDownloads,
  materialSeenMarks,
  users,
} from "../../../drizzle/schema";
import { eq, and, desc, sql, or, like } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, publicProcedure, adminProcedure } from "../../_core/trpc";
import path from "path";

/**
 * Materials Router V1 - Sistema completo de materiais com engagement
 * Baseado no SCHEMA REAL do projeto
 */

export const materialsRouter_v1 = router({
  
  // ==========================================
  // ADMIN - CRUD
  // ==========================================
  
  list: protectedProcedure
    .input(z.object({
      category: z.enum(["base", "revisao", "promo"]).optional(),
      type: z.enum(["video", "pdf", "audio"]).optional(), // ❗ SEM "link"!
      isPaid: z.boolean().optional(),
      isFeatured: z.boolean().optional(),
      isAvailable: z.boolean().optional(), // ❗ Use "isAvailable", não "active"!
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Construir filtros
      const conditions = [];
      
      if (input.category) {
        conditions.push(eq(materials.category, input.category));
      }
      
      if (input.type) {
        conditions.push(eq(materials.type, input.type));
      }
      
      if (input.isPaid !== undefined) {
        conditions.push(eq(materials.isPaid, input.isPaid));
      }
      
      if (input.isFeatured !== undefined) {
        conditions.push(eq(materials.isFeatured, input.isFeatured));
      }
      
      if (input.isAvailable !== undefined) {
        conditions.push(eq(materials.isAvailable, input.isAvailable));
      }

      // Filtro de busca por título ou descrição
      if (input.search) {
        conditions.push(
          or(
            like(materials.title, `%${input.search}%`),
            like(materials.description, `%${input.search}%`)
          )
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Query
      const items = await db
        .select()
        .from(materials)
        .where(whereClause)
        .orderBy(desc(materials.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(materials)
        .where(whereClause);
      
      return {
        items,
        total: Number(count),
        hasMore: input.offset + input.limit < Number(count),
      };
    }),
  
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [material] = await db
        .select()
        .from(materials)
        .where(eq(materials.id, input.id))
        .limit(1);
      
      if (!material) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Material não encontrado" });
      }
      
      // Buscar items do material
      const items = await db
        .select()
        .from(materialItems)
        .where(eq(materialItems.materialId, input.id))
        .orderBy(materialItems.order);
      
      // Buscar links do material (disciplina/assunto/tópico)
      const links = await db
        .select()
        .from(materialLinks)
        .where(eq(materialLinks.materialId, input.id));
      
      // Buscar estado do usuário
      const [upvote] = await db.select()
        .from(materialUpvotes)  // ❗ NÃO é "materialVotes"!
        .where(and(
          eq(materialUpvotes.materialId, input.id),
          eq(materialUpvotes.userId, ctx.user.id)
        ))
        .limit(1);
      
      const [rating] = await db.select()
        .from(materialRatings)
        .where(and(
          eq(materialRatings.materialId, input.id),
          eq(materialRatings.userId, ctx.user.id)
        ))
        .limit(1);
      
      const [favorite] = await db.select()
        .from(materialFavorites)
        .where(and(
          eq(materialFavorites.materialId, input.id),
          eq(materialFavorites.userId, ctx.user.id)
        ))
        .limit(1);
      
      return {
        ...material,
        items,
        links,
        userState: {
          hasUpvoted: !!upvote,
          userRating: rating?.rating || null,
          isFavorite: !!favorite,
        },
      };
    }),
  
  create: adminProcedure
    .input(z.object({
      title: z.string().min(3).max(255),
      description: z.string().optional(),
      thumbnailUrl: z.string().url(),
      category: z.enum(["base", "revisao", "promo"]),
      type: z.enum(["video", "pdf", "audio"]), // ❗ SEM "link"!
      isPaid: z.boolean(),
      isAvailable: z.boolean().default(true),
      isFeatured: z.boolean().default(false),
      commentsEnabled: z.boolean().default(true),
      items: z.array(z.object({
        title: z.string(),
        type: z.enum(["video", "pdf", "audio"]),
        url: z.string().optional(),
        filePath: z.string().optional(),
        duration: z.number().optional(),
        fileSize: z.number().optional(),
        order: z.number(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // 1. Criar material
      const [result] = await db.insert(materials).values({
        title: input.title,
        description: input.description,
        thumbnailUrl: input.thumbnailUrl,
        category: input.category,
        type: input.type,
        isPaid: input.isPaid,
        isAvailable: input.isAvailable,
        isFeatured: input.isFeatured,
        commentsEnabled: input.commentsEnabled,
        createdBy: ctx.user.id,
      });
      
      const materialId = result.insertId;
      
      // 2. Criar items
      if (input.items && input.items.length > 0) {
        await db.insert(materialItems).values(
          input.items.map(item => ({
            ...item,
            materialId: Number(materialId),
          }))
        );
      }
      
      return { id: Number(materialId) };
    }),
  
  update: adminProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(3).max(255).optional(),
      description: z.string().optional(),
      thumbnailUrl: z.string().url().optional(),
      category: z.enum(["base", "revisao", "promo"]).optional(),
      type: z.enum(["video", "pdf", "audio"]).optional(), // ❗ SEM "link"!
      isPaid: z.boolean().optional(),
      isAvailable: z.boolean().optional(),
      isFeatured: z.boolean().optional(),
      commentsEnabled: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      // 🔍 DEBUG: Ver input recebido
      console.log('🔍 [Backend Update] Input completo:', JSON.stringify(input, null, 2));
      console.log('🔍 [Backend Update] Type recebido:', input.type);
      console.log('🔍 [Backend Update] Type typeof:', typeof input.type);
      console.log('🔍 [Backend Update] Valores esperados: "video" | "pdf" | "audio"');

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const { id, ...data } = input;
      
      await db.update(materials)
        .set(data)
        .where(eq(materials.id, id));
      
      return { success: true };
    }),
  
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Soft delete
      await db.update(materials)
        .set({ isAvailable: false })
        .where(eq(materials.id, input.id));
      
      return { success: true };
    }),
  
  // ==========================================
  // AÇÕES DO USUÁRIO - ENGAGEMENT
  // ==========================================
  
  voteMaterial: protectedProcedure
    .input(z.object({ 
      materialId: z.number(),
      voteType: z.enum(["up", "down"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Verificar se já deu upvote
      const [existing] = await db.select()
        .from(materialUpvotes)  // ❗ NÃO é "materialVotes"!
        .where(and(
          eq(materialUpvotes.materialId, input.materialId),
          eq(materialUpvotes.userId, ctx.user.id)
        ))
        .limit(1);
      
      let action: 'added' | 'removed' = 'added';
      
      if (existing) {
        // Remover upvote (toggle)
        await db.delete(materialUpvotes)
          .where(eq(materialUpvotes.id, existing.id));
        
        // Decrementar contador
        await db.update(materials)
          .set({ upvotes: sql`${materials.upvotes} - 1` })
          .where(eq(materials.id, input.materialId));
        
        action = 'removed';
      } else {
        // Adicionar upvote
        await db.insert(materialUpvotes).values({
          materialId: input.materialId,
          userId: ctx.user.id,
        });
        
        // Incrementar contador
        await db.update(materials)
          .set({ upvotes: sql`${materials.upvotes} + 1` })
          .where(eq(materials.id, input.materialId));
        
        action = 'added';
      }

      // Buscar novo total de upvotes
      const [material] = await db
        .select({ upvotes: materials.upvotes })
        .from(materials)
        .where(eq(materials.id, input.materialId))
        .limit(1);
      
      return { 
        action,
        upvotes: material?.upvotes || 0,
        userVote: action === 'added' ? input.voteType : null,
      };
    }),
  
  rateMaterial: protectedProcedure
    .input(z.object({
      materialId: z.number(),
      rating: z.number().min(1).max(5),
      comment: z.string().max(500).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Verificar se já avaliou
      const [existing] = await db.select()
        .from(materialRatings)
        .where(and(
          eq(materialRatings.materialId, input.materialId),
          eq(materialRatings.userId, ctx.user.id)
        ))
        .limit(1);
      
      if (existing) {
        // Atualizar rating existente
        await db.update(materialRatings)
          .set({ 
            rating: input.rating,
            comment: input.comment || null,
          })
          .where(eq(materialRatings.id, existing.id));
      } else {
        // Criar novo rating
        await db.insert(materialRatings).values({
          materialId: input.materialId,
          userId: ctx.user.id,
          rating: input.rating,
          comment: input.comment || null,
        });
        
        // Incrementar contador
        await db.update(materials)
          .set({ ratingCount: sql`${materials.ratingCount} + 1` })
          .where(eq(materials.id, input.materialId));
      }
      
      // Recalcular média de rating
      const ratings = await db.select()
        .from(materialRatings)
        .where(eq(materialRatings.materialId, input.materialId));
      
      const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
      
      await db.update(materials)
        .set({ rating: avgRating.toFixed(2) })
        .where(eq(materials.id, input.materialId));
      
      return { 
        success: true,
        averageRating: Number(avgRating.toFixed(2)),
        ratingCount: ratings.length,
        userRating: input.rating,
      };
    }),

  getEngagementStats: protectedProcedure
    .input(z.object({ materialId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Buscar material
      const [material] = await db
        .select()
        .from(materials)
        .where(eq(materials.id, input.materialId))
        .limit(1);

      if (!material) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Material não encontrado" });
      }

      // Buscar voto do usuário
      const [upvote] = await db
        .select()
        .from(materialUpvotes)
        .where(
          and(
            eq(materialUpvotes.materialId, input.materialId),
            eq(materialUpvotes.userId, ctx.user.id)
          )
        )
        .limit(1);

      // Buscar avaliação do usuário
      const [rating] = await db
        .select()
        .from(materialRatings)
        .where(
          and(
            eq(materialRatings.materialId, input.materialId),
            eq(materialRatings.userId, ctx.user.id)
          )
        )
        .limit(1);

      return {
        upvotes: material.upvotes || 0,
        viewCount: material.viewCount || 0,
        downloadCount: material.downloadCount || 0,
        rating: Number(material.rating) || 0,
        ratingCount: material.ratingCount || 0,
        userVote: upvote ? 'up' : null,
        userRating: rating?.rating || null,
      };
    }),

  incrementViewCount: protectedProcedure
    .input(z.object({ materialId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Registrar visualização
      await db.insert(materialViews).values({
        materialId: input.materialId,
        userId: ctx.user.id,
      });
      
      // Incrementar contador
      await db.update(materials)
        .set({ viewCount: sql`${materials.viewCount} + 1` })
        .where(eq(materials.id, input.materialId));

      return { success: true };
    }),

  incrementDownloadCount: protectedProcedure
    .input(z.object({ materialId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Registrar download
      await db.insert(materialDownloads).values({
        materialId: input.materialId,
        userId: ctx.user.id,
      });
      
      // Incrementar contador
      await db.update(materials)
        .set({ downloadCount: sql`${materials.downloadCount} + 1` })
        .where(eq(materials.id, input.materialId));

      return { success: true };
    }),
  
  // ==========================================
  // ANALYTICS (ADMIN)
  // ==========================================
  
  getAnalytics: adminProcedure
    .input(z.object({
      materialId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      if (input.materialId) {
        // Analytics de um material específico
        const [material] = await db
          .select()
          .from(materials)
          .where(eq(materials.id, input.materialId))
          .limit(1);
        
        return {
          material,
          views: material?.viewCount || 0,
          downloads: material?.downloadCount || 0,
          upvotes: material?.upvotes || 0,
          favorites: material?.favoriteCount || 0,
          rating: material?.rating || "0.00",
          ratingCount: material?.ratingCount || 0,
        };
      } else {
        // Analytics gerais
        const allMaterials = await db.select().from(materials);
        
        return {
          totalMaterials: allMaterials.length,
          totalViews: allMaterials.reduce((sum, m) => sum + m.viewCount, 0),
          totalDownloads: allMaterials.reduce((sum, m) => sum + m.downloadCount, 0),
          totalUpvotes: allMaterials.reduce((sum, m) => sum + m.upvotes, 0),
        };
      }
    }),

  /**
   * DOWNLOAD MATERIAL
   * Registra download e retorna URL do arquivo
   */
  downloadMaterial: protectedProcedure
    .input(z.object({
      materialId: z.number(),
      itemId: z.number().optional(), // Se material tem múltiplos itens
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // 1. Buscar material com items
      const [material] = await db
        .select()
        .from(materials)
        .where(eq(materials.id, input.materialId))
        .limit(1);

      if (!material) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Material não encontrado',
        });
      }

      // 2. Buscar items do material
      const items = await db
        .select()
        .from(materialItems)
        .where(eq(materialItems.materialId, input.materialId));

      if (items.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Material não possui arquivos para download',
        });
      }

      // 3. Determinar qual item baixar
      let itemToDownload;
      if (input.itemId) {
        // Baixar item específico
        itemToDownload = items.find(item => item.id === input.itemId);
        if (!itemToDownload) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Item não encontrado',
          });
        }
      } else {
        // Baixar primeiro item (padrão)
        itemToDownload = items[0];
      }

      // 4. Registrar download no log
      await db.insert(materialDownloads).values({
        materialId: input.materialId,
        materialItemId: itemToDownload.id,
        userId: ctx.user.id,
        ipAddress: ctx.req?.ip || null,
      });

      // 5. Incrementar contador de downloads
      await db.update(materials)
        .set({ downloadCount: sql`${materials.downloadCount} + 1` })
        .where(eq(materials.id, input.materialId));

      // 6. Processar URL baseado no tipo de armazenamento
      let downloadUrl: string;
      
      if (itemToDownload.url) {
        // Cenário A: URL externa (YouTube, Vimeo, etc)
        downloadUrl = itemToDownload.url;
      } else if (itemToDownload.filePath) {
        // Cenário B: Arquivo local
        // Converter path local em URL servida pelo Express
        const fileName = path.basename(itemToDownload.filePath);
        const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
        downloadUrl = `${baseUrl}/materiais-files/${fileName}`;
      } else {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Arquivo não encontrado',
        });
      }

      // 7. Retornar URL do arquivo
      return {
        success: true,
        downloadUrl,
        fileName: itemToDownload.title || material.title,
        fileType: itemToDownload.type,
        fileSize: itemToDownload.fileSize,
      };
    }),

  /**
   * TOGGLE FAVORITE
   * Adiciona ou remove material dos favoritos
   */
  toggleFavorite: protectedProcedure
    .input(z.object({ materialId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // 1. Verificar se já está favoritado
      const [existing] = await db.select()
        .from(materialFavorites)
        .where(and(
          eq(materialFavorites.materialId, input.materialId),
          eq(materialFavorites.userId, ctx.user.id)
        ))
        .limit(1);

      if (existing) {
        // Remover dos favoritos
        await db.delete(materialFavorites)
          .where(eq(materialFavorites.id, existing.id));

        // Decrementar contador
        await db.update(materials)
          .set({ favoriteCount: sql`${materials.favoriteCount} - 1` })
          .where(eq(materials.id, input.materialId));

        // Buscar novo contador
        const [updated] = await db.select()
          .from(materials)
          .where(eq(materials.id, input.materialId))
          .limit(1);

        return {
          action: 'removed',
          isFavorite: false,
          favoriteCount: updated?.favoriteCount || 0,
        };
      } else {
        // Adicionar aos favoritos
        await db.insert(materialFavorites).values({
          materialId: input.materialId,
          userId: ctx.user.id,
        });

        // Incrementar contador
        await db.update(materials)
          .set({ favoriteCount: sql`${materials.favoriteCount} + 1` })
          .where(eq(materials.id, input.materialId));

        // Buscar novo contador
        const [updated] = await db.select()
          .from(materials)
          .where(eq(materials.id, input.materialId))
          .limit(1);

        return {
          action: 'added',
          isFavorite: true,
          favoriteCount: updated?.favoriteCount || 0,
        };
      }
    }),

  /**
   * LIST FAVORITES
   * Lista todos os materiais favoritos do usuário
   */
  listFavorites: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const favorites = await db.select({
        material: materials,
        favoritedAt: materialFavorites.createdAt,
      })
        .from(materialFavorites)
        .innerJoin(materials, eq(materialFavorites.materialId, materials.id))
        .where(eq(materialFavorites.userId, ctx.user.id))
        .orderBy(desc(materialFavorites.createdAt));

      return favorites.map(fav => ({
        ...fav.material,
        favoritedAt: fav.favoritedAt,
      }));
    }),

    /**
   * GET FAVORITES COUNT
   * Retorna quantidade de favoritos do usuário
   */
  getFavoritesCount: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const [result] = await db.select({
        count: sql<number>`COUNT(*)`,
      })
        .from(materialFavorites)
        .where(eq(materialFavorites.userId, ctx.user.id));
      return result?.count || 0;
    }),

  /**
   * GET STATS
   * Retorna estatísticas completas dos materiais (para dashboard admin)
   * Inclui: totais, visualizações, downloads, engajamento, agregações por tipo/disciplina, top materiais
   */
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      console.log('📊 [Materiais] Buscando estatísticas completas...');

      // 1. Estatísticas gerais (totais, visualizações, downloads, engajamento)
      const [stats] = await db.select({
        total: sql<number>`COUNT(*)`,
        ativos: sql<number>`SUM(CASE WHEN ${materials.isAvailable} = 1 THEN 1 ELSE 0 END)`,
        inativos: sql<number>`SUM(CASE WHEN ${materials.isAvailable} = 0 THEN 1 ELSE 0 END)`,
        pagos: sql<number>`SUM(CASE WHEN ${materials.isPaid} = 1 THEN 1 ELSE 0 END)`,
        gratuitos: sql<number>`SUM(CASE WHEN ${materials.isPaid} = 0 THEN 1 ELSE 0 END)`,
        totalVisualizacoes: sql<number>`SUM(${materials.viewCount})`,
        totalDownloads: sql<number>`SUM(${materials.downloadCount})`,
        totalUpvotes: sql<number>`SUM(${materials.upvotes})`,
        totalFavoritos: sql<number>`SUM(${materials.favoriteCount})`,
      })
        .from(materials);

      const total = Number(stats?.total || 0);
      const totalVisualizacoes = Number(stats?.totalVisualizacoes || 0);
      const totalDownloads = Number(stats?.totalDownloads || 0);
      const totalUpvotes = Number(stats?.totalUpvotes || 0);
      const totalFavoritos = Number(stats?.totalFavoritos || 0);

      // Calcular médias
      const mediaVisualizacoes = total > 0 ? Math.round(totalVisualizacoes / total) : 0;
      const mediaDownloads = total > 0 ? Math.round(totalDownloads / total) : 0;

      // Taxa de engajamento = (upvotes + favoritos) / visualizações * 100
      const taxaEngajamento = totalVisualizacoes > 0 
        ? Number(((totalUpvotes + totalFavoritos) / totalVisualizacoes * 100).toFixed(2))
        : 0;

      // 2. Materiais por tipo (video, pdf, audio)
      const porTipo = await db.select({
        tipo: materials.type,
        count: sql<number>`COUNT(*)`,
      })
        .from(materials)
        .groupBy(materials.type);

      // 3. Top 10 materiais mais acessados
      const maisAcessados = await db.select({
        id: materials.id,
        title: materials.title,
        type: materials.type,
        category: materials.category,
        visualizacoes: materials.viewCount,
        disciplinaNome: sql<string>`'N/A'`, // Placeholder, pode fazer LEFT JOIN com materialLinks se necessário
        assuntoNome: sql<string>`'N/A'`,
      })
        .from(materials)
        .where(eq(materials.isAvailable, true))
        .orderBy(desc(materials.viewCount))
        .limit(10);

      // 4. Materiais por disciplina (agregação via materialLinks)
      const porDisciplinaRaw = await db.execute(sql`
        SELECT 
          ml.disciplinaId,
          'Disciplina' as disciplinaNome,
          COUNT(DISTINCT ml.materialId) as count
        FROM materialLinks ml
        INNER JOIN materials m ON ml.materialId = m.id
        WHERE m.isAvailable = 1
        GROUP BY ml.disciplinaId
        ORDER BY count DESC
        LIMIT 10
      `);

      // Destructure [rows, fields] do mysql2
      const [porDisciplinaRows] = porDisciplinaRaw as any;
      const porDisciplina = (porDisciplinaRows || []).map((row: any) => ({
        disciplinaId: row.disciplinaId,
        disciplinaNome: row.disciplinaNome,
        count: Number(row.count || 0),
      }));

      console.log('✅ [Materiais] Stats completas:', {
        total,
        totalVisualizacoes,
        totalDownloads,
        taxaEngajamento,
        porTipo: porTipo.length,
        maisAcessados: maisAcessados.length,
        porDisciplina: porDisciplina.length,
      });

      return {
        // Totais
        totalMateriais: total,
        materiaisAtivos: Number(stats?.ativos || 0),
        materiaisInativos: Number(stats?.inativos || 0),
        materiaisPagos: Number(stats?.pagos || 0),
        materiaisGratuitos: Number(stats?.gratuitos || 0),
        
        // Visualizações e Downloads
        totalVisualizacoes,
        mediaVisualizacoes,
        totalDownloads,
        mediaDownloads,
        
        // Engajamento
        taxaEngajamento,
        totalUpvotes,
        totalFavoritos,
        
        // Agregações
        porTipo: porTipo.map(item => ({
          tipo: item.tipo,
          count: Number(item.count || 0),
        })),
        maisAcessados,
        porDisciplina,
      };
    }),
});
