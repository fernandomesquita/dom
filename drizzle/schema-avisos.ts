import { mysqlTable, varchar, text, boolean, int, timestamp, json, index, unique } from "drizzle-orm/mysql-core";
import { users } from "./schema";

/**
 * Schema do Sistema de Avisos/Notificações
 * Adaptado de PostgreSQL para MySQL mantendo todas as funcionalidades
 */

// =============================================
// TABELA AUXILIAR: Tipos de Avisos
// =============================================
export const avisosTipos = mysqlTable("avisos_tipos", {
  id: varchar("id", { length: 20 }).primaryKey(),
  nome: varchar("nome", { length: 50 }).notNull(),
  cor: varchar("cor", { length: 7 }).notNull(), // Hex color
  icone: varchar("icone", { length: 50 }).notNull(), // Lucide icon name
  prioridade: int("prioridade").notNull(),
  dismissavelPadrao: boolean("dismissavel_padrao").default(true).notNull(),
  formatoExibicaoPadrao: varchar("formato_exibicao_padrao", { length: 20 }).notNull(),
});

// =============================================
// TABELA PRINCIPAL: Avisos
// =============================================
export const avisos = mysqlTable("avisos", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID gerado via código
  tipo: varchar("tipo", { length: 20 }).notNull(),
  formatoExibicao: varchar("formato_exibicao", { length: 20 }).notNull(), // modal, banner, toast, badge
  
  // Conteúdo
  titulo: varchar("titulo", { length: 100 }).notNull(),
  subtitulo: varchar("subtitulo", { length: 150 }),
  conteudo: text("conteudo").notNull(),
  
  // Mídia
  midiaTipo: varchar("midia_tipo", { length: 20 }), // imagem, video, audio
  midiaUrl: text("midia_url"),
  midiaThumbnail: text("midia_thumbnail"),
  
  // CTAs
  ctaTexto: varchar("cta_texto", { length: 50 }),
  ctaUrl: text("cta_url"),
  ctaEstilo: varchar("cta_estilo", { length: 20 }), // primary, secondary, outline
  ctaSecundarioTexto: varchar("cta_secundario_texto", { length: 50 }),
  ctaSecundarioUrl: text("cta_secundario_url"),
  ctaSecundarioEstilo: varchar("cta_secundario_estilo", { length: 20 }), // text, outline
  linksAdicionais: json("links_adicionais").$type<Array<{ texto: string; url: string }>>(),
  
  // Comportamento
  prioridade: int("prioridade").default(5).notNull(),
  dismissavel: boolean("dismissavel").default(true).notNull(),
  reaparecePosDispensar: boolean("reaparece_pos_dispensar").default(false).notNull(),
  frequenciaReexibicao: varchar("frequencia_reexibicao", { length: 20 }), // nunca, diaria, semanal
  limiteExibicoes: int("limite_exibicoes"),
  
  // Agendamento
  dataInicio: timestamp("data_inicio").defaultNow().notNull(),
  dataFim: timestamp("data_fim"),
  horarioExibicao: varchar("horario_exibicao", { length: 20 }).default("qualquer").notNull(), // qualquer, comercial, noturno
  
  // Status (calculado automaticamente)
  status: varchar("status", { length: 20 }).default("rascunho").notNull(), // rascunho, agendado, ativo, pausado, expirado
  
  // LGPD e Segurança
  sensivel: boolean("sensivel").default(false).notNull(),
  
  // A/B Testing
  grupoTeste: varchar("grupo_teste", { length: 10 }), // A, B, C
  
  // Auditoria
  criadoPor: varchar("criado_por", { length: 36 }),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
  atualizadoEm: timestamp("atualizado_em").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  statusIdx: index("idx_avisos_status").on(table.status),
  dataInicioIdx: index("idx_avisos_data_inicio").on(table.dataInicio),
  dataFimIdx: index("idx_avisos_data_fim").on(table.dataFim),
  prioridadeIdx: index("idx_avisos_prioridade").on(table.prioridade),
  tipoIdx: index("idx_avisos_tipo").on(table.tipo),
}));

// =============================================
// TABELA: Segmentação de Avisos
// =============================================
export const avisosSegmentacao = mysqlTable("avisos_segmentacao", {
  id: varchar("id", { length: 36 }).primaryKey(),
  avisoId: varchar("aviso_id", { length: 36 }).notNull(),
  tipoSegmentacao: varchar("tipo_segmentacao", { length: 50 }).notNull(), // todos, plano, engajamento, progresso, desempenho, individual, custom
  
  // Critérios em JSON (flexível para diferentes tipos de segmentação)
  criterios: json("criterios").$type<{
    planos?: string[];
    incluirGratuito?: boolean;
    tipo?: string;
    dias?: number;
    minPercentual?: number;
    maxPercentual?: number;
    mediaMinima?: number;
    questoesMinimas?: number;
    alunoIds?: string[];
    query?: string;
  }>().notNull(),
  
  // Cache de IDs (resolvido no momento da publicação)
  alunosElegiveisCacheIds: json("alunos_elegiveis_cache").$type<string[]>(),
  totalAlunosImpactados: int("total_alunos_impactados"),
  cacheGeradoEm: timestamp("cache_gerado_em"),
}, (table) => ({
  avisoIdIdx: index("idx_segmentacao_aviso").on(table.avisoId),
  tipoIdx: index("idx_segmentacao_tipo").on(table.tipoSegmentacao),
  uniqueAviso: unique("unique_segmentacao_aviso").on(table.avisoId),
}));

