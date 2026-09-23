import { createHash } from "node:crypto";
import type { Dirent } from "node:fs";
import { access, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { assignFolderOwners, matchFolder, type MatchResult } from "../../lib/import/match";
import { normalizeName, tokens } from "../../lib/import/normalize";
import { renderImage, type RenderSlot } from "../../lib/import/render";
import { assignSlots, type AssignedSlot } from "../../lib/import/slots";
import { catalogoJulio2026Products, type CatalogoJulio2026Product } from "./catalogo-julio-2026-products";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

const idSchema = z.object({ id: z.string().uuid() });
const categoriesSchema = z.array(z.object({ id: z.string().uuid(), slug: z.string() }));
const cutsSchema = z.array(z.object({ category_id: z.string().uuid(), id: z.string().uuid(), slug: z.string() }));
const profilesSchema = z.array(z.object({ id: z.string().uuid(), role: z.string() }));

const categoryRows = [
  { icon_key: "pig", name: "Cerdo", slug: "cerdo", sort_order: 0 },
  { icon_key: "chicken", name: "Pollo", slug: "pollo", sort_order: 1 },
  { icon_key: "cow", name: "Vacuno", slug: "vacuno", sort_order: 2 },
  { icon_key: "trimming", name: "Trimming", slug: "trimming", sort_order: 3 },
] as const;

const cutRows = {
  cerdo: [["costillar", "Costillar"], ["baby-back-ribs", "Baby Back Ribs"], ["chuletas", "Chuletas"], ["lomo-centro", "Lomo Centro"], ["pulpa-pierna", "Pulpa Pierna"], ["panceta", "Panceta"]],
  pollo: [["pechuga", "Pechuga"], ["filetillo", "Filetillo"], ["trutros", "Trutros"], ["pollo-entero", "Pollo Entero"]],
  vacuno: [["posta", "Posta"], ["higado", "Hígado"]],
  trimming: [["50-50", "50/50"], ["70-30", "70/30"], ["80-20", "80/20"], ["90-10", "90/10"]],
} as const;

type CategorySlug = keyof typeof cutRows;
type AdminClient = SupabaseClient;
type CliOptions = { dryRun: boolean; optimizadas: string; pdf: string; reaprobar: boolean; sesion: string };
type EligibleFile = { file: string; hash: string; path: string };
type SessionPlan = {
  assigned: (AssignedSlot & EligibleFile)[];
  duplicateWarnings: string[];
  folderName: string;
  folderPath: string;
  match: MatchResult;
  ownsApprovedSlots: boolean;
};
type OptimizedPlan = {
  category: string;
  code: string;
  files: EligibleFile[];
  folder: string;
};
type ReportRow = {
  archivo: string;
  carpeta: string;
  estado: string;
  margen: number;
  producto: string;
  score: number;
  slot: string;
  veredicto: MatchResult["verdict"];
};

function byteCompare(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function parseArguments(argv: string[]): CliOptions {
  const values = new Map<string, string>();
  const flags = new Set<string>();
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--dry-run" || argument === "--reaprobar") {
      flags.add(argument);
      continue;
    }
    if (["--pdf", "--sesion", "--optimizadas"].includes(argument)) {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) throw new Error(`Falta el valor de ${argument}.`);
      values.set(argument, value);
      index += 1;
      continue;
    }
    throw new Error(`Argumento desconocido: ${argument}`);
  }
  const pdf = values.get("--pdf");
  const sesion = values.get("--sesion");
  const optimizadas = values.get("--optimizadas");
  if (!pdf || !sesion || !optimizadas) {
    throw new Error("Uso: import:catalogo-julio -- --pdf <archivo> --sesion <carpeta> --optimizadas <carpeta> [--dry-run] [--reaprobar]");
  }
  return { dryRun: flags.has("--dry-run"), optimizadas, pdf, reaprobar: flags.has("--reaprobar"), sesion };
}

async function sha1(path: string): Promise<string> {
  return createHash("sha1").update(await readFile(path)).digest("hex");
}

function productCode(product: CatalogoJulio2026Product | null): string {
  return product?.code.match(/CF-\d+/)?.[0] ?? "sin-codigo";
}

function folderTitle(folderName: string): string {
  return folderName.replace(/^foto\s+\d+\s*-?\s*/i, "").trim() || folderName;
}

