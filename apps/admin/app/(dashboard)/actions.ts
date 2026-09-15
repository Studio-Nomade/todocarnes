"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/requireRole";
import { createClient } from "@/lib/supabase/server";

export async function logout() {
  await requireRole(["admin", "commercial"]);
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
