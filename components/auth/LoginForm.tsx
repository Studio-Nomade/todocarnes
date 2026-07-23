"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const supabase = createClient();
      const result = await supabase.auth.signInWithPassword({ email, password });

      if (result.error) {
        setError("Correo o contraseña incorrectos.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("No fue posible conectar con el servicio de acceso.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
      <label className="block text-sm font-medium text-ink">
        Correo
        <input autoComplete="email" className="mt-2 w-full rounded-lg border border-ink/20 px-4 py-3 outline-none focus:border-blue" name="email" required type="email" />
      </label>
      <label className="block text-sm font-medium text-ink">
        Contraseña
        <input autoComplete="current-password" className="mt-2 w-full rounded-lg border border-ink/20 px-4 py-3 outline-none focus:border-blue" minLength={6} name="password" required type="password" />
      </label>
      {error ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      <button className="w-full rounded-lg bg-navy px-4 py-3 font-semibold text-white disabled:opacity-60" disabled={loading} type="submit">
        {loading ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
