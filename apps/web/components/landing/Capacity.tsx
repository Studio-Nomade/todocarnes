const capabilities = [["+70 años", "Trayectoria"], ["Infraestructura", "Operación de alto estándar"], ["Procesos", "Seguridad y consistencia"], ["Volumen", "Capacidad para distintos canales"], ["Experiencia", "Conocimiento especializado"], ["Flexibilidad", "Nos adaptamos a tu negocio"]] as const;

export function Capacity() {
  return <section className="relative overflow-hidden px-6 py-14 sm:px-8 lg:py-20"><Image src="/landing/capability.jpg" alt="Proceso de envasado de productos cárnicos" fill sizes="100vw" className="object-cover"/><div className="absolute inset-0 bg-white/80"/><div className="relative mx-auto max-w-5xl"><h2 className="text-center text-3xl text-navy sm:text-4xl">Capacidad para responder.</h2><div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{capabilities.map(([title, text]) => <article key={title} className="pl-4"><h3 className="text-lg text-navy">{title}</h3><p className="mt-1 text-sm text-ink/70">{text}</p></article>)}</div></div></section>;
}
import Image from "next/image";
