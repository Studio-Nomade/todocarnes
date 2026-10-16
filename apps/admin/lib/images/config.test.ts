import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_IMAGE_MODEL, isImageGenerationEnabled, resolveImageModel, resolveImageProvider } from "./config";

test("permite configurar el modelo con respaldo estable", () => {
  assert.equal(resolveImageModel("gpt-image-custom"), "gpt-image-custom");
  assert.equal(resolveImageModel("  "), DEFAULT_IMAGE_MODEL);
});

test("impide usar mock en producción", () => {
  assert.equal(isImageGenerationEnabled("mock", "production"), false);
  assert.equal(isImageGenerationEnabled("openai", "production"), true);
  assert.equal(isImageGenerationEnabled("mock", "development"), true);
  assert.equal(resolveImageProvider("valor-invalido"), "mock");
});
