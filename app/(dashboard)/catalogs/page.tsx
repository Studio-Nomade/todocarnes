import Link from "next/link";
import { CatalogCreateForm } from "@/components/catalogs/CatalogCreateForm";
import { ExportButton } from "@/components/catalogs/ExportButton";
import { listCatalogs } from "@/lib/catalogs/data";
import { catalogPeriod, catalogStatusLabels } from "@/lib/catalogs/format";
import { requireRole } from "@/lib/auth/requireRole";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  draft: "bg-amber-50 text-amber-700",
  exported: "bg-emerald-50 text-emerald-700",
  ready: "bg-blue-50 text-navy",
};

export default async function CatalogsPage() {
  await requireRole(["admin", "commercial"]);
  const catalogs = await listCatalogs();

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue">Catálogos mensuales</p>
        <h1 className="mt-2 text-3xl font-semibold text-navy">Catálogos</h1>
      </div>

      <CatalogCreateForm />

      {catalogs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink/20 bg-white px-6 py-16 text-center">
          <p className="font-medium text-navy">Todavía no hay catálogos.</p>
          <p className="mt-2 text-sm text-ink/55">Creá el primero con el formulario de arriba.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-ink/10 bg-white shadow-sm">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-ink/10 bg-gray-50 text-xs uppercase tracking-wide text-ink/55">
              <tr>
                <th className="px-4 py-3 font-medium">Título</th>
                <th className="px-4 py-3 font-medium">Período</th>
                <th className="px-4 py-3 font-medium">Productos</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Actualizado</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {catalogs.map((catalog) => (
                <tr className="align-middle hover:bg-blue-50/30" key={catalog.id}>
                  <td className="px-4 py-3">
                    <Link className="font-semibold text-navy hover:underline" href={`/catalogs/${catalog.id}`}>{catalog.title}</Link>
                  </td>
                  <td className="px-4 py-3 text-ink/70">{catalogPeriod(catalog.month, catalog.year)}</td>
                  <td className="px-4 py-3 text-ink/70">{catalog.itemCount}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[catalog.status]}`}>{catalogStatusLabels[catalog.status]}</span>
                  </td>
                  <td className="px-4 py-3 text-ink/55">{new Date(catalog.updatedAt).toLocaleDateString("es-CL")}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link className="text-xs font-semibold text-blue hover:underline" href={`/catalogs/${catalog.id}`}>Abrir</Link>
                      <ExportButton catalogId={catalog.id} disabled={catalog.itemCount === 0} label="Exportar" month={catalog.month} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
