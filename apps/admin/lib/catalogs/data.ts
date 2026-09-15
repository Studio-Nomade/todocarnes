import "server-only";

import { z } from "zod";
import type { CatalogProduct } from "@/lib/pdf/page-order";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CatalogItemProduct, CatalogRecord, CatalogStatus } from "./types";

const placeholder = "/placeholders/product-placeholder.svg";
const categoryName = z.enum(["Cerdo", "Pollo", "Vacuno", "Trimming"]);
const imageSlot = z.enum(["main", "secondary_1", "secondary_2", "secondary_3"]);

const catalogRowSchema = z.object({
  client_logo_path: z.string().nullable(),
  client_name: z.string().nullable(),
  id: z.string().uuid(),
  title: z.string(),
  month: z.number().int(),
  year: z.number().int(),
  status: z.enum(["draft", "ready", "exported"]),
  updated_at: z.string(),
});

const itemRowSchema = z.object({
  product_id: z.string().uuid(),
  sort_order: z.number().int(),
  products: z.object({
    title: z.string(),
    eyebrow: z.string().nullable(),
    code: z.string().nullable(),
    brand: z.string().nullable(),
    origin: z.string().nullable(),
    box_weight: z.string().nullable(),
    format: z.string().nullable(),
    units: z.string().nullable(),
    status: z.enum(["draft", "active", "inactive"]),
    categories: z.object({ name: categoryName, sort_order: z.number().int() }),
    cuts: z.object({ name: z.string(), sort_order: z.number().int() }),
  }),
});

const approvedImageSchema = z.object({
  product_id: z.string().uuid(),
  slot: imageSlot,
  storage_path: z.string().min(1),
  updated_at: z.string(),
});

function toStatus(value: string): CatalogStatus {
  return value === "ready" || value === "exported" ? value : "draft";
}

export async function listCatalogs(): Promise<CatalogRecord[]> {
  const admin = createAdminClient();
  const result = await admin
    .from("catalogs")
    .select("id,title,month,year,status,client_name,client_logo_path,updated_at,catalog_items(count)")
    .order("year", { ascending: false })
    .order("month", { ascending: false });
  if (result.error) {
    throw new Error("No se pudieron cargar los catálogos.");
  }

  const rowSchema = catalogRowSchema.extend({
    catalog_items: z.array(z.object({ count: z.number().int() })).default([]),
  });
  return z.array(rowSchema).parse(result.data).map((row) => ({
    clientLogoPath: row.client_logo_path,
    clientLogoUrl: null,
    clientName: row.client_name,
    id: row.id,
    itemCount: row.catalog_items[0]?.count ?? 0,
    month: row.month,
    status: toStatus(row.status),
    title: row.title,
    updatedAt: row.updated_at,
    year: row.year,
  }));
}

export async function getCatalog(id: string): Promise<CatalogRecord | null> {
  const admin = createAdminClient();
  const result = await admin
    .from("catalogs")
    .select("id,title,month,year,status,client_name,client_logo_path,updated_at,catalog_items(count)")
    .eq("id", id)
    .maybeSingle();
  if (result.error) {
    throw new Error("No se pudo cargar el catálogo.");
  }
  if (!result.data) {
    return null;
  }
  const row = catalogRowSchema
    .extend({ catalog_items: z.array(z.object({ count: z.number().int() })).default([]) })
    .parse(result.data);
  const signedLogo = row.client_logo_path
    ? await admin.storage.from("catalog-assets").createSignedUrl(row.client_logo_path, 3600)
    : null;
  return {
    clientLogoPath: row.client_logo_path,
    clientLogoUrl: signedLogo?.data?.signedUrl ?? null,
    clientName: row.client_name,
    id: row.id,
    itemCount: row.catalog_items[0]?.count ?? 0,
    month: row.month,
    status: toStatus(row.status),
    title: row.title,
    updatedAt: row.updated_at,
    year: row.year,
  };
}

