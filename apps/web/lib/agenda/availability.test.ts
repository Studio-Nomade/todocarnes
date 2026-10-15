import assert from "node:assert/strict";
import test from "node:test";
import { availableDays, availableSlots, type AvailabilityEvent } from "./availability";
import { zonedDateTimeToUtc } from "./timezone";

const event: AvailabilityEvent = {
  blackoutDates: [],
  days: null,
  horizonDays: 10,
  kind: "permanent",
  minNoticeHours: 24,
  slotTimes: ["10:00:00", "11:00:00", "12:00:00", "15:00:00", "16:00:00"],
  weekdays: [1, 2, 3, 4, 5],
};
const at = (day: string, time: string) => zonedDateTimeToUtc(day, time, "America/Santiago");

test("salta fines de semana y feriados", () => {
  const days = availableDays({ ...event, blackoutDates: ["2026-10-19"] }, at("2026-10-16", "18:00:00"));
  assert.equal(days[0], "2026-10-20");
  assert.equal(days.some((day) => day === "2026-10-24" || day === "2026-10-25"), false);
});

test("un viernes a las 18 la primera fecha disponible es el lunes", () => {
  assert.equal(availableDays(event, at("2026-10-16", "18:00:00"))[0], "2026-10-19");
});

test("el jueves a las 15 solo deja bloques del viernes desde las 15", () => {
  assert.deepEqual(availableSlots(event, "2026-10-16", at("2026-10-15", "15:00:00")), ["15:00:00", "16:00:00"]);
});

test("el horizonte se cuenta en días hábiles disponibles", () => {
  const days = availableDays(event, at("2026-10-19", "08:00:00"));
  assert.equal(days.length, 10);
  assert.equal(days.at(-1), "2026-11-02");
});

test("un evento de fechas fijas conserva sus días y bloques", () => {
  const fixed: AvailabilityEvent = { ...event, days: ["2026-09-29"], kind: "event" };
  assert.deepEqual(availableDays(fixed, at("2026-10-19", "08:00:00")), ["2026-09-29"]);
  assert.deepEqual(availableSlots(fixed, "2026-09-29", at("2026-10-19", "08:00:00")), event.slotTimes);
});
