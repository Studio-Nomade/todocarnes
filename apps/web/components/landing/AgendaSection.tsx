import { AgendaClient } from "@/components/agenda/AgendaClient";
import type { AgendaPageData } from "@/lib/agenda/types";

export function AgendaSection({ data }: { data: AgendaPageData }) {
  return (
    <section id="agenda" className="scroll-mt-24 bg-white px-6 py-14 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Agenda</p>
        <h2 className="mt-3 max-w-2xl text-3xl text-navy sm:text-4xl">Agenda una reunión con nuestro equipo.</h2>
        <p className="mt-4 max-w-xl leading-7 text-ink/70">Videollamada, reunión en nuestras oficinas o visita a tu empresa: elige el área, la persona y el horario que más te acomoden.</p>
        <div className="mt-6"><AgendaClient data={data} /></div>
      </div>
    </section>
  );
}
