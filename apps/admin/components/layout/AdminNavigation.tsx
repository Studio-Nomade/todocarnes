"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

  return (
    <nav aria-label="Principal" className="mx-auto hidden max-w-7xl gap-3 border-t border-ink/10 px-8 py-3 lg:flex">
      {groups.map((group) => {
        const activeItem = group.items.find((item) => isNavigationItemActive(pathname, item.href));
        return (
          <details key={group.label} className="group relative">
            <summary className={`flex cursor-pointer list-none items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${activeItem ? "bg-blue/15 text-navy" : "text-ink hover:bg-gray-50"}`}>
              {group.label}
              {activeItem ? <span className="text-xs font-normal text-navy/60">· {activeItem.label}</span> : null}
              <span aria-hidden className="transition-transform group-open:rotate-180">⌄</span>
            </summary>
            <div className="absolute left-0 top-full z-50 mt-2 min-w-56 rounded-xl border border-ink/10 bg-white p-2 shadow-xl">
              {group.items.map((item) => {
                const active = isNavigationItemActive(pathname, item.href);
                return <Link aria-current={active ? "page" : undefined} className={`block rounded-lg px-3 py-2.5 text-sm ${active ? "bg-blue/15 font-semibold text-navy" : "text-ink hover:bg-gray-50"}`} href={item.href} key={item.href}>{item.label}</Link>;
              })}
            </div>
          </details>
        );
      })}
    </nav>
  );
}
