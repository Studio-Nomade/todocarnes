import sharp from "sharp";

const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

export async function validateAndConvertClientLogo(file: File): Promise<Buffer> {
  if (file.type !== "image/png") {
    throw new Error("Selecciona un logo en formato PNG.");
  }
  if (file.size === 0) {
    throw new Error("El archivo del logo está vacío.");
  }
  if (file.size > MAX_LOGO_BYTES) {
    throw new Error("El logo supera el máximo de 5 MB.");
  }

  const input = Buffer.from(await file.arrayBuffer());
  if (input.length < PNG_SIGNATURE.length || !input.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error("El archivo no corresponde a una imagen PNG válida.");
  }

  try {
    return await sharp(input)
      .rotate()
      .resize({ fit: "inside", height: 1000, width: 1000, withoutEnlargement: true })
      .webp({ quality: 92 })
      .toBuffer();
  } catch {
    throw new Error("No se pudo procesar el logo.");
  }
}
