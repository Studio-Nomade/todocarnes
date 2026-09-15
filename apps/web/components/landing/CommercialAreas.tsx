import Image from "next/image";

const areas = [
  { title: "Food Service", text: "Soluciones y formatos para operadores gastronómicos y clientes especializados.", image: "/landing/processing.jpg" },
  { title: "Retail / GGCC", text: "Abastecimiento, formatos y desarrollos para grandes cuentas y retail.", image: "/landing/warehouse.jpg" },
  { title: "MMPP / Trimmings", text: "Materias primas para procesos productivos e industriales.", image: "/landing/hero-processing.jpg" },
  { title: "Ventas Nacionales", text: "Abastecimiento y alternativas comerciales para distribuidores y clientes nacionales.", image: "/landing/plant-aerial.jpg" },
];

export function CommercialAreas() {
  return <section id="areas" className="mx-auto grid max-w-7xl scroll-mt-24 gap-12 px-6 py-20 sm:px-8 lg:grid-cols-[0.75fr_1.25fr] lg:py-28"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Áreas comerciales</p><h2 className="mt-4 max-w-sm font-display text-4xl text-navy sm:text-5xl">Encuentra la solución para tu negocio.</h2></div><div className="grid gap-8 sm:grid-cols-2">{areas.map((area) => <article key={area.title} className="grid grid-cols-[92px_1fr] gap-5"><div className="relative aspect-square overflow-hidden rounded-xl"><Image src={area.image} alt="" fill sizes="92px" className="object-cover" /></div><div><h3 className="font-display text-xl text-navy">{area.title}</h3><p className="mt-2 text-sm leading-6 text-ink/70">{area.text}</p></div></article>)}</div></section>;
}
