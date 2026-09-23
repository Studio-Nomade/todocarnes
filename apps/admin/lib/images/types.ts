import type { ProductImageSlot } from "./slots";

export type ProductImageStatus = "approved" | "pending" | "rejected";
export type ProductImageSourceKind = "ai" | "catalog_pdf" | "session" | "upload";

export type ProductImageRecord = {
  created_at: string;
  generated_by_ai: boolean;
  id: string;
  prompt_used: string | null;
  slot: ProductImageSlot;
  sort_order: number;
  source_kind: ProductImageSourceKind;
  status: ProductImageStatus;
  storage_path: string;
  url: string;
};

export type ImageMutationResult =
  | { error: string; success: false }
  | { id: string; success: true };
