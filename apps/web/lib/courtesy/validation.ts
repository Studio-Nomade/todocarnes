import { z } from "zod";
import { normalizeChilePhone } from "@/lib/agenda/validation";
import { isValidRut, normalizeRut } from "./rut";

export const courtesyRequestSchema = z.object({
  eventId: z.string().uuid(),
  name: z.string().trim().min(2).max(120),
  lastName: z.string().trim().min(2).max(120),
  rut: z.string().trim().transform(normalizeRut).refine(isValidRut, "El RUT no es válido."),
  company: z.string().trim().min(2).max(160),
  cargo: z.string().trim().min(2).max(120),
  email: z.email().max(254),
  phone: z
    .string()
    .trim()
    .transform(normalizeChilePhone)
    .refine((value) => /^\+56\d{9}$/.test(value)),
  website: z.string().max(0),
});
