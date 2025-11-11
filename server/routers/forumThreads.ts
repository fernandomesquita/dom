import { z } from 'zod';
import { eq, desc, and, sql, inArray } from 'drizzle-orm';
import { publicProcedure, router, protectedProcedure } from '../_core/trpc';
import { getDb } from '../db';
import {
  forumThreads,
  forumCategories,
  forumMessages,
  forumThreadFollowers,
  forumThreadFavorites,
  forumThreadEdits,
  forumModerationQueue,
  forumUserSuspensions,
} from '../../drizzle/schema-forum';
import { users } from '../../drizzle/schema';
import { randomUUID } from 'crypto';
import { TRPCError } from '@trpc/server';
import { verificarConteudo, sanitizarHTML, verificarSuspensao } from '../helpers/moderacao';

/**
 * Router de Threads do Fórum
 */
export const forumThreadsRouter = router({
  /**
   * Listar threads com filtros e paginação
   */
  list: publicProcedure
    .input(
      z.object({
        categoriaId: z.string().uuid().optional(),
        tags: z.array(z.string()).optional(),
        busca: z.string().optional(),
        autorId: z.string().uuid().optional(),
        status: z.enum(['ativo', 'arquivado']).optional(),
        ordenar: z.enum(['recente', 'popular', 'atividade']).default('atividade'),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(20),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const offset = (input.page - 1) * input.limit;

      // Construir query base
      let query = db
        .select({
          thread: forumThreads,
          categoria: forumCategories,
          autor: {
            id: users.id,
            nome: users.name,
            email: users.email,
          },
        })
        .from(forumThreads)
        .leftJoin(forumCategories, eq(forumThreads.categoriaId, forumCategories.id))
        .leftJoin(users, eq(forumThreads.autorId, users.id))
        .$dynamic();

      // Aplicar filtros
      const conditions = [];
      
      if (input.categoriaId) {
        conditions.push(eq(forumThreads.categoriaId, input.categoriaId));
      }

      if (input.autorId) {
        conditions.push(eq(forumThreads.autorId, input.autorId));
      }

      if (input.status) {
        conditions.push(eq(forumThreads.status, input.status));
      } else {
        conditions.push(eq(forumThreads.status, 'ativo'));
      }

      if (input.busca) {
        conditions.push(
          sql`(${forumThreads.titulo} LIKE ${`%${input.busca}%`} OR ${forumThreads.conteudo} LIKE ${`%${input.busca}%`})`
        );
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      // Aplicar ordenação
      if (input.ordenar === 'recente') {
        query = query.orderBy(desc(forumThreads.criadoEm));
      } else if (input.ordenar === 'popular') {
        query = query.orderBy(desc(forumThreads.visualizacoes));
      } else {
        // atividade
        query = query.orderBy(desc(forumThreads.ultimaAtividade));
      }

      // Threads pinned sempre no topo
      query = query.orderBy(desc(forumThreads.isPinned));

      const threads = await query.limit(input.limit).offset(offset);

      // Contar total
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(forumThreads)
        .where(and(...conditions));

      return {
        threads,
        total: Number(count),
        page: input.page,
        limit: input.limit,
        totalPages: Math.ceil(Number(count) / input.limit),
      };
    }),

  /**
   * Buscar thread por ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const [thread] = await db
        .select({
          thread: forumThreads,
          categoria: forumCategories,
          autor: {
            id: users.id,
            nome: users.name,
            email: users.email,
          },
        })
        .from(forumThreads)
        .leftJoin(forumCategories, eq(forumThreads.categoriaId, forumCategories.id))
        .leftJoin(users, eq(forumThreads.autorId, users.id))
        .where(eq(forumThreads.id, input.id));

      if (!thread) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Thread não encontrado' });
      }

      return thread;
    }),

  /**
   * Criar novo thread
   */
  create: protectedProcedure
    .input(
      z.object({
        titulo: z.string().min(10).max(200),
        conteudo: z.string().min(20),
        categoriaId: z.string().uuid(),
        tags: z.array(z.string()).max(5).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Verificar suspensão
      const suspensoes = await db
        .select()
        .from(forumUserSuspensions)
        .where(eq(forumUserSuspensions.usuarioId, ctx.user.id));

      const { suspenso, fimSuspensao } = verificarSuspensao(
        suspensoes.map((s) => ({ fimSuspensao: s.fimSuspensao, isAtiva: s.isAtiva }))
      );

      if (suspenso) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `Você está suspenso até ${fimSuspensao?.toLocaleDateString('pt-BR')}`,
        });
      }

      // Sanitizar conteúdo
      const conteudoSanitizado = sanitizarHTML(input.conteudo);

      // Verificar moderação automática
      const { aprovado, motivosSuspeitos } = verificarConteudo(conteudoSanitizado);

      const id = randomUUID();
      const status = aprovado ? 'ativo' : 'ativo'; // MVP: sem moderação prévia

      await db.insert(forumThreads).values({
        id,
        titulo: input.titulo,
        conteudo: conteudoSanitizado,
        autorId: ctx.user.id,
        categoriaId: input.categoriaId,
        tags: input.tags || null,
        status,
      });

      // Se suspeito, adicionar à fila de moderação
      if (!aprovado) {
        await db.insert(forumModerationQueue).values({
          id: randomUUID(),
          tipo: 'thread',
          itemId: id,
          autorId: ctx.user.id,
          conteudo: conteudoSanitizado,
          motivoSuspeito: motivosSuspeitos.join(', '),
          status: 'pendente',
        });
      }

      const [thread] = await db
        .select()
        .from(forumThreads)
        .where(eq(forumThreads.id, id));

      return thread;
    }),

  /**
   * Atualizar thread (autor ou admin, até 24h)
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        titulo: z.string().min(10).max(200).optional(),
        conteudo: z.string().min(20).optional(),
        tags: z.array(z.string()).max(5).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const [thread] = await db
        .select()
        .from(forumThreads)
        .where(eq(forumThreads.id, input.id));

      if (!thread) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Thread não encontrado' });
      }

      // Verificar permissão
      const isAutor = thread.autorId === ctx.user.id;
      const isAdmin = ctx.user.role === 'admin';

      if (!isAutor && !isAdmin) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Sem permissão' });
      }

      // Verificar janela de edição (24h)
      if (isAutor && !isAdmin) {
        const criadoEm = new Date(thread.criadoEm);
        const agora = new Date();
        const diff = agora.getTime() - criadoEm.getTime();
        const horas = diff / (1000 * 60 * 60);

        if (horas > 24) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Janela de edição expirada (24h)',
          });
        }
      }

      // Salvar histórico
      if (input.titulo || input.conteudo) {
        await db.insert(forumThreadEdits).values({
          id: randomUUID(),
          threadId: input.id,
          editorId: ctx.user.id,
          tituloAntigo: thread.titulo,
          tituloNovo: input.titulo || thread.titulo,
          conteudoAntigo: thread.conteudo,
          conteudoNovo: input.conteudo ? sanitizarHTML(input.conteudo) : thread.conteudo,
        });
      }

      // Atualizar
      const updateData: any = {
        editadoEm: new Date(),
      };

      if (input.titulo) updateData.titulo = input.titulo;
      if (input.conteudo) updateData.conteudo = sanitizarHTML(input.conteudo);
      if (input.tags) updateData.tags = JSON.stringify(input.tags);

      await db
        .update(forumThreads)
        .set(updateData)
        .where(eq(forumThreads.id, input.id));

      const [updated] = await db
        .select()
        .from(forumThreads)
        .where(eq(forumThreads.id, input.id));

      return updated;
    }),

  /**
   * Deletar thread (autor ou admin)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid(), motivo: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const [thread] = await db
        .select()
        .from(forumThreads)
        .where(eq(forumThreads.id, input.id));

      if (!thread) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Thread não encontrado' });
      }

      const isAutor = thread.autorId === ctx.user.id;
      const isAdmin = ctx.user.role === 'admin';

      if (!isAutor && !isAdmin) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Sem permissão' });
      }

      // Soft delete
      await db
        .update(forumThreads)
        .set({
          status: 'deletado',
          deletadoPorId: ctx.user.id,
          motivoDelecao: input.motivo,
        })
        .where(eq(forumThreads.id, input.id));

      return { success: true };
    }),

  /**
   * Fixar thread (pin) - Admin
   */
  pin: protectedProcedure
    .input(z.object({ id: z.string().uuid(), pinned: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Apenas administradores' });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      await db
        .update(forumThreads)
        .set({ isPinned: input.pinned })
        .where(eq(forumThreads.id, input.id));

      return { success: true };
    }),

  /**
   * Bloquear thread (lock) - Admin
   */
  lock: protectedProcedure
    .input(z.object({ id: z.string().uuid(), locked: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Apenas administradores' });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      await db
        .update(forumThreads)
        .set({ isLocked: input.locked })
        .where(eq(forumThreads.id, input.id));

      return { success: true };
    }),

  /**
   * Seguir thread
   */
  follow: protectedProcedure
    .input(z.object({ threadId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Verificar se já segue
      const [existing] = await db
        .select()
        .from(forumThreadFollowers)
        .where(
          and(
            eq(forumThreadFollowers.threadId, input.threadId),
            eq(forumThreadFollowers.usuarioId, ctx.user.id)
          )
        );

      if (existing) {
        // Deixar de seguir
        await db
          .delete(forumThreadFollowers)
          .where(
            and(
              eq(forumThreadFollowers.threadId, input.threadId),
              eq(forumThreadFollowers.usuarioId, ctx.user.id)
            )
          );

        return { following: false };
      } else {
        // Seguir
        await db.insert(forumThreadFollowers).values({
          id: randomUUID(),
          threadId: input.threadId,
          usuarioId: ctx.user.id,
        });

        return { following: true };
      }
    }),

  /**
   * Favoritar thread
   */
  favorite: protectedProcedure
    .input(z.object({ threadId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Verificar se já favoritou
      const [existing] = await db
        .select()
        .from(forumThreadFavorites)
        .where(
          and(
            eq(forumThreadFavorites.threadId, input.threadId),
            eq(forumThreadFavorites.usuarioId, ctx.user.id)
          )
        );

      if (existing) {
        // Desfavoritar
        await db
          .delete(forumThreadFavorites)
          .where(
            and(
              eq(forumThreadFavorites.threadId, input.threadId),
              eq(forumThreadFavorites.usuarioId, ctx.user.id)
            )
          );

        return { favorited: false };
      } else {
        // Favoritar
        await db.insert(forumThreadFavorites).values({
          id: randomUUID(),
          threadId: input.threadId,
          usuarioId: ctx.user.id,
        });

        return { favorited: true };
      }
    }),

  /**
   * Registrar visualização
   */
  view: publicProcedure
    .input(z.object({ threadId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Incrementar contador de visualizações
      await db
        .update(forumThreads)
        .set({
          visualizacoes: sql`${forumThreads.visualizacoes} + 1`,
        })
        .where(eq(forumThreads.id, input.threadId));

      return { success: true };
    }),
});


