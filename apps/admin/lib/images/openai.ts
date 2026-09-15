import "server-only";

import OpenAI, { toFile } from "openai";
import sharp from "sharp";
import { ImageGenerationError, humanizeOpenAIError, openAIErrorLog } from "./errors";
import type { ImageProvider } from "./provider";

const MODEL = "gpt-image-1";
const REQUEST_TIMEOUT_MS = 100_000;

function openAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new ImageGenerationError(
      "La cuenta de OpenAI no está habilitada para generar imágenes.",
      "OPENAI_API_KEY no está configurada.",
    );
  }

  return new OpenAI({ apiKey, timeout: REQUEST_TIMEOUT_MS });
}

export async function getOpenAIConnectionStatus(): Promise<boolean> {
  if (!process.env.OPENAI_API_KEY) {
    return false;
  }
  try {
    await openAIClient().models.retrieve(MODEL, { timeout: 8_000 });
    return true;
  } catch {
    return false;
  }
}

export class OpenAIImageProvider implements ImageProvider {
  async generate({ prompt, sourceImage }: Parameters<ImageProvider["generate"]>[0]) {
    if (!sourceImage) {
      throw new ImageGenerationError(
        "Sube una imagen fuente antes de generar.",
        "OpenAIImageProvider recibió sourceImage=null.",
      );
    }

    try {
      const response = await openAIClient().images.edit({
        image: await toFile(sourceImage, "source.webp", { type: "image/webp" }),
        input_fidelity: "high",
        model: MODEL,
        output_compression: 90,
        output_format: "webp",
        prompt,
        quality: "medium",
        size: "1536x1024",
      });
      const encodedImage = response.data?.[0]?.b64_json;
      if (!encodedImage) {
        throw new Error("OpenAI no devolvió datos de imagen.");
      }

      const buffer = await sharp(Buffer.from(encodedImage, "base64"))
        .rotate()
        .webp({ quality: 90 })
        .toBuffer();

      return { buffer, model: MODEL };
    } catch (error: unknown) {
      if (error instanceof ImageGenerationError) {
        throw error;
      }
      throw new ImageGenerationError(
        humanizeOpenAIError(error),
        openAIErrorLog(error),
        MODEL,
      );
    }
  }
}
