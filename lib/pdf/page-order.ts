// Orden de páginas del catálogo. Función PURA: entra data, sale un array de
// páginas con su número asignado. Sin DB, sin fetch, sin Date. Es la única
// pieza de M5 con test unitario obligatorio — por eso vive aislada de todo IO.

export type CategoryName = "Cerdo" | "Pollo" | "Vacuno" | "Trimming";

export type CatalogProduct = {
  id: string;
  category: CategoryName;
  categorySortOrder: number;
  cut: string;
  cutSortOrder: number;
  itemSortOrder: number;
  eyebrow: string;
  title: string;
  code: string | null;
  brand: string | null;
  origin: string | null;
  boxWeight: string | null;
  format: string | null;
  units: string | null;
  mainImage: string;
  secondaryImages: [string, string, string];
};

export type IndexEntry = { category: CategoryName; cuts: string[] };

export type CatalogPageSpec =
  | { kind: "cover"; pageNumber: number }
  | { kind: "index"; pageNumber: number; entries: IndexEntry[] }
  | { kind: "divider"; pageNumber: number; category: CategoryName; cuts: string[] }
  | { kind: "product"; pageNumber: number; product: CatalogProduct; categoryCuts: string[] }
  | { kind: "closing"; pageNumber: number };

// Cortes presentes en un grupo de productos, sin repetir, ordenados por cutSortOrder.
function distinctCuts(products: CatalogProduct[]): string[] {
  const seen = new Map<string, number>();
  for (const product of products) {
    if (!seen.has(product.cut)) {
      seen.set(product.cut, product.cutSortOrder);
    }
  }
  return [...seen.entries()].sort((a, b) => a[1] - b[1]).map(([cut]) => cut);
}

/**
 * Construye la secuencia de páginas del catálogo:
 *   1. Portada
 *   2. Índice (derivado de los productos seleccionados)
 *   3. Por cada categoría con ≥1 producto, en categorySortOrder:
 *        a. Separador (lista los cortes presentes de esa categoría)
 *        b. Fichas, ordenadas por cutSortOrder y luego itemSortOrder
 *   4. Cierre
 * El número de página se asigna en este recorrido.
 */
export function buildPages(products: CatalogProduct[]): CatalogPageSpec[] {
  // Agrupar por categoría, preservando el sort_order de la categoría.
  const byCategory = new Map<CategoryName, CatalogProduct[]>();
  for (const product of products) {
    const group = byCategory.get(product.category);
    if (group) {
      group.push(product);
    } else {
      byCategory.set(product.category, [product]);
    }
  }

  const orderedCategories = [...byCategory.entries()].sort(
    (a, b) => a[1][0].categorySortOrder - b[1][0].categorySortOrder,
  );

  const entries: IndexEntry[] = orderedCategories.map(([category, group]) => ({
    category,
    cuts: distinctCuts(group),
  }));

  // Páginas sin numerar todavía. Omit distributivo: Omit sobre una unión
  // colapsa a las props comunes, así que se distribuye por variante.
  type Unnumbered = CatalogPageSpec extends infer T ? (T extends T ? Omit<T, "pageNumber"> : never) : never;
  const specs: Unnumbered[] = [{ kind: "cover" }, { kind: "index", entries }];

  for (const [category, group] of orderedCategories) {
    const categoryCuts = distinctCuts(group);
    specs.push({ kind: "divider", category, cuts: categoryCuts });

    const orderedProducts = [...group].sort(
      (a, b) => a.cutSortOrder - b.cutSortOrder || a.itemSortOrder - b.itemSortOrder,
    );
    for (const product of orderedProducts) {
      specs.push({ kind: "product", product, categoryCuts });
    }
  }

  specs.push({ kind: "closing" });

  return specs.map((spec, index) => ({ ...spec, pageNumber: index + 1 }) as CatalogPageSpec);
}