function slug(value: string): string {
  return normalizeName(value).replace(/\s+/g, "-");
}

function inferCategoryAndCut(folderName: string): { category: CategorySlug; cut: string; realCut: string } {
  const values = new Set(tokens(folderName));
  if (["trimming", "50", "70", "80", "90"].some((token) => values.has(token))) {
    const ratio = ["50", "70", "80", "90"].find((token) => values.has(token)) ?? "50";
    return { category: "trimming", cut: `${ratio}-${100 - Number(ratio)}`, realCut: folderTitle(folderName) };
  }
  if (["pollo", "pechuga", "filetillo", "trutro", "ala"].some((token) => values.has(token))) {
    const cut = values.has("pechuga") ? "pechuga" : values.has("filetillo") ? "filetillo" : values.has("entero") ? "pollo-entero" : "trutros";
    return { category: "pollo", cut, realCut: folderTitle(folderName) };
  }
  if (["vacuno", "corazon", "lengua", "higado"].some((token) => values.has(token))) {
    return { category: "vacuno", cut: values.has("higado") ? "higado" : "posta", realCut: folderTitle(folderName) };
  }
  const cut = values.has("lomo") ? "lomo-centro"
    : values.has("chuletas") ? "chuletas"
      : values.has("panceta") ? "panceta"
        : values.has("pulpa") ? "pulpa-pierna"
          : values.has("baby") ? "baby-back-ribs"
            : "costillar";
  return { category: "cerdo", cut, realCut: folderTitle(folderName) };
}

