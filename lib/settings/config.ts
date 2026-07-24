import { z } from "zod";

export const promptKeys = [
  "image_prompt_normalize",
  "image_prompt_main",
  "image_prompt_secondary_1",
  "image_prompt_secondary_2",
  "image_prompt_secondary_3",
] as const;

export const promptKeySchema = z.enum(promptKeys);
export type PromptKey = z.infer<typeof promptKeySchema>;

export const promptLabels: Record<PromptKey, string> = {
  image_prompt_normalize: "Normalización",
  image_prompt_main: "Principal · Hero",
  image_prompt_secondary_1: "Secundaria 1 · Empaque",
  image_prompt_secondary_2: "Secundaria 2 · Ángulo",
  image_prompt_secondary_3: "Secundaria 3 · Caja",
};
