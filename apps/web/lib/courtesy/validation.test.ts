import assert from "node:assert/strict";
import test from "node:test";
import { courtesyRequestSchema } from "./validation";

const validRequest = {
  eventId: "00000000-0000-4000-8000-000000000000",
  name: "Ana",
  lastName: "Pérez",
  rut: "11.111.111-1",
  company: "Empresa Uno",
  cargo: "Gerenta",
  email: "ana@example.com",
  phone: "+56 9 1234 5678",
  website: "",
};

test("valida los siete campos de una solicitud de cortesía", () => {
  const result = courtesyRequestSchema.parse(validRequest);
  assert.equal(result.phone, "+56912345678");
  assert.equal(result.rut, "11111111-1");
  assert.equal(result.lastName, "Pérez");
});

test("rechaza RUT inválido y honeypot poblado", () => {
  assert.equal(courtesyRequestSchema.safeParse({ ...validRequest, rut: "11.111.111-2" }).success, false);
  assert.equal(courtesyRequestSchema.safeParse({ ...validRequest, website: "spam.example" }).success, false);
});
