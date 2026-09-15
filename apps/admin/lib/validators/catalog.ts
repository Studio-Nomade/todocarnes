import { z } from "zod";

const currentYear = new Date().getUTCFullYear();

export const catalogSchema = z.object({
  title: z.string().trim().min(1, "Ingresa un título.").max(160),
  month: z.coerce.number().int().min(1, "Elige un mes.").max(12),
  year: z.coerce.number().int().min(2024).max(currentYear + 2),
});

export const catalogTitleSchema = catalogSchema.shape.title;

export const catalogIdSchema = z.string().uuid("El catálogo no es válido.");

export const reorderSchema = z.object({
  catalogId: catalogIdSchema,
  orderedProductIds: z.array(z.string().uuid()).min(1),
});

export type CatalogInput = z.infer<typeof catalogSchema>;
