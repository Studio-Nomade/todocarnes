import assert from "node:assert/strict";
import test from "node:test";
import { isNavigationItemActive, navigationForRole } from "./navigation";

test("commercial no recibe enlaces administrativos", () => {
  const items = navigationForRole("commercial").flatMap((group) => group.items.map((item) => item.href));
  assert.deepEqual(items, ["/dashboard", "/leads", "/cortesias", "/agenda", "/catalogs", "/products", "/services"]);
});

test("admin recibe toda la navegación y el estado activo cubre rutas hijas", () => {
  const items = navigationForRole("admin").flatMap((group) => group.items.map((item) => item.href));
  assert.equal(items.includes("/cortesias"), true);
  assert.equal(items.includes("/users"), true);
  assert.equal(items.includes("/settings"), true);
  assert.equal(isNavigationItemActive("/leads/9c18", "/leads"), true);
  assert.equal(isNavigationItemActive("/products", "/leads"), false);
});
