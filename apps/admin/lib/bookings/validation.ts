import { z } from "zod";

export const bookingIdSchema = z.string().uuid("Reserva inválida.");

export const bookingFiltersSchema = z.object({
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().catch(undefined),
  repId: z.string().uuid().optional().catch(undefined),
});

export const bookingMutationSchema = z.object({ id: bookingIdSchema });
