"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/requireRole";
import { createAdminClient } from "@/lib/supabase/admin";

const profileInputSchema = z.object({
  email: z.string().trim().email("Ingresa un correo válido.").max(254),
  jobTitle: z.string().trim().min(2, "Ingresa el cargo.").max(100),
  name: z.string().trim().min(2, "Ingresa el nombre.").max(100),
  phone: z.string().trim().min(8, "Ingresa un teléfono válido.").max(30),
});

export type ProfileInput = z.infer<typeof profileInputSchema>;

type ProfileMutationResult =
  | { error: string; success: false }
  | { success: true };

export async function updateProfile(input: unknown): Promise<ProfileMutationResult> {
  const profile = await requireRole(["admin", "commercial"]);
  const parsed = profileInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Revisa la información del perfil.",
      success: false,
    };
  }

  const admin = createAdminClient();
  const result = await admin
    .from("profiles")
    .update({
      contact_email: parsed.data.email,
      job_title: parsed.data.jobTitle,
      name: parsed.data.name,
      phone: parsed.data.phone,
    })
    .eq("id", profile.id);

  if (result.error) {
    return { error: "No se pudo guardar el perfil.", success: false };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
