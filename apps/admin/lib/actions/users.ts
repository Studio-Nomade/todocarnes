"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/requireRole";
import { createAdminClient } from "@/lib/supabase/admin";
import { commercialUserSchema, publicProfileSchema, resetUserPasswordSchema, userIdSchema, userStatusSchema } from "@/lib/validators/user";
import type { ProfilePhotoMutationResult, PublicProfileMutationResult, UserMutationResult } from "@/lib/users/types";
import { validateAndConvertImage } from "@/lib/images/upload";

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
      is_public: false,
      must_change_password: true,
      public_order: 0,
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

export async function resetUserPassword(userId: unknown, password: unknown): Promise<UserMutationResult> {
  const actor = await requireRole(["admin"]);
  const parsed = resetUserPasswordSchema.safeParse({ password, userId });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa la contraseña.", success: false };
  }
  if (parsed.data.userId === actor.id) {
    return { error: "Cambia tu propia contraseña desde Mi perfil.", success: false };
  }

  const admin = createAdminClient();
  const updated = await admin.auth.admin.updateUserById(parsed.data.userId, {
    password: parsed.data.password,
  });
  if (updated.error) {
    return { error: "No se pudo restablecer la contraseña.", success: false };
  }

  const flagged = await admin
    .from("profiles")
    .update({ must_change_password: true })
    .eq("id", parsed.data.userId)
    .select("id")
    .single();
  if (flagged.error || !flagged.data) {
    return { error: "La contraseña cambió, pero no se pudo exigir el cambio inicial.", success: false };
  }

  revalidatePath("/users");
  return { id: parsed.data.userId, success: true };
}

export async function updateCommercialPublicProfile(input: unknown): Promise<PublicProfileMutationResult> {
  await requireRole(["admin"]);
  const parsed = publicProfileSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Revisa los datos públicos.", success: false };
  const admin = createAdminClient();
  const result = await admin.from("profiles").update({
    area: parsed.data.areas[0] ?? null,
    areas: parsed.data.areas,
    is_public: parsed.data.isPublic,
    public_bio: parsed.data.publicBio || null,
    public_order: parsed.data.publicOrder,
    whatsapp: parsed.data.whatsapp || null,
  }).eq("id", parsed.data.userId).eq("role", "commercial").select("photo_url").maybeSingle();
  if (result.error || !result.data) return { error: "No se pudo actualizar el perfil público.", success: false };
  revalidatePath("/users");
  return { profile: { area: parsed.data.areas[0] ?? null, areas: parsed.data.areas, isPublic: parsed.data.isPublic, photoUrl: result.data.photo_url, publicBio: parsed.data.publicBio, publicOrder: parsed.data.publicOrder, whatsapp: parsed.data.whatsapp }, success: true };
}

export async function uploadCommercialPhoto(userId: unknown, formData: FormData): Promise<ProfilePhotoMutationResult> {
  await requireRole(["admin"]);
  const parsedId = userIdSchema.safeParse(userId);
  const file = formData.get("file");
  if (!parsedId.success || !(file instanceof File)) return { error: "Selecciona un vendedor y una imagen válida.", success: false };
  const admin = createAdminClient();
  const profile = await admin.from("profiles").select("id,photo_url").eq("id", parsedId.data).eq("role", "commercial").maybeSingle();
  if (profile.error || !profile.data) return { error: "El vendedor no existe.", success: false };
  try {
    const buffer = await validateAndConvertImage(file);
    const path = `${parsedId.data}/${randomUUID()}.webp`;
    const upload = await admin.storage.from("profile-photos").upload(path, buffer, { contentType: "image/webp", upsert: false });
    if (upload.error) throw new Error("No se pudo guardar la fotografía.");
    const photoUrl = admin.storage.from("profile-photos").getPublicUrl(path).data.publicUrl;
    const update = await admin.from("profiles").update({ photo_url: photoUrl }).eq("id", parsedId.data).eq("role", "commercial").select("id").maybeSingle();
    if (update.error || !update.data) {
      await admin.storage.from("profile-photos").remove([path]);
      throw new Error("No se pudo asociar la fotografía al vendedor.");
    }
    const marker = "/storage/v1/object/public/profile-photos/";
    const previousPath = profile.data.photo_url?.includes(marker) ? decodeURIComponent(profile.data.photo_url.split(marker)[1] ?? "") : "";
    if (previousPath) await admin.storage.from("profile-photos").remove([previousPath]);
    revalidatePath("/users");
    return { photoUrl, success: true };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "No se pudo procesar la fotografía.", success: false };
  }
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
