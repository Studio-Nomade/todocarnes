import Image from "next/image";
import { DEMO_REPRESENTATIVES } from "@/lib/agenda/demo";
import type { PublicRepresentative } from "@/lib/agenda/types";
import { normalizeWhatsAppNumber } from "@/lib/agenda/whatsapp";

export function CommercialTeam({ representatives }: { representatives: PublicRepresentative[] }) {
  const visibleRepresentatives = representatives.length ? representatives.slice(0, 4) : DEMO_REPRESENTATIVES;
  return (
    <section id="equipo" className="scroll-mt-24 bg-gray-50 px-6 py-14 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Contacto según tu necesidad</p>
          <h2 className="mt-3 text-3xl text-navy sm:text-4xl">Encuentra a la persona indicada para tu operación.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-ink/70">Elige primero el área que quieres resolver; te conectamos con quien conoce ese tipo de negocio.</p>
        </div>
        <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {visibleRepresentatives.map((rep) => {
              const number = normalizeWhatsAppNumber(rep.whatsapp);
              return (
                <article key={rep.id} className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-navy/15">
                    {rep.photoUrl ? (
                      <Image
                        src={rep.photoUrl}
                        alt={`Retrato de ${rep.name}`}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="sr-only">Fotografía pendiente</span>
                    )}
                  </div>
                  <div className="min-w-0 pt-1">
                    <h3 className="text-sm font-bold text-navy">{rep.name}</h3>
                    <p className="mt-1 text-xs text-ink/70">{rep.areaLabel}</p>
                    <div className="mt-4 flex flex-wrap gap-1 text-xs font-bold text-blue-700">
                      {number ? <a href={`https://wa.me/${number}`} target="_blank" rel="noreferrer">WhatsApp</a> : <span>WhatsApp</span>}
                      <span aria-hidden="true">·</span>
                      {rep.contactEmail ? <a href={`mailto:${rep.contactEmail}`}>Email</a> : <span>Email</span>}
                    </div>
                  </div>
                </article>
              );
            })}
        </div>
        {!representatives.length ? <p className="mt-5 text-center text-xs text-ink/60">Fotografías y canales directos pendientes de publicación.</p> : null}
      </div>
    </section>
  );
}
