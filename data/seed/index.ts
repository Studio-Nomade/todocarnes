import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { imagePrompts } from "./prompts";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SEED_ADMIN_EMAIL: z.string().email(),
  SEED_ADMIN_NAME: z.string().min(1).default("Administrador"),
  SEED_ADMIN_PASSWORD: z.string().min(8),
  SEED_COMMERCIAL_EMAIL: z.string().email(),
  SEED_COMMERCIAL_NAME: z.string().min(1).default("Comercial"),
  SEED_COMMERCIAL_PASSWORD: z.string().min(8),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

const categories = [
  { icon_key: "pig", name: "Cerdo", slug: "cerdo", sort_order: 0 },
  { icon_key: "chicken", name: "Pollo", slug: "pollo", sort_order: 1 },
  { icon_key: "cow", name: "Vacuno", slug: "vacuno", sort_order: 2 },
  { icon_key: "trimming", name: "Trimming", slug: "trimming", sort_order: 3 },
];

const cutsByCategory = {
  cerdo: ["Costillar", "Baby Back Ribs", "Chuletas", "Lomo Centro", "Pulpa Pierna", "Panceta"],
  pollo: ["Pechuga", "Filetillo", "Trutros", "Pollo Entero"],
  trimming: ["50/50", "70/30", "80/20", "90/10"],
  vacuno: ["Posta", "Hígado"],
} as const;

const slugByName: Record<string, string> = {
  "50/50": "50-50",
  "70/30": "70-30",
  "80/20": "80-20",
  "90/10": "90-10",
  "Baby Back Ribs": "baby-back-ribs",
  Chuletas: "chuletas",
  Costillar: "costillar",
  Filetillo: "filetillo",
  Hígado: "higado",
  "Lomo Centro": "lomo-centro",
  Panceta: "panceta",
  Pechuga: "pechuga",
  "Pollo Entero": "pollo-entero",
  Posta: "posta",
  "Pulpa Pierna": "pulpa-pierna",
  Trutros: "trutros",
};

const products = [
  {
    box_weight: "8 KG (Peso Variable)",
    brand: "Notable",
    category_slug: "cerdo",
    code: "CF-1608",
    cut_slug: "costillar",
    eyebrow: "Costillar Brasil",
    format: "Vacío",
    origin: "Brasil",
    title: "Costillar de Cerdo Notable",
    units: "7-8 x caja",
  },
  {
    box_weight: null,
    brand: null,
    category_slug: "cerdo",
    code: "CF-1586",
    cut_slug: "chuletas",
    eyebrow: "Chuletas de Cerdo",
    format: null,
    origin: null,
    title: "Punta Chuleta Vetada",
    units: null,
  },
  {
    box_weight: "14,4 / 15,2 / 16 / 16,8 / 17,6 KGS",
    brand: "Languiru",
    category_slug: "pollo",
    code: "CF-1600\nCF-1601\nCF-1602\nCF-1603\nCF-1604",
    cut_slug: "pollo-entero",
    eyebrow: "Pollo Entero",
    format: null,
    origin: "Brasil",
    title: "Pollo Entero Languiru sin Menudencias",
    units: "8 unidades x caja",
  },
  {
    box_weight: "15 KG",
    brand: "Languiru",
    category_slug: "pollo",
    code: "CF-1580",
    cut_slug: "pechuga",
    eyebrow: "Pechuga de Pollo",
    format: "Embolsada",
    origin: "Brasil",
    title: "Pechuga con Hueso Individual Languiru",
    units: "Individual",
  },
  {
    box_weight: "20 KG (Peso Variable)",
    brand: "Minerva",
    category_slug: "vacuno",
    code: "CF-1588",
    cut_slug: "posta",
    eyebrow: "Posta de Vacuno",
    format: "Envasado / caja",
    origin: "Brasil",
    title: "Posta Rosada Congelada Pul",
    units: "3-4 unidades x caja",
  },
  {
    box_weight: "13,61 KGS Fijo",
    brand: "FLP Foods",
    category_slug: "vacuno",
    code: "CF-1577",
    cut_slug: "higado",
    eyebrow: "Vacuno",
    format: "Bloque, bolsa colectiva",
    origin: "USA",
    title: "Hígado de Vacuno FLP Foods",
    units: "-",
  },
  {
    box_weight: "20 KG",
    brand: "Todo Carnes",
    category_slug: "trimming",
    code: "CF-1004",
    cut_slug: "50-50",
    eyebrow: "Posta de Vacuno",
    format: "Granel",
    origin: "Nacional",
    title: "Triming 50/50",
    units: "N/A",
  },
  {
    box_weight: "20 KG",
    brand: "Todo Carnes",
    category_slug: "trimming",
    code: "CF-1046",
    cut_slug: "90-10",
    eyebrow: "Posta de Vacuno",
    format: "Granel",
    origin: "Nacional",
    title: "Triming 90/10",
    units: "N/A",
  },
] as const;

