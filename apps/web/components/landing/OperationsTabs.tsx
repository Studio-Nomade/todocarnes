"use client";

import { useState } from "react";

const operations = [
  ["Abastecimiento", "Planificamos continuidad, disponibilidad y alternativas según tu canal."],
  ["Volumen", "Ajustamos la respuesta a los volúmenes y frecuencias de cada operación."],
  ["Formatos", "Definimos presentaciones alineadas al uso, almacenamiento y venta."],
  ["Procesamiento", "Adaptamos cortes y procesos a los requerimientos de tu producción."],
  ["Desarrollo", "Convertimos una necesidad comercial en una solución concreta."],
] as const;

export function OperationsTabs() {
  const [active, setActive] = useState(0);
  return <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:py-28"><div className="grid gap-8 lg:grid-cols-2"><h2 className="max-w-xl font-display text-4xl text-navy sm:text-5xl">Cada negocio opera distinto.<br />La solución también debería hacerlo.</h2><p className="max-w-lg text-lg leading-8 text-ink/70">Todo Carnes adapta producto, formato y proceso según la operación del cliente.</p></div><div role="tablist" aria-label="Aspectos de la operación" className="mt-12 grid gap-2 sm:grid-cols-5">{operations.map(([label], index) => <button key={label} type="button" role="tab" aria-selected={active === index} tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)} onKeyDown={(event) => { if (event.key === "ArrowRight") setActive((index + 1) % operations.length); if (event.key === "ArrowLeft") setActive((index - 1 + operations.length) % operations.length); }} className={`border-b-2 px-3 py-4 text-left text-sm font-bold sm:text-center ${active === index ? "border-blue-700 text-navy" : "border-navy/10 text-ink/60"}`}>{label}</button>)}</div><div role="tabpanel" className="mt-6 rounded-2xl bg-blue-50 p-7 text-lg leading-8 text-navy">{operations[active][1]}</div></section>;
}
