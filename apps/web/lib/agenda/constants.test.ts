import assert from "node:assert/strict";
import test from "node:test";
import { areasLabel, representativeAreasLabel } from "./constants";

test("une varias áreas en una sola etiqueta sin duplicados", () => {
  assert.equal(areasLabel(["retail_ggcc", "food_service", "retail_ggcc"]), "Retail / GGCC + Food Service");
});

test("usa el área principal si la lista viene vacía", () => {
  assert.equal(areasLabel([], "mmpp_trimmings"), "MMPP / Trimmings");
  assert.equal(areasLabel(null), "Área comercial");
});

test("la etiqueta pública del vendedor omite las áreas de enrutamiento", () => {
  assert.equal(
    representativeAreasLabel(["retail_ggcc", "food_service", "maquila_desarrollo", "marca_propia", "otro"]),
    "Retail / GGCC + Food Service",
  );
});

test("la etiqueta pública conserva el orden del perfil y el área principal de respaldo", () => {
  assert.equal(representativeAreasLabel(["ventas_nacionales", "otro", "mmpp_trimmings"]), "Ventas Nacionales + MMPP / Trimmings");
  assert.equal(representativeAreasLabel([], "food_service"), "Food Service");
});

test("si el vendedor solo cubre áreas de enrutamiento, la etiqueta las muestra igual", () => {
  assert.equal(representativeAreasLabel(["maquila_desarrollo", "marca_propia"]), "Maquila y Desarrollo + Marca Propia");
  assert.equal(representativeAreasLabel(null), "Área comercial");
});
