import Link from "next/link";
import { ProductEditor } from "@/components/products/ProductEditor";
import { listProducts } from "@/lib/actions/products";
import type { ProductInput } from "@/lib/validators/product";

const emptyProduct: ProductInput = {
  box_weight: "",
  brand: "",
  category_id: "",
  code: "",
  cut_id: "",
  eyebrow: "",
  format: "",
  month_tag: "",
  notes: "",
  origin: "",
  status: "draft",
  title: "",
  units: "",
};

export default async function NewProductPage() {
  const options = await listProducts({});

  return (
    <section>
      <Link className="text-sm font-medium text-ink/55 hover:text-navy" href="/products">← Volver a productos</Link>
      <div className="mb-7 mt-4">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue">Nueva ficha</p>
        <h1 className="mt-2 text-3xl font-semibold text-navy">Crear producto</h1>
      </div>
      <ProductEditor
        brands={options.brands}
        categories={options.categories}
        cuts={options.cuts}
        initialProduct={emptyProduct}
      />
    </section>
  );
}
