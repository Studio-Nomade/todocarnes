import "server-only";

import { z } from "zod";
import { MockImageProvider } from "./mock";
import type { ImageSlot } from "./slots";

export interface ImageProvider {
  generate(input: {
    prompt: string;
    sourceImage: Buffer | null;
    slot: ImageSlot;
  }): Promise<{ buffer: Buffer; model: string }>;
}

const providerSchema = z.enum(["mock", "openai"]).default("mock");

export function getImageProvider(): ImageProvider {
  const provider = providerSchema.parse(process.env.IMAGE_PROVIDER);

  if (provider === "openai") {
    throw new Error("El provider de OpenAI se habilita en M6.");
  }

  return new MockImageProvider();
}
