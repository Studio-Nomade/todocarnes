import assert from "node:assert/strict";
import { test } from "node:test";
import { buildPages, type CatalogProduct } from "./page-order";

function product(overrides: Partial<CatalogProduct>): CatalogProduct {
  return {
    id: overrides.id ?? "p",
    category: overrides.category ?? "Cerdo",
    categorySortOrder: overrides.categorySortOrder ?? 0,
    cut: overrides.cut ?? "Costillar",
    cutSortOrder: overrides.cutSortOrder ?? 0,
    itemSortOrder: overrides.itemSortOrder ?? 0,
    eyebrow: "",
    title: overrides.title ?? "Producto",
    code: null,
    brand: null,
    origin: null,
    boxWeight: null,
    format: null,
    units: null,
    mainImage: "x",
    secondaryImages: ["x", "x", "x"],
  };
}

test("catálogo vacío: solo portada, índice y cierre", () => {
  const pages = buildPages([]);
  assert.deepEqual(
    pages.map((p) => p.kind),
    ["cover", "index", "closing"],
  );
  assert.deepEqual(
    pages.map((p) => p.pageNumber),
    [1, 2, 3],
  );
  const index = pages[1];
  assert.equal(index.kind === "index" && index.entries.length, 0);
});

test("una categoría: portada, índice, separador, fichas, cierre en orden", () => {
  const pages = buildPages([
    product({ id: "a", cut: "Costillar", cutSortOrder: 0, title: "A" }),
    product({ id: "b", cut: "Panceta", cutSortOrder: 5, title: "B" }),
  ]);
  assert.deepEqual(
    pages.map((p) => p.kind),
    ["cover", "index", "divider", "product", "product", "closing"],
  );
  assert.deepEqual(
    pages.map((p) => p.pageNumber),
    [1, 2, 3, 4, 5, 6],
  );
  const divider = pages[2];
  assert.ok(divider.kind === "divider");
  assert.deepEqual(divider.cuts, ["Costillar", "Panceta"]);
});

test("una categoría sin productos nunca genera separador (no hay categoría vacía posible)", () => {
  const pages = buildPages([product({ category: "Pollo" })]);
  const dividers = pages.filter((p) => p.kind === "divider");
  assert.equal(dividers.length, 1);
  assert.ok(dividers[0].kind === "divider" && dividers[0].category === "Pollo");
});

test("categorías se ordenan por categorySortOrder", () => {
  const pages = buildPages([
    product({ id: "v", category: "Vacuno", categorySortOrder: 2, cut: "Posta" }),
    product({ id: "c", category: "Cerdo", categorySortOrder: 0, cut: "Costillar" }),
  ]);
  const dividers = pages.filter((p) => p.kind === "divider");
  assert.deepEqual(
    dividers.map((d) => (d.kind === "divider" ? d.category : "")),
    ["Cerdo", "Vacuno"],
  );
});

test("dentro de una categoría, ordena por itemSortOrder (el orden del usuario, no el corte)", () => {
  const pages = buildPages([
    product({ id: "3", cut: "Panceta", cutSortOrder: 5, itemSortOrder: 2, title: "tercero" }),
    product({ id: "2", cut: "Costillar", cutSortOrder: 0, itemSortOrder: 1, title: "segundo" }),
    product({ id: "1", cut: "Panceta", cutSortOrder: 5, itemSortOrder: 0, title: "primero" }),
  ]);
  const titles = pages
    .filter((p) => p.kind === "product")
    .map((p) => (p.kind === "product" ? p.product.title : ""));
  // Panceta (item 0) va antes que Costillar (item 1) aunque su corte tenga sort_order mayor.
  assert.deepEqual(titles, ["primero", "segundo", "tercero"]);
});

test("reordenar (cambiar itemSortOrder) cambia el orden de las fichas", () => {
  const base = [
    product({ id: "a", cut: "Costillar", itemSortOrder: 0, title: "A" }),
    product({ id: "b", cut: "Costillar", itemSortOrder: 1, title: "B" }),
  ];
  const before = buildPages(base)
    .filter((p) => p.kind === "product")
    .map((p) => (p.kind === "product" ? p.product.id : ""));
  const reordered = buildPages([
    { ...base[0], itemSortOrder: 1 },
    { ...base[1], itemSortOrder: 0 },
  ])
    .filter((p) => p.kind === "product")
    .map((p) => (p.kind === "product" ? p.product.id : ""));
  assert.deepEqual(before, ["a", "b"]);
  assert.deepEqual(reordered, ["b", "a"]);
});

test("cada ficha lleva los cortes de su categoría para el CutsNav", () => {
  const pages = buildPages([
    product({ category: "Cerdo", cut: "Costillar", cutSortOrder: 0 }),
    product({ category: "Cerdo", cut: "Panceta", cutSortOrder: 5 }),
  ]);
  const productPage = pages.find((p) => p.kind === "product");
  assert.ok(productPage?.kind === "product");
  assert.deepEqual(productPage.categoryCuts, ["Costillar", "Panceta"]);
});
