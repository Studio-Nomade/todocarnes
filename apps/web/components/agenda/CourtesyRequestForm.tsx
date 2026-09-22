"use client";

import { useState } from "react";
import { createCourtesyRequest } from "@/app/agenda/courtesy-actions";
import type { CourtesyRequestInput } from "@/lib/courtesy/types";

const fieldClass = "mt-2 w-full rounded-lg border border-navy/15 bg-white px-4 py-3 text-navy outline-none focus-visible:ring-2 focus-visible:ring-blue";

function emptyForm(eventId: string): CourtesyRequestInput {
  return { eventId, name: "", lastName: "", rut: "", company: "", cargo: "", email: "", phone: "", website: "" };
}

export function CourtesyRequestForm({ eventId, configured }: { eventId: string; configured: boolean }) {
  const [form, setForm] = useState(() => emptyForm(eventId));
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<"idle" | "sent" | "sent_without_email" | "error">("idle");
  const update = (field: keyof CourtesyRequestInput, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured || pending) return;
    setPending(true);
    setStatus("idle");
    const result = await createCourtesyRequest(form);
    setPending(false);
    if (!result.ok) {
      setStatus("error");
      return;
    }
    setStatus(result.emailSent ? "sent" : "sent_without_email");
    setForm(emptyForm(eventId));
  }

  return (
    <section id="entrada-cortesia" className="scroll-mt-24 bg-blue-50 px-5 py-14 sm:px-8 lg:py-20">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.75fr_1.25fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Entrada de cortesía</p>
          <h2 className="mt-3 text-3xl text-navy sm:text-4xl">Solicita tu invitación a la feria.</h2>
          <p className="mt-4 max-w-md leading-7 text-ink/70">
            Déjanos tus datos para registrar tu solicitud. Recibirás una confirmación por correo; no es
            necesario descargar un ticket ni un código QR.
          </p>
        </div>
        <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-navy">Nombres *<input required autoComplete="given-name" value={form.name} onChange={(event) => update("name", event.target.value)} className={fieldClass}/></label>
          <label className="text-sm font-semibold text-navy">Apellidos *<input required autoComplete="family-name" value={form.lastName} onChange={(event) => update("lastName", event.target.value)} className={fieldClass}/></label>
          <label className="text-sm font-semibold text-navy">RUT *<input required inputMode="text" placeholder="12.345.678-9" value={form.rut} onChange={(event) => update("rut", event.target.value)} className={fieldClass}/></label>
          <label className="text-sm font-semibold text-navy">Empresa *<input required autoComplete="organization" value={form.company} onChange={(event) => update("company", event.target.value)} className={fieldClass}/></label>
          <label className="text-sm font-semibold text-navy">Cargo *<input required autoComplete="organization-title" value={form.cargo} onChange={(event) => update("cargo", event.target.value)} className={fieldClass}/></label>
          <label className="text-sm font-semibold text-navy">Correo *<input required type="email" autoComplete="email" value={form.email} onChange={(event) => update("email", event.target.value)} className={fieldClass}/></label>
          <label className="text-sm font-semibold text-navy">Teléfono *<input required inputMode="tel" autoComplete="tel" placeholder="+56 9 1234 5678" value={form.phone} onChange={(event) => update("phone", event.target.value)} className={fieldClass}/></label>
          <label className="absolute -left-[9999px]" aria-hidden="true">Sitio web<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => update("website", event.target.value)}/></label>
          <button type="submit" disabled={!configured || pending} className="rounded-full bg-navy px-7 py-3.5 text-sm font-bold text-white disabled:opacity-50 sm:col-span-2">{pending ? "Enviando..." : "Solicitar entrada de cortesía"}</button>
          <p aria-live="polite" className="text-sm font-semibold text-navy sm:col-span-2">
            {!configured && "La solicitud se habilitará al configurar el evento en Supabase."}
            {status === "sent" && "Solicitud registrada. Revisa tu correo para ver la confirmación."}
            {status === "sent_without_email" && "Tu solicitud quedó registrada, aunque el correo no pudo enviarse."}
            {status === "error" && "No pudimos registrar la solicitud. Revisa los datos (incluido el RUT) e inténtalo nuevamente."}
          </p>
        </form>
      </div>
    </section>
  );
}
