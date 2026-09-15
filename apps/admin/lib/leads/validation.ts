import { z } from "zod";
import { commercialAreas, leadStatuses } from "./constants";

export const leadIdSchema = z.string().uuid("Lead inválido.");

export const leadFiltersSchema = z.object({
  area: z.enum(commercialAreas).optional().catch(undefined),
  assignedRepId: z.string().uuid().optional().catch(undefined),
  page: z.coerce.number().int().positive().default(1).catch(1),
  search: z.string().trim().max(80).optional().transform((value) => value || undefined),
  status: z.enum(leadStatuses).optional().catch(undefined),
});

export const updateLeadStatusSchema = z.object({
  id: leadIdSchema,
  status: z.enum(leadStatuses),
});

export const assignLeadSchema = z.object({
  assignedRepId: z.string().uuid("Selecciona un vendedor."),
  id: leadIdSchema,
});

export function safeLeadSearch(value: string): string {
  return value.replace(/[,%()]/g, " ").replace(/\s+/g, " ").trim();
}
