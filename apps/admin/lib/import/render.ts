import sharp from "sharp";

export type RenderSlot = "main" | "secondary_1" | "secondary_2" | "secondary_3" | "source";

export type Box = { height: number; width: number };
export type Geometry = {
  canvas: Box;
  inner: Box;
  padding: { bottom: number; left: number; right: number; top: number };
  resized: Box;
};

const maxBytes = 10 * 1024 * 1024;

export function targetBox(slot: RenderSlot): { canvas: Box; inner: Box } {
  if (slot === "source") {
    return { canvas: { height: 2048, width: 2048 }, inner: { height: 2048, width: 2048 } };
  }
  if (slot.startsWith("secondary_")) {
    return { canvas: { height: 850, width: 1942 }, inner: { height: 786, width: 1367 } };
  }
  return { canvas: { height: 850, width: 1942 }, inner: { height: 850, width: 1942 } };
}

export function calculateGeometry(source: Box, slot: RenderSlot): Geometry {
  if (source.width <= 0 || source.height <= 0) throw new Error("La imagen no tiene dimensiones válidas.");
  const { canvas, inner } = targetBox(slot);
  const scale = Math.min(inner.width / source.width, inner.height / source.height);
  const resized = {
    height: Math.max(1, Math.round(source.height * scale)),
    width: Math.max(1, Math.round(source.width * scale)),
  };
  const horizontal = canvas.width - resized.width;
  const vertical = canvas.height - resized.height;
  return {
    canvas,
    inner,
    padding: {
      bottom: Math.ceil(vertical / 2),
      left: Math.floor(horizontal / 2),
      right: Math.ceil(horizontal / 2),
      top: Math.floor(vertical / 2),
    },
    resized,
  };
}

async function flattenedInput(path: string): Promise<{ buffer: Buffer; height: number; width: number }> {
  const buffer = await sharp(path).rotate().flatten({ background: "#ffffff" }).toBuffer();
  const metadata = await sharp(buffer).metadata();
  if (!metadata.width || !metadata.height) throw new Error(`No se pudieron leer las dimensiones de ${path}.`);
  return { buffer, height: metadata.height, width: metadata.width };
}

async function safeTrim(input: { buffer: Buffer; height: number; width: number }): Promise<Buffer> {
  try {
    const trimmed = await sharp(input.buffer).trim({ background: "#ffffff", threshold: 12 }).toBuffer();
    const metadata = await sharp(trimmed).metadata();
    const area = (metadata.width ?? 0) * (metadata.height ?? 0);
    return area >= input.width * input.height * 0.05 ? trimmed : input.buffer;
  } catch {
    return input.buffer;
  }
}

async function encode(input: Buffer, slot: RenderSlot, quality: number): Promise<Buffer> {
  const metadata = await sharp(input).metadata();
  if (!metadata.width || !metadata.height) throw new Error("La imagen preparada no tiene dimensiones válidas.");
  const geometry = calculateGeometry({ width: metadata.width, height: metadata.height }, slot);
  return sharp(input)
    .resize(geometry.resized.width, geometry.resized.height, { fit: "fill" })
    .extend({ ...geometry.padding, background: "#ffffff" })
    .webp({ effort: 5, quality })
    .toBuffer();
}

export async function renderImage(path: string, slot: RenderSlot): Promise<Buffer> {
  const flattened = await flattenedInput(path);
  const prepared = await safeTrim(flattened);
  const qualities = slot === "source" ? [82, 78, 70] : [86, 78, 70];

  for (const quality of qualities) {
    const buffer = await encode(prepared, slot, quality);
    if (buffer.byteLength <= maxBytes) return buffer;
  }
  throw new Error(`${path} supera 10 MB incluso con calidad WebP 70.`);
}
