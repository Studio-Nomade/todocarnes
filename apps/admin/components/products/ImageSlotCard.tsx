"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { approveImage, generateProductImage, moveImageToSlot, rejectImage, uploadManualImage } from "@/lib/actions/images";
import { allImageSlots, type ImageSlot, type ProductImageSlot } from "@/lib/images/slots";
import type { ProductImageRecord } from "@/lib/images/types";

const statusLabels = { approved: "Aprobada", pending: "Pendiente", rejected: "Rechazada" } as const;
const statusStyles = {
  approved: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  rejected: "bg-gray-100 text-ink/55",
} as const;
const sourceLabels = { ai: "IA", catalog_pdf: "Catálogo PDF", session: "Sesión", upload: "Manual" } as const;
const sourceStyles = {
  ai: "bg-violet-50 text-violet-700",
  catalog_pdf: "bg-amber-50 text-amber-800",
  session: "bg-blue-50 text-blue-700",
  upload: "bg-gray-100 text-ink/60",
} as const;
const slotLabels: Record<ProductImageSlot, string> = {
  main: "Principal",
  secondary_1: "Secundaria 1",
  secondary_2: "Secundaria 2",
  secondary_3: "Secundaria 3",
  source: "Fuente",
};
const statusOrder = { approved: 0, pending: 1, rejected: 2 } as const;

function sortedImages(images: ProductImageRecord[]): ProductImageRecord[] {
  return [...images].sort((left, right) =>
    statusOrder[left.status] - statusOrder[right.status]
    || left.sort_order - right.sort_order
    || left.created_at.localeCompare(right.created_at));
}

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
  const ordered = sortedImages(images);
  const [activeId, setActiveId] = useState(ordered[0]?.id ?? "");
  const [error, setError] = useState("");
  const [pendingMessage, setPendingMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const displayed = ordered.find((image) => image.id === activeId) ?? ordered[0];
  const approved = ordered.find((image) => image.status === "approved");

  function run(action: () => Promise<{ error?: string; success: boolean }>, message: string) {
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
    <article className="min-w-0 overflow-hidden rounded-xl border border-ink/10 bg-white shadow-sm" data-testid={`slot-${slot}`}>
      <div className="relative aspect-[3/2] bg-gray-50">
        {displayed ? <Image alt={label} className="object-cover" fill sizes="(max-width: 768px) 100vw, 300px" src={displayed.url} />
          : <div className="flex h-full items-center justify-center text-sm text-ink/40">Sin imagen</div>}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-navy">{label}</h3>
            {displayed ? <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${sourceStyles[displayed.source_kind]}`}>{sourceLabels[displayed.source_kind]}</span> : null}
          </div>
          {displayed ? <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[displayed.status]}`}>{statusLabels[displayed.status]}</span> : null}
        </div>

        {ordered.length > 0 ? (
          <div className="mt-4 flex max-w-full gap-2 overflow-x-auto pb-2" aria-label={`Candidatas para ${label}`}>
            {ordered.map((image) => (
              <button
                aria-label={`Ver ${sourceLabels[image.source_kind]} ${statusLabels[image.status]}`}
                aria-pressed={displayed?.id === image.id}
                className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-gray-50 ${displayed?.id === image.id ? "border-blue" : "border-transparent hover:border-blue/30"}`}
                key={image.id}
                onClick={() => setActiveId(image.id)}
                type="button"
              >
                <Image alt="" className="object-cover" fill sizes="80px" src={image.url} />
                <span className={`absolute bottom-1 left-1 rounded px-1.5 py-0.5 text-[9px] font-bold ${sourceStyles[image.source_kind]}`}>{sourceLabels[image.source_kind]}</span>
              </button>
            ))}
          </div>
        ) : null}

        {displayed?.status === "pending" && approved ? <p className="mt-2 text-xs text-ink/50">La aprobada actual se mantiene hasta que apruebes esta candidata.</p> : null}
        {isPending ? <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-navy">{pendingMessage}</p> : null}
        {error ? <p className="mt-3 text-sm font-medium text-red-700" role="alert">{error}</p> : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <button className="admin-button-primary px-3 py-2 text-xs" disabled={!sourceAvailable || isPending} onClick={() => run(() => generateProductImage(productId, slot), "Generando, ~1 min…")} title={sourceAvailable ? "Generar una nueva vista" : "Sube una imagen fuente antes de generar"} type="button">
            {displayed ? "Regenerar" : "Generar"}
          </button>
          <label className="admin-button-secondary cursor-pointer px-3 py-2 text-xs">
            Subir manual
            <input accept="image/jpeg,image/png,image/webp" className="sr-only" data-testid={`upload-${slot}`} disabled={isPending} onChange={(event) => { const file = event.target.files?.[0]; if (file) upload(file); event.target.value = ""; }} type="file" />
          </label>
          {displayed && displayed.status !== "approved" ? <button className="rounded-lg px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50" disabled={isPending} onClick={() => run(() => approveImage(displayed.id), "Aprobando imagen…")} type="button">Aprobar</button> : null}
          {displayed && displayed.status !== "rejected" ? <button className="rounded-lg px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50" disabled={isPending} onClick={() => run(() => rejectImage(displayed.id), "Rechazando imagen…")} type="button">Rechazar</button> : null}
          {displayed ? (
            <label className="admin-button-secondary flex items-center gap-2 px-3 py-2 text-xs">
              <span>Mover a…</span>
              <select className="bg-transparent font-semibold outline-none" disabled={isPending} onChange={(event) => run(() => moveImageToSlot(displayed.id, event.target.value), "Moviendo imagen…")} value={displayed.slot}>
                {allImageSlots.map((target) => <option key={target} value={target}>{slotLabels[target]}</option>)}
              </select>
            </label>
          ) : null}
        </div>
      </div>
    </article>
  );
}
