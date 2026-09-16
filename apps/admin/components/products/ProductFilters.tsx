import Link from "next/link";
import type { ProductOptions } from "@/lib/products/types";

type ProductFiltersProps = ProductOptions & {
  values: {
    brand?: string;
    category?: string;
    cut?: string;
    q?: string;
    status?: string;
  };
};

const controlClass =
  "h-10 min-w-0 w-full rounded-lg border border-ink/15 bg-white px-3 text-sm text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/20";

export function ProductFilters({
  brands,
  categories,
  cuts,
  values,
}: ProductFiltersProps) {
  const availableCuts = values.category
    ? cuts.filter((cut) => cut.category_id === values.category)
    : [];

  return (
    <form className="grid gap-3 rounded-xl border border-ink/10 bg-white p-4 shadow-sm lg:grid-cols-[2fr_repeat(4,1fr)_auto]" method="get">
      <input aria-label="Buscar productos" className={controlClass} defaultValue={values.q} name="q" placeholder="Buscar por código o nombre" />
      <select aria-label="Categoría" className={controlClass} defaultValue={values.category} name="category">
        <option value="">Todas las categorías</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>{category.name}</option>
        ))}
      </select>
      <select aria-label="Corte" className={controlClass} defaultValue={values.cut} disabled={!values.category} name="cut">
        <option value="">Todos los cortes</option>
        {availableCuts.map((cut) => (
          <option key={cut.id} value={cut.id}>{cut.name}</option>
        ))}
      </select>
      <select aria-label="Marca" className={controlClass} defaultValue={values.brand} name="brand">
        <option value="">Todas las marcas</option>
        {brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
      </select>
      <select aria-label="Estado" className={controlClass} defaultValue={values.status} name="status">
        <option value="">Todos los estados</option>
        <option value="draft">Borrador</option>
        <option value="active">Activo</option>
        <option value="inactive">Inactivo</option>
      </select>
      <div className="flex items-center gap-3">
        <button className="admin-button-primary h-10 flex-1 px-4 lg:flex-none" type="submit">Filtrar</button>
        <Link className="admin-button-secondary h-10 px-4 text-xs" href="/products">Limpiar</Link>
      </div>
    </form>
  );
}
