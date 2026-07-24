import type { GenerationHistoryItem } from "@/lib/settings/types";

const statusLabels = {
  completed: "Completada",
  failed: "Fallida",
  processing: "Procesando",
} as const;

const statusStyles = {
  completed: "bg-emerald-50 text-emerald-700",
  failed: "bg-red-50 text-red-700",
  processing: "bg-amber-50 text-amber-700",
} as const;

export function GenerationHistory({ items }: { items: GenerationHistoryItem[] }) {
  return (
    <section>
      <div className="mb-5">
        <h2 className="text-2xl font-semibold text-navy">Historial de generaciones</h2>
        <p className="mt-2 text-sm text-ink/60">
          Últimos 50 intentos, incluidos los fallidos.
        </p>
      </div>
      <div className="overflow-hidden rounded-xl border border-ink/10 bg-white shadow-sm">
        {items.length ? (
          <>
            <div className="divide-y divide-ink/10 lg:hidden">
              {items.map((item) => (
                <details className="group" key={item.id}>
                  <summary className="flex cursor-pointer list-none items-start gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-navy">{item.product}</p>
                      <p className="mt-1 text-xs text-ink/50">
                        {formatGenerationDate(item.createdAt)} · {item.slot}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${statusStyles[item.status]}`}>
                      {statusLabels[item.status]}
                    </span>
                    <span aria-hidden className="text-lg text-blue group-open:rotate-45">＋</span>
                  </summary>
                  <div className="space-y-3 border-t border-ink/10 bg-gray-50/70 p-4 text-sm">
                    <HistoryDetail label="Modelo" value={item.model} />
                    <HistoryDetail label="Usuario" value={item.createdBy} />
                    {item.error ? <p className="rounded-lg bg-red-50 p-3 text-red-700">{item.error}</p> : null}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Prompt</p>
                      <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-ink/60">{item.prompt}</p>
                    </div>
                  </div>
                </details>
              ))}
            </div>
            <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-ink/10 bg-gray-50 text-xs uppercase tracking-wide text-ink/50">
                <tr>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Producto</th>
                  <th className="px-4 py-3 font-semibold">Slot</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Modelo</th>
                  <th className="px-4 py-3 font-semibold">Usuario</th>
                  <th className="px-4 py-3 font-semibold">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {items.map((item) => (
                  <tr className="align-top" key={item.id}>
                    <td className="whitespace-nowrap px-4 py-4 text-ink/60">
                      {formatGenerationDate(item.createdAt)}
                    </td>
                    <td className="px-4 py-4 font-medium text-navy">{item.product}</td>
                    <td className="px-4 py-4 text-ink/65">{item.slot}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[item.status]}`}>
                        {statusLabels[item.status]}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-ink/65">{item.model}</td>
                    <td className="px-4 py-4 text-ink/65">{item.createdBy}</td>
                    <td className="max-w-sm px-4 py-4">
                      {item.error ? <p className="mb-2 text-sm text-red-700">{item.error}</p> : null}
                      <details>
                        <summary className="cursor-pointer text-xs font-semibold text-blue">Ver prompt</summary>
                        <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-ink/60">{item.prompt}</p>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        ) : (
          <p className="p-6 text-sm text-ink/60">Todavía no hay generaciones registradas.</p>
        )}
      </div>
    </section>
  );
}

function formatGenerationDate(value: string) {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Santiago",
  }).format(new Date(value));
}

function HistoryDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">{label}</p>
      <p className="mt-1 font-medium text-navy">{value}</p>
    </div>
  );
}
