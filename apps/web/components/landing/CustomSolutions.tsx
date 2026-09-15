const tags = ["Corte", "Gramaje", "Porcionado", "Procesamiento", "Descongelado", "Embalaje", "Etiquetado", "Maquila", "Marca propia"];

export function CustomSolutions() {
  return <section className="mx-auto max-w-7xl px-6 py-14 sm:px-8 lg:py-20"><div className="grid gap-6 lg:grid-cols-[0.9fr_1fr_auto] lg:items-center"><h2 className="text-3xl text-navy sm:text-4xl">¿Lo que necesitas no existe en un catálogo?</h2><p className="text-base leading-7 text-ink/70">Desarrollamos soluciones según las necesidades reales de cada operación.</p><a href="#contacto" className="rounded-full bg-gradient-to-r from-blue to-navy px-7 py-3.5 text-center text-sm font-bold text-white">Cuéntanos qué necesitas desarrollar</a></div><ul className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-9">{tags.map((tag) => <li key={tag} className="border-b border-navy/20 py-3 text-center text-sm font-semibold text-navy">{tag}</li>)}</ul></section>;
}
