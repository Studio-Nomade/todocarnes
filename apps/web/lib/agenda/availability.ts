import { zonedDateTimeToUtc } from "./timezone";

export type AvailabilityEvent = {
  blackoutDates: string[];
  days: string[] | null;
  /** Ventana de reserva en días calendario contados desde hoy (ej. 14 = dos semanas). */
  horizonDays: number;
  kind: "event" | "permanent";
  minNoticeHours: number;
  slotTimes: string[];
  weekdays: number[];
};

const DEFAULT_TIMEZONE = "America/Santiago";

export function localDay(value: Date, timezone = DEFAULT_TIMEZONE): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: timezone,
    year: "numeric",
  }).formatToParts(value);
  const values = new Map(parts.map((part) => [part.type, part.value]));
  return `${values.get("year")}-${values.get("month")}-${values.get("day")}`;
}

export function addCalendarDay(day: string, amount: number): string {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

function weekday(day: string): number {
  return new Date(`${day}T12:00:00Z`).getUTCDay();
}

export function availableSlots(
  event: AvailabilityEvent,
  day: string,
  now: Date,
  timezone = DEFAULT_TIMEZONE,
): string[] {
  if (event.kind === "event") {
    return event.days?.includes(day) ? event.slotTimes : [];
  }
  if (!event.weekdays.includes(weekday(day)) || event.blackoutDates.includes(day)) {
    return [];
  }
  const minimum = now.getTime() + event.minNoticeHours * 60 * 60 * 1000;
  return event.slotTimes.filter((slot) => zonedDateTimeToUtc(day, slot, timezone).getTime() >= minimum);
}

/**
 * Días con al menos un bloque reservable dentro de la ventana: desde hoy hasta `horizonDays`
 * días calendario hacia adelante. Fines de semana, feriados y bloques sin anticipación quedan fuera.
 */
export function availableDays(
  event: AvailabilityEvent,
  now: Date,
  timezone = DEFAULT_TIMEZONE,
): string[] {
  if (event.kind === "event") {
    return event.days ?? [];
  }
  const result: string[] = [];
  const today = localDay(now, timezone);
  for (let offset = 0; offset < event.horizonDays; offset += 1) {
    const candidate = addCalendarDay(today, offset);
    if (availableSlots(event, candidate, now, timezone).length > 0) {
      result.push(candidate);
    }
  }
  return result;
}
