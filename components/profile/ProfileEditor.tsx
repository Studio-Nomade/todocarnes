"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateProfile, type ProfileInput } from "@/lib/actions/profile";
import { EmailSignature, HEAD_OFFICE_ADDRESS } from "./EmailSignature";

export function ProfileEditor({ initialProfile }: { initialProfile: ProfileInput }) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const initials = profile.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  function updateField(field: keyof ProfileInput, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    startTransition(async () => {
      const result = await updateProfile(profile);
      if (!result.success) {
        setMessage(result.error);
        return;
      }
      setMessage("Perfil actualizado correctamente.");
      router.refresh();
    });
  }

  return (
    <form className="rounded-2xl border border-ink/10 bg-white p-4 shadow-sm sm:p-8" onSubmit={submit}>
      <div className="flex flex-col items-start gap-4 border-b border-ink/10 pb-7 sm:flex-row sm:items-center sm:gap-5">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue/10 text-2xl font-semibold text-navy">
          {initials || "TC"}
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-navy">{profile.name || "Tu perfil"}</h2>
          <p className="mt-1 text-sm text-ink/55">{profile.email}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-blue">
            Usuario Todo Carnes
          </p>
        </div>
      </div>

      <div className="mt-7 grid gap-x-8 gap-y-5 md:grid-cols-2">
        <Field label="Nombre" name="name" onChange={updateField} value={profile.name} />
        <Field label="Cargo" name="jobTitle" onChange={updateField} placeholder="Ej. Gerente Comercial" value={profile.jobTitle} />
        <Field label="Correo visible" name="email" onChange={updateField} type="email" value={profile.email} />
        <Field label="Teléfono" name="phone" onChange={updateField} placeholder="+56 9 1234 5678" type="tel" value={profile.phone} />
        <label className="text-sm font-medium text-navy md:col-span-2">
          Dirección casa matriz
          <input className={`${inputClass} bg-gray-50 text-ink/55`} readOnly value={HEAD_OFFICE_ADDRESS} />
        </label>
      </div>

      <section className="mt-9">
        <h3 className="text-lg font-semibold text-navy">Firma de correo</h3>
        <p className="mt-1 text-sm leading-6 text-ink/55">
          Se arma automáticamente con tus datos y aparecerá en los correos que prepares desde la plataforma.
        </p>
        <div className="mt-4 rounded-xl border border-ink/10 bg-gray-50 p-2 sm:p-4">
          <EmailSignature {...profile} />
        </div>
      </section>

      <div className="mt-8 flex flex-col-reverse items-stretch gap-4 border-t border-ink/10 pt-6 sm:flex-row sm:items-center sm:justify-end">
        {message ? <p className="text-sm font-medium text-ink/65" role="status">{message}</p> : null}
        <button
          className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "mt-2 w-full rounded-lg border border-ink/15 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-blue focus:ring-2 focus:ring-blue/20";

function Field({
  label,
  name,
  onChange,
  placeholder,
  type = "text",
  value,
}: {
  label: string;
  name: keyof ProfileInput;
  onChange: (field: keyof ProfileInput, value: string) => void;
  placeholder?: string;
  type?: "email" | "tel" | "text";
  value: string;
}) {
  return (
    <label className="text-sm font-medium text-navy">
      {label}
      <input
        className={inputClass}
        onChange={(event) => onChange(name, event.target.value)}
        placeholder={placeholder}
        required
        type={type}
        value={value}
      />
    </label>
  );
}
