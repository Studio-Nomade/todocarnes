import Link from "next/link";
import { notFound } from "next/navigation";
import { CatalogBuilder } from "@/components/catalogs/CatalogBuilder";
import { CatalogBrandingForm } from "@/components/catalogs/CatalogBrandingForm";
import { CatalogTitleEditor } from "@/components/catalogs/CatalogTitleEditor";
import { ExportButton } from "@/components/catalogs/ExportButton";
import { SendCatalogEmail } from "@/components/catalogs/SendCatalogEmail";
import { requireRole } from "@/lib/auth/requireRole";
import { getCatalog, getCatalogItems } from "@/lib/catalogs/data";
import { catalogPeriod, catalogStatusLabels } from "@/lib/catalogs/format";
import { listProducts } from "@/lib/actions/products";

export const dynamic = "force-dynamic";

type BuilderPageProps = { params: Promise<{ id: string }> };

export default async function CatalogBuilderPage({ params }: BuilderPageProps) {
  const profile = await requireRole(["admin", "commercial"]);
  const { id } = await params;

  const catalog = await getCatalog(id);
  if (!catalog) {
    notFound();
  }

  const [items, catalog_products] = await Promise.all([getCatalogItems(id), listProducts({})]);
  const selectedIds = new Set(items.map((item) => item.productId));
  const available = catalog_products.products
    .filter((product) => product.status === "active" && !selectedIds.has(product.id))
    .map((product) => ({ category: product.category.name, cut: product.cut.name, id: product.id, title: product.title }));

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link className="text-sm font-medium text-blue hover:underline" href="/catalogs">← Volver a catálogos</Link>
          <CatalogTitleEditor catalogId={catalog.id} initialTitle={catalog.title} />
          <p className="mt-1 text-sm text-ink/60">
            {catalogPeriod(catalog.month, catalog.year)} · <span className="font-medium">{catalogStatusLabels[catalog.status]}</span>
          </p>
        </div>
        <div className="grid w-full grid-cols-1 gap-3 min-[420px]:grid-cols-3 sm:w-auto">
          <form action={`/catalogs/${catalog.id}/preview`} className="w-full" method="get">
            <button className="admin-button-secondary w-full px-4 py-2" type="submit">
              Previsualizar
            </button>
          </form>
          <ExportButton catalogId={catalog.id} disabled={items.length === 0} month={catalog.month} />
          <SendCatalogEmail
            catalogTitle={catalog.title}
            month={catalog.month}
            senderEmail={profile.email}
            senderJobTitle={profile.jobTitle}
            senderName={profile.name}
            senderPhone={profile.phone}
            year={catalog.year}
          />
        </div>
      </div>

      <CatalogBrandingForm
        catalogId={catalog.id}
        initialClientName={catalog.clientName ?? ""}
        logoUrl={catalog.clientLogoUrl}
      />

      <CatalogBuilder available={available} catalogId={catalog.id} initialItems={items} />
    </section>
  );
}
