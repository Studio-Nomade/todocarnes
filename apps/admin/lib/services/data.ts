import "server-only";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ServiceRecord } from "./types";

export const serviceRowSchema = z.object({
  description: z.string(),
  id: z.string().uuid(),
  sort_order: z.number().int(),
  status: z.enum(["active", "inactive"]),
  title: z.string(),
});

export async function getServices(activeOnly = false): Promise<ServiceRecord[]> {
  const admin = createAdminClient();
  let query = admin
    .from("services")
    .select("id,title,description,status,sort_order")
    .order("sort_order")
    .order("created_at");

  if (activeOnly) {
    query = query.eq("status", "active");
  }

  const result = await query;
  if (result.error) {
    throw new Error("No se pudieron cargar los servicios.");
  }

  return z.array(serviceRowSchema).parse(result.data).map((row) => ({
    description: row.description,
    id: row.id,
    sortOrder: row.sort_order,
    status: row.status,
    title: row.title,
  }));
}
