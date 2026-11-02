import { MODALITY_OPTIONS } from "@/lib/agenda/constants";
import type { BookingModality } from "@/lib/agenda/types";
import { AgendaIcon, type AgendaIconName } from "./AgendaIcon";

const icons: Record<BookingModality, AgendaIconName> = { videollamada: "person", oficina: "location", visita: "location" };
const inputClass = "mt-2 w-full rounded-lg border border-navy/15 bg-white px-4 py-3 text-sm text-navy outline-none placeholder:text-ink/35 focus:border-blue focus:ring-2 focus:ring-blue/30";

export function ModalityPicker({ value, locationDetail, onChange, onLocationDetail }: { value: BookingModality | ""; locationDetail: string; onChange: (modality: BookingModality) => void; onLocationDetail: (value: string) => void }) {
  return (
    <div className="mt-7">
      <div role="radiogroup" aria-label="Modalidad de la reunión" className="grid gap-3 sm:grid-cols-3">
        {MODALITY_OPTIONS.map((option) => {
          const selected = value === option.value;
          return <button key={option.value} type="button" role="radio" aria-checked={selected} onClick={() => onChange(option.value)} className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${selected ? "border-blue bg-blue-50 ring-2 ring-blue/30" : "border-navy/10 bg-white hover:border-blue-mid"}`}><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${selected ? "bg-blue text-navy" : "bg-blue-50 text-navy"}`}><AgendaIcon name={icons[option.value]} className="h-5 w-5"/></span><span><span className="block text-sm font-bold text-navy">{option.label}</span><span className="mt-1 block text-xs leading-5 text-ink/65">{option.description}</span></span></button>;
        })}
      </div>
      {value === "visita" && <label className="mt-4 block text-sm font-bold text-navy">Dirección o comuna de la visita *<input required value={locationDetail} onChange={(event) => onLocationDetail(event.target.value)} className={inputClass} placeholder="Ej. Av. Ejemplo 1234, Quilicura" maxLength={240}/></label>}
    </div>
  );
}
