"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { uploadSourceImage } from "@/lib/actions/images";
import type { ProductImageRecord } from "@/lib/images/types";

export function SourceImagePanel({
  image,
  productId,
}: {
  image?: ProductImageRecord;
  productId: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function upload(file: File) {
    const formData = new FormData();
    formData.set("file", file);
    setError("");
    startTransition(async () => {
      const result = await uploadSourceImage(productId, formData);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="grid gap-5 rounded-xl border border-blue/30 bg-blue-50/40 p-5 md:grid-cols-[220px_1fr]">
      <div className="relative aspect-[3/2] overflow-hidden rounded-lg border border-ink/10 bg-white">
        {image ? (
          <Image alt="Imagen fuente aprobada" className="object-cover" fill sizes="220px" src={image.url} />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-ink/45">Sin imagen fuente</div>
        )}
      </div>
      <div className="self-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue">Imagen fuente</p>
        <h3 className="mt-1 text-lg font-semibold text-navy">Referencia del producto</h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/60">
          Subí una foto clara del producto. Es la referencia obligatoria para generar las cuatro vistas sin inventar el corte ni el empaque.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <label className="cursor-pointer rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy/90">
            {isPending ? "Subiendo…" : image ? "Reemplazar fuente" : "Subir imagen fuente"}
            <input
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              data-testid="source-upload"
              disabled={isPending}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) upload(file);
                event.target.value = "";
              }}
              type="file"
            />
          </label>
          <span className="text-xs text-ink/45">JPG, PNG o WebP · máximo 10 MB</span>
        </div>
        {error ? <p className="mt-3 text-sm font-medium text-red-700" role="alert">{error}</p> : null}
      </div>
    </div>
  );
}
