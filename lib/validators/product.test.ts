import assert from "node:assert/strict";
import test from "node:test";
import { productFiltersSchema } from "./product";

test("convierte filtros GET vacíos en valores opcionales", () => {
  const filters = productFiltersSchema.parse({
    brand: "",
    category: "",
    cut: "",
    q: "",
    status: "",
  });

  assert.equal(filters.category, undefined);
  assert.equal(filters.cut, undefined);
  assert.equal(filters.status, undefined);
});
