import assert from "node:assert/strict";
import test from "node:test";
import { zonedDateTimeToUtc } from "./timezone";
import type { PermanentAgendaEvent } from "./types";
import { permanentBookingDatabaseError, validatePermanentBookingSelection } from "./permanent-booking";

const event: PermanentAgendaEvent = {
  blackoutDates: ["2026-10-20"],
  days: null,
  horizonDays: 10,
  id: "00000000-0000-4000-8000-000000000001",
  kind: "permanent",
  location: "",
  minNoticeHours: 24,
  name: "Agenda comercial",
  slotMinutes: 30,
  slotTimes: ["10:00:00", "15:00:00", "16:00:00"],
  weekdays: [1, 2, 3, 4, 5],
};
const now = zonedDateTimeToUtc("2026-10-15", "15:00:00", "America/Santiago");

test("rechaza sábado, feriado y bloque con menos de 24 horas", () => {
  for (const selection of [
    { day: "2026-10-17", modality: "videollamada", slotTime: "15:00" },
    { day: "2026-10-20", modality: "oficina", slotTime: "15:00" },
    { day: "2026-10-16", modality: "videollamada", slotTime: "10:00" },
  ]) {
    assert.equal(validatePermanentBookingSelection(event, selection, now).success, false);
  }
});

test("exige ubicación para una visita y acepta una selección disponible", () => {
  assert.equal(validatePermanentBookingSelection(event, { day: "2026-10-16", modality: "visita", slotTime: "15:00" }, now).success, false);
  assert.equal(validatePermanentBookingSelection(event, { day: "2026-10-16", locationDetail: "Providencia", modality: "visita", slotTime: "15:00" }, now).success, true);
});

test("traduce una colisión del índice único", () => {
  assert.equal(permanentBookingDatabaseError({ code: "23505" }), "Ese horario se acaba de ocupar, elige otro.");
});
