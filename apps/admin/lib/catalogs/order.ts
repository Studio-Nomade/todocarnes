import type { CatalogItemProduct } from "@/lib/catalogs/types";

const CATEGORY_ORDER = ["Cerdo", "Pollo", "Vacuno", "Trimming"] as const;

export function sortCatalogItems(items: CatalogItemProduct[]): CatalogItemProduct[] {
  return [...items].sort((a, b) => {
    const categoryDelta = CATEGORY_ORDER.indexOf(a.category as (typeof CATEGORY_ORDER)[number]) -
      CATEGORY_ORDER.indexOf(b.category as (typeof CATEGORY_ORDER)[number]);
    return categoryDelta || a.itemSortOrder - b.itemSortOrder;
  });
}

export function moveCatalogProduct(
  items: CatalogItemProduct[],
  productId: string,
  direction: -1 | 1,
): CatalogItemProduct[] | null {
  const sorted = sortCatalogItems(items);
  const category = sorted.find((item) => item.productId === productId)?.category;
  const categoryItems = sorted.filter((item) => item.category === category);
  const sourceIndex = categoryItems.findIndex((item) => item.productId === productId);
  const targetIndex = sourceIndex + direction;

  if (sourceIndex < 0 || targetIndex < 0 || targetIndex >= categoryItems.length) {
    return null;
  }

  const reordered = [...categoryItems];
  [reordered[sourceIndex], reordered[targetIndex]] = [reordered[targetIndex], reordered[sourceIndex]];
  return replaceCategoryOrder(sorted, reordered);
}

export function dropCatalogProduct(
  items: CatalogItemProduct[],
  draggedId: string,
  targetId: string,
): CatalogItemProduct[] | null {
  if (draggedId === targetId) {
    return null;
  }

  const sorted = sortCatalogItems(items);
  const dragged = sorted.find((item) => item.productId === draggedId);
  const target = sorted.find((item) => item.productId === targetId);
  if (!dragged || !target || dragged.category !== target.category) {
    return null;
  }

  const categoryItems = sorted.filter((item) => item.category === dragged.category);
  const sourceIndex = categoryItems.findIndex((item) => item.productId === draggedId);
  const targetIndex = categoryItems.findIndex((item) => item.productId === targetId);
  const reordered = [...categoryItems];
  const [moved] = reordered.splice(sourceIndex, 1);
  reordered.splice(targetIndex, 0, moved);

  return replaceCategoryOrder(sorted, reordered);
}

function replaceCategoryOrder(
  items: CatalogItemProduct[],
  reordered: CatalogItemProduct[],
): CatalogItemProduct[] {
  const positions = new Map(
    reordered.map((item, position) => [item.productId, { ...item, itemSortOrder: position }]),
  );
  return sortCatalogItems(items.map((item) => positions.get(item.productId) ?? item));
}
