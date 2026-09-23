"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { requireRole } from "@/lib/auth/requireRole";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  changePasswordSchema,
  recoveryPasswordSchema,
} from "@/lib/validators/account";

export type AccountMutationResult =
  | { error: string; success: false }
  | { success: true };

export async function changeOwnPassword(input: unknown): Promise<AccountMutationResult> {
  const profile = await requireRole(["admin", "commercial"]);
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Revisa las contraseñas ingresadas.",
      success: false,
    };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return { error: "No se pudo verificar la contraseña actual.", success: false };
  }

  try {
    const verifier = createSupabaseClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const verification = await verifier.auth.signInWithPassword({
      email: profile.email,
      password: parsed.data.currentPassword,
    });
    if (verification.error) {
      return { error: "La contraseña actual no es correcta.", success: false };
    }
  } catch {
    return { error: "No se pudo verificar la contraseña actual.", success: false };
  }

  const supabase = await createClient();
  const updated = await supabase.auth.updateUser({ password: parsed.data.newPassword });
  if (updated.error) {
    return { error: "No se pudo actualizar la contraseña.", success: false };
  }

  const flag = await createAdminClient()
    .from("profiles")
    .update({ must_change_password: false })
    .eq("id", profile.id);
  if (flag.error) {
    return { error: "La contraseña cambió, pero no se pudo completar la actualización del acceso.", success: false };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function setRecoveredPassword(input: unknown): Promise<AccountMutationResult> {
  const profile = await requireRole(["admin", "commercial"]);
  const parsed = recoveryPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Revisa las contraseñas ingresadas.",
      success: false,
    };
  }

  const supabase = await createClient();
  const updated = await supabase.auth.updateUser({ password: parsed.data.newPassword });
  if (updated.error) {
    return { error: "No se pudo actualizar la contraseña.", success: false };
  }

  const flag = await createAdminClient()
    .from("profiles")
    .update({ must_change_password: false })
    .eq("id", profile.id);
  if (flag.error) {
    return { error: "La contraseña cambió, pero no se pudo completar la actualización del acceso.", success: false };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
