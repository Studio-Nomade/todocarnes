import { z } from "zod";
import { courtesyStatuses } from "./constants";

export const courtesyFiltersSchema = z.object({
  page: z.coerce.number().int().positive().default(1).catch(1),
  search: z.string().trim().max(80).optional().transform((value) => value || undefined),
  status: z.enum(courtesyStatuses).optional().catch(undefined),
});

export function safeCourtesySearch(value: string): string {
  return value.replace(/[,%()]/g, " ").replace(/\s+/g, " ").trim();
}
