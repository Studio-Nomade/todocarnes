import "server-only";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CutCategory, CutRecord } from "./types";

const rowSchema = z.object({
  category_id: z.string().uuid(),
  categories: z.object({ name: z.string() }),
  id: z.string().uuid(),
  name: z.string(),
  products: z.array(z.object({ count: z.number().int() })).default([]),
  slug: z.string(),
  sort_order: z.number().int(),
});

export async function getCutManagementData(): Promise<{ categories: CutCategory[]; cuts: CutRecord[] }> {
  const admin = createAdminClient();
  const [categoryResult, cutResult] = await Promise.all([
    admin.from("categories").select("id,name,sort_order").order("sort_order"),
    admin.from("cuts").select("id,category_id,name,slug,sort_order,categories(name),products(count)").order("sort_order"),
  ]);
  if (categoryResult.error || cutResult.error) {
    throw new Error("No se pudieron cargar las categorías y cortes.");
  }
  const categorySchema = z.object({ id: z.string().uuid(), name: z.string(), sort_order: z.number().int() });
  const categories = z.array(categorySchema).parse(categoryResult.data).map((row) => ({
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order,
  }));
  const cuts = z.array(rowSchema).parse(cutResult.data).map((row) => ({
    categoryId: row.category_id,
    categoryName: row.categories.name,
    id: row.id,
    name: row.name,
    productCount: row.products[0]?.count ?? 0,
    slug: row.slug,
    sortOrder: row.sort_order,
  }));
  return { categories, cuts };
}
