import "server-only";

import { areaLabel, FALLBACK_EVENT, PLACEHOLDER_REPRESENTATIVES } from "./constants";
import { createAgendaAdminClient, hasAgendaDatabaseConfig } from "./server";
import type { AgendaPageData } from "./types";

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
    client
      .from("profiles")
      .select("id,name,area,photo_url,whatsapp,public_bio")
      .eq("is_public", true)
      .eq("role", "commercial")
      .order("public_order", { ascending: true }),
  ]);

  if (eventResult.error || repsResult.error || !eventResult.data || !repsResult.data?.length) {
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
    representatives: repsResult.data.map((rep) => ({
      id: rep.id,
      name: rep.name,
      area: rep.area,
      areaLabel: areaLabel(rep.area),
      photoUrl: rep.photo_url,
      whatsapp: rep.whatsapp,
      bio: rep.public_bio ?? "Asesoría comercial especializada para encontrar la solución adecuada.",
      isPlaceholder: false,
    })),
  };
}
