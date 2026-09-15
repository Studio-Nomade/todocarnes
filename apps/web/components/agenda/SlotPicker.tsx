import type { AgendaSlot } from "@/lib/agenda/types";

const dayFormatter = new Intl.DateTimeFormat("es-CL", { weekday: "short", day: "2-digit", month: "short", timeZone: "UTC" });

export function dayLabel(day: string) {
  const [year, month, date] = day.split("-").map(Number);
  return dayFormatter.format(new Date(Date.UTC(year, month - 1, date))).replace(".", "");
}

export function SlotPicker({ days, slots, selectedDay, selectedTime, loading, onDay, onTime }: { days: string[]; slots: AgendaSlot[]; selectedDay: string; selectedTime: string | null; loading: boolean; onDay: (day: string) => void; onTime: (time: string) => void }) {
  const daySlots = slots.filter((slot) => slot.day === selectedDay);
  return <div className="mt-7"><div role="tablist" aria-label="Días disponibles" className="grid grid-cols-3 gap-3">{days.map((day) => <button key={day} type="button" role="tab" aria-selected={day === selectedDay} onClick={() => onDay(day)} className={`rounded-xl px-3 py-4 text-sm font-bold capitalize ${day === selectedDay ? "bg-navy text-white" : "bg-blue-50 text-navy"}`}>{dayLabel(day)}</button>)}</div><div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-6">{loading ? Array.from({ length: 6 }, (_, index) => <span key={index} className="h-12 animate-pulse rounded-xl bg-blue-50"/>) : daySlots.map((slot) => <button key={`${slot.day}-${slot.slotTime}`} type="button" disabled={slot.taken} onClick={() => onTime(slot.slotTime)} className={`rounded-xl px-2 py-3 text-sm font-bold ${slot.taken ? "cursor-not-allowed bg-gray-50 text-ink/35 line-through" : selectedTime === slot.slotTime ? "bg-blue text-navy ring-2 ring-navy" : "bg-blue-50 text-navy hover:bg-blue-mid/50"}`}>{slot.slotTime.slice(0, 5)}{slot.taken && <span className="sr-only"> ocupado</span>}</button>)}</div></div>;
}
