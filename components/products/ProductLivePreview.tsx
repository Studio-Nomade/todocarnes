import { ProductPageTemplate } from "@/components/templates/ProductPageTemplate";
import type { CategoryOption, CutOption } from "@/lib/products/types";
import type { ProductInput } from "@/lib/validators/product";

type ProductLivePreviewProps = {
  categories: CategoryOption[];
  cuts: CutOption[];
  product: ProductInput;
};

const placeholder = "/placeholders/product-placeholder.svg";

export function ProductLivePreview({ categories, cuts, product }: ProductLivePreviewProps) {
  const category = categories.find((item) => item.id === product.category_id)?.name ?? "Cerdo";
  const cut = cuts.find((item) => item.id === product.cut_id)?.name ?? "";

  return (
    <aside className="lg:sticky lg:top-6 lg:self-start">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue">Vista previa</p>
          <p className="mt-1 text-sm text-ink/60">Así se verá en el catálogo.</p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-navy">En vivo</span>
      </div>
      <div className="overflow-hidden rounded-xl border border-ink/10 bg-white shadow-sm">
        <div className="h-[340px] w-[605px] origin-top-left">
          <ProductPageTemplate
            product={{
              boxWeight: product.box_weight,
              brand: product.brand,
              category,
              code: product.code,
              cut,
              eyebrow: product.eyebrow,
              format: product.format,
              mainImage: placeholder,
              origin: product.origin,
              secondaryImages: [placeholder, placeholder, placeholder],
              title: product.title,
              units: product.units,
            }}
            scale={0.42}
          />
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-ink/50">
        Las imágenes son temporales. La carga y generación se habilitan en el próximo hito.
      </p>
    </aside>
  );
}
