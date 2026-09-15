import assert from "node:assert/strict";
import test from "node:test";
import { catalogV02Products } from "./catalog-v02-products";

test("el catálogo v02 contiene 38 fichas con códigos y páginas únicas", () => {
  assert.equal(catalogV02Products.length, 38);
  assert.equal(new Set(catalogV02Products.map((product) => product.code)).size, 38);
  assert.equal(new Set(catalogV02Products.map((product) => product.page)).size, 38);
});

test("corrige los textos de Trimming y conserva Posta Rosada", () => {
  const trimming = catalogV02Products.filter((product) => product.category === "trimming");
  assert.equal(trimming.length, 4);
  assert.ok(trimming.every((product) => product.eyebrow === "Trimming"));
  assert.ok(trimming.every((product) => product.title.startsWith("Trimming ")));
  assert.equal(catalogV02Products.find((product) => product.code === "CF-1588")?.eyebrow, "Posta de Vacuno");
});

test("corrige la categoría editorial del Pollo Entero Seara", () => {
  const product = catalogV02Products.find((candidate) => candidate.code === "CF-1414");
  assert.equal(product?.category, "pollo");
  assert.equal(product?.eyebrow, "Pollo Entero");
});
