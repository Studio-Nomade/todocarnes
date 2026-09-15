import "server-only";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { allImageSlotSchema } from "./slots";
import type { ProductImageRecord } from "./types";

const imageSchema = z.object({
  created_at: z.string(),
  generated_by_ai: z.boolean(),
  id: z.string().uuid(),
  prompt_used: z.string().nullable(),
  slot: allImageSlotSchema,
  status: z.enum(["pending", "approved", "rejected"]),
  storage_path: z.string().min(1),
});

export async function getProductImages(productId: string): Promise<ProductImageRecord[]> {
  const admin = createAdminClient();
  const result = await admin
    .from("product_images")
    .select("id,slot,storage_path,status,generated_by_ai,prompt_used,created_at")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (result.error) {
    throw new Error("No se pudieron cargar las imágenes del producto.");
  }

  return z.array(imageSchema).parse(result.data).map((image) => ({
    ...image,
    url: admin.storage.from("product-images").getPublicUrl(image.storage_path).data.publicUrl,
  }));
}
