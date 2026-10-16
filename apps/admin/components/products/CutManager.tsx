"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createCut, deleteCut, moveCut, renameCut } from "@/lib/actions/cuts";
import type { CutCategory, CutRecord } from "@/lib/cuts/types";

export function CutManager({ categories, cuts }: { categories: CutCategory[]; cuts: CutRecord[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<{ error?: string; success: boolean }>) {
    setError("");
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setError(result.error ?? "No se pudo completar la acción.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {error ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p> : null}
      {categories.map((category) => {
        const categoryCuts = cuts.filter((cut) => cut.categoryId === category.id);
        return (
          <section className="rounded-xl border border-ink/10 bg-white p-5 shadow-sm" key={category.id}>
            <div className="flex flex-col gap-2 border-b border-ink/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-navy">{category.name}</h2>
                <p className="mt-1 text-xs text-ink/55">Este corte aparecerá en la barra de cortes de todas las fichas de {category.name}.</p>
              </div>
              <CreateCutForm categoryId={category.id} disabled={isPending} onCreate={(name) => run(() => createCut(category.id, name))} />
            </div>
            {categoryCuts.length === 0 ? (
              <p className="py-6 text-sm text-ink/55">Esta categoría todavía no tiene cortes.</p>
            ) : (
              <ul className="divide-y divide-ink/10">
                {categoryCuts.map((cut, index) => (
                  <li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center" key={cut.id}>
                    <form className="flex min-w-0 flex-1 gap-2" onSubmit={(event) => {
                      event.preventDefault();
                      const name = new FormData(event.currentTarget).get("name");
                      run(() => renameCut(cut.id, name));
                    }}>
                      <input className="h-10 min-w-0 flex-1 rounded-lg border border-ink/15 px-3 text-sm outline-none focus:border-blue" defaultValue={cut.name} disabled={isPending} name="name" />
                      <button className="admin-button-secondary h-10 px-3" disabled={isPending} type="submit">Guardar</button>
                    </form>
                    <span className="text-xs text-ink/55">{cut.productCount} producto{cut.productCount === 1 ? "" : "s"}</span>
                    <div className="flex gap-2">
                      <button aria-label={`Subir ${cut.name}`} className="admin-button-secondary h-9 w-9 p-0" disabled={isPending || index === 0} onClick={() => run(() => moveCut(cut.id, -1))} type="button">↑</button>
                      <button aria-label={`Bajar ${cut.name}`} className="admin-button-secondary h-9 w-9 p-0" disabled={isPending || index === categoryCuts.length - 1} onClick={() => run(() => moveCut(cut.id, 1))} type="button">↓</button>
                      <button className="h-9 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-45" disabled={isPending || cut.productCount > 0} onClick={() => {
                        if (window.confirm(`¿Eliminar el corte ${cut.name}?`)) run(() => deleteCut(cut.id));
                      }} title={cut.productCount > 0 ? `Tiene ${cut.productCount} productos asignados` : "Eliminar corte"} type="button">Eliminar</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

function CreateCutForm({ categoryId, disabled, onCreate }: { categoryId: string; disabled: boolean; onCreate: (name: string) => void }) {
  return (
    <form className="flex gap-2" key={categoryId} onSubmit={(event) => {
      event.preventDefault();
      const form = event.currentTarget;
      onCreate(String(new FormData(form).get("name") ?? ""));
      form.reset();
    }}>
      <input className="h-10 min-w-0 rounded-lg border border-ink/15 px-3 text-sm outline-none focus:border-blue" disabled={disabled} name="name" placeholder="Nuevo corte" />
      <button className="admin-button-primary h-10 px-4" disabled={disabled} type="submit">Crear</button>
    </form>
  );
}
