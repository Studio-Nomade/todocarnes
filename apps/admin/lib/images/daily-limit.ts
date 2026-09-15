import "server-only";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const limitSettingSchema = z.object({ value: z.number().int().positive() });

export type DailyGenerationUsage = {
  count: number;
  limit: number;
};

export async function getDailyGenerationUsage(): Promise<DailyGenerationUsage> {
  const admin = createAdminClient();
  const [settingResult, countResult] = await Promise.all([
    admin.from("settings").select("value").eq("key", "generation_daily_limit").single(),
    admin
      .from("image_generation_jobs")
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date(new Date().setUTCHours(0, 0, 0, 0)).toISOString()),
  ]);
  const setting = limitSettingSchema.safeParse(settingResult.data);

  if (settingResult.error || !setting.success || countResult.error) {
    throw new Error("No se pudo validar el límite diario de generación.");
  }

  return { count: countResult.count ?? 0, limit: setting.data.value };
}

export async function assertWithinDailyLimit(): Promise<void> {
  const usage = await getDailyGenerationUsage();
  if (usage.count >= usage.limit) {
    throw new Error(`Se alcanzó el límite diario de ${usage.limit} generaciones.`);
  }
}
