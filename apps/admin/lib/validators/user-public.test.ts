import assert from "node:assert/strict";
import test from "node:test";
import { publicProfileSchema } from "./user";

const validProfile = {
  area: "food_service",
  isPublic: true,
  publicBio: "Atención comercial para operadores gastronómicos.",
  publicOrder: 1,
  userId: "00000000-0000-4000-8000-000000000001",
  whatsapp: "+56 9 1234 5678",
};

test("acepta un perfil público completo", () => {
  assert.equal(publicProfileSchema.safeParse(validProfile).success, true);
});

test("exige un área para publicar un perfil", () => {
  const result = publicProfileSchema.safeParse({ ...validProfile, area: null });
  assert.equal(result.success, false);
  if (!result.success) assert.equal(result.error.issues[0]?.path[0], "area");
});

test("permite mantener privado un perfil sin área", () => {
  assert.equal(publicProfileSchema.safeParse({ ...validProfile, area: null, isPublic: false }).success, true);
});

test("limita el orden y la extensión de la biografía", () => {
  assert.equal(publicProfileSchema.safeParse({ ...validProfile, publicOrder: 1000 }).success, false);
  assert.equal(publicProfileSchema.safeParse({ ...validProfile, publicBio: "x".repeat(601) }).success, false);
});
