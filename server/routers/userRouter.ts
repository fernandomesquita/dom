import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * Router de Usuários
 * Gerencia operações relacionadas ao perfil do usuário
 */
export const userRouter = router({
  /**
   * Atualizar perfil do usuário
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        nome: z.string().min(1, 'Nome é obrigatório').optional(),
        email: z.string().email('Email inválido').optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database not available');
      }

      const updateData: Record<string, unknown> = {};

      if (input.nome !== undefined) {
        updateData.name = input.nome;
      }

      if (input.email !== undefined) {
        updateData.email = input.email;
      }

      if (Object.keys(updateData).length === 0) {
        throw new Error('Nenhum campo para atualizar');
      }

      // Atualizar no banco
      await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, ctx.user.id));

      return {
        success: true,
        message: 'Perfil atualizado com sucesso',
      };
    }),
});
