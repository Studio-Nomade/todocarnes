import assert from "node:assert/strict";
import test from "node:test";
import { catalogSchema, catalogTitleSchema } from "./catalog";

test("normaliza el nombre editable del catálogo", () => {
  assert.equal(catalogTitleSchema.parse("  Catálogo agosto  "), "Catálogo agosto");
});

test("rechaza nombres vacíos o sobre 160 caracteres", () => {
  assert.equal(catalogTitleSchema.safeParse("   ").success, false);
  assert.equal(catalogTitleSchema.safeParse("a".repeat(161)).success, false);
});

test("permite elegir si el catálogo incorpora la página de maquila", () => {
  const base = { month: 9, title: "Food Service", year: 2026 };
  assert.equal(catalogSchema.parse(base).includePackaging, true);
  assert.equal(catalogSchema.parse({ ...base, includePackaging: false }).includePackaging, false);
});
