import assert from "node:assert/strict";
import test from "node:test";
import { productSlug } from "./slug";

test("normaliza nombres de corte como slug estable", () => {
  assert.equal(productSlug("  Chuleta Vetada / Premium  "), "chuleta-vetada-premium");
  assert.equal(productSlug("Pechugá Ñandú"), "pechuga-nandu");
});
