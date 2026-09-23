import type { ProductImageRecord } from "./types";

export function isOfficial(images: ProductImageRecord[]): boolean {
  return images.some(
    (image) => image.slot === "main" && image.status === "approved" && image.source_kind === "session",
  );
}
