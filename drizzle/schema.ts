import {
  boolean,
  date,
  datetime,
  decimal,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

/**
 * Sistema DOM - Schema do Banco de Dados MySQL 8.0+
 * 
 * IMPORTANTE: Este sistema usa AUTENTICAÇÃO SIMPLES (email + senha)
 * NÃO usa OAuth. Todas as referências a OAuth foram removidas.
 */

// ============================================================================
// 1. USUÁRIOS E AUTENTICAÇÃO
// ============================================================================

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  nomeCompleto: varchar("nome_completo", { length: 255 }).notNull(),
  cpf: varchar("cpf", { length: 14 }).unique(), // OPCIONAL (LGPD)
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  passwordVersion: int("password_version").default(1).notNull(), // Para migração futura
  dataNascimento: date("data_nascimento").notNull(),
  emailVerificado: boolean("email_verificado").default(false).notNull(),
  role: mysqlEnum("role", ["ALUNO", "ADMIN"]).default("ALUNO").notNull(),
  avatarUrl: varchar("avatar_url", { length: 500 }),
  telefone: varchar("telefone", { length: 20 }),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  emailIdx: index("idx_email").on(table.email),
  cpfIdx: index("idx_cpf").on(table.cpf),
  roleIdx: index("idx_role").on(table.role),
  ativoIdx: index("idx_ativo").on(table.ativo),
}));

export const tokens = mysqlTable("tokens", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  token: varchar("token", { length: 500 }).notNull().unique(),
  type: mysqlEnum("type", ["EMAIL_VERIFICATION", "PASSWORD_RESET"]).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("idx_user_id").on(table.userId),
  tokenIdx: index("idx_token").on(table.token),
  expiresIdx: index("idx_expires").on(table.expiresAt),
}));

export const refreshTokens = mysqlTable("refresh_tokens", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(), // SHA-256
  expiresAt: timestamp("expires_at").notNull(),
  revoked: boolean("revoked").default(false).notNull(),
  dispositivoId: varchar("dispositivo_id", { length: 255 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("idx_user_id").on(table.userId),
  tokenHashIdx: uniqueIndex("idx_token_hash").on(table.tokenHash),
  expiresIdx: index("idx_expires").on(table.expiresAt),
}));

// ============================================================================
// 2. PLANOS E PAGAMENTOS (PAGAR.ME)
// ============================================================================

export const planos = mysqlTable("planos", {
  id: varchar("id", { length: 36 }).primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull(),
  descricao: text("descricao"),
  preco: decimal("preco", { precision: 10, scale: 2 }).notNull(),
  duracaoMeses: int("duracao_meses").notNull(),
  recursos: json("recursos").notNull(),
  ativo: boolean("ativo").default(true).notNull(),
  destaque: boolean("destaque").default(false).notNull(),
  ordem: int("ordem").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  ativoIdx: index("idx_ativo").on(table.ativo),
  ordemIdx: index("idx_ordem").on(table.ordem),
}));

export const assinaturas = mysqlTable("assinaturas", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  planoId: varchar("plano_id", { length: 36 }).notNull(),
  status: mysqlEnum("status", ["ATIVA", "CANCELADA", "EXPIRADA", "SUSPENSA", "PENDENTE"]).default("PENDENTE").notNull(),
  dataInicio: date("data_inicio").notNull(),
  dataFim: date("data_fim").notNull(),
  renovacaoAutomatica: boolean("renovacao_automatica").default(true).notNull(),
  pagarmeSubscriptionId: varchar("pagarme_subscription_id", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("idx_user_id").on(table.userId),
  planoIdIdx: index("idx_plano_id").on(table.planoId),
  statusIdx: index("idx_status").on(table.status),
  dataFimIdx: index("idx_data_fim").on(table.dataFim),
  pagarmeSubIdx: index("idx_pagarme_sub").on(table.pagarmeSubscriptionId),
}));

