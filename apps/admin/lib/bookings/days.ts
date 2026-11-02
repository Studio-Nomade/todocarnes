const DEFAULT_TIMEZONE = "America/Santiago";

function localDay(value: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", { day: "2-digit", month: "2-digit", timeZone: timezone, year: "numeric" }).formatToParts(value);
  const values = new Map(parts.map((part) => [part.type, part.value]));
  return `${values.get("year")}-${values.get("month")}-${values.get("day")}`;
}

function addCalendarDay(day: string, amount: number): string {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

/** Días hábiles de la ventana de la agenda permanente, desde hoy, para armar la grilla del admin. */
export function upcomingAgendaDays(input: { blackoutDates: string[]; horizonDays: number; now: Date; weekdays: number[]; timezone?: string }): string[] {
  const today = localDay(input.now, input.timezone ?? DEFAULT_TIMEZONE);
  const result: string[] = [];
  for (let offset = 0; offset < input.horizonDays; offset += 1) {
    const day = addCalendarDay(today, offset);
    const weekday = new Date(`${day}T12:00:00Z`).getUTCDay();
    if (input.weekdays.includes(weekday) && !input.blackoutDates.includes(day)) result.push(day);
  }
  return result;
}
