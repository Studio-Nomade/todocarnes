"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const mainLinks = [
  ["Líneas de negocio", "#areas", "areas"],
  ["Procesos", "#procesos", "procesos"],
  ["Equipo", "#equipo", "equipo"],
  ["Contacto", "#contacto", "contacto"],
] as const;

const serviceLinks = [
  ["Materias primas", "#materias-primas"],
  ["Venta y distribución", "#venta-distribucion"],
  ["Desarrollos y maquilas", "#desarrollos"],
  ["Don Pancho", "#don-pancho"],
] as const;

export function LandingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [active, setActive] = useState("inicio");

  useEffect(() => {
    const targets = ["inicio", "areas", "procesos", "equipo", "contacto"]
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0, 0.2, 0.5] },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  const linkClass = (id: string) =>
    `border-b-2 py-2 transition-colors ${active === id ? "border-blue text-navy" : "border-transparent text-navy/75 hover:text-navy"}`;
  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-navy/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#inicio" aria-label="Todo Carnes, inicio"><Image src="/brand/logo-completo-horizontal.webp" alt="" width={132} height={46} priority /></a>
        <nav aria-label="Navegación principal" className="hidden items-center gap-5 text-sm font-semibold lg:flex">
          <a href="#areas" aria-current={active === "areas" ? "location" : undefined} className={linkClass("areas")}>Líneas de negocio</a>
          <div
            className="relative"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
            onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setServicesOpen(false); }}
          >
            <button type="button" aria-expanded={servicesOpen} aria-haspopup="true" onClick={() => setServicesOpen(true)} onKeyDown={(event) => { if (event.key === "Escape") setServicesOpen(false); }} className="flex items-center gap-1 border-b-2 border-transparent py-2 text-navy/75 hover:text-navy">Servicios <span aria-hidden="true">⌄</span></button>
            {servicesOpen ? <div className="absolute left-0 top-full w-64 pt-3"><div className="rounded-xl border border-navy/10 bg-white p-2 shadow-xl">{serviceLinks.map(([label, href]) => <a key={href} href={href} className="block rounded-lg px-4 py-3 text-navy hover:bg-blue-50" onClick={() => setServicesOpen(false)}>{label}</a>)}</div></div> : null}
          </div>
          {mainLinks.slice(1).map(([label, href, id]) => <a key={href} href={href} aria-current={active === id ? "location" : undefined} className={linkClass(id)}>{label}</a>)}
          <a href="/agenda" className="rounded-full border border-navy/20 px-5 py-2.5 text-navy hover:bg-blue-50">Food Service 2026</a>
          <a href="#contacto" className="rounded-full bg-navy px-5 py-2.5 text-white hover:bg-blue-700">Hablemos</a>
        </nav>
        <button type="button" aria-expanded={mobileOpen} aria-controls="mobile-nav" aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"} onClick={() => setMobileOpen((current) => !current)} className="grid h-11 w-11 place-items-center rounded-full border border-navy/20 text-2xl text-navy lg:hidden">{mobileOpen ? "×" : "☰"}</button>
      </div>
      {mobileOpen ? (
        <nav id="mobile-nav" aria-label="Navegación móvil" className="border-t border-navy/10 bg-white px-5 py-5 lg:hidden">
          <a href="#areas" onClick={closeMobile} className="block border-b border-navy/10 py-3 font-semibold text-navy">Líneas de negocio</a>
          <details className="border-b border-navy/10 py-3">
            <summary className="cursor-pointer font-semibold text-navy">Servicios</summary>
            <div className="mt-2 border-l-2 border-blue pl-4">{serviceLinks.map(([label, href]) => <a key={href} href={href} onClick={closeMobile} className="block py-2 text-sm font-medium text-navy/75">{label}</a>)}</div>
          </details>
          {mainLinks.slice(1).map(([label, href]) => <a key={href} href={href} onClick={closeMobile} className="block border-b border-navy/10 py-3 font-semibold text-navy">{label}</a>)}
          <a href="/agenda" onClick={closeMobile} className="mt-5 block rounded-full border border-navy/20 px-6 py-3 text-center font-bold text-navy">Food Service 2026</a>
          <a href="#contacto" onClick={closeMobile} className="mt-3 block rounded-full bg-navy px-6 py-3 text-center font-bold text-white">Hablemos</a>
        </nav>
      ) : null}
    </header>
  );
}
