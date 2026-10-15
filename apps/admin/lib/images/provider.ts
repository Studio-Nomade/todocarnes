import "server-only";

import { isImageGenerationEnabled, resolveImageProvider } from "./config";
import { MockImageProvider } from "./mock";
import { OpenAIImageProvider } from "./openai";
import type { ImageSlot } from "./slots";

export interface ImageProvider {
  generate(input: {
    prompt: string;
    sourceImage: Buffer | null;
    slot: ImageSlot;
  }): Promise<{ buffer: Buffer; model: string }>;
}

export function getImageProvider(): ImageProvider {
  const provider = resolveImageProvider();

  if (provider === "openai") {
    return new OpenAIImageProvider();
  }

  return new MockImageProvider();
}

export function getImageGenerationAvailability(): { enabled: boolean } {
  return { enabled: isImageGenerationEnabled() };
}
