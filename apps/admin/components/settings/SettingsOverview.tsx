import type { DailyGenerationUsage } from "@/lib/images/daily-limit";

export function SettingsOverview({
  connected,
  usage,
}: {
  connected: boolean;
  usage: DailyGenerationUsage;
}) {
  const percentage = Math.min(100, Math.round((usage.count / usage.limit) * 100));

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <article className="rounded-xl border border-ink/10 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/45">OpenAI</p>
        <div className="mt-3 flex items-center gap-3">
          <span
            aria-hidden="true"
            className={`h-3 w-3 rounded-full ${connected ? "bg-emerald-500" : "bg-red-500"}`}
          />
          <p className="text-xl font-semibold text-navy">
            {connected ? "Conectado" : "No conectado"}
          </p>
        </div>
        <p className="mt-3 text-sm leading-6 text-ink/60">
          La credencial se administra únicamente en el entorno seguro del servidor.
        </p>
      </article>

      <article className="rounded-xl border border-ink/10 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/45">Uso de hoy</p>
        <p className="mt-3 text-xl font-semibold text-navy">
          {usage.count} de {usage.limit} generaciones
        </p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-blue" style={{ width: `${percentage}%` }} />
        </div>
        <p className="mt-3 text-sm text-ink/60">
          El tope se valida en el servidor antes de contactar a OpenAI.
        </p>
      </article>
    </div>
  );
}
