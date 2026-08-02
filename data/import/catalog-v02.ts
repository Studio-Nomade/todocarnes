import { execFile } from "node:child_process";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { z } from "zod";
import { catalogV02Products, type CatalogV02Product } from "./catalog-v02-products";

const execFileAsync = promisify(execFile);
const imageSlots = ["source", "main", "secondary_1", "secondary_2", "secondary_3"] as const;

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

const categoryRows = [
  { icon_key: "pig", name: "Cerdo", slug: "cerdo", sort_order: 0 },
  { icon_key: "chicken", name: "Pollo", slug: "pollo", sort_order: 1 },
  { icon_key: "cow", name: "Vacuno", slug: "vacuno", sort_order: 2 },
  { icon_key: "trimming", name: "Trimming", slug: "trimming", sort_order: 3 },
] as const;

const cutRows = {
  cerdo: [
    ["costillar", "Costillar"], ["baby-back-ribs", "Baby Back Ribs"], ["chuletas", "Chuletas"],
    ["lomo-centro", "Lomo Centro"], ["pulpa-pierna", "Pulpa Pierna"], ["panceta", "Panceta"],
  ],
  pollo: [["pechuga", "Pechuga"], ["filetillo", "Filetillo"], ["trutros", "Trutros"], ["pollo-entero", "Pollo Entero"]],
  vacuno: [["posta", "Posta"], ["higado", "Hígado"]],
  trimming: [["50-50", "50/50"], ["70-30", "70/30"], ["80-20", "80/20"], ["90-10", "90/10"]],
} as const;

type AdminClient = SupabaseClient;

function assertData<T>(data: T | null, error: { message: string } | null, context: string): T {
  if (error || !data) {
    throw new Error(`${context}: ${error?.message ?? "sin datos"}`);
  }
  return data;
}

