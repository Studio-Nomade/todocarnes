import type { AgendaEvent, PublicRepresentative } from "@/lib/agenda/types";
import { AgendaIcon } from "./AgendaIcon";
import { dayLabel } from "./SlotPicker";

export function SuccessState({ event, representative, day, slotTime, emailWarning }: { event: AgendaEvent; representative: PublicRepresentative; day: string; slotTime: string; emailWarning?: boolean }) {
  return <section className="mx-auto max-w-2xl px-5 py-16 text-center"><span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-blue text-navy"><AgendaIcon name="check" className="h-10 w-10"/></span><p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-blue">Paso 4 de 4</p><h2 className="mt-2 font-display text-4xl text-navy">¡Listo! Te esperamos</h2><p className="mx-auto mt-4 max-w-lg text-ink/70">Tu reunión con <strong>{representative.name}</strong> quedó reservada para el <strong className="capitalize">{dayLabel(day)}</strong> a las <strong>{slotTime.slice(0, 5)}</strong>.</p><div className="mt-7 rounded-2xl bg-blue-50 p-5 text-sm text-navy"><strong className="block">{event.name}</strong><span>{event.location}</span></div>{emailWarning ? <p className="mt-5 text-sm text-ink/65">No pudimos enviar el correo, pero tu reserva está confirmada. Te contactaremos.</p> : <p className="mt-5 text-sm text-ink/65">Te enviaremos un correo con todos los detalles de tu reunión.</p>}</section>;
}
