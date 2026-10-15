import { z } from "zod";
import { availableDays, availableSlots } from "./availability";
import type { BookingModality, PermanentAgendaEvent } from "./types";

const selectionSchema = z.object({
  day: z.iso.date(),
  locationDetail: z.string().trim().max(240).optional().default(""),
  modality: z.enum(["videollamada", "oficina", "visita"]),
  slotTime: z.string().regex(/^\d{2}:\d{2}(?::\d{2})?$/),
});

export type PermanentBookingSelection = {
  day: string;
  locationDetail?: string;
  modality: BookingModality;
  slotTime: string;
};

export function validatePermanentBookingSelection(
  event: PermanentAgendaEvent,
  input: unknown,
  now: Date,
): { success: true; data: PermanentBookingSelection & { slotTime: string } } | { success: false; error: string } {
  const parsed = selectionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Revisa la modalidad, el día y el horario." };
  }
  if (parsed.data.modality === "visita" && parsed.data.locationDetail.length === 0) {
    return { success: false, error: "Ingresa una dirección o comuna para la visita." };
  }
  const slotTime = parsed.data.slotTime.length === 5 ? `${parsed.data.slotTime}:00` : parsed.data.slotTime;
  if (!availableDays(event, now).includes(parsed.data.day) || !availableSlots(event, parsed.data.day, now).includes(slotTime)) {
    return { success: false, error: "El día o el horario ya no está disponible." };
  }
  return { success: true, data: { ...parsed.data, slotTime } };
}

export function permanentBookingDatabaseError(error: { code?: string } | null): string {
  return error?.code === "23505"
    ? "Ese horario se acaba de ocupar, elige otro."
    : "No se pudo crear la reserva.";
}
