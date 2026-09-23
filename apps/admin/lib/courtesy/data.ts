import "server-only";

import { z } from "zod";
import { requireRole } from "@/lib/auth/requireRole";
import { createAdminClient } from "@/lib/supabase/admin";
import { COURTESY_PAGE_SIZE, courtesyStatuses } from "./constants";
import type { CourtesyListResult, CourtesyRequestItem } from "./types";
import { courtesyFiltersSchema, safeCourtesySearch } from "./validation";

const courtesyRowSchema = z.object({
  cargo: z.string(),
  company: z.string(),
  created_at: z.string(),
  email: z.string().email(),
  event_id: z.string().uuid(),
  id: z.string().uuid(),
  last_name: z.string(),
  name: z.string(),
  phone: z.string(),
  rut: z.string(),
  status: z.enum(courtesyStatuses),
});

const eventRowSchema = z.object({ id: z.string().uuid(), name: z.string() });
type CourtesyRow = z.infer<typeof courtesyRowSchema>;

async function eventNames(rows: CourtesyRow[]): Promise<Map<string, string>> {
  const eventIds = [...new Set(rows.map((row) => row.event_id))];
  if (!eventIds.length) return new Map();

  const result = await createAdminClient().from("booking_events").select("id,name").in("id", eventIds);
  if (result.error) throw new Error("No se pudieron cargar los eventos de las solicitudes.");

  return new Map(z.array(eventRowSchema).parse(result.data).map((event) => [event.id, event.name]));
}

async function mapRows(rows: CourtesyRow[]): Promise<CourtesyRequestItem[]> {
  const names = await eventNames(rows);
  return rows.map((row) => ({
    cargo: row.cargo,
    company: row.company,
    createdAt: row.created_at,
    email: row.email,
    eventId: row.event_id,
    eventName: names.get(row.event_id) ?? "Evento no disponible",
    id: row.id,
    lastName: row.last_name,
    name: row.name,
    phone: row.phone,
    rut: row.rut,
    status: row.status,
  }));
}

export async function listCourtesyRequests(input: unknown): Promise<CourtesyListResult> {
  await requireRole(["admin"]);
  const filters = courtesyFiltersSchema.parse(input);
  const from = (filters.page - 1) * COURTESY_PAGE_SIZE;
  let query = createAdminClient()
    .from("courtesy_requests")
    .select("id,name,last_name,rut,company,cargo,email,phone,event_id,status,created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + COURTESY_PAGE_SIZE - 1);

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.search) {
    const search = safeCourtesySearch(filters.search);
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,last_name.ilike.%${search}%,rut.ilike.%${search}%,company.ilike.%${search}%,cargo.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`,
      );
    }
  }

  const result = await query;
  if (result.error) throw new Error("No se pudieron cargar las solicitudes de cortesía.");
  const rows = z.array(courtesyRowSchema).parse(result.data);
  const total = result.count ?? 0;

  return {
    filters,
    items: await mapRows(rows),
    page: filters.page,
    pageCount: Math.max(1, Math.ceil(total / COURTESY_PAGE_SIZE)),
    total,
  };
}

export async function listAllCourtesyRequests(): Promise<CourtesyRequestItem[]> {
  await requireRole(["admin"]);
  const batchSize = 1000;
  const rows: CourtesyRow[] = [];

  for (let from = 0; ; from += batchSize) {
    const result = await createAdminClient()
      .from("courtesy_requests")
      .select("id,name,last_name,rut,company,cargo,email,phone,event_id,status,created_at")
      .order("created_at", { ascending: false })
      .range(from, from + batchSize - 1);

    if (result.error) throw new Error("No se pudieron exportar las solicitudes de cortesía.");
    const batch = z.array(courtesyRowSchema).parse(result.data);
    rows.push(...batch);
    if (batch.length < batchSize) break;
  }

  return mapRows(rows);
}
