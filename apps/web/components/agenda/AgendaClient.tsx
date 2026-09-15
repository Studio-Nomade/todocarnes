"use client";

import { useEffect, useMemo, useState } from "react";
import { createBooking, getAvailability } from "@/app/agenda/actions";
import type { AgendaPageData, AgendaSlot, BookingFormState, PublicRepresentative } from "@/lib/agenda/types";
import { AgendaStepper } from "./AgendaStepper";
import { BookingForm } from "./BookingForm";
import { BookingSummary } from "./BookingSummary";
import { RepresentativeGrid } from "./RepresentativeGrid";
import { SectionHeading } from "./SiteChrome";
import { SlotPicker } from "./SlotPicker";
import { SuccessState } from "./SuccessState";

const EMPTY_FORM: BookingFormState = { name: "", company: "", cargo: "", email: "", phone: "", topics: "", cameFrom: "" };

function fallbackSlots(data: AgendaPageData): AgendaSlot[] {
  return data.event.days.flatMap((day) => data.event.slotTimes.map((slotTime) => ({ day, slotTime, taken: false })));
}

function errorMessage(error: "invalid_data" | "invalid_selection" | "slot_taken" | "server_error") {
  if (error === "slot_taken") return "Ese horario acaba de ocuparse. Elegí otro para continuar.";
  if (error === "invalid_data") return "Revisa los campos requeridos y el teléfono antes de confirmar.";
  if (error === "invalid_selection") return "La selección ya no está disponible. Vuelve a elegir vendedor y horario.";
  return "No pudimos confirmar la reserva. Inténtalo nuevamente en unos minutos.";
}

export function AgendaClient({ data }: { data: AgendaPageData }) {
  const [representative, setRepresentative] = useState(data.representatives[0]);
  const [day, setDay] = useState(data.event.days[0]);
  const [slotTime, setSlotTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<AgendaSlot[]>(() => fallbackSlots(data));
  const [loadingSlots, setLoadingSlots] = useState(data.configured);
  const [form, setForm] = useState<BookingFormState>(EMPTY_FORM);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  async function refreshAvailability(rep: PublicRepresentative) {
    if (!data.configured || rep.isPlaceholder) return;
    setLoadingSlots(true);
    const result = await getAvailability({ repId: rep.id, eventId: data.event.id });
    if (result.ok) setSlots(result.slots);
    else setError("No pudimos actualizar los horarios. Inténtalo nuevamente.");
    setLoadingSlots(false);
  }

  useEffect(() => {
    let active = true;
    if (!data.configured || representative.isPlaceholder) return;
    setLoadingSlots(true);
    getAvailability({ repId: representative.id, eventId: data.event.id }).then((result) => {
      if (!active) return;
      if (result.ok) setSlots(result.slots);
      else setError("No pudimos actualizar los horarios. Inténtalo nuevamente.");
      setLoadingSlots(false);
    });
    return () => { active = false; };
  }, [data.configured, data.event.id, representative.id, representative.isPlaceholder]);

  const formReady = useMemo(() => Boolean(form.name.trim() && form.company.trim() && form.cargo.trim() && form.email.includes("@") && form.phone.replace(/\D/g, "").length === 9), [form]);
  const currentStep = completed ? 4 : formReady && slotTime ? 3 : slotTime ? 2 : 1;

  function selectRepresentative(rep: PublicRepresentative) {
    setRepresentative(rep); setDay(data.event.days[0]); setSlotTime(null); setError(null);
  }

  async function confirm() {
    if (!slotTime || !data.configured || representative.isPlaceholder) return;
    setPending(true); setError(null);
    const result = await createBooking({ ...form, eventId: data.event.id, repId: representative.id, day, slotTime });
    setPending(false);
    if (result.ok) { setCompleted(true); return; }
    setError(errorMessage(result.error));
    if (result.error === "slot_taken") { setSlotTime(null); await refreshAvailability(representative); }
  }

  if (completed && slotTime) return <><AgendaStepper current={4}/><SuccessState event={data.event} representative={representative} day={day} slotTime={slotTime}/></>;

  return (
    <>
      <AgendaStepper current={currentStep}/>
      <section id="reserva" className="mx-auto max-w-6xl scroll-mt-4 px-5 pb-14 sm:px-8">
        <div id="equipo"><SectionHeading eyebrow="Nuestro equipo" title="Elige el área que mejor se ajusta a tu negocio">Selecciona con quién te gustaría agendar tu reunión en la feria.</SectionHeading><RepresentativeGrid representatives={data.representatives} selectedId={representative.id} onSelect={selectRepresentative}/></div>
        {data.notice && <p className="mt-5 rounded-xl border border-blue-mid bg-blue-50 px-5 py-4 text-sm text-navy">{data.notice}</p>}
        <div className="mt-14"><SectionHeading eyebrow="Paso 1 de 4" title="Selecciona día y horario">Elige el día y horario que más te acomode para tu reunión presencial en nuestro stand.</SectionHeading><SlotPicker days={data.event.days} slots={slots} selectedDay={day} selectedTime={slotTime} loading={loadingSlots} onDay={(value) => { setDay(value); setSlotTime(null); }} onTime={(value) => { setSlotTime(value); setError(null); }}/></div>
        <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]"><div><SectionHeading eyebrow="Paso 2 de 4" title="Completa tus datos">Con esta información podremos confirmar tu reunión en la feria.</SectionHeading><BookingForm value={form} onChange={(field, value) => setForm((current) => ({ ...current, [field]: value }))}/></div><BookingSummary event={data.event} representative={representative} day={day} slotTime={slotTime} pending={pending} error={error} disabled={!formReady || !slotTime || !data.configured || representative.isPlaceholder} onConfirm={confirm}/></div>
      </section>
    </>
  );
}
