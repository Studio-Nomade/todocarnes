import { Fragment, type ReactNode } from "react";
import { catalogPeriod } from "@/lib/catalogs/format";
import type { CatalogPageSpec } from "@/lib/pdf/page-order";
import { CatalogClosing } from "./CatalogClosing";
import { CatalogCover } from "./CatalogCover";
import { CatalogIndex } from "./CatalogIndex";
import { CatalogPackaging } from "./CatalogPackaging";
import { CatalogServices } from "./CatalogServices";
import { CategoryDivider } from "./CategoryDivider";
import { ProductPageTemplate } from "./ProductPageTemplate";
import { ResponsiveCatalogFrame } from "./ResponsiveCatalogFrame";

type CatalogMeta = {
  clientLogoUrl?: string | null;
  clientName?: string | null;
  month: number;
  title: string;
  year: number;
};

type CatalogPagesProps = {
  meta: CatalogMeta;
  pages: CatalogPageSpec[];
  scale?: number;
  // framed: cada página en un contenedor de tamaño escalado (para el preview en pantalla).
  // sin framed: secciones 1440×810 crudas que Playwright pagina con break-after (para el PDF).
  framed?: boolean;
};

function renderPage(page: CatalogPageSpec, meta: CatalogMeta, period: string, scale?: number): ReactNode {
  switch (page.kind) {
    case "cover":
      return <CatalogCover month={meta.month} scale={scale} title={meta.title} year={meta.year} />;
    case "index":
      return <CatalogIndex entries={page.entries} month={meta.month} pageNumber={page.pageNumber} scale={scale} year={meta.year} />;
    case "services":
      return <CatalogServices month={meta.month} pageNumber={page.pageNumber} scale={scale} services={page.services} year={meta.year} />;
    case "packaging":
      return <CatalogPackaging clientLogoUrl={meta.clientLogoUrl} clientName={meta.clientName} month={meta.month} pageNumber={page.pageNumber} scale={scale} year={meta.year} />;
    case "divider":
      return (
        <CategoryDivider category={page.category} month={meta.month} pageNumber={page.pageNumber} products={page.products} scale={scale} year={meta.year} />
      );
    case "product":
      return (
        <ProductPageTemplate
          eagerImages={!scale}
          pageNumber={page.pageNumber}
          period={period}
          productId={page.product.id}
          product={{
            boxWeight: page.product.boxWeight,
            brand: page.product.brand,
            category: page.product.category,
            code: page.product.code,
            cut: page.product.cut,
            cuts: page.categoryCuts,
            eyebrow: page.product.eyebrow,
            format: page.product.format,
            mainImage: page.product.mainImage,
            origin: page.product.origin,
            secondaryImages: page.product.secondaryImages,
            title: page.product.title,
            units: page.product.units,
          }}
          scale={scale}
        />
      );
    case "closing":
      return <CatalogClosing month={meta.month} scale={scale} year={meta.year} />;
  }
}

// Mapea la secuencia pura de page-order a las plantillas concretas.
export function CatalogPages({ meta, pages, scale, framed = false }: CatalogPagesProps) {
  const period = catalogPeriod(meta.month, meta.year);

  return (
    <>
      {pages.map((page) => {
        if (!framed) {
          const element = renderPage(page, meta, period, scale);
          // Fragment: sin nodo DOM, para que las <section> queden hermanas
          // directas y break-after:page + :last-of-type funcionen en el PDF.
          return <Fragment key={`${page.kind}-${page.pageNumber}`}>{element}</Fragment>;
        }
        return (
          <ResponsiveCatalogFrame key={`${page.kind}-${page.pageNumber}`} maxScale={scale}>
            {renderPage(page, meta, period, 1)}
          </ResponsiveCatalogFrame>
        );
      })}
    </>
  );
}
