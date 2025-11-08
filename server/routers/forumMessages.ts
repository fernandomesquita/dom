import { z } from 'zod';
import { eq, desc, and, sql } from 'drizzle-orm';
import { publicProcedure, router, protectedProcedure } from '../_core/trpc';
import { getDb } from '../db';
import {
  forumMessages,
  forumThreads,
  forumMessageUpvotes,
  forumMessageEdits,
  forumModerationQueue,
  forumUserSuspensions,
} from '../../drizzle/schema-forum';
import { users } from '../../drizzle/schema';
import { randomUUID } from 'crypto';
import { TRPCError } from '@trpc/server';
import { verificarConteudo, sanitizarHTML, verificarSuspensao } from '../helpers/moderacao';
import {
  notificarNovaResposta,
  notificarPrimeiraResposta,
  notificarUpvote,
} from '../helpers/forumNotificacoes';

/**
 * Router de Mensagens do Fórum
 */
export const forumMessagesRouter = router({
  /**
   * Listar mensagens de um thread
   */
  list: publicProcedure
    .input(
      z.object({
        threadId: z.string().uuid(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(50),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const offset = (input.page - 1) * input.limit;

      const messages = await db
        .select({
          message: forumMessages,
          autor: {
            id: users.id,
            nome: users.name,
            email: users.email,
          },
        })
        .from(forumMessages)
        .leftJoin(users, eq(forumMessages.autorId, users.id))
        .where(
          and(
            eq(forumMessages.threadId, input.threadId),
            eq(forumMessages.status, 'ativo')
          )
        )
        .orderBy(forumMessages.criadoEm)
        .limit(input.limit)
        .offset(offset);

      // Buscar upvotes do usuário atual (se autenticado)
      let userUpvotes: string[] = [];
      if (ctx?.user) {
        const upvotes = await db
          .select({ mensagemId: forumMessageUpvotes.mensagemId })
          .from(forumMessageUpvotes)
          .where(eq(forumMessageUpvotes.usuarioId, ctx.user.id));

        userUpvotes = upvotes.map((u) => u.mensagemId);
      }

      // Adicionar flag de upvote do usuário
      const messagesWithUpvotes = messages.map((m) => ({
        ...m,
        userUpvoted: userUpvotes.includes(m.message.id),
      }));

      // Contar total
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(forumMessages)
        .where(
          and(
            eq(forumMessages.threadId, input.threadId),
            eq(forumMessages.status, 'ativo')
          )
        );

      return {
        messages: messagesWithUpvotes,
        total: Number(count),
        page: input.page,
        limit: input.limit,
        totalPages: Math.ceil(Number(count) / input.limit),
      };
    }),

  /**
   * Criar nova mensagem
   */
  create: protectedProcedure
    .input(
      z.object({
        threadId: z.string().uuid(),
        conteudo: z.string().min(10),
        mensagemPaiId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Verificar se thread existe e não está locked
      const [thread] = await db
        .select()
        .from(forumThreads)
        .where(eq(forumThreads.id, input.threadId));

      if (!thread) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Thread não encontrado' });
      }

      if (thread.isLocked) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Thread bloqueado' });
      }

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

      // Calcular nível de aninhamento
      let nivelAninhamento = 0;
      if (input.mensagemPaiId) {
        const [pai] = await db
          .select()
          .from(forumMessages)
          .where(eq(forumMessages.id, input.mensagemPaiId));

        if (pai) {
          nivelAninhamento = Math.min(pai.nivelAninhamento + 1, 3); // Máximo 3 níveis
        }
      }

      // Sanitizar conteúdo
      const conteudoSanitizado = sanitizarHTML(input.conteudo);

      // Verificar moderação automática
      const { aprovado, motivosSuspeitos } = verificarConteudo(conteudoSanitizado);

      const id = randomUUID();
      const status = aprovado ? 'ativo' : 'ativo'; // MVP: sem moderação prévia

      await db.insert(forumMessages).values({
        id,
        threadId: input.threadId,
        autorId: ctx.user.id,
        conteudo: conteudoSanitizado,
        mensagemPaiId: input.mensagemPaiId,
        nivelAninhamento,
        status,
      });

      // Se suspeito, adicionar à fila de moderação
      if (!aprovado) {
        await db.insert(forumModerationQueue).values({
          id: randomUUID(),
          tipo: 'mensagem',
          itemId: id,
          autorId: ctx.user.id,
          conteudo: conteudoSanitizado,
          motivoSuspeito: motivosSuspeitos.join(', '),
          status: 'pendente',
        });
      }

      // Atualizar thread (última atividade e total de mensagens)
      await db
        .update(forumThreads)
        .set({
          ultimaAtividade: new Date(),
          totalMensagens: sql`${forumThreads.totalMensagens} + 1`,
        })
        .where(eq(forumThreads.id, input.threadId));

      const [message] = await db
        .select()
        .from(forumMessages)
        .where(eq(forumMessages.id, id));

      // Enviar notificações (não bloquear resposta)
      Promise.all([
        notificarNovaResposta(input.threadId, id, ctx.user.id, conteudoSanitizado),
        notificarPrimeiraResposta(input.threadId, id, ctx.user.id),
      ]).catch((err) => console.error('[Forum] Erro ao enviar notificações:', err));

      return message;
    }),

  /**
   * Atualizar mensagem (autor, até 24h)
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        conteudo: z.string().min(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const [message] = await db
        .select()
        .from(forumMessages)
        .where(eq(forumMessages.id, input.id));

      if (!message) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Mensagem não encontrada' });
      }

      // Verificar permissão
      const isAutor = message.autorId === ctx.user.id;
      const isAdmin = ctx.user.role === 'admin';

      if (!isAutor && !isAdmin) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Sem permissão' });
      }

      // Verificar janela de edição (24h)
      if (isAutor && !isAdmin) {
        const criadoEm = new Date(message.criadoEm);
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

      const conteudoSanitizado = sanitizarHTML(input.conteudo);

      // Salvar histórico
      await db.insert(forumMessageEdits).values({
        id: randomUUID(),
        mensagemId: input.id,
        editorId: ctx.user.id,
        conteudoAntigo: message.conteudo,
        conteudoNovo: conteudoSanitizado,
      });

      // Atualizar
      await db
        .update(forumMessages)
        .set({
          conteudo: conteudoSanitizado,
          editadoEm: new Date(),
        })
        .where(eq(forumMessages.id, input.id));

      const [updated] = await db
        .select()
        .from(forumMessages)
        .where(eq(forumMessages.id, input.id));

      return updated;
    }),

  /**
   * Deletar mensagem (autor ou admin)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid(), motivo: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const [message] = await db
        .select()
        .from(forumMessages)
        .where(eq(forumMessages.id, input.id));

      if (!message) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Mensagem não encontrada' });
      }

      const isAutor = message.autorId === ctx.user.id;
      const isAdmin = ctx.user.role === 'admin';

      if (!isAutor && !isAdmin) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Sem permissão' });
      }

      // Soft delete
      const statusDelecao = isAutor ? 'deletado_por_autor' : 'deletado_por_moderador';

      await db
        .update(forumMessages)
        .set({
          status: statusDelecao,
          deletadoPorId: ctx.user.id,
          motivoDelecao: input.motivo,
        })
        .where(eq(forumMessages.id, input.id));

      // Atualizar contador de mensagens do thread
      await db
        .update(forumThreads)
        .set({
          totalMensagens: sql`${forumThreads.totalMensagens} - 1`,
        })
        .where(eq(forumThreads.id, message.threadId));

      return { success: true };
    }),

  /**
   * Dar/remover upvote
   */
  upvote: protectedProcedure
    .input(z.object({ mensagemId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const [message] = await db
        .select()
        .from(forumMessages)
        .where(eq(forumMessages.id, input.mensagemId));

      if (!message) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Mensagem não encontrada' });
      }

      // Bloquear self-upvote
      if (message.autorId === ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Você não pode dar upvote na sua própria mensagem',
        });
      }

      // Verificar se já deu upvote
      const [existing] = await db
        .select()
        .from(forumMessageUpvotes)
        .where(
          and(
            eq(forumMessageUpvotes.mensagemId, input.mensagemId),
            eq(forumMessageUpvotes.usuarioId, ctx.user.id)
          )
        );

      if (existing) {
        // Remover upvote
        await db
          .delete(forumMessageUpvotes)
          .where(
            and(
              eq(forumMessageUpvotes.mensagemId, input.mensagemId),
              eq(forumMessageUpvotes.usuarioId, ctx.user.id)
            )
          );

        // Decrementar contador
        await db
          .update(forumMessages)
          .set({
            upvotes: sql`${forumMessages.upvotes} - 1`,
          })
          .where(eq(forumMessages.id, input.mensagemId));

        return { upvoted: false, upvotes: message.upvotes - 1 };
      } else {
        // Adicionar upvote
        await db.insert(forumMessageUpvotes).values({
          id: randomUUID(),
          mensagemId: input.mensagemId,
          usuarioId: ctx.user.id,
        });

        // Incrementar contador
        await db
          .update(forumMessages)
          .set({
            upvotes: sql`${forumMessages.upvotes} + 1`,
          })
          .where(eq(forumMessages.id, input.mensagemId));

        // Notificar upvote (marcos: 5, 10, 25, 50, 100)
        notificarUpvote(input.mensagemId, ctx.user.id).catch((err) =>
          console.error('[Forum] Erro ao notificar upvote:', err)
        );

        return { upvoted: true, upvotes: message.upvotes + 1 };
      }
    }),

  /**
   * Marcar como resposta oficial (professor/admin)
   */
  markOfficial: protectedProcedure
    .input(z.object({ mensagemId: z.string().uuid(), isOfficial: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      // Apenas admin pode marcar como oficial (no MVP)
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Apenas administradores podem marcar respostas oficiais',
        });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      await db
        .update(forumMessages)
        .set({ isRespostaOficial: input.isOfficial })
        .where(eq(forumMessages.id, input.mensagemId));

      return { success: true };
    }),
});
