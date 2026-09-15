"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/requireRole";
import { createAdminClient } from "@/lib/supabase/admin";
import { canTransitionLead, leadStatuses } from "@/lib/leads/constants";
import type { LeadMutationState } from "@/lib/leads/types";
import { assignLeadSchema, updateLeadStatusSchema } from "@/lib/leads/validation";
import { z } from "zod";

const currentLeadSchema = z.object({ assigned_rep_id: z.string().uuid().nullable(), status: z.enum(leadStatuses) });

export async function updateLeadStatus(_state: LeadMutationState, formData: FormData): Promise<LeadMutationState> {
  const actor = await requireRole(["admin", "commercial"]);
  const parsed = updateLeadStatusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Revisa el estado.", success: false };

  const admin = createAdminClient();
  let currentQuery = admin.from("leads").select("assigned_rep_id,status").eq("id", parsed.data.id);
  if (actor.role === "commercial") currentQuery = currentQuery.eq("assigned_rep_id", actor.id);
  const currentResult = await currentQuery.maybeSingle();
  const current = currentLeadSchema.safeParse(currentResult.data);
  if (currentResult.error || !current.success) return { error: "No tienes acceso a este lead.", success: false };
  if (!canTransitionLead(current.data.status, parsed.data.status)) return { error: "Ese cambio de estado no está permitido.", success: false };

  let update = admin.from("leads").update({ status: parsed.data.status }).eq("id", parsed.data.id);
  if (actor.role === "commercial") update = update.eq("assigned_rep_id", actor.id);
  const result = await update.select("id").maybeSingle();
  if (result.error || !result.data) return { error: "No se pudo actualizar el lead.", success: false };
  revalidatePath("/leads");
  revalidatePath(`/leads/${parsed.data.id}`);
  return { success: true };
}

export async function assignLead(_state: LeadMutationState, formData: FormData): Promise<LeadMutationState> {
  await requireRole(["admin"]);
  const parsed = assignLeadSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Selecciona un vendedor.", success: false };

  const admin = createAdminClient();
  const representative = await admin.from("profiles").select("id").eq("id", parsed.data.assignedRepId).eq("role", "commercial").eq("status", "active").maybeSingle();
  if (representative.error || !representative.data) return { error: "El vendedor no está disponible.", success: false };
  const result = await admin.from("leads").update({ assigned_rep_id: parsed.data.assignedRepId }).eq("id", parsed.data.id).select("id").maybeSingle();
  if (result.error || !result.data) return { error: "No se pudo asignar el lead.", success: false };
  revalidatePath("/leads");
  revalidatePath(`/leads/${parsed.data.id}`);
  return { success: true };
}
