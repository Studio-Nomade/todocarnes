import { z } from "zod";
import { normalizeChilePhone } from "@/lib/agenda/validation";
import { LANDING_AREA_OPTIONS } from "./constants";

const areas = LANDING_AREA_OPTIONS.map((option) => option.value) as [
  (typeof LANDING_AREA_OPTIONS)[number]["value"],
  ...(typeof LANDING_AREA_OPTIONS)[number]["value"][],
];

export const landingLeadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  company: z.string().trim().max(160),
  email: z.email().max(254),
  phone: z.string().trim().transform(normalizeChilePhone).refine((value) => /^\+56\d{9}$/.test(value)),
  areas: z.array(z.enum(areas)).min(1).max(areas.length).transform((values) => [...new Set(values)]),
  website: z.string().max(0),
  submissionId: z.string().uuid(),
});
