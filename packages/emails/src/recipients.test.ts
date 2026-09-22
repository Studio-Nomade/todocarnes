import assert from "node:assert/strict";
import test from "node:test";
import { parseEmailList, representativeCc } from "./senders";

test("EMAIL_INTERNAL_TO acepta listas separadas por coma, punto y coma o espacios", () => {
  assert.deepEqual(
    parseEmailList(" frecabarren@tdcarnes.cl, rjz@tdcarnes.cl;webdesign@studionomade.cl "),
    ["frecabarren@tdcarnes.cl", "rjz@tdcarnes.cl", "webdesign@studionomade.cl"],
  );
});

test("EMAIL_INTERNAL_TO descarta vacíos, inválidos y duplicados", () => {
  assert.deepEqual(parseEmailList("RJZ@tdcarnes.cl, , no-es-correo, rjz@tdcarnes.cl"), ["rjz@tdcarnes.cl"]);
  assert.deepEqual(parseEmailList(undefined), []);
});

test("el CC de vendedores no repite correos ni incluye al destinatario principal", () => {
  const cc = representativeCc(
    [
      { name: "Paulina", email: "purbina@tdcarnes.cl" },
      null,
      { name: "Paulina (otra área)", email: "PURBINA@tdcarnes.cl" },
      { name: "Fernando", email: "fsalinas@tdcarnes.cl" },
      { name: "Cliente", email: "cliente@empresa.cl" },
    ],
    "cliente@empresa.cl",
  );
  assert.deepEqual(cc, ["purbina@tdcarnes.cl", "fsalinas@tdcarnes.cl"]);
});
