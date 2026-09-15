"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/lib/auth/types";
import { isNavigationItemActive, navigationForRole } from "@/lib/navigation";

export function AdminNavigation({ mobile = false, role }: { mobile?: boolean; role: Role }) {
  const pathname = usePathname();
  const groups = navigationForRole(role);
  if (mobile) return <nav aria-label="Principal móvil" className="space-y-4">{groups.map((group) => <div key={group.label}><p className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/45">{group.label}</p><div className="mt-1 flex flex-col">{group.items.map((item) => { const active = isNavigationItemActive(pathname, item.href); return <Link aria-current={active ? "page" : undefined} className={`rounded-lg px-3 py-2.5 text-sm ${active ? "bg-blue/15 font-semibold text-navy" : "text-ink hover:bg-gray-50"}`} href={item.href} key={item.href}>{item.label}</Link>; })}</div></div>)}</nav>;
  return <nav aria-label="Principal" className="mx-auto hidden max-w-7xl gap-8 border-t border-ink/10 px-8 py-3 lg:flex">{groups.map((group) => <div className="flex items-center gap-3" key={group.label}><span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/40">{group.label}</span>{group.items.map((item) => { const active = isNavigationItemActive(pathname, item.href); return <Link aria-current={active ? "page" : undefined} className={`rounded-md px-2.5 py-1.5 text-sm ${active ? "bg-blue/15 font-semibold text-navy" : "text-ink hover:bg-gray-50"}`} href={item.href} key={item.href}>{item.label}</Link>; })}</div>)}</nav>;
}
