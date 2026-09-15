import Image from "next/image";
import type { PublicRepresentative } from "@/lib/agenda/types";
import { normalizeWhatsAppNumber } from "@/lib/agenda/whatsapp";

export function CommercialTeam({ representatives }: { representatives: PublicRepresentative[] }) {
  return (
    <section id="equipo" className="scroll-mt-24 bg-gray-50 px-6 py-14 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Contacto según tu necesidad</p>
          <h2 className="mt-3 text-3xl text-navy sm:text-4xl">Encuentra a la persona indicada para tu operación.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-ink/70">Elige primero el área que quieres resolver; te conectamos con quien conoce ese tipo de negocio.</p>
        </div>
        {representatives.length ? (
          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {representatives.slice(0, 4).map((rep) => {
              const number = normalizeWhatsAppNumber(rep.whatsapp);
              return (
                <article key={rep.id} className="rounded-2xl bg-white p-5 shadow-sm">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-blue-50">
                    {rep.photoUrl ? (
                      <Image
                        src={rep.photoUrl}
                        alt={`Retrato de ${rep.name}`}
                        fill
                        sizes="(min-width:1024px) 25vw, 50vw"
                        className="object-cover"
                      />
                    ) : (
                      <span className="grid h-full place-items-center font-display text-4xl text-navy/50">
                        {rep.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}
                      </span>
                    )}
                  </div>
                  <p className="mt-5 text-xs font-bold uppercase tracking-[0.12em] text-blue-700">Necesito ayuda en</p>
                  <h3 className="mt-1 text-xl text-navy">{rep.areaLabel}</h3>
                  <p className="mt-2 text-sm font-semibold text-ink/70">{rep.name}</p>
                  <p className="mt-2 text-sm leading-6 text-ink/65">{rep.bio}</p>
                  <div className="mt-4 flex gap-4 text-sm font-bold text-blue-700">
                    {number ? <a href={`https://wa.me/${number}`} target="_blank" rel="noreferrer">Hablar por WhatsApp</a> : null}
                    {rep.contactEmail ? <a href={`mailto:${rep.contactEmail}`}>Email</a> : null}
                    {!number && !rep.contactEmail ? <span>Contacto por confirmar</span> : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="mx-auto mt-10 max-w-xl rounded-2xl border border-ink/10 bg-white px-6 py-8 text-center text-sm text-ink/65">
            El equipo comercial estará disponible próximamente.
          </p>
        )}
      </div>
    </section>
  );
}