export const pagamentos = mysqlTable("pagamentos", {
  id: varchar("id", { length: 36 }).primaryKey(),
  assinaturaId: varchar("assinatura_id", { length: 36 }).notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  valor: decimal("valor", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["PENDENTE", "PAGO", "CANCELADO", "ESTORNADO", "FALHOU"]).default("PENDENTE").notNull(),
  metodoPagamento: mysqlEnum("metodo_pagamento", ["CREDIT_CARD", "BOLETO", "PIX"]).notNull(),
  pagarmeTransactionId: varchar("pagarme_transaction_id", { length: 100 }),
  pagarmeChargeId: varchar("pagarme_charge_id", { length: 100 }),
  dataVencimento: date("data_vencimento"),
  dataPagamento: timestamp("data_pagamento"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  assinaturaIdIdx: index("idx_assinatura_id").on(table.assinaturaId),
  userIdIdx: index("idx_user_id").on(table.userId),
  statusIdx: index("idx_status").on(table.status),
  pagarmeTransactionIdx: index("idx_pagarme_transaction").on(table.pagarmeTransactionId),
  pagarmeChargeIdx: index("idx_pagarme_charge").on(table.pagarmeChargeId),
}));

export const webhooksPagarme = mysqlTable("webhooks_pagarme", {
  id: varchar("id", { length: 36 }).primaryKey(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  eventId: varchar("event_id", { length: 100 }).notNull(),
  payload: json("payload").notNull(),
  processed: boolean("processed").default(false).notNull(),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
}, (table) => ({
  eventTypeIdx: index("idx_event_type").on(table.eventType),
  eventIdIdx: index("idx_event_id").on(table.eventId),
  processedIdx: index("idx_processed").on(table.processed),
  createdAtIdx: index("idx_created_at").on(table.createdAt),
}));

// ============================================================================
// 3. ÁRVORE DE CONHECIMENTO (ESTRUTURA DO CURSO - ADMIN ONLY)
// ============================================================================

export const disciplinas = mysqlTable("disciplinas", {
  id: varchar("id", { length: 36 }).primaryKey(),
  codigo: varchar("codigo", { length: 20 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  nome: varchar("nome", { length: 100 }).notNull(),
  descricao: text("descricao"),
  corHex: varchar("cor_hex", { length: 7 }).default("#4F46E5").notNull(),
  icone: varchar("icone", { length: 50 }),
  sortOrder: int("sort_order").default(0).notNull(),
  ativo: boolean("ativo").default(true).notNull(),
  createdBy: varchar("created_by", { length: 36 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  codigoIdx: uniqueIndex("idx_disciplinas_codigo").on(table.codigo),
  slugIdx: uniqueIndex("idx_disciplinas_slug").on(table.slug),
  ativoSortIdx: index("idx_disciplinas_ativo_sort").on(table.ativo, table.sortOrder),
  nomeIdx: index("idx_disciplinas_nome").on(table.nome),
}));

export const assuntos = mysqlTable("assuntos", {
  id: varchar("id", { length: 36 }).primaryKey(),
  disciplinaId: varchar("disciplina_id", { length: 36 }).notNull(),
  codigo: varchar("codigo", { length: 20 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  nome: varchar("nome", { length: 150 }).notNull(),
  descricao: text("descricao"),
  sortOrder: int("sort_order").default(0).notNull(),
  ativo: boolean("ativo").default(true).notNull(),
  createdBy: varchar("created_by", { length: 36 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  disciplinaIdIdx: index("idx_assuntos_disciplina").on(table.disciplinaId),
  disciplinaCodigoIdx: uniqueIndex("idx_assuntos_disciplina_codigo").on(table.disciplinaId, table.codigo),
  disciplinaSlugIdx: uniqueIndex("idx_assuntos_disciplina_slug").on(table.disciplinaId, table.slug),
  disciplinaSortIdx: index("idx_assuntos_disciplina_sort").on(table.disciplinaId, table.sortOrder),
  nomeIdx: index("idx_assuntos_nome").on(table.nome),
}));

export const topicos = mysqlTable("topicos", {
  id: varchar("id", { length: 36 }).primaryKey(),
  assuntoId: varchar("assunto_id", { length: 36 }).notNull(),
  disciplinaId: varchar("disciplina_id", { length: 36 }).notNull(),
  codigo: varchar("codigo", { length: 20 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  nome: varchar("nome", { length: 200 }).notNull(),
  descricao: text("descricao"),
  sortOrder: int("sort_order").default(0).notNull(),
  ativo: boolean("ativo").default(true).notNull(),
  createdBy: varchar("created_by", { length: 36 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  assuntoIdIdx: index("idx_topicos_assunto").on(table.assuntoId),
  disciplinaIdIdx: index("idx_topicos_disciplina").on(table.disciplinaId),
  assuntoCodigoIdx: uniqueIndex("idx_topicos_assunto_codigo").on(table.assuntoId, table.codigo),
  assuntoSlugIdx: uniqueIndex("idx_topicos_assunto_slug").on(table.assuntoId, table.slug),
  assuntoSortIdx: index("idx_topicos_assunto_sort").on(table.assuntoId, table.sortOrder),
  nomeIdx: index("idx_topicos_nome").on(table.nome),
}));

// ============================================================================
// 4. MATERIAIS (COM DRM)
// ============================================================================

export const materiais = mysqlTable("materiais", {
  id: varchar("id", { length: 36 }).primaryKey(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  tipo: mysqlEnum("tipo", ["PDF", "VIDEO", "AUDIO", "LINK"]).notNull(),
  disciplinaId: varchar("disciplina_id", { length: 36 }).notNull(),
  assuntoId: varchar("assunto_id", { length: 36 }),
  topicoId: varchar("topico_id", { length: 36 }),
  urlArquivo: varchar("url_arquivo", { length: 500 }),
  fileKey: varchar("file_key", { length: 500 }),
  duracao: int("duracao"), // em segundos
  tamanho: int("tamanho"), // em bytes
  mimeType: varchar("mime_type", { length: 100 }),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  disciplinaIdIdx: index("idx_disciplina_id").on(table.disciplinaId),
  assuntoIdIdx: index("idx_assunto_id").on(table.assuntoId),
  topicoIdIdx: index("idx_topico_id").on(table.topicoId),
  ativoIdx: index("idx_ativo").on(table.ativo),
}));

export const materiaisAcessos = mysqlTable("materiais_acessos", {
  id: varchar("id", { length: 36 }).primaryKey(),
  materialId: varchar("material_id", { length: 36 }).notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  dispositivoId: varchar("dispositivo_id", { length: 255 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  materialIdIdx: index("idx_material_id").on(table.materialId),
  userIdIdx: index("idx_user_id").on(table.userId),
  createdAtIdx: index("idx_created_at").on(table.createdAt),
}));

export const materiaisEstudados = mysqlTable("materiais_estudados", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  materialId: varchar("material_id", { length: 36 }).notNull(),
  progresso: int("progresso").default(0).notNull(), // 0-100
  tempoEstudo: int("tempo_estudo").default(0).notNull(), // em segundos
  ultimaVisualizacao: timestamp("ultima_visualizacao").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("idx_user_id").on(table.userId),
  materialIdIdx: index("idx_material_id").on(table.materialId),
  userMaterialIdx: uniqueIndex("idx_user_material").on(table.userId, table.materialId),
}));

// ============================================================================
// 5. QUESTÕES
// ============================================================================

export const questoes = mysqlTable("questoes", {
  id: varchar("id", { length: 36 }).primaryKey(),
  enunciado: text("enunciado").notNull(),
  alternativas: json("alternativas").notNull(), // [{letra: 'A', texto: '...'}]
  gabarito: varchar("gabarito", { length: 1 }).notNull(),
  disciplinaId: varchar("disciplina_id", { length: 36 }).notNull(),
  assuntoId: varchar("assunto_id", { length: 36 }),
  topicoId: varchar("topico_id", { length: 36 }),
  banca: varchar("banca", { length: 100 }),
  ano: int("ano"),
  dificuldade: mysqlEnum("dificuldade", ["FACIL", "MEDIO", "DIFICIL"]),
  explicacao: text("explicacao"),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  disciplinaIdIdx: index("idx_disciplina_id").on(table.disciplinaId),
  assuntoIdIdx: index("idx_assunto_id").on(table.assuntoId),
  topicoIdIdx: index("idx_topico_id").on(table.topicoId),
  bancaIdx: index("idx_banca").on(table.banca),
  anoIdx: index("idx_ano").on(table.ano),
  dificuldadeIdx: index("idx_dificuldade").on(table.dificuldade),
  ativoIdx: index("idx_ativo").on(table.ativo),
}));

export const questoesResolvidas = mysqlTable("questoes_resolvidas", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  questaoId: varchar("questao_id", { length: 36 }).notNull(),
  resposta: varchar("resposta", { length: 1 }).notNull(),
  correta: boolean("correta").notNull(),
  tempoResolucao: int("tempo_resolucao"), // em segundos
  dataResolucao: timestamp("data_resolucao").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("idx_user_id").on(table.userId),
  questaoIdIdx: index("idx_questao_id").on(table.questaoId),
  dataResolucaoIdx: index("idx_data_resolucao").on(table.dataResolucao),
}));

// ============================================================================
// 6. AVISOS/NOTICES
// ============================================================================

export const notices = mysqlTable("notices", {
  id: varchar("id", { length: 36 }).primaryKey(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  conteudo: text("conteudo").notNull(),
  tipo: mysqlEnum("tipo", ["INFO", "ALERTA", "URGENTE"]).default("INFO").notNull(),
  publicado: boolean("publicado").default(false).notNull(),
  dataPublicacao: timestamp("data_publicacao"),
  createdBy: varchar("created_by", { length: 36 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  publicadoIdx: index("idx_publicado").on(table.publicado),
  dataPublicacaoIdx: index("idx_data_publicacao").on(table.dataPublicacao),
}));

// ============================================================================
// 7. FÓRUM
// ============================================================================

export const forumTopicos = mysqlTable("forum_topicos", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  conteudo: text("conteudo").notNull(),
  disciplinaId: varchar("disciplina_id", { length: 36 }),
  visualizacoes: int("visualizacoes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("idx_user_id").on(table.userId),
  disciplinaIdIdx: index("idx_disciplina_id").on(table.disciplinaId),
  createdAtIdx: index("idx_created_at").on(table.createdAt),
}));

export const forumRespostas = mysqlTable("forum_respostas", {
  id: varchar("id", { length: 36 }).primaryKey(),
  topicoId: varchar("topico_id", { length: 36 }).notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  conteudo: text("conteudo").notNull(),
  melhorResposta: boolean("melhor_resposta").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  topicoIdIdx: index("idx_topico_id").on(table.topicoId),
  userIdIdx: index("idx_user_id").on(table.userId),
  createdAtIdx: index("idx_created_at").on(table.createdAt),
}));

// ============================================================================
// 8. METAS E CRONOGRAMA
// ============================================================================

export const metas = mysqlTable("metas", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  tipo: mysqlEnum("tipo", ["QUESTOES", "MATERIAIS", "HORAS"]).notNull(),
  valorAlvo: int("valor_alvo").notNull(),
  valorAtual: int("valor_atual").default(0).notNull(),
  prazo: date("prazo").notNull(),
  concluida: boolean("concluida").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("idx_user_id").on(table.userId),
  prazoIdx: index("idx_prazo").on(table.prazo),
  concluidaIdx: index("idx_concluida").on(table.concluida),
}));

export const cronograma = mysqlTable("cronograma", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  data: date("data").notNull(),
  atividade: varchar("atividade", { length: 255 }).notNull(),
  tipo: mysqlEnum("tipo", ["ESTUDO", "QUESTOES", "REVISAO"]).notNull(),
  disciplinaId: varchar("disciplina_id", { length: 36 }),
  concluido: boolean("concluido").default(false).notNull(),
  tempoPlanejado: int("tempo_planejado"), // em minutos
  tempoRealizado: int("tempo_realizado"), // em minutos
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("idx_user_id").on(table.userId),
  dataIdx: index("idx_data").on(table.data),
  disciplinaIdIdx: index("idx_disciplina_id").on(table.disciplinaId),
  concluidoIdx: index("idx_concluido").on(table.concluido),
}));

// ============================================================================
// 9. ESTATÍSTICAS E GAMIFICAÇÃO
// ============================================================================

export const estatisticasDiarias = mysqlTable("estatisticas_diarias", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  data: date("data").notNull(),
  questoesResolvidas: int("questoes_resolvidas").default(0).notNull(),
  questoesCorretas: int("questoes_corretas").default(0).notNull(),
  tempoEstudo: int("tempo_estudo").default(0).notNull(), // em minutos
  materiaisEstudados: int("materiais_estudados").default(0).notNull(),
  streakAtivo: boolean("streak_ativo").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("idx_user_id").on(table.userId),
  dataIdx: index("idx_data").on(table.data),
  userDataIdx: uniqueIndex("idx_user_data").on(table.userId, table.data),
}));

