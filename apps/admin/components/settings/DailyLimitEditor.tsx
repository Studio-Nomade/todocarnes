"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateGenerationDailyLimit } from "@/lib/actions/settings";

export function DailyLimitEditor({ initialLimit }: { initialLimit: number }) {
  const router = useRouter();
  const [limit, setLimit] = useState(String(initialLimit));
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function save() {
    setMessage("");
    startTransition(async () => {
      const result = await updateGenerationDailyLimit(limit);
      if (!result.success) {
        setMessage(result.error);
        return;
      }
      setMessage("Tope actualizado.");
      router.refresh();
    });
  }

  return (
    <article className="rounded-xl border border-ink/10 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-navy">Tope diario</h2>
      <p className="mt-2 text-sm leading-6 text-ink/60">
        Cuenta cada intento registrado durante el día, sin importar su resultado.
      </p>
      <div className="mt-4 flex max-w-sm flex-col items-stretch gap-3 sm:flex-row sm:items-end">
        <label className="flex-1 text-sm font-medium text-ink">
          Generaciones por día
          <input
            className="mt-2 w-full rounded-lg border border-ink/15 px-3 py-2.5 outline-none focus:border-blue"
            inputMode="numeric"
            min="1"
            onChange={(event) => setLimit(event.target.value)}
            type="number"
            value={limit}
          />
        </label>
        <button
          className="admin-button-primary px-4"
          disabled={isPending}
          onClick={save}
          type="button"
        >
          {isPending ? "Guardando…" : "Guardar"}
        </button>
      </div>
      {message ? (
        <p className="mt-3 text-sm font-medium text-ink/70" role="status">
          {message}
        </p>
      ) : null}
    </article>
  );
}
