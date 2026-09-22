import assert from "node:assert/strict";
import test from "node:test";
import { EMAIL_HEADER_BASE64, EMAIL_HEADER_FILENAME } from "./email-header";

// Regresión: el logo se leía del disco con `new URL(..., import.meta.url)`, que el bundler reescribe a
// una ruta web. En producción `readFile` fallaba y tiraba el envío antes de llamar a Resend.
test("la cabecera del correo viaja incrustada y es un JPEG válido", () => {
  assert.ok(EMAIL_HEADER_BASE64.length > 1000, "el base64 de la cabecera está vacío o es sospechosamente corto");
  assert.match(EMAIL_HEADER_BASE64, /^[A-Za-z0-9+/]+={0,2}$/, "no es base64 limpio");
  const header = Buffer.from(EMAIL_HEADER_BASE64.slice(0, 8), "base64");
  assert.deepEqual([header[0], header[1]], [0xff, 0xd8], "no empieza con la marca SOI de JPEG");
  assert.equal(EMAIL_HEADER_FILENAME.endsWith(".jpg"), true);
});
