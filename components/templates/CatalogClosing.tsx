import Image from "next/image";
import { catalogPeriod } from "@/lib/catalogs/format";
import { CatalogPage } from "./CatalogPage";

type CatalogClosingProps = {
  month: number;
  year: number;
  scale?: number;
};

export function CatalogClosing({ month, year, scale }: CatalogClosingProps) {
  return (
    <CatalogPage id="cierre" scale={scale}>
      <div className="absolute inset-0 bg-navy" />
      <div className="absolute -right-40 -bottom-40 h-[720px] w-[720px] rounded-full bg-blue/10" />

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <Image alt="Todo Carnes" height={4500} priority src="/brand/isologo_blanco.png" width={4501} className="h-28 w-28 object-contain" />
        <span className="mt-6 text-5xl font-bold italic tracking-tight text-white">TodoCarnes</span>
        <p className="mt-10 text-[22px] font-light tracking-[0.3em] text-blue-mid">GRACIAS POR PREFERIRNOS</p>
        <p className="mt-4 text-[16px] font-light tracking-[0.2em] text-white/50">{catalogPeriod(month, year).toUpperCase()}</p>
      </div>
    </CatalogPage>
  );
}
