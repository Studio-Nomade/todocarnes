import { ORIGIN_OPTIONS } from "@/lib/agenda/constants";
import type { BookingFormState } from "@/lib/agenda/types";
import { AgendaIcon } from "./AgendaIcon";

type Field = keyof BookingFormState;

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").replace(/^56/, "").slice(0, 9);
  return [digits.slice(0, 1), digits.slice(1, 5), digits.slice(5, 9)].filter(Boolean).join(" ");
}

export function BookingForm({ value, onChange }: { value: BookingFormState; onChange: (field: Field, value: string) => void }) {
  const inputClass = "mt-2 w-full rounded-lg border border-navy/15 bg-white px-4 py-3 text-sm text-navy outline-none transition placeholder:text-ink/35 focus:border-blue focus:ring-2 focus:ring-blue/30";
  return (
    <div className="mt-7 grid gap-5 sm:grid-cols-2">
      <label className="text-sm font-bold text-navy">Nombre *<input required autoComplete="name" value={value.name} onChange={(event) => onChange("name", event.target.value)} className={inputClass} placeholder="Ej. Juan Pérez"/></label>
      <label className="text-sm font-bold text-navy">Empresa *<input required autoComplete="organization" value={value.company} onChange={(event) => onChange("company", event.target.value)} className={inputClass} placeholder="Nombre de tu empresa"/></label>
      <label className="text-sm font-bold text-navy">Cargo *<input required autoComplete="organization-title" value={value.cargo} onChange={(event) => onChange("cargo", event.target.value)} className={inputClass} placeholder="Ej. Gerente"/></label>
      <label className="text-sm font-bold text-navy">Email *<input required type="email" autoComplete="email" value={value.email} onChange={(event) => onChange("email", event.target.value)} className={inputClass} placeholder="tu@empresa.cl"/></label>
      <label className="text-sm font-bold text-navy sm:col-span-2">Teléfono *<span className="mt-2 flex overflow-hidden rounded-lg border border-navy/15 bg-white focus-within:border-blue focus-within:ring-2 focus-within:ring-blue/30"><span className="flex items-center gap-2 border-r border-navy/10 bg-blue-50 px-4 text-sm font-bold text-navy">🇨🇱 +56</span><input required inputMode="numeric" autoComplete="tel" value={value.phone} onChange={(event) => onChange("phone", formatPhone(event.target.value))} className="min-w-0 flex-1 px-4 py-3 text-sm text-navy outline-none placeholder:text-ink/35" placeholder="9 1234 5678"/></span></label>
      <label className="text-sm font-bold text-navy sm:col-span-2">Temas a conversar <span className="font-normal text-ink/50">(opcional)</span><textarea value={value.topics} onChange={(event) => onChange("topics", event.target.value)} className={`${inputClass} min-h-28 resize-y`} placeholder="Cuéntanos brevemente sobre lo que te gustaría conversar..."/></label>
      <fieldset className="sm:col-span-2"><legend className="text-sm font-bold text-navy">¿Cómo supiste de nosotros? <span className="font-normal text-ink/50">(opcional)</span></legend><div className="mt-3 flex flex-wrap gap-2">{ORIGIN_OPTIONS.map((option) => { const selected = value.cameFrom === option.value; return <button key={option.value} type="button" onClick={() => onChange("cameFrom", selected ? "" : option.value)} className={`flex items-center gap-1 rounded-full px-4 py-2.5 text-xs font-semibold ${selected ? "bg-blue text-navy" : "bg-blue-50 text-navy hover:bg-blue-mid/50"}`}>{option.label}{selected && <AgendaIcon name="check" className="h-4 w-4"/>}</button>; })}</div></fieldset>
    </div>
  );
}
