"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/requireRole";
import type {
  CategoryOption,
  CutOption,
  ProductDetail,
  ProductListResult,
  ProductMutationResult,
  ProductRecord,
} from "@/lib/products/types";
import { getProductImages } from "@/lib/images/data";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  productFiltersSchema,
  productIdSchema,
  productSchema,
  type ProductInput,
} from "@/lib/validators/product";

const roles = ["admin", "commercial"] as const;

const categorySchema = z.object({
  id: z.string().uuid(),
  name: z.enum(["Cerdo", "Pollo", "Vacuno", "Trimming"]),
  slug: z.string(),
  sort_order: z.number(),
});

const cutSchema = z.object({
  category_id: z.string().uuid(),
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  sort_order: z.number(),
});

const databaseProductSchema = productSchema.extend({
  box_weight: productSchema.shape.box_weight.nullable().transform((value) => value ?? ""),
  brand: productSchema.shape.brand.nullable().transform((value) => value ?? ""),
  code: productSchema.shape.code.nullable().transform((value) => value ?? ""),
  created_at: z.string(),
  eyebrow: productSchema.shape.eyebrow.nullable().transform((value) => value ?? ""),
  format: productSchema.shape.format.nullable().transform((value) => value ?? ""),
  id: z.string().uuid(),
  month_tag: productSchema.shape.month_tag.nullable().transform((value) => value ?? ""),
  notes: productSchema.shape.notes.nullable().transform((value) => value ?? ""),
  origin: productSchema.shape.origin.nullable().transform((value) => value ?? ""),
  units: productSchema.shape.units.nullable().transform((value) => value ?? ""),
  updated_at: z.string(),
});

const nullableFields = [
  "eyebrow",
  "code",
  "brand",
  "origin",
  "box_weight",
  "format",
  "units",
  "month_tag",
  "notes",
] as const;

function databasePayload(input: ProductInput) {
  const payload: Record<string, string | null> = {
    category_id: input.category_id,
    cut_id: input.cut_id,
    status: input.status,
    title: input.title,
  };

  for (const field of nullableFields) {
    payload[field] = input[field] || null;
  }

  return payload;
}

async function cutBelongsToCategory(categoryId: string, cutId: string): Promise<boolean> {
  const admin = createAdminClient();
  const result = await admin
    .from("cuts")
    .select("id")
    .eq("id", cutId)
    .eq("category_id", categoryId)
    .maybeSingle();

  if (result.error) {
    throw new Error(`No se pudo validar el corte: ${result.error.message}`);
  }

  return result.data !== null;
}

function parseProductRows(
  rows: unknown,
  categories: CategoryOption[],
  cuts: CutOption[],
  mainImageByProduct = new Map<string, string>(),
): ProductRecord[] {
  const products = z.array(databaseProductSchema).parse(rows);
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const cutById = new Map(cuts.map((cut) => [cut.id, cut]));

  return products.map((product) => {
    const category = categoryById.get(product.category_id);
    const cut = cutById.get(product.cut_id);

    if (!category || !cut) {
      throw new Error(`El producto ${product.id} tiene una categoría o corte inválido.`);
    }

    return {
      ...product,
      category,
      cut,
      mainImageUrl: mainImageByProduct.get(product.id) ?? null,
    };
  });
}

export async function createProduct(input: unknown): Promise<ProductMutationResult> {
  const profile = await requireRole([...roles]);
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los campos.", success: false };
  }
  if (!(await cutBelongsToCategory(parsed.data.category_id, parsed.data.cut_id))) {
    return { error: "El corte no pertenece a la categoría seleccionada.", success: false };
  }

  const admin = createAdminClient();
  const result = await admin
    .from("products")
    .insert({
      ...databasePayload(parsed.data),
      created_by: profile.id,
      updated_by: profile.id,
    })
    .select("id")
    .single();

  if (result.error || !result.data) {
    return { error: result.error?.message ?? "No se pudo crear el producto.", success: false };
  }

  const id = productIdSchema.parse(result.data.id);
  revalidatePath("/products");
  return { id, success: true };
}

export async function updateProduct(id: unknown, input: unknown): Promise<ProductMutationResult> {
  const profile = await requireRole([...roles]);
  const parsedId = productIdSchema.safeParse(id);
  const parsed = productSchema.safeParse(input);
  if (!parsedId.success || !parsed.success) {
    return {
      error: parsed.error?.issues[0]?.message ?? "El producto no es válido.",
      success: false,
    };
  }
  if (!(await cutBelongsToCategory(parsed.data.category_id, parsed.data.cut_id))) {
    return { error: "El corte no pertenece a la categoría seleccionada.", success: false };
  }

  const admin = createAdminClient();
  const result = await admin
    .from("products")
    .update({ ...databasePayload(parsed.data), updated_by: profile.id })
    .eq("id", parsedId.data)
    .select("id")
    .single();

  if (result.error || !result.data) {
    return { error: result.error?.message ?? "No se pudo actualizar el producto.", success: false };
  }

  revalidatePath("/products");
  revalidatePath(`/products/${parsedId.data}`);
  return { id: parsedId.data, success: true };
}

