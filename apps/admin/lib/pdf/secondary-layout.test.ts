import assert from "node:assert/strict";
import test from "node:test";
import { secondaryLayout } from "./secondary-layout";

test("centra la franja de imágenes secundarias", () => {
  assert.deepEqual(secondaryLayout(0), []);
  assert.deepEqual(secondaryLayout(1), [{ left: 802 }]);
  assert.deepEqual(secondaryLayout(2), [{ left: 656 }, { left: 948 }]);
  assert.deepEqual(secondaryLayout(3), [{ left: 510 }, { left: 802 }, { left: 1094 }]);
});
