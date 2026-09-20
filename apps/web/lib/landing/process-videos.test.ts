import assert from "node:assert/strict";
import test from "node:test";
import { buildProcessAssetUrl, PROCESS_VIDEOS } from "./process-videos";

test("define los nueve procesos con slugs únicos", () => {
  assert.equal(PROCESS_VIDEOS.length, 9);
  assert.equal(new Set(PROCESS_VIDEOS.map(({ slug }) => slug)).size, 9);
  assert.deepEqual(
    PROCESS_VIDEOS.map(({ slug }) => slug),
    ["corte", "gramaje", "porcionado", "procesamiento", "descongelado", "embalaje", "etiquetado", "maquila", "marca-propia"],
  );
});

test("construye las URLs públicas desde NEXT_PUBLIC_SUPABASE_URL", () => {
  assert.equal(
    buildProcessAssetUrl("https://project.supabase.co/", "marca-propia", "mp4"),
    "https://project.supabase.co/storage/v1/object/public/process-videos/marca-propia.mp4",
  );
  assert.equal(
    buildProcessAssetUrl("https://project.supabase.co", "corte", "webp"),
    "https://project.supabase.co/storage/v1/object/public/process-videos/corte.webp",
  );
  assert.equal(buildProcessAssetUrl("", "corte", "mp4"), null);
});