function storageCode(code: string): string {
  return code.match(/CF-\d+/)?.[0]?.toLowerCase() ?? code.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

async function extractComposite(pdfPath: string, page: number, directory: string): Promise<string> {
  const prefix = join(directory, `page-${page}`);
  await execFileAsync("pdfimages", ["-f", String(page), "-l", String(page), "-png", pdfPath, prefix]);
  const candidates = await Promise.all(
    (await readdir(directory))
      .filter((file) => file.startsWith(`page-${page}-`) && file.endsWith(".png"))
      .map(async (file) => {
        const path = join(directory, file);
        const metadata = await sharp(path).metadata();
        return { area: (metadata.width ?? 0) * (metadata.height ?? 0), path, width: metadata.width ?? 0 };
      }),
  );
  const composite = candidates.filter((candidate) => candidate.width > 1200).sort((a, b) => b.area - a.area)[0];
  if (!composite) {
    throw new Error(`No se encontró la composición de imágenes en la página ${page}.`);
  }
  return composite.path;
}

async function imageBuffers(compositePath: string): Promise<Record<(typeof imageSlots)[number], Buffer>> {
  const metadata = await sharp(compositePath).metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;
  const source = await sharp(compositePath).webp({ quality: 88 }).toBuffer();

  if (width < 1600 || height < 850) {
    const fallback = await sharp(compositePath).resize(1200, 700, { fit: "cover" }).webp({ quality: 88 }).toBuffer();
    return { source, main: fallback, secondary_1: fallback, secondary_2: fallback, secondary_3: fallback };
  }

  const mainHeight = Math.round(height * 0.625);
  const paddedMainHeight = Math.round(width / (971 / 425));
  const main = await sharp(compositePath)
    .extract({ height: mainHeight, left: 0, top: 0, width })
    .extend({ background: "white", bottom: Math.max(0, paddedMainHeight - mainHeight) })
    .webp({ quality: 88 })
    .toBuffer();
  const secondaryTop = Math.round(height * 0.627);
  const secondaryHeight = Math.min(Math.round(height * 0.352), height - secondaryTop);
  const secondaryWidth = Math.round(width * 0.316);
  const secondaryStarts = [0.017, 0.34, 0.662].map((ratio) => Math.round(width * ratio));
  const secondaries = await Promise.all(secondaryStarts.map((left) => sharp(compositePath)
    .extract({ height: secondaryHeight, left, top: secondaryTop, width: Math.min(secondaryWidth, width - left) })
    .resize(1200, 746, { fit: "cover" })
    .webp({ quality: 88 })
    .toBuffer()));

  return { source, main, secondary_1: secondaries[0], secondary_2: secondaries[1], secondary_3: secondaries[2] };
}

async function saveImages(admin: AdminClient, createdBy: string, productId: string, product: CatalogV02Product, buffers: Awaited<ReturnType<typeof imageBuffers>>) {
  for (const slot of imageSlots) {
    const storagePath = `catalog-v02/${storageCode(product.code)}/${slot}.webp`;
    const upload = await admin.storage.from("product-images").upload(storagePath, buffers[slot], {
      contentType: "image/webp",
      upsert: true,
    });
    if (upload.error) {
      throw new Error(`No se pudo subir ${product.code}/${slot}: ${upload.error.message}`);
    }

    const existing = await admin.from("product_images")
      .select("id")
      .eq("product_id", productId)
      .eq("slot", slot)
      .eq("storage_path", storagePath)
      .maybeSingle();
    if (existing.error) {
      throw new Error(`No se pudo buscar ${product.code}/${slot}: ${existing.error.message}`);
    }
    let imageId: string | undefined = existing.data?.id;
    if (!imageId) {
      const inserted = await admin.from("product_images").insert({
        created_by: createdBy,
        generated_by_ai: false,
        product_id: productId,
        slot,
        status: "pending",
        storage_path: storagePath,
      }).select("id").single();
      if (inserted.error || !inserted.data) {
        throw new Error(`No se pudo registrar ${product.code}/${slot}: ${inserted.error?.message ?? "sin datos"}`);
      }
      imageId = inserted.data.id;
    }
    const approved = await admin.rpc("approve_product_image", { target_image_id: imageId });
    if (approved.error) {
      throw new Error(`No se pudo aprobar ${product.code}/${slot}: ${approved.error.message}`);
    }
  }
}

async function run() {
  const pdfPath = process.argv[2];
  if (!pdfPath) {
    throw new Error("Uso: npm run import:catalog-v02 -- /ruta/al/catalogo.pdf");
  }
  const env = envSchema.parse(process.env);
  const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const workdir = await mkdtemp(join(tmpdir(), "catalog-v02-"));

  try {
    const categories = assertData(
      (await admin.from("categories").upsert(categoryRows, { onConflict: "slug" }).select("id,slug")).data,
      null,
      "No se pudieron guardar las categorías",
    );
    const categoryIds = new Map(categories.map((category) => [category.slug, category.id]));
    const cuts = Object.entries(cutRows).flatMap(([category, values]) => values.map(([slug, name], sortOrder) => ({
      category_id: categoryIds.get(category), name, slug, sort_order: sortOrder,
    })));
    if (cuts.some((cut) => !cut.category_id)) {
      throw new Error("No se pudieron resolver las categorías de los cortes.");
    }
    const savedCuts = assertData(
      (await admin.from("cuts").upsert(cuts, { onConflict: "category_id,slug" }).select("id,category_id,slug")).data,
      null,
      "No se pudieron guardar los cortes",
    );
    const cutIds = new Map(savedCuts.map((cut) => [`${cut.category_id}/${cut.slug}`, cut.id]));
    const profiles = assertData(
      (await admin.from("profiles").select("id,role").eq("status", "active").order("created_at").limit(20)).data,
      null,
      "No se pudo buscar un usuario activo",
    );
    const createdBy = profiles.find((profile) => profile.role === "admin")?.id ?? profiles[0]?.id;
    if (!createdBy) {
      throw new Error("Se necesita al menos un usuario activo para atribuir la importación.");
    }

    const productIds: string[] = [];
    for (const [index, product] of catalogV02Products.entries()) {
      const categoryId = categoryIds.get(product.category);
      const cutId = categoryId ? cutIds.get(`${categoryId}/${product.cut}`) : undefined;
      if (!categoryId || !cutId) {
        throw new Error(`No existe ${product.category}/${product.cut}.`);
      }
      const saved = assertData(
        (await admin.from("products").upsert({
          box_weight: product.boxWeight,
          brand: product.brand,
          category_id: categoryId,
          code: product.code,
          created_by: createdBy,
          cut_id: cutId,
          eyebrow: product.eyebrow,
          format: product.format,
          origin: product.origin,
          status: "active",
          title: product.title,
          units: product.units,
          updated_by: createdBy,
        }, { onConflict: "code" }).select("id").single()).data,
        null,
        `No se pudo guardar ${product.code}`,
      );
      productIds.push(saved.id);

      const composite = await extractComposite(pdfPath, product.page, workdir);
      await saveImages(admin, createdBy, saved.id, product, await imageBuffers(composite));
      console.log(`[${index + 1}/${catalogV02Products.length}] ${product.code} · ${product.title}`);
    }

    const obsoleteSeedProduct = await admin.from("products")
      .select("id")
      .eq("code", "CF-1607\nCF-1608")
      .eq("title", "Costillar de Cerdo")
      .maybeSingle();
    if (obsoleteSeedProduct.error) {
      throw new Error(`No se pudo buscar el producto obsoleto del seed: ${obsoleteSeedProduct.error.message}`);
    }
    if (obsoleteSeedProduct.data) {
      const obsoleteItems = await admin.from("catalog_items").delete().eq("product_id", obsoleteSeedProduct.data.id);
      const obsoleteSeed = await admin.from("products").delete().eq("id", obsoleteSeedProduct.data.id);
      if (obsoleteItems.error || obsoleteSeed.error) {
        throw new Error(`No se pudo retirar el producto obsoleto del seed: ${obsoleteItems.error?.message ?? obsoleteSeed.error?.message}`);
      }
    }

    const catalog = await admin.from("catalogs")
      .select("id")
      .eq("title", "Catálogo Oficial Todo Carnes")
      .order("created_at")
      .limit(1)
      .maybeSingle();
    if (catalog.error) {
      throw new Error(`No se pudo buscar el catálogo de muestra: ${catalog.error.message}`);
    }
    if (catalog.data) {
      const catalogId = catalog.data.id;
      const items = await admin.from("catalog_items").upsert(productIds.map((productId, sortOrder) => ({
        catalog_id: catalogId,
        product_id: productId,
        sort_order: sortOrder,
      })), { onConflict: "catalog_id,product_id" });
      if (items.error) {
        throw new Error(`No se pudo completar el catálogo de muestra: ${items.error.message}`);
      }
    }

    const productCount = await admin.from("products").select("id", { count: "exact", head: true });
    const imageCount = await admin.from("product_images").select("id", { count: "exact", head: true }).eq("status", "approved");
    console.log(`Importación completada: ${catalogV02Products.length} fichas procesadas, ${productCount.count ?? 0} productos y ${imageCount.count ?? 0} imágenes aprobadas en la base.`);
  } finally {
    await rm(workdir, { force: true, recursive: true });
  }
}

run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Falló la importación.");
  process.exitCode = 1;
});
