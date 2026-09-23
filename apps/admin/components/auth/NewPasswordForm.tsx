"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { setRecoveredPassword } from "@/lib/actions/account";

export function NewPasswordForm() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await setRecoveredPassword({ newPassword, repeatPassword });
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    });
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={submit}>
      <PasswordInput label="Nueva contraseña" onChange={setNewPassword} value={newPassword} />
      <PasswordInput label="Repetir nueva contraseña" onChange={setRepeatPassword} value={repeatPassword} />
      {error ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p> : null}
      <button className="admin-button-primary w-full py-3" disabled={isPending} type="submit">
        {isPending ? "Actualizando…" : "Guardar nueva contraseña"}
      </button>
    </form>
  );
}

function PasswordInput({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block text-sm font-medium text-ink">
      {label}
      <input
        autoComplete="new-password"
        className="mt-2 w-full rounded-lg border border-ink/20 px-4 py-3 outline-none focus:border-blue"
        maxLength={72}
        minLength={8}
        onChange={(event) => onChange(event.target.value)}
        required
        type="password"
        value={value}
      />
    </label>
  );
}
