"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/requireRole";
import { createAdminClient } from "@/lib/supabase/admin";
import { catalogIdSchema, catalogSchema, reorderSchema } from "@/lib/validators/catalog";
import { productIdSchema } from "@/lib/validators/product";
import type { CatalogMutationResult } from "@/lib/catalogs/types";

const roles = ["admin", "commercial"] as const;
const idResultSchema = z.object({ id: z.string().uuid() });

export async function createCatalog(input: unknown): Promise<CatalogMutationResult> {
  const profile = await requireRole([...roles]);
  const parsed = catalogSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos.", success: false };
  }

  const admin = createAdminClient();
  const result = await admin
    .from("catalogs")
    .insert({ ...parsed.data, created_by: profile.id, status: "draft" })
    .select("id")
    .single();
  const created = idResultSchema.safeParse(result.data);
  if (result.error || !created.success) {
    return { error: result.error?.message ?? "No se pudo crear el catálogo.", success: false };
  }

  revalidatePath("/catalogs");
  return { id: created.data.id, success: true };
}

export async function updateCatalog(id: unknown, input: unknown): Promise<CatalogMutationResult> {
  await requireRole([...roles]);
  const parsedId = catalogIdSchema.safeParse(id);
  const parsed = catalogSchema.safeParse(input);
  if (!parsedId.success || !parsed.success) {
    return { error: parsed.error?.issues[0]?.message ?? "El catálogo no es válido.", success: false };
  }

  const admin = createAdminClient();
  const result = await admin
    .from("catalogs")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", parsedId.data)
    .select("id")
    .single();
  if (result.error || !result.data) {
    return { error: "No se pudo actualizar el catálogo.", success: false };
  }

  revalidatePath("/catalogs");
  revalidatePath(`/catalogs/${parsedId.data}`);
  return { id: parsedId.data, success: true };
}

export async function deleteCatalog(id: unknown): Promise<CatalogMutationResult> {
  await requireRole([...roles]);
  const parsedId = catalogIdSchema.safeParse(id);
  if (!parsedId.success) {
    return { error: "El catálogo no es válido.", success: false };
  }

  const admin = createAdminClient();
  const result = await admin.from("catalogs").delete().eq("id", parsedId.data).select("id").single();
  if (result.error || !result.data) {
    return { error: "No se pudo eliminar el catálogo.", success: false };
  }

  revalidatePath("/catalogs");
  return { id: parsedId.data, success: true };
}

export async function addProductToCatalog(
  catalogId: unknown,
  productId: unknown,
): Promise<CatalogMutationResult> {
  await requireRole([...roles]);
  const parsedCatalog = catalogIdSchema.safeParse(catalogId);
  const parsedProduct = productIdSchema.safeParse(productId);
  if (!parsedCatalog.success || !parsedProduct.success) {
    return { error: "Datos inválidos.", success: false };
  }

  const admin = createAdminClient();
  // Nuevo ítem al final: sort_order = max actual + 1.
  const maxResult = await admin
    .from("catalog_items")
    .select("sort_order")
    .eq("catalog_id", parsedCatalog.data)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = z.object({ sort_order: z.number().int() }).safeParse(maxResult.data);
  const sortOrder = (nextOrder.success ? nextOrder.data.sort_order : -1) + 1;

  const result = await admin
    .from("catalog_items")
    .insert({ catalog_id: parsedCatalog.data, product_id: parsedProduct.data, sort_order: sortOrder })
    .select("id")
    .single();
  const created = idResultSchema.safeParse(result.data);
  if (result.error || !created.success) {
    // unique (catalog_id, product_id) — el producto ya estaba
    return { error: "El producto ya está en el catálogo.", success: false };
  }

  revalidatePath(`/catalogs/${parsedCatalog.data}`);
  return { id: created.data.id, success: true };
}

export async function removeProductFromCatalog(
  catalogId: unknown,
  productId: unknown,
): Promise<CatalogMutationResult> {
  await requireRole([...roles]);
  const parsedCatalog = catalogIdSchema.safeParse(catalogId);
  const parsedProduct = productIdSchema.safeParse(productId);
  if (!parsedCatalog.success || !parsedProduct.success) {
    return { error: "Datos inválidos.", success: false };
  }

  const admin = createAdminClient();
  const result = await admin
    .from("catalog_items")
    .delete()
    .eq("catalog_id", parsedCatalog.data)
    .eq("product_id", parsedProduct.data);
  if (result.error) {
    return { error: "No se pudo quitar el producto.", success: false };
  }

  revalidatePath(`/catalogs/${parsedCatalog.data}`);
  return { id: parsedProduct.data, success: true };
}

export async function reorderCatalogItems(input: unknown): Promise<CatalogMutationResult> {
  await requireRole([...roles]);
  const parsed = reorderSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "El orden no es válido.", success: false };
  }

  const admin = createAdminClient();
  // Reasignar sort_order según la posición en la lista, atómico (un solo UPDATE).
  const result = await admin.rpc("reorder_catalog_items", {
    ordered_ids: parsed.data.orderedProductIds,
    target_catalog_id: parsed.data.catalogId,
  });
  if (result.error) {
    return { error: "No se pudo reordenar el catálogo.", success: false };
  }

  revalidatePath(`/catalogs/${parsed.data.catalogId}`);
  return { id: parsed.data.catalogId, success: true };
}
