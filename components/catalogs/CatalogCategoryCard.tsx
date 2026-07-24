"use client";

import type { CatalogItemProduct } from "@/lib/catalogs/types";

type CatalogCategoryCardProps = {
  collapsed: boolean;
  isPending: boolean;
  move: (productId: string, direction: -1 | 1) => void;
  onToggle: () => void;
  products: CatalogItemProduct[];
  removeProduct: (productId: string) => void;
  title: string;
};

export function CatalogCategoryCard({
  collapsed,
  isPending,
  move,
  onToggle,
  products,
  removeProduct,
  title,
}: CatalogCategoryCardProps) {
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-ink/10 bg-white shadow-sm">
      <button
        aria-expanded={!collapsed}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50"
        onClick={onToggle}
        type="button"
      >
        <span className="text-sm font-semibold uppercase tracking-wide text-navy">{title}</span>
        <span className="flex items-center gap-3 text-xs text-ink/55">
          {products.length} producto{products.length === 1 ? "" : "s"}
          <span aria-hidden className="text-base text-blue">{collapsed ? "＋" : "−"}</span>
        </span>
      </button>
      {!collapsed ? (
        <ul className="divide-y divide-ink/10 border-t border-ink/10">
          {products.map((item, index) => (
            <li className="grid min-w-0 grid-cols-[auto_1fr] gap-3 px-4 py-4 sm:flex sm:flex-nowrap sm:items-center sm:px-5 sm:py-3" key={item.productId}>
              <div className="row-span-2 flex shrink-0 flex-col">
                <button
                  aria-label={`Subir ${item.title}`}
                  className="text-ink/40 hover:text-navy disabled:opacity-25"
                  disabled={index === 0 || isPending}
                  onClick={() => move(item.productId, -1)}
                  type="button"
                >
                  ▲
                </button>
                <button
                  aria-label={`Bajar ${item.title}`}
                  className="text-ink/40 hover:text-navy disabled:opacity-25"
                  disabled={index === products.length - 1 || isPending}
                  onClick={() => move(item.productId, 1)}
                  type="button"
                >
                  ▼
                </button>
              </div>
              <div className="min-w-0 flex-1 basis-52">
                <p className="break-words font-medium text-navy sm:truncate">{item.title}</p>
                <p className="text-xs text-ink/55">{item.cut}</p>
              </div>
              <span className={`w-fit shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                item.hasApprovedImages
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}>
                {item.hasApprovedImages ? "4 imágenes" : "sin imágenes"}
              </span>
              <button
                className="justify-self-end text-xs font-semibold text-red-700 hover:underline disabled:opacity-50 sm:shrink-0"
                disabled={isPending}
                onClick={() => removeProduct(item.productId)}
                type="button"
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
