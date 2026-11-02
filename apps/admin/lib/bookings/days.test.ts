import assert from "node:assert/strict";
import test from "node:test";
import { upcomingAgendaDays } from "./days";

test("la grilla cubre dos semanas calendario solo con días hábiles", () => {
  const days = upcomingAgendaDays({ blackoutDates: ["2026-10-21"], horizonDays: 14, now: new Date("2026-10-19T12:00:00-03:00"), weekdays: [1, 2, 3, 4, 5] });
  assert.equal(days[0], "2026-10-19");
  assert.equal(days.includes("2026-10-21"), false);
  assert.equal(days.includes("2026-10-24"), false);
  assert.equal(days.at(-1), "2026-10-30");
  assert.equal(days.length, 9);
});
