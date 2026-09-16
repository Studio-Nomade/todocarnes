import Link from "next/link";
import { ProductFilters } from "@/components/products/ProductFilters";
import { ProductTable } from "@/components/products/ProductTable";
import { listProducts } from "@/lib/actions/products";

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const values = {
    brand: first(params.brand),
    category: first(params.category),
    cut: first(params.cut),
    q: first(params.q),
    status: first(params.status),
  };
  const result = await listProducts(values);

  return (
    <section>
      <div className="mb-7 flex flex-col items-start gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue">Base comercial</p>
          <h1 className="mt-2 text-3xl font-semibold text-navy">Productos</h1>
          <p className="mt-2 text-sm text-ink/60">{result.products.length} producto{result.products.length === 1 ? "" : "s"} en esta vista</p>
        </div>
        <Link className="admin-button-primary w-full py-3 shadow-sm sm:w-auto" href="/products/new">Nuevo producto</Link>
      </div>
      <ProductFilters brands={result.brands} categories={result.categories} cuts={result.cuts} values={values} />
      <div className="mt-5">
        <ProductTable products={result.products} />
      </div>
    </section>
  );
}
