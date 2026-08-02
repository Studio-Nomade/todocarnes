import Image from "next/image";
import { catalogPeriod } from "@/lib/catalogs/format";
import { categoryAnchor, productAnchor, type CategoryProductEntry } from "@/lib/pdf/page-order";
import { CatalogPage } from "./CatalogPage";
import { CategoryIcon } from "./parts/CategoryIcon";

type CategoryDividerProps = {
  category: "Cerdo" | "Pollo" | "Vacuno" | "Trimming";
  products: CategoryProductEntry[];
  month: number;
  year: number;
  pageNumber: number;
  scale?: number;
};

export function CategoryDivider({ category, products, month, year, pageNumber, scale }: CategoryDividerProps) {
  const compactProducts = products.length > 10;

  return (
    <CatalogPage id={categoryAnchor(category)} scale={scale}>
      <Image
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        height={941}
        priority
        src="/brand/divider-bg.webp"
        width={1672}
      />

      <div className="absolute left-[120px] top-1/2 max-w-[560px] -translate-y-1/2">
        <div className="flex h-[180px] w-[180px] items-center justify-center rounded-[40px] bg-white/5 text-blue-mid">
          <div className="scale-[2.6]">
            <CategoryIcon category={category} />
          </div>
        </div>
        <p className="mt-10 text-[20px] font-medium uppercase tracking-[0.4em] text-blue">Categoría</p>
        <h1 className="mt-3 text-[104px] font-bold leading-none text-white">{category}</h1>
      </div>

      <div className={`absolute right-[90px] top-1/2 -translate-y-1/2 border-l border-white/15 pl-10 ${compactProducts ? "w-[680px]" : "w-[450px]"}`}>
        <p className="text-[18px] font-medium uppercase tracking-[0.3em] text-blue-mid">Productos</p>
        <ul className={`mt-6 grid gap-x-8 ${compactProducts ? "grid-cols-2 gap-y-2" : "grid-cols-1 gap-y-3"}`}>
          {products.map((product) => (
            <li key={product.id}>
              <a className={`group block border-b border-white/10 ${compactProducts ? "min-h-[49px] pb-2" : "pb-3"}`} href={`#${productAnchor(product.id)}`}>
                <span className={`block font-medium text-white/90 group-hover:text-blue-mid ${compactProducts ? "text-[15px] leading-[1.15]" : "text-[21px] leading-6"}`}>{product.title}</span>
                <span className={`mt-1 block font-light uppercase text-white/45 ${compactProducts ? "text-[10px] tracking-[0.12em]" : "text-[13px] tracking-[0.18em]"}`}>{product.cut}</span>
              </a>
            </li>
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
