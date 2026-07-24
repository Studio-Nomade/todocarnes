import Image from "next/image";
import Link from "next/link";
import type { ProductRecord } from "@/lib/products/types";
import { ProductActions } from "./ProductActions";

const statusLabels = {
  active: "Activo",
  draft: "Borrador",
  inactive: "Inactivo",
} as const;

const statusStyles = {
  active: "bg-emerald-50 text-emerald-700",
  draft: "bg-amber-50 text-amber-700",
  inactive: "bg-gray-100 text-ink/55",
} as const;

export function ProductTable({ products }: { products: ProductRecord[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-ink/20 bg-white px-6 py-16 text-center">
        <p className="font-medium text-navy">No encontramos productos con esos filtros.</p>
        <p className="mt-2 text-sm text-ink/55">Probá limpiando la búsqueda o creando uno nuevo.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-ink/10 bg-white shadow-sm">
      <div className="divide-y divide-ink/10 xl:hidden">
        {products.map((product) => (
          <details className="group" key={product.id}>
            <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
              <Image
                alt=""
                className="h-14 w-16 shrink-0 rounded-md object-cover"
                height={70}
                src={product.mainImageUrl ?? "/placeholders/product-placeholder.svg"}
                width={120}
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-navy">{product.title}</p>
                <p className="mt-1 text-xs text-ink/55">{product.category.name} · {product.cut.name}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${statusStyles[product.status]}`}>
                {statusLabels[product.status]}
              </span>
              <span aria-hidden className="text-lg text-blue group-open:rotate-45">＋</span>
            </summary>
            <div className="border-t border-ink/10 bg-gray-50/70 p-4">
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <ProductDetail label="Código" value={product.code || "—"} />
                <ProductDetail label="Marca" value={product.brand || "—"} />
                <ProductDetail label="Categoría" value={product.category.name} />
                <ProductDetail label="Corte" value={product.cut.name} />
              </dl>
              <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-ink/10 pt-4">
                <Link className="text-sm font-semibold text-blue hover:underline" href={`/products/${product.id}`}>Editar ficha</Link>
                <ProductActions id={product.id} inactive={product.status === "inactive"} />
              </div>
            </div>
          </details>
        ))}
      </div>
      <div className="hidden overflow-x-auto xl:block">
        <table className="w-full min-w-[1040px] text-left text-sm">
        <thead className="border-b border-ink/10 bg-gray-50 text-xs uppercase tracking-wide text-ink/55">
          <tr>
            <th className="px-4 py-3 font-medium">Imagen</th>
            <th className="px-4 py-3 font-medium">Código</th>
            <th className="px-4 py-3 font-medium">Nombre</th>
            <th className="px-4 py-3 font-medium">Categoría</th>
            <th className="px-4 py-3 font-medium">Corte</th>
            <th className="px-4 py-3 font-medium">Marca</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {products.map((product) => (
            <tr className="align-middle hover:bg-blue-50/30" key={product.id}>
              <td className="px-4 py-3">
                <Image
                  alt=""
                  className="h-12 w-16 rounded-md object-cover"
                  height={70}
                  src={product.mainImageUrl ?? "/placeholders/product-placeholder.svg"}
                  width={120}
                />
              </td>
              <td className="max-w-28 whitespace-pre-line px-4 py-3 font-mono text-xs text-ink/70">{product.code || "—"}</td>
              <td className="max-w-64 px-4 py-3">
                <Link className="font-semibold text-navy hover:underline" href={`/products/${product.id}`}>{product.title}</Link>
              </td>
              <td className="px-4 py-3">{product.category.name}</td>
              <td className="px-4 py-3">{product.cut.name}</td>
              <td className="px-4 py-3">{product.brand || "—"}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[product.status]}`}>{statusLabels[product.status]}</span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Link className="text-xs font-semibold text-blue hover:underline" href={`/products/${product.id}`}>Editar</Link>
                  <ProductActions id={product.id} inactive={product.status === "inactive"} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-ink/45">{label}</dt>
      <dd className="mt-1 whitespace-pre-line font-medium text-navy">{value}</dd>
    </div>
  );
}
