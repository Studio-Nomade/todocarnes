import Link from "next/link";
import { notFound } from "next/navigation";
import { CatalogPages } from "@/components/templates/CatalogPages";
import { requireRole } from "@/lib/auth/requireRole";
import { getCatalog, getCatalogProducts } from "@/lib/catalogs/data";
import { catalogPeriod } from "@/lib/catalogs/format";
import { buildPages } from "@/lib/pdf/page-order";
import { getServices } from "@/lib/services/data";

export const dynamic = "force-dynamic";

type PreviewPageProps = { params: Promise<{ id: string }> };

export default async function CatalogPreviewPage({ params }: PreviewPageProps) {
  await requireRole(["admin", "commercial"]);
  const { id } = await params;

  const [catalog, products, services] = await Promise.all([
    getCatalog(id),
    getCatalogProducts(id),
    getServices(true),
  ]);
  if (!catalog) {
    notFound();
  }

  const pages = buildPages(products, services);
  const meta = {
    clientLogoUrl: catalog.clientLogoUrl,
    clientName: catalog.clientName,
    month: catalog.month,
    title: catalog.title,
    year: catalog.year,
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link className="text-sm font-medium text-blue hover:underline" href={`/catalogs/${id}`}>← Volver al constructor</Link>
          <h1 className="mt-2 break-words text-2xl font-semibold text-navy sm:text-3xl">{catalog.title}</h1>
          <p className="mt-1 text-sm text-ink/60">{catalogPeriod(catalog.month, catalog.year)} · {pages.length} páginas</p>
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-4 rounded-xl bg-gray-100 p-2 sm:gap-6 sm:p-8">
        <CatalogPages framed meta={meta} pages={pages} scale={0.6} />
      </div>
    </section>
  );
}
