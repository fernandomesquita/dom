import { getDb } from '../db';
import {
  forumThreadFollowers,
  forumThreads,
  forumMessages,
  forumNotifications,
} from '../../drizzle/schema-forum';
import { avisos, avisosVisualizacoes } from '../../drizzle/schema-avisos';
import { users } from '../../drizzle/schema';
import { eq, and, ne } from 'drizzle-orm';
import { emitToUser } from '../_core/socket';

/**
 * Helper de Notificações do Fórum
 * Integração com Sistema de Avisos
 */

/**
 * Notificar seguidores de uma thread sobre nova resposta
 */
export async function notificarNovaResposta(
  threadId: string,
  mensagemId: string,
  autorId: string,
  conteudoPreview: string
) {
  const db = await getDb();
  if (!db) return;

  try {
    // Buscar thread
    const [thread] = await db
      .select()
      .from(forumThreads)
      .where(eq(forumThreads.id, threadId))
      .limit(1);

    if (!thread) return;

    // Buscar seguidores (exceto o autor da resposta)
    const followers = await db
      .select({
        usuarioId: forumThreadFollowers.usuarioId,
      })
      .from(forumThreadFollowers)
      .where(
        and(
          eq(forumThreadFollowers.threadId, threadId),
          ne(forumThreadFollowers.usuarioId, autorId)
        )
      );

    if (followers.length === 0) return;

    // Buscar dados do autor
    const [autor] = await db
      .select()
      .from(users)
      .where(eq(users.id, autorId))
      .limit(1);

    const autorNome = autor?.name || 'Alguém';

    // Criar aviso no Sistema de Avisos
    const tituloAviso = `Nova resposta em "${thread.titulo}"`;
    const conteudoAviso = `${autorNome} respondeu: ${conteudoPreview.substring(0, 100)}...`;
    const linkAviso = `/forum/thread/${threadId}#msg-${mensagemId}`;

    const [avisoResult] = await db
      .insert(avisos)
      .values({
        tipo: 'informacao',
        titulo: tituloAviso,
        conteudo: conteudoAviso,
        link: linkAviso,
        linkTexto: 'Ver resposta',
        isDismissavel: true,
        criadoPor: autorId,
      })
      .$returningId();

    const avisoId = avisoResult.id;

    // Criar notificação para cada seguidor
    const notificacoesPromises = followers.map(async (follower) => {
      // Criar entrada no Sistema de Avisos
      await db.insert(avisosVisualizacoes).values({
        avisoId,
        alunoId: follower.usuarioId,
      });

      // Criar notificação do fórum
      await db.insert(forumNotifications).values({
        usuarioId: follower.usuarioId,
        tipo: 'nova_resposta',
        threadId,
        mensagemId,
        remetenteId: autorId,
        conteudo: conteudoAviso,
        avisoId,
      });

      // Emitir evento WebSocket
      emitToUser(follower.usuarioId, 'novoAviso', {
        tipo: 'informacao',
        titulo: tituloAviso,
        conteudo: conteudoAviso,
      });
    });

    await Promise.all(notificacoesPromises);

    console.log(
      `[Forum] Notificados ${followers.length} seguidores sobre nova resposta na thread ${threadId}`
    );
  } catch (error) {
    console.error('[Forum] Erro ao notificar seguidores:', error);
  }
}

/**
 * Notificar autor quando sua thread recebe primeira resposta
 */
