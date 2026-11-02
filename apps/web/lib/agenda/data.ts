import "server-only";

import { FALLBACK_EVENT } from "./constants";
import { DEMO_REPRESENTATIVES } from "./demo";
import { getPermanentAgendaData } from "./permanent";
import { hasAgendaDatabaseConfig } from "./server";
import type { AgendaPageData } from "./types";
import { getPublicRepresentatives } from "@/lib/public-representatives";

const unconfigured: AgendaPageData = {
  event: FALLBACK_EVENT,
  representatives: DEMO_REPRESENTATIVES,
  configured: false,
  notice: "Vista de simulación: la confirmación se habilitará cuando existan perfiles comerciales públicos configurados.",
};

export async function getAgendaPageData(): Promise<AgendaPageData> {
  if (!hasAgendaDatabaseConfig()) return unconfigured;

  const [permanent, repsResult] = await Promise.all([getPermanentAgendaData(), getPublicRepresentatives()]);
  if (!permanent) {
    console.error("[agenda] No fue posible cargar la agenda comercial.");
    return unconfigured;
  }

  const ready = repsResult.configured && repsResult.representatives.length > 0;
  return {
    configured: ready,
    event: {
      id: permanent.event.id,
      name: permanent.event.name,
      location: permanent.event.location || "Videollamada, oficina o visita",
      days: permanent.availableDays,
      slotTimes: permanent.event.slotTimes,
      slotMinutes: permanent.event.slotMinutes,
    },
    representatives: ready ? repsResult.representatives : DEMO_REPRESENTATIVES,
    notice: ready ? undefined : "Vista de simulación: los horarios se habilitarán cuando existan perfiles comerciales públicos configurados.",
  };
}
