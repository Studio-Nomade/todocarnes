"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { changeOwnPassword } from "@/lib/actions/account";

const inputClass =
  "mt-2 w-full rounded-lg border border-ink/15 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-blue focus:ring-2 focus:ring-blue/20";

export function PasswordForm({ requiredChange = false }: { requiredChange?: boolean }) {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    startTransition(async () => {
      const result = await changeOwnPassword({ currentPassword, newPassword, repeatPassword });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setRepeatPassword("");
      if (requiredChange) {
        router.replace("/dashboard");
        router.refresh();
        return;
      }
      setSuccess("Contraseña actualizada correctamente.");
      router.refresh();
    });
  }

  return (
    <form
      className={`rounded-2xl border bg-white p-4 shadow-sm sm:p-8 ${requiredChange ? "border-blue ring-4 ring-blue/10" : "border-ink/10"}`}
      onSubmit={submit}
    >
      <h2 className="text-xl font-semibold text-navy">Cambiar contraseña</h2>
      <p className="mt-2 text-sm leading-6 text-ink/60">
        {requiredChange
          ? "Debes crear una contraseña personal antes de continuar usando la plataforma."
          : "Usa al menos 8 caracteres y elige una clave distinta de la actual."}
      </p>
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        <PasswordField autoComplete="current-password" label="Contraseña actual" onChange={setCurrentPassword} value={currentPassword} />
        <PasswordField autoComplete="new-password" label="Nueva contraseña" minLength={8} onChange={setNewPassword} value={newPassword} />
        <PasswordField autoComplete="new-password" label="Repetir nueva contraseña" minLength={8} onChange={setRepeatPassword} value={repeatPassword} />
      </div>
      <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
        {error ? <p className="mr-auto text-sm font-medium text-red-700" role="alert">{error}</p> : null}
        {success ? <p className="mr-auto text-sm font-medium text-emerald-700" role="status">{success}</p> : null}
        <button className="admin-button-primary" disabled={isPending} type="submit">
          {isPending ? "Actualizando…" : "Actualizar contraseña"}
        </button>
      </div>
    </form>
  );
}

function PasswordField({
  autoComplete,
  label,
  minLength,
  onChange,
  value,
}: {
  autoComplete: "current-password" | "new-password";
  label: string;
  minLength?: number;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="text-sm font-medium text-navy">
      {label}
      <input
        autoComplete={autoComplete}
        className={inputClass}
        maxLength={72}
        minLength={minLength}
        onChange={(event) => onChange(event.target.value)}
        required
        type="password"
        value={value}
      />
    </label>
  );
}
