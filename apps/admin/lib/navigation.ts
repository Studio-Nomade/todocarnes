import type { Role } from "@/lib/auth/types";

export type NavigationItem = { href: string; label: string; roles: readonly Role[] };
export type NavigationGroup = { items: NavigationItem[]; label: string };

const allRoles = ["admin", "commercial"] as const;

export const navigationGroups: NavigationGroup[] = [
  { label: "Comercial", items: [
    { href: "/dashboard", label: "Dashboard", roles: allRoles },
    { href: "/leads", label: "Leads", roles: allRoles },
    { href: "/agenda", label: "Agenda", roles: allRoles },
  ] },
  { label: "Catálogo", items: [
    { href: "/catalogs", label: "Generador", roles: allRoles },
    { href: "/products", label: "Productos", roles: allRoles },
    { href: "/services", label: "Servicios", roles: allRoles },
  ] },
  { label: "Administración", items: [
    { href: "/users", label: "Usuarios", roles: ["admin"] },
    { href: "/settings", label: "Configuración", roles: ["admin"] },
  ] },
];

export function navigationForRole(role: Role): NavigationGroup[] {
  return navigationGroups.map((group) => ({ ...group, items: group.items.filter((item) => item.roles.includes(role)) })).filter((group) => group.items.length > 0);
}

export function isNavigationItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
