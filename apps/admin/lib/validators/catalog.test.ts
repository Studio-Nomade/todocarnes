import assert from "node:assert/strict";
import test from "node:test";
import { catalogTitleSchema } from "./catalog";

test("normaliza el nombre editable del catálogo", () => {
  assert.equal(catalogTitleSchema.parse("  Catálogo agosto  "), "Catálogo agosto");
});

test("rechaza nombres vacíos o sobre 160 caracteres", () => {
  assert.equal(catalogTitleSchema.safeParse("   ").success, false);
  assert.equal(catalogTitleSchema.safeParse("a".repeat(161)).success, false);
});
