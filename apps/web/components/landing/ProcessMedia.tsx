"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type ProcessItem = {
  title: string;
  description: string;
  poster: string;
  webm?: string;
  mp4?: string;
};

const processes: ProcessItem[] = [
  { title: "Corte", description: "Cortes precisos según producto, rendimiento y uso final.", poster: "/landing/hero-processing.jpg" },
  { title: "Gramaje", description: "Porciones consistentes para controlar costo y operación.", poster: "/landing/capability.jpg" },
  { title: "Porcionado", description: "Formatos listos para simplificar la preparación.", poster: "/landing/processing.jpg" },
  { title: "Procesamiento", description: "Procesos adaptados a requerimientos productivos específicos.", poster: "/landing/processing.jpg" },
  { title: "Descongelado", description: "Manejo controlado para preservar calidad y continuidad.", poster: "/landing/warehouse.jpg" },
  { title: "Embalaje", description: "Protección y presentación alineadas a cada canal.", poster: "/landing/capability.jpg" },
  { title: "Etiquetado", description: "Identificación y terminaciones listas para comercializar.", poster: "/landing/plant-aerial.jpg" },
  { title: "Maquila", description: "Capacidad productiva para desarrollar soluciones a medida.", poster: "/landing/hero-processing.jpg" },
  { title: "Marca Propia", description: "Productos desarrollados para representar tu marca.", poster: "/landing/don-pancho.jpg" },
];

export function ProcessMedia() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const activeProcess = processes[activeIndex];
  const hasVideo = Boolean(activeProcess.webm || activeProcess.mp4);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!video.current) return;
    video.current.load();
    if (playing && !reducedMotion) {
      void video.current.play().catch(() => setPlaying(false));
    }
  }, [activeIndex, playing, reducedMotion]);

  function select(index: number, shouldPlay: boolean) {
    setActiveIndex(index);
    setPlaying(shouldPlay && !reducedMotion);
  }

  function stopVideo() {
    setPlaying(false);
    if (!video.current) return;
    video.current.pause();
    video.current.currentTime = 0;
  }

  return (
    <section
      id="procesos"
      onMouseLeave={stopVideo}
      className="relative min-h-[680px] scroll-mt-24 overflow-hidden bg-navy px-6 py-16 text-white sm:px-8 lg:py-20"
    >
      <Image key={activeProcess.poster} src={activeProcess.poster} alt="" fill sizes="100vw" className="object-cover"/>
      {hasVideo ? (
        <video ref={video} key={`${activeProcess.title}-video`} muted loop playsInline preload="none" poster={activeProcess.poster} className={`absolute inset-0 h-full w-full object-cover transition-opacity ${playing ? "opacity-100" : "opacity-0"}`}>
          {activeProcess.webm ? <source src={activeProcess.webm} type="video/webm"/> : null}
          {activeProcess.mp4 ? <source src={activeProcess.mp4} type="video/mp4"/> : null}
        </video>
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-navy/25"/>
      <div className="relative mx-auto flex min-h-[550px] max-w-7xl flex-col justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue">Nuestros procesos</p>
          <h2 className="mt-4 text-3xl sm:text-4xl">¿Lo que necesitas no existe en un catálogo?</h2>
          <p className="mt-4 max-w-2xl leading-7 text-blue-50/80">Desarrollamos soluciones según las necesidades reales de cada operación.</p>
          <div aria-live="polite" className="mt-12">
            <p className="text-5xl font-bold leading-none sm:text-6xl lg:text-7xl">{activeProcess.title}</p>
            <p className="mt-5 max-w-xl text-lg leading-7 text-blue-50">{activeProcess.description}</p>
            {!hasVideo ? <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-blue">Loop audiovisual pendiente</p> : null}
          </div>
        </div>
        <div>
          <div className="flex snap-x gap-2 overflow-x-auto pb-3" aria-label="Procesos disponibles">
            {processes.map((process, index) => (
              <button
                key={process.title}
                type="button"
                aria-pressed={activeIndex === index}
                onFocus={() => select(index, false)}
                onMouseEnter={() => select(index, true)}
                onClick={() => select(index, true)}
                className={`shrink-0 snap-start rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors ${activeIndex === index ? "border-blue bg-blue text-navy" : "border-white/40 bg-navy/30 text-white hover:border-blue"}`}
              >
                {process.title}
              </button>
            ))}
          </div>
          <a href="#contacto" className="mt-5 inline-block rounded-full bg-white px-6 py-3 text-sm font-bold text-navy">Cuéntanos qué necesitas desarrollar</a>
        </div>
      </div>
    </section>
  );
}
