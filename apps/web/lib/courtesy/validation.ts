import { z } from "zod";
import { LANDING_AREA_OPTIONS } from "@/lib/landing/constants";
import { normalizeChilePhone } from "@/lib/agenda/validation";

const commercialAreas = LANDING_AREA_OPTIONS.map((option) => option.value) as [
  (typeof LANDING_AREA_OPTIONS)[number]["value"],
  ...(typeof LANDING_AREA_OPTIONS)[number]["value"][],
];

export const courtesyRequestSchema = z.object({
  eventId: z.string().uuid(),
  name: z.string().trim().min(2).max(120),
  company: z.string().trim().min(2).max(160),
  cargo: z.string().trim().min(2).max(120),
  email: z.email().max(254),
  phone: z
    .string()
    .trim()
    .transform(normalizeChilePhone)
    .refine((value) => /^\+56\d{9}$/.test(value)),
  area: z.enum(commercialAreas),
  website: z.string().max(0),
});
