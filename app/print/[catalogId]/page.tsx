import { unauthorized } from "next/navigation";
import { PrintReadySignal } from "@/components/templates/PrintReadySignal";
import { ProductPageTemplate, type ProductPageData } from "@/components/templates/ProductPageTemplate";
import { isValidPrintToken } from "@/lib/pdf/print-token";
import "@/styles/print.css";

type PrintPageProps = {
  params: Promise<{ catalogId: string }>;
  searchParams: Promise<{ token?: string | string[] }>;
};

const placeholder = "/placeholders/product-placeholder.svg";

const demoProduct: ProductPageData = {
  category: "Cerdo",
  cut: "Costillar",
  eyebrow: "Costillar Brasil",
  title: "Costillar de Cerdo Notable",
  code: "CF-1608",
  brand: "Notable",
  origin: "Brasil",
  boxWeight: "8 KG (Peso Variable)",
  format: "Vacío",
  units: "7-8 x caja",
  mainImage: placeholder,
  secondaryImages: [placeholder, placeholder, placeholder],
};

const stressProduct: ProductPageData = {
  ...demoProduct,
  title: "Costillar de cerdo notable premium de origen brasileño para food service",
  code: "CF-1608\nCF-1610",
  brand: null,
};

export default async function PrintPage({ params, searchParams }: PrintPageProps) {
  const [{ catalogId }, { token }] = await Promise.all([params, searchParams]);

  if (!isValidPrintToken(token)) {
    unauthorized();
  }

  const product = catalogId === "stress" ? stressProduct : demoProduct;

  return (
    <>
      <ProductPageTemplate product={product} />
      <PrintReadySignal />
    </>
  );
}
