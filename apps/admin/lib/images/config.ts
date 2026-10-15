export const DEFAULT_IMAGE_MODEL = "gpt-image-1";
export const IMAGE_ENGINE_UNAVAILABLE = "El motor de imágenes todavía no está configurado";

export type ImageProviderKind = "mock" | "openai";

export function resolveImageModel(value = process.env.IMAGE_MODEL): string {
  return value?.trim() || DEFAULT_IMAGE_MODEL;
}

export function resolveImageProvider(value = process.env.IMAGE_PROVIDER): ImageProviderKind {
  return value === "openai" ? "openai" : "mock";
}

export function isImageGenerationEnabled(
  provider = resolveImageProvider(),
  nodeEnv = process.env.NODE_ENV,
): boolean {
  return !(nodeEnv === "production" && provider === "mock");
}
