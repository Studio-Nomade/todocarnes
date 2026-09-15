import assert from "node:assert/strict";
import test from "node:test";
import type { ProductInput } from "../validators/product";
import {
  buildVariantRows,
  emptyVariantRow,
  serializeVariantRows,
  variantInputBudget,
} from "./variants";

const product = {
  box_weight: "8 KG",
  brand: "",
  category_id: "11111111-1111-4111-8111-111111111111",
  code: "CF-1",
  cut_id: "22222222-2222-4222-8222-222222222222",
  eyebrow: "",
  format: "Vacío",
  month_tag: "",
  notes: "",
  origin: "",
  status: "active",
  title: "Producto",
  units: "8 unidades",
} satisfies ProductInput;

test("descarta filas de variante completamente vacías al serializar", () => {
  const rows = [...buildVariantRows(product), emptyVariantRow()];
  const serialized = serializeVariantRows(rows);
  assert.equal(serialized.code, "CF-1");
  assert.equal(serialized.units, "8 unidades");
});

test("calcula el máximo por input contra el presupuesto joineado del campo", () => {
  const rows = [
    { ...emptyVariantRow(), code: "A".repeat(100) },
    emptyVariantRow(),
  ];
  assert.equal(variantInputBudget(rows, 1, "code"), 59);
});

test("ocho variantes se serializan alineadas y dentro de los límites", () => {
  const rows = Array.from({ length: 8 }, (_, index) => ({
    box_weight: `${10 + index} KG`,
    code: `CF-${1000 + index}`,
    format: "Vacío",
    units: "8 unidades",
  }));
  const serialized = serializeVariantRows(rows);
  assert.equal(serialized.code.split("\n").length, 8);
  assert.ok(serialized.code.length <= 160);
  assert.ok(serialized.format.length <= 240);
  assert.ok(serialized.box_weight.length <= 240);
  assert.ok(serialized.units.length <= 240);
});
