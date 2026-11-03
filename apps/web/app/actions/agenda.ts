"use server";

import { modalityLocation, representativeAreasLabel } from "@/lib/agenda/constants";
import { getPermanentAgendaData } from "@/lib/agenda/permanent";
import { validatePermanentBookingSelection } from "@/lib/agenda/permanent-booking";
import { createAgendaAdminClient } from "@/lib/agenda/server";
import { buildSlotGrid } from "@/lib/agenda/slot-grid";
import { zonedDateTimeToUtc } from "@/lib/agenda/timezone";
import type { AgendaSlot, CreateBookingInput, CreateBookingResult } from "@/lib/agenda/types";
import { availabilityInputSchema, bookingInputSchema, isSlotConflict } from "@/lib/agenda/validation";
import { sendBookingConfirmation, sendBookingNotification } from "@todocarnes/emails/senders";

const TIMEZONE = "America/Santiago";

export async function getAvailability(input: {
  repId: string;
  eventId: string;
}): Promise<{ ok: true; slots: AgendaSlot[] } | { ok: false }> {
  const parsed = availabilityInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false };

  try {
    const now = new Date();
    const permanent = await getPermanentAgendaData(now);
    if (!permanent || permanent.event.id !== parsed.data.eventId) return { ok: false };
    const days = permanent.availableDays;
    if (!days.length) return { ok: true, slots: [] };

    const client = createAgendaAdminClient();
    const booked = await client
      .from("bookings")
      .select("day,slot_time")
      .eq("rep_id", parsed.data.repId)
      .eq("event_id", permanent.event.id)
      .neq("status", "cancelled")
      .gte("day", days[0])
      .lte("day", days[days.length - 1]);
    if (booked.error) {
      console.error("[agenda] Falló la consulta de disponibilidad.");
      return { ok: false };
    }
    return { ok: true, slots: buildSlotGrid(permanent.event, days, booked.data, now) };
  } catch {
    console.error("[agenda] Supabase no está configurado para consultar disponibilidad.");
    return { ok: false };
  }
}

export async function createBooking(input: CreateBookingInput): Promise<CreateBookingResult> {
  const parsed = bookingInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_data" };

  try {
    const now = new Date();
    const client = createAgendaAdminClient();
    const [{ data: rep }, permanent] = await Promise.all([
      client
        .from("profiles")
        .select("id,name,area,areas,contact_email")
        .eq("id", parsed.data.repId)
        .eq("role", "commercial")
        .eq("is_public", true)
        .eq("status", "active")
        .maybeSingle(),
      getPermanentAgendaData(now),
    ]);
    if (!rep || !permanent || permanent.event.id !== parsed.data.eventId) {
      return { ok: false, error: "invalid_selection" };
    }

    // La disponibilidad se recalcula en el servidor: día hábil, dentro de la ventana y con anticipación.
    const selection = validatePermanentBookingSelection(permanent.event, {
      day: parsed.data.day,
      locationDetail: parsed.data.locationDetail,
      modality: parsed.data.modality,
      slotTime: parsed.data.slotTime,
    }, now);
    if (!selection.success) return { ok: false, error: "invalid_selection" };
    const { day, modality, slotTime } = selection.data;
    const locationDetail = parsed.data.locationDetail || null;

    const { data: booking, error } = await client
      .from("bookings")
      .insert({
        event_id: permanent.event.id,
        rep_id: rep.id,
        name: parsed.data.name,
        company: parsed.data.company,
        cargo: parsed.data.cargo,
        email: parsed.data.email,
        phone: parsed.data.phone,
        day,
        slot_time: slotTime,
        topics: parsed.data.topics || null,
        came_from: parsed.data.cameFrom || null,
        modality,
        location_detail: locationDetail,
        status: "confirmed",
      })
      .select("id,ics_uid")
      .single();

    // El índice único (vendedor, evento, día, bloque) resuelve la carrera entre dos clientes.
    if (isSlotConflict(error)) return { ok: false, error: "slot_taken" };
    if (error || !booking) {
      console.error("[agenda] No fue posible crear la reserva.");
      return { ok: false, error: "server_error" };
    }

    const location = modalityLocation(modality, parsed.data.locationDetail);
    const emailBooking = {
      name: parsed.data.name,
      company: parsed.data.company,
      cargo: parsed.data.cargo,
      email: parsed.data.email,
      phone: parsed.data.phone,
      area: representativeAreasLabel(rep.areas, rep.area),
      topics: parsed.data.topics || null,
      cameFrom: parsed.data.cameFrom || null,
      modality,
      icsUid: booking.ics_uid,
      start: zonedDateTimeToUtc(day, slotTime, TIMEZONE),
    };
    const emailRep = { name: rep.name, email: rep.contact_email };
    const emailEvent = {
      name: permanent.event.name,
      location,
      slotMinutes: permanent.event.slotMinutes,
      timezone: TIMEZONE,
    };
    const [confirmation, notification] = await Promise.all([
      sendBookingConfirmation({ booking: emailBooking, rep: emailRep, event: emailEvent }),
      sendBookingNotification({ booking: emailBooking, rep: emailRep, event: emailEvent }),
    ]);

    const emailSent = confirmation.ok && notification.ok;
    if (!emailSent) {
      console.error("[agenda] La reserva se creó, pero uno o más correos fallaron.", {
        bookingId: booking.id,
        confirmacion: confirmation.ok ? "ok" : confirmation.error,
        interno: notification.ok ? "ok" : notification.error,
      });
    }

    return { ok: true, bookingId: booking.id, emailSent };
  } catch {
    console.error("[agenda] Error inesperado al crear la reserva.");
    return { ok: false, error: "server_error" };
  }
}
