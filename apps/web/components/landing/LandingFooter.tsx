import Image from "next/image";

const links = [["Áreas comerciales", "#areas"], ["Soluciones", "#soluciones"], ["Don Pancho", "#don-pancho"], ["Equipo", "#equipo"], ["Contacto", "#contacto"]] as const;

export function LandingFooter() {
  return <footer className="bg-navy px-6 py-16 text-white sm:px-8"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_auto] lg:items-end"><div><Image src="/brand/logo-completo-horizontal.webp" alt="Todo Carnes" width={160} height={56} className="rounded bg-white p-2" /><p className="mt-5 text-sm text-blue-50/75">Soluciones cárnicas B2B para la industria alimentaria.</p></div><nav aria-label="Navegación del pie" className="flex flex-wrap gap-5 text-sm text-blue-50/80">{links.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</nav><p className="text-xs text-blue-50/50 lg:col-span-2">© 2026 Todo Carnes. Todos los derechos reservados.</p></div></footer>;
}
