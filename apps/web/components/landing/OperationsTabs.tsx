import Image from "next/image";

const operations = [
  { title: "Abastecimiento", description: "Planificamos continuidad, disponibilidad y alternativas según tu canal.", image: "/landing/banners/abastecimiento.webp" },
  { title: "Volumen", description: "Ajustamos la respuesta a los volúmenes y frecuencias de cada operación.", image: "/landing/banners/volumen.webp" },
  { title: "Formatos", description: "Definimos presentaciones alineadas al uso, almacenamiento y venta.", image: "/landing/banners/formatos.webp" },
  { title: "Procesamiento", description: "Adaptamos cortes y procesos a los requerimientos de tu producción.", image: "/landing/banners/procesamiento.webp" },
  { title: "Desarrollo", description: "Convertimos una necesidad comercial en una solución concreta.", image: "/landing/banners/desarrollo.webp" },
] as const;

export function OperationsTabs() {
  return (
    <section className="py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-2"><h2 className="max-w-xl text-3xl text-navy sm:text-4xl">Cada negocio opera distinto.<br/>La solución también debería hacerlo.</h2><div><p className="max-w-lg text-base leading-7 text-ink/70">Todo Carnes adapta producto, formato y proceso según la operación del cliente.</p><p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-blue-700">Desliza para explorar</p></div></div>
      </div>
      <div className="mx-auto mt-9 flex max-w-[1600px] snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-5 sm:px-8" aria-label="Aspectos de la operación">
        {operations.map((operation) => (
          <article key={operation.title} className="relative min-h-[360px] w-[82vw] max-w-[520px] shrink-0 snap-center overflow-hidden rounded-3xl bg-navy text-white sm:w-[56vw] lg:w-[38vw]">
            <Image src={operation.image} alt="" fill sizes="(min-width:1024px) 38vw, 82vw" className="object-cover"/>
            <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/55 to-transparent"/>
            <div className="absolute inset-x-0 bottom-0 p-7 sm:p-8"><h3 className="text-3xl sm:text-4xl">{operation.title}</h3><p className="mt-3 max-w-md leading-7 text-blue-50">{operation.description}</p></div>
          </article>
        ))}
      </div>
    </section>
  );
}
