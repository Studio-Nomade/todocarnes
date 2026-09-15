import Image from "next/image";
import type { PublicRepresentative } from "@/lib/agenda/types";
import { AgendaIcon } from "./AgendaIcon";

export function RepresentativeGrid({ representatives, selectedId, onSelect }: { representatives: PublicRepresentative[]; selectedId: string; onSelect: (representative: PublicRepresentative) => void }) {
  return (
    <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {representatives.map((rep) => {
        const selected = rep.id === selectedId;
        return <article key={rep.id} className={`relative flex flex-col rounded-2xl border bg-white p-4 shadow-sm transition ${selected ? "border-blue ring-2 ring-blue/30" : "border-navy/10 hover:border-blue-mid"}`}>
          {selected && <span className="absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-full bg-blue text-navy"><AgendaIcon name="check" className="h-4 w-4"/></span>}
          {rep.photoUrl ? <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-blue-50"><Image src={rep.photoUrl} alt={`Retrato de ${rep.name}`} fill className="object-cover" sizes="(min-width: 1024px) 25vw, 50vw"/></div> : <div className="grid aspect-[4/3] place-items-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-mid/40"><span className="grid h-20 w-20 place-items-center rounded-full bg-white font-display text-3xl text-navy shadow-sm">{rep.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span></div>}
          <h3 className="mt-4 font-display text-xl text-navy">{rep.name}</h3><p className="mt-1 text-sm font-bold text-navy">{rep.areaLabel}</p><p className="mt-3 flex-1 text-sm leading-5 text-ink/70">{rep.bio}</p>
          <button type="button" onClick={() => onSelect(rep)} className={`mt-5 rounded-lg px-4 py-3 text-sm font-bold ${selected ? "bg-blue text-navy" : "bg-blue-50 text-navy hover:bg-blue-mid/50"}`}>{selected ? "Seleccionado" : "Seleccionar"}</button>
        </article>;
      })}
    </div>
  );
}
