import assert from "node:assert/strict";
import test from "node:test";
import { bookingInputSchema, isSlotConflict, normalizeChilePhone } from "./validation";

const validBooking = {
  eventId: "00000000-0000-4000-8000-000000000000",
  repId: "00000000-0000-4000-8000-000000000001",
  day: "2026-09-29",
  slotTime: "11:00:00",
  name: "Ana Pérez",
  company: "Empresa Uno",
  cargo: "Gerenta",
  email: "ana@example.com",
  phone: "9 1234 5678",
  topics: "Nuevos formatos",
  cameFrom: "redes_sociales",
};

test("normaliza teléfonos chilenos sin duplicar el código país", () => {
  assert.equal(normalizeChilePhone("9 1234 5678"), "+56912345678");
  assert.equal(normalizeChilePhone("+56 9 1234 5678"), "+56912345678");
});

test("valida y normaliza el payload completo de una reserva", () => {
  const result = bookingInputSchema.parse(validBooking);
  assert.equal(result.phone, "+56912345678");
});

test("rechaza teléfonos incompletos y reconoce carreras por unique violation", () => {
  assert.equal(bookingInputSchema.safeParse({ ...validBooking, phone: "123" }).success, false);
  assert.equal(isSlotConflict({ code: "23505" }), true);
  assert.equal(isSlotConflict({ code: "42501" }), false);
});
