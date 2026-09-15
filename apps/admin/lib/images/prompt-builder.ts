import "server-only";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ImageSlot } from "./slots";

const promptProductSchema = z.object({
  category: z.string().min(1),
  cut: z.string().min(1),
  title: z.string().min(1),
});

const promptSettingSchema = z.object({ value: z.string().min(1) });

const promptKeys: Record<ImageSlot, string> = {
  main: "image_prompt_main",
  secondary_1: "image_prompt_secondary_1",
  secondary_2: "image_prompt_secondary_2",
  secondary_3: "image_prompt_secondary_3",
};

export async function buildPrompt(product: unknown, slot: ImageSlot): Promise<string> {
  const parsedProduct = promptProductSchema.parse(product);
  const admin = createAdminClient();
  const result = await admin
    .from("settings")
    .select("value")
    .eq("key", promptKeys[slot])
    .single();
  const setting = promptSettingSchema.safeParse(result.data);

  if (result.error || !setting.success) {
    throw new Error(`No está configurado el prompt para ${slot}.`);
  }

  return setting.data.value
    .replaceAll("{{producto}}", parsedProduct.title)
    .replaceAll("{{corte}}", parsedProduct.cut)
    .replaceAll("{{categoria}}", parsedProduct.category);
}
