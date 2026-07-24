import Link from "next/link";
import { ProductPriceTrend } from "@/components/dashboard/ProductPriceTrend";
import { getDashboardData } from "@/lib/dashboard/data";

const mockCategories = [
  ["Cerdo", 18],
  ["Pollo", 12],
  ["Vacuno", 24],
  ["Trimming", 6],
] as const;

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <section className="space-y-9">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue">Panel principal</p>
          <h1 className="mt-2 text-2xl font-semibold text-navy sm:text-3xl">Creador de catálogo</h1>
          <p className="mt-3 max-w-2xl leading-7 text-ink/70">
            Gestioná la base comercial, completá las imágenes y publicá el próximo catálogo.
          </p>
        </div>
        <div className="grid w-full grid-cols-2 gap-3 sm:w-auto">
          <Link className="rounded-lg border border-navy/20 bg-white px-4 py-2.5 text-center text-sm font-semibold text-navy hover:bg-blue-50" href="/products/new">Crear producto</Link>
          <Link className="rounded-lg bg-navy px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-navy/90" href="/catalogs">Crear catálogo</Link>
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">Datos reales de la plataforma</p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Productos activos" value={data.activeProducts} />
          <Metric label="Pendientes de 4 imágenes" value={data.missingImages} warning />
          <Metric label="Catálogos creados" value={data.catalogCount} />
          <Metric label="Catálogos publicados" value={data.exportedCatalogs} />
        </div>
      </div>

      <ProductPriceTrend />

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-xl border border-ink/10 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="font-semibold text-navy">Últimas generaciones de imágenes</h2>
          {data.generations.length ? (
            <ul className="mt-4 divide-y divide-ink/10">
              {data.generations.map((generation) => (
                <li className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm" key={generation.id}>
                  <div>
                    <p className="font-medium text-navy">{generation.product}</p>
                    <p className="mt-1 text-xs text-ink/50">{generation.slot} · {new Date(generation.createdAt).toLocaleDateString("es-CL")}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${generation.status === "completed" ? "bg-emerald-50 text-emerald-700" : generation.status === "failed" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue"}`}>
                    {generation.status === "completed" ? "Completada" : generation.status === "failed" ? "Fallida" : "Procesando"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-5 rounded-lg border border-dashed border-ink/20 px-5 py-8 text-center text-sm text-ink/60">
              Todavía no hay generaciones. Abrí un producto para crear la primera.
            </div>
          )}
        </div>

        <div className="rounded-xl border border-dashed border-blue/35 bg-blue-50/60 p-4 sm:p-6">
          <PotentialLabel />
          <h2 className="mt-3 font-semibold text-navy">Productos por categoría</h2>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {mockCategories.map(([category, count]) => (
              <div className="rounded-lg bg-white p-4" key={category}>
                <p className="text-xs text-ink/55">{category}</p>
                <p className="mt-1 text-2xl font-semibold text-navy">{count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-blue/35 bg-blue-50/60 p-4 sm:p-6">
        <PotentialLabel />
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <MockMetric label="Ventas por categoría" value="Vacuno 42%" detail="+8% vs. mes anterior" />
          <MockMetric label="Rotación de inventario" value="18 días" detail="Objetivo: 21 días" />
          <MockMetric label="Producto más pedido" value="Pechuga IQF" detail="126 pedidos este mes" />
        </div>
      </div>
    </section>
  );
}

function Metric({ detail, label, value, warning = false }: { detail?: string; label: string; value: number; warning?: boolean }) {
  return (
    <div className="rounded-xl border border-ink/10 bg-white p-5 shadow-sm">
      <p className="text-sm text-ink/60">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${warning && value ? "text-amber-700" : "text-navy"}`}>{value}</p>
      {detail ? <p className="mt-1 text-xs text-ink/45">{detail}</p> : null}
    </div>
  );
}

function PotentialLabel() {
  return <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue">Funcionalidad adicional — se puede integrar a la intranet</p>;
}

function MockMetric({ detail, label, value }: { detail: string; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white p-5">
      <p className="text-sm text-ink/55">{label}</p>
      <p className="mt-2 text-xl font-semibold text-navy">{value}</p>
      <p className="mt-1 text-xs text-emerald-700">{detail}</p>
    </div>
  );
}
