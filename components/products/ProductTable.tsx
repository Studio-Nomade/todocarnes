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
    <div className="overflow-x-auto rounded-xl border border-ink/10 bg-white shadow-sm">
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
  );
}
