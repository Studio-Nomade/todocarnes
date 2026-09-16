"use client";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center">
      <h1 className="text-xl font-semibold text-navy">No pudimos cargar esta pantalla</h1>
      <p className="mt-2 text-sm text-ink/65">La información está a salvo. Intenta nuevamente en unos segundos.</p>
      <button className="admin-button-primary mt-5 px-4 py-2" onClick={reset} type="button">
        Reintentar
      </button>
    </div>
  );
}
