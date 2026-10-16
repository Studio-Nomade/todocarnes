"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState, useTransition } from "react";
import { duplicateProduct, setProductStatus } from "@/lib/actions/products";
import type { ProductStatus } from "@/lib/validators/product";

type ProductActionsProps = {
  compact?: boolean;
  id: string;
  onStatusChange?: (status: ProductStatus) => void;
  status: ProductStatus;
};

export function ProductActions({ compact = false, id, onStatusChange, status }: ProductActionsProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [optimisticStatus, setOptimisticStatus] = useState(status);
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

  function toggleStatus() {
    const previousStatus = optimisticStatus;
    const nextStatus = optimisticStatus === "active" ? "inactive" : "active";
    const action = nextStatus === "active" ? "activar" : "desactivar";
    if (!window.confirm(`¿Quieres ${action} este producto?`)) {
      return;
    }
    setError("");
    setOptimisticStatus(nextStatus);
    startTransition(async () => {
      const result = await setProductStatus(id, nextStatus);
      if (!result.success) {
        setOptimisticStatus(previousStatus);
        setError(result.error);
        return;
      }
      onStatusChange?.(nextStatus);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ActionButton
        compact={compact}
        disabled={isPending}
        icon={<DuplicateIcon />}
        label="Duplicar"
        onClick={duplicate}
      />
      <ActionButton
        compact={compact}
        danger={optimisticStatus === "active"}
        disabled={isPending}
        icon={optimisticStatus === "active" ? <DeactivateIcon /> : <ActivateIcon />}
        label={optimisticStatus === "active" ? "Desactivar" : "Activar"}
        onClick={toggleStatus}
      />
      {error ? <span className="w-full text-xs text-red-700">{error}</span> : null}
    </div>
  );
}

type ActionButtonProps = {
  compact: boolean;
  danger?: boolean;
  disabled: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
};

function ActionButton({ compact, danger = false, disabled, icon, label, onClick }: ActionButtonProps) {
  const color = danger
    ? "border-red-200 text-red-700 hover:bg-red-50"
    : "border-ink/15 text-navy hover:border-blue/40 hover:bg-blue-50";

  return (
    <button
      aria-label={label}
      className={compact
        ? `group relative inline-flex h-9 w-9 items-center justify-center rounded-lg border transition disabled:opacity-50 ${color}`
        : `inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${color}`}
      disabled={disabled}
      onClick={onClick}
      title={label}
      type="button"
    >
      {icon}
      {!compact ? <span>{label}</span> : null}
      {compact ? (
        <span
          className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-navy px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          role="tooltip"
        >
          {label}
        </span>
      ) : null}
    </button>
  );
}

function DuplicateIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <rect height="12" rx="2" stroke="currentColor" strokeWidth="1.8" width="12" x="8" y="8" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function DeactivateIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="m7 7 10 10" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function ActivateIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="m8.5 12 2.2 2.2 4.8-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}
