import {
  mysqlTable,
  varchar,
  text,
  int,
  timestamp,
  boolean,
  json,
  index,
  unique,
  mysqlEnum,
} from 'drizzle-orm/mysql-core';
import { users } from './schema';

/**
 * Schema do Módulo de Fórum - DOM V4
 * MVP - Fase 1
 */

// ==================== CATEGORIAS ====================

export const forumCategories = mysqlTable(
  'forum_categories',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    nome: varchar('nome', { length: 100 }).notNull(),
    descricao: text('descricao'),
    icone: varchar('icone', { length: 50 }), // emoji ou nome de ícone
    cor: varchar('cor', { length: 7 }), // hex color (#FF5733)
    ordem: int('ordem').notNull().default(0),
    tipoEara: mysqlEnum('tipoEara', ['ESTUDO', 'APLICACAO', 'REVISAO', 'ADAPTACAO']),
    isAtiva: boolean('is_ativa').default(true),
    criadoEm: timestamp('criado_em').defaultNow().notNull(),
    atualizadoEm: timestamp('atualizado_em').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    ordemIdx: index('idx_categories_ordem').on(table.ordem),
    ativaIdx: index('idx_categories_ativa').on(table.isAtiva),
  })
);

// ==================== THREADS ====================

export const forumThreads = mysqlTable(
  'forum_threads',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    titulo: varchar('titulo', { length: 200 }).notNull(),
    conteudo: text('conteudo').notNull(), // JSON stringificado do rich text
    autorId: varchar('autor_id', { length: 36 }).notNull(),
    categoriaId: varchar('categoria_id', { length: 36 }).notNull(),
    tags: json('tags').$type<string[]>(), // array de strings
    isPinned: boolean('is_pinned').default(false),
    isLocked: boolean('is_locked').default(false),
    visualizacoes: int('visualizacoes').default(0),
    totalMensagens: int('total_mensagens').default(0),
    ultimaAtividade: timestamp('ultima_atividade').defaultNow().notNull(),
    criadoEm: timestamp('criado_em').defaultNow().notNull(),
    editadoEm: timestamp('editado_em'),
    status: mysqlEnum('status', ['ativo', 'arquivado', 'deletado']).default('ativo'),
    deletadoPorId: varchar('deletado_por_id', { length: 36 }),
    motivoDelecao: text('motivo_delecao'),
  },
  (table) => ({
    autorIdx: index('idx_threads_autor').on(table.autorId),
    categoriaIdx: index('idx_threads_categoria').on(table.categoriaId),
    ultimaAtividadeIdx: index('idx_threads_ultima_atividade').on(table.ultimaAtividade),
    statusIdx: index('idx_threads_status').on(table.status),
    criadoEmIdx: index('idx_threads_criado_em').on(table.criadoEm),
  })
);

// ==================== MENSAGENS ====================

export const forumMessages = mysqlTable(
  'forum_messages',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    threadId: varchar('thread_id', { length: 36 }).notNull(),
    autorId: varchar('autor_id', { length: 36 }).notNull(),
    conteudo: text('conteudo').notNull(), // JSON stringificado do rich text
    mensagemPaiId: varchar('mensagem_pai_id', { length: 36 }), // para respostas aninhadas
    nivelAninhamento: int('nivel_aninhamento').default(0), // 0, 1, 2, 3 (máx)
    upvotes: int('upvotes').default(0),
    criadoEm: timestamp('criado_em').defaultNow().notNull(),
    editadoEm: timestamp('editado_em'),
    status: mysqlEnum('status', [
      'ativo',
      'pendente_moderacao',
      'deletado',
      'deletado_por_autor',
      'deletado_por_moderador',
    ]).default('ativo'),
    motivoDelecao: text('motivo_delecao'),
    moderadorId: varchar('moderador_id', { length: 36 }),
    isRespostaOficial: boolean('is_resposta_oficial').default(false), // para professores/mentores
    deletadoPorId: varchar('deletado_por_id', { length: 36 }),
  },
  (table) => ({
    threadIdx: index('idx_messages_thread').on(table.threadId, table.criadoEm),
    autorIdx: index('idx_messages_autor').on(table.autorId),
    paiIdx: index('idx_messages_pai').on(table.mensagemPaiId),
    statusIdx: index('idx_messages_status').on(table.status),
    criadoEmIdx: index('idx_messages_criado_em').on(table.criadoEm),
  })
);

