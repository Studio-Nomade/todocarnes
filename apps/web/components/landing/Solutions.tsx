const solutions = [
  ["materias-primas", "01", "Materias primas", "Soluciones para procesos industriales y productivos."],
  ["venta-distribucion", "02", "Venta y distribución", "Productos, volumen y formatos ajustados al canal."],
  ["desarrollos", "03", "Desarrollos, maquilas y marcas propias", "Transformamos una necesidad comercial en un producto concreto."],
] as const;

export function Solutions() {
  return <section id="soluciones" className="scroll-mt-24 bg-gray-50 px-6 py-14 sm:px-8 lg:py-20"><div className="mx-auto max-w-7xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Servicios</p><h2 className="mt-3 max-w-2xl text-3xl text-navy sm:text-4xl">Soluciones para cada forma de abastecer, producir y vender.</h2><div className="mt-9 grid gap-px overflow-hidden rounded-2xl bg-navy/10 md:grid-cols-3">{solutions.map(([id, number, title, text]) => <article id={id} key={number} className="scroll-mt-28 bg-white p-7"><p className="text-sm font-bold text-blue-700">{number}</p><h3 className="mt-6 min-h-14 text-xl text-navy">{title}</h3><p className="mt-3 text-sm leading-6 text-ink/65">{text}</p></article>)}</div></div></section>;
}
