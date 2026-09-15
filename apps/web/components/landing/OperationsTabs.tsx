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
  function move(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const direction = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!direction) return;
    event.preventDefault(); const next = (index + direction + operations.length) % operations.length; setActive(next);
    requestAnimationFrame(() => document.getElementById(`operation-tab-${next}`)?.focus());
  }
  return <section className="mx-auto max-w-7xl px-6 py-14 sm:px-8 lg:py-20"><div className="grid gap-6 lg:grid-cols-2"><h2 className="max-w-xl text-3xl text-navy sm:text-4xl">Cada negocio opera distinto.<br />La solución también debería hacerlo.</h2><p className="max-w-lg text-base leading-7 text-ink/70">Todo Carnes adapta producto, formato y proceso según la operación del cliente.</p></div><div role="tablist" aria-label="Aspectos de la operación" className="mt-9 grid gap-2 sm:grid-cols-5">{operations.map(([label], index) => <button id={`operation-tab-${index}`} key={label} type="button" role="tab" aria-selected={active === index} aria-controls="operation-panel" tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)} onKeyDown={(event) => move(event, index)} className={`border-b-2 px-3 py-3 text-left text-sm font-bold sm:text-center ${active === index ? "border-blue-700 text-navy" : "border-navy/10 text-ink/60"}`}>{label}</button>)}</div><div id="operation-panel" role="tabpanel" aria-labelledby={`operation-tab-${active}`} className="mt-5 rounded-2xl bg-blue-50 p-6 text-base leading-7 text-navy">{operations[active][1]}</div></section>;
}
