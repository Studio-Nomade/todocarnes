import { z } from "zod";

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
