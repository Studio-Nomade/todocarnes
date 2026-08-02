import { readFile, readdir, stat } from "node:fs/promises";
import { basename, join } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { z } from "zod";

const slots = ["source", "main", "secondary_1", "secondary_2", "secondary_3"] as const;
const categories = ["cerdo", "pollo", "vacuno", "trimming"] as const;
const targetRatio = 1672 / 941;

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

const productSchema = z.object({
  code: z.string().min(1),
  id: z.string().uuid(),
  title: z.string().min(1),
});

type Product = z.infer<typeof productSchema>;
type Slot = (typeof slots)[number];

function codeTokens(value: string): string[] {
  return value.match(/CF-\d+/g) ?? [];
}

function folderCode(value: string): string | null {
  return codeTokens(value)[0] ?? null;
}

function storageCode(product: Product): string {
  return codeTokens(product.code)[0]?.toLowerCase() ?? product.id;
}

async function productFolders(root: string): Promise<string[]> {
  const folders: string[] = [];
  for (const category of categories) {
    const categoryPath = join(root, category);
    try {
      for (const entry of await readdir(categoryPath)) {
        const path = join(categoryPath, entry);
        if ((await stat(path)).isDirectory()) {
          folders.push(path);
        }
      }
    } catch (error: unknown) {
      const code = error instanceof Error && "code" in error ? error.code : null;
      if (code !== "ENOENT") {
        throw error;
      }
    }
  }
  return folders.sort();
}

async function selectComposite(folder: string): Promise<string> {
  const candidates = await Promise.all(
    (await readdir(folder))
      .filter((file) => file.toLowerCase().endsWith(".webp"))
      .map(async (file) => {
        const path = join(folder, file);
        const metadata = await sharp(path).metadata();
        const width = metadata.width ?? 0;
        const height = metadata.height ?? 0;
        return { file, path, ratioDistance: height > 0 ? Math.abs(width / height - targetRatio) : Number.POSITIVE_INFINITY };
      }),
  );
  const selected = candidates.sort((a, b) => a.ratioDistance - b.ratioDistance || a.file.localeCompare(b.file))[0];
  if (!selected) {
    throw new Error(`No hay imágenes WebP en ${folder}.`);
  }
  return selected.path;
}

async function splitComposite(path: string): Promise<Record<Slot, Buffer>> {
  const metadata = await sharp(path).metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;
  if (width < 1200 || height < 700) {
    throw new Error(`${basename(path)} no tiene resolución suficiente.`);
  }
  const source = await readFile(path);
  const mainHeight = Math.round(height * 0.625);
  const paddedMainHeight = Math.round(width / (971 / 425));
  const main = await sharp(path)
    .extract({ height: mainHeight, left: 0, top: 0, width })
    .extend({ background: "white", bottom: Math.max(0, paddedMainHeight - mainHeight) })
    .webp({ quality: 88 })
    .toBuffer();
  const secondaryTop = Math.round(height * 0.627);
  const secondaryHeight = Math.min(Math.round(height * 0.352), height - secondaryTop);
  const secondaryWidth = Math.round(width * 0.316);
  const secondaryStarts = [0.017, 0.34, 0.662].map((ratio) => Math.round(width * ratio));
  const secondaries = await Promise.all(secondaryStarts.map((left) => sharp(path)
    .extract({ height: secondaryHeight, left, top: secondaryTop, width: Math.min(secondaryWidth, width - left) })
    .resize(1200, 746, { fit: "cover" })
    .webp({ quality: 88 })
    .toBuffer()));

  return { source, main, secondary_1: secondaries[0], secondary_2: secondaries[1], secondary_3: secondaries[2] };
}

async function saveSlot(admin: SupabaseClient, input: {
  buffer: Buffer;
  createdBy: string;
  product: Product;
  slot: Slot;
}) {
  const storagePath = `optimized-by-product/${storageCode(input.product)}/${input.slot}.webp`;
  const upload = await admin.storage.from("product-images").upload(storagePath, input.buffer, {
    contentType: "image/webp",
    upsert: true,
  });
  if (upload.error) {
    throw new Error(`No se pudo subir ${input.product.code}/${input.slot}: ${upload.error.message}`);
  }

  const existing = await admin.from("product_images")
    .select("id")
    .eq("product_id", input.product.id)
    .eq("slot", input.slot)
    .eq("storage_path", storagePath)
    .maybeSingle();
  if (existing.error) {
    throw new Error(`No se pudo buscar ${input.product.code}/${input.slot}: ${existing.error.message}`);
  }
  let imageId: string | undefined = existing.data?.id;
  if (!imageId) {
    const inserted = await admin.from("product_images").insert({
      created_by: input.createdBy,
      generated_by_ai: false,
      product_id: input.product.id,
      slot: input.slot,
      status: "pending",
      storage_path: storagePath,
    }).select("id").single();
    if (inserted.error || !inserted.data) {
      throw new Error(`No se pudo registrar ${input.product.code}/${input.slot}: ${inserted.error?.message ?? "sin datos"}`);
    }
    imageId = inserted.data.id;
  }
  const approved = await admin.rpc("approve_product_image", { target_image_id: imageId });
  if (approved.error) {
    throw new Error(`No se pudo aprobar ${input.product.code}/${input.slot}: ${approved.error.message}`);
  }
}

async function run() {
  const root = process.argv[2];
  if (!root) {
    throw new Error("Uso: npm run import:optimized-images -- /ruta/todocarnes_imagenes_optimizadas_por_producto");
  }
  const env = envSchema.parse(process.env);
  const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const productResult = await admin.from("products").select("id,code,title").eq("status", "active");
  if (productResult.error) {
    throw new Error(`No se pudieron cargar los productos: ${productResult.error.message}`);
  }
  const products = z.array(productSchema).parse(productResult.data);
  const productByCode = new Map(products.flatMap((product) => codeTokens(product.code).map((code) => [code, product] as const)));
  const profileResult = await admin.from("profiles").select("id,role").eq("status", "active").order("created_at");
  if (profileResult.error || !profileResult.data?.length) {
    throw new Error("Se necesita un usuario activo para atribuir la importación.");
  }
  const createdBy = profileResult.data.find((profile) => profile.role === "admin")?.id ?? profileResult.data[0].id;

  const updated = new Set<string>();
  for (const folder of await productFolders(root)) {
    const code = folderCode(basename(folder));
    const product = code ? productByCode.get(code) : undefined;
    if (!product) {
      throw new Error(`La carpeta ${basename(folder)} no coincide con un producto activo.`);
    }
    if (updated.has(product.id)) {
      throw new Error(`Más de una carpeta coincide con ${product.code}.`);
    }
    const selected = await selectComposite(folder);
    const buffers = await splitComposite(selected);
    for (const slot of slots) {
      await saveSlot(admin, { buffer: buffers[slot], createdBy, product, slot });
    }
    updated.add(product.id);
    console.log(`[${updated.size}] ${product.code} · ${basename(selected)}`);
  }

  console.log(`Actualización completada: ${updated.size} productos actualizados y ${products.length - updated.size} conservados sin cambios.`);
}

run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Falló la importación de imágenes optimizadas.");
  process.exitCode = 1;
});