// ==================== HISTÓRICO DE EDIÇÕES ====================

export const forumMessageEdits = mysqlTable(
  'forum_message_edits',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    mensagemId: varchar('mensagem_id', { length: 36 }).notNull(),
    editorId: varchar('editor_id', { length: 36 }).notNull(),
    conteudoAntigo: text('conteudo_antigo').notNull(),
    conteudoNovo: text('conteudo_novo').notNull(),
    editadoEm: timestamp('editado_em').defaultNow().notNull(),
  },
  (table) => ({
    mensagemIdx: index('idx_msg_edits_msg').on(table.mensagemId, table.editadoEm),
  })
);

export const forumThreadEdits = mysqlTable(
  'forum_thread_edits',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    threadId: varchar('thread_id', { length: 36 }).notNull(),
    editorId: varchar('editor_id', { length: 36 }).notNull(),
    tituloAntigo: varchar('titulo_antigo', { length: 200 }),
    tituloNovo: varchar('titulo_novo', { length: 200 }),
    conteudoAntigo: text('conteudo_antigo'),
    conteudoNovo: text('conteudo_novo'),
    editadoEm: timestamp('editado_em').defaultNow().notNull(),
  },
  (table) => ({
    threadIdx: index('idx_thread_edits_thread').on(table.threadId, table.editadoEm),
  })
);

// ==================== INTERAÇÕES ====================

export const forumMessageUpvotes = mysqlTable(
  'forum_message_upvotes',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    mensagemId: varchar('mensagem_id', { length: 36 }).notNull(),
    usuarioId: varchar('usuario_id', { length: 36 }).notNull(),
    criadoEm: timestamp('criado_em').defaultNow().notNull(),
  },
  (table) => ({
    mensagemIdx: index('idx_upvotes_mensagem').on(table.mensagemId),
    usuarioIdx: index('idx_upvotes_usuario').on(table.usuarioId),
    uniqueUpvote: unique('unique_upvote').on(table.mensagemId, table.usuarioId),
  })
);

export const forumThreadFollowers = mysqlTable(
  'forum_thread_followers',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    threadId: varchar('thread_id', { length: 36 }).notNull(),
    usuarioId: varchar('usuario_id', { length: 36 }).notNull(),
    criadoEm: timestamp('criado_em').defaultNow().notNull(),
  },
  (table) => ({
    threadIdx: index('idx_followers_thread').on(table.threadId),
    usuarioIdx: index('idx_followers_usuario').on(table.usuarioId),
    uniqueFollow: unique('unique_follow').on(table.threadId, table.usuarioId),
  })
);

export const forumThreadFavorites = mysqlTable(
  'forum_thread_favorites',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    threadId: varchar('thread_id', { length: 36 }).notNull(),
    usuarioId: varchar('usuario_id', { length: 36 }).notNull(),
    criadoEm: timestamp('criado_em').defaultNow().notNull(),
  },
  (table) => ({
    usuarioIdx: index('idx_favorites_usuario').on(table.usuarioId, table.criadoEm),
    uniqueFavorite: unique('unique_favorite').on(table.threadId, table.usuarioId),
  })
);

// ==================== NOTIFICAÇÕES ====================

export const forumNotifications = mysqlTable(
  'forum_notifications',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    usuarioId: varchar('usuario_id', { length: 36 }).notNull(),
    tipo: mysqlEnum('tipo', [
      'resposta_thread',
      'resposta_mensagem',
      'mencao',
      'upvote_milestone',
      'thread_popular',
      'badge_conquistado',
      'nivel_alcancado',
      'atividade_thread_seguido',
    ]).notNull(),
    threadId: varchar('thread_id', { length: 36 }).notNull(),
    mensagemId: varchar('mensagem_id', { length: 36 }),
    remetenteId: varchar('remetente_id', { length: 36 }),
    conteudo: text('conteudo').notNull(),
    isLida: boolean('is_lida').default(false),
    criadoEm: timestamp('criado_em').defaultNow().notNull(),
    avisoId: varchar('aviso_id', { length: 36 }), // Link com Sistema de Avisos
  },
  (table) => ({
    usuarioIdx: index('idx_notifications_usuario').on(
      table.usuarioId,
      table.isLida,
      table.criadoEm
    ),
    tipoIdx: index('idx_notifications_tipo').on(table.tipo),
  })
);

