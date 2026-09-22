import "server-only";

import { z } from "zod";
import { requireRole } from "@/lib/auth/requireRole";
import type { Profile } from "@/lib/auth/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { commercialAreas, LEAD_PAGE_SIZE, leadStatuses } from "./constants";
import type { CommercialOption, LeadDetail, LeadListItem, LeadListResult } from "./types";
import { leadFiltersSchema, safeLeadSearch } from "./validation";

const leadRowSchema = z.object({
  area: z.enum(commercialAreas).nullable(),
  areas: z.array(z.enum(commercialAreas)).optional().default([]),
  assigned_rep_id: z.string().uuid().nullable(),
  came_from: z.string().nullable().optional(),
  company: z.string().nullable(),
  created_at: z.string(),
  email: z.string().email(),
  id: z.string().uuid(),
  message: z.string().nullable().optional(),
  name: z.string(),
  phone: z.string().nullable().optional(),
  source: z.enum(["landing", "agenda_contact"]),
  status: z.enum(leadStatuses),
});

const commercialRowSchema = z.object({ id: z.string().uuid(), name: z.string() });

export async function listCommercialOptions(): Promise<CommercialOption[]> {
  await requireRole(["admin", "commercial"]);
  const result = await createAdminClient()
    .from("profiles")
    .select("id,name")
    .eq("role", "commercial")
    .eq("status", "active")
    .order("name");
  if (result.error) throw new Error("No se pudo cargar el equipo comercial.");
  return z.array(commercialRowSchema).parse(result.data);
}

function mapLead(row: z.infer<typeof leadRowSchema>, names: Map<string, string>): LeadListItem {
  return {
    area: row.area,
    areas: row.areas.length ? row.areas : row.area ? [row.area] : [],
    assignedRepId: row.assigned_rep_id,
    assignedRepName: row.assigned_rep_id ? names.get(row.assigned_rep_id) ?? "Vendedor no disponible" : null,
    company: row.company,
    createdAt: row.created_at,
    email: row.email,
    id: row.id,
    name: row.name,
    source: row.source,
    status: row.status,
  };
}

async function commercialNames(ids: string[]): Promise<Map<string, string>> {
  if (!ids.length) return new Map();
  const result = await createAdminClient().from("profiles").select("id,name").in("id", ids);
  if (result.error) throw new Error("No se pudieron cargar los vendedores.");
  return new Map(z.array(commercialRowSchema).parse(result.data).map((row) => [row.id, row.name]));
}

export function scopeLeadQuery<Query extends { eq(column: string, value: string): Query }>(query: Query, profile: Profile): Query {
  return profile.role === "commercial" ? query.eq("assigned_rep_id", profile.id) : query;
}

export async function listLeads(input: unknown): Promise<LeadListResult> {
  const profile = await requireRole(["admin", "commercial"]);
  const filters = leadFiltersSchema.parse(input);
  const from = (filters.page - 1) * LEAD_PAGE_SIZE;
  let query = createAdminClient()
    .from("leads")
    .select("id,name,company,email,area,areas,source,assigned_rep_id,status,created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + LEAD_PAGE_SIZE - 1);

  query = scopeLeadQuery(query, profile);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.area) query = query.contains("areas", [filters.area]);
  if (profile.role === "admin" && filters.assignedRepId) query = query.eq("assigned_rep_id", filters.assignedRepId);
  if (filters.search) {
    const search = safeLeadSearch(filters.search);
    if (search) query = query.or(`name.ilike.%${search}%,company.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const result = await query;
  if (result.error) throw new Error("No se pudieron cargar los leads.");
  const rows = z.array(leadRowSchema).parse(result.data);
  const names = await commercialNames([...new Set(rows.flatMap((row) => row.assigned_rep_id ? [row.assigned_rep_id] : []))]);
  const total = result.count ?? 0;
  return { filters, items: rows.map((row) => mapLead(row, names)), page: filters.page, pageCount: Math.max(1, Math.ceil(total / LEAD_PAGE_SIZE)), total };
}

export async function getLead(id: unknown): Promise<LeadDetail | null> {
  const profile = await requireRole(["admin", "commercial"]);
  const parsedId = z.string().uuid().safeParse(id);
  if (!parsedId.success) return null;
  let query = createAdminClient().from("leads").select("id,name,company,email,phone,area,areas,message,source,came_from,assigned_rep_id,status,created_at").eq("id", parsedId.data);
  query = scopeLeadQuery(query, profile);
  const result = await query.maybeSingle();
  if (result.error) throw new Error("No se pudo cargar el lead.");
  if (!result.data) return null;
  const row = leadRowSchema.parse(result.data);
  const names = await commercialNames(row.assigned_rep_id ? [row.assigned_rep_id] : []);
  return { ...mapLead(row, names), cameFrom: row.came_from ?? null, message: row.message ?? null, phone: row.phone ?? null };
}
