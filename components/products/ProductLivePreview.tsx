import { ProductPageTemplate } from "@/components/templates/ProductPageTemplate";
import type { CategoryOption, CutOption } from "@/lib/products/types";
import type { ProductImageRecord } from "@/lib/images/types";
import type { ProductInput } from "@/lib/validators/product";
import { ResponsiveCatalogFrame } from "@/components/templates/ResponsiveCatalogFrame";

type ProductLivePreviewProps = {
  categories: CategoryOption[];
  cuts: CutOption[];
  images: ProductImageRecord[];
  product: ProductInput;
};

const placeholder = "/placeholders/product-placeholder.svg";

export function ProductLivePreview({ categories, cuts, images, product }: ProductLivePreviewProps) {
  const category = categories.find((item) => item.id === product.category_id)?.name ?? "Cerdo";
  const cut = cuts.find((item) => item.id === product.cut_id)?.name ?? "";
  const categoryCuts = cuts
    .filter((item) => item.category_id === product.category_id)
    .map((item) => item.name);
  const approvedUrl = (slot: ProductImageRecord["slot"]) =>
    images.find((image) => image.slot === slot && image.status === "approved")?.url ?? placeholder;

  return (
    <aside className="lg:sticky lg:top-6 lg:self-start">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue">Vista previa</p>
          <p className="mt-1 text-sm text-ink/60">Así se verá en el catálogo.</p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-navy">En vivo</span>
      </div>
      <ResponsiveCatalogFrame maxScale={0.42}>
        <ProductPageTemplate
          product={{
            boxWeight: product.box_weight,
            brand: product.brand,
            category,
            code: product.code,
            cut,
            cuts: categoryCuts,
            eyebrow: product.eyebrow,
            format: product.format,
            mainImage: approvedUrl("main"),
            origin: product.origin,
            secondaryImages: [
              approvedUrl("secondary_1"),
              approvedUrl("secondary_2"),
              approvedUrl("secondary_3"),
            ],
            title: product.title,
            units: product.units,
          }}
          scale={1}
        />
      </ResponsiveCatalogFrame>
      <p className="mt-3 text-xs leading-5 text-ink/50">Las vistas aprobadas aparecen automáticamente en esta ficha.</p>
    </aside>
  );
}