// ==================== MODERAÇÃO ====================

export const forumModerationQueue = mysqlTable(
  'forum_moderation_queue',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    tipo: mysqlEnum('tipo', ['thread', 'mensagem']).notNull(),
    itemId: varchar('item_id', { length: 36 }).notNull(), // thread_id ou mensagem_id
    autorId: varchar('autor_id', { length: 36 }).notNull(),
    conteudo: text('conteudo').notNull(),
    motivoSuspeito: text('motivo_suspeito').notNull(), // links, emails, telefones, etc
    status: mysqlEnum('status', ['pendente', 'aprovado', 'rejeitado']).default('pendente'),
    moderadorId: varchar('moderador_id', { length: 36 }),
    motivoHumano: text('motivo_humano'), // motivo da decisão do moderador
    criadoEm: timestamp('criado_em').defaultNow().notNull(),
    processadoEm: timestamp('processado_em'),
  },
  (table) => ({
    statusIdx: index('idx_moderation_status').on(table.status),
    autorIdx: index('idx_moderation_autor').on(table.autorId),
    criadoEmIdx: index('idx_moderation_criado_em').on(table.criadoEm),
  })
);

export const forumUserSuspensions = mysqlTable(
  'forum_user_suspensions',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    usuarioId: varchar('usuario_id', { length: 36 }).notNull(),
    moderadorId: varchar('moderador_id', { length: 36 }).notNull(),
    motivo: text('motivo').notNull(),
    diasSuspensao: int('dias_suspensao').notNull(), // 1, 7, 30
    inicioSuspensao: timestamp('inicio_suspensao').defaultNow().notNull(),
    fimSuspensao: timestamp('fim_suspensao').notNull(),
    isAtiva: boolean('is_ativa').default(true),
    criadoEm: timestamp('criado_em').defaultNow().notNull(),
  },
  (table) => ({
    usuarioIdx: index('idx_suspensions_usuario').on(table.usuarioId),
    ativaIdx: index('idx_suspensions_ativa').on(table.isAtiva),
    fimIdx: index('idx_suspensions_fim').on(table.fimSuspensao),
  })
);

// ==================== WHITELIST DE DOMÍNIOS ====================

export const forumDomainWhitelist = mysqlTable('forum_domain_whitelist', {
  id: varchar('id', { length: 36 }).primaryKey(),
  dominio: varchar('dominio', { length: 255 }).notNull().unique(),
  adicionadoPorId: varchar('adicionado_por_id', { length: 36 }).notNull(),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
});

// ==================== TYPES ====================

export type ForumCategory = typeof forumCategories.$inferSelect;
export type InsertForumCategory = typeof forumCategories.$inferInsert;

export type ForumThread = typeof forumThreads.$inferSelect;
export type InsertForumThread = typeof forumThreads.$inferInsert;

export type ForumMessage = typeof forumMessages.$inferSelect;
export type InsertForumMessage = typeof forumMessages.$inferInsert;

export type ForumMessageEdit = typeof forumMessageEdits.$inferSelect;
export type ForumThreadEdit = typeof forumThreadEdits.$inferSelect;

export type ForumMessageUpvote = typeof forumMessageUpvotes.$inferSelect;
export type ForumThreadFollower = typeof forumThreadFollowers.$inferSelect;
export type ForumThreadFavorite = typeof forumThreadFavorites.$inferSelect;

export type ForumNotification = typeof forumNotifications.$inferSelect;
export type InsertForumNotification = typeof forumNotifications.$inferInsert;

export type ForumModerationQueueItem = typeof forumModerationQueue.$inferSelect;
export type InsertForumModerationQueueItem = typeof forumModerationQueue.$inferInsert;

export type ForumUserSuspension = typeof forumUserSuspensions.$inferSelect;
export type InsertForumUserSuspension = typeof forumUserSuspensions.$inferInsert;

export type ForumDomainWhitelist = typeof forumDomainWhitelist.$inferSelect;
