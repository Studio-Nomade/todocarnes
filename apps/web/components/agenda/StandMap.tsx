import Image from "next/image";

export function StandMap() {
  return (
    <section id="ubicacion-stand" className="scroll-mt-24 px-5 py-14 sm:px-8 lg:py-20">
      <div className="mx-auto grid max-w-6xl gap-9 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Ubicación en la feria</p><h2 className="mt-3 text-3xl text-navy sm:text-4xl">Encuéntranos en el stand 2-A100.</h2><p className="mt-4 leading-7 text-ink/70">En el plano, el espacio 2-A100 figura como IP Importadora y Comercializadora SpA. Está junto al acceso de conexión del Hall 2.</p></div>
        <figure className="overflow-hidden rounded-2xl border border-navy/10 bg-white p-3 shadow-sm">
          <div className="relative aspect-[577/443] overflow-hidden rounded-xl"><Image src="/agenda/plano-stand-food-service-2026.jpeg" alt="Plano de Food & Service con el stand 2-A100 destacado" fill sizes="(min-width:1024px) 60vw, 100vw" className="object-contain"/></div>
          <figcaption className="px-2 pb-1 pt-3 text-center text-sm font-semibold text-navy">Stand Todo Carnes · 2-A100 · 27 m²</figcaption>
        </figure>
      </div>
    </section>
  );
}
