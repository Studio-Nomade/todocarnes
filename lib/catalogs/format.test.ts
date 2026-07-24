import assert from "node:assert/strict";
import test from "node:test";
import { catalogPdfFilename, catalogStatusLabels } from "./format";

test("arma el nombre comercial del PDF con fecha y mes del catálogo", () => {
  const date = new Date("2026-07-24T12:00:00Z");
  assert.equal(
    catalogPdfFilename(7, date),
    "260724_Catalogo Oficial Todo Carnes - Julio.pdf",
  );
});

test("expone etiquetas comerciales sin cambiar los estados de DB", () => {
  assert.deepEqual(catalogStatusLabels, {
    draft: "Borrador",
    exported: "Publicado",
    ready: "En revisión",
  });
});
