import assert from "node:assert/strict";
import test from "node:test";
import { LANDING_AREA_OPTIONS } from "./constants";
import { firstForwardedIp, hashRequestIp } from "./security";
import { landingLeadSchema } from "./validation";

const base = { name: "Ana Prueba", company: "Empresa", email: "ana@example.com", phone: "9 1234 5678", website: "", submissionId: "d8a5764d-5459-459f-a558-4e511f247744" };

test("acepta y normaliza cada área comercial del formulario", () => {
  for (const option of LANDING_AREA_OPTIONS) {
    const parsed = landingLeadSchema.parse({ ...base, areas: [option.value] });
    assert.deepEqual(parsed.areas, [option.value]);
    assert.equal(parsed.phone, "+56912345678");
  }
});

test("permite varias áreas y elimina duplicados", () => {
  const parsed = landingLeadSchema.parse({ ...base, areas: ["food_service", "retail_ggcc", "food_service"] });
  assert.deepEqual(parsed.areas, ["food_service", "retail_ggcc"]);
});

test("el honeypot rechaza bots y exige al menos un área válida", () => {
  assert.equal(landingLeadSchema.safeParse({ ...base, areas: ["food_service"], website: "spam" }).success, false);
  assert.equal(landingLeadSchema.safeParse({ ...base, areas: [] }).success, false);
  assert.equal(landingLeadSchema.safeParse({ ...base, areas: ["inexistente"] }).success, false);
});

test("extrae la primera IP del proxy y genera un hash estable", () => {
  assert.equal(firstForwardedIp("203.0.113.7, 10.0.0.1", null), "203.0.113.7");
  assert.equal(hashRequestIp("203.0.113.7"), hashRequestIp("203.0.113.7"));
  assert.equal(hashRequestIp(null), null);
});