async function sessionPlans(root: string): Promise<SessionPlan[]> {
  const directories = (await readdir(root, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort(byteCompare);
  const matches = assignFolderOwners(directories.map((folderName) => ({
    folderName,
    match: matchFolder(folderName, catalogoJulio2026Products),
  })));
  const matchByFolder = new Map(matches.map((item) => [item.folderName, item]));
  const usedHashes = new Map<string, string>();
  const plans: SessionPlan[] = [];

  for (const folderName of directories) {
    const folderPath = join(root, folderName);
    const entries = (await readdir(folderPath, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && /\.(?:jpe?g|png)$/i.test(entry.name))
      .map((entry) => entry.name)
      .sort(byteCompare);
    const eligible: EligibleFile[] = [];
    const duplicateWarnings: string[] = [];
    for (const file of entries) {
      const path = join(folderPath, file);
      const hash = await sha1(path);
      const first = usedHashes.get(hash);
      if (first) {
        duplicateWarnings.push(`${file} duplica ${first}`);
        continue;
      }
      usedHashes.set(hash, `${folderName}/${file}`);
      eligible.push({ file, hash, path });
    }
    const fileByName = new Map(eligible.map((item) => [item.file, item]));
    const owner = matchByFolder.get(folderName);
    if (!owner) throw new Error(`No se pudo resolver ${folderName}.`);
    plans.push({
      assigned: assignSlots(eligible.map((item) => item.file)).map((assignment) => ({ ...assignment, ...fileByName.get(assignment.file)! })),
      duplicateWarnings,
      folderName,
      folderPath,
      match: owner.match,
      ownsApprovedSlots: owner.ownsApprovedSlots,
    });
  }
  return plans;
}

function isMissingDirectory(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

async function optimizedPlans(root: string, productsWithSession: Set<string>): Promise<OptimizedPlan[]> {
  const plans: OptimizedPlan[] = [];
  for (const category of ["cerdo", "pollo", "vacuno", "trimming"]) {
    const categoryPath = join(root, category);
    let entries: Dirent[];
    try {
      entries = await readdir(categoryPath, { withFileTypes: true });
    } catch (error: unknown) {
      if (isMissingDirectory(error)) continue;
      throw error;
    }
    const folders = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort(byteCompare);
    for (const folder of folders) {
      const code = folder.match(/CF-\d+/)?.[0];
      if (!code || productsWithSession.has(code)) continue;
      const folderPath = join(categoryPath, folder);
      const files = (await readdir(folderPath, { withFileTypes: true }))
        .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".webp"))
        .map((entry) => entry.name)
        .sort(byteCompare);
      const eligible: EligibleFile[] = [];
      for (const file of files) {
        const path = join(folderPath, file);
        eligible.push({ file, hash: await sha1(path), path });
      }
      plans.push({ category, code, files: eligible, folder });
    }
  }
  return plans;
}

function optimizedReportRows(plans: OptimizedPlan[]): ReportRow[] {
  const slots: AssignedSlot["slot"][] = ["main", "secondary_1", "secondary_2", "secondary_3"];
  return plans.flatMap((plan) => plan.files.map((file, index) => ({
    archivo: file.file,
    carpeta: `${plan.category}/${plan.folder}`,
    estado: index < slots.length ? "approved" : "pending",
    margen: 50,
    producto: plan.code,
    score: 50,
    slot: slots[index] ?? "secondary_2",
    veredicto: "matched",
  })));
}

function reportRows(plans: SessionPlan[]): ReportRow[] {
  return plans.flatMap((plan) => {
    const product = plan.match.candidate ? productCode(plan.match.candidate as CatalogoJulio2026Product) : `nuevo:${slug(plan.folderName)}`;
    const assigned: ReportRow[] = plan.assigned.map((item) => ({
      archivo: item.file,
      carpeta: plan.folderName,
      estado: plan.ownsApprovedSlots ? item.status : "pending",
      margen: plan.match.margin,
      producto: product,
      score: plan.match.score,
      slot: item.slot,
      veredicto: plan.match.verdict,
    }));
    const duplicates: ReportRow[] = plan.duplicateWarnings.map((warning) => ({
      archivo: warning,
      carpeta: plan.folderName,
      estado: "omitido-duplicado",
      margen: plan.match.margin,
      producto: product,
      score: plan.match.score,
      slot: "-",
      veredicto: plan.match.verdict,
    }));
    return assigned.concat(duplicates);
  });
}

function csvCell(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

async function writeDryRun(rows: ReportRow[]): Promise<string> {
  const path = join(process.cwd(), "catalogo-julio-2026-dry-run.csv");
  const keys = ["carpeta", "producto", "score", "margen", "veredicto", "archivo", "slot", "estado"] as const;
  const content = [keys.join(","), ...rows.map((row) => keys.map((key) => csvCell(row[key])).join(","))].join("\n");
  await writeFile(path, `${content}\n`, "utf8");
  return path;
}

async function databaseContext(admin: AdminClient) {
  const categoriesResult = await admin.from("categories").upsert(categoryRows, { onConflict: "slug" }).select("id,slug");
  if (categoriesResult.error) throw new Error(`No se pudieron guardar las categorías: ${categoriesResult.error.message}`);
  const categories = categoriesSchema.parse(categoriesResult.data);
  const categoryIds = new Map(categories.map((category) => [category.slug, category.id]));
  const cutsToSave = Object.entries(cutRows).flatMap(([category, values]) => values.map(([cutSlug, name], sortOrder) => ({
    category_id: categoryIds.get(category), name, slug: cutSlug, sort_order: sortOrder,
  })));
  if (cutsToSave.some((cut) => !cut.category_id)) throw new Error("No se resolvieron las categorías de los cortes.");
  const cutsResult = await admin.from("cuts").upsert(cutsToSave, { onConflict: "category_id,slug" }).select("id,category_id,slug");
  if (cutsResult.error) throw new Error(`No se pudieron guardar los cortes: ${cutsResult.error.message}`);
  const cuts = cutsSchema.parse(cutsResult.data);
  const cutIds = new Map(cuts.map((cut) => [`${cut.category_id}/${cut.slug}`, cut.id]));
  const profilesResult = await admin.from("profiles").select("id,role").eq("status", "active").order("created_at");
  if (profilesResult.error) throw new Error(`No se pudo buscar un usuario activo: ${profilesResult.error.message}`);
  const profiles = profilesSchema.parse(profilesResult.data);
  const createdBy = profiles.find((profile) => profile.role === "admin")?.id ?? profiles[0]?.id;
  if (!createdBy) throw new Error("Se necesita un perfil admin activo para atribuir la importación.");
  return { categoryIds, createdBy, cutIds };
}

async function savePdfProducts(admin: AdminClient, context: Awaited<ReturnType<typeof databaseContext>>) {
  const byCode = new Map<string, string>();
  const orderedIds: string[] = [];
  for (const [index, product] of catalogoJulio2026Products.entries()) {
    const categoryId = context.categoryIds.get(product.category);
    const cutId = categoryId ? context.cutIds.get(`${categoryId}/${product.cut}`) : undefined;
    if (!categoryId || !cutId) throw new Error(`No existe ${product.category}/${product.cut}.`);
    const result = await admin.from("products").upsert({
      box_weight: product.boxWeight, brand: product.brand, category_id: categoryId, code: product.code,
      created_by: context.createdBy, cut_id: cutId, eyebrow: product.eyebrow, format: product.format,
      import_ref: null, notes: null, origin: product.origin, status: "draft", title: product.title,
      units: product.units, updated_by: context.createdBy,
    }, { onConflict: "code" }).select("id").single();
    if (result.error) throw new Error(`No se pudo guardar ${product.code}: ${result.error.message}`);
    const id = idSchema.parse(result.data).id;
    orderedIds.push(id);
    for (const code of product.code.match(/CF-\d+/g) ?? []) byCode.set(code, id);
    console.log(`[${index + 1}/${catalogoJulio2026Products.length}] producto ${product.code.replace(/\n/g, "/")}`);
  }
  return { byCode, orderedIds };
}

async function saveUnmatchedProduct(admin: AdminClient, context: Awaited<ReturnType<typeof databaseContext>>, folderName: string): Promise<string> {
  const inferred = inferCategoryAndCut(folderName);
  const categoryId = context.categoryIds.get(inferred.category);
  const cutId = categoryId ? context.cutIds.get(`${categoryId}/${inferred.cut}`) : undefined;
  if (!categoryId || !cutId) throw new Error(`No se pudo inferir categoría/corte para ${folderName}.`);
  const importRef = `sesion:${slug(folderName)}`;
  const values = {
    box_weight: null, brand: null, category_id: categoryId, code: null, created_by: context.createdBy,
    cut_id: cutId, eyebrow: folderTitle(folderName), format: null, import_ref: importRef,
    notes: `Importado desde ${folderName}. Corte original: ${inferred.realCut}.`, origin: null,
    status: "draft", title: folderTitle(folderName), units: null, updated_by: context.createdBy,
  };
  const existing = await admin.from("products").select("id").eq("import_ref", importRef).maybeSingle();
  if (existing.error) throw new Error(`No se pudo buscar ${folderName}: ${existing.error.message}`);
  if (existing.data) {
    const id = idSchema.parse(existing.data).id;
    const updated = await admin.from("products").update(values).eq("id", id);
    if (updated.error) throw new Error(`No se pudo actualizar ${folderName}: ${updated.error.message}`);
    return id;
  }
  const inserted = await admin.from("products").insert(values).select("id").single();
  if (inserted.error) throw new Error(`No se pudo crear ${folderName}: ${inserted.error.message}`);
  return idSchema.parse(inserted.data).id;
}

async function saveImage(admin: AdminClient, input: {
  createdBy: string;
  file: EligibleFile;
  productId: string;
  reapprove: boolean;
  slot: RenderSlot;
  sortOrder: number;
  sourceKind: "catalog_pdf" | "session";
  sourceRef: string;
  status: "approved" | "pending";
  storageRef: string;
}) {
  const buffer = await renderImage(input.file.path, input.slot);
  const storagePath = `import/${input.storageRef}/${input.slot}/${input.file.hash.slice(0, 8)}.webp`;
  const upload = await admin.storage.from("product-images").upload(storagePath, buffer, { contentType: "image/webp", upsert: true });
  if (upload.error) throw new Error(`No se pudo subir ${input.sourceRef}: ${upload.error.message}`);
  const existingResult = await admin.from("product_images")
    .select("id,slot,status")
    .eq("product_id", input.productId)
    .eq("source_ref", input.sourceRef)
    .maybeSingle();
  if (existingResult.error) throw new Error(`No se pudo buscar ${input.sourceRef}: ${existingResult.error.message}`);
  let imageId: string;
  let currentStatus: string;
  if (existingResult.data) {
    const existing = z.object({ id: z.string().uuid(), slot: z.string(), status: z.string() }).parse(existingResult.data);
    const update = await admin.from("product_images").update({
      generated_by_ai: false,
      slot: existing.status === "approved" ? existing.slot : input.slot,
      sort_order: input.sortOrder,
      source_kind: input.sourceKind,
      storage_path: storagePath,
    }).eq("id", existing.id);
    if (update.error) throw new Error(`No se pudo actualizar ${input.sourceRef}: ${update.error.message}`);
    imageId = existing.id;
    currentStatus = existing.status;
  } else {
    const insert = await admin.from("product_images").insert({
      created_by: input.createdBy, generated_by_ai: false, product_id: input.productId, prompt_used: null,
      slot: input.slot, sort_order: input.sortOrder, source_kind: input.sourceKind, source_ref: input.sourceRef,
      status: "pending", storage_path: storagePath,
    }).select("id").single();
    if (insert.error) throw new Error(`No se pudo registrar ${input.sourceRef}: ${insert.error.message}`);
    imageId = idSchema.parse(insert.data).id;
    currentStatus = "pending";
  }
  if (input.status !== "approved" || (currentStatus === "approved" && !input.reapprove)) return;
  const approvedInSlot = await admin.from("product_images").select("id").eq("product_id", input.productId).eq("slot", input.slot).eq("status", "approved").maybeSingle();
  if (approvedInSlot.error) throw new Error(`No se pudo revisar el slot ${input.slot}: ${approvedInSlot.error.message}`);
  if (approvedInSlot.data && !input.reapprove) return;
  const approval = await admin.rpc("approve_product_image", { target_image_id: imageId });
  if (approval.error) throw new Error(`No se pudo aprobar ${input.sourceRef}: ${approval.error.message}`);
}

async function importSession(admin: AdminClient, context: Awaited<ReturnType<typeof databaseContext>>, plans: SessionPlan[], productIds: Map<string, string>, reapprove: boolean) {
  const productsWithSession = new Set<string>();
  for (const [folderIndex, plan] of plans.entries()) {
    const matchedCode = plan.match.candidate ? productCode(plan.match.candidate as CatalogoJulio2026Product) : null;
    const productId = matchedCode ? productIds.get(matchedCode) : await saveUnmatchedProduct(admin, context, plan.folderName);
    if (!productId) throw new Error(`No se encontró el producto de ${plan.folderName}.`);
    if (matchedCode) productsWithSession.add(matchedCode);
    const refProduct = matchedCode?.toLowerCase() ?? slug(plan.folderName);
    const hero = plan.assigned.find((item) => item.slot === "main" && item.status === "approved");
    if (hero && plan.ownsApprovedSlots) {
      await saveImage(admin, {
        createdBy: context.createdBy, file: hero, productId, reapprove, slot: "source", sortOrder: 0,
        sourceKind: "session", sourceRef: `sesion/${plan.folderName}/${hero.file}#source`, status: "approved",
        storageRef: `sesion/${refProduct}`,
      });
    }
    for (const item of plan.assigned) {
      await saveImage(admin, {
        createdBy: context.createdBy, file: item, productId, reapprove, slot: item.slot, sortOrder: item.order,
        sourceKind: "session", sourceRef: `sesion/${plan.folderName}/${item.file}`,
        status: plan.ownsApprovedSlots ? item.status : "pending", storageRef: `sesion/${refProduct}`,
      });
    }
    console.log(`[${folderIndex + 1}/${plans.length}] sesión ${plan.folderName} → ${matchedCode ?? "producto nuevo"}`);
  }
  return productsWithSession;
}

async function importOptimized(admin: AdminClient, context: Awaited<ReturnType<typeof databaseContext>>, plans: OptimizedPlan[], productIds: Map<string, string>, reapprove: boolean) {
  let imported = 0;
  for (const plan of plans) {
    const productId = productIds.get(plan.code);
    if (!productId) continue;
    const slots: AssignedSlot["slot"][] = ["main", "secondary_1", "secondary_2", "secondary_3"];
    for (const [index, file] of plan.files.entries()) {
        const slot = slots[index] ?? "secondary_2";
        const status = index < slots.length ? "approved" : "pending";
        await saveImage(admin, {
          createdBy: context.createdBy, file, productId, reapprove, slot, sortOrder: index,
          sourceKind: "catalog_pdf", sourceRef: `catalogo-pdf/${plan.category}/${plan.folder}/${file.file}`, status,
          storageRef: `catalog-pdf/${plan.code.toLowerCase()}`,
        });
        if (index === 0) {
          await saveImage(admin, {
            createdBy: context.createdBy, file, productId, reapprove, slot: "source", sortOrder: 0,
            sourceKind: "catalog_pdf", sourceRef: `catalogo-pdf/${plan.category}/${plan.folder}/${file.file}#source`, status: "approved",
            storageRef: `catalog-pdf/${plan.code.toLowerCase()}`,
          });
        }
        imported += 1;
    }
  }
  console.log(`Imágenes de catálogo PDF importadas: ${imported}.`);
}

async function rebuildCatalog(admin: AdminClient, orderedIds: string[]) {
  const catalogResult = await admin.from("catalogs").select("id").eq("title", "Catálogo Oficial Todo Carnes").order("created_at").limit(1).maybeSingle();
  if (catalogResult.error || !catalogResult.data) throw new Error(`No se encontró el catálogo oficial: ${catalogResult.error?.message ?? "sin datos"}`);
  const catalogId = idSchema.parse(catalogResult.data).id;
  const removal = await admin.from("catalog_items").delete().eq("catalog_id", catalogId);
  if (removal.error) throw new Error(`No se pudo vaciar el catálogo: ${removal.error.message}`);
  const insertion = await admin.from("catalog_items").insert(orderedIds.map((productId, sortOrder) => ({ catalog_id: catalogId, product_id: productId, sort_order: sortOrder })));
  if (insertion.error) throw new Error(`No se pudo reconstruir el catálogo: ${insertion.error.message}`);
}

async function removeObsoleteProducts(admin: AdminClient) {
  const result = await admin.from("products").select("id,code,import_ref");
  if (result.error) throw new Error(`No se pudieron revisar productos obsoletos: ${result.error.message}`);
  const rows = z.array(z.object({ code: z.string().nullable(), id: z.string().uuid(), import_ref: z.string().nullable() })).parse(result.data);
  const validCodes = new Set(catalogoJulio2026Products.map((product) => product.code));
  const obsoleteIds = rows.filter((row) => !row.import_ref && (!row.code || !validCodes.has(row.code))).map((row) => row.id);
  if (obsoleteIds.length === 0) return;
  const items = await admin.from("catalog_items").delete().in("product_id", obsoleteIds);
  const products = await admin.from("products").delete().in("id", obsoleteIds);
  if (items.error || products.error) throw new Error(`No se pudieron retirar productos obsoletos: ${items.error?.message ?? products.error?.message}`);
}

async function run() {
  const options = parseArguments(process.argv.slice(2));
  await Promise.all([access(options.pdf), access(options.sesion), access(options.optimizadas)]);
  const plans = await sessionPlans(options.sesion);
  const sessionCodes = new Set(plans.flatMap((plan) => plan.match.candidate ? [productCode(plan.match.candidate as CatalogoJulio2026Product)] : []));
  const optimized = await optimizedPlans(options.optimizadas, sessionCodes);
  const rows = reportRows(plans).concat(optimizedReportRows(optimized));
  const uniqueImages = plans.reduce((total, plan) => total + plan.assigned.length, 0);
  const duplicateImages = plans.reduce((total, plan) => total + plan.duplicateWarnings.length, 0);
  console.log(`Sesión: ${plans.length} carpetas, ${uniqueImages} imágenes únicas, ${duplicateImages} duplicadas omitidas.`);
  console.log(`Catálogo PDF: ${optimized.length} carpetas de respaldo, ${optimized.reduce((total, plan) => total + plan.files.length, 0)} imágenes elegibles.`);

  if (options.dryRun) {
    const reportPath = await writeDryRun(rows);
    console.log(`Dry-run completo, sin conexión a Supabase ni Storage. Reporte: ${reportPath}`);
    return;
  }

  const env = envSchema.parse(process.env);
  const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
  const context = await databaseContext(admin);
  const products = await savePdfProducts(admin, context);
  await importSession(admin, context, plans, products.byCode, options.reaprobar);
  await importOptimized(admin, context, optimized, products.byCode, options.reaprobar);
  await removeObsoleteProducts(admin);
  await rebuildCatalog(admin, products.orderedIds);
  console.log("Importación de julio 2026 completada.");
}

run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Falló la importación del catálogo de julio.");
  process.exitCode = 1;
});
