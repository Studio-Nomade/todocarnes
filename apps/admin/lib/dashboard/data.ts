import "server-only";

import { z } from "zod";
import { getGenerationHistory } from "@/lib/settings/data";
import { createAdminClient } from "@/lib/supabase/admin";

const productSchema = z.object({ id: z.string().uuid() });
const approvedImageSchema = z.object({
  product_id: z.string().uuid(),
  slot: z.enum(["main", "secondary_1", "secondary_2", "secondary_3"]),
});
const catalogSchema = z.object({
  status: z.enum(["draft", "ready", "exported"]),
});

export async function getDashboardData() {
  const admin = createAdminClient();
  const [productsResult, catalogsResult, generations] = await Promise.all([
    admin.from("products").select("id").eq("status", "active"),
    admin.from("catalogs").select("status"),
    getGenerationHistory(),
  ]);

  if (productsResult.error || catalogsResult.error) {
    throw new Error("No se pudieron cargar los indicadores del dashboard.");
  }

  const products = z.array(productSchema).parse(productsResult.data);
  const imagesResult = products.length
    ? await admin
        .from("product_images")
        .select("product_id,slot")
        .in("product_id", products.map((product) => product.id))
        .eq("status", "approved")
        .in("slot", ["main", "secondary_1", "secondary_2", "secondary_3"])
    : { data: [], error: null };

  if (imagesResult.error) {
    throw new Error("No se pudieron calcular las imágenes pendientes.");
  }

  const approvedByProduct = new Map<string, Set<string>>();
  for (const image of z.array(approvedImageSchema).parse(imagesResult.data)) {
    const slots = approvedByProduct.get(image.product_id) ?? new Set<string>();
    slots.add(image.slot);
    approvedByProduct.set(image.product_id, slots);
  }
  const missingImages = products.filter(
    (product) => (approvedByProduct.get(product.id)?.size ?? 0) < 4,
  ).length;
  const catalogs = z.array(catalogSchema).parse(catalogsResult.data);

  return {
    activeProducts: products.length,
    catalogCount: catalogs.length,
    exportedCatalogs: catalogs.filter((catalog) => catalog.status === "exported").length,
    generations: generations.slice(0, 5),
    missingImages,
  };
}
