import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { z } from "zod";

const SECONDARY_WIDTH = 544;
const SECONDARY_HEIGHT = 338;
const secondarySlotSchema = z.enum(["secondary_1", "secondary_2", "secondary_3"]);

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

const imageSchema = z.object({
  id: z.string().uuid(),
  slot: secondarySlotSchema,
  storage_path: z.string().min(1),
});

async function run() {
  const env = envSchema.parse(process.env);
  const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const result = await admin
    .from("product_images")
    .select("id,slot,storage_path")
    .eq("status", "approved")
    .in("slot", secondarySlotSchema.options)
    .order("storage_path");
  if (result.error) {
    throw new Error(`No se pudieron cargar las imágenes secundarias: ${result.error.message}`);
  }
  const images = z.array(imageSchema).parse(result.data);

  for (const [index, image] of images.entries()) {
    const downloaded = await admin.storage.from("product-images").download(image.storage_path);
    if (downloaded.error) {
      throw new Error(`No se pudo descargar ${image.storage_path}: ${downloaded.error.message}`);
    }
    const input = Buffer.from(await downloaded.data.arrayBuffer());
    const output = await sharp(input)
      .resize(SECONDARY_WIDTH, SECONDARY_HEIGHT, { fit: "cover" })
      .webp({ quality: 82 })
      .toBuffer();
    const uploaded = await admin.storage.from("product-images").upload(image.storage_path, output, {
      cacheControl: "3600",
      contentType: "image/webp",
      upsert: true,
    });
    if (uploaded.error) {
      throw new Error(`No se pudo actualizar ${image.storage_path}: ${uploaded.error.message}`);
    }
    const touched = await admin.from("product_images")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", image.id);
    if (touched.error) {
      throw new Error(`No se pudo versionar ${image.storage_path}: ${touched.error.message}`);
    }
    console.log(`[${index + 1}/${images.length}] ${image.slot} · ${image.storage_path}`);
  }

  console.log(
    `Optimización completada: ${images.length} imágenes aprobadas en ${SECONDARY_WIDTH}×${SECONDARY_HEIGHT}px.`,
  );
}

run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Falló la optimización de imágenes secundarias.");
  process.exitCode = 1;
});
