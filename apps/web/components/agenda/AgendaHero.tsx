import Image from "next/image";
import { AgendaIcon } from "./AgendaIcon";

export function AgendaHero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-8">
      <div className="overflow-hidden rounded-2xl bg-navy text-white shadow-xl md:grid md:grid-cols-2">
        <div className="flex flex-col justify-center px-7 py-10 sm:px-12 sm:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue">Feria Food & Service 2026</p>
          <h1 className="mt-4 max-w-lg font-display text-4xl leading-[1.05] sm:text-5xl">Agenda una reunión en nuestro stand</h1>
          <p className="mt-5 max-w-lg text-sm leading-6 text-blue-50 sm:text-base">Nos encantaría conversar sobre cómo nuestras soluciones pueden ayudarte a abastecer, producir y vender mejor. Reserva tu reunión y asegura tu horario en la feria.</p>
          <div className="mt-7 flex flex-wrap gap-3"><a href="#reserva" className="rounded-full bg-blue px-6 py-3 text-sm font-bold text-navy">Reservar ahora</a><a href="#stand" className="rounded-full border border-white px-6 py-3 text-sm font-bold">Ver stand</a></div>
          <div className="mt-9 grid gap-4 text-sm sm:grid-cols-2"><div className="flex gap-3"><AgendaIcon name="calendar" className="h-6 w-6 text-blue"/><span><strong className="block">Fecha</strong>Mar 29 SEP – Jue 01 OCT</span></div><div className="flex gap-3"><AgendaIcon name="clock" className="h-6 w-6 text-blue"/><span><strong className="block">Reuniones de 30 min</strong>Espacio por confirmar</span></div></div>
        </div>
        <div id="stand" className="relative min-h-80 md:min-h-full"><Image src="/agenda/hero-stand.jpg" alt="Reunión comercial en el stand de Todo Carnes" fill priority className="object-cover" sizes="(min-width: 768px) 50vw, 100vw"/></div>
      </div>
    </section>
  );
}
