"use client";

import { useEffect, useRef, useState } from "react";
import { buildProcessAssetUrl, PROCESS_VIDEOS } from "@/lib/landing/process-videos";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

export function ProcessMedia() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [videoIndex, setVideoIndex] = useState<number | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const activeProcess = PROCESS_VIDEOS[activeIndex];
  const videoProcess = videoIndex === null ? null : PROCESS_VIDEOS[videoIndex];
  const activePoster = buildProcessAssetUrl(supabaseUrl, activeProcess.slug, "webp") ?? activeProcess.fallbackPoster;
  const videoSrc = videoProcess ? buildProcessAssetUrl(supabaseUrl, videoProcess.slug, "mp4") : null;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReducedMotion(query.matches);
      if (query.matches) {
        setVideoReady(false);
        setVideoIndex(null);
      }
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const currentVideo = video.current;
    if (!currentVideo || !videoSrc || reducedMotion) return;

    currentVideo.load();
    void currentVideo.play().catch(() => {
      setVideoReady(false);
      setVideoIndex(null);
    });

    return () => currentVideo.pause();
  }, [reducedMotion, videoSrc]);

  function select(index: number, shouldPlay: boolean) {
    const nextVideoIndex = shouldPlay && !reducedMotion && supabaseUrl ? index : null;
    setActiveIndex(index);
    if (videoIndex !== nextVideoIndex) setVideoReady(false);
    setVideoIndex(nextVideoIndex);
  }

  return (
    <section
      id="procesos"
      className="relative min-h-[680px] scroll-mt-24 overflow-hidden bg-navy px-6 py-16 text-white sm:px-8 lg:py-20"
    >
      <div
        key={activePoster}
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url("${activePoster}")` }}
      />
      {videoSrc ? (
        <video
          ref={video}
          key={videoSrc}
          src={videoSrc}
          muted
          loop
          playsInline
          preload="none"
          poster={activePoster}
          onPlaying={() => setVideoReady(true)}
          onError={() => {
            setVideoReady(false);
            setVideoIndex(null);
          }}
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 motion-reduce:transition-none ${videoReady ? "opacity-100" : "opacity-0"}`}
        />
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
          </div>
        </div>
        <div>
          <div className="flex snap-x gap-2 overflow-x-auto pb-3" aria-label="Procesos disponibles">
            {PROCESS_VIDEOS.map((process, index) => (
              <button
                key={process.title}
                type="button"
                aria-pressed={activeIndex === index}
                onFocus={() => select(index, true)}
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
