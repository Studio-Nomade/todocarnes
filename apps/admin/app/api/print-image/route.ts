import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { isValidPrintToken } from "@/lib/pdf/print-token";
import { resolvePrintImageSource } from "@/lib/pdf/print-image";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_WIDTH = 3000;
const PUBLIC_DIR = path.join(process.cwd(), "public");

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

async function loadSource(source: ReturnType<typeof resolvePrintImageSource>): Promise<Buffer | null> {
  if (!source) return null;
  if (source.kind === "local") {
    const absolute = path.join(PUBLIC_DIR, source.path);
    if (!absolute.startsWith(PUBLIC_DIR)) return null;
    return readFile(absolute);
  }
  const response = await fetch(source.url, { cache: "no-store" });
  if (!response.ok) return null;
  return Buffer.from(await response.arrayBuffer());
}

// Consumido solo por la vista de impresión (Playwright). Protegido con el mismo PRINT_TOKEN que /print.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (!isValidPrintToken(searchParams.get("token") ?? undefined)) {
    return new Response("No autorizado.", { status: 401 });
  }

  const source = resolvePrintImageSource(searchParams.get("src") ?? "", process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (!source) {
    return new Response("Origen no permitido.", { status: 400 });
  }

  const width = clamp(Number.parseInt(searchParams.get("w") ?? "", 10) || 1200, 64, MAX_WIDTH);
  const quality = clamp(Number.parseInt(searchParams.get("q") ?? "", 10) || 78, 40, 95);

  try {
    const input = await loadSource(source);
    if (!input) {
      return new Response("No se pudo leer la imagen.", { status: 404 });
    }
    const output = await sharp(input)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .jpeg({ mozjpeg: true, quality })
      .toBuffer();
    return new Response(new Uint8Array(output), {
      headers: {
        "Cache-Control": "private, max-age=3600",
        "Content-Length": String(output.byteLength),
        "Content-Type": "image/jpeg",
      },
    });
  } catch (error: unknown) {
    console.error("No se pudo preparar la imagen para impresión:", error instanceof Error ? error.message : error);
    return new Response("No se pudo preparar la imagen.", { status: 500 });
  }
}
