import assert from "node:assert/strict";
import test from "node:test";
import { courtesyRequestSchema } from "./validation";

const validRequest = {
  eventId: "00000000-0000-4000-8000-000000000000",
  name: "Ana Pérez",
  company: "Empresa Uno",
  cargo: "Gerenta",
  email: "ana@example.com",
  phone: "+56 9 1234 5678",
  area: "food_service",
  website: "",
};

test("valida los seis campos de una solicitud de cortesía", () => {
  const result = courtesyRequestSchema.parse(validRequest);
  assert.equal(result.phone, "+56912345678");
  assert.equal(result.area, "food_service");
});

test("rechaza áreas desconocidas y honeypot poblado", () => {
  assert.equal(courtesyRequestSchema.safeParse({ ...validRequest, area: "inventada" }).success, false);
  assert.equal(courtesyRequestSchema.safeParse({ ...validRequest, website: "spam.example" }).success, false);
});
