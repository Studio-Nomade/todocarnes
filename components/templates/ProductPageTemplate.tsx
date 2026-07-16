import Image from "next/image";
import { CatalogPage } from "./CatalogPage";
import { CatalogHeader } from "./parts/CatalogHeader";
import { ProductFieldRow } from "./parts/ProductFieldRow";
import { ProductFooter } from "./parts/ProductFooter";

export type ProductPageData = {
  category: "Cerdo" | "Pollo" | "Vacuno" | "Trimming";
  cut: string;
  eyebrow: string;
  title: string;
  code?: string | null;
  brand?: string | null;
  origin?: string | null;
  boxWeight?: string | null;
  format?: string | null;
  units?: string | null;
  mainImage: string;
  secondaryImages: [string, string, string];
};

type ProductPageTemplateProps = {
  product: ProductPageData;
  scale?: number;
};

const fields = [
  ["code", "Código", "code"],
  ["brand", "Marca", "brand"],
  ["origin", "Procedencia", "origin"],
  ["weight", "Peso Caja", "boxWeight"],
  ["format", "Formato", "format"],
  ["units", "Unidades", "units"],
] as const;

export function ProductPageTemplate({ product, scale }: ProductPageTemplateProps) {
  const longTitle = product.title.length > 50;

  return (
    <CatalogPage scale={scale}>
      <CatalogHeader activeCategory={product.category} activeCut={product.cut} />
      <div className="absolute left-0 top-[155px] h-[605px] w-[469px] bg-gray-50" />
      <Image alt={product.title} className="absolute left-[469px] top-[155px] h-[425px] w-[971px] object-cover" height={700} priority src={product.mainImage} width={1200} />
      {product.secondaryImages.map((src, index) => (
        <Image
          alt={`Vista secundaria ${index + 1} de ${product.title}`}
          className="absolute top-[591px] h-[169px] w-[272px] object-cover"
          height={700}
          key={`${src}-${index}`}
          src={src}
          style={{ left: [510, 802, 1094][index] }}
          width={1200}
        />
      ))}
      <div className="absolute left-11 top-[181px] w-[380px]">
        <div className="text-[20px] font-normal uppercase leading-6 text-blue">{product.eyebrow || "—"}</div>
        <div className="mt-3 h-px w-[232px] bg-blue/45" />
      </div>
      <h1 className={`absolute left-11 top-[239px] h-[105px] w-[380px] break-words font-semibold uppercase text-navy ${longTitle ? "text-[24px] leading-[1.08]" : "text-[40px] leading-[1.2]"}`}>
        {product.title || "—"}
      </h1>
      <div className="absolute left-11 top-[364px] w-[348px]">
        {fields.map(([icon, label, key]) => (
          <ProductFieldRow icon={icon} key={key} label={label} value={product[key]} />
        ))}
      </div>
      <ProductFooter />
    </CatalogPage>
  );
}