// =============================================
// TABELA: Tracking de Visualizações (OTIMIZADA)
// =============================================
export const avisosVisualizacoes = mysqlTable("avisos_visualizacoes", {
  avisoId: varchar("aviso_id", { length: 36 }).notNull(),
  alunoId: varchar("aluno_id", { length: 36 }).notNull(),
  
  // Primeira visualização
  visualizadoEm: timestamp("visualizado_em").defaultNow().notNull(),
  dispositivo: varchar("dispositivo", { length: 20 }), // mobile, desktop, tablet
  
  // Interações
  dismissado: boolean("dismissado").default(false).notNull(),
  dismissadoEm: timestamp("dismissado_em"),
  clicouCta: boolean("clicou_cta").default(false).notNull(),
  clicouCtaEm: timestamp("clicou_cta_em"),
  tempoVisualizacao: int("tempo_visualizacao").default(0).notNull(), // segundos
  
  // Contadores
  totalVisualizacoes: int("total_visualizacoes").default(1).notNull(),
  ultimaVisualizacao: timestamp("ultima_visualizacao").defaultNow().notNull(),
}, (table) => ({
  pk: unique("pk_visualizacoes").on(table.avisoId, table.alunoId),
  avisoIdx: index("idx_visualizacoes_aviso").on(table.avisoId),
  alunoIdx: index("idx_visualizacoes_aluno").on(table.alunoId),
  dismissadoIdx: index("idx_visualizacoes_dismissado").on(table.dismissado),
  clicouCtaIdx: index("idx_visualizacoes_cta").on(table.clicouCta),
}));

// =============================================
// TABELA: Templates de Avisos
// =============================================
export const avisosTemplates = mysqlTable("avisos_templates", {
  id: varchar("id", { length: 36 }).primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull(),
  descricao: text("descricao"),
  tipo: varchar("tipo", { length: 20 }).notNull(),
  
  // Template com variáveis
  conteudoTemplate: text("conteudo_template").notNull(),
  variaveisDisponiveis: json("variaveis_disponiveis").$type<string[]>(), // Ex: ["{{nome_aluno}}", "{{nome_plano}}"]
  
  criadoPor: varchar("criado_por", { length: 36 }),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
  usadoCount: int("usado_count").default(0).notNull(),
}, (table) => ({
  tipoIdx: index("idx_templates_tipo").on(table.tipo),
  nomeIdx: index("idx_templates_nome").on(table.nome),
}));

// =============================================
// TABELA: Fila de Entrega (Jobs assíncronos)
// =============================================
export const avisosFilaEntrega = mysqlTable("avisos_fila_entrega", {
  id: varchar("id", { length: 36 }).primaryKey(),
  avisoId: varchar("aviso_id", { length: 36 }).notNull(),
  alunoId: varchar("aluno_id", { length: 36 }).notNull(),
  
  status: varchar("status", { length: 20 }).default("pendente").notNull(), // pendente, processando, entregue, erro
  tentativas: int("tentativas").default(0).notNull(),
  maxTentativas: int("max_tentativas").default(3).notNull(),
  erroMensagem: text("erro_mensagem"),
  
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
  processadoEm: timestamp("processado_em"),
}, (table) => ({
  uniqueEntrega: unique("unique_fila_entrega").on(table.avisoId, table.alunoId),
  statusIdx: index("idx_fila_status").on(table.status),
  avisoIdx: index("idx_fila_aviso").on(table.avisoId),
  alunoIdx: index("idx_fila_aluno").on(table.alunoId),
  tentativasIdx: index("idx_fila_tentativas").on(table.tentativas),
}));

// =============================================
// TABELA: Analytics Agregados (Cache)
// =============================================
export const avisosAnalytics = mysqlTable("avisos_analytics", {
  avisoId: varchar("aviso_id", { length: 36 }).primaryKey(),
  
  // Métricas agregadas
  totalEnviados: int("total_enviados").default(0).notNull(),
  totalVisualizados: int("total_visualizados").default(0).notNull(),
  totalDismissados: int("total_dismissados").default(0).notNull(),
  totalCliquesCta: int("total_cliques_cta").default(0).notNull(),
  
  // Taxas (calculadas)
  taxaVisualizacao: int("taxa_visualizacao").default(0).notNull(), // percentual * 100
  taxaDismiss: int("taxa_dismiss").default(0).notNull(),
  taxaConversao: int("taxa_conversao").default(0).notNull(),
  
  // Tempo médio
  tempoMedioVisualizacao: int("tempo_medio_visualizacao").default(0).notNull(), // segundos
  
  // Última atualização
  atualizadoEm: timestamp("atualizado_em").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  taxaVisualizacaoIdx: index("idx_analytics_taxa_vis").on(table.taxaVisualizacao),
  taxaConversaoIdx: index("idx_analytics_taxa_conv").on(table.taxaConversao),
}));

// =============================================
// TIPOS TYPESCRIPT
// =============================================
export type AvisoTipo = typeof avisosTipos.$inferSelect;
export type Aviso = typeof avisos.$inferSelect;
export type InsertAviso = typeof avisos.$inferInsert;
export type AvisoSegmentacao = typeof avisosSegmentacao.$inferSelect;
export type AvisoVisualizacao = typeof avisosVisualizacoes.$inferSelect;
export type AvisoTemplate = typeof avisosTemplates.$inferSelect;
export type AvisoFilaEntrega = typeof avisosFilaEntrega.$inferSelect;
export type AvisoAnalytics = typeof avisosAnalytics.$inferSelect;
