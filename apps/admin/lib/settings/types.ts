import type { ImageSlot } from "@/lib/images/slots";
import type { PromptKey } from "./config";

export type PromptSetting = {
  key: PromptKey;
  value: string;
};

export type GenerationHistoryItem = {
  createdAt: string;
  createdBy: string;
  error: string | null;
  id: string;
  model: string;
  product: string;
  prompt: string;
  slot: ImageSlot;
  status: "completed" | "failed" | "processing";
};
