import "server-only";

import { headers } from "next/headers";
import { forbidden, redirect } from "next/navigation";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { roles, type Profile, type Role } from "./types";
import { mustRedirectToPasswordChange } from "./password-gate";

const profileSchema = z.object({
  contact_email: z.string().email(),
  id: z.string().uuid(),
  job_title: z.string(),
  must_change_password: z.boolean(),
  name: z.string().min(1),
  phone: z.string(),
  role: z.enum(roles),
  status: z.enum(["active", "inactive"]),
});

export async function requireRole(
  allowedRoles: Role[],
  options: { allowPasswordChangeRequired?: boolean } = {},
): Promise<Profile> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;
  const email = z.string().email().safeParse(data?.claims.email);

  if (error || !userId || !email.success) {
    redirect("/login");
  }

  const admin = createAdminClient();
  const result = await admin
    .from("profiles")
    .select("id,name,contact_email,job_title,phone,role,status,must_change_password")
    .eq("id", userId)
    .single();
  const profile = profileSchema.safeParse(result.data);

  if (result.error || !profile.success || profile.data.status !== "active") {
    forbidden();
  }

  if (!allowedRoles.includes(profile.data.role)) {
    forbidden();
  }

  const pathname = (await headers()).get("x-todocarnes-pathname");
  if (mustRedirectToPasswordChange({
    allowPasswordChangeRequired: options.allowPasswordChangeRequired,
    mustChangePassword: profile.data.must_change_password,
    pathname,
  })) {
    redirect("/profile?cambiar-clave=1");
  }

  return {
    email: profile.data.contact_email || email.data,
    id: profile.data.id,
    jobTitle: profile.data.job_title,
    mustChangePassword: profile.data.must_change_password,
    name: profile.data.name,
    phone: profile.data.phone,
    role: profile.data.role,
    status: profile.data.status,
  };
}