const authUsersSchema = z.object({
  users: z.array(z.object({ email: z.string().email().nullable(), id: z.string().uuid() })),
});

const authUserSchema = z.object({ id: z.string().uuid() });

function assertNoError(error: { message: string } | null, context: string) {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}

const MAX_AUTH_ATTEMPTS = 8;

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// El endpoint admin de GoTrue devuelve de forma intermitente 403 `bad_jwt`
// ("unrecognized JWT kid <nil> for algorithm ES256") mientras la plataforma
// propaga las nuevas API keys / claves asimétricas del proyecto. El plano de
// datos (PostgREST) y el login son estables; solo esta ruta oscila. Es una
// flakiness de infraestructura, no un problema de credenciales, así que la
// absorbemos con reintentos acotados en lugar de recurrir a keys legacy.
function isTransientAuthError(status: number, detail: string | null): boolean {
  if (status >= 500) {
    return true;
  }
  if (status !== 401 && status !== 403) {
    return false;
  }
  const text = detail?.toLowerCase() ?? "";
  return text.includes("unable to parse or verify signature") || text.includes("unrecognized jwt kid");
}

async function authAdminRequest(
  baseUrl: string,
  secretKey: string,
  path: string,
  init?: RequestInit,
) {
  let lastDetail: string | null = null;
  let lastStatus = 0;

  for (let attempt = 1; attempt <= MAX_AUTH_ATTEMPTS; attempt += 1) {
    const response = await fetch(`${baseUrl}/auth/v1/admin${path}`, {
      ...init,
      headers: { apikey: secretKey, "Content-Type": "application/json" },
    });

    if (response.ok) {
      return response;
    }

    const body: unknown = await response.json().catch(() => null);
    const parsed = z.object({ message: z.string().optional(), msg: z.string().optional() }).safeParse(body);
    lastDetail = parsed.success ? (parsed.data.message ?? parsed.data.msg ?? null) : null;
    lastStatus = response.status;

    if (!isTransientAuthError(response.status, lastDetail) || attempt === MAX_AUTH_ATTEMPTS) {
      break;
    }

    await delay(400 * attempt);
  }

  throw new Error(`Auth Admin ${path}: ${lastDetail ?? `HTTP ${lastStatus}`}`);
}

async function ensureUser(
  supabase: SupabaseClient,
  auth: { baseUrl: string; secretKey: string },
  input: { email: string; name: string; password: string; role: "admin" | "commercial" },
) {
  const listedResponse = await authAdminRequest(auth.baseUrl, auth.secretKey, "/users?page=1&per_page=1000");
  const listed: unknown = await listedResponse.json();
  const users = authUsersSchema.parse(listed).users;
  const existing = users.find(
    (candidate) => candidate.email?.toLowerCase() === input.email.toLowerCase(),
  );
  const attributes = {
    email: input.email,
    email_confirm: true,
    password: input.password,
    user_metadata: { name: input.name },
  };
  const userResponse = existing
    ? await authAdminRequest(auth.baseUrl, auth.secretKey, `/users/${existing.id}`, {
        body: JSON.stringify(attributes),
        method: "PUT",
      })
    : await authAdminRequest(auth.baseUrl, auth.secretKey, "/users", {
        body: JSON.stringify(attributes),
        method: "POST",
      });
  const userBody: unknown = await userResponse.json();
  const user = authUserSchema.parse(userBody);

  const profile = await supabase.from("profiles").upsert({
    id: user.id,
    name: input.name,
    role: input.role,
    status: "active",
  });
  assertNoError(profile.error, `No se pudo guardar el perfil ${input.email}`);
  return user.id;
}

