"use client";

import { useState } from "react";
import type { CommercialUserInput } from "@/lib/validators/user";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-blue focus:ring-2 focus:ring-blue/20";

const emptyForm: CommercialUserInput = {
  email: "",
  jobTitle: "",
  name: "",
  password: "",
  phone: "",
};

export function UserForm({
  disabled,
  onSubmit,
}: {
  disabled: boolean;
  onSubmit: (values: CommercialUserInput) => void;
}) {
  const [values, setValues] = useState<CommercialUserInput>(emptyForm);

  function set<Key extends keyof CommercialUserInput>(key: Key, value: CommercialUserInput[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <form
      className="mt-4 space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(values);
        setValues(emptyForm);
      }}
    >
      <label className="block text-sm font-medium text-navy">
        Nombre
        <input className={inputClass} disabled={disabled} maxLength={100} onChange={(event) => set("name", event.target.value)} required value={values.name} />
      </label>
      <label className="block text-sm font-medium text-navy">
        Correo
        <input className={inputClass} disabled={disabled} maxLength={254} onChange={(event) => set("email", event.target.value)} required type="email" value={values.email} />
      </label>
      <label className="block text-sm font-medium text-navy">
        Contraseña inicial
        <input className={inputClass} disabled={disabled} minLength={8} maxLength={72} onChange={(event) => set("password", event.target.value)} required type="text" value={values.password} />
        <span className="mt-1 block text-xs font-normal text-ink/50">Mínimo 8 caracteres. El comercial podrá cambiarla luego.</span>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-navy">
          Cargo <span className="font-normal text-ink/45">(opcional)</span>
          <input className={inputClass} disabled={disabled} maxLength={100} onChange={(event) => set("jobTitle", event.target.value)} value={values.jobTitle} />
        </label>
        <label className="block text-sm font-medium text-navy">
          Teléfono <span className="font-normal text-ink/45">(opcional)</span>
          <input className={inputClass} disabled={disabled} maxLength={30} onChange={(event) => set("phone", event.target.value)} value={values.phone} />
        </label>
      </div>
      <button
        className="admin-button-primary w-full px-4"
        disabled={disabled}
        type="submit"
      >
        Crear comercial
      </button>
    </form>
  );
}
