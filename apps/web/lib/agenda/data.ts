import "server-only";

import { FALLBACK_EVENT } from "./constants";
import { DEMO_REPRESENTATIVES } from "./demo";
import { createAgendaAdminClient, hasAgendaDatabaseConfig } from "./server";
import type { AgendaPageData } from "./types";
import { getPublicRepresentatives } from "@/lib/public-representatives";

const unconfigured: AgendaPageData = {
  event: FALLBACK_EVENT,
  representatives: DEMO_REPRESENTATIVES,
  configured: false,
  courtesyConfigured: false,
  notice: "Vista de simulación: la confirmación se habilitará cuando existan perfiles comerciales públicos configurados.",
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

  if (eventResult.error || !eventResult.data) {
    console.error("[agenda] No fue posible cargar la configuración pública.");
    return unconfigured;
  }

  return {
    configured: repsResult.configured && repsResult.representatives.length > 0,
    courtesyConfigured: true,
    event: {
      id: eventResult.data.id,
      name: eventResult.data.name,
      location: eventResult.data.location ?? "Stand Todo Carnes — Feria Food & Service 2026",
      days: eventResult.data.days,
      slotTimes: eventResult.data.slot_times,
      slotMinutes: eventResult.data.slot_minutes,
    },
    representatives: repsResult.configured && repsResult.representatives.length > 0
      ? repsResult.representatives
      : DEMO_REPRESENTATIVES,
    notice: repsResult.configured && repsResult.representatives.length > 0
      ? undefined
      : "Vista de simulación: los horarios se habilitarán cuando existan perfiles comerciales públicos configurados.",
  };
}
