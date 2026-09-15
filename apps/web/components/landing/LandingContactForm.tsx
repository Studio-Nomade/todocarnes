"use client";

import { useState } from "react";
import { createLandingLead } from "@/app/landing-actions";
import { LANDING_AREA_OPTIONS } from "@/lib/landing/constants";
import type { LandingLeadInput } from "@/lib/landing/types";

const emptyForm = (): LandingLeadInput => ({ name: "", company: "", email: "", phone: "", area: "", website: "", submissionId: crypto.randomUUID() });
const inputClass = "mt-2 w-full rounded-lg border border-navy/15 bg-white px-4 py-3 text-navy outline-none focus-visible:ring-2 focus-visible:ring-blue-700";

export function LandingContactForm({ configured }: { configured: boolean }) {
  const [form, setForm] = useState<LandingLeadInput>(emptyForm);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<"idle" | "sent" | "sent_without_email" | "rate_limited" | "error">("idle");
  const update = (field: keyof LandingLeadInput, value: string) => setForm((current) => ({ ...current, [field]: value }));

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!configured || pending) return;
    setPending(true); setStatus("idle");
    const result = await createLandingLead(form);
    setPending(false);
    if (!result.ok) { setStatus(result.error === "rate_limited" ? "rate_limited" : "error"); return; }
    setStatus(result.emailSent ? "sent" : "sent_without_email"); setForm(emptyForm());
  }

  return <section id="contacto" className="relative scroll-mt-24 overflow-hidden bg-blue-50 px-6 py-20 sm:px-8 lg:py-28"><div className="absolute inset-0 opacity-10 [background:url('/landing/contact-logistics.jpg')_center/cover]" /><div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.7fr_1.3fr]"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Contacto</p><h2 className="mt-4 font-display text-5xl text-navy">¿Qué necesita tu negocio?</h2><p className="mt-5 max-w-sm leading-7 text-ink/70">Cuéntanos tu necesidad y te derivamos al equipo indicado.</p></div><form onSubmit={submit} className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-bold text-navy">Nombre *<input required autoComplete="name" value={form.name} onChange={(event) => update("name", event.target.value)} className={inputClass} /></label><label className="text-sm font-bold text-navy">Empresa<input autoComplete="organization" value={form.company} onChange={(event) => update("company", event.target.value)} className={inputClass} /></label><label className="text-sm font-bold text-navy">Email *<input required type="email" autoComplete="email" value={form.email} onChange={(event) => update("email", event.target.value)} className={inputClass} /></label><label className="text-sm font-bold text-navy">Teléfono *<input required inputMode="tel" autoComplete="tel" placeholder="+56 9 1234 5678" value={form.phone} onChange={(event) => update("phone", event.target.value)} className={inputClass} /></label><label className="absolute -left-[9999px]" aria-hidden="true">Sitio web<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => update("website", event.target.value)} /></label><fieldset className="sm:col-span-2"><legend className="text-sm font-bold text-navy">¿En qué área te podemos ayudar? *</legend><div className="mt-3 flex flex-wrap gap-2">{LANDING_AREA_OPTIONS.map((option) => <label key={option.value} className={`cursor-pointer rounded-full px-4 py-2 text-xs font-bold ring-1 ring-navy/15 ${form.area === option.value ? "bg-navy text-white" : "bg-white text-navy"}`}><input required type="radio" name="area" value={option.value} checked={form.area === option.value} onChange={() => update("area", option.value)} className="sr-only" />{option.label}</label>)}</div></fieldset><button disabled={pending || !configured} className="rounded-full bg-gradient-to-r from-blue to-navy px-7 py-3.5 text-sm font-bold text-white disabled:opacity-50 sm:col-span-2">{pending ? "Enviando..." : "Conversemos"}</button><div aria-live="polite" className="text-sm font-semibold text-navy sm:col-span-2">{!configured && "El envío se habilitará al configurar Supabase."}{status === "sent" && "Gracias, te contactaremos."}{status === "sent_without_email" && "Gracias, te contactaremos. Tu solicitud quedó guardada aunque el correo no pudo salir."}{status === "rate_limited" && "Recibimos varias solicitudes. Inténtalo nuevamente más tarde."}{status === "error" && "No pudimos guardar tus datos. Inténtalo nuevamente."}</div></form></div></section>;
}
