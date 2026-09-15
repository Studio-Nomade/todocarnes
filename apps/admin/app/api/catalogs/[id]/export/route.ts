import { randomUUID } from "node:crypto";
import { after } from "next/server";
import { chromium, type Browser } from "playwright";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { catalogPdfFilename } from "@/lib/catalogs/format";

export const runtime = "nodejs";
export const maxDuration = 300;

const CATALOG_EXPORTS_MAX_BYTES = 100 * 1024 * 1024;

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

async function saveExportHistory(input: {
  body: Uint8Array;
  catalogId: string;
  userId: string;
}) {
  const admin = createAdminClient();
  const storagePath = `${input.catalogId}/${randomUUID()}.pdf`;
  const upload = await admin.storage
    .from("catalog-exports")
    .upload(storagePath, input.body, { contentType: "application/pdf", upsert: false });
  if (upload.error) {
    console.error("No se pudo guardar el PDF en el historial:", upload.error.message);
    return;
  }

  const [history, catalog] = await Promise.all([
    admin.from("catalog_exports").insert({
      catalog_id: input.catalogId,
      created_by: input.userId,
      storage_path: storagePath,
    }),
    admin.from("catalogs").update({
      status: "exported",
      updated_at: new Date().toISOString(),
    }).eq("id", input.catalogId),
  ]);
  if (history.error || catalog.error) {
    console.error(
      "El PDF se guardó, pero no se pudo completar su historial:",
      history.error?.message ?? catalog.error?.message,
    );
  }
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

    // La descarga no depende del historial. Los archivos que superan el límite
    // del bucket se entregan igualmente y omiten el guardado en segundo plano.
    if (body.byteLength <= CATALOG_EXPORTS_MAX_BYTES) {
      after(async () => {
        try {
          await saveExportHistory({ body, catalogId: id, userId });
        } catch (error: unknown) {
          console.error(
            "Falló el guardado del historial después de entregar el PDF:",
            error instanceof Error ? error.message : "Error desconocido.",
          );
        }
      });
    } else {
      console.warn(
        `Se omitió el historial del catálogo ${id}: ${body.byteLength} bytes superan el límite del bucket.`,
      );
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