export async function deactivateProduct(id: unknown): Promise<ProductMutationResult> {
  const profile = await requireRole([...roles]);
  const parsedId = productIdSchema.safeParse(id);
  if (!parsedId.success) {
    return { error: parsedId.error.issues[0]?.message ?? "El producto no es válido.", success: false };
  }

  const admin = createAdminClient();
  const result = await admin
    .from("products")
    .update({ status: "inactive", updated_by: profile.id })
    .eq("id", parsedId.data)
    .select("id")
    .single();

  if (result.error || !result.data) {
    return { error: result.error?.message ?? "No se pudo desactivar el producto.", success: false };
  }

  revalidatePath("/products");
  return { id: parsedId.data, success: true };
}

export async function duplicateProduct(id: unknown): Promise<ProductMutationResult> {
  const profile = await requireRole([...roles]);
  const parsedId = productIdSchema.safeParse(id);
  if (!parsedId.success) {
    return { error: parsedId.error.issues[0]?.message ?? "El producto no es válido.", success: false };
  }

  const admin = createAdminClient();
  const sourceResult = await admin.from("products").select("*").eq("id", parsedId.data).single();
  const source = databaseProductSchema.safeParse(sourceResult.data);
  if (sourceResult.error || !source.success) {
    return { error: "No se encontró el producto para duplicar.", success: false };
  }

  const copy = productSchema.parse({
    ...source.data,
    code: "",
    status: "draft",
    title: `${source.data.title} (copia)`,
  });
  const result = await admin
    .from("products")
    .insert({
      ...databasePayload(copy),
      created_by: profile.id,
      updated_by: profile.id,
    })
    .select("id")
    .single();

  if (result.error || !result.data) {
    return { error: result.error?.message ?? "No se pudo duplicar el producto.", success: false };
  }

  const copyId = productIdSchema.parse(result.data.id);
  revalidatePath("/products");
  return { id: copyId, success: true };
}

export async function listProducts(filters: unknown = {}): Promise<ProductListResult> {
  await requireRole([...roles]);
  const parsedFilters = productFiltersSchema.parse(filters);
  const admin = createAdminClient();
  const [categoryResult, cutResult, productResult] = await Promise.all([
    admin.from("categories").select("id,name,slug,sort_order").order("sort_order"),
    admin.from("cuts").select("id,category_id,name,slug,sort_order").order("sort_order"),
    admin.from("products").select("*").order("updated_at", { ascending: false }),
  ]);

  if (categoryResult.error || cutResult.error || productResult.error) {
    throw new Error("No se pudo cargar la base de productos.");
  }

  const categories = z.array(categorySchema).parse(categoryResult.data);
  const cuts = z.array(cutSchema).parse(cutResult.data);
  const productIds = z.array(databaseProductSchema).parse(productResult.data).map((product) => product.id);
  const imageResult = productIds.length
    ? await admin
        .from("product_images")
        .select("product_id,storage_path")
        .in("product_id", productIds)
        .eq("slot", "main")
        .eq("status", "approved")
    : { data: [], error: null };
  if (imageResult.error) {
    throw new Error("No se pudieron cargar las miniaturas de los productos.");
  }
  const imageRows = z.array(
    z.object({ product_id: z.string().uuid(), storage_path: z.string().min(1) }),
  ).parse(imageResult.data);
  const mainImageByProduct = new Map(
    imageRows.map((image) => [
      image.product_id,
      admin.storage.from("product-images").getPublicUrl(image.storage_path).data.publicUrl,
    ]),
  );
  const allProducts = parseProductRows(
    productResult.data,
    categories,
    cuts,
    mainImageByProduct,
  );
  const query = parsedFilters.q.toLocaleLowerCase("es");
  const products = allProducts.filter((product) => {
    const matchesQuery =
      !query ||
      product.title.toLocaleLowerCase("es").includes(query) ||
      (product.code ?? "").toLocaleLowerCase("es").includes(query);
    return (
      matchesQuery &&
      (!parsedFilters.category || product.category_id === parsedFilters.category) &&
      (!parsedFilters.cut || product.cut_id === parsedFilters.cut) &&
      (!parsedFilters.brand || product.brand === parsedFilters.brand) &&
      (!parsedFilters.status || product.status === parsedFilters.status)
    );
  });
  const brands = Array.from(
    new Set(allProducts.map((product) => product.brand).filter((brand): brand is string => Boolean(brand))),
  ).sort((left, right) => left.localeCompare(right, "es"));

  return { brands, categories, cuts, products };
}

export async function getProduct(id: unknown): Promise<ProductDetail | null> {
  await requireRole([...roles]);
  const parsedId = productIdSchema.parse(id);
  const admin = createAdminClient();
  const [categoryResult, cutResult, productResult] = await Promise.all([
    admin.from("categories").select("id,name,slug,sort_order").order("sort_order"),
    admin.from("cuts").select("id,category_id,name,slug,sort_order").order("sort_order"),
    admin.from("products").select("*").eq("id", parsedId).maybeSingle(),
  ]);

  if (categoryResult.error || cutResult.error || productResult.error) {
    throw new Error("No se pudo cargar el producto.");
  }
  if (!productResult.data) {
    return null;
  }

  const categories = z.array(categorySchema).parse(categoryResult.data);
  const cuts = z.array(cutSchema).parse(cutResult.data);
  const product = parseProductRows([productResult.data], categories, cuts)[0];
  if (!product) {
    return null;
  }

  return { ...product, images: await getProductImages(product.id) };
}
