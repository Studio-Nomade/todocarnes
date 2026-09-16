"use client";

import { useState } from "react";

type ServiceValues = { description: string; title: string };
type ServiceFormProps = {
  disabled: boolean;
  initialValues?: ServiceValues;
  onSubmit: (values: ServiceValues) => void;
  submitLabel: string;
};

const inputClass = "mt-1.5 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20";

export function ServiceForm({ disabled, initialValues, onSubmit, submitLabel }: ServiceFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");

  return (
    <form
      className="mt-5 space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({ description, title });
      }}
    >
      <label className="block text-sm font-medium text-navy">
        Título
        <input className={inputClass} maxLength={100} onChange={(event) => setTitle(event.target.value)} required value={title} />
      </label>
      <label className="block text-sm font-medium text-navy">
        Descripción
        <textarea className={`${inputClass} min-h-28 resize-y`} maxLength={600} minLength={10} onChange={(event) => setDescription(event.target.value)} required value={description} />
      </label>
      <button className="admin-button-primary px-4" disabled={disabled} type="submit">
        {disabled ? "Guardando…" : submitLabel}
      </button>
    </form>
  );
}
