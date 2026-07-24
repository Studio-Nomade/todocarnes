"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deactivateProduct, duplicateProduct } from "@/lib/actions/products";

export function ProductActions({ id, inactive }: { id: string; inactive: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function duplicate() {
    setError("");
    startTransition(async () => {
      const result = await duplicateProduct(id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push(`/products/${result.id}`);
    });
  }

  function deactivate() {
    if (!window.confirm("¿Querés desactivar este producto? Seguirá disponible en la base.")) {
      return;
    }
    setError("");
    startTransition(async () => {
      const result = await deactivateProduct(id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button className="text-xs font-semibold text-navy hover:underline disabled:opacity-50" disabled={isPending} onClick={duplicate} type="button">Duplicar</button>
      {!inactive ? (
        <button className="text-xs font-semibold text-red-700 hover:underline disabled:opacity-50" disabled={isPending} onClick={deactivate} type="button">Desactivar</button>
      ) : null}
      {error ? <span className="w-full text-xs text-red-700">{error}</span> : null}
    </div>
  );
}
