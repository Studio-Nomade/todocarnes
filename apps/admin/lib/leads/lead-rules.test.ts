import assert from "node:assert/strict";
import test from "node:test";
import { availableLeadStatuses, canTransitionLead } from "./constants";
import { safeLeadSearch } from "./validation";

test("respeta el flujo de estados del lead", () => {
  assert.deepEqual(availableLeadStatuses("new"), ["contacted", "discarded"]);
  assert.equal(canTransitionLead("contacted", "qualified"), true);
  assert.equal(canTransitionLead("qualified", "new"), false);
  assert.deepEqual(availableLeadStatuses("closed"), []);
});

test("limpia caracteres especiales antes de construir el filtro PostgREST", () => {
  assert.equal(safeLeadSearch("  Ana, (Carne%)  "), "Ana Carne");
});
