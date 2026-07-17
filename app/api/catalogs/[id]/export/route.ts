import { chromium, type Browser } from "playwright";

export const runtime = "nodejs";
export const maxDuration = 300;

type ExportContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, { params }: ExportContext) {
  const appUrl = process.env.APP_URL;
  const printToken = process.env.PRINT_TOKEN;

  if (!appUrl || !printToken) {
    return Response.json({ error: "Falta configurar APP_URL o PRINT_TOKEN." }, { status: 500 });
  }

  const { id } = await params;
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

    await page.waitForFunction(() => window.__CATALOG_READY__ === true, null, { timeout: 60_000 });
    const pdf = await page.pdf({
      height: "11.25in",
      printBackground: true,
      scale: 4 / 3,
      width: "20in",
    });
    const body = Uint8Array.from(pdf);

    return new Response(body, {
      headers: {
        "Content-Disposition": `attachment; filename="catalogo-${id}.pdf"`,
        "Content-Type": "application/pdf",
      },
    });
  } finally {
    await browser?.close();
  }
}
