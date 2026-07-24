import { notFound, unauthorized } from "next/navigation";
import { CatalogPages } from "@/components/templates/CatalogPages";
import { PrintReadySignal } from "@/components/templates/PrintReadySignal";
import { getCatalog, getCatalogProducts } from "@/lib/catalogs/data";
import { buildPages } from "@/lib/pdf/page-order";
import { isValidPrintToken } from "@/lib/pdf/print-token";
import "@/styles/print.css";

export const dynamic = "force-dynamic";

type PrintPageProps = {
  params: Promise<{ catalogId: string }>;
  searchParams: Promise<{ token?: string | string[] }>;
};

// Ruta sin chrome de UI, protegida por PRINT_TOKEN (no por sesión: Playwright
// corre en el server y no tiene la cookie del usuario). La consume el export.
export default async function PrintPage({ params, searchParams }: PrintPageProps) {
  const [{ catalogId }, { token }] = await Promise.all([params, searchParams]);

  if (!isValidPrintToken(token)) {
    unauthorized();
  }

  const catalog = await getCatalog(catalogId);
  if (!catalog) {
    notFound();
  }

  const products = await getCatalogProducts(catalogId);
  const pages = buildPages(products);

  return (
    <>
      <CatalogPages meta={{ month: catalog.month, title: catalog.title, year: catalog.year }} pages={pages} />
      <PrintReadySignal />
    </>
  );
}
