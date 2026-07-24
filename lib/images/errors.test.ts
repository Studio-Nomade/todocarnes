import assert from "node:assert/strict";
import test from "node:test";
import { humanizeOpenAIError } from "./errors";

test("traduce falta de crédito sin exponer el error original", () => {
  const message = humanizeOpenAIError({
    code: "insufficient_quota",
    message: "Billing detail from organization org-secret",
  });
  assert.equal(
    message,
    "No hay crédito disponible para generar imágenes. Avisa al administrador.",
  );
  assert.equal(message.includes("org-secret"), false);
});

test("traduce organización no verificada", () => {
  assert.equal(
    humanizeOpenAIError({ message: "Your organization must be verified to use this model." }),
    "La cuenta de OpenAI no está habilitada para generar imágenes.",
  );
});

test("traduce timeout", () => {
  assert.equal(
    humanizeOpenAIError({ name: "APIConnectionTimeoutError" }),
    "La generación tardó demasiado. Intenta nuevamente.",
  );
});

test("traduce rechazo de safety", () => {
  assert.equal(
    humanizeOpenAIError({ code: "content_policy_violation" }),
    "OpenAI rechazó esta generación. Prueba con otra imagen fuente.",
  );
});

test("usa un mensaje seguro para errores desconocidos", () => {
  const message = humanizeOpenAIError({ message: "Sensitive raw request body" });
  assert.equal(
    message,
    "No se pudo generar la imagen. Intenta nuevamente o avisa al administrador.",
  );
  assert.equal(message.includes("Sensitive"), false);
});
