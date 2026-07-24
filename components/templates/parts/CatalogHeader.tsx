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
      <Image
        alt="Todo Carnes"
        className="absolute left-7 top-[29px] h-[67px] w-[322px] object-contain object-left"
        height={67}
        priority
        src="/brand/todo-carnes.png"
        width={321}
      />
      <nav aria-label="Categorías" className="absolute left-[815px] top-0 flex h-[121px]">
        {categories.map((category, index) => {
          const active = category === activeCategory;
          return (
            <div
              className={`relative flex h-[121px] flex-col items-center justify-center border-l border-ink/30 ${active ? "bg-navy text-white" : "bg-gray-50 text-navy"}`}
              key={category}
              style={{ width: widths[index] }}
            >
              <CategoryIcon category={category} />
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
