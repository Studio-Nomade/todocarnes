import { availableSlots, type AvailabilityEvent } from "./availability";
import type { AgendaSlot } from "./types";

export type BookedSlot = { day: string; slot_time: string };

/** Cruza los bloques reservables con las reservas ya tomadas del vendedor. */
export function buildSlotGrid(
  event: AvailabilityEvent,
  days: string[],
  booked: BookedSlot[],
  now: Date,
): AgendaSlot[] {
  const taken = new Set(booked.map((item) => `${item.day}|${item.slot_time}`));
  return days.flatMap((day) =>
    availableSlots(event, day, now).map((slotTime) => ({
      day,
      slotTime,
      taken: taken.has(`${day}|${slotTime}`),
    })),
  );
}
