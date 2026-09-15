import type { ContactPerson } from "./types";

export type BuildIcsInput = {
  uid: string;
  title: string;
  description: string;
  location: string;
  start: Date;
  durationMinutes: number;
  organizer: ContactPerson;
  attendee: ContactPerson;
  timezone: string;
};

function escapeText(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;");
}

function escapeParameter(value: string) {
  return value.replaceAll('"', "'").replaceAll("\r", " ").replaceAll("\n", " ");
}

function formatUtc(value: Date) {
  return value.toISOString().replaceAll("-", "").replaceAll(":", "").replace(/\.\d{3}Z$/, "Z");
}

function formatInTimezone(value: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(value);
  const byType = new Map(parts.map((part) => [part.type, part.value]));
  return `${byType.get("year")}${byType.get("month")}${byType.get("day")}T${byType.get("hour")}${byType.get("minute")}${byType.get("second")}`;
}

function foldLine(line: string) {
  const encoder = new TextEncoder();
  const chunks: string[] = [];
  let chunk = "";

  for (const character of line) {
    const candidate = `${chunk}${character}`;
    if (encoder.encode(candidate).length > 73 && chunk) {
      chunks.push(chunk);
      chunk = character;
    } else {
      chunk = candidate;
    }
  }

  if (chunk) chunks.push(chunk);
  return chunks.join("\r\n ");
}

export function buildIcs(input: BuildIcsInput) {
  if (!input.uid.trim()) throw new Error("El UID del evento es obligatorio.");
  if (!Number.isInteger(input.durationMinutes) || input.durationMinutes <= 0) {
    throw new Error("La duración debe ser un número entero positivo.");
  }

  formatInTimezone(input.start, input.timezone);
  const end = new Date(input.start.getTime() + input.durationMinutes * 60_000);
  const lines = [
    "BEGIN:VCALENDAR",
    "PRODID:-//Todo Carnes//Agenda Comercial//ES",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    `X-WR-TIMEZONE:${escapeText(input.timezone)}`,
    "BEGIN:VEVENT",
    `UID:${escapeText(input.uid)}`,
    `DTSTAMP:${formatUtc(new Date())}`,
    `DTSTART;TZID=${input.timezone}:${formatInTimezone(input.start, input.timezone)}`,
    `DTEND;TZID=${input.timezone}:${formatInTimezone(end, input.timezone)}`,
    `SUMMARY:${escapeText(input.title)}`,
    `DESCRIPTION:${escapeText(input.description)}`,
    `LOCATION:${escapeText(input.location)}`,
    `ORGANIZER;CN="${escapeParameter(input.organizer.name)}":mailto:${input.organizer.email}`,
    `ATTENDEE;CN="${escapeParameter(input.attendee.name)}";ROLE=REQ-PARTICIPANT;RSVP=TRUE:mailto:${input.attendee.email}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return `${lines.map(foldLine).join("\r\n")}\r\n`;
}
