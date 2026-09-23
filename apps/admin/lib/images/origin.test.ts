import assert from "node:assert/strict";
import test from "node:test";
import type { ProductImageRecord } from "./types";
import { isOfficial } from "./origin";

function image(overrides: Partial<ProductImageRecord>): ProductImageRecord {
  return {
    created_at: "2026-09-23T00:00:00.000Z",
    generated_by_ai: false,
    id: "00000000-0000-4000-8000-000000000001",
    prompt_used: null,
    slot: "main",
    sort_order: 0,
    source_kind: "session",
    status: "approved",
    storage_path: "products/main.webp",
    url: "https://example.com/main.webp",
    ...overrides,
  };
}

test("es oficial solo cuando main aprobada proviene de la sesión", () => {
  assert.equal(isOfficial([image({})]), true);
  assert.equal(isOfficial([image({ source_kind: "catalog_pdf" })]), false);
  assert.equal(isOfficial([image({ status: "pending" })]), false);
  assert.equal(isOfficial([image({ slot: "secondary_1" })]), false);
  assert.equal(isOfficial([]), false);
});
