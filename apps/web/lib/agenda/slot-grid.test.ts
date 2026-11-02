import assert from "node:assert/strict";
import test from "node:test";
import type { AvailabilityEvent } from "./availability";
import { buildSlotGrid } from "./slot-grid";
import { zonedDateTimeToUtc } from "./timezone";

const event: AvailabilityEvent = {
  blackoutDates: [],
  days: null,
  horizonDays: 14,
  kind: "permanent",
  minNoticeHours: 24,
  slotTimes: ["10:00:00", "11:00:00"],
  weekdays: [1, 2, 3, 4, 5],
};

test("marca como ocupados solo los bloques reservados del vendedor", () => {
  const now = zonedDateTimeToUtc("2026-10-16", "09:00:00", "America/Santiago");
  const grid = buildSlotGrid(event, ["2026-10-19", "2026-10-20"], [{ day: "2026-10-20", slot_time: "11:00:00" }], now);
  assert.deepEqual(grid, [
    { day: "2026-10-19", slotTime: "10:00:00", taken: false },
    { day: "2026-10-19", slotTime: "11:00:00", taken: false },
    { day: "2026-10-20", slotTime: "10:00:00", taken: false },
    { day: "2026-10-20", slotTime: "11:00:00", taken: true },
  ]);
});
