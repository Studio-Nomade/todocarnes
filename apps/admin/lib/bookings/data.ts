import "server-only";

import { z } from "zod";
import { requireRole } from "@/lib/auth/requireRole";
import { createAdminClient } from "@/lib/supabase/admin";
import { bookingStatuses } from "./constants";
import type { BookingAgenda, BookingItem } from "./types";
import { bookingFiltersSchema } from "./validation";

const eventSchema = z.object({
  days: z.array(z.string()),
  id: z.string().uuid(),
  location: z.string().nullable(),
  name: z.string(),
  slot_minutes: z.number().int().positive(),
  slot_times: z.array(z.string()),
});

const bookingRowSchema = z.object({
  came_from: z.string().nullable(),
  cargo: z.string().nullable(),
  company: z.string().nullable(),
  created_at: z.string(),
  day: z.string(),
  email: z.string().email(),
  id: z.string().uuid(),
  name: z.string(),
  phone: z.string().nullable(),
  rep_id: z.string().uuid(),
  slot_time: z.string(),
  status: z.enum(bookingStatuses),
  topics: z.string().nullable(),
});

const representativeSchema = z.object({ id: z.string().uuid(), name: z.string() });

export async function getBookingAgenda(input: unknown): Promise<BookingAgenda | null> {
  const profile = await requireRole(["admin", "commercial"]);
  const filters = bookingFiltersSchema.parse(input);
  const admin = createAdminClient();
  const eventResult = await admin.from("booking_events").select("id,name,location,days,slot_times,slot_minutes").eq("is_active", true).order("start_date", { ascending: true }).limit(1).maybeSingle();
  if (eventResult.error) throw new Error("No se pudo cargar el evento.");
  if (!eventResult.data) return null;
  const eventRow = eventSchema.parse(eventResult.data);
  const selectedDay = filters.day && eventRow.days.includes(filters.day) ? filters.day : undefined;

  let query = admin.from("bookings").select("id,rep_id,name,company,cargo,email,phone,day,slot_time,topics,came_from,status,created_at").eq("event_id", eventRow.id).order("day").order("slot_time").order("created_at");
  if (profile.role === "commercial") query = query.eq("rep_id", profile.id);
  else if (filters.repId) query = query.eq("rep_id", filters.repId);
  if (selectedDay) query = query.eq("day", selectedDay);
  const result = await query;
  if (result.error) throw new Error("No se pudieron cargar las reservas.");
  const rows = z.array(bookingRowSchema).parse(result.data);
  const repIds = [...new Set(rows.map((row) => row.rep_id))];
  const representatives = repIds.length ? await admin.from("profiles").select("id,name").in("id", repIds) : { data: [], error: null };
  if (representatives.error) throw new Error("No se pudieron cargar los vendedores.");
  const names = new Map(z.array(representativeSchema).parse(representatives.data).map((rep) => [rep.id, rep.name]));
  const bookings: BookingItem[] = rows.map((row) => ({
    cameFrom: row.came_from,
    cargo: row.cargo,
    company: row.company,
    createdAt: row.created_at,
    day: row.day,
    email: row.email,
    id: row.id,
    name: row.name,
    phone: row.phone,
    repId: row.rep_id,
    repName: names.get(row.rep_id) ?? "Vendedor no disponible",
    slotTime: row.slot_time,
    status: row.status,
    topics: row.topics,
  }));
  return {
    bookings,
    event: { days: eventRow.days, id: eventRow.id, location: eventRow.location, name: eventRow.name, slotMinutes: eventRow.slot_minutes, slotTimes: eventRow.slot_times },
    selectedDay,
    selectedRepId: profile.role === "commercial" ? profile.id : filters.repId,
  };
}
