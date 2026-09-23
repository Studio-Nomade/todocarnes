import assert from "node:assert/strict";
import test from "node:test";
import { changePasswordSchema, recoveryPasswordSchema } from "./account";

test("acepta una contraseña nueva válida y distinta", () => {
  assert.equal(changePasswordSchema.safeParse({
    currentPassword: "anterior-123",
    newPassword: "nueva-clave-123",
    repeatPassword: "nueva-clave-123",
  }).success, true);
});

test("rechaza una contraseña nueva corta, repetida o sin confirmación", () => {
  const shortPassword = changePasswordSchema.safeParse({
    currentPassword: "anterior-123",
    newPassword: "corta",
    repeatPassword: "corta",
  });
  const samePassword = changePasswordSchema.safeParse({
    currentPassword: "misma-clave",
    newPassword: "misma-clave",
    repeatPassword: "misma-clave",
  });
  const mismatch = recoveryPasswordSchema.safeParse({
    newPassword: "nueva-clave-123",
    repeatPassword: "otra-clave-456",
  });

  assert.equal(shortPassword.success, false);
  assert.equal(samePassword.success, false);
  assert.equal(mismatch.success, false);
});
