"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/requireRole";
import { createAdminClient } from "@/lib/supabase/admin";
import { commercialUserSchema, userIdSchema, userStatusSchema } from "@/lib/validators/user";
import type { UserMutationResult } from "@/lib/users/types";

export async function createCommercialUser(input: unknown): Promise<UserMutationResult> {
  await requireRole(["admin"]);
  const parsed = commercialUserSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos.", success: false };
  }

  const admin = createAdminClient();
  // El trigger handle_new_user crea el profile (role commercial, contact_email = email).
  const created = await admin.auth.admin.createUser({
    email: parsed.data.email,
    email_confirm: true,
    password: parsed.data.password,
    user_metadata: { name: parsed.data.name },
  });
  if (created.error || !created.data.user) {
    const alreadyExists = created.error?.message.toLowerCase().includes("already");
    return {
      error: alreadyExists
        ? "Ya existe un usuario con ese correo."
        : "No se pudo crear el usuario.",
      success: false,
    };
  }

  const userId = created.data.user.id;
  const profile = await admin
    .from("profiles")
    .update({
      contact_email: parsed.data.email,
      job_title: parsed.data.jobTitle,
      name: parsed.data.name,
      phone: parsed.data.phone,
      role: "commercial",
      status: "active",
    })
    .eq("id", userId);
  if (profile.error) {
    // El auth user quedó creado pero su perfil no se completó: se revierte para no
    // dejar un usuario a medias que igual podría iniciar sesión.
    await admin.auth.admin.deleteUser(userId);
    return { error: "No se pudo completar el perfil del usuario.", success: false };
  }

  revalidatePath("/users");
  return { id: userId, success: true };
}

export async function setUserStatus(id: unknown, status: unknown): Promise<UserMutationResult> {
  const actor = await requireRole(["admin"]);
  const parsedId = userIdSchema.safeParse(id);
  const parsedStatus = userStatusSchema.safeParse(status);
  if (!parsedId.success || !parsedStatus.success) {
    return { error: "El usuario no es válido.", success: false };
  }
  if (parsedId.data === actor.id && parsedStatus.data === "inactive") {
    return { error: "No puedes desactivar tu propia cuenta.", success: false };
  }

  const admin = createAdminClient();
  const result = await admin
    .from("profiles")
    .update({ status: parsedStatus.data })
    .eq("id", parsedId.data)
    .select("id")
    .single();
  if (result.error || !result.data) {
    return { error: "No se pudo cambiar el estado del usuario.", success: false };
  }

  revalidatePath("/users");
  return { id: parsedId.data, success: true };
}
