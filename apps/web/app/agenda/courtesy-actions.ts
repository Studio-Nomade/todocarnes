"use server";

import { sendCourtesyConfirmation, sendCourtesyNotification } from "@todocarnes/emails/senders";
import { areaLabel } from "@/lib/agenda/constants";
import { createAgendaAdminClient } from "@/lib/agenda/server";
import type { CourtesyRequestInput, CreateCourtesyRequestResult } from "@/lib/courtesy/types";
import { courtesyRequestSchema } from "@/lib/courtesy/validation";

export async function createCourtesyRequest(input: CourtesyRequestInput): Promise<CreateCourtesyRequestResult> {
  const parsed = courtesyRequestSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_data" };

  try {
    const client = createAgendaAdminClient();
    const [{ data: event, error: eventError }, repResult] = await Promise.all([
      client
        .from("booking_events")
        .select("id,name,location")
        .eq("id", parsed.data.eventId)
        .eq("is_active", true)
        .maybeSingle(),
      client
        .from("profiles")
        .select("name,contact_email")
        .eq("role", "commercial")
        .eq("status", "active")
        .eq("is_public", true)
        .contains("areas", [parsed.data.area])
        .order("public_order", { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);

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

    const emailRequest = {
      name: parsed.data.name,
      company: parsed.data.company,
      cargo: parsed.data.cargo,
      email: parsed.data.email,
      phone: parsed.data.phone,
      area: areaLabel(parsed.data.area),
    };
    const emailEvent = {
      name: event.name,
      location: event.location ?? "Espacio por confirmar",
    };
    const emailRep = repResult.data
      ? { name: repResult.data.name, email: repResult.data.contact_email }
      : null;
    const [confirmation, notification] = await Promise.all([
      sendCourtesyConfirmation({ request: emailRequest, event: emailEvent }),
      sendCourtesyNotification({ request: emailRequest, event: emailEvent, rep: emailRep }),
    ]);

    const emailSent = confirmation.ok && notification.ok;
    if (!emailSent) {
      console.error("[agenda] La solicitud se guardó, pero uno o más correos fallaron.", {
        requestId: request.id,
        confirmacion: confirmation.ok ? "ok" : confirmation.error,
        interno: notification.ok ? "ok" : notification.error,
      });
    }

    return { ok: true, requestId: request.id, emailSent };
  } catch {
    console.error("[agenda] Error inesperado al guardar la solicitud de cortesía.");
    return { ok: false, error: "server_error" };
  }
}
