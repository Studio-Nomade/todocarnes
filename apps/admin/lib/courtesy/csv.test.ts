import assert from "node:assert/strict";
import test from "node:test";
import { courtesyRequestsCsv } from "./csv";

test("exporta todos los campos y escapa contenido compatible con CSV", () => {
  const csv = courtesyRequestsCsv([{
    cargo: "=HYPERLINK(\"https://example.com\")",
    company: "Empresa, \"Sur\"",
    createdAt: "2026-09-23T13:30:47.000Z",
    email: "camila@example.com",
    eventId: "e7f9a51e-86f0-4d58-963a-b71be9dcd7ee",
    eventName: "Food & Service 2026",
    id: "59739d17-3da2-4067-bf9d-8fdb40c34d89",
    lastName: "Rojas",
    name: "Camila",
    phone: "+56912345678",
    rut: "12.345.678-5",
    status: "pending",
  }]);

  assert.equal(csv.startsWith("\uFEFF\"Fecha de solicitud\""), true);
  assert.equal(csv.includes('"Empresa, ""Sur"""'), true);
  assert.equal(csv.includes('"Camila","Rojas","12.345.678-5"'), true);
  assert.equal(csv.includes('"\'=HYPERLINK(""https://example.com"")"'), true);
  assert.equal(csv.endsWith('"Food & Service 2026","Pendiente"'), true);
});
