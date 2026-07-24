"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  approveImage,
  generateProductImage,
  rejectImage,
  uploadManualImage,
} from "@/lib/actions/images";
import type { ImageSlot } from "@/lib/images/slots";
import type { ProductImageRecord } from "@/lib/images/types";

const statusLabels = {
  approved: "Aprobada",
  pending: "Pendiente",
  rejected: "Rechazada",
} as const;

const statusStyles = {
  approved: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  rejected: "bg-gray-100 text-ink/55",
} as const;

export function ImageSlotCard({
  images,
  label,
  productId,
  slot,
  sourceAvailable,
}: {
  images: ProductImageRecord[];
  label: string;
  productId: string;
  slot: ImageSlot;
  sourceAvailable: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pendingMessage, setPendingMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const approved = images.find((image) => image.status === "approved");
  const candidate = images.find((image) => image.status === "pending");
  const displayed = candidate ?? approved ?? images[0];

  function run(
    action: () => Promise<{ error?: string; success: boolean }>,
    message: string,
  ) {
    setError("");
    setPendingMessage(message);
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setError(result.error ?? "No se pudo completar la acción.");
        return;
      }
      router.refresh();
    });
  }

  function upload(file: File) {
    const formData = new FormData();
    formData.set("file", file);
    run(() => uploadManualImage(productId, slot, formData), "Subiendo imagen…");
  }

  return (
    <article className="overflow-hidden rounded-xl border border-ink/10 bg-white shadow-sm" data-testid={`slot-${slot}`}>
      <div className="relative aspect-[3/2] bg-gray-50">
        {displayed ? (
          <Image alt={label} className="object-cover" fill sizes="(max-width: 768px) 100vw, 300px" src={displayed.url} />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink/40">Sin imagen</div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-navy">{label}</h3>
            {displayed ? <p className="mt-1 text-xs text-ink/45">{displayed.generated_by_ai ? "Generada" : "Carga manual"}</p> : null}
          </div>
          {displayed ? (
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[displayed.status]}`}>{statusLabels[displayed.status]}</span>
          ) : null}
        </div>

        {candidate && approved ? <p className="mt-3 text-xs text-ink/50">La imagen aprobada actual se mantiene hasta que apruebes esta candidata.</p> : null}
        {isPending ? <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-navy">{pendingMessage}</p> : null}
        {error ? <p className="mt-3 text-sm font-medium text-red-700" role="alert">{error}</p> : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className="rounded-lg bg-navy px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!sourceAvailable || isPending}
            onClick={() => run(() => generateProductImage(productId, slot), "Generando, ~1 min…")}
            title={sourceAvailable ? "Generar una nueva vista" : "Subí una imagen fuente antes de generar"}
            type="button"
          >
            {displayed ? "Regenerar" : "Generar"}
          </button>
          <label className="cursor-pointer rounded-lg border border-ink/15 px-3 py-2 text-xs font-semibold text-navy hover:bg-gray-50">
            Subir manual
            <input
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              data-testid={`upload-${slot}`}
              disabled={isPending}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) upload(file);
                event.target.value = "";
              }}
              type="file"
            />
          </label>
          {displayed?.status === "pending" ? (
            <button className="rounded-lg px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50" disabled={isPending} onClick={() => run(() => approveImage(displayed.id), "Aprobando imagen…")} type="button">Aprobar</button>
          ) : null}
          {displayed && displayed.status !== "rejected" ? (
            <button className="rounded-lg px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50" disabled={isPending} onClick={() => run(() => rejectImage(displayed.id), "Rechazando imagen…")} type="button">Rechazar</button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