async function runSeed() {
  const env = envSchema.parse(process.env);
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  });
  const auth = { baseUrl: env.NEXT_PUBLIC_SUPABASE_URL, secretKey: env.SUPABASE_SERVICE_ROLE_KEY };

  const categoryResult = await supabase
    .from("categories")
    .upsert(categories, { onConflict: "slug" })
    .select("id,slug");
  assertNoError(categoryResult.error, "No se pudieron guardar las categorías");
  if (!categoryResult.data) {
    throw new Error("Supabase no devolvió las categorías guardadas.");
  }

  const categoryIds = new Map(categoryResult.data.map((category) => [category.slug, category.id]));
  const cuts = Object.entries(cutsByCategory).flatMap(([categorySlug, names]) => {
    const categoryId = categoryIds.get(categorySlug);
    if (!categoryId) {
      throw new Error(`No existe la categoría ${categorySlug}.`);
    }
    return names.map((name, sortOrder) => ({
      category_id: categoryId,
      name,
      slug: slugByName[name],
      sort_order: sortOrder,
    }));
  });
  const cutResult = await supabase
    .from("cuts")
    .upsert(cuts, { onConflict: "category_id,slug" })
    .select("id,category_id,slug");
  assertNoError(cutResult.error, "No se pudieron guardar los cortes");
  if (!cutResult.data) {
    throw new Error("Supabase no devolvió los cortes guardados.");
  }

  const settings = [
    ...Object.entries(imagePrompts).map(([key, value]) => ({ key, value })),
    { key: "generation_daily_limit", value: 40 },
  ];
  const settingsResult = await supabase.from("settings").upsert(settings, { onConflict: "key" });
  assertNoError(settingsResult.error, "No se pudieron guardar los settings");

  const adminId = await ensureUser(supabase, auth, {
    email: env.SEED_ADMIN_EMAIL,
    name: env.SEED_ADMIN_NAME,
    password: env.SEED_ADMIN_PASSWORD,
    role: "admin",
  });
  await ensureUser(supabase, auth, {
    email: env.SEED_COMMERCIAL_EMAIL,
    name: env.SEED_COMMERCIAL_NAME,
    password: env.SEED_COMMERCIAL_PASSWORD,
    role: "commercial",
  });

  const categorySlugById = new Map(categoryResult.data.map((category) => [category.id, category.slug]));
  const cutIds = new Map(
    cutResult.data.map((cut) => {
      const categorySlug = categorySlugById.get(cut.category_id);
      if (!categorySlug) {
        throw new Error(`No existe la categoría del corte ${cut.slug}.`);
      }
      return [`${categorySlug}/${cut.slug}`, cut.id];
    }),
  );
  const productRows = products.map((product) => {
    const categoryId = categoryIds.get(product.category_slug);
    const cutId = cutIds.get(`${product.category_slug}/${product.cut_slug}`);
    if (!categoryId || !cutId) {
      throw new Error(`No existe el corte ${product.category_slug}/${product.cut_slug}.`);
    }
    return {
      box_weight: product.box_weight,
      brand: product.brand,
      category_id: categoryId,
      code: product.code,
      created_by: adminId,
      cut_id: cutId,
      eyebrow: product.eyebrow,
      format: product.format,
      origin: product.origin,
      status: "active",
      title: product.title,
      units: product.units,
      updated_by: adminId,
    };
  });
  const productResult = await supabase
    .from("products")
    .upsert(productRows, { onConflict: "code" });
  assertNoError(productResult.error, "No se pudieron guardar los productos");

  const categoryCount = await supabase.from("categories").select("*", { count: "exact", head: true });
  const cutCount = await supabase.from("cuts").select("*", { count: "exact", head: true });
  const productCount = await supabase.from("products").select("*", { count: "exact", head: true });
  assertNoError(categoryCount.error, "No se pudieron contar las categorías");
  assertNoError(cutCount.error, "No se pudieron contar los cortes");
  assertNoError(productCount.error, "No se pudieron contar los productos");
  console.log(
    `Seed completado: ${categoryCount.count} categorías, ${cutCount.count} cortes, ${productCount.count} productos.`,
  );
}

runSeed().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Error desconocido";
  console.error(`Falló el seed: ${message}`);
  process.exitCode = 1;
});
