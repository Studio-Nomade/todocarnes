import Image from "next/image";
import { CategoryIcon } from "./CategoryIcon";
import { CutsNav } from "./CutsNav";

type CatalogHeaderProps = {
  activeCategory: "Cerdo" | "Pollo" | "Vacuno" | "Trimming";
  activeCut: string;
  cuts: string[];
};

const categories = ["Cerdo", "Pollo", "Vacuno", "Trimming"] as const;
const widths = [136, 151, 152, 186];

export function CatalogHeader({ activeCategory, activeCut, cuts }: CatalogHeaderProps) {
  return (
    <header className="absolute inset-x-0 top-0 h-[122px] border-b-2 border-ink/35 bg-gray-50">
      <div className="absolute left-7 top-[22px] flex h-[78px] w-[322px] items-center gap-4">
        <Image
          alt="Todo Carnes"
          className="h-[67px] w-[67px] object-contain"
          height={4500}
          priority
          src="/brand/isologo_completo.png"
          width={4501}
        />
        <span className="text-[28px] font-bold italic tracking-tight text-navy">TodoCarnes</span>
      </div>
      <nav aria-label="Categorías" className="absolute left-[815px] top-0 flex h-[121px]">
        {categories.map((category, index) => {
          const active = category === activeCategory;
          return (
            <div
              className={`relative flex h-[121px] flex-col items-center justify-center border-l border-ink/30 ${active ? "bg-navy text-white" : "bg-gray-50 text-navy"}`}
              key={category}
              style={{ width: widths[index] }}
            >
              <CategoryIcon category={category} tone={active ? "light" : "dark"} />
              <span className={`mt-1 text-[13px] uppercase ${active ? "font-semibold" : "font-medium text-ink"}`}>
                {category}
              </span>
              {active ? <span className="absolute -bottom-[6px] h-[5px] w-full bg-blue" /> : null}
            </div>
          );
        })}
      </nav>
      <CutsNav activeCut={activeCut} cuts={cuts} />
    </header>
  );
}
