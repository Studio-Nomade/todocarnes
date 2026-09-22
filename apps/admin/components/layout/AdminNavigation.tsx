"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Role } from "@/lib/auth/types";
import { isNavigationItemActive, navigationForRole } from "@/lib/navigation";

export function AdminNavigation({ mobile = false, role }: { mobile?: boolean; role: Role }) {
  const pathname = usePathname();
  const groups = navigationForRole(role);

  if (mobile) {
    return (
      <nav aria-label="Principal móvil" className="space-y-2">
        {groups.map((group) => {
          const groupActive = group.items.some((item) => isNavigationItemActive(pathname, item.href));
          return (
            <details key={`${group.label}:${pathname}`} open={groupActive || undefined} className="group rounded-lg border border-ink/10">
              <summary className={`flex cursor-pointer list-none items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold ${groupActive ? "bg-blue/15 text-navy" : "text-ink"}`}>
                {group.label}<span aria-hidden className="transition-transform group-open:rotate-180">⌄</span>
              </summary>
              <div className="flex flex-col border-t border-ink/10 p-1.5">
                {group.items.map((item) => {
                  const active = isNavigationItemActive(pathname, item.href);
                  return <Link aria-current={active ? "page" : undefined} className={`rounded-lg px-3 py-2.5 text-sm ${active ? "bg-blue/15 font-semibold text-navy" : "text-ink hover:bg-gray-50"}`} href={item.href} key={item.href}>{item.label}</Link>;
                })}
              </div>
            </details>
          );
        })}
      </nav>
    );
  }

  return <DesktopNavigation groups={groups} pathname={pathname} />;
}

/**
 * Submenús de escritorio con un solo grupo abierto a la vez. Se cierran al elegir un ítem, al cambiar
 * de ruta, al hacer clic afuera y con Escape (antes usaban <details>, que quedaba abierto).
 */
function DesktopNavigation({ groups, pathname }: { groups: ReturnType<typeof navigationForRole>; pathname: string }) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => setOpenGroup(null), [pathname]);

  useEffect(() => {
    if (!openGroup) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpenGroup(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenGroup(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openGroup]);

  return (
    <nav ref={navRef} aria-label="Principal" className="mx-auto hidden max-w-7xl gap-3 border-t border-ink/10 px-8 py-3 lg:flex">
      {groups.map((group) => {
        const activeItem = group.items.find((item) => isNavigationItemActive(pathname, item.href));
        const open = openGroup === group.label;
        const menuId = `submenu-${group.label.toLowerCase().replace(/\s+/g, "-")}`;
        return (
          <div key={group.label} className="relative">
            <button
              aria-controls={menuId}
              aria-expanded={open}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${activeItem || open ? "bg-blue/15 text-navy" : "text-ink hover:bg-gray-50"}`}
              onClick={() => setOpenGroup((current) => (current === group.label ? null : group.label))}
              type="button"
            >
              {group.label}
              {activeItem ? <span className="text-xs font-normal text-navy/60">· {activeItem.label}</span> : null}
              <span aria-hidden className={`transition-transform ${open ? "rotate-180" : ""}`}>⌄</span>
            </button>
            {open ? (
              <div id={menuId} className="absolute left-0 top-full z-50 mt-2 min-w-56 rounded-xl border border-ink/10 bg-white p-2 shadow-xl">
                {group.items.map((item) => {
                  const active = isNavigationItemActive(pathname, item.href);
                  return <Link aria-current={active ? "page" : undefined} className={`block rounded-lg px-3 py-2.5 text-sm ${active ? "bg-blue/15 font-semibold text-navy" : "text-ink hover:bg-gray-50"}`} href={item.href} key={item.href} onClick={() => setOpenGroup(null)}>{item.label}</Link>;
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
