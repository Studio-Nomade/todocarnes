import sharp from "sharp";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function detectImageMime(buffer: Buffer): string | null {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "image/jpeg";
  }
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "image/png";
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export async function validateAndConvertImage(file: File): Promise<Buffer> {
  if (!allowedMimeTypes.has(file.type)) {
    throw new Error("Usa una imagen JPG, PNG o WebP.");
  }
  if (file.size === 0) {
    throw new Error("La imagen está vacía.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("La imagen supera el máximo de 10 MB.");
  }

  const input = Buffer.from(await file.arrayBuffer());
  const detectedMime = detectImageMime(input);
  if (!detectedMime || detectedMime !== file.type) {
    throw new Error("El contenido del archivo no corresponde a una imagen válida.");
  }

  try {
    return await sharp(input).rotate().webp({ quality: 88 }).toBuffer();
  } catch {
    throw new Error("No se pudo procesar la imagen.");
  }
}
