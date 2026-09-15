import type { AgendaEvent, PublicRepresentative } from "@/lib/agenda/types";
import { AgendaIcon, type AgendaIconName } from "./AgendaIcon";
import { dayLabel } from "./SlotPicker";

function SummaryItem({ icon, label, value }: { icon: AgendaIconName; label: string; value: string }) {
  return <div className="flex gap-3"><AgendaIcon name={icon} className="mt-0.5 h-5 w-5 shrink-0 text-navy"/><div><dt className="text-xs text-ink/55">{label}</dt><dd className="mt-0.5 text-sm font-bold text-navy">{value}</dd></div></div>;
}

export function BookingSummary({ event, representative, day, slotTime, whatsappHref, disabled, pending, error, onConfirm }: { event: AgendaEvent; representative: PublicRepresentative; day: string; slotTime: string | null; whatsappHref: string | null; disabled: boolean; pending: boolean; error: string | null; onConfirm: () => void }) {
  return (
    <aside className="rounded-2xl bg-blue-50 p-6 lg:sticky lg:top-5">
      <h3 className="font-display text-2xl text-navy">Resumen de tu reunión</h3>
      <dl className="mt-6 space-y-4"><SummaryItem icon="person" label="Área" value={representative.areaLabel}/><SummaryItem icon="person" label="Representante" value={representative.name}/><SummaryItem icon="calendar" label="Fecha" value={dayLabel(day)}/><SummaryItem icon="clock" label="Hora" value={slotTime ? slotTime.slice(0, 5) : "Selecciona un horario"}/><SummaryItem icon="clock" label="Duración" value={`${event.slotMinutes} minutos`}/><SummaryItem icon="location" label="Lugar" value={event.location}/></dl>
      {error && <p role="alert" className="mt-5 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-navy">{error}</p>}
      <button type="button" disabled={disabled || pending} onClick={onConfirm} className="mt-6 w-full rounded-full bg-navy px-5 py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-45">{pending ? "Confirmando..." : "Confirmar reunión"}</button>
      {whatsappHref && <a href={whatsappHref} target="_blank" rel="noreferrer" className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border-2 border-green-500 px-5 py-3 text-sm font-bold text-green-700"><AgendaIcon name="whatsapp" className="h-5 w-5"/>Agendar por WhatsApp</a>}
      <p className="mt-4 text-center text-xs leading-5 text-ink/55">Nos pondremos en contacto contigo para confirmar tu reunión.</p>
    </aside>
  );
}
