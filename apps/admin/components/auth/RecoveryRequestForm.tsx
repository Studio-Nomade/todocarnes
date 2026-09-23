"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

const genericMessage = "Si el correo existe, te enviamos las instrucciones para restablecer tu contraseña.";

export function RecoveryRequestForm({ appUrl }: { appUrl: string }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [configurationWarning, setConfigurationWarning] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setConfigurationWarning(false);
    setLoading(true);

    try {
      const supabase = createClient();
      const baseUrl = appUrl.replace(/\/$/, "") || window.location.origin;
      const result = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${baseUrl}/auth/confirm?next=/nueva-clave`,
      });
      setConfigurationWarning(Boolean(result.error));
    } catch {
      setConfigurationWarning(true);
    } finally {
      setMessage(genericMessage);
      setLoading(false);
    }
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={submit}>
      <label className="block text-sm font-medium text-ink">
        Correo
        <input
          autoComplete="email"
          className="mt-2 w-full rounded-lg border border-ink/20 px-4 py-3 outline-none focus:border-blue"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </label>
      {message ? (
        <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm leading-6 text-navy" role="status">
          <p>{message}</p>
          {configurationWarning ? <p className="mt-2">Si no recibes el correo, contacta a un administrador para restablecer tu acceso.</p> : null}
        </div>
      ) : null}
      <button className="admin-button-primary w-full py-3" disabled={loading} type="submit">
        {loading ? "Enviando…" : "Enviar instrucciones"}
      </button>
    </form>
  );
}
