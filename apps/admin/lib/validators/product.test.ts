import assert from "node:assert/strict";
import test from "node:test";
import { productFiltersSchema, productSchema } from "./product";

const baseProduct = {
  box_weight: "",
  brand: "",
  category_id: "5b6ec032-1700-4dcf-b9ca-b63850179d27",
  code: "",
  cut_id: "fdf8e90a-f570-44bc-9cae-a54c2dbd0bde",
  eyebrow: "",
  format: "",
  month_tag: "",
  notes: "",
  origin: "",
  status: "draft" as const,
  title: "Producto",
  units: "",
  uses: [],
};

test("usa disponible pronto desactivado por defecto", () => {
  assert.equal(productSchema.parse(baseProduct).available_soon, false);
});

test("acepta usos sugeridos sin duplicados", () => {
  assert.deepEqual(productSchema.parse({ ...baseProduct, uses: ["parrilla", "olla"] }).uses, ["parrilla", "olla"]);
  assert.equal(productSchema.safeParse({ ...baseProduct, uses: ["parrilla", "parrilla"] }).success, false);
});

test("convierte filtros GET vacíos en valores opcionales", () => {
  const filters = productFiltersSchema.parse({
    brand: "",
    category: "",
    cut: "",
    q: "",
    status: "",
    availableSoon: "",
  });

  assert.equal(filters.category, undefined);
  assert.equal(filters.cut, undefined);
  assert.equal(filters.status, undefined);
  assert.equal(filters.availableSoon, undefined);
});
