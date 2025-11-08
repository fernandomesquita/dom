/**
 * Configuração do Sentry para Monitoramento de Erros
 * 
 * Integração com ErrorBoundary para tracking automático de erros em produção.
 * 
 * Setup:
 * 1. Criar conta no Sentry (https://sentry.io)
 * 2. Criar novo projeto React
 * 3. Copiar DSN e adicionar em .env:
 *    VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
 * 4. (Opcional) Adicionar VITE_SENTRY_ENVIRONMENT=production
 */

import * as Sentry from "@sentry/react";
import { useEffect } from "react";

/**
 * Inicializar Sentry
 * 
 * Deve ser chamado no início da aplicação (main.tsx)
 */
export function initSentry() {
  // Só inicializar em produção (ou se DSN estiver configurado)
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!dsn) {
    console.warn('[Sentry] DSN não configurado. Monitoramento desabilitado.');
    console.warn('[Sentry] Para habilitar, adicione VITE_SENTRY_DSN ao .env');
    return;
  }

  Sentry.init({
    dsn,
    
    // Ambiente (production, staging, development)
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'production',
    
    // Integrations
    integrations: [
      // Replay de sessão (opcional, pode aumentar custos)
      // Sentry.replayIntegration({
      //   maskAllText: true,
      //   blockAllMedia: true,
      // }),
      
      // Browser Tracing para performance monitoring
      Sentry.browserTracingIntegration(),
      
      // React profiling removido - não estamos usando react-router-dom
      // Sentry.reactRouterV6BrowserTracingIntegration({
      //   useEffect: useEffect,
      // }),
    ],

    // Performance Monitoring
    // Taxa de amostragem de transações (0.0 a 1.0)
    // 1.0 = 100% das transações são enviadas
    // 0.1 = 10% das transações são enviadas (recomendado para produção)
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,

    // Session Replay (opcional)
    // Taxa de amostragem de replays (0.0 a 1.0)
    // replaysSessionSampleRate: 0.1, // 10% das sessões
    // replaysOnErrorSampleRate: 1.0, // 100% quando há erro

    // Filtrar erros conhecidos/esperados
    beforeSend(event, hint) {
      const error = hint.originalException;

      // Ignorar erros de network (timeout, connection lost)
      if (error && typeof error === 'object' && 'message' in error) {
        const message = String(error.message).toLowerCase();
        if (
          message.includes('network') ||
          message.includes('fetch') ||
          message.includes('timeout') ||
          message.includes('aborted')
        ) {
          return null; // Não enviar para Sentry
        }
      }

      // Ignorar erros de extensões do browser
      if (event.exception?.values?.[0]?.stacktrace?.frames) {
        const frames = event.exception.values[0].stacktrace.frames;
        const hasExtensionFrame = frames.some(frame =>
          frame.filename?.includes('chrome-extension://') ||
          frame.filename?.includes('moz-extension://')
        );
        if (hasExtensionFrame) {
          return null;
        }
      }

      return event;
    },

    // Adicionar contexto extra
    beforeBreadcrumb(breadcrumb) {
      // Filtrar breadcrumbs sensíveis (senhas, tokens, etc)
      if (breadcrumb.category === 'console' && breadcrumb.message) {
        const message = breadcrumb.message.toLowerCase();
        if (message.includes('password') || message.includes('token')) {
          return null;
        }
      }
      return breadcrumb;
    },
  });

  console.log('[Sentry] Monitoramento inicializado:', {
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'production',
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
  });
}

/**
 * Capturar erro manualmente
 * 
 * Uso:
 * ```ts
 * try {
 *   // código que pode falhar
 * } catch (error) {
 *   captureError(error, { context: 'Descrição do contexto' });
 * }
 * ```
 */
export function captureError(
  error: Error | unknown,
  context?: Record<string, any>
) {
  if (context) {
    Sentry.setContext('custom', context);
  }
  
  Sentry.captureException(error);
}

/**
 * Capturar mensagem (não erro)
 * 
 * Uso:
 * ```ts
 * captureMessage('Algo inesperado aconteceu', 'warning', {
 *   userId: user.id,
 *   action: 'checkout',
 * });
 * ```
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: Record<string, any>
) {
  if (context) {
    Sentry.setContext('custom', context);
  }
  
  Sentry.captureMessage(message, level);
}

/**
 * Definir usuário atual
 * 
 * Deve ser chamado após login para associar erros ao usuário
 * 
 * Uso:
 * ```ts
 * setUser({
 *   id: user.id,
 *   email: user.email,
 *   username: user.name,
 * });
 * ```
 */
export function setUser(user: {
  id: string;
  email?: string;
  username?: string;
} | null) {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  } else {
    Sentry.setUser(null); // Limpar após logout
  }
}

/**
 * Adicionar breadcrumb (rastro de navegação)
 * 
 * Útil para entender o que o usuário fez antes do erro
 * 
 * Uso:
 * ```ts
 * addBreadcrumb({
 *   category: 'user-action',
 *   message: 'Usuário clicou em "Salvar Meta"',
 *   level: 'info',
 *   data: { metaId: '123' },
 * });
 * ```
 */
export function addBreadcrumb(breadcrumb: {
  category: string;
  message: string;
  level?: 'info' | 'warning' | 'error';
  data?: Record<string, any>;
}) {
  Sentry.addBreadcrumb(breadcrumb);
}

/**
 * Criar transação para performance monitoring
 * 
 * Uso:
 * ```ts
 * const transaction = startTransaction('load-dashboard');
 * 
 * // ... código que queremos medir
 * 
 * transaction.finish();
 * ```
 */
export function startTransaction(name: string, op?: string) {
  // startTransaction foi deprecado no Sentry v8+
  // Usar startSpan ao invés
  return Sentry.startSpan({ name, op: op || 'custom' }, (span) => span);
}

// Re-exportar ErrorBoundary do Sentry (opcional)
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// Re-exportar hooks úteis
export const { withProfiler, useProfiler } = Sentry;
