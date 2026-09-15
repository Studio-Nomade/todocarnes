"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateCatalogBranding } from "@/lib/actions/catalogs";

type CatalogBrandingFormProps = {
  catalogId: string;
  initialClientName: string;
  logoUrl: string | null;
};

export function CatalogBrandingForm({ catalogId, initialClientName, logoUrl }: CatalogBrandingFormProps) {
  const router = useRouter();
  const [clientName, setClientName] = useState(initialClientName);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaved(false);
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await updateCatalogBranding(catalogId, formData);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <details className="group rounded-xl border border-ink/10 bg-white shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5">
        <div>
          <p className="font-semibold text-navy">Personalización del cliente</p>
          <p className="mt-1 text-xs text-ink/55">Nombre y logo para portada y mockups de maquila.</p>
        </div>
        <span aria-hidden className="text-xl text-blue group-open:rotate-45">＋</span>
      </summary>
      <form className="grid gap-5 border-t border-ink/10 p-5 md:grid-cols-[1fr_1fr_auto] md:items-end" onSubmit={submit}>
        <label className="text-sm font-medium text-navy">
          Cliente o empresa
          <input
            className="mt-1.5 h-11 w-full rounded-lg border border-ink/15 px-3 text-sm outline-none focus:border-blue"
            maxLength={120}
            name="clientName"
            onChange={(event) => setClientName(event.target.value)}
            placeholder="Ej. Restaurante El Molino"
            value={clientName}
          />
        </label>
        <label className="text-sm font-medium text-navy">
          Logo del cliente · PNG
          <input accept="image/png" className="mt-1.5 block w-full text-sm text-ink/65 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2.5 file:font-semibold file:text-navy" name="clientLogo" type="file" />
        </label>
        <button className="h-11 rounded-lg bg-navy px-5 text-sm font-semibold text-white disabled:opacity-50" disabled={isPending} type="submit">
          {isPending ? "Guardando…" : "Guardar"}
        </button>
        <div className="md:col-span-3">
          {logoUrl ? (
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
              <div className="relative h-12 w-24 rounded bg-white">
                <Image alt={`Logo de ${clientName || "cliente"}`} className="object-contain p-1" fill sizes="96px" src={logoUrl} />
              </div>
              <span className="text-xs text-ink/55">Logo actual del catálogo</span>
            </div>
          ) : <p className="text-xs text-ink/50">Sin logo: el catálogo mostrará “TU LOGO AQUÍ”.</p>}
          {saved ? <p className="mt-3 text-sm font-medium text-emerald-700">Personalización guardada.</p> : null}
          {error ? <p className="mt-3 text-sm text-red-700" role="alert">{error}</p> : null}
        </div>
      </form>
    </details>
  );
}
