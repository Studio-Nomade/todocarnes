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
export type CatalogService = { id: string; title: string; description: string };
export type CategoryProductEntry = { cut: string; id: string; title: string };

export type CatalogPageSpec =
  | { kind: "cover"; pageNumber: number }
  | { kind: "index"; pageNumber: number; entries: IndexEntry[] }
  | { kind: "services"; pageNumber: number; services: CatalogService[] }
  | { kind: "packaging"; pageNumber: number }
  | { kind: "divider"; pageNumber: number; category: CategoryName; products: CategoryProductEntry[] }
  | { kind: "product"; pageNumber: number; product: CatalogProduct; categoryCuts: string[] }
  | { kind: "closing"; pageNumber: number };

export const categoryAnchor = (category: CategoryName) => `categoria-${category.toLowerCase()}`;
export const productAnchor = (productId: string) => `producto-${productId}`;

export function pageAnchor(page: CatalogPageSpec): string {
  switch (page.kind) {
    case "cover": return "portada";
    case "index": return "indice";
    case "services": return "servicios";
    case "packaging": return "maquila-envasados";
    case "divider": return categoryAnchor(page.category);
    case "product": return productAnchor(page.product.id);
    case "closing": return "cierre";
  }
}

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
 *        b. Fichas, en el orden elegido por el usuario (itemSortOrder)
 *   4. Cierre
 *
 * Dentro de una categoría el orden lo da itemSortOrder, no el corte: así el
 * reordenar del constructor (subir/bajar) se refleja siempre en el PDF. El
 * corte agrupa visualmente vía el separador y la sub-nav, no el orden.
 * El número de página se asigna en este recorrido.
 */
export function buildPages(products: CatalogProduct[], services: CatalogService[] = []): CatalogPageSpec[] {
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
  const specs: Unnumbered[] = [
    { kind: "cover" },
    { kind: "index", entries },
    { kind: "services", services },
    { kind: "packaging" },
  ];

  for (const [category, group] of orderedCategories) {
    const categoryCuts = distinctCuts(group);
    const orderedProducts = [...group].sort((a, b) => a.itemSortOrder - b.itemSortOrder);
    specs.push({
      kind: "divider",
      category,
      products: orderedProducts.map((product) => ({
        cut: product.cut,
        id: product.id,
        title: product.title,
      })),
    });
    for (const product of orderedProducts) {
      specs.push({ kind: "product", product, categoryCuts });
    }
  }

  specs.push({ kind: "closing" });

  return specs.map((spec, index) => ({ ...spec, pageNumber: index + 1 }) as CatalogPageSpec);
}