// Ítems del catálogo con lo mínimo para el constructor (sin imágenes de ficha).
export async function getCatalogItems(catalogId: string): Promise<CatalogItemProduct[]> {
  const admin = createAdminClient();
  const [itemsResult, approvedResult] = await Promise.all([
    admin
      .from("catalog_items")
      .select(
        "product_id,sort_order,products(title,eyebrow,code,brand,origin,box_weight,format,units,status,categories(name,sort_order),cuts(name,sort_order))",
      )
      .eq("catalog_id", catalogId)
      .order("sort_order"),
    approvedImageProductIds(catalogId),
  ]);
  if (itemsResult.error) {
    throw new Error("No se pudieron cargar los productos del catálogo.");
  }

  return z.array(itemRowSchema).parse(itemsResult.data).map((row) => ({
    category: row.products.categories.name,
    cut: row.products.cuts.name,
    hasApprovedImages: approvedResult.has(row.product_id),
    itemSortOrder: row.sort_order,
    productId: row.product_id,
    status: row.products.status,
    title: row.products.title,
  }));
}

// Productos del catálogo listos para page-order: con imágenes aprobadas resueltas a URL.
export async function getCatalogProducts(catalogId: string): Promise<CatalogProduct[]> {
  const admin = createAdminClient();
  const itemsResult = await admin
    .from("catalog_items")
    .select(
      "product_id,sort_order,products(title,eyebrow,code,brand,origin,box_weight,format,units,status,categories(name,sort_order),cuts(name,sort_order))",
    )
    .eq("catalog_id", catalogId)
    .order("sort_order");
  if (itemsResult.error) {
    throw new Error("No se pudieron cargar los productos del catálogo.");
  }
  const items = z.array(itemRowSchema).parse(itemsResult.data);
  if (items.length === 0) {
    return [];
  }

  const imagesResult = await admin
    .from("product_images")
    .select("product_id,slot,storage_path,updated_at")
    .in("product_id", items.map((item) => item.product_id))
    .eq("status", "approved")
    .in("slot", ["main", "secondary_1", "secondary_2", "secondary_3"]);
  if (imagesResult.error) {
    throw new Error("No se pudieron cargar las imágenes del catálogo.");
  }
  const urlBySlot = new Map<string, string>();
  for (const image of z.array(approvedImageSchema).parse(imagesResult.data)) {
    const publicUrl = admin.storage.from("product-images").getPublicUrl(image.storage_path).data.publicUrl;
    const url = new URL(publicUrl);
    url.searchParams.set("v", image.updated_at);
    urlBySlot.set(`${image.product_id}:${image.slot}`, url.toString());
  }
  const imageFor = (productId: string, slot: string) => urlBySlot.get(`${productId}:${slot}`) ?? placeholder;

  return items.map((item) => ({
    boxWeight: item.products.box_weight,
    brand: item.products.brand,
    category: item.products.categories.name,
    categorySortOrder: item.products.categories.sort_order,
    code: item.products.code,
    cut: item.products.cuts.name,
    cutSortOrder: item.products.cuts.sort_order,
    eyebrow: item.products.eyebrow ?? "",
    format: item.products.format,
    id: item.product_id,
    itemSortOrder: item.sort_order,
    mainImage: imageFor(item.product_id, "main"),
    origin: item.products.origin,
    secondaryImages: [
      imageFor(item.product_id, "secondary_1"),
      imageFor(item.product_id, "secondary_2"),
      imageFor(item.product_id, "secondary_3"),
    ],
    title: item.products.title,
    units: item.products.units,
  }));
}

async function approvedImageProductIds(catalogId: string): Promise<Set<string>> {
  const admin = createAdminClient();
  const result = await admin
    .from("catalog_items")
    .select("product_id,products(product_images(slot,status))")
    .eq("catalog_id", catalogId);
  if (result.error) {
    return new Set();
  }
  const schema = z.array(
    z.object({
      product_id: z.string().uuid(),
      products: z.object({
        product_images: z.array(z.object({ slot: z.string(), status: z.string() })).default([]),
      }),
    }),
  );
  const parsed = schema.safeParse(result.data);
  if (!parsed.success) {
    return new Set();
  }
  const ready = new Set<string>();
  for (const row of parsed.data) {
    const approved = new Set(
      row.products.product_images.filter((i) => i.status === "approved").map((i) => i.slot),
    );
    if (["main", "secondary_1", "secondary_2", "secondary_3"].every((slot) => approved.has(slot))) {
      ready.add(row.product_id);
    }
  }
  return ready;
}
