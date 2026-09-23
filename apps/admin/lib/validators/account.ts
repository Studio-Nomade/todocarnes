import { z } from "zod";
import { commercialUserSchema } from "./user";

const passwordSchema = commercialUserSchema.shape.password;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Ingresa tu contraseña actual."),
  newPassword: passwordSchema,
  repeatPassword: z.string(),
}).superRefine((value, context) => {
  if (value.newPassword !== value.repeatPassword) {
    context.addIssue({
      code: "custom",
      message: "Las contraseñas nuevas no coinciden.",
      path: ["repeatPassword"],
    });
  }
  if (value.newPassword === value.currentPassword) {
    context.addIssue({
      code: "custom",
      message: "La contraseña nueva debe ser distinta de la actual.",
      path: ["newPassword"],
    });
  }
});

export const recoveryPasswordSchema = z.object({
  newPassword: passwordSchema,
  repeatPassword: z.string(),
}).superRefine((value, context) => {
  if (value.newPassword !== value.repeatPassword) {
    context.addIssue({
      code: "custom",
      message: "Las contraseñas nuevas no coinciden.",
      path: ["repeatPassword"],
    });
  }
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type RecoveryPasswordInput = z.infer<typeof recoveryPasswordSchema>;
