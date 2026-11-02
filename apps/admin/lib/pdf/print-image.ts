// Imágenes de la vista de impresión. Chromium incrusta en el PDF lo que recibe: un WebP o PNG
// lo guarda como bitmap sin comprimir, un JPEG lo guarda tal cual. Por eso /print pide cada
// foto a /api/print-image, que la entrega como JPEG al tamaño que la lámina realmente usa.

export type PrintImageConfig = {
  quality: number;
  scale: number;
  token: string;
};

export const PRINT_IMAGE_DEFAULTS = { quality: 78, scale: 2 } as const;

const PRODUCT_IMAGES_PATH = "/storage/v1/object/public/product-images/";
const CATALOG_ASSETS_PATH = "/storage/v1/object/sign/catalog-assets/";
const LOCAL_PREFIXES = ["/brand/", "/services/", "/categories/", "/placeholders/"];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function printImageConfigFromEnv(env: NodeJS.ProcessEnv): PrintImageConfig | null {
  const token = env.PRINT_TOKEN?.trim();
  if (!token) return null;
  const scale = Number.parseFloat(env.PRINT_IMAGE_SCALE ?? "");
  const quality = Number.parseInt(env.PRINT_IMAGE_QUALITY ?? "", 10);
  return {
    quality: Number.isFinite(quality) ? clamp(quality, 40, 95) : PRINT_IMAGE_DEFAULTS.quality,
    scale: Number.isFinite(scale) ? clamp(scale, 1, 3) : PRINT_IMAGE_DEFAULTS.scale,
    token,
  };
}

/** URL del proxy para una imagen que en la lámina mide `displayWidth` px CSS. */
export function printImageUrl(src: string, config: PrintImageConfig, displayWidth: number): string {
  const params = new URLSearchParams({
    q: String(config.quality),
    src,
    token: config.token,
    w: String(Math.round(displayWidth * config.scale)),
  });
  return `/api/print-image?${params.toString()}`;
}

export type PrintImageSource =
  | { kind: "local"; path: string }
  | { kind: "remote"; url: string };

/**
 * Solo se sirven fotos del propio catálogo: los buckets públicos de Supabase del proyecto y los
 * assets estáticos de la plantilla. Cualquier otra cosa se rechaza para no exponer un proxy abierto.
 */
export function resolvePrintImageSource(src: string, supabaseUrl: string | undefined): PrintImageSource | null {
  if (src.startsWith("/") && !src.startsWith("//")) {
    const path = src.split("?")[0];
    if (path.includes("..")) return null;
    return LOCAL_PREFIXES.some((prefix) => path.startsWith(prefix)) ? { kind: "local", path } : null;
  }
  if (!supabaseUrl) return null;
  let parsed: URL;
  let allowed: URL;
  try {
    parsed = new URL(src);
    allowed = new URL(supabaseUrl);
  } catch {
    return null;
  }
  if (parsed.origin !== allowed.origin) return null;
  if (!parsed.pathname.startsWith(PRODUCT_IMAGES_PATH) && !parsed.pathname.startsWith(CATALOG_ASSETS_PATH)) {
    return null;
  }
  return { kind: "remote", url: parsed.toString() };
}
