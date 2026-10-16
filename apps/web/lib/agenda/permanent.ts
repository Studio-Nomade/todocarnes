import "server-only";

import { z } from "zod";
import { availableDays } from "./availability";
import { createAgendaAdminClient, hasAgendaDatabaseConfig } from "./server";
import type { PermanentAgendaEvent } from "./types";

const permanentEventSchema = z.object({
  blackout_dates: z.array(z.string()),
  days: z.null(),
  horizon_days: z.number().int().positive(),
  id: z.string().uuid(),
  kind: z.literal("permanent"),
  location: z.string().nullable(),
  min_notice_hours: z.number().int().nonnegative(),
  name: z.string(),
  slot_minutes: z.number().int().positive(),
  slot_times: z.array(z.string()),
  weekdays: z.array(z.number().int().min(0).max(6)),
});

export async function getPermanentAgendaData(now = new Date()): Promise<{
  availableDays: string[];
  event: PermanentAgendaEvent;
} | null> {
  if (!hasAgendaDatabaseConfig()) {
    return null;
  }
  const client = createAgendaAdminClient();
  const result = await client.from("booking_events")
    .select("id,name,location,days,slot_times,slot_minutes,kind,weekdays,horizon_days,min_notice_hours,blackout_dates")
    .eq("slug", "agenda-comercial")
    .maybeSingle();
  const parsed = permanentEventSchema.safeParse(result.data);
  if (result.error || !parsed.success) {
    return null;
  }
  const event: PermanentAgendaEvent = {
    blackoutDates: parsed.data.blackout_dates,
    days: null,
    horizonDays: parsed.data.horizon_days,
    id: parsed.data.id,
    kind: parsed.data.kind,
    location: parsed.data.location ?? "",
    minNoticeHours: parsed.data.min_notice_hours,
    name: parsed.data.name,
    slotMinutes: parsed.data.slot_minutes,
    slotTimes: parsed.data.slot_times,
    weekdays: parsed.data.weekdays,
  };
  return { availableDays: availableDays(event, now), event };
}
