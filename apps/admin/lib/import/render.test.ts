import assert from "node:assert/strict";
import test from "node:test";
import { calculateGeometry, targetBox } from "./render";

test("todas las vistas de catálogo terminan en un lienzo 1942 por 850", () => {
  for (const slot of ["main", "secondary_1", "secondary_2", "secondary_3"] as const) {
    assert.deepEqual(targetBox(slot).canvas, { height: 850, width: 1942 });
  }
});

test("los secundarios contienen la fuente dentro de 1367 por 786 y centran el aire", () => {
  const geometry = calculateGeometry({ height: 2000, width: 2000 }, "secondary_1");
  assert.deepEqual(geometry.inner, { height: 786, width: 1367 });
  assert.deepEqual(geometry.resized, { height: 786, width: 786 });
  assert.equal(geometry.padding.left + geometry.resized.width + geometry.padding.right, 1942);
  assert.equal(geometry.padding.top + geometry.resized.height + geometry.padding.bottom, 850);
});

test("main contiene una fuente cuadrada sin recortarla", () => {
  const geometry = calculateGeometry({ height: 1000, width: 1000 }, "main");
  assert.deepEqual(geometry.resized, { height: 850, width: 850 });
  assert.equal(geometry.padding.left + geometry.resized.width + geometry.padding.right, 1942);
});

test("source produce un master cuadrado 2048 por 2048", () => {
  const geometry = calculateGeometry({ height: 800, width: 1600 }, "source");
  assert.deepEqual(geometry.canvas, { height: 2048, width: 2048 });
  assert.deepEqual(geometry.resized, { height: 1024, width: 2048 });
});
