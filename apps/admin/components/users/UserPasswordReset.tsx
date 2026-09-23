"use client";

import { useState, useTransition, type FormEvent } from "react";
import { resetUserPassword } from "@/lib/actions/users";

export function UserPasswordReset({
  onError,
  onSuccess,
  userId,
  userName,
}: {
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  userId: string;
  userName: string;
}) {
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await resetUserPassword(userId, password);
      if (!result.success) {
        onError(result.error);
        return;
      }
      setPassword("");
      onSuccess(`Se restableció la contraseña de ${userName}. Deberá cambiarla al ingresar.`);
    });
  }

  return (
    <details className="mt-3 rounded-lg border border-ink/10 bg-white px-4 py-3">
      <summary className="cursor-pointer text-sm font-semibold text-navy">Restablecer contraseña</summary>
      <form className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={submit}>
        <label className="min-w-0 flex-1 text-sm font-medium text-navy">
          Nueva contraseña temporal
          <input
            autoComplete="new-password"
            className="mt-1.5 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-blue focus:ring-2 focus:ring-blue/20"
            disabled={isPending}
            maxLength={72}
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
        <button className="admin-button-primary shrink-0" disabled={isPending} type="submit">
          {isPending ? "Restableciendo…" : "Confirmar restablecimiento"}
        </button>
      </form>
    </details>
  );
}
