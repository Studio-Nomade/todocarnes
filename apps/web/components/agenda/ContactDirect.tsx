"use client";

import { useState } from "react";
import { createAgendaLead } from "@/app/agenda/lead-actions";
import type { AgendaLeadFormState, PublicRepresentative } from "@/lib/agenda/types";

const EMPTY_LEAD: AgendaLeadFormState = { name: "", company: "", email: "", phone: "", message: "" };

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").replace(/^56/, "").slice(0, 9);
  return [digits.slice(0, 1), digits.slice(1, 5), digits.slice(5, 9)].filter(Boolean).join(" ");
}

export function ContactDirect({ representative, configured }: { representative: PublicRepresentative; configured: boolean }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_LEAD);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<"idle" | "sent" | "sent_without_email" | "error">("idle");
  const fieldClass = "w-full rounded-lg border border-white/25 bg-white px-4 py-3 text-sm text-navy outline-none focus:ring-2 focus:ring-blue";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured) return;
    setPending(true); setStatus("idle");
    const result = await createAgendaLead({ ...form, repId: representative.id });
    setPending(false);
    if (!result.ok) { setStatus("error"); return; }
    setStatus(result.emailSent ? "sent" : "sent_without_email");
    setForm(EMPTY_LEAD);
  }

  return (
    <section id="contacto" className="bg-white px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl bg-navy px-6 py-8 text-white sm:px-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between"><div><h2 className="font-display text-2xl sm:text-3xl">¿Prefieres que te contactemos directamente?</h2><p className="mt-2 text-sm text-blue-50">Déjanos tus datos y un miembro de nuestro equipo te escribirá.</p></div><button type="button" onClick={() => setOpen((value) => !value)} className="shrink-0 rounded-full bg-blue px-6 py-3 text-sm font-bold text-navy">{open ? "Cerrar formulario" : "Quiero que me contacten →"}</button></div>
        {open && <form onSubmit={submit} className="mt-7 grid gap-4 border-t border-white/15 pt-7 sm:grid-cols-2"><label className="text-sm font-semibold">Nombre *<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={`mt-2 ${fieldClass}`} /></label><label className="text-sm font-semibold">Empresa<input value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} className={`mt-2 ${fieldClass}`} /></label><label className="text-sm font-semibold">Email *<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className={`mt-2 ${fieldClass}`} /></label><label className="text-sm font-semibold">Teléfono *<span className="mt-2 flex overflow-hidden rounded-lg bg-white"><span className="flex items-center bg-blue-50 px-3 text-sm font-bold text-navy">+56</span><input required inputMode="numeric" value={form.phone} onChange={(event) => setForm({ ...form, phone: formatPhone(event.target.value) })} className="min-w-0 flex-1 px-4 py-3 text-sm text-navy outline-none" placeholder="9 1234 5678"/></span></label><label className="text-sm font-semibold sm:col-span-2">Mensaje <span className="font-normal text-blue-50">(opcional)</span><textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} className={`mt-2 min-h-24 ${fieldClass}`} /></label><div className="sm:col-span-2"><button disabled={pending || !configured} className="rounded-full bg-blue px-7 py-3 text-sm font-bold text-navy disabled:opacity-50">{pending ? "Enviando..." : "Enviar solicitud"}</button>{!configured && <p className="mt-3 text-sm text-blue-50">El envío se habilitará al configurar Supabase.</p>}{status === "sent" && <p role="status" className="mt-3 text-sm text-blue-50">¡Gracias! Recibimos tus datos y te enviamos un acuse.</p>}{status === "sent_without_email" && <p role="status" className="mt-3 text-sm text-blue-50">Recibimos tus datos. El correo no pudo salir, pero tu solicitud quedó guardada.</p>}{status === "error" && <p role="alert" className="mt-3 text-sm text-blue-50">No pudimos guardar tus datos. Inténtalo nuevamente.</p>}</div></form>}
      </div>
    </section>
  );
}
