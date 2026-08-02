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

      <div className="absolute right-[120px] top-1/2 w-[420px] -translate-y-1/2 border-l border-white/15 pl-12">
        <p className="text-[18px] font-medium uppercase tracking-[0.3em] text-blue-mid">Productos</p>
        <ul className="mt-6 space-y-3">
          {products.map((product) => (
            <li key={product.id}>
              <a className="group block border-b border-white/10 pb-3" href={`#${productAnchor(product.id)}`}>
                <span className="block text-[21px] font-medium leading-6 text-white/90 group-hover:text-blue-mid">{product.title}</span>
                <span className="mt-1 block text-[13px] font-light uppercase tracking-[0.18em] text-white/45">{product.cut}</span>
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
