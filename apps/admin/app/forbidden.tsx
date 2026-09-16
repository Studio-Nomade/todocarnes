import Link from "next/link";

export default function Forbidden() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 text-center">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue">Error 403</p>
        <h1 className="mt-3 text-4xl font-semibold text-navy">No tienes permiso para entrar aquí</h1>
        <p className="mt-4 text-ink/70">Tu sesión está activa, pero esta sección requiere rol de administrador.</p>
        <Link className="admin-button-primary mt-8 py-3" href="/dashboard">Volver al inicio</Link>
      </section>
    </main>
  );
}
