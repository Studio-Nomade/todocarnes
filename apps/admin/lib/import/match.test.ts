import assert from "node:assert/strict";
import test from "node:test";
import { catalogoJulio2026Products } from "../../data/import/catalogo-julio-2026-products";
import { assignFolderOwners, matchFolder } from "./match";

const expectedCases = [
  ["foto 17 - Lomo Centro Polmani", "matched", "CF-1589"],
  ["foto 16 - Costillar de Cerdo Palmali", "matched", "CF-1616"],
  ["foto 14 - Costillar de Hembra Abbyland", "matched", "CF-1557"],
  ["foto 3 - Chuleta Porcionada Agrosuper", "matched", "CF-1599"],
  ["foto 10 - Lomo Centro Surita", "unmatched", null],
  ["foto 11 - Trutro Ala Seara", "unmatched", null],
  ["foto 22 - Baby Back Ribs", "ambiguous", "CF-1590"],
  ["foto 23 - Lomo Centro", "ambiguous", "CF-1589"],
  ["foto 19 - Chuleta Centro 150", "ambiguous", "CF-1264"],
  ["foto 29 - Corazón de Vacuno", "unmatched", null],
  ["foto 31 - Lengua", "unmatched", null],
  ["cerdo/CF-1575_costillar-fricasa", "matched", "CF-1575"],
] as const;

test("fija los cruces reales del catálogo y de la sesión", () => {
  for (const [folder, verdict, code] of expectedCases) {
    const result = matchFolder(folder, catalogoJulio2026Products);
    assert.equal(result.verdict, verdict, folder);
    assert.equal(result.candidate?.code.split("\n")[0] ?? null, code, folder);
  }
});

test("la carpeta con menor ordinal es dueña cuando dos carpetas cruzan al mismo producto", () => {
  const folders = ["foto 8 - Chuleta Vetada Seara", "foto 6 - Chuleta Vetada Seara"];
  const owned = assignFolderOwners(folders.map((folderName) => ({
    folderName,
    match: matchFolder(folderName, catalogoJulio2026Products),
  })));

  assert.ok(owned.every((item) => item.match.candidate?.code === "CF-1353"));
  assert.equal(owned.find((item) => item.folderName.startsWith("foto 6"))?.ownsApprovedSlots, true);
  assert.equal(owned.find((item) => item.folderName.startsWith("foto 8"))?.ownsApprovedSlots, false);
});
