import assert from "node:assert/strict";
import test from "node:test";
import { dropCatalogProduct, moveCatalogProduct } from "./order";
import type { CatalogItemProduct } from "./types";

function product(
  productId: string,
  category: CatalogItemProduct["category"],
  itemSortOrder: number,
): CatalogItemProduct {
  return {
    category,
    cut: "Corte",
    hasApprovedImages: true,
    itemSortOrder,
    productId,
    status: "active",
    title: productId,
  };
}

test("mueve un producto con los controles dentro de su categoría", () => {
  const items = [
    product("cerdo-1", "Cerdo", 0),
    product("cerdo-2", "Cerdo", 1),
    product("pollo-1", "Pollo", 2),
  ];

  const result = moveCatalogProduct(items, "cerdo-2", -1);

  assert.deepEqual(result?.map((item) => item.productId), ["cerdo-2", "cerdo-1", "pollo-1"]);
});

test("ordena por drag and drop sin mover productos entre categorías", () => {
  const items = [
    product("cerdo-1", "Cerdo", 0),
    product("cerdo-2", "Cerdo", 1),
    product("cerdo-3", "Cerdo", 2),
    product("pollo-1", "Pollo", 3),
  ];

  const result = dropCatalogProduct(items, "cerdo-1", "cerdo-3");
  const rejected = dropCatalogProduct(items, "cerdo-1", "pollo-1");

  assert.deepEqual(
    result?.map((item) => item.productId),
    ["cerdo-2", "cerdo-3", "cerdo-1", "pollo-1"],
  );
  assert.equal(rejected, null);
});
