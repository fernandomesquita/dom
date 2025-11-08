import { z } from "zod";
import { router, protectedProcedure } from "../../_core/trpc";
import { getDb } from "../../db";
import { telemetryEvents } from "../../../drizzle/schema-dashboard";

/**
 * E10: Dashboard do Aluno - Telemetry Router
 * 
 * 2 procedures:
 * 1. trackEvent - Rastrear evento único
 * 2. batchTrackEvents - Rastrear eventos em lote
 */

const telemetryEventSchema = z.object({
  eventId: z.string(),
  sessionId: z.string(),
  widget: z.string(),
  action: z.string(),
  category: z.enum(["engagement", "conversion", "error", "performance"]),
  properties: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  timestamp: z.string().or(z.date()),
  timezone: z.string().optional(),
  duration: z.number().optional(),
  userAgent: z.string().optional(),
  viewport: z
    .object({
      width: z.number(),
      height: z.number(),
    })
    .optional(),
});

export const telemetryRouter = router({
  /**
   * 1. trackEvent - Rastrear evento único
   * Registra um evento de telemetria no banco
   */
  trackEvent: protectedProcedure
    .input(telemetryEventSchema)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userId = ctx.user.id;

      // Converter timestamp para Date se for string
      const timestamp =
        typeof input.timestamp === "string"
          ? new Date(input.timestamp)
          : input.timestamp;

      await db.insert(telemetryEvents).values({
        id: `te_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        eventId: input.eventId,
        userId,
        sessionId: input.sessionId,
        widget: input.widget,
        action: input.action,
        category: input.category,
        properties: input.properties || null,
        metadata: input.metadata || null,
        timestamp,
        timezone: input.timezone || null,
        duration: input.duration || null,
        userAgent: input.userAgent || null,
        viewport: input.viewport || null,
      });

      return { success: true };
    }),

  /**
   * 2. batchTrackEvents - Rastrear eventos em lote
   * Registra múltiplos eventos de telemetria de uma vez (mais eficiente)
   */
  batchTrackEvents: protectedProcedure
    .input(
      z.object({
        events: z.array(telemetryEventSchema).min(1).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userId = ctx.user.id;

      // Preparar eventos para inserção
      const eventsToInsert = input.events.map((event) => {
        const timestamp =
          typeof event.timestamp === "string"
            ? new Date(event.timestamp)
            : event.timestamp;

        return {
          id: `te_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          eventId: event.eventId,
          userId,
          sessionId: event.sessionId,
          widget: event.widget,
          action: event.action,
          category: event.category,
          properties: event.properties || null,
          metadata: event.metadata || null,
          timestamp,
          timezone: event.timezone || null,
          duration: event.duration || null,
          userAgent: event.userAgent || null,
          viewport: event.viewport || null,
        };
      });

      // Inserir em lote
      await db.insert(telemetryEvents).values(eventsToInsert);

      return { success: true, count: eventsToInsert.length };
    }),
});
