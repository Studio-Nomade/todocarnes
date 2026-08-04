"use client";

import { useMemo, useState, useTransition } from "react";
import {
  addProductToCatalog,
  removeProductFromCatalog,
  reorderCatalogItems,
} from "@/lib/actions/catalogs";
import {
  dropCatalogProduct,
  moveCatalogProduct,
  sortCatalogItems,
} from "@/lib/catalogs/order";
import type { CatalogItemProduct } from "@/lib/catalogs/types";
import { CatalogCategoryCard } from "./CatalogCategoryCard";

const CATEGORY_ORDER = ["Cerdo", "Pollo", "Vacuno", "Trimming"] as const;
type AvailableProduct = { id: string; title: string; category: string; cut: string };
type CatalogBuilderProps = {
  catalogId: string;
  initialItems: CatalogItemProduct[];
  available: AvailableProduct[];
};
export function CatalogBuilder({ catalogId, initialItems, available }: CatalogBuilderProps) {
  const [items, setItems] = useState(() => sortCatalogItems(initialItems));
  const [pool, setPool] = useState(available);
  const [toAdd, setToAdd] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());

  const grouped = useMemo(() => {
    return CATEGORY_ORDER.map((category) => ({
      category,
      products: items.filter((item) => item.category === category),
    })).filter((group) => group.products.length > 0);
  }, [items]);

  const categoriesPresent = grouped.length;
  const pageCount = items.length === 0 ? 0 : 5 + categoriesPresent + items.length;
  function persistOrder(next: CatalogItemProduct[], previous: CatalogItemProduct[]) {
    const ordered = sortCatalogItems(next).map((item) => item.productId);
    startTransition(async () => {
      const result = await reorderCatalogItems({ catalogId, orderedProductIds: ordered });
      if (!result.success) {
        setItems(previous);
        setError(result.error);
      }
    });
  }

  function move(productId: string, direction: -1 | 1) {
    setError("");
    const previous = items;
    const next = moveCatalogProduct(previous, productId, direction);
    if (!next) {
      return;
    }
    setItems(next);
    persistOrder(next, previous);
  }

  function reorderByDrop(draggedId: string, targetId: string) {
    setError("");
    const previous = items;
    const next = dropCatalogProduct(previous, draggedId, targetId);
    if (!next) {
      return;
    }
    setItems(next);
    persistOrder(next, previous);
  }

  function addProduct() {
    if (!toAdd) {
      return;
    }
    const product = pool.find((item) => item.id === toAdd);
    if (!product) {
      return;
    }
    setError("");
    startTransition(async () => {
      const result = await addProductToCatalog(catalogId, product.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      const maxOrder = items
        .filter((item) => item.category === product.category)
        .reduce((max, item) => Math.max(max, item.itemSortOrder), -1);
      setItems((current) => [
        ...current,
        {
          category: product.category as CatalogItemProduct["category"],
          cut: product.cut,
          hasApprovedImages: false,
          itemSortOrder: maxOrder + 1,
          productId: product.id,
          status: "active",
          title: product.title,
        },
      ]);
      setPool((current) => current.filter((item) => item.id !== product.id));
      setToAdd("");
    });
  }

  function removeProduct(productId: string) {
    setError("");
    const removed = items.find((item) => item.productId === productId);
    startTransition(async () => {
      const result = await removeProductFromCatalog(catalogId, productId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setItems((current) => current.filter((item) => item.productId !== productId));
      if (removed) {
        setPool((current) => [
          ...current,
          { category: removed.category, cut: removed.cut, id: removed.productId, title: removed.title },
        ]);
      }
    });
  }

  const poolByCategory = CATEGORY_ORDER.map((category) => ({
    category,
    products: pool.filter((item) => item.category === category),
  })).filter((group) => group.products.length > 0);

  return (
    <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,320px)]">
      <div className="min-w-0 space-y-6">
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-ink/10 bg-white px-4 py-4 text-sm shadow-sm sm:flex sm:flex-wrap sm:items-center sm:gap-4 sm:px-5">
          <span className="font-semibold text-navy">{items.length} productos</span>
          <span className="text-ink/65">{categoriesPresent} categorías</span>
          <span className="text-ink/65">~{pageCount} páginas</span>
          {isPending ? <span className="text-right text-xs text-blue sm:ml-auto">Guardando…</span> : null}
        </div>

        {error ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p> : null}

        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-ink/20 bg-white px-6 py-16 text-center">
            <p className="font-medium text-navy">Este catálogo está vacío.</p>
            <p className="mt-2 text-sm text-ink/55">Agrega productos activos desde el panel de la derecha.</p>
          </div>
        ) : (
          grouped.map((group) => (
            <CatalogCategoryCard
              collapsed={collapsed.has(group.category)}
              isPending={isPending}
              key={group.category}
              move={move}
              onToggle={() => setCollapsed((current) => {
                const next = new Set(current);
                if (next.has(group.category)) {
                  next.delete(group.category);
                } else {
                  next.add(group.category);
                }
                return next;
              })}
              products={group.products}
              reorderByDrop={reorderByDrop}
              removeProduct={removeProduct}
              title={group.category}
            />
          ))
        )}
      </div>

      <aside className="min-w-0 max-w-full rounded-xl border border-ink/10 bg-white p-5 shadow-sm xl:sticky xl:top-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-navy">Agregar productos</h2>
        <p className="mt-1 text-xs text-ink/55">Solo productos activos.</p>
        {pool.length === 0 ? (
          <p className="mt-4 text-sm text-ink/50">No quedan productos activos por agregar.</p>
        ) : (
          <div className="mt-4 flex min-w-0 flex-col gap-2 sm:flex-row xl:flex-col 2xl:flex-row">
            <select className="h-10 min-w-0 flex-1 rounded-lg border border-ink/15 bg-white px-2 text-sm outline-none focus:border-blue" onChange={(event) => setToAdd(event.target.value)} value={toAdd}>
              <option value="">Elegir producto…</option>
              {poolByCategory.map((group) => (
                <optgroup key={group.category} label={group.category}>
                  {group.products.map((product) => (
                    <option key={product.id} value={product.id}>{product.title}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <button className="h-10 shrink-0 rounded-lg bg-navy px-4 text-sm font-semibold text-white hover:bg-navy/90 disabled:opacity-50" disabled={!toAdd || isPending} onClick={addProduct} type="button">
              Agregar
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
