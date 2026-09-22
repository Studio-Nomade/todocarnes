import assert from "node:assert/strict";
import test from "node:test";
import { EMAIL_LOGO_BASE64, EMAIL_LOGO_FILENAME } from "./logo";

// Regresión: el logo se leía del disco con `new URL(..., import.meta.url)`, que el bundler reescribe a
// una ruta web. En producción `readFile` fallaba y tiraba el envío antes de llamar a Resend.
test("el logo del correo viaja incrustado y es un PNG válido", () => {
  assert.ok(EMAIL_LOGO_BASE64.length > 1000, "el base64 del logo está vacío o es sospechosamente corto");
  assert.match(EMAIL_LOGO_BASE64, /^[A-Za-z0-9+/]+={0,2}$/, "no es base64 limpio");
  const header = Buffer.from(EMAIL_LOGO_BASE64.slice(0, 16), "base64");
  assert.equal(header.subarray(1, 4).toString("ascii"), "PNG");
  assert.equal(EMAIL_LOGO_FILENAME.endsWith(".png"), true);
});
