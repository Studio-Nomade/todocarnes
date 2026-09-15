import assert from "node:assert/strict";
import test from "node:test";
import type { PublicRepresentative } from "./types";
import { buildWhatsAppHref, normalizeWhatsAppNumber } from "./whatsapp";

const representative: PublicRepresentative = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "Víctor Andrades",
  area: "food_service",
  areaLabel: "Food Service",
  photoUrl: null,
  whatsapp: "+56 9 1234 5678",
  bio: "",
  isPlaceholder: false,
};

test("normaliza el número de WhatsApp a dígitos con código país", () => {
  assert.equal(normalizeWhatsAppNumber("+56 9 1234-5678"), "56912345678");
  assert.equal(normalizeWhatsAppNumber("9 1234 5678"), "56912345678");
  assert.equal(normalizeWhatsAppNumber(null), null);
});

test("construye un deep link con vendedor, área y horario tentativo", () => {
  const href = buildWhatsAppHref({ representative, dayLabel: "mié, 30 sept", slotTime: "13:00:00", customerName: "Ana" });
  assert.ok(href?.startsWith("https://wa.me/56912345678?text="));
  const message = decodeURIComponent(href?.split("?text=")[1] ?? "");
  assert.match(message, /Víctor Andrades/);
  assert.match(message, /Food Service/);
  assert.match(message, /mié, 30 sept a las 13:00/);
});
