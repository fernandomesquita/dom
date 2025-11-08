/**
 * Configurações de Cache React Query por Widget
 * 
 * Define staleTime e gcTime específicos para cada tipo de dado
 * para otimizar performance e reduzir queries desnecessárias.
 */

export const CACHE_CONFIG = {
  /**
   * Dados MUITO DINÂMICOS (atualizam várias vezes por dia)
   * staleTime: 1 minuto
   */
  REAL_TIME: {
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  },

  /**
   * Dados DINÂMICOS (atualizam diariamente)
   * staleTime: 5 minutos (padrão)
   */
  DAILY: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  },

  /**
   * Dados SEMI-ESTÁTICOS (atualizam semanalmente)
   * staleTime: 30 minutos
   */
  WEEKLY: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  },

  /**
   * Dados ESTÁTICOS (raramente mudam)
   * staleTime: 1 hora
   */
  STATIC: {
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
  },
} as const;

/**
 * Mapeamento de widgets para configurações de cache
 */
export const WIDGET_CACHE = {
  // Dados que mudam várias vezes por dia
  streak: CACHE_CONFIG.REAL_TIME, // Streak pode mudar a qualquer momento
  qtd: CACHE_CONFIG.REAL_TIME, // Questões resolvidas atualizam em tempo real
  
  // Dados que mudam diariamente
  cronograma: CACHE_CONFIG.DAILY, // Metas do dia
  heroSection: CACHE_CONFIG.DAILY, // Saudação e CTA principal
  dailyStats: CACHE_CONFIG.DAILY, // Estatísticas do dia
  notices: CACHE_CONFIG.DAILY, // Avisos podem ser publicados a qualquer momento
  
  // Dados que mudam semanalmente
  progressoSemanal: CACHE_CONFIG.WEEKLY, // Progresso da semana
  materiais: CACHE_CONFIG.WEEKLY, // Materiais em andamento
  revisoes: CACHE_CONFIG.WEEKLY, // Revisões pendentes
  
  // Dados que raramente mudam
  plano: CACHE_CONFIG.STATIC, // Plano do usuário
  comunidade: CACHE_CONFIG.WEEKLY, // Discussões do fórum
  widgetConfigs: CACHE_CONFIG.STATIC, // Configurações de widgets
  customization: CACHE_CONFIG.STATIC, // Customizações do dashboard
  xp: CACHE_CONFIG.DAILY, // XP e nível (pode mudar várias vezes por dia)
  achievements: CACHE_CONFIG.STATIC, // Conquistas desbloqueadas
} as const;

/**
 * Helper para aplicar configuração de cache em useQuery
 * 
 * @example
 * const { data } = trpc.streak.getCurrentStreak.useQuery(undefined, getCacheConfig('streak'));
 */
export function getCacheConfig(widget: keyof typeof WIDGET_CACHE) {
  return WIDGET_CACHE[widget];
}
