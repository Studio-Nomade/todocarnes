import assert from "node:assert/strict";
import test from "node:test";
import { isValidRut, normalizeRut } from "./rut";
import { courtesyRequestSchema } from "./validation";

test("normaliza el RUT sin puntos y con guion", () => {
  assert.equal(normalizeRut("12.345.678-5"), "12345678-5");
  assert.equal(normalizeRut(" 12345678k "), "12345678-K");
});

test("valida el dígito verificador", () => {
  assert.equal(isValidRut("12.345.678-5"), true);
  assert.equal(isValidRut("11.111.111-1"), true);
  assert.equal(isValidRut("12.345.678-9"), false, "un DV incorrecto debe rechazarse");
  assert.equal(isValidRut("123-5"), false);
  assert.equal(isValidRut(""), false);
});

test("la solicitud de cortesía exige los campos nuevos y normaliza RUT y teléfono", () => {
  const base = {
    eventId: "d8a5764d-5459-459f-a558-4e511f247744",
    name: "Camila",
    lastName: "Rojas",
    rut: "12.345.678-5",
    company: "Ejemplo SpA",
    cargo: "Jefa de compras",
    email: "camila@example.com",
    phone: "9 1234 5678",
    website: "",
  };

  const parsed = courtesyRequestSchema.parse(base);
  assert.equal(parsed.rut, "12345678-5");
  assert.equal(parsed.phone, "+56912345678");

  assert.equal(courtesyRequestSchema.safeParse({ ...base, rut: "12.345.678-9" }).success, false);
  assert.equal(courtesyRequestSchema.safeParse({ ...base, lastName: "" }).success, false);
  assert.equal(courtesyRequestSchema.safeParse({ ...base, website: "spam" }).success, false);
});
