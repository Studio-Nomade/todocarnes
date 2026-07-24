import "server-only";

import { z } from "zod";
import { getDailyGenerationUsage } from "@/lib/images/daily-limit";
import { humanizeOpenAIError } from "@/lib/images/errors";
import { imageSlotSchema } from "@/lib/images/slots";
import { getOpenAIConnectionStatus } from "@/lib/images/openai";
import { createAdminClient } from "@/lib/supabase/admin";
import { promptKeySchema, promptKeys } from "./config";
import type { GenerationHistoryItem, PromptSetting } from "./types";

const promptSettingSchema = z.object({
  key: promptKeySchema,
  value: z.string().min(1),
});

const jobSchema = z.object({
  created_at: z.string(),
  created_by: z.string().uuid().nullable(),
  error_message: z.string().nullable(),
  id: z.string().uuid(),
  model: z.string().nullable(),
  product_id: z.string().uuid().nullable(),
  prompt: z.string().nullable(),
  requested_slot: imageSlotSchema,
  status: z.enum(["processing", "completed", "failed"]),
});

const namedRecordSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
});

const productRecordSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
});

function publicHistoryError(error: string | null): string | null {
  if (!error) {
    return null;
  }
  if (!error.trim().startsWith("{")) {
    return error;
  }
  return humanizeOpenAIError({ message: error });
}

export async function getPromptSettings(): Promise<PromptSetting[]> {
  const admin = createAdminClient();
  const result = await admin.from("settings").select("key,value").in("key", [...promptKeys]);
  if (result.error) {
    throw new Error("No se pudieron cargar los prompts.");
  }

  const byKey = new Map(
    z.array(promptSettingSchema).parse(result.data).map((setting) => [setting.key, setting]),
  );
  return promptKeys.map((key) => {
    const setting = byKey.get(key);
    if (!setting) {
      throw new Error(`Falta el prompt ${key}.`);
    }
    return setting;
  });
}

export async function getGenerationHistory(): Promise<GenerationHistoryItem[]> {
  const admin = createAdminClient();
  const jobsResult = await admin
    .from("image_generation_jobs")
    .select("id,product_id,requested_slot,prompt,model,status,error_message,created_by,created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (jobsResult.error) {
    throw new Error("No se pudo cargar el historial de generaciones.");
  }

  const jobs = z.array(jobSchema).parse(jobsResult.data);
  const productIds = Array.from(
    new Set(jobs.flatMap((job) => (job.product_id ? [job.product_id] : []))),
  );
  const profileIds = Array.from(
    new Set(jobs.flatMap((job) => (job.created_by ? [job.created_by] : []))),
  );
  const [productsResult, profilesResult] = await Promise.all([
    productIds.length
      ? admin.from("products").select("id,title").in("id", productIds)
      : Promise.resolve({ data: [], error: null }),
    profileIds.length
      ? admin.from("profiles").select("id,name").in("id", profileIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (productsResult.error || profilesResult.error) {
    throw new Error("No se pudieron resolver los datos del historial.");
  }

  const products = new Map(
    z.array(productRecordSchema).parse(productsResult.data).map((product) => [product.id, product.title]),
  );
  const profiles = new Map(
    z.array(namedRecordSchema).parse(profilesResult.data).map((profile) => [profile.id, profile.name]),
  );

  return jobs.map((job) => ({
    createdAt: job.created_at,
    createdBy: (job.created_by && profiles.get(job.created_by)) || "Usuario desconocido",
    error: publicHistoryError(job.error_message),
    id: job.id,
    model: job.model ?? "Sin modelo",
    product: (job.product_id && products.get(job.product_id)) || "Producto eliminado",
    prompt: job.prompt ?? "",
    slot: job.requested_slot,
    status: job.status,
  }));
}

export async function getSettingsOverview() {
  const [connected, usage] = await Promise.all([
    getOpenAIConnectionStatus(),
    getDailyGenerationUsage(),
  ]);
  return { connected, usage };
}
