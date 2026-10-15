import { productTemplateFor } from "@/components/templates/productTemplateFor";
import type { CategoryOption, CutOption } from "@/lib/products/types";
import type { ProductImageRecord } from "@/lib/images/types";
import type { ProductInput } from "@/lib/validators/product";
import { ResponsiveCatalogFrame } from "@/components/templates/ResponsiveCatalogFrame";
import { isOfficial } from "@/lib/images/origin";

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
    images.find((image) => image.slot === slot && image.status === "approved")?.url;
  const secondaryImages = (["secondary_1", "secondary_2", "secondary_3"] as const)
    .map(approvedUrl)
    .filter((url): url is string => Boolean(url));
  const ProductTemplate = productTemplateFor(category);

  return (
    <aside className="lg:sticky lg:top-6 lg:self-start">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue">Vista previa</p>
          <p className="mt-1 text-sm text-ink/60">Así se verá en el catálogo.</p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-navy">En vivo</span>
      </div>
      <div className="relative">
        {!isOfficial(images) ? <span className="absolute right-3 top-3 z-10 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900 shadow-sm">Foto no oficial</span> : null}
        <ResponsiveCatalogFrame maxScale={0.42}>
          <ProductTemplate
          product={{
            availableSoon: product.available_soon,
            boxWeight: product.box_weight,
            brand: product.brand,
            category,
            code: product.code,
            cut,
            cuts: categoryCuts,
            eyebrow: product.eyebrow,
            format: product.format,
            mainImage: approvedUrl("main") ?? placeholder,
            origin: product.origin,
            secondaryImages,
            title: product.title,
            units: product.units,
            uses: product.uses,
          }}
          scale={1}
          />
        </ResponsiveCatalogFrame>
      </div>
      <p className="mt-3 text-xs leading-5 text-ink/50">Las vistas aprobadas aparecen automáticamente en esta ficha.</p>
    </aside>
  );
}
