import "server-only";

import type { Database } from "@todocarnes/db";
import { createClient } from "@supabase/supabase-js";

export function hasAgendaDatabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function createAgendaAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Falta configurar Supabase para la agenda.");
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  });
}
