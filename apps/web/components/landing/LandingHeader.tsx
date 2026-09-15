"use client";

import Image from "next/image";
import { useState } from "react";

const links = [
  ["Áreas comerciales", "#areas"], ["Soluciones", "#soluciones"], ["Don Pancho", "#don-pancho"],
  ["Equipo", "#equipo"], ["Contacto", "#contacto"],
] as const;

export function LandingHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-navy/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#inicio" aria-label="Todo Carnes, inicio"><Image src="/brand/logo-completo-horizontal.webp" alt="" width={132} height={46} priority /></a>
        <nav aria-label="Navegación principal" className="hidden items-center gap-7 text-sm font-semibold text-navy lg:flex">
          {links.map(([label, href]) => <a key={href} href={href} className="hover:text-blue-700">{label}</a>)}
          <a href="#contacto" className="rounded-full bg-navy px-6 py-3 text-white hover:bg-blue-700">Hablemos</a>
        </nav>
        <button type="button" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? "Cerrar menú" : "Abrir menú"} onClick={() => setOpen(!open)} className="grid h-11 w-11 place-items-center rounded-full border border-navy/20 text-2xl text-navy lg:hidden">{open ? "×" : "☰"}</button>
      </div>
      {open && <nav id="mobile-nav" aria-label="Navegación móvil" className="border-t border-navy/10 bg-white px-5 py-5 lg:hidden">{links.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)} className="block border-b border-navy/10 py-3 font-semibold text-navy">{label}</a>)}<a href="#contacto" onClick={() => setOpen(false)} className="mt-5 block rounded-full bg-navy px-6 py-3 text-center font-bold text-white">Hablemos</a></nav>}
    </header>
  );
}
