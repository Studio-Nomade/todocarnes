"use client";

import { useState } from "react";

const statusLabels: Record<string, string> = {
  draft: "Borrador",
  exported: "Exportado",
  ready: "Listo",
};

export function ExportButton({
  catalogId,
  disabled,
  label = "Exportar PDF",
}: {
  catalogId: string;
  disabled?: boolean;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function exportPdf() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/catalogs/${catalogId}/export`, { method: "POST" });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "No se pudo exportar el catálogo.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `catalogo-${catalogId}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo exportar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-45"
        disabled={busy || disabled}
        onClick={exportPdf}
        title={disabled ? "Agregá productos antes de exportar" : "Generar y descargar el PDF"}
        type="button"
      >
        {busy ? "Generando PDF…" : label}
      </button>
      {error ? <span className="text-xs text-red-700">{error}</span> : null}
    </span>
  );
}

export { statusLabels };
