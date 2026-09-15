import "server-only";

import { z } from "zod";
import { requireRole } from "@/lib/auth/requireRole";
import { roles } from "@/lib/auth/types";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRecord } from "./types";

const profileRowSchema = z.object({
  contact_email: z.string(),
  created_at: z.string(),
  id: z.string().uuid(),
  job_title: z.string(),
  name: z.string(),
  phone: z.string(),
  role: z.enum(roles),
  status: z.enum(["active", "inactive"]),
});

export async function listProfiles(): Promise<UserRecord[]> {
  await requireRole(["admin"]);
  const admin = createAdminClient();
  const result = await admin
    .from("profiles")
    .select("id,name,contact_email,job_title,phone,role,status,created_at")
    .order("created_at", { ascending: true });
  if (result.error) {
    throw new Error("No se pudieron cargar los usuarios.");
  }

  return z.array(profileRowSchema).parse(result.data).map((row) => ({
    createdAt: row.created_at,
    email: row.contact_email,
    id: row.id,
    jobTitle: row.job_title,
    name: row.name,
    phone: row.phone,
    role: row.role,
    status: row.status,
  }));
}
