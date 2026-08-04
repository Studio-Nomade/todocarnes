import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max);
const optionalFilter = <Schema extends z.ZodType>(schema: Schema) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema.optional());

export const productStatusSchema = z.enum(["draft", "active", "inactive"]);

export const productSchema = z.object({
  category_id: z.string().uuid("Selecciona una categoría."),
  cut_id: z.string().uuid("Selecciona un corte."),
  eyebrow: optionalText(120),
  title: z.string().trim().min(1, "Ingresa el nombre del producto.").max(160),
  code: optionalText(160),
  brand: optionalText(120),
  origin: optionalText(120),
  box_weight: optionalText(240),
  format: optionalText(240),
  units: optionalText(240),
  status: productStatusSchema.default("draft"),
  month_tag: optionalText(80),
  notes: optionalText(1000),
});

export const productIdSchema = z.string().uuid("El producto no es válido.");

export const productFiltersSchema = z.object({
  brand: z.string().trim().max(120).optional().default(""),
  category: optionalFilter(z.string().uuid()),
  cut: optionalFilter(z.string().uuid()),
  q: z.string().trim().max(120).optional().default(""),
  status: optionalFilter(productStatusSchema),
});

export type ProductInput = z.infer<typeof productSchema>;
export type ProductStatus = z.infer<typeof productStatusSchema>;
