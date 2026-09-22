import assert from "node:assert/strict";
import test from "node:test";
import { areasLabel } from "./constants";

test("une varias áreas en una sola etiqueta sin duplicados", () => {
  assert.equal(areasLabel(["retail_ggcc", "food_service", "retail_ggcc"]), "Retail / GGCC + Food Service");
});

test("usa el área principal si la lista viene vacía", () => {
  assert.equal(areasLabel([], "mmpp_trimmings"), "MMPP / Trimmings");
  assert.equal(areasLabel(null), "Área comercial");
});
