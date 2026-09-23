import assert from "node:assert/strict";
import test from "node:test";
import { normalizeName, normalizedNumbers, tokens } from "./normalize";

test("normaliza diacríticos, signos y espacios", () => {
  assert.equal(normalizeName("  HÍGADO — de   Vacuno  "), "higado de vacuno");
});

test("aplica alias simples y por bigramas", () => {
  assert.deepEqual(
    tokens("Surita Polmani Hemra Truto Le Vida Campo Frío C-Vale FLP Foods Mountaire Farms"),
    ["sulita", "palmali", "hembra", "trutro", "levida", "campofrio", "cvale", "flp", "mountaire"],
  );
});

test("normaliza números decimales y rangos para comparar", () => {
  assert.deepEqual(normalizedNumbers("150, 200-220, 220.220 y 1.8 / 2,2"), ["150", "200220", "220220", "18", "22"]);
});
