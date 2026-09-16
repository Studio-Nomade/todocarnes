"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createCatalog } from "@/lib/actions/catalogs";
import { monthName } from "@/lib/catalogs/format";

const now = new Date();
const months = Array.from({ length: 12 }, (_, index) => index + 1);
const years = [now.getUTCFullYear(), now.getUTCFullYear() + 1];
const inputClass =
  "mt-1.5 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/20";

export function CatalogCreateForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [month, setMonth] = useState(now.getUTCMonth() + 1);
  const [year, setYear] = useState(now.getUTCFullYear());
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await createCatalog({ month, title, year });
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push(`/catalogs/${result.id}`);
    });
  }

  return (
    <form className="grid gap-4 rounded-xl border border-ink/10 bg-white p-4 shadow-sm sm:p-6 lg:grid-cols-[2fr_1fr_1fr_auto] lg:items-end" onSubmit={handleSubmit}>
      <label className="text-sm font-medium text-navy">
        Título del catálogo
        <input className={inputClass} maxLength={160} onChange={(event) => setTitle(event.target.value)} placeholder="Ej. Catálogo Mensual" required value={title} />
      </label>
      <label className="text-sm font-medium text-navy">
        Mes
        <select className={inputClass} onChange={(event) => setMonth(Number(event.target.value))} value={month}>
          {months.map((value) => (
            <option key={value} value={value}>{monthName(value)}</option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium text-navy">
        Año
        <select className={inputClass} onChange={(event) => setYear(Number(event.target.value))} value={year}>
          {years.map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
      </label>
      <button className="admin-button-primary h-11" disabled={isPending} type="submit">
        {isPending ? "Creando…" : "Crear catálogo"}
      </button>
      {error ? <p className="text-sm text-red-700 lg:col-span-4" role="alert">{error}</p> : null}
    </form>
  );
}
