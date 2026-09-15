import Image from "next/image";
import type { ReactNode } from "react";

export function SiteFooter() {
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:px-8 md:grid-cols-[1fr_auto] md:items-end">
        <div><Image src="/brand/logo-blanco.png" alt="Todo Carnes" width={150} height={113} className="h-auto w-36 object-contain"/><p className="mt-4 text-sm text-blue-50">Soluciones cárnicas B2B para la industria alimentaria.</p></div>
        <div className="flex flex-wrap gap-5 text-sm text-blue-50"><a href="#reserva">Agendar reunión</a><a href="#entrada-cortesia">Entrada de cortesía</a><a href="#contacto">Contacto</a></div>
        <p className="text-xs text-blue-50/70 md:col-span-2">© 2026 Todo Carnes. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

export function SectionHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue">{eyebrow}</p><h2 className="mt-2 font-display text-3xl text-navy sm:text-4xl">{title}</h2>{children && <p className="mt-2 text-sm text-ink/70 sm:text-base">{children}</p>}</div>;
}
