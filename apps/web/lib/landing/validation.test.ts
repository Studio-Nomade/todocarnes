import assert from "node:assert/strict";
import test from "node:test";
import { LANDING_AREA_OPTIONS } from "./constants";
import { firstForwardedIp, hashRequestIp } from "./security";
import { landingLeadSchema } from "./validation";

const base = { name: "Ana Prueba", company: "Empresa", email: "ana@example.com", phone: "9 1234 5678", website: "", submissionId: "d8a5764d-5459-459f-a558-4e511f247744" };

test("acepta y normaliza cada área comercial del formulario", () => {
  for (const option of LANDING_AREA_OPTIONS) {
    const parsed = landingLeadSchema.parse({ ...base, area: option.value });
    assert.equal(parsed.area, option.value);
    assert.equal(parsed.phone, "+56912345678");
  }
});

test("el honeypot rechaza bots y la selección de área es obligatoria", () => {
  assert.equal(landingLeadSchema.safeParse({ ...base, area: "food_service", website: "spam" }).success, false);
  assert.equal(landingLeadSchema.safeParse({ ...base, area: "" }).success, false);
});

test("extrae la primera IP del proxy y genera un hash estable", () => {
  assert.equal(firstForwardedIp("203.0.113.7, 10.0.0.1", null), "203.0.113.7");
  assert.equal(hashRequestIp("203.0.113.7"), hashRequestIp("203.0.113.7"));
  assert.equal(hashRequestIp(null), null);
});
