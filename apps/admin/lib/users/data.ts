import "server-only";

import { z } from "zod";
import { requireRole } from "@/lib/auth/requireRole";
import { roles } from "@/lib/auth/types";
import { commercialAreas } from "@/lib/leads/constants";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRecord } from "./types";

const profileRowSchema = z.object({
  area: z.enum(commercialAreas).nullable(),
  contact_email: z.string(),
  created_at: z.string(),
  id: z.string().uuid(),
  is_public: z.boolean(),
  job_title: z.string(),
  name: z.string(),
  phone: z.string(),
  photo_url: z.string().url().nullable(),
  public_bio: z.string().nullable(),
  public_order: z.number().int().nullable(),
  role: z.enum(roles),
  status: z.enum(["active", "inactive"]),
  whatsapp: z.string().nullable(),
});

export async function listProfiles(): Promise<UserRecord[]> {
  await requireRole(["admin"]);
  const admin = createAdminClient();
  const result = await admin
    .from("profiles")
    .select("id,name,contact_email,job_title,phone,role,status,created_at,area,photo_url,whatsapp,public_bio,public_order,is_public")
    .order("created_at", { ascending: true });
  if (result.error) {
    throw new Error("No se pudieron cargar los usuarios.");
  }

  return z.array(profileRowSchema).parse(result.data).map((row) => ({
    area: row.area,
    createdAt: row.created_at,
    email: row.contact_email,
    id: row.id,
    isPublic: row.is_public,
    jobTitle: row.job_title,
    name: row.name,
    phone: row.phone,
    photoUrl: row.photo_url,
    publicBio: row.public_bio ?? "",
    publicOrder: row.public_order ?? 0,
    role: row.role,
    status: row.status,
    whatsapp: row.whatsapp ?? "",
  }));
}
