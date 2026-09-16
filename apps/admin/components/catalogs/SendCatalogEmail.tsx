"use client";

import { useState, type FormEvent } from "react";
import { EmailSignature } from "@/components/profile/EmailSignature";
import { catalogPdfFilename, catalogPeriod } from "@/lib/catalogs/format";

type SendCatalogEmailProps = {
  catalogTitle: string;
  month: number;
  senderEmail: string;
  senderJobTitle: string;
  senderName: string;
  senderPhone: string;
  year: number;
};

export function SendCatalogEmail({
  catalogTitle,
  month,
  senderEmail,
  senderJobTitle,
  senderName,
  senderPhone,
  year,
}: SendCatalogEmailProps) {
  const period = catalogPeriod(month, year);
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOpen(false);
    setSent(true);
    window.setTimeout(() => setSent(false), 5000);
  }

  return (
    <>
      <button
        className="admin-button-secondary w-full px-4 py-2 sm:w-auto"
        onClick={() => setOpen(true)}
        type="button"
      >
        Enviar por mail
      </button>

      {sent ? (
        <div
          aria-live="polite"
          className="fixed bottom-4 left-4 right-4 z-[60] rounded-xl bg-emerald-700 px-5 py-4 text-center text-sm font-semibold text-white shadow-xl sm:bottom-6 sm:left-auto sm:right-6"
          role="status"
        >
          Correo enviado exitosamente
        </div>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/55 p-2 sm:p-4">
          <div
            aria-labelledby="send-catalog-title"
            aria-modal="true"
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            role="dialog"
          >
            <div className="flex items-start justify-between border-b border-ink/10 px-4 py-4 sm:px-6 sm:py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue">
                  Compartir catálogo
                </p>
                <h2 className="mt-1 text-xl font-semibold text-navy" id="send-catalog-title">
                  Enviar por correo
                </h2>
              </div>
              <button
                aria-label="Cerrar"
                className="rounded-lg px-2 py-1 text-xl text-ink/45 hover:bg-gray-100 hover:text-navy"
                onClick={() => setOpen(false)}
                type="button"
              >
                ×
              </button>
            </div>

            <form className="space-y-4 p-4 sm:p-6" onSubmit={submit}>
              <EmailField label="De" name="from" readOnly value={senderEmail} />
              <div className="grid gap-4 sm:grid-cols-2">
                <EmailField label="Para" name="to" placeholder="cliente@empresa.cl" required />
                <EmailField label="CC" name="cc" placeholder="equipo@empresa.cl" />
              </div>
              <label className="block text-sm font-medium text-navy">
                Asunto
                <input
                  className={inputClass}
                  defaultValue={`${catalogTitle} · ${period}`}
                  name="subject"
                  required
                />
              </label>
              <label className="block text-sm font-medium text-navy">
                Mensaje
                <textarea
                  className={`${inputClass} min-h-36 resize-y leading-6`}
                  defaultValue={`Hola,\n\nTe comparto el catálogo comercial de Todo Carnes correspondiente a ${period}. En el documento adjunto encontrarás nuestra selección de productos y formatos disponibles.\n\nQuedo atento a tus comentarios y requerimientos.\n\nSaludos,`}
                  name="message"
                  required
                />
              </label>

              <div>
                <p className="text-sm font-medium text-navy">Firma automática</p>
                <div className="mt-1.5 rounded-xl border border-ink/10">
                  <EmailSignature
                    email={senderEmail}
                    jobTitle={senderJobTitle}
                    name={senderName}
                    phone={senderPhone}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-ink/10 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Adjunto</p>
                <div className="mt-2 flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-xs font-bold text-red-700">
                    PDF
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-navy">
                      {catalogPdfFilename(month)}
                    </p>
                    <p className="mt-0.5 text-xs text-ink/50">Catálogo listo para compartir</p>
                  </div>
                </div>
              </div>

              <p className="text-xs leading-5 text-ink/45">
                Modo prototipo: esta acción simula el envío y no contacta al destinatario.
              </p>
              <div className="flex flex-col-reverse gap-3 border-t border-ink/10 pt-5 sm:flex-row sm:justify-end">
                <button
                  className="admin-button-secondary"
                  onClick={() => setOpen(false)}
                  type="button"
                >
                  Cancelar
                </button>
                <button
                  className="admin-button-primary"
                  type="submit"
                >
                  Enviar correo
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

const inputClass =
  "mt-1.5 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-blue focus:ring-2 focus:ring-blue/20";

function EmailField({
  label,
  name,
  placeholder,
  readOnly = false,
  required = false,
  value,
}: {
  label: string;
  name: string;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  value?: string;
}) {
  return (
    <label className="block text-sm font-medium text-navy">
      {label}
      <input
        className={`${inputClass} ${readOnly ? "bg-gray-50 text-ink/60" : ""}`}
        defaultValue={value}
        name={name}
        placeholder={placeholder}
        readOnly={readOnly}
        required={required}
        type="email"
      />
    </label>
  );
}
