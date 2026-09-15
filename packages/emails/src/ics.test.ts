import assert from "node:assert/strict";
import test from "node:test";
import { buildIcs } from "./ics";

test("genera una reunión de 30 minutos en America/Santiago sin corrimiento por DST", () => {
  const calendar = buildIcs({
    uid: "booking-123",
    title: "Reunión Todo Carnes",
    description: "Conversación comercial",
    location: "Stand Todo Carnes",
    start: new Date("2026-09-29T14:00:00.000Z"),
    durationMinutes: 30,
    organizer: { name: "Representante", email: "rep@example.com" },
    attendee: { name: "Cliente", email: "cliente@example.com" },
    timezone: "America/Santiago",
  });
  const unfolded = calendar.replaceAll("\r\n ", "");

  assert.match(unfolded, /METHOD:REQUEST/);
  assert.match(unfolded, /UID:booking-123/);
  assert.match(unfolded, /DTSTART;TZID=America\/Santiago:20260929T110000/);
  assert.match(unfolded, /DTEND;TZID=America\/Santiago:20260929T113000/);
  assert.match(unfolded, /STATUS:CONFIRMED/);
  assert.match(unfolded, /ORGANIZER;CN="Representante":mailto:rep@example\.com/);
  assert.match(unfolded, /ATTENDEE;CN="Cliente";ROLE=REQ-PARTICIPANT;RSVP=TRUE:mailto:cliente@example\.com/);
  assert.ok(calendar.endsWith("\r\n"));
});
