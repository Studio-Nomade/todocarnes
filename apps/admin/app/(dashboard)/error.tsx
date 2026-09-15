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
      <button className="mt-5 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white" onClick={reset} type="button">
        Reintentar
      </button>
    </div>
  );
}
