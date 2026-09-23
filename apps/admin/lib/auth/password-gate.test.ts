import assert from "node:assert/strict";
import test from "node:test";
import { mustRedirectToPasswordChange } from "./password-gate";

test("redirige rutas del dashboard cuando el cambio es obligatorio", () => {
  assert.equal(mustRedirectToPasswordChange({ mustChangePassword: true, pathname: "/dashboard" }), true);
  assert.equal(mustRedirectToPasswordChange({ mustChangePassword: true, pathname: "/users" }), true);
});

test("mantiene disponible el perfil y el bypass explícito de logout", () => {
  assert.equal(mustRedirectToPasswordChange({ mustChangePassword: true, pathname: "/profile" }), false);
  assert.equal(mustRedirectToPasswordChange({
    allowPasswordChangeRequired: true,
    mustChangePassword: true,
    pathname: "/dashboard",
  }), false);
});
