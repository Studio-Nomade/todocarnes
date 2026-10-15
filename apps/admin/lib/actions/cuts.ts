"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/requireRole";
import { productSlug } from "@/lib/products/slug";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CutMutationResult } from "@/lib/cuts/types";

const roles = ["admin", "commercial"] as const;
const cutIdSchema = z.string().uuid();
const categoryIdSchema = z.string().uuid();
const nameSchema = z.string().trim().min(2, "Ingresa el nombre del corte.").max(80);
const directionSchema = z.union([z.literal(-1), z.literal(1)]);

function refreshCuts() {
  revalidatePath("/products");
  revalidatePath("/products/cortes");
}

export async function createCut(categoryId: unknown, name: unknown): Promise<CutMutationResult> {
  await requireRole([...roles]);
  const parsedCategory = categoryIdSchema.safeParse(categoryId);
  const parsedName = nameSchema.safeParse(name);
  if (!parsedCategory.success || !parsedName.success) {
    return { error: parsedName.error?.issues[0]?.message ?? "La categoría no es válida.", success: false };
  }
  const slug = productSlug(parsedName.data);
  if (!slug) {
    return { error: "El nombre no permite construir un identificador válido.", success: false };
  }
  const admin = createAdminClient();
  const maxResult = await admin.from("cuts").select("sort_order")
    .eq("category_id", parsedCategory.data).order("sort_order", { ascending: false }).limit(1).maybeSingle();
  const maxOrder = z.object({ sort_order: z.number().int() }).safeParse(maxResult.data);
  const result = await admin.from("cuts").insert({
    category_id: parsedCategory.data,
    name: parsedName.data,
    slug,
    sort_order: (maxOrder.success ? maxOrder.data.sort_order : -1) + 1,
  }).select("id").single();
  const id = cutIdSchema.safeParse(result.data?.id);
  if (result.error?.code === "23505") {
    return { error: "Ya existe un corte con ese nombre en la categoría.", success: false };
  }
  if (result.error || !id.success) {
    return { error: "No se pudo crear el corte.", success: false };
  }
  refreshCuts();
  return { id: id.data, success: true };
}

export async function renameCut(id: unknown, name: unknown): Promise<CutMutationResult> {
  await requireRole([...roles]);
  const parsedId = cutIdSchema.safeParse(id);
  const parsedName = nameSchema.safeParse(name);
  if (!parsedId.success || !parsedName.success) {
    return { error: parsedName.error?.issues[0]?.message ?? "El corte no es válido.", success: false };
  }
  const admin = createAdminClient();
  const result = await admin.from("cuts").update({ name: parsedName.data })
    .eq("id", parsedId.data).select("id").single();
  if (result.error || !result.data) {
    return { error: "No se pudo renombrar el corte.", success: false };
  }
  refreshCuts();
  return { id: parsedId.data, success: true };
}

export async function moveCut(id: unknown, direction: unknown): Promise<CutMutationResult> {
  await requireRole([...roles]);
  const parsedId = cutIdSchema.safeParse(id);
  const parsedDirection = directionSchema.safeParse(direction);
  if (!parsedId.success || !parsedDirection.success) {
    return { error: "El movimiento no es válido.", success: false };
  }
  const admin = createAdminClient();
  const currentResult = await admin.from("cuts").select("id,category_id,sort_order")
    .eq("id", parsedId.data).single();
  const current = z.object({ id: z.string().uuid(), category_id: z.string().uuid(), sort_order: z.number().int() })
    .safeParse(currentResult.data);
  if (currentResult.error || !current.success) {
    return { error: "No se encontró el corte.", success: false };
  }
  const ascending = parsedDirection.data === 1;
  const neighborQuery = admin.from("cuts").select("id,sort_order").eq("category_id", current.data.category_id);
  const neighborResult = ascending
    ? await neighborQuery.gt("sort_order", current.data.sort_order).order("sort_order").limit(1).maybeSingle()
    : await neighborQuery.lt("sort_order", current.data.sort_order).order("sort_order", { ascending: false }).limit(1).maybeSingle();
  const neighbor = z.object({ id: z.string().uuid(), sort_order: z.number().int() }).safeParse(neighborResult.data);
  if (!neighbor.success) {
    return { id: parsedId.data, success: true };
  }
  const [currentUpdate, neighborUpdate] = await Promise.all([
    admin.from("cuts").update({ sort_order: neighbor.data.sort_order }).eq("id", current.data.id),
    admin.from("cuts").update({ sort_order: current.data.sort_order }).eq("id", neighbor.data.id),
  ]);
  if (currentUpdate.error || neighborUpdate.error) {
    return { error: "No se pudo cambiar el orden.", success: false };
  }
  refreshCuts();
  return { id: parsedId.data, success: true };
}

export async function deleteCut(id: unknown): Promise<CutMutationResult> {
  await requireRole([...roles]);
  const parsedId = cutIdSchema.safeParse(id);
  if (!parsedId.success) {
    return { error: "El corte no es válido.", success: false };
  }
  const admin = createAdminClient();
  const countResult = await admin.from("products").select("*", { count: "exact", head: true }).eq("cut_id", parsedId.data);
  if ((countResult.count ?? 0) > 0) {
    return { error: `Tiene ${countResult.count} productos asignados.`, success: false };
  }
  const result = await admin.from("cuts").delete().eq("id", parsedId.data);
  if (result.error) {
    return { error: "No se pudo eliminar el corte.", success: false };
  }
  refreshCuts();
  return { id: parsedId.data, success: true };
}
