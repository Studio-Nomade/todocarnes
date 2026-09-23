import Link from "next/link";
import { CourtesyFilters } from "@/components/courtesy/CourtesyFilters";
import { requireRole } from "@/lib/auth/requireRole";
import { COURTESY_STATUS_LABELS } from "@/lib/courtesy/constants";
import { listCourtesyRequests } from "@/lib/courtesy/data";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function pageHref(params: Record<string, string | string[] | undefined>, page: number): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => { if (typeof value === "string" && key !== "page") query.set(key, value); });
  query.set("page", String(page));
  return `/cortesias?${query.toString()}`;
}

const dateFormatter = new Intl.DateTimeFormat("es-CL", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Santiago",
});

export default async function CourtesyRequestsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireRole(["admin", "commercial"]);
  const params = await searchParams;
  const result = await listCourtesyRequests(params);

  return (
    <section className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue">Comercial</p>
          <h1 className="mt-2 text-3xl font-semibold text-navy">Entradas de cortesía</h1>
          <p className="mt-2 text-sm text-ink/60">Solicitudes recibidas desde la agenda Food Service. Este listado es independiente de Leads.</p>
        </div>
        <a className="admin-button-primary" href="/api/courtesy-requests/export">Exportar CSV</a>
      </header>

      <CourtesyFilters filters={result.filters} />

      <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4 text-sm">
          <span className="font-semibold text-navy">{result.total} solicitudes</span>
          <span className="text-ink/55">Página {result.page} de {result.pageCount}</span>
        </div>
        {result.items.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-ink/55">
                <tr>
                  <th className="px-5 py-3">Solicitante</th>
                  <th className="px-5 py-3">Empresa</th>
                  <th className="px-5 py-3">Contacto</th>
                  <th className="px-5 py-3">Evento</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {result.items.map((request) => (
                  <tr className="align-top hover:bg-gray-50" key={request.id}>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-navy">{request.name} {request.lastName}</span>
                      <span className="mt-1 block text-xs text-ink/55">RUT {request.rut}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-ink">{request.company}</span>
                      <span className="mt-1 block text-xs text-ink/55">{request.cargo}</span>
                    </td>
                    <td className="px-5 py-4">
                      <a className="block text-navy underline-offset-4 hover:underline" href={`mailto:${request.email}`}>{request.email}</a>
                      <a className="mt-1 block text-xs text-ink/60 underline-offset-4 hover:underline" href={`tel:${request.phone}`}>{request.phone}</a>
                    </td>
                    <td className="px-5 py-4 text-ink/75">{request.eventName}</td>
                    <td className="px-5 py-4"><span className="rounded-full bg-blue/15 px-3 py-1 text-xs font-semibold text-navy">{COURTESY_STATUS_LABELS[request.status]}</span></td>
                    <td className="px-5 py-4 text-ink/65">{dateFormatter.format(new Date(request.createdAt))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="px-5 py-12 text-center text-sm text-ink/55">No hay solicitudes para estos filtros.</p>}
      </div>

      <nav aria-label="Paginación" className="flex justify-end gap-3">
        {result.page > 1 ? <Link className="admin-button-secondary px-4 py-2" href={pageHref(params, result.page - 1)}>Anterior</Link> : null}
        {result.page < result.pageCount ? <Link className="admin-button-secondary px-4 py-2" href={pageHref(params, result.page + 1)}>Siguiente</Link> : null}
      </nav>
    </section>
  );
}