export async function notificarPrimeiraResposta(
  threadId: string,
  mensagemId: string,
  autorRespostaId: string
) {
  const db = await getDb();
  if (!db) return;

  try {
    // Buscar thread
    const [thread] = await db
      .select()
      .from(forumThreads)
      .where(eq(forumThreads.id, threadId))
      .limit(1);

    if (!thread) return;

    // Não notificar se o autor da resposta é o mesmo da thread
    if (thread.autorId === autorRespostaId) return;

    // Verificar se é a primeira resposta
    if (thread.totalMensagens > 1) return;

    // Buscar dados do autor da resposta
    const [autorResposta] = await db
      .select()
      .from(users)
      .where(eq(users.id, autorRespostaId))
      .limit(1);

    const autorNome = autorResposta?.name || 'Alguém';

    // Criar aviso
    const tituloAviso = `Sua discussão recebeu uma resposta!`;
    const conteudoAviso = `${autorNome} respondeu sua discussão "${thread.titulo}"`;
    const linkAviso = `/forum/thread/${threadId}#msg-${mensagemId}`;

    const [avisoResult] = await db
      .insert(avisos)
      .values({
        tipo: 'sucesso',
        titulo: tituloAviso,
        conteudo: conteudoAviso,
        link: linkAviso,
        linkTexto: 'Ver resposta',
        isDismissavel: true,
        criadoPor: autorRespostaId,
      })
      .$returningId();

    const avisoId = avisoResult.id;

    // Criar entrada para o autor da thread
    await db.insert(avisosVisualizacoes).values({
      avisoId,
      alunoId: thread.autorId,
    });

    // Criar notificação do fórum
    await db.insert(forumNotifications).values({
      usuarioId: thread.autorId,
      tipo: 'primeira_resposta',
      threadId,
      mensagemId,
      remetenteId: autorRespostaId,
      conteudo: conteudoAviso,
      avisoId,
    });

    // Emitir evento WebSocket
    emitToUser(thread.autorId, 'novoAviso', {
      tipo: 'sucesso',
      titulo: tituloAviso,
      conteudo: conteudoAviso,
    });

    console.log(
      `[Forum] Notificado autor da thread ${threadId} sobre primeira resposta`
    );
  } catch (error) {
    console.error('[Forum] Erro ao notificar primeira resposta:', error);
  }
}

/**
 * Notificar usuário quando recebe upvote
 */
export async function notificarUpvote(
  mensagemId: string,
  usuarioQueDeUpvote: string
) {
  const db = await getDb();
  if (!db) return;

  try {
    // Buscar mensagem
    const [mensagem] = await db
      .select()
      .from(forumMessages)
      .where(eq(forumMessages.id, mensagemId))
      .limit(1);

    if (!mensagem) return;

    // Não notificar se o usuário deu upvote em si mesmo (não deveria acontecer)
    if (mensagem.autorId === usuarioQueDeUpvote) return;

    // Buscar thread
    const [thread] = await db
      .select()
      .from(forumThreads)
      .where(eq(forumThreads.id, mensagem.threadId))
      .limit(1);

    if (!thread) return;

    // Buscar dados do usuário que deu upvote
    const [usuario] = await db
      .select()
      .from(users)
      .where(eq(users.id, usuarioQueDeUpvote))
      .limit(1);

    const usuarioNome = usuario?.name || 'Alguém';

    // Criar aviso (apenas se atingir marcos: 5, 10, 25, 50, 100 upvotes)
    const marcos = [5, 10, 25, 50, 100];
    if (!marcos.includes(mensagem.upvotes)) return;

    const tituloAviso = `Sua resposta atingiu ${mensagem.upvotes} upvotes!`;
    const conteudoAviso = `Parabéns! Sua resposta em "${thread.titulo}" está ajudando muitas pessoas.`;
    const linkAviso = `/forum/thread/${thread.id}#msg-${mensagemId}`;

    const [avisoResult] = await db
      .insert(avisos)
      .values({
        tipo: 'sucesso',
        titulo: tituloAviso,
        conteudo: conteudoAviso,
        link: linkAviso,
        linkTexto: 'Ver resposta',
        isDismissavel: true,
        criadoPor: usuarioQueDeUpvote,
      })
      .$returningId();

    const avisoId = avisoResult.id;

    // Criar entrada para o autor da mensagem
    await db.insert(avisosVisualizacoes).values({
      avisoId,
      alunoId: mensagem.autorId,
    });

    // Criar notificação do fórum
    await db.insert(forumNotifications).values({
      usuarioId: mensagem.autorId,
      tipo: 'upvote_marco',
      threadId: thread.id,
      mensagemId,
      remetenteId: usuarioQueDeUpvote,
      conteudo: conteudoAviso,
      avisoId,
    });

    // Emitir evento WebSocket
    emitToUser(mensagem.autorId, 'novoAviso', {
      tipo: 'sucesso',
      titulo: tituloAviso,
      conteudo: conteudoAviso,
    });

    console.log(
      `[Forum] Notificado autor da mensagem ${mensagemId} sobre marco de ${mensagem.upvotes} upvotes`
    );
  } catch (error) {
    console.error('[Forum] Erro ao notificar upvote:', error);
  }
}
