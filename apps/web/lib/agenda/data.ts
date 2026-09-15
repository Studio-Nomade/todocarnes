import "server-only";

import { FALLBACK_EVENT, PLACEHOLDER_REPRESENTATIVES } from "./constants";
import { createAgendaAdminClient, hasAgendaDatabaseConfig } from "./server";
import type { AgendaPageData } from "./types";
import { getPublicRepresentatives } from "@/lib/public-representatives";

const unconfigured: AgendaPageData = {
  event: FALLBACK_EVENT,
  representatives: PLACEHOLDER_REPRESENTATIVES,
  configured: false,
  notice: "La agenda está en modo demostración hasta configurar los perfiles comerciales públicos.",
};

export async function getAgendaPageData(): Promise<AgendaPageData> {
  if (!hasAgendaDatabaseConfig()) return unconfigured;

  const client = createAgendaAdminClient();
  const [eventResult, repsResult] = await Promise.all([
    client
      .from("booking_events")
      .select("id,name,location,days,slot_times,slot_minutes")
      .eq("slug", "food-service-2026")
      .eq("is_active", true)
      .maybeSingle(),
    getPublicRepresentatives(),
  ]);

  if (eventResult.error || !eventResult.data || !repsResult.configured) {
    console.error("[agenda] No fue posible cargar la configuración pública.");
    return unconfigured;
  }

  return {
    configured: true,
    event: {
      id: eventResult.data.id,
      name: eventResult.data.name,
      location: eventResult.data.location ?? "Stand Todo Carnes — Feria Food & Service 2026",
      days: eventResult.data.days,
      slotTimes: eventResult.data.slot_times,
      slotMinutes: eventResult.data.slot_minutes,
    },
    representatives: repsResult.representatives,
  };
}
