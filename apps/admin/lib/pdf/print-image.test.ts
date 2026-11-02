import assert from "node:assert/strict";
import test from "node:test";
import { printImageConfigFromEnv, printImageUrl, resolvePrintImageSource } from "./print-image";

const supabase = "https://proyecto.supabase.co";

test("acepta fotos de producto y assets locales de la plantilla", () => {
  assert.deepEqual(
    resolvePrintImageSource(`${supabase}/storage/v1/object/public/product-images/a/b.webp?v=1`, supabase),
    { kind: "remote", url: `${supabase}/storage/v1/object/public/product-images/a/b.webp?v=1` },
  );
  assert.deepEqual(resolvePrintImageSource("/brand/cover-bg.webp", supabase), { kind: "local", path: "/brand/cover-bg.webp" });
});

test("rechaza otros dominios, otros buckets y rutas fuera de la plantilla", () => {
  assert.equal(resolvePrintImageSource("https://otro.com/foto.jpg", supabase), null);
  assert.equal(resolvePrintImageSource(`${supabase}/storage/v1/object/public/profile-photos/x.webp`, supabase), null);
  assert.equal(resolvePrintImageSource("/brand/../.env", supabase), null);
  assert.equal(resolvePrintImageSource("//evil.com/x.png", supabase), null);
  assert.equal(resolvePrintImageSource("/etc/passwd", supabase), null);
});

test("la URL del proxy escala el ancho de lámina y lleva el token", () => {
  const url = printImageUrl("/brand/cover-bg.webp", { quality: 78, scale: 2, token: "abc" }, 971);
  const params = new URL(url, "http://localhost").searchParams;
  assert.equal(params.get("w"), "1942");
  assert.equal(params.get("q"), "78");
  assert.equal(params.get("token"), "abc");
  assert.equal(params.get("src"), "/brand/cover-bg.webp");
});

test("la configuración sale del entorno con valores acotados", () => {
  assert.equal(printImageConfigFromEnv({}), null);
  assert.deepEqual(printImageConfigFromEnv({ PRINT_TOKEN: "t" }), { quality: 78, scale: 2, token: "t" });
  assert.deepEqual(
    printImageConfigFromEnv({ PRINT_IMAGE_QUALITY: "200", PRINT_IMAGE_SCALE: "0.1", PRINT_TOKEN: "t" }),
    { quality: 95, scale: 1, token: "t" },
  );
});
