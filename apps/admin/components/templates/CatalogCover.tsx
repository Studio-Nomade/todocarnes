import Image from "next/image";
import { catalogPeriod } from "@/lib/catalogs/format";
import { printImageUrl, type PrintImageConfig } from "@/lib/pdf/print-image";
import { CatalogPage } from "./CatalogPage";

type CatalogCoverProps = {
  title: string;
  month: number;
  year: number;
  scale?: number;
  print?: PrintImageConfig;
};

export function CatalogCover({ title, month, year, scale, print }: CatalogCoverProps) {
  return (
    <CatalogPage id="portada" scale={scale}>
      {print ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" className="absolute inset-0 h-full w-full object-cover" src={printImageUrl("/brand/cover-bg.webp", print, 1440)} />
      ) : (
        <Image
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          height={941}
          priority
          src="/brand/cover-bg.webp"
          width={1672}
        />
      )}

      <div className="absolute left-[120px] top-[150px] flex items-center gap-6">
        <Image alt="Todo Carnes" height={4500} priority sizes="96px" src="/brand/isologo_blanco.png" width={4501} className="h-24 w-24 object-contain" />
        <span className="text-4xl font-bold italic tracking-tight text-white">TodoCarnes</span>
      </div>

      <div className="absolute bottom-[190px] left-[120px] right-[120px]">
        <p className="text-[22px] font-medium uppercase tracking-[0.4em] text-blue">Catálogo comercial</p>
        <h1 className="mt-6 max-w-[900px] text-[92px] font-bold leading-[0.98] text-white">{title}</h1>
        <p className="mt-8 text-[34px] font-light uppercase tracking-[0.3em] text-blue-mid">{catalogPeriod(month, year)}</p>
      </div>

      <div className="absolute bottom-[70px] left-[120px] right-[120px] flex items-center justify-between border-t border-white/15 pt-6 text-[16px] font-light tracking-[0.2em] text-white/60">
        <span>TODO CARNES · DISTRIBUCIÓN DE CARNES CONGELADAS</span>
        <span>{catalogPeriod(month, year).toUpperCase()}</span>
      </div>
    </CatalogPage>
  );
}
