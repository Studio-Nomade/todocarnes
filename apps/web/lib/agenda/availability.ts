import { zonedDateTimeToUtc } from "./timezone";

export type AvailabilityEvent = {
  blackoutDates: string[];
  days: string[] | null;
  horizonDays: number;
  kind: "event" | "permanent";
  minNoticeHours: number;
  slotTimes: string[];
  weekdays: number[];
};

const DEFAULT_TIMEZONE = "America/Santiago";

function localDay(value: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: timezone,
    year: "numeric",
  }).formatToParts(value);
  const values = new Map(parts.map((part) => [part.type, part.value]));
  return `${values.get("year")}-${values.get("month")}-${values.get("day")}`;
}

function addCalendarDay(day: string, amount: number): string {
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

export function availableDays(
  event: AvailabilityEvent,
  now: Date,
  timezone = DEFAULT_TIMEZONE,
): string[] {
  if (event.kind === "event") {
    return event.days ?? [];
  }
  const result: string[] = [];
  let candidate = localDay(now, timezone);
  for (let guard = 0; result.length < event.horizonDays && guard < 370; guard += 1) {
    if (availableSlots(event, candidate, now, timezone).length > 0) {
      result.push(candidate);
    }
    candidate = addCalendarDay(candidate, 1);
  }
  return result;
}
