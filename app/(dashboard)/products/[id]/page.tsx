import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductEditor } from "@/components/products/ProductEditor";
import { getProduct, listProducts } from "@/lib/actions/products";
import type { ProductInput } from "@/lib/validators/product";

export const maxDuration = 120;

type ProductPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
};

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const { id } = await params;
  const [product, options, query] = await Promise.all([
    getProduct(id),
    listProducts({}),
    searchParams,
  ]);
  if (!product) {
    notFound();
  }

  const initialProduct: ProductInput = {
    box_weight: product.box_weight,
    brand: product.brand,
    category_id: product.category_id,
    code: product.code,
    cut_id: product.cut_id,
    eyebrow: product.eyebrow,
    format: product.format,
    month_tag: product.month_tag,
    notes: product.notes,
    origin: product.origin,
    status: product.status,
    title: product.title,
    units: product.units,
  };

  return (
    <section>
      <Link className="text-sm font-medium text-ink/55 hover:text-navy" href="/products">← Volver a productos</Link>
      <div className="mb-7 mt-4 flex items-end justify-between gap-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue">Editar ficha</p>
          <h1 className="mt-2 text-3xl font-semibold text-navy">{product.title}</h1>
        </div>
        {query.saved ? <p className="rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">Cambios guardados</p> : null}
      </div>
      <ProductEditor
        brands={options.brands}
        categories={options.categories}
        cuts={options.cuts}
        images={product.images}
        initialProduct={initialProduct}
        productId={product.id}
      />
    </section>
  );
}
