const solutions = [
  ["01", "Venta y distribución", "Productos, volumen y formatos ajustados al canal."],
  ["02", "Materias primas", "Soluciones para procesos industriales y productivos."],
  ["03", "Desarrollos, maquilas y marcas propias", "Transformamos una necesidad comercial en un producto concreto."],
  ["04", "Don Pancho", "Marca producto orientada a distribución y consumidor final."],
] as const;

export function Solutions() {
  return <section id="soluciones" className="scroll-mt-24 bg-gray-50 px-6 py-20 sm:px-8 lg:py-28"><div className="mx-auto max-w-7xl"><h2 className="max-w-2xl font-display text-4xl text-navy sm:text-5xl">Soluciones para cada forma de abastecer, producir y vender.</h2><div className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-navy/10 sm:grid-cols-2 lg:grid-cols-4">{solutions.map(([number, title, text]) => <article key={number} className="bg-white p-7"><p className="text-sm font-bold text-blue-700">{number}</p><h3 className="mt-8 min-h-14 font-display text-xl text-navy">{title}</h3><p className="mt-4 text-sm leading-6 text-ink/65">{text}</p></article>)}</div></div></section>;
}