export const streakQuestoes = mysqlTable("streak_questoes", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().unique(),
  streakAtual: int("streak_atual").default(0).notNull(),
  melhorStreak: int("melhor_streak").default(0).notNull(),
  ultimaData: date("ultima_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: uniqueIndex("idx_user_id").on(table.userId),
}));

export const progressoDisciplinas = mysqlTable("progresso_disciplinas", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  disciplinaId: varchar("disciplina_id", { length: 36 }).notNull(),
  nivelDominio: int("nivel_dominio").default(0).notNull(), // 0-100
  questoesResolvidas: int("questoes_resolvidas").default(0).notNull(),
  questoesCorretas: int("questoes_corretas").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("idx_user_id").on(table.userId),
  disciplinaIdIdx: index("idx_disciplina_id").on(table.disciplinaId),
  userDisciplinaIdx: uniqueIndex("idx_user_disciplina").on(table.userId, table.disciplinaId),
}));

export const progressoAssuntos = mysqlTable("progresso_assuntos", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  assuntoId: varchar("assunto_id", { length: 36 }).notNull(),
  nivelDominio: int("nivel_dominio").default(0).notNull(), // 0-100
  questoesResolvidas: int("questoes_resolvidas").default(0).notNull(),
  questoesCorretas: int("questoes_corretas").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("idx_user_id").on(table.userId),
  assuntoIdIdx: index("idx_assunto_id").on(table.assuntoId),
  userAssuntoIdx: uniqueIndex("idx_user_assunto").on(table.userId, table.assuntoId),
}));

