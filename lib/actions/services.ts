"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/requireRole";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ServiceMutationResult } from "@/lib/services/types";

const roles = ["admin", "commercial"] as const;
const serviceIdSchema = z.string().uuid();
const serviceSchema = z.object({
  description: z.string().trim().min(10, "Ingresa una descripción más completa.").max(600),
  title: z.string().trim().min(2, "Ingresa el nombre del servicio.").max(100),
});

export async function createService(input: unknown): Promise<ServiceMutationResult> {
  const profile = await requireRole([...roles]);
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos.", success: false };
  }

  const admin = createAdminClient();
  const [maxResult, activeResult] = await Promise.all([
    admin.from("services").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle(),
    admin.from("services").select("*", { count: "exact", head: true }).eq("status", "active"),
  ]);
  if ((activeResult.count ?? 0) >= 6) {
    return { error: "La diapositiva admite hasta 6 servicios activos.", success: false };
  }
  const maxOrder = z.object({ sort_order: z.number().int() }).safeParse(maxResult.data);
  const result = await admin
    .from("services")
    .insert({
      ...parsed.data,
      created_by: profile.id,
      sort_order: (maxOrder.success ? maxOrder.data.sort_order : -1) + 1,
      updated_by: profile.id,
    })
    .select("id")
    .single();

  const id = serviceIdSchema.safeParse(result.data?.id);
  if (result.error || !id.success) {
    return { error: "No se pudo crear el servicio.", success: false };
  }

  revalidatePath("/services");
  return { id: id.data, success: true };
}

export async function updateService(id: unknown, input: unknown): Promise<ServiceMutationResult> {
  const profile = await requireRole([...roles]);
  const parsedId = serviceIdSchema.safeParse(id);
  const parsed = serviceSchema.safeParse(input);
  if (!parsedId.success || !parsed.success) {
    return { error: parsed.error?.issues[0]?.message ?? "El servicio no es válido.", success: false };
  }

  const admin = createAdminClient();
  const result = await admin
    .from("services")
    .update({ ...parsed.data, updated_by: profile.id })
    .eq("id", parsedId.data)
    .select("id")
    .single();
  if (result.error || !result.data) {
    return { error: "No se pudo actualizar el servicio.", success: false };
  }

  revalidatePath("/services");
  return { id: parsedId.data, success: true };
}

export async function setServiceStatus(id: unknown, status: unknown): Promise<ServiceMutationResult> {
  const profile = await requireRole([...roles]);
  const parsedId = serviceIdSchema.safeParse(id);
  const parsedStatus = z.enum(["active", "inactive"]).safeParse(status);
  if (!parsedId.success || !parsedStatus.success) {
    return { error: "El servicio no es válido.", success: false };
  }

  const admin = createAdminClient();
  if (parsedStatus.data === "active") {
    const activeResult = await admin
      .from("services")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");
    if ((activeResult.count ?? 0) >= 6) {
      return { error: "La diapositiva admite hasta 6 servicios activos.", success: false };
    }
  }
  const result = await admin
    .from("services")
    .update({ status: parsedStatus.data, updated_by: profile.id })
    .eq("id", parsedId.data)
    .select("id")
    .single();
  if (result.error || !result.data) {
    return { error: "No se pudo cambiar el estado del servicio.", success: false };
  }

  revalidatePath("/services");
  return { id: parsedId.data, success: true };
}
