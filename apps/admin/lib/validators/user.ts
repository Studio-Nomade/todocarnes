import { z } from "zod";
import { commercialAreas } from "@/lib/leads/constants";

export const commercialUserSchema = z.object({
  email: z.string().trim().email("Ingresa un correo válido.").max(254),
  jobTitle: z.string().trim().max(100).optional().default(""),
  name: z.string().trim().min(2, "Ingresa el nombre.").max(100),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(72, "La contraseña no puede superar los 72 caracteres."),
  phone: z.string().trim().max(30).optional().default(""),
});

export type CommercialUserInput = z.infer<typeof commercialUserSchema>;

export const userIdSchema = z.string().uuid("El usuario no es válido.");
export const userStatusSchema = z.enum(["active", "inactive"]);
export const resetUserPasswordSchema = z.object({
  password: commercialUserSchema.shape.password,
  userId: userIdSchema,
});

export const publicProfileSchema = z.object({
  areas: z.array(z.enum(commercialAreas)).max(commercialAreas.length).transform((values) => [...new Set(values)]),
  isPublic: z.boolean(),
  publicBio: z.string().trim().max(600, "La biografía no puede superar 600 caracteres."),
  publicOrder: z.coerce.number().int().min(0).max(999),
  userId: userIdSchema,
  whatsapp: z.string().trim().max(30),
}).superRefine((value, context) => {
  if (value.isPublic && !value.areas.length) context.addIssue({ code: "custom", message: "Selecciona al menos un área antes de publicar.", path: ["areas"] });
});

export type PublicProfileInput = z.infer<typeof publicProfileSchema>;
