import { BookingCard } from "@/components/bookings/BookingCard";
import { BookingFilters, dayLabel } from "@/components/bookings/BookingFilters";
import { requireRole } from "@/lib/auth/requireRole";
import { getBookingAgenda } from "@/lib/bookings/data";
import type { BookingItem } from "@/lib/bookings/types";
import { listCommercialOptions } from "@/lib/leads/data";

export const dynamic = "force-dynamic";
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function key(day: string, slot: string): string { return `${day}-${slot.slice(0, 5)}`; }

export default async function AgendaPage({ searchParams }: { searchParams: SearchParams }) {
  const profile = await requireRole(["admin", "commercial"]);
  const params = await searchParams;
  const [agenda, representatives] = await Promise.all([getBookingAgenda(params), listCommercialOptions()]);
  if (!agenda) return <section><p className="text-sm font-medium uppercase tracking-[0.18em] text-blue">Comercial</p><h1 className="mt-2 text-3xl font-semibold text-navy">Agenda</h1><p className="mt-8 rounded-2xl border border-ink/10 bg-white p-8 text-sm text-ink/60">No hay un evento activo configurado.</p></section>;

  const days = agenda.selectedDay ? [agenda.selectedDay] : agenda.event.days;
  const grouped = new Map<string, BookingItem[]>();
  agenda.bookings.forEach((booking) => grouped.set(key(booking.day, booking.slotTime), [...(grouped.get(key(booking.day, booking.slotTime)) ?? []), booking]));
  return <section className="space-y-7"><header><p className="text-sm font-medium uppercase tracking-[0.18em] text-blue">Comercial</p><h1 className="mt-2 text-3xl font-semibold text-navy">Agenda de reservas</h1><p className="mt-2 text-sm text-ink/60">{agenda.event.name} · {agenda.event.location || "Ubicación por confirmar"}</p></header><BookingFilters event={agenda.event} representatives={representatives} selectedDay={agenda.selectedDay} selectedRepId={agenda.selectedRepId} showRepresentative={profile.role === "admin"} /><div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white"><table className="w-full min-w-[780px] table-fixed"><thead><tr className="bg-gray-50"><th className="w-24 border-b border-r border-ink/10 px-3 py-4 text-left text-xs uppercase tracking-wide text-ink/55">Hora</th>{days.map((day) => <th className="border-b border-ink/10 px-3 py-4 text-left text-sm font-semibold capitalize text-navy" key={day}>{dayLabel(day)}</th>)}</tr></thead><tbody>{agenda.event.slotTimes.map((slot) => <tr key={slot}><th className="border-r border-t border-ink/10 px-3 py-4 align-top text-left text-sm font-semibold text-navy">{slot.slice(0, 5)}</th>{days.map((day) => { const bookings = grouped.get(key(day, slot)) ?? []; return <td className="border-t border-ink/10 p-3 align-top" key={day}><div className="space-y-2">{bookings.length ? bookings.map((booking) => <BookingCard booking={booking} key={booking.id} />) : <span className="text-xs text-ink/35">Disponible</span>}</div></td>; })}</tr>)}</tbody></table></div><p className="text-xs text-ink/50">Horarios mostrados en hora de Chile. Duración de cada reunión: {agenda.event.slotMinutes} minutos.</p></section>;
}
