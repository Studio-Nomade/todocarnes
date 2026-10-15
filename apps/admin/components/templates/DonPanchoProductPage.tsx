import { PRODUCT_USE_LABELS } from "@/lib/products/uses";
import { ProductPageTemplate, type ProductPageTemplateProps } from "./ProductPageTemplate";

/**
 * Punto de enchufe de la lámina definitiva de Don Pancho.
 * Conserva el contrato estándar completo y suma `product.uses` para que el cuerpo
 * pueda reemplazarse sin cambiar loaders, preview ni exportación.
 */
export function DonPanchoProductPage(props: ProductPageTemplateProps) {
  const labels = props.product.uses.map((use) => PRODUCT_USE_LABELS[use]);
  return (
    <ProductPageTemplate
      {...props}
      overlay={labels.length > 0 ? (
        <p className="absolute left-11 top-[158px] z-10 w-[380px] truncate text-[12px] font-medium uppercase tracking-[0.08em] text-ink/60">
          Usos sugeridos: {labels.join(" · ")}
        </p>
      ) : null}
    />
  );
}
