"use server";

import { sendCourtesyConfirmation } from "@todocarnes/emails/senders";
import { areaLabel } from "@/lib/agenda/constants";
import { createAgendaAdminClient } from "@/lib/agenda/server";
import type { CourtesyRequestInput, CreateCourtesyRequestResult } from "@/lib/courtesy/types";
import { courtesyRequestSchema } from "@/lib/courtesy/validation";

export async function createCourtesyRequest(input: CourtesyRequestInput): Promise<CreateCourtesyRequestResult> {
  const parsed = courtesyRequestSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_data" };

  try {
    const client = createAgendaAdminClient();
    const { data: event, error: eventError } = await client
      .from("booking_events")
      .select("id,name,location")
      .eq("id", parsed.data.eventId)
      .eq("is_active", true)
      .maybeSingle();

    if (eventError || !event) return { ok: false, error: "invalid_data" };

    const { data: request, error } = await client
      .from("courtesy_requests")
      .insert({
        event_id: event.id,
        name: parsed.data.name,
        company: parsed.data.company,
        cargo: parsed.data.cargo,
        email: parsed.data.email,
        phone: parsed.data.phone,
        area: parsed.data.area,
        status: "pending",
      })
      .select("id")
      .single();

    if (error || !request) {
      console.error("[agenda] No fue posible guardar la solicitud de cortesía.");
      return { ok: false, error: "server_error" };
    }

    const emailResult = await sendCourtesyConfirmation({
      request: {
        name: parsed.data.name,
        company: parsed.data.company,
        cargo: parsed.data.cargo,
        email: parsed.data.email,
        area: areaLabel(parsed.data.area),
      },
      event: {
        name: event.name,
        location: event.location ?? "Stand Todo Carnes — Feria Food & Service 2026",
      },
    });

    if (!emailResult.ok) {
      console.error("[agenda] La solicitud se guardó, pero falló el correo de confirmación.", {
        requestId: request.id,
      });
    }

    return { ok: true, requestId: request.id, emailSent: emailResult.ok };
  } catch {
    console.error("[agenda] Error inesperado al guardar la solicitud de cortesía.");
    return { ok: false, error: "server_error" };
  }
}
