"use client";

import { useEffect, useMemo, useState } from "react";
import { createBooking, getAvailability } from "@/app/actions/agenda";
import type { AgendaPageData, AgendaSlot, BookingFormState, BookingModality, PublicRepresentative } from "@/lib/agenda/types";
import { buildWhatsAppHref } from "@/lib/agenda/whatsapp";
import { AgendaStepper } from "./AgendaStepper";
import { BookingForm } from "./BookingForm";
import { BookingSummary } from "./BookingSummary";
import { ModalityPicker } from "./ModalityPicker";
import { RepresentativeGrid } from "./RepresentativeGrid";
import { SectionHeading } from "./SiteChrome";
import { SlotPicker } from "./SlotPicker";
import { SuccessState } from "./SuccessState";
import { dayLabel } from "./SlotPicker";

const EMPTY_FORM: BookingFormState = { name: "", company: "", cargo: "", email: "", phone: "", topics: "", cameFrom: "", modality: "", locationDetail: "" };

function fallbackSlots(data: AgendaPageData): AgendaSlot[] {
  return data.event.days.flatMap((day) => data.event.slotTimes.map((slotTime) => ({ day, slotTime, taken: false })));
}

function errorMessage(error: "invalid_data" | "invalid_selection" | "slot_taken" | "server_error") {
  if (error === "slot_taken") return "Ese horario acaba de ocuparse. Elige otro para continuar.";
  if (error === "invalid_data") return "Revisa los campos requeridos y el teléfono antes de confirmar.";
  if (error === "invalid_selection") return "La selección ya no está disponible. Vuelve a elegir día y horario.";
  return "No pudimos confirmar la reserva. Inténtalo nuevamente en unos minutos.";
}

export function AgendaClient({ data }: { data: AgendaPageData }) {
  if (!data.representatives.length || !data.event.days.length) {
    return (
      <div className="mx-auto max-w-3xl py-10 text-center">
        <h3 className="font-display text-3xl text-navy">Próximamente podrás reservar tu reunión.</h3>
        <p className="mx-auto mt-5 max-w-xl text-ink/65">Por ahora no hay horarios disponibles. Puedes escribirnos desde el formulario de contacto y te responderemos a la brevedad.</p>
        {data.notice ? <p className="mt-6 rounded-xl border border-blue-mid bg-blue-50 px-5 py-4 text-sm text-navy">{data.notice}</p> : null}
      </div>
    );
  }

  return <ConfiguredAgendaClient data={data} />;
}

function ConfiguredAgendaClient({ data }: { data: AgendaPageData }) {
  const [representative, setRepresentative] = useState(data.representatives[0]);
  const [day, setDay] = useState(data.event.days[0]);
  const [slotTime, setSlotTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<AgendaSlot[]>(() => fallbackSlots(data));
  const [loadingSlots, setLoadingSlots] = useState(data.configured);
  const [form, setForm] = useState<BookingFormState>(EMPTY_FORM);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [emailWarning, setEmailWarning] = useState(false);

  async function refreshAvailability(rep: PublicRepresentative) {
    if (!data.configured) return;
    setLoadingSlots(true);
    const result = await getAvailability({ repId: rep.id, eventId: data.event.id });
    if (result.ok) setSlots(result.slots);
    else setError("No pudimos actualizar los horarios. Inténtalo nuevamente.");
    setLoadingSlots(false);
  }

  useEffect(() => {
    let active = true;
    if (!data.configured) return;
    setLoadingSlots(true);
    getAvailability({ repId: representative.id, eventId: data.event.id }).then((result) => {
      if (!active) return;
      if (result.ok) setSlots(result.slots);
      else setError("No pudimos actualizar los horarios. Inténtalo nuevamente.");
      setLoadingSlots(false);
    });
    return () => { active = false; };
  }, [data.configured, data.event.id, representative.id]);

  const modalityReady = form.modality !== "" && (form.modality !== "visita" || form.locationDetail.trim().length > 0);
  const formReady = useMemo(() => Boolean(form.name.trim() && form.company.trim() && form.cargo.trim() && form.email.includes("@") && form.phone.replace(/\D/g, "").length === 9), [form]);
  const selectionReady = modalityReady && Boolean(slotTime);
  const currentStep = completed ? 4 : formReady && selectionReady ? 3 : selectionReady ? 2 : 1;
  const whatsappHref = buildWhatsAppHref({ representative, dayLabel: dayLabel(day), slotTime, customerName: form.name });

  function selectRepresentative(rep: PublicRepresentative) {
    setRepresentative(rep); setDay(data.event.days[0]); setSlotTime(null); setError(null);
  }

  function update(field: keyof BookingFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function confirm() {
    if (!slotTime || !data.configured || !modalityReady) return;
    setPending(true); setError(null);
    const result = await createBooking({ ...form, eventId: data.event.id, repId: representative.id, day, slotTime });
    setPending(false);
    if (result.ok) { setEmailWarning(!result.emailSent); setCompleted(true); return; }
    setError(errorMessage(result.error));
    if (result.error === "slot_taken" || result.error === "invalid_selection") { setSlotTime(null); await refreshAvailability(representative); }
  }

  if (completed && slotTime) return <><AgendaStepper current={4}/><SuccessState representative={representative} day={day} slotTime={slotTime} modality={form.modality as BookingModality} locationDetail={form.locationDetail} emailWarning={emailWarning}/></>;

  return (
    <>
      <AgendaStepper current={currentStep}/>
      <div id="reserva" className="scroll-mt-24 pb-6">
        <div><SectionHeading eyebrow="Nuestro equipo" title="Elige con quién quieres reunirte">Selecciona el área y la persona que mejor se ajusta a tu negocio.</SectionHeading><RepresentativeGrid representatives={data.representatives} selectedId={representative.id} onSelect={selectRepresentative}/></div>
        {data.notice && <p className="mt-5 rounded-xl border border-blue-mid bg-blue-50 px-5 py-4 text-sm text-navy">{data.notice}</p>}
        <div className="mt-14"><SectionHeading eyebrow="Paso 1 de 4" title="Modalidad, día y horario">Reuniones de {data.event.slotMinutes} minutos, de lunes a viernes, dentro de las próximas dos semanas.</SectionHeading><ModalityPicker value={form.modality} locationDetail={form.locationDetail} onChange={(value) => { update("modality", value); setError(null); }} onLocationDetail={(value) => update("locationDetail", value)}/><SlotPicker days={data.event.days} slots={slots} selectedDay={day} selectedTime={slotTime} loading={loadingSlots} onDay={(value) => { setDay(value); setSlotTime(null); }} onTime={(value) => { setSlotTime(value); setError(null); }}/></div>
        <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]"><div><SectionHeading eyebrow="Paso 2 de 4" title="Completa tus datos">Con esta información confirmamos tu reunión y te enviamos los detalles.</SectionHeading><BookingForm value={form} onChange={update}/></div><BookingSummary event={data.event} representative={representative} day={day} slotTime={slotTime} modality={form.modality} locationDetail={form.locationDetail} whatsappHref={whatsappHref} pending={pending} error={error} disabled={!formReady || !selectionReady || !data.configured} onConfirm={confirm}/></div>
      </div>
    </>
  );
}
