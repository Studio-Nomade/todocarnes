import assert from "node:assert/strict";
import test from "node:test";
import { catalogoJulio2026Products } from "./catalogo-julio-2026-products";

const extractCodes = (code: string) => code.match(/CF-\d+/g) ?? [];

test("el catálogo de julio contiene 41 fichas, páginas únicas y códigos sin duplicados", () => {
  const codes = catalogoJulio2026Products.flatMap((product) => extractCodes(product.code));

  assert.equal(catalogoJulio2026Products.length, 41);
  assert.equal(new Set(catalogoJulio2026Products.map((product) => product.page)).size, 41);
  assert.equal(codes.length, 45);
  assert.equal(new Set(codes).size, codes.length);
  assert.ok(catalogoJulio2026Products.every((product) => extractCodes(product.code).length > 0));
});

test("respeta el mapa página a código del catálogo publicado", () => {
  const expectedByPage = new Map<number, string>([
    [4, "CF-1608"], [5, "CF-1388"], [6, "CF-1593"], [7, "CF-1494"], [8, "CF-1616"],
    [9, "CF-1575"], [10, "CF-1557"], [11, "CF-1591"], [12, "CF-1613"], [13, "CF-1590"],
    [14, "CF-1594"], [15, "CF-1353"], [16, "CF-1611"], [17, "CF-1262"], [18, "CF-1264"],
    [19, "CF-1438"], [20, "CF-1586"], [21, "CF-1585"], [22, "CF-1599"], [23, "CF-1449"],
    [24, "CF-1614"], [25, "CF-1589"], [27, "CF-1580"], [28, "CF-1364"], [29, "CF-1415"],
    [30, "CF-1597"], [31, "CF-1572"], [32, "CF-1220"], [33, "CF-1587"], [34, "CF-1509"],
    [35, "CF-1485"], [36, "CF-1497"], [37, "CF-1607"],
    [38, "CF-1600\nCF-1601\nCF-1602\nCF-1603\nCF-1604"], [39, "CF-1414"],
    [41, "CF-1588"], [42, "CF-1577"], [44, "CF-1004"], [45, "CF-1002"], [46, "CF-1003"],
    [47, "CF-1046"],
  ]);

  assert.deepEqual(
    new Map(catalogoJulio2026Products.map((product) => [product.page, product.code])),
    expectedByPage,
  );
});

test("cada categoría ocupa exclusivamente las páginas definidas para julio", () => {
  const ranges = {
    cerdo: [4, 25],
    pollo: [27, 39],
    vacuno: [41, 42],
    trimming: [44, 47],
  } as const;

  for (const product of catalogoJulio2026Products) {
    const [minimum, maximum] = ranges[product.category];
    assert.ok(product.page >= minimum && product.page <= maximum);
  }
});

test("corrige las etiquetas editoriales de pollo entero y trimming", () => {
  const correctedCategories = catalogoJulio2026Products.filter(
    (product) => product.category === "pollo" || product.category === "trimming",
  );
  const trimming = catalogoJulio2026Products.filter((product) => product.category === "trimming");

  assert.ok(correctedCategories.every((product) => !product.eyebrow.toLowerCase().includes("posta")));
  assert.equal(trimming.length, 4);
  assert.ok(trimming.every((product) => product.eyebrow === "Trimming"));
  assert.ok(trimming.every((product) => product.title.startsWith("Trimming ")));
  assert.equal(catalogoJulio2026Products.find((product) => product.code === "CF-1414")?.eyebrow, "Pollo Entero");
});

test("la ficha multivariante conserva cinco líneas coordinadas", () => {
  const product = catalogoJulio2026Products.find((candidate) => candidate.code.includes("CF-1600"));

  assert.ok(product);
  for (const field of [product.code, product.boxWeight, product.format, product.units]) {
    assert.ok(field);
    assert.equal(field.split("\n").length, 5);
  }
});

test("los textos respetan los límites aceptados por productSchema", () => {
  const limits = {
    eyebrow: 120,
    title: 160,
    code: 160,
    boxWeight: 240,
    format: 240,
    units: 240,
  } as const;

  for (const product of catalogoJulio2026Products) {
    for (const [field, maximum] of Object.entries(limits)) {
      const value = product[field as keyof typeof limits];
      assert.ok(value === null || value.length <= maximum, `${product.code}: ${field} excede ${maximum}`);
    }
  }
});

test("los campos vacíos usan null y nunca strings vacíos", () => {
  for (const product of catalogoJulio2026Products) {
    for (const value of Object.values(product)) {
      assert.notEqual(value, "");
    }
  }
});
