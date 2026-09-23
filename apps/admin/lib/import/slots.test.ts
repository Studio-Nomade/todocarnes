import assert from "node:assert/strict";
import test from "node:test";
import { assignSlots } from "./slots";

test("foto 14 elige vista 1 y reserva la vista de caja para secondary_3", () => {
  const result = assignSlots([
    "catalogo vista caja.png",
    "catalogo.png",
    "catalogo vista 1.png",
    "detalle.jpg",
  ]);

  assert.deepEqual(result.find((item) => item.file === "catalogo vista 1.png"), { file: "catalogo vista 1.png", order: 0, slot: "main", status: "approved" });
  assert.equal(result.find((item) => item.file === "catalogo vista caja.png")?.slot, "secondary_3");
  assert.equal(result.find((item) => item.file === "catalogo.png")?.status, "pending");
});

test("foto 11 usa el primer archivo byte cuando no existe catalogo", () => {
  const result = assignSlots(["detalle.png", "ChatGPT Image Sep 11.png"]);
  assert.equal(result.find((item) => item.slot === "main" && item.status === "approved")?.file, "ChatGPT Image Sep 11.png");
});

test("foto 30 con dos archivos deja solo un secundario ocupado", () => {
  const result = assignSlots(["catalogo.png", "vista.jpg"]);
  assert.equal(result.filter((item) => item.slot.startsWith("secondary")).length, 1);
});

test("foto 16 con cinco archivos deja un sobrante pending", () => {
  const result = assignSlots(["catalogo.png", "a.jpg", "b.jpg", "c.jpg", "d.jpg"]);
  assert.equal(result.filter((item) => item.status === "pending").length, 1);
});

test("la asignación no depende del orden de entrada", () => {
  const files = ["catalogo.png", "vista caja.jpg", "b.jpg", "a.jpg", "extra.png"];
  assert.deepEqual(assignSlots(files), assignSlots([...files].reverse()));
});

test("filtra extensiones no elegibles y DS Store", () => {
  assert.deepEqual(assignSlots([".DS_Store", "notas.txt", "catalogo.webp"]), []);
});
