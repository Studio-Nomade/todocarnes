"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateCatalogTitle } from "@/lib/actions/catalogs";

type CatalogTitleEditorProps = {
  catalogId: string;
  initialTitle: string;
};

export function CatalogTitleEditor({ catalogId, initialTitle }: CatalogTitleEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [draft, setDraft] = useState(initialTitle);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function cancel() {
    setDraft(title);
    setEditing(false);
    setError("");
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaved(false);
    startTransition(async () => {
      const result = await updateCatalogTitle(catalogId, draft);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setTitle(draft.trim());
      setDraft(draft.trim());
      setEditing(false);
      setSaved(true);
      router.refresh();
    });
  }

  if (editing) {
    return (
      <form className="mt-2 max-w-2xl" onSubmit={submit}>
        <label className="sr-only" htmlFor="catalog-title">Nombre del catálogo</label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            autoFocus
            className="h-11 min-w-0 flex-1 rounded-lg border border-blue bg-white px-3 text-lg font-semibold text-navy outline-none ring-2 ring-blue/20 sm:text-xl"
            id="catalog-title"
            maxLength={160}
            onChange={(event) => setDraft(event.target.value)}
            required
            value={draft}
          />
          <div className="flex gap-2">
            <button className="h-11 rounded-lg bg-navy px-4 text-sm font-semibold text-white disabled:opacity-50" disabled={isPending} type="submit">
              {isPending ? "Guardando…" : "Guardar"}
            </button>
            <button className="h-11 rounded-lg border border-ink/15 px-4 text-sm font-semibold text-ink/60 disabled:opacity-50" disabled={isPending} onClick={cancel} type="button">
              Cancelar
            </button>
          </div>
        </div>
        {error ? <p className="mt-2 text-sm text-red-700" role="alert">{error}</p> : null}
      </form>
    );
  }

  return (
    <div className="mt-2 flex min-w-0 items-start gap-2">
      <h1 className="min-w-0 break-words text-2xl font-semibold text-navy sm:text-3xl">{title}</h1>
      <button
        aria-label="Editar nombre del catálogo"
        className="group relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ink/10 text-ink/45 hover:border-blue/40 hover:bg-blue-50 hover:text-navy"
        onClick={() => {
          setEditing(true);
          setSaved(false);
        }}
        title="Editar nombre"
        type="button"
      >
        <EditIcon />
        <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-navy px-2 py-1 text-xs font-medium text-white shadow-lg group-hover:block">
          Editar nombre
        </span>
      </button>
      {saved ? <span className="mt-2 text-xs font-medium text-emerald-700" role="status">Nombre actualizado</span> : null}
    </div>
  );
}

function EditIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 20 20">
      <path d="M4 13.8V16h2.2L15 7.2 12.8 5 4 13.8Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m11.8 6 2.2 2.2" strokeLinecap="round" />
    </svg>
  );
}
