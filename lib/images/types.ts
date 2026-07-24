import type { ProductImageSlot } from "./slots";

export type ProductImageStatus = "approved" | "pending" | "rejected";

export type ProductImageRecord = {
  created_at: string;
  generated_by_ai: boolean;
  id: string;
  prompt_used: string | null;
  slot: ProductImageSlot;
  status: ProductImageStatus;
  storage_path: string;
  url: string;
};

export type ImageMutationResult =
  | { error: string; success: false }
  | { id: string; success: true };
