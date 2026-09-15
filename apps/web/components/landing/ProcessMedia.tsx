"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type ProcessAsset = { title: string; description: string; poster?: string; webm?: string; mp4?: string };

const processes: ProcessAsset[] = [
  { title: "Corte", description: "Precisión según producto y uso." },
  { title: "Pesaje", description: "Gramajes consistentes para cada operación." },
  { title: "Envasado", description: "Formatos que protegen y simplifican el manejo." },
  { title: "Etiquetado", description: "Presentaciones listas para cada canal." },
];

function ProcessCard({ process }: { process: ProcessAsset }) {
  const video = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const hasMedia = Boolean(process.poster && (process.webm || process.mp4));

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  async function play() {
    if (!hasMedia || reducedMotion || !video.current) return;
    setActive(true);
    try { await video.current.play(); } catch { setActive(false); }
  }

  function stop() {
    if (!video.current) return;
    video.current.pause();
    video.current.currentTime = 0;
    setActive(false);
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-navy/10 bg-white">
      <button
        type="button"
        disabled={!hasMedia || reducedMotion}
        aria-label={hasMedia ? `${active ? "Pausar" : "Reproducir"} video de ${process.title}` : `Video de ${process.title} pendiente`}
        onClick={() => active ? stop() : void play()}
        onMouseEnter={() => void play()}
        onMouseLeave={stop}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-navy text-left disabled:cursor-default"
      >
        {process.poster ? <Image src={process.poster} alt={`Proceso de ${process.title.toLowerCase()}`} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover"/> : (
          <span className="absolute inset-0 grid place-items-center bg-gradient-to-br from-navy to-navy/80 p-6 text-center text-blue-50"><span><span aria-hidden="true" className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-blue/60 text-xl">▶</span><span className="mt-4 block text-xs font-bold uppercase tracking-[0.15em]">Material audiovisual pendiente</span></span></span>
        )}
        {hasMedia ? <video ref={video} muted loop playsInline preload="none" poster={process.poster} className={`absolute inset-0 h-full w-full object-cover transition-opacity ${active ? "opacity-100" : "opacity-0"}`}><source src={process.webm} type="video/webm"/><source src={process.mp4} type="video/mp4"/></video> : null}
      </button>
      <div className="p-5"><h3 className="text-lg text-navy">{process.title}</h3><p className="mt-2 text-sm leading-6 text-ink/70">{process.description}</p></div>
    </article>
  );
}

export function ProcessMedia() {
  return (
    <section id="procesos" className="scroll-mt-24 px-6 py-14 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-5 lg:grid-cols-2 lg:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Nuestros procesos</p><h2 className="mt-3 text-3xl text-navy sm:text-4xl">De la necesidad al formato final.</h2></div><p className="max-w-xl leading-7 text-ink/70">Procesos adaptados a la operación de cada cliente. En móvil, los videos se activarán con un toque; con movimiento reducido permanecerán como imagen estática.</p></div>
        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{processes.map((process) => <ProcessCard key={process.title} process={process}/>)}</div>
      </div>
    </section>
  );
}
