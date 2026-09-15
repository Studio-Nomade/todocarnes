import Image from "next/image";

const areas = [
  { id: "linea-materias-primas", title: "Materias primas / Trimmings", text: "Materias primas para procesos productivos e industriales.", image: "/landing/hero-processing.jpg" },
  { id: "retail", title: "Retail / GGCC", text: "Abastecimiento, formatos y desarrollos para grandes cuentas y retail.", image: "/landing/warehouse.jpg" },
  { id: "food-service", title: "Food Service", text: "Soluciones y formatos para operadores gastronómicos y clientes especializados.", image: "/landing/processing.jpg" },
  { id: "ventas-nacionales", title: "Ventas Nacionales", text: "Abastecimiento y alternativas comerciales para distribuidores y clientes nacionales.", image: "/landing/plant-aerial.jpg" },
];

export function CommercialAreas() {
  return <section id="areas" className="mx-auto grid max-w-7xl scroll-mt-24 gap-10 px-6 py-14 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:py-20"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Líneas de negocio</p><h2 className="mt-3 max-w-sm text-3xl text-navy sm:text-4xl">Encuentra la solución para tu negocio.</h2><p className="mt-4 max-w-sm text-sm leading-6 text-ink/70">Partimos por tu necesidad y conectamos cada operación con la línea indicada.</p></div><div className="grid gap-6 sm:grid-cols-2">{areas.map((area, index) => <article id={area.id} key={area.title} className="grid scroll-mt-28 grid-cols-[88px_1fr] gap-5"><div className="relative aspect-square overflow-hidden rounded-xl"><Image src={area.image} alt="" fill sizes="88px" className="object-cover" /></div><div><p className="text-xs font-bold text-blue-700">0{index + 1}</p><h3 className="mt-1 text-lg text-navy">{area.title}</h3><p className="mt-2 text-sm leading-6 text-ink/70">{area.text}</p></div></article>)}</div></section>;
}
