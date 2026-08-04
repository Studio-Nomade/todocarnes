import { catalogPeriod } from "@/lib/catalogs/format";
import { categoryAnchor, type IndexEntry } from "@/lib/pdf/page-order";
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
    <CatalogPage id="indice" scale={scale}>
      <div className="absolute inset-0 bg-white" />
      <div className="absolute left-0 top-0 h-full w-[10px] bg-navy" />

      <header className="absolute left-[120px] right-[120px] top-[110px]">
        <p className="text-[18px] font-medium uppercase tracking-[0.4em] text-blue">Catálogo {catalogPeriod(month, year)}</p>
        <h1 className="mt-3 text-[72px] font-bold leading-none text-navy">Índice</h1>
      </header>

      <div className="absolute left-[120px] right-[120px] top-[270px] grid grid-cols-2 gap-x-12 gap-y-6">
        <IndexLink description="Capacidades y soluciones comerciales" href="#servicios" title="Servicios" />
        <IndexLink description="Envases personalizados para tu marca" href="#maquila-envasados" title="Maquila de envasados" />
        {entries.map((entry) => (
          <a className="flex gap-5 rounded-2xl p-3 transition hover:bg-blue-50" href={`#${categoryAnchor(entry.category)}`} key={entry.category}>
            <div className="flex h-[64px] w-[72px] shrink-0 items-center justify-center rounded-2xl bg-navy">
              <CategoryIcon category={entry.category} />
            </div>
            <div>
              <h2 className="text-[25px] font-semibold text-navy">{entry.category}</h2>
              <p className="mt-1 text-[15px] font-light leading-6 text-ink/70">
                {entry.cuts.join(" · ") || "Sin cortes"}
              </p>
            </div>
          </a>
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

function IndexLink({ description, href, title }: { description: string; href: string; title: string }) {
  return (
    <a className="flex gap-5 rounded-2xl bg-navy p-3 text-white" href={href}>
      <span className="flex h-[64px] w-[72px] shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[28px] text-blue-mid">↗</span>
      <span>
        <span className="block text-[25px] font-semibold">{title}</span>
        <span className="mt-1 block text-[15px] font-light leading-6 text-white/70">{description}</span>
      </span>
    </a>
  );
}
