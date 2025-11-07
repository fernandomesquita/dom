import { router, publicProcedure, protectedProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from '@trpc/server';
import { eq, and, desc, gte, sql } from "drizzle-orm";
import { 
  materials, 
  materialItems,
  materialLinks,
  materialViews,
  materialDownloads,
  materialUpvotes,
  materialRatings,
  materialFavorites,
  materialSeenMarks,
  materialComments
} from "../../drizzle/schema-materials-v4";

/**
 * Router de Materiais V4.0
 * 15 procedures: 7 admin + 8 aluno
 */
export const materialsRouter = router({
  
  // ============================================================================
  // PROCEDURES ADMIN (7)
  // ============================================================================
  
  /**
   * 1. CREATE - Criar material (admin)
   */
  create: adminProcedure
    .input(z.object({
      title: z.string().min(1).max(255),
      description: z.string().optional(),
      thumbnailUrl: z.string().url(),
      category: z.enum(["base", "revisao", "promo"]),
      type: z.enum(["video", "pdf", "audio"]),
      isPaid: z.boolean().default(false),
      isAvailable: z.boolean().default(true),
      isFeatured: z.boolean().default(false),
      commentsEnabled: z.boolean().default(true),
      items: z.array(z.object({
        title: z.string().min(1).max(255),
        type: z.enum(["video", "pdf", "audio"]),
        url: z.string().optional(),
        filePath: z.string().optional(),
        duration: z.number().optional(),
        fileSize: z.number().optional(),
        order: z.number().default(0),
      })).min(1),
      links: z.array(z.object({
        disciplinaId: z.string(),
        assuntoId: z.string(),
        topicoId: z.string(),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { items, links, ...materialData } = input;
      
      // Criar material
      const [material] = await ctx.db.insert(materials).values({
        ...materialData,
        createdBy: ctx.user.id,
      });
      
      const materialId = material.insertId;
      
      // Criar items
      if (items.length > 0) {
        await ctx.db.insert(materialItems).values(
          items.map(item => ({
            ...item,
            materialId,
          }))
        );
      }
      
      // Criar links com Árvore DOM
      if (links && links.length > 0) {
        await ctx.db.insert(materialLinks).values(
          links.map(link => ({
            ...link,
            materialId,
          }))
        );
      }
      
      return { id: materialId, ...materialData };
    }),
  
  /**
   * 2. UPDATE - Atualizar material (admin)
   */
  update: adminProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      thumbnailUrl: z.string().url().optional(),
      category: z.enum(["base", "revisao", "promo"]).optional(),
      type: z.enum(["video", "pdf", "audio"]).optional(),
      isPaid: z.boolean().optional(),
      isAvailable: z.boolean().optional(),
      isFeatured: z.boolean().optional(),
      commentsEnabled: z.boolean().optional(),
      items: z.array(z.object({
        id: z.number().optional(),
        title: z.string().min(1).max(255),
        type: z.enum(["video", "pdf", "audio"]),
        url: z.string().optional(),
        filePath: z.string().optional(),
        duration: z.number().optional(),
        fileSize: z.number().optional(),
        order: z.number().default(0),
      })).optional(),
      links: z.array(z.object({
        disciplinaId: z.string(),
        assuntoId: z.string(),
        topicoId: z.string(),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, items, links, ...updateData } = input;
      
      // Verificar se material existe
      const existing = await ctx.db.select().from(materials).where(eq(materials.id, id)).limit(1);
      if (existing.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Material não encontrado' });
      }
      
      // Atualizar material
      if (Object.keys(updateData).length > 0) {
        await ctx.db.update(materials).set(updateData).where(eq(materials.id, id));
      }
      
      // Atualizar items (deletar todos e recriar)
      if (items) {
        await ctx.db.delete(materialItems).where(eq(materialItems.materialId, id));
        if (items.length > 0) {
          await ctx.db.insert(materialItems).values(
            items.map(item => ({
              ...item,
              materialId: id,
            }))
          );
        }
      }
      
      // Atualizar links (deletar todos e recriar)
      if (links) {
        await ctx.db.delete(materialLinks).where(eq(materialLinks.materialId, id));
        if (links.length > 0) {
          await ctx.db.insert(materialLinks).values(
            links.map(link => ({
              ...link,
              materialId: id,
            }))
          );
        }
      }
      
      return { success: true };
    }),
  
  /**
   * 3. DELETE - Deletar material (admin)
   */
  delete: adminProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verificar se material existe
      const existing = await ctx.db.select().from(materials).where(eq(materials.id, input.id)).limit(1);
      if (existing.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Material não encontrado' });
      }
      
      // Deletar material (cascade deleta items, links, views, etc)
      await ctx.db.delete(materials).where(eq(materials.id, input.id));
      
      return { success: true };
    }),
  
  /**
   * 4. GET_ADMIN_STATS - Estatísticas completas (admin)
   */
  getAdminStats: adminProcedure
    .query(async ({ ctx }) => {
      // Total de materiais
      const totalResult = await ctx.db.select({ count: sql<number>`COUNT(*)` })
        .from(materials);
      const total = totalResult[0]?.count || 0;
      
      // Total de views
      const viewsResult = await ctx.db.select({ count: sql<number>`COUNT(*)` })
        .from(materialViews);
      const totalViews = viewsResult[0]?.count || 0;
      
      // Total de downloads
      const downloadsResult = await ctx.db.select({ count: sql<number>`COUNT(*)` })
        .from(materialDownloads);
      const totalDownloads = downloadsResult[0]?.count || 0;
      
      // Rating médio
      const ratingResult = await ctx.db.select({ avg: sql<number>`AVG(${materials.rating})` })
        .from(materials);
      const averageRating = ratingResult[0]?.avg || 0;
      
      // Top 10 mais acessados
      const topViewed = await ctx.db
        .select({
          id: materials.id,
          title: materials.title,
          viewCount: materials.viewCount,
        })
        .from(materials)
        .orderBy(desc(materials.viewCount))
        .limit(10);
      
      // Top 10 mais baixados
      const topDownloaded = await ctx.db
        .select({
          id: materials.id,
          title: materials.title,
          downloadCount: materials.downloadCount,
        })
        .from(materials)
        .orderBy(desc(materials.downloadCount))
        .limit(10);
      
      return {
        total,
        totalViews,
        totalDownloads,
        averageRating,
        topViewed,
        topDownloaded,
      };
    }),
  
  /**
   * 5. GET_TRENDING - Materiais em alta (últimos 7 dias)
   */
  getTrending: adminProcedure
    .query(async ({ ctx }) => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      // Query otimizada com GROUP BY (não N+1)
      const trending = await ctx.db
        .select({
          materialId: materialViews.materialId,
          viewCount: sql<number>`COUNT(*)`,
        })
        .from(materialViews)
        .where(gte(materialViews.viewedAt, sevenDaysAgo))
        .groupBy(materialViews.materialId)
        .orderBy(desc(sql`COUNT(*)`))
        .limit(10);
      
      // Buscar dados dos materiais
      const materialIds = trending.map(t => t.materialId);
      if (materialIds.length === 0) return [];
      
      const materialsData = await ctx.db
        .select()
        .from(materials)
        .where(sql`${materials.id} IN (${sql.join(materialIds.map(id => sql`${id}`), sql`, `)})`);
      
      // Combinar dados
      return trending.map(t => {
        const material = materialsData.find(m => m.id === t.materialId);
        return {
          ...material,
          recentViews: t.viewCount,
        };
      });
    }),
  
  /**
   * 6. BATCH_CREATE - Criar materiais em lote via Excel (admin)
   * TODO: Implementar quando adicionar dependência xlsx
   */
  batchCreate: adminProcedure
    .input(z.object({
      data: z.array(z.any()),
    }))
    .mutation(async ({ ctx, input }) => {
      throw new TRPCError({ code: 'NOT_IMPLEMENTED', message: 'Batch create ainda não implementado' });
    }),
  
  /**
   * 7. UPDATE_STATS - Atualizar contadores agregados (admin)
   */
  updateStats: adminProcedure
    .input(z.object({
      materialId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { materialId } = input;
      
      // Recalcular upvotes
      const upvotesResult = await ctx.db
        .select({ count: sql<number>`COUNT(*)` })
        .from(materialUpvotes)
        .where(eq(materialUpvotes.materialId, materialId));
      const upvotes = upvotesResult[0]?.count || 0;
      
      // Recalcular viewCount
      const viewsResult = await ctx.db
        .select({ count: sql<number>`COUNT(*)` })
        .from(materialViews)
        .where(eq(materialViews.materialId, materialId));
      const viewCount = viewsResult[0]?.count || 0;
      
      // Recalcular downloadCount
      const downloadsResult = await ctx.db
        .select({ count: sql<number>`COUNT(*)` })
        .from(materialDownloads)
        .where(eq(materialDownloads.materialId, materialId));
      const downloadCount = downloadsResult[0]?.count || 0;
      
      // Recalcular favoriteCount
      const favoritesResult = await ctx.db
        .select({ count: sql<number>`COUNT(*)` })
        .from(materialFavorites)
        .where(eq(materialFavorites.materialId, materialId));
      const favoriteCount = favoritesResult[0]?.count || 0;
      
      // Recalcular rating e ratingCount
      const ratingsResult = await ctx.db
        .select({ 
          avg: sql<number>`AVG(${materialRatings.rating})`,
          count: sql<number>`COUNT(*)`,
        })
        .from(materialRatings)
        .where(eq(materialRatings.materialId, materialId));
      const rating = ratingsResult[0]?.avg || 0;
      const ratingCount = ratingsResult[0]?.count || 0;
      
      // Atualizar material
      await ctx.db.update(materials).set({
        upvotes,
        viewCount,
        downloadCount,
        favoriteCount,
        rating: rating.toString(),
        ratingCount,
      }).where(eq(materials.id, materialId));
      
      return { success: true };
    }),
  
  // ============================================================================
  // PROCEDURES ALUNO (8)
  // ============================================================================
  
  /**
   * 8. LIST - Listar materiais com filtros (público)
   */
  list: publicProcedure
    .input(z.object({
      category: z.enum(["base", "revisao", "promo"]).optional(),
      type: z.enum(["video", "pdf", "audio"]).optional(),
      isPaid: z.boolean().optional(),
      disciplinaId: z.string().optional(),
      assuntoId: z.string().optional(),
      topicoId: z.string().optional(),
      search: z.string().optional(),
      isFeatured: z.boolean().optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const conditions = [eq(materials.isAvailable, true)];
      
      if (input.category) conditions.push(eq(materials.category, input.category));
      if (input.type) conditions.push(eq(materials.type, input.type));
      if (input.isPaid !== undefined) conditions.push(eq(materials.isPaid, input.isPaid));
      if (input.isFeatured !== undefined) conditions.push(eq(materials.isFeatured, input.isFeatured));
      
      // TODO: Adicionar filtros de árvore DOM e search quando implementar
      
      const results = await ctx.db
        .select()
        .from(materials)
        .where(and(...conditions))
        .orderBy(desc(materials.createdAt))
        .limit(input.limit)
        .offset(input.offset);
      
      // TODO: Adicionar flags de engajamento do usuário (hasUpvoted, hasFavorited, userRating, hasSeen)
      
      return results;
    }),
  
  /**
   * 9. GET_BY_ID - Buscar material por ID (aluno)
   */
  getById: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const material = await ctx.db
        .select()
        .from(materials)
        .where(eq(materials.id, input.id))
        .limit(1);
      
      if (material.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Material não encontrado' });
      }
      
      // Buscar items
      const items = await ctx.db
        .select()
        .from(materialItems)
        .where(eq(materialItems.materialId, input.id))
        .orderBy(materialItems.order);
      
      // Buscar links
      const links = await ctx.db
        .select()
        .from(materialLinks)
        .where(eq(materialLinks.materialId, input.id));
      
      // TODO: Adicionar flags de engajamento e comentários
      
      return {
        ...material[0],
        items,
        links,
      };
    }),
  
  /**
   * 10. TOGGLE_UPVOTE - Dar/remover upvote
   */
  toggleUpvote: protectedProcedure
    .input(z.object({
      materialId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { materialId } = input;
      const userId = ctx.user.id;
      
      // Verificar se já deu upvote
      const existing = await ctx.db
        .select()
        .from(materialUpvotes)
        .where(and(
          eq(materialUpvotes.materialId, materialId),
          eq(materialUpvotes.userId, userId)
        ))
        .limit(1);
      
      if (existing.length > 0) {
        // Remover upvote
        await ctx.db.delete(materialUpvotes).where(and(
          eq(materialUpvotes.materialId, materialId),
          eq(materialUpvotes.userId, userId)
        ));
        
        // Decrementar contador (proteger de negativos)
        await ctx.db.update(materials).set({
          upvotes: sql`GREATEST(${materials.upvotes} - 1, 0)`,
        }).where(eq(materials.id, materialId));
        
        return { upvoted: false };
      } else {
        // Adicionar upvote
        await ctx.db.insert(materialUpvotes).values({
          materialId,
          userId,
        });
        
        // Incrementar contador
        await ctx.db.update(materials).set({
          upvotes: sql`${materials.upvotes} + 1`,
        }).where(eq(materials.id, materialId));
        
        return { upvoted: true };
      }
    }),
  
  /**
   * 11. SET_RATING - Avaliar material (1-5 estrelas)
   */
  setRating: protectedProcedure
    .input(z.object({
      materialId: z.number(),
      rating: z.number().min(1).max(5),
    }))
    .mutation(async ({ ctx, input }) => {
      const { materialId, rating } = input;
      const userId = ctx.user.id;
      
      // Upsert rating
      const existing = await ctx.db
        .select()
        .from(materialRatings)
        .where(and(
          eq(materialRatings.materialId, materialId),
          eq(materialRatings.userId, userId)
        ))
        .limit(1);
      
      if (existing.length > 0) {
        // Atualizar
        await ctx.db.update(materialRatings).set({ rating }).where(and(
          eq(materialRatings.materialId, materialId),
          eq(materialRatings.userId, userId)
        ));
      } else {
        // Criar
        await ctx.db.insert(materialRatings).values({
          materialId,
          userId,
          rating,
        });
      }
      
      // Recalcular rating médio
      const ratingsResult = await ctx.db
        .select({ 
          avg: sql<number>`AVG(${materialRatings.rating})`,
          count: sql<number>`COUNT(*)`,
        })
        .from(materialRatings)
        .where(eq(materialRatings.materialId, materialId));
      
      const avgRating = ratingsResult[0]?.avg || 0;
      const ratingCount = ratingsResult[0]?.count || 0;
      
      await ctx.db.update(materials).set({
        rating: avgRating.toString(),
        ratingCount,
      }).where(eq(materials.id, materialId));
      
      return { success: true };
    }),
  
  /**
   * 12. TOGGLE_FAVORITE - Favoritar/desfavoritar
   */
  toggleFavorite: protectedProcedure
    .input(z.object({
      materialId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { materialId } = input;
      const userId = ctx.user.id;
      
      // Verificar se já favoritou
      const existing = await ctx.db
        .select()
        .from(materialFavorites)
        .where(and(
          eq(materialFavorites.materialId, materialId),
          eq(materialFavorites.userId, userId)
        ))
        .limit(1);
      
      if (existing.length > 0) {
        // Remover favorito
        await ctx.db.delete(materialFavorites).where(and(
          eq(materialFavorites.materialId, materialId),
          eq(materialFavorites.userId, userId)
        ));
        
        // Decrementar contador
        await ctx.db.update(materials).set({
          favoriteCount: sql`GREATEST(${materials.favoriteCount} - 1, 0)`,
        }).where(eq(materials.id, materialId));
        
        return { favorited: false };
      } else {
        // Adicionar favorito
        await ctx.db.insert(materialFavorites).values({
          materialId,
          userId,
        });
        
        // Incrementar contador
        await ctx.db.update(materials).set({
          favoriteCount: sql`${materials.favoriteCount} + 1`,
        }).where(eq(materials.id, materialId));
        
        return { favorited: true };
      }
    }),
  
  /**
   * 13. MARK_AS_SEEN - Marcar como visto
   */
  markAsSeen: protectedProcedure
    .input(z.object({
      materialId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { materialId } = input;
      const userId = ctx.user.id;
      
      // Verificar se já marcou
      const existing = await ctx.db
        .select()
        .from(materialSeenMarks)
        .where(and(
          eq(materialSeenMarks.materialId, materialId),
          eq(materialSeenMarks.userId, userId)
        ))
        .limit(1);
      
      if (existing.length === 0) {
        // Criar marca
        await ctx.db.insert(materialSeenMarks).values({
          materialId,
          userId,
        });
      }
      
      return { success: true };
    }),
  
  /**
   * 14. DOWNLOAD_PDF - Baixar PDF com DRM
   */
  downloadPDF: protectedProcedure
    .input(z.object({
      materialId: z.number(),
      materialItemId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { materialId, materialItemId } = input;
      const userId = ctx.user.id;
      
      // Importar DRM utilities
      const { addWatermarkToPDF, generatePDFFingerprint, validateUserProfileForDownload } = await import('../utils/pdf-drm');
      const { storageGet } = await import('../storage');
      
      // Validar perfil do usuário (precisa ter CPF e telefone para download)
      const profileValidation = validateUserProfileForDownload(ctx.user);
      if (!profileValidation.valid) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: `Complete seu perfil para baixar PDFs. Faltam: ${profileValidation.missingFields.join(', ')}`,
        });
      }
      
      // Buscar material
      const material = await ctx.db
        .select()
        .from(materials)
        .where(eq(materials.id, materialId))
        .limit(1);
      
      if (material.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Material não encontrado' });
      }
      
      // Verificar se material está disponível
      if (!material[0].isAvailable) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Material não disponível' });
      }
      
      // Buscar item do material
      const item = await ctx.db
        .select()
        .from(materialItems)
        .where(eq(materialItems.id, materialItemId))
        .limit(1);
      
      if (item.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Item do material não encontrado' });
      }
      
      // Verificar se é PDF
      if (item[0].type !== 'pdf') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Este endpoint é apenas para PDFs' });
      }
      
      // Verificar se tem filePath ou URL
      if (!item[0].filePath && !item[0].url) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Arquivo PDF não encontrado' });
      }
      
      // Baixar PDF do S3 ou URL externa
      let pdfBuffer: Buffer;
      
      if (item[0].filePath) {
        // Buscar do S3
        const { url } = await storageGet(item[0].filePath);
        const response = await fetch(url);
        if (!response.ok) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao baixar PDF do storage' });
        }
        pdfBuffer = Buffer.from(await response.arrayBuffer());
      } else if (item[0].url) {
        // Baixar de URL externa
        const response = await fetch(item[0].url);
        if (!response.ok) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao baixar PDF da URL' });
        }
        pdfBuffer = Buffer.from(await response.arrayBuffer());
      } else {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao localizar PDF' });
      }
      
      // Adicionar marca d'água apenas se material for pago
      let finalPdfBuffer = pdfBuffer;
      let fingerprint: string | undefined;
      
      if (material[0].isPaid) {
        const watermarkData = {
          name: ctx.user.nomeCompleto || 'Usuário',
          cpf: ctx.user.cpf || '',
          email: ctx.user.email || '',
          phone: ctx.user.telefone || '',
        };
        
        fingerprint = generatePDFFingerprint(watermarkData);
        finalPdfBuffer = await addWatermarkToPDF(pdfBuffer, watermarkData);
      }
      
      // Registrar download
      await ctx.db.insert(materialDownloads).values({
        materialId,
        materialItemId,
        userId,
        ipAddress: ctx.req.ip || ctx.req.socket.remoteAddress,
        pdfFingerprint: fingerprint,
      });
      
      // Incrementar contador de downloads
      await ctx.db.update(materials).set({
        downloadCount: sql`${materials.downloadCount} + 1`,
      }).where(eq(materials.id, materialId));
      
      // Retornar PDF como base64 para o frontend
      return {
        filename: `${item[0].title}.pdf`,
        contentType: 'application/pdf',
        data: finalPdfBuffer.toString('base64'),
        fingerprint,
      };
    }),
  
  /**
   * 15. INCREMENT_VIEW - Registrar visualização
   */
  incrementView: protectedProcedure
    .input(z.object({
      materialId: z.number(),
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { materialId, ipAddress, userAgent } = input;
      const userId = ctx.user.id;
      
      // Criar registro de visualização (de-duplicado por dia via unique index)
      try {
        await ctx.db.insert(materialViews).values({
          materialId,
          userId,
          ipAddress,
          userAgent,
        });
        
        // Incrementar contador
        await ctx.db.update(materials).set({
          viewCount: sql`${materials.viewCount} + 1`,
        }).where(eq(materials.id, materialId));
      } catch (error) {
        // Ignorar erro de duplicata (já visualizou hoje)
      }
      
      return { success: true };
    }),
});
