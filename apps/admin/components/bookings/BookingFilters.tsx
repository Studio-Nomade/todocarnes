import type { CommercialOption } from "@/lib/leads/types";
import type { BookingEvent } from "@/lib/bookings/types";

function dayLabel(day: string): string {
  return new Intl.DateTimeFormat("es-CL", { day: "numeric", month: "short", weekday: "short", timeZone: "America/Santiago" }).format(new Date(`${day}T12:00:00-03:00`));
}

export function BookingFilters({ event, representatives, selectedDay, selectedRepId, showRepresentative }: { event: BookingEvent; representatives: CommercialOption[]; selectedDay?: string; selectedRepId?: string; showRepresentative: boolean }) {
  return <form className="flex flex-wrap items-end gap-3 rounded-2xl border border-ink/10 bg-white p-4" method="get"><label className="min-w-48 flex-1 text-xs font-semibold text-ink/60">Día<select className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink" defaultValue={selectedDay ?? ""} name="day"><option value="">Todos los días</option>{event.days.map((day) => <option key={day} value={day}>{dayLabel(day)}</option>)}</select></label>{showRepresentative ? <label className="min-w-48 flex-1 text-xs font-semibold text-ink/60">Vendedor<select className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink" defaultValue={selectedRepId ?? ""} name="repId"><option value="">Todos los vendedores</option>{representatives.map((rep) => <option key={rep.id} value={rep.id}>{rep.name}</option>)}</select></label> : null}<button className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white" type="submit">Filtrar</button></form>;
}

export { dayLabel };
