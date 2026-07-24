import { imageSlots } from "@/lib/images/slots";
import type { ProductImageRecord } from "@/lib/images/types";
import { ImageSlotCard } from "./ImageSlotCard";
import { SourceImagePanel } from "./SourceImagePanel";

const slotLabels = {
  main: "Principal",
  secondary_1: "Secundaria 1 · Empaque",
  secondary_2: "Secundaria 2 · Ángulo",
  secondary_3: "Secundaria 3 · Caja",
} as const;

export function ProductImageGallery({
  images,
  productId,
}: {
  images: ProductImageRecord[];
  productId: string;
}) {
  const source = images.find((image) => image.slot === "source" && image.status === "approved");

  return (
    <section className="mt-10 border-t border-ink/10 pt-9">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue">Imágenes de catálogo</p>
        <h2 className="mt-2 text-2xl font-semibold text-navy">Galería de vistas</h2>
        <p className="mt-2 text-sm text-ink/60">Generá, reemplazá y aprobá cada vista de forma independiente.</p>
      </div>
      <SourceImagePanel image={source} productId={productId} />
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {imageSlots.map((slot) => (
          <ImageSlotCard
            images={images.filter((image) => image.slot === slot)}
            key={slot}
            label={slotLabels[slot]}
            productId={productId}
            slot={slot}
            sourceAvailable={Boolean(source)}
          />
        ))}
      </div>
    </section>
  );
}
