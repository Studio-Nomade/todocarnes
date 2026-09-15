import Image from "next/image";

const links = [["Líneas de negocio", "#areas"], ["Servicios", "#soluciones"], ["Procesos", "#procesos"], ["Equipo", "#equipo"], ["Contacto", "#contacto"]] as const;

export function LandingFooter() {
  return <footer className="bg-navy px-6 py-14 text-white sm:px-8"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_auto] lg:items-end"><div><Image src="/brand/logo-blanco.png" alt="Todo Carnes" width={150} height={113} className="h-auto w-36 object-contain" /><p className="mt-4 text-sm text-blue-50/75">Soluciones cárnicas B2B para la industria alimentaria.</p></div><nav aria-label="Navegación del pie" className="flex flex-wrap gap-5 text-sm text-blue-50/80">{links.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</nav><p className="text-xs text-blue-50/50 lg:col-span-2">© 2026 Todo Carnes. Todos los derechos reservados.</p></div></footer>;
}
