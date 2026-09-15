import { z } from "zod";
import { ORIGIN_OPTIONS } from "./constants";

const contactOrigins = ORIGIN_OPTIONS.map((option) => option.value) as [
  (typeof ORIGIN_OPTIONS)[number]["value"],
  ...(typeof ORIGIN_OPTIONS)[number]["value"][],
];

export function normalizeChilePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  const national = digits.startsWith("56") ? digits.slice(2) : digits;
  return `+56${national}`;
}

const phoneSchema = z
  .string()
  .trim()
  .min(1, "Ingresá tu teléfono.")
  .transform(normalizeChilePhone)
  .refine((value) => /^\+56\d{9}$/.test(value), "Ingresá 9 dígitos después de +56.");

export const availabilityInputSchema = z.object({
  repId: z.string().uuid(),
  eventId: z.string().uuid(),
});

export const bookingInputSchema = z.object({
  eventId: z.string().uuid(),
  repId: z.string().uuid(),
  day: z.iso.date(),
  slotTime: z.string().regex(/^\d{2}:\d{2}(?::\d{2})?$/),
  name: z.string().trim().min(2).max(120),
  company: z.string().trim().min(2).max(160),
  cargo: z.string().trim().min(2).max(120),
  email: z.email().max(254),
  phone: phoneSchema,
  topics: z.string().trim().max(1000),
  cameFrom: z.enum(contactOrigins).or(z.literal("")),
});

export function isSlotConflict(error: { code?: string } | null) {
  return error?.code === "23505";
}
