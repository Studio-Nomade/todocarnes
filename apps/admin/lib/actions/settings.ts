"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/requireRole";
import { promptKeySchema } from "@/lib/settings/config";
import { createAdminClient } from "@/lib/supabase/admin";

type SettingsMutationResult = { error: string; success: false } | { success: true };

const promptSchema = z.object({
  key: promptKeySchema,
  value: z.string().trim().min(50, "El prompt es demasiado corto.").max(32_000),
});

const limitSchema = z.coerce
  .number()
  .int("El tope debe ser un número entero.")
  .min(1, "El tope diario debe ser al menos 1.")
  .max(1_000, "El tope diario no puede superar 1000.");

export async function updatePromptTemplate(
  key: unknown,
  value: unknown,
): Promise<SettingsMutationResult> {
  await requireRole(["admin"]);
  const parsed = promptSchema.safeParse({ key, value });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "El prompt no es válido.", success: false };
  }

  const admin = createAdminClient();
  const result = await admin
    .from("settings")
    .update({ value: parsed.data.value })
    .eq("key", parsed.data.key);
  if (result.error) {
    return { error: "No se pudo guardar el prompt.", success: false };
  }

  revalidatePath("/settings");
  return { success: true };
}

export async function updateGenerationDailyLimit(
  value: unknown,
): Promise<SettingsMutationResult> {
  await requireRole(["admin"]);
  const parsed = limitSchema.safeParse(value);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "El tope no es válido.", success: false };
  }

  const admin = createAdminClient();
  const result = await admin
    .from("settings")
    .update({ value: parsed.data })
    .eq("key", "generation_daily_limit");
  if (result.error) {
    return { error: "No se pudo guardar el tope diario.", success: false };
  }

  revalidatePath("/settings");
  return { success: true };
}
