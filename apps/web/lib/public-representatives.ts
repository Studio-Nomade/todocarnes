import "server-only";

import { AREA_LABELS, PLACEHOLDER_REPRESENTATIVES } from "@/lib/agenda/constants";
import { createAgendaAdminClient, hasAgendaDatabaseConfig } from "@/lib/agenda/server";
import type { CommercialArea, PublicRepresentative } from "@/lib/agenda/types";

export async function getPublicRepresentatives(): Promise<{ configured: boolean; representatives: PublicRepresentative[] }> {
  if (!hasAgendaDatabaseConfig()) return { configured: false, representatives: PLACEHOLDER_REPRESENTATIVES };

  const { data, error } = await createAgendaAdminClient()
    .from("profiles")
    .select("id,name,area,photo_url,whatsapp,public_bio,contact_email")
    .eq("is_public", true)
    .eq("role", "commercial")
    .order("public_order", { ascending: true });

  if (error || !data?.length) {
    console.error("[web] No fue posible cargar el equipo comercial público.");
    return { configured: false, representatives: PLACEHOLDER_REPRESENTATIVES };
  }

  return {
    configured: true,
    representatives: data.map((rep) => ({
      id: rep.id,
      name: rep.name,
      area: rep.area,
      areaLabel: rep.area ? AREA_LABELS[rep.area as CommercialArea] : "Área comercial",
      photoUrl: rep.photo_url,
      whatsapp: rep.whatsapp,
      contactEmail: rep.contact_email,
      bio: rep.public_bio ?? "Asesoría comercial especializada.",
      isPlaceholder: false,
    })),
  };
}
