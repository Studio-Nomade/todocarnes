import { catalogPeriod } from "@/lib/catalogs/format";
import { CatalogPage } from "./CatalogPage";
import { CategoryIcon } from "./parts/CategoryIcon";

type CategoryDividerProps = {
  category: "Cerdo" | "Pollo" | "Vacuno" | "Trimming";
  cuts: string[];
  month: number;
  year: number;
  pageNumber: number;
  scale?: number;
};

export function CategoryDivider({ category, cuts, month, year, pageNumber, scale }: CategoryDividerProps) {
  return (
    <CatalogPage scale={scale}>
      <div className="absolute inset-0 bg-navy" />
      <div className="absolute -left-32 top-1/2 h-[640px] w-[640px] -translate-y-1/2 rounded-full bg-blue/10" />

      <div className="absolute left-[120px] top-1/2 max-w-[560px] -translate-y-1/2">
        <div className="flex h-[180px] w-[180px] items-center justify-center rounded-[40px] bg-white/5 text-blue-mid">
          <div className="scale-[2.6]">
            <CategoryIcon category={category} />
          </div>
        </div>
        <p className="mt-10 text-[20px] font-medium uppercase tracking-[0.4em] text-blue">Categoría</p>
        <h1 className="mt-3 text-[104px] font-bold leading-none text-white">{category}</h1>
      </div>

      <div className="absolute right-[120px] top-1/2 w-[420px] -translate-y-1/2 border-l border-white/15 pl-12">
        <p className="text-[18px] font-medium uppercase tracking-[0.3em] text-blue-mid">Cortes</p>
        <ul className="mt-6 space-y-4">
          {cuts.map((cut) => (
            <li className="text-[26px] font-light text-white/85" key={cut}>{cut}</li>
          ))}
        </ul>
      </div>

      <div className="absolute bottom-[40px] left-[120px] right-[120px] flex items-center justify-between text-[15px] font-light tracking-[0.2em] text-white/50">
        <span>CATÁLOGO {catalogPeriod(month, year).toUpperCase()}</span>
        <span>{String(pageNumber).padStart(2, "0")}</span>
      </div>
    </CatalogPage>
  );
}
