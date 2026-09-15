import Image from "next/image";

export function LandingHero() {
  return (
    <>
      <section id="inicio" className="scroll-mt-24 bg-navy text-white lg:grid lg:min-h-[640px] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex items-center px-6 py-20 sm:px-12 lg:px-[max(3rem,calc((100vw-80rem)/2))]">
          <div className="max-w-2xl"><h1 className="font-display text-5xl leading-[0.98] sm:text-6xl xl:text-7xl">Más que carne:<br />soluciones para abastecer,<br />producir y vender mejor.</h1><p className="mt-7 max-w-xl text-base leading-7 text-blue-50/80">Productos, formatos y soluciones cárnicas adaptadas a la forma en que opera cada negocio.</p><div className="mt-9 flex flex-wrap gap-3"><a href="#contacto" className="rounded-full bg-blue px-7 py-3.5 text-sm font-bold text-navy">Conversemos sobre tu operación</a><a href="#soluciones" className="rounded-full border border-white/70 px-7 py-3.5 text-sm font-bold">Conoce nuestras soluciones</a></div></div>
        </div>
        <div className="relative min-h-[420px] lg:min-h-full"><Image src="/landing/hero-processing.jpg" alt="Productos cárnicos en una línea de procesamiento" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" /></div>
      </section>
      <div aria-label="Marcas asociadas" className="grid grid-cols-3 bg-blue-50 px-6 py-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-navy/70 sm:grid-cols-6">{Array.from({ length: 6 }, (_, index) => <span key={index}>marca</span>)}</div>
      <section className="mx-auto grid max-w-7xl gap-8 border-b border-navy/10 px-6 py-20 sm:px-8 lg:grid-cols-2 lg:py-28"><h2 className="max-w-xl font-display text-4xl leading-tight text-navy sm:text-5xl">Más de 70 años desarrollando soluciones para la industria alimentaria.</h2><p className="max-w-xl text-lg leading-8 text-ink/75">Todo Carnes es una empresa chilena especializada en soluciones cárnicas B2B para empresas que necesitan abastecerse, producir, desarrollar productos o adaptarse a distintos canales.</p></section>
    </>
  );
}
