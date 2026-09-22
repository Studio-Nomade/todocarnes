"use server";

import { createAgendaAdminClient } from "@/lib/agenda/server";
import { areasLabel } from "@/lib/agenda/constants";
import { zonedDateTimeToUtc } from "@/lib/agenda/timezone";
import type { AgendaSlot, CreateBookingInput, CreateBookingResult } from "@/lib/agenda/types";
import { availabilityInputSchema, bookingInputSchema, isSlotConflict } from "@/lib/agenda/validation";
import { sendBookingConfirmation, sendBookingNotification } from "@todocarnes/emails/senders";

export async function getAvailability(input: {
  repId: string;
  eventId: string;
}): Promise<{ ok: true; slots: AgendaSlot[] } | { ok: false }> {
  const parsed = availabilityInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false };

  try {
    const client = createAgendaAdminClient();
    const { data, error } = await client.rpc("available_slots", {
      p_rep_id: parsed.data.repId,
      p_event_id: parsed.data.eventId,
    });
    if (error) {
      console.error("[agenda] Falló la consulta de disponibilidad.");
      return { ok: false };
    }
    return {
      ok: true,
      slots: data.map((slot) => ({
        day: slot.day,
        slotTime: slot.slot_time,
        taken: slot.taken,
      })),
    };
  } catch {
    console.error("[agenda] Supabase no está configurado para consultar disponibilidad.");
    return { ok: false };
  }
}

export async function createBooking(input: CreateBookingInput): Promise<CreateBookingResult> {
  const parsed = bookingInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_data" };

  try {
    const client = createAgendaAdminClient();
    const [{ data: rep }, { data: event }] = await Promise.all([
      client
        .from("profiles")
        .select("id,name,area,areas,contact_email")
        .eq("id", parsed.data.repId)
        .eq("role", "commercial")
        .eq("is_public", true)
        .eq("status", "active")
        .maybeSingle(),
      client
        .from("booking_events")
        .select("id,name,location,days,slot_times,slot_minutes")
        .eq("id", parsed.data.eventId)
        .eq("is_active", true)
        .maybeSingle(),
    ]);

    const normalizedTime = parsed.data.slotTime.length === 5 ? `${parsed.data.slotTime}:00` : parsed.data.slotTime;
    if (
      !rep ||
      !event ||
      !event.days.includes(parsed.data.day) ||
      !event.slot_times.includes(normalizedTime)
    ) {
      return { ok: false, error: "invalid_selection" };
    }

    const availability = await client.rpc("available_slots", {
      p_rep_id: rep.id,
      p_event_id: event.id,
    });
    if (availability.error) return { ok: false, error: "server_error" };
    const selected = availability.data.find(
      (slot) => slot.day === parsed.data.day && slot.slot_time === normalizedTime,
    );
    if (!selected || selected.taken) return { ok: false, error: "slot_taken" };

    const { data: booking, error } = await client
      .from("bookings")
      .insert({
        event_id: event.id,
        rep_id: rep.id,
        name: parsed.data.name,
        company: parsed.data.company,
        cargo: parsed.data.cargo,
        email: parsed.data.email,
        phone: parsed.data.phone,
        day: parsed.data.day,
        slot_time: normalizedTime,
        topics: parsed.data.topics || null,
        came_from: parsed.data.cameFrom || null,
        status: "confirmed",
      })
      .select("id,ics_uid")
      .single();

    if (isSlotConflict(error)) return { ok: false, error: "slot_taken" };
    if (error || !booking) {
      console.error("[agenda] No fue posible crear la reserva.");
      return { ok: false, error: "server_error" };
    }

    const emailBooking = {
      name: parsed.data.name,
      company: parsed.data.company,
      cargo: parsed.data.cargo,
      email: parsed.data.email,
      phone: parsed.data.phone,
      area: areasLabel(rep.areas, rep.area),
      topics: parsed.data.topics || null,
      cameFrom: parsed.data.cameFrom || null,
      icsUid: booking.ics_uid,
      start: zonedDateTimeToUtc(parsed.data.day, normalizedTime, "America/Santiago"),
    };
    const emailRep = { name: rep.name, email: rep.contact_email };
    const emailEvent = {
      name: event.name,
      location: event.location ?? "Stand 2-A100",
      slotMinutes: event.slot_minutes,
      timezone: "America/Santiago",
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
