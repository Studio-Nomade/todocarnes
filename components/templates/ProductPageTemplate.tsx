import Image from "next/image";
import { CatalogPage } from "./CatalogPage";
import { CatalogHeader } from "./parts/CatalogHeader";
import { ProductFieldRow } from "./parts/ProductFieldRow";
import { ProductFooter } from "./parts/ProductFooter";
import {
  hasMultipleVariants,
  ProductVariantTable,
} from "./parts/ProductVariantTable";

export type ProductPageData = {
  category: "Cerdo" | "Pollo" | "Vacuno" | "Trimming";
  cut: string;
  cuts: string[];
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
  period?: string;
  pageNumber?: number;
};

const fields = [
  ["code", "Código", "code"],
  ["brand", "Marca", "brand"],
  ["origin", "Procedencia", "origin"],
  ["weight", "Peso Caja", "boxWeight"],
  ["format", "Formato", "format"],
  ["units", "Unidades", "units"],
] as const;

export function ProductPageTemplate({ product, scale, period, pageNumber }: ProductPageTemplateProps) {
  const titleLength = product.title.length;
  const titleSize =
    titleLength > 70
      ? "text-[20px] leading-[1.05]"
        : titleLength > 55
        ? "text-[23px] leading-[1.08]"
        : titleLength > 38
          ? "text-[26px] leading-[1.08]"
          : titleLength > 24
            ? "text-[34px] leading-[1.12]"
            : "text-[40px] leading-[1.15]";
  const variantValues = {
    boxWeight: product.boxWeight,
    code: product.code,
    format: product.format,
    units: product.units,
  };
  const multipleVariants = hasMultipleVariants(variantValues);

  return (
    <CatalogPage scale={scale}>
      <CatalogHeader activeCategory={product.category} activeCut={product.cut} cuts={product.cuts} />
      <div className="absolute left-0 top-[155px] h-[605px] w-[469px] bg-gray-50" />
      <Image alt={product.title} className="absolute left-[469px] top-[155px] h-[425px] w-[971px] object-cover" height={700} priority src={product.mainImage} width={1200} />
      {product.secondaryImages.map((src, index) => (
        <Image
          alt={`Vista secundaria ${index + 1} de ${product.title}`}
          className="absolute top-[591px] h-[169px] w-[272px] object-cover"
          height={700}
          key={`${src}-${index}`}
          priority
          src={src}
          style={{ left: [510, 802, 1094][index] }}
          width={1200}
        />
      ))}
      <div className="absolute left-11 top-[181px] w-[380px]">
        <div className="text-[20px] font-normal uppercase leading-6 text-blue">{product.eyebrow || "—"}</div>
      </div>
      <h1 className={`absolute left-11 top-[226px] flex h-[112px] w-[380px] items-center break-words font-semibold uppercase text-navy ${titleSize}`}>
        {product.title || "—"}
      </h1>
      <div className="absolute left-11 top-[347px] h-px w-[348px] bg-blue/45" />
      <div className="absolute left-11 top-[364px] w-[348px]">
        {multipleVariants ? (
          <>
            <ProductVariantTable {...variantValues} />
            <ProductFieldRow icon="brand" label="Marca" value={product.brand} />
            <ProductFieldRow icon="origin" label="Procedencia" value={product.origin} />
          </>
        ) : (
          fields.map(([icon, label, key]) => (
            <ProductFieldRow icon={icon} key={key} label={label} value={product[key]} />
          ))
        )}
      </div>
      <ProductFooter pageNumber={pageNumber} period={period} />
    </CatalogPage>
  );
}
