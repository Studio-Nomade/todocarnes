import assert from "node:assert/strict";
import test from "node:test";
import { resolveAuthRedirectOrigin } from "./redirect-origin";

test("usa APP_URL como origen publico", () => {
  assert.equal(
    resolveAuthRedirectOrigin({
      appUrl: "https://admin.todocarnes.cl/",
      nodeEnv: "production",
      requestUrl: "http://localhost:8080/auth/confirm",
    }),
    "https://admin.todocarnes.cl",
  );
});

test("no permite que el proxy interno envie al usuario a localhost en produccion", () => {
  assert.equal(
    resolveAuthRedirectOrigin({
      appUrl: "http://localhost:8080",
      nodeEnv: "production",
      requestUrl: "http://localhost:8080/auth/confirm",
    }),
    "https://admin.todocarnes.cl",
  );
});

test("usa el dominio canonico si APP_URL falta en produccion", () => {
  assert.equal(
    resolveAuthRedirectOrigin({
      nodeEnv: "production",
      requestUrl: "http://localhost:8080/auth/confirm",
    }),
    "https://admin.todocarnes.cl",
  );
});

test("conserva el origen local fuera de produccion", () => {
  assert.equal(
    resolveAuthRedirectOrigin({
      nodeEnv: "development",
      requestUrl: "http://localhost:3000/auth/confirm",
    }),
    "http://localhost:3000",
  );
});
