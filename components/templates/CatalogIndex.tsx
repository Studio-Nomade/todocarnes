import { catalogPeriod } from "@/lib/catalogs/format";
import type { IndexEntry } from "@/lib/pdf/page-order";
import { CatalogPage } from "./CatalogPage";
import { CategoryIcon } from "./parts/CategoryIcon";

type CatalogIndexProps = {
  entries: IndexEntry[];
  month: number;
  year: number;
  pageNumber: number;
  scale?: number;
};

export function CatalogIndex({ entries, month, year, pageNumber, scale }: CatalogIndexProps) {
  return (
    <CatalogPage scale={scale}>
      <div className="absolute inset-0 bg-white" />
      <div className="absolute left-0 top-0 h-full w-[10px] bg-navy" />

      <header className="absolute left-[120px] right-[120px] top-[110px]">
        <p className="text-[18px] font-medium uppercase tracking-[0.4em] text-blue">Catálogo {catalogPeriod(month, year)}</p>
        <h1 className="mt-3 text-[72px] font-bold leading-none text-navy">Índice</h1>
      </header>

      <div className="absolute left-[120px] right-[120px] top-[300px] grid grid-cols-2 gap-x-16 gap-y-12">
        {entries.map((entry) => (
          <section className="flex gap-6" key={entry.category}>
            <div className="mt-1 flex h-[72px] w-[88px] shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-navy">
              <CategoryIcon category={entry.category} />
            </div>
            <div>
              <h2 className="text-[30px] font-semibold text-navy">{entry.category}</h2>
              <p className="mt-2 text-[18px] font-light leading-7 text-ink/70">
                {entry.cuts.join(" · ") || "Sin cortes"}
              </p>
            </div>
          </section>
        ))}
        {entries.length === 0 ? (
          <p className="text-[20px] font-light text-ink/50">Todavía no hay productos en este catálogo.</p>
        ) : null}
      </div>

      <div className="absolute bottom-[40px] left-[120px] right-[120px] flex items-center justify-between border-t border-ink/15 pt-6 text-[15px] font-light tracking-[0.2em] text-ink/50">
        <span>TODO CARNES</span>
        <span>{String(pageNumber).padStart(2, "0")}</span>
      </div>
    </CatalogPage>
  );
}
