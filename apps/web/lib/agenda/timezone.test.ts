import assert from "node:assert/strict";
import test from "node:test";
import { zonedDateTimeToUtc } from "./timezone";

test("convierte los horarios de Food Service desde America/Santiago sin corrimiento", () => {
  assert.equal(
    zonedDateTimeToUtc("2026-09-29", "11:00:00", "America/Santiago").toISOString(),
    "2026-09-29T14:00:00.000Z",
  );
  assert.equal(
    zonedDateTimeToUtc("2026-10-01", "16:00:00", "America/Santiago").toISOString(),
    "2026-10-01T19:00:00.000Z",
  );
});
