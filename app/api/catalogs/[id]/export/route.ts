import { randomUUID } from "node:crypto";
import { chromium, type Browser } from "playwright";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { catalogPdfFilename } from "@/lib/catalogs/format";

export const runtime = "nodejs";
export const maxDuration = 300;

type ExportContext = {
  params: Promise<{ id: string }>;
};

// Identidad del usuario para created_by + protección del endpoint. A diferencia
// de /print (que consume Playwright con token), aquí sí hay cookie de sesión.
async function authorize(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;
  if (!userId) {
    return null;
  }
  const admin = createAdminClient();
  const profile = await admin.from("profiles").select("role,status").eq("id", userId).single();
  if (profile.error || profile.data.status !== "active") {
    return null;
  }
  if (profile.data.role !== "admin" && profile.data.role !== "commercial") {
    return null;
  }
  return userId;
}

export async function POST(_request: Request, { params }: ExportContext) {
  const userId = await authorize();
  if (!userId) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }

  const appUrl = process.env.APP_URL;
  const printToken = process.env.PRINT_TOKEN;
  if (!appUrl || !printToken) {
    return Response.json({ error: "Falta configurar APP_URL o PRINT_TOKEN." }, { status: 500 });
  }

  const { id } = await params;
  const admin = createAdminClient();

  const [catalogResult, itemsCount] = await Promise.all([
    admin.from("catalogs").select("month").eq("id", id).maybeSingle(),
    admin
      .from("catalog_items")
      .select("*", { count: "exact", head: true })
      .eq("catalog_id", id),
  ]);
  if (catalogResult.error || itemsCount.error || !catalogResult.data) {
    return Response.json({ error: "No se pudo leer el catálogo." }, { status: 500 });
  }
  if ((itemsCount.count ?? 0) === 0) {
    return Response.json({ error: "Agrega productos antes de exportar." }, { status: 400 });
  }

  const printUrl = new URL(`/print/${id}`, appUrl);
  printUrl.searchParams.set("token", printToken);

  let browser: Browser | null = null;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { height: 810, width: 1440 } });
    const response = await page.goto(printUrl.toString(), { waitUntil: "networkidle" });
    if (!response?.ok()) {
      throw new Error(`La vista de impresión respondió ${response?.status() ?? "sin estado"}.`);
    }
    await page.waitForFunction(() => window.__CATALOG_READY__ === true, null, { timeout: 120_000 });
    const pdf = await page.pdf({
      height: "11.25in",
      printBackground: true,
      scale: 4 / 3,
      width: "20in",
    });
    const body = Uint8Array.from(pdf);
    const filename = catalogPdfFilename(catalogResult.data.month);

    // Persistir el PDF y registrar la exportación.
    const storagePath = `${id}/${randomUUID()}.pdf`;
    const upload = await admin.storage
      .from("catalog-exports")
      .upload(storagePath, body, { contentType: "application/pdf", upsert: false });
    if (!upload.error) {
      await admin.from("catalog_exports").insert({ catalog_id: id, created_by: userId, storage_path: storagePath });
      await admin.from("catalogs").update({ status: "exported", updated_at: new Date().toISOString() }).eq("id", id);
    }

    return new Response(body, {
      headers: {
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Content-Type": "application/pdf",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "No se pudo exportar el catálogo.";
    return Response.json({ error: message }, { status: 500 });
  } finally {
    await browser?.close();
  }
}