// ============================================================================
// 10. MÓDULO DE MATERIAIS V4.0
// ============================================================================

export * from './schema-materials-v4';

// ============================================================================
// TIPOS EXPORTADOS
// ============================================================================

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Token = typeof tokens.$inferSelect;
export type InsertToken = typeof tokens.$inferInsert;

export type RefreshToken = typeof refreshTokens.$inferSelect;
export type InsertRefreshToken = typeof refreshTokens.$inferInsert;

export type Plano = typeof planos.$inferSelect;
export type InsertPlano = typeof planos.$inferInsert;

export type Assinatura = typeof assinaturas.$inferSelect;
export type InsertAssinatura = typeof assinaturas.$inferInsert;

export type Disciplina = typeof disciplinas.$inferSelect;
export type InsertDisciplina = typeof disciplinas.$inferInsert;

export type Assunto = typeof assuntos.$inferSelect;
export type InsertAssunto = typeof assuntos.$inferInsert;

export type Topico = typeof topicos.$inferSelect;
export type InsertTopico = typeof topicos.$inferInsert;

export type Material = typeof materiais.$inferSelect;
export type InsertMaterial = typeof materiais.$inferInsert;

export type Questao = typeof questoes.$inferSelect;
export type InsertQuestao = typeof questoes.$inferInsert;

export type Notice = typeof notices.$inferSelect;
export type InsertNotice = typeof notices.$inferInsert;

export type ForumTopico = typeof forumTopicos.$inferSelect;
export type InsertForumTopico = typeof forumTopicos.$inferInsert;

export type Meta = typeof metas.$inferSelect;
export type InsertMeta = typeof metas.$inferInsert;

export type EstatisticaDiaria = typeof estatisticasDiarias.$inferSelect;
export type InsertEstatisticaDiaria = typeof estatisticasDiarias.$inferInsert;
